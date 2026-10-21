import { Injectable, Logger } from '@nestjs/common';
import { IConverterStrategy, ConversionInput } from './converter.strategy.interface';
import { PDFDocument } from 'pdf-lib';
import { ConversionFailedException } from '../../common/exceptions/conversion.exception';

@Injectable()
export class PdfPassthroughStrategy implements IConverterStrategy {
  readonly name = 'PdfPassthroughStrategy';
  private readonly logger = new Logger(PdfPassthroughStrategy.name);

  supports(category: string, ext: string): boolean {
    return category === 'pdf' || ext.toLowerCase() === 'pdf';
  }

  async convert(input: ConversionInput): Promise<Buffer> {
    try {
      // Validate that the buffer is indeed a readable, valid PDF
      await PDFDocument.load(input.buffer, { ignoreEncryption: true });
      return input.buffer;
    } catch (error: unknown) {
      const errStr = error instanceof Error ? error.message : String(error);
      this.logger.error(`El archivo reportado como PDF está corrupto o protegido: ${errStr}`);
      throw new ConversionFailedException(
        'El archivo PDF proporcionado está dañado, corrupto o protegido con contraseña.',
      );
    }
  }
}
