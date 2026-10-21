import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { HealthStatus } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Información general de la API' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado básico del servicio.',
    schema: {
      example: {
        status: 'ok',
        name: 'file-converter-api',
        version: '1.0.0',
        timestamp: '2026-10-20T23:50:00.000Z',
      },
    },
  })
  getRoot(): HealthStatus {
    return this.appService.getHealth();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check para monitoreo y balanceador de carga' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'El servicio está activo y saludable.',
  })
  getHealth(): HealthStatus {
    return this.appService.getHealth();
  }
}
