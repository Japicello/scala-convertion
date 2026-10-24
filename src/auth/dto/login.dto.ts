import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'carlos.mendez@scala.corp', description: 'Correo electrónico corporativo' })
  @IsEmail({}, { message: 'El correo debe ser una dirección válida' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @ApiProperty({ example: 'ScalaSecure2026!', description: 'Contraseña' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
