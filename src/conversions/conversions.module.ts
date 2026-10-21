import { Module } from '@nestjs/common';
import { ConversionsController } from './conversions.controller';
import { ConversionsService } from './conversions.service';
import { ImageToPdfStrategy } from './strategies/image-to-pdf.strategy';
import { DocumentToPdfStrategy } from './strategies/document-to-pdf.strategy';
import { PdfPassthroughStrategy } from './strategies/pdf-passthrough.strategy';
import { CONVERTER_STRATEGIES } from '../common/config/conversion.config';

@Module({
  controllers: [ConversionsController],
  providers: [
    ConversionsService,
    ImageToPdfStrategy,
    DocumentToPdfStrategy,
    PdfPassthroughStrategy,
    {
      provide: CONVERTER_STRATEGIES,
      useFactory: (
        imageStrategy: ImageToPdfStrategy,
        docStrategy: DocumentToPdfStrategy,
        pdfStrategy: PdfPassthroughStrategy,
      ) => [pdfStrategy, imageStrategy, docStrategy],
      inject: [ImageToPdfStrategy, DocumentToPdfStrategy, PdfPassthroughStrategy],
    },
  ],
  exports: [ConversionsService],
})
export class ConversionsModule {}
