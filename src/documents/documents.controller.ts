import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('Documentos e Historial')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('recent')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener actividad reciente de documentos procesados',
    description:
      'Retorna el historial de documentos convertidos, escaneados y Kardex procesados con metadatos y hash SHA-256.',
  })
  @ApiResponse({ status: 200, description: 'Historial obtenido exitosamente.' })
  getRecent(@Request() req: any) {
    return this.documentsService.getRecentDocuments(req.user?.id);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Obtener métricas y estado del motor en tiempo real',
    description:
      'Retorna latencia promedio, documentos procesados hoy, precisión OCR y cuota de almacenamiento.',
  })
  @ApiResponse({ status: 200, description: 'Métricas obtenidas con éxito.' })
  getStats() {
    return this.documentsService.getEngineStats();
  }
}
