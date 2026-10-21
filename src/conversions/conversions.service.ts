import { Injectable, Inject, Logger } from '@nestjs/common';
import * as path from 'path';
import {
  CONVERTER_STRATEGIES,
} from '../common/config/conversion.config';
import { IConverterStrategy, ConversionInput } from './strategies/converter.strategy.interface';
import { FileSignatureValidator } from '../common/utils/file-signature.validator';
import { FileSanitizer } from '../common/utils/file-sanitizer.util';
import {
  InvalidFileFormatException,
  ConversionFailedException,
} from '../common/exceptions/conversion.exception';
import type { UploadedFile as MulterFile } from '../common/types/file.types';

export interface ConvertedResult {
  buffer: Buffer;
  filename: string;
}

@Injectable()
export class ConversionsService {
  private readonly logger = new Logger(ConversionsService.name);

  constructor(
    @Inject(CONVERTER_STRATEGIES)
    private readonly strategies: IConverterStrategy[],
  ) {}

  /**
   * Orchestrates the validation, selection of conversion strategy, and execution
   */
  async convertToPdf(file: MulterFile): Promise<ConvertedResult> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new InvalidFileFormatException('El archivo proporcionado está vacío o no es válido.');
    }

    const rawExt = path.extname(file.originalname || '');
    const ext = rawExt.toLowerCase().replace(/^\./, '').trim();

    if (!ext) {
      throw new InvalidFileFormatException(
        'El archivo debe tener una extensión válida (ej. .docx, .png, .jpg).',
      );
    }

    // 1. Security Check: Magic Bytes Verification to prevent MIME-spoofing
    const signature = FileSignatureValidator.inspect(file.buffer, ext);
    if (!signature.isAllowed) {
      this.logger.warn(
        `Firma de archivo rechazada para ${file.originalname}. Extensión reportada: ${ext}, Categoría detectada: ${signature.category}`,
      );
      throw new InvalidFileFormatException(
        `El formato del archivo no es admitido o no coincide con su extensión declarada (.${ext}).`,
      );
    }

    // 2. Select appropriate strategy (OCP / Strategy Pattern)
    const strategy = this.strategies.find((s) => s.supports(signature.category, ext));
    if (!strategy) {
      this.logger.warn(
        `No se encontró una estrategia de conversión para categoría: ${signature.category}, extensión: ${ext}`,
      );
      throw new InvalidFileFormatException(
        `No existe un motor de conversión disponible para el tipo de archivo .${ext}`,
      );
    }

    this.logger.log(
      `Procesando archivo "${file.originalname}" (${file.buffer.length} bytes) con la estrategia: ${strategy.name}`,
    );

    // 3. Prepare conversion input
    const input: ConversionInput = {
      buffer: file.buffer,
      extension: ext,
      originalName: file.originalname,
      mimeType: file.mimetype,
    };

    // 4. Execute conversion
    const pdfBuffer = await strategy.convert(input);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new ConversionFailedException('El archivo PDF generado está vacío.');
    }

    // 5. Generate safe, sanitized output filename for HTTP response
    const safeFilename = FileSanitizer.sanitizeOutputPdfName(file.originalname);

    return {
      buffer: pdfBuffer,
      filename: safeFilename,
    };
  }
}
