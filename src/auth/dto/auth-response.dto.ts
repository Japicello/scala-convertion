import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'carlos.mendez@scala.corp' })
  email: string;

  @ApiProperty({ example: 'Ing. Carlos Méndez' })
  fullName: string;

  @ApiProperty({ example: 'OPERATOR' })
  role: string;

  @ApiProperty({ example: 'Supervisión Técnica · Planta Industrial Norte' })
  department?: string;

  @ApiProperty({ example: 'Corporación Scala S.A.C.' })
  company?: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Token de acceso JWT Bearer' })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: 86400, description: 'Expiración en segundos (24 horas)' })
  expiresIn: number;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}
