import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpStatus,
  StreamableFile,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiProduces,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConversionsService } from './conversions.service';
import { CONVERSION_CONFIG } from '../common/config/conversion.config';
import { FileSanitizer } from '../common/utils/file-sanitizer.util';
import type { UploadedFile as MulterFile } from '../common/types/file.types';

@ApiTags('Conversions')
@Controller(['converter', 'conversions'])
export class ConversionsController {
  constructor(private readonly conversionsService: ConversionsService) {}

  @Post('to-pdf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Convierte un archivo (imagen o documento) a formato PDF',
    description:
      'Acepta imágenes (PNG, JPEG, WebP, GIF, BMP, TIFF, SVG) o documentos ofimáticos (DOCX, XLSX, PPTX, TXT, RTF, etc.) y retorna un PDF generado con sanitización y cabeceras RFC 5987.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/pdf')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Archivo binario a convertir (imágenes, documentos Word/Excel/PowerPoint o texto plano). Límite de 25 MB.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Archivo convertido exitosamente a PDF en stream binario.',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El archivo está vacío, no tiene extensión o su firma binaria (magic bytes) no coincide.',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Supera el límite de tamaño permitido o falló el procesamiento del motor de conversión.',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Límite de peticiones excedido (Rate Limit: 20 peticiones / minuto).',
  })
  @UseInterceptors(FileInterceptor('file'))
  async convertToPdf(
    @UploadedFile(
      new ParseFilePipe({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({
            maxSize: CONVERSION_CONFIG.maxFileSize,
            message: (maxSize) =>
              `El archivo supera el límite permitido de ${Math.round(maxSize / (1024 * 1024))} MB.`,
          }),
        ],
      }),
    )
    file: MulterFile,
  ): Promise<StreamableFile> {
    const result = await this.conversionsService.convertToPdf(file);

    return new StreamableFile(result.buffer, {
      type: 'application/pdf',
      disposition: FileSanitizer.getSafeContentDisposition(result.filename),
      length: result.buffer.length,
    });
  }
}
