import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import { DonationIntentDto } from './dto/donation-intent.dto';

@ApiTags('Donaciones')
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get('config')
  @ApiOperation({
    summary: 'Consultar configuración de donaciones, canales y niveles de apoyo',
    description: 'Devuelve información sobre PayPal, Ko-fi, Criptomonedas y metas de financiamiento.',
  })
  @ApiResponse({ status: 200, description: 'Configuración obtenida exitosamente.' })
  getConfig() {
    return this.donationsService.getConfig();
  }

  @Post('intent')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar intención de donación',
    description: 'Registra un intento de donación en la base de datos y retorna la pasarela seleccionada.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Intención registrada.' })
  registerIntent(@Body() dto: DonationIntentDto) {
    return this.donationsService.registerIntent(dto);
  }
}
