import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException('Ya existe un usuario registrado con este correo electrónico');
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(dto.password, salt);

      const user = this.userRepository.create({
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        fullName: dto.fullName.trim(),
        department: dto.department?.trim() || 'Supervisión Técnica',
        company: dto.company?.trim() || 'Corporación Scala S.A.C.',
      });

      const savedUser = await this.userRepository.save(user);

      return this.generateTokenResponse(savedUser);
    } catch (err: any) {
      this.logger.error(`Error al registrar usuario: ${err.message}`, err.stack);
      throw new InternalServerErrorException('No se pudo completar el registro');
    }
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra inactiva');
    }

    return this.generateTokenResponse(user);
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      company: user.company,
      createdAt: user.createdAt,
    };
  }

  private generateTokenResponse(user: UserEntity): AuthResponseDto {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 86400, // 24 hours
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        company: user.company,
      },
    };
  }
}
