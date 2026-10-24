import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProduces,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { KardexInventoryService } from './kardex-inventory.service';
import { KardexInventoryPdfService } from './kardex-inventory-pdf.service';
import { CalcularKardexInventoryDto } from './dto/kardex-inventory.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { FileSanitizer } from '../common/utils/file-sanitizer.util';

@ApiTags('Kardex de Inventario & Formatos')
@Controller('kardex-inventory')
export class KardexInventoryController {
  constructor(
    private readonly inventoryService: KardexInventoryService,
    private readonly pdfService: KardexInventoryPdfService,
  ) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Calcular movimientos de Kardex Valorado (Promedio, PEPS, UEPS)',
    description:
      'Valúa los movimientos de inventario de entradas y salidas, calcula saldos y costos unitarios en tiempo real, genera el sello criptográfico SHA-256 y registra la auditoría.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cálculo ejecutado exitosamente.' })
  async calcular(
    @Body() dto: CalcularKardexInventoryDto,
    @Request() req: any,
  ) {
    const result = this.inventoryService.calcularKardex(dto);
    const userId = req.user?.id;
    await this.inventoryService.guardarKardexAudit(result, userId);
    return result;
  }

  @Post('pdf')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiProduces('application/pdf')
  @ApiOperation({
    summary: 'Generar y descargar documento PDF oficial de Kardex Valorado (SUNAT 13.1 / NIIF 2)',
    description:
      'Genera el PDF con membrete corporativo, tabla de valuación, totales y firma digital con sello hash SHA-256.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'PDF generado exitosamente.' })
  async generarPdf(
    @Body() dto: CalcularKardexInventoryDto,
    @Request() req: any,
  ): Promise<StreamableFile> {
    const calculation = this.inventoryService.calcularKardex(dto);
    const userId = req.user?.id;
    await this.inventoryService.guardarKardexAudit(calculation, userId);

    const { buffer, filename } = await this.pdfService.generarPdf(calculation);

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: FileSanitizer.getSafeContentDisposition(filename),
      length: buffer.length,
    });
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar registros históricos de Kardex',
    description: 'Devuelve los kardex generados recientemente por el usuario o en la sesión.',
  })
  async listar(@Request() req: any) {
    return this.inventoryService.listarKardex(req.user?.id);
  }
}
