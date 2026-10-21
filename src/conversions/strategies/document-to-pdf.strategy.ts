import { Injectable, Logger } from '@nestjs/common';
import { IConverterStrategy, ConversionInput } from './converter.strategy.interface';
import * as libre from 'libreoffice-convert';
import { promisify } from 'util';
import { CONVERSION_CONFIG } from '../../common/config/conversion.config';
import { ConversionFailedException } from '../../common/exceptions/conversion.exception';

const convertAsync = promisify(libre.convert);

@Injectable()
export class DocumentToPdfStrategy implements IConverterStrategy {
  readonly name = 'DocumentToPdfStrategy';
  private readonly logger = new Logger(DocumentToPdfStrategy.name);

  private readonly supportedDocumentExtensions = new Set([
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'odt',
    'ods',
    'odp',
    'rtf',
    'txt',
    'html',
    'htm',
    'csv',
    'xml',
  ]);

  supports(category: string, ext: string): boolean {
    return category === 'document' || this.supportedDocumentExtensions.has(ext.toLowerCase());
  }

  async convert(input: ConversionInput): Promise<Buffer> {
    const ext = input.extension.toLowerCase();

    const conversionPromise = convertAsync(input.buffer, '.pdf', undefined);

    let timeoutHandle: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(
          new Error(
            `Tiempo límite de conversión excedido (${CONVERSION_CONFIG.conversionTimeoutMs}ms). El documento es demasiado complejo o el servicio está ocupado.`,
          ),
        );
      }, CONVERSION_CONFIG.conversionTimeoutMs);
    });

    try {
      const convertedBuffer = await Promise.race([
        conversionPromise,
        timeoutPromise,
      ]);

      return convertedBuffer;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error al convertir documento .${ext} a PDF (${input.originalName}): ${errorMessage}`,
      );

      // Detect if LibreOffice / soffice binary is missing in system
      if (
        errorMessage.includes('soffice') ||
        errorMessage.includes('ENOENT') ||
        errorMessage.includes('spawn')
      ) {
        this.logger.error(
          'CRÍTICO: No se encontró la instalación de LibreOffice (soffice) en el sistema. Asegúrate de tener LibreOffice instalado y en el PATH.',
        );
        throw new ConversionFailedException(
          'El motor de conversión de documentos no está disponible en el servidor.',
        );
      }

      throw new ConversionFailedException(
        `No se pudo convertir el documento a PDF: ${errorMessage}`,
      );
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  }
}
