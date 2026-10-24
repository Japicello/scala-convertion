import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { KardexValuationMethod } from '../../database/entities/kardex-record.entity';

export class KardexMovementDto {
  @ApiProperty({ example: '02/01/2026' })
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ example: 'F001-8842' })
  @IsString()
  @IsNotEmpty()
  documento: string;

  @ApiProperty({ example: 'ENTRADA', enum: ['ENTRADA', 'SALIDA', 'INICIAL'] })
  @IsString()
  @IsNotEmpty()
  tipo: 'ENTRADA' | 'SALIDA' | 'INICIAL';

  @ApiProperty({ example: 150 })
  @IsNumber()
  cantidad: number;

  @ApiProperty({ example: 98.0 })
  @IsNumber()
  costoUnitario: number;

  @ApiPropertyOptional({ example: 'Compra local autorizada' })
  @IsOptional()
  @IsString()
  observacion?: string;
}

export class CalcularKardexInventoryDto {
  @ApiProperty({ example: 'Corporación Scala S.A.C.' })
  @IsString()
  @IsNotEmpty()
  empresa: string;

  @ApiProperty({ example: '20608849121' })
  @IsString()
  @IsNotEmpty()
  ruc: string;

  @ApiProperty({ example: 'Q1 - 2026' })
  @IsString()
  @IsNotEmpty()
  periodo: string;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsString()
  @IsNotEmpty()
  moneda: string;

  @ApiProperty({
    enum: KardexValuationMethod,
    example: KardexValuationMethod.PROMEDIO,
  })
  @IsEnum(KardexValuationMethod)
  metodoValuacion: KardexValuationMethod;

  @ApiProperty({ example: 'PROD-SKU-9921' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Válvula de Presión 2" Hidráulica' })
  @IsString()
  @IsNotEmpty()
  descripcionItem: string;

  @ApiProperty({ type: [KardexMovementDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KardexMovementDto)
  movimientos: KardexMovementDto[];
}
