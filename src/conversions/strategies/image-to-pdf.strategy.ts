import { Injectable, Logger } from '@nestjs/common';
import { IConverterStrategy, ConversionInput } from './converter.strategy.interface';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { CONVERSION_CONFIG } from '../../common/config/conversion.config';
import { ConversionFailedException } from '../../common/exceptions/conversion.exception';

@Injectable()
export class ImageToPdfStrategy implements IConverterStrategy {
  readonly name = 'ImageToPdfStrategy';
  private readonly logger = new Logger(ImageToPdfStrategy.name);

  private readonly supportedImageExtensions = new Set([
    'png',
    'jpg',
    'jpeg',
    'webp',
    'bmp',
    'tiff',
    'tif',
    'gif',
    'svg',
    'avif',
  ]);

  supports(category: string, ext: string): boolean {
    return category === 'image' || this.supportedImageExtensions.has(ext.toLowerCase());
  }

  async convert(input: ConversionInput): Promise<Buffer> {
    try {
      // 1. Process image with Sharp:
      // - limitInputPixels protects against decompression bombs (DoS)
      // - .rotate() auto-rotates based on mobile EXIF data (crucial for photos taken on mobile phones)
      // - convert to PNG buffer for pdf-lib embedding
      const pngBuffer = await sharp(input.buffer, {
        limitInputPixels: CONVERSION_CONFIG.maxImagePixels,
      })
        .rotate()
        .png()
        .toBuffer();

      // 2. Build PDF Document with matching dimensions
      const pdfDoc = await PDFDocument.create();
      const embeddedImage = await pdfDoc.embedPng(pngBuffer);

      const { width, height } = embeddedImage;
      const page = pdfDoc.addPage([width, height]);

      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width,
        height,
      });

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      this.logger.error(`Error al procesar la imagen a PDF (${input.originalName}):`, error);
      throw new ConversionFailedException(
        'No se pudo procesar la imagen para generar el PDF. Asegúrate de que la imagen no esté corrupta.',
        error,
      );
    }
  }
}
