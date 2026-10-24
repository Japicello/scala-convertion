import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'carlos.mendez@scala.corp', description: 'Correo electrónico corporativo' })
  @IsEmail({}, { message: 'El correo debe ser una dirección válida' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @ApiProperty({ example: 'ScalaSecure2026!', minLength: 6, description: 'Contraseña segura' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'Ing. Carlos Méndez', description: 'Nombre completo' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  fullName: string;

  @ApiPropertyOptional({ example: 'Supervisión Técnica', description: 'Departamento u área' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 'Corporación Scala S.A.C.', description: 'Empresa o institución' })
  @IsOptional()
  @IsString()
  company?: string;
}
