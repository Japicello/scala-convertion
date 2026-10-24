import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DonationIntentDto {
  @ApiPropertyOptional({ example: 'Ing. Carlos Méndez' })
  @IsOptional()
  @IsString()
  supporterName?: string;

  @ApiProperty({ example: 5.0 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 'PAYPAL', enum: ['PAYPAL', 'KOFI', 'CRYPTO', 'MERCADOPAGO'] })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiPropertyOptional({ example: '¡Excelente app para Kardex y conversiones!' })
  @IsOptional()
  @IsString()
  note?: string;
}
