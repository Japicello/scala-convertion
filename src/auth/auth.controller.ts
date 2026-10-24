import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un nuevo usuario corporativo',
    description: 'Crea una nueva cuenta con contraseña cifrada (bcrypt) y retorna token JWT para acceso inmediato.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: AuthResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'El correo electrónico ya existe.' })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión corporativa',
    description: 'Autentica las credenciales del usuario y retorna un token JWT Bearer.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Credenciales inválidas.' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener el perfil del usuario autenticado',
    description: 'Retorna los datos del usuario actual verificado a través del token JWT.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Perfil de usuario obtenido con éxito.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autorizado o token expirado.' })
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }
}
