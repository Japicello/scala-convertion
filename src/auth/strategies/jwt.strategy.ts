import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../database/entities/user.entity';

export const JWT_SECRET = process.env.JWT_SECRET || 'scala-docs-enterprise-super-secure-key-2026';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      company: user.company,
    };
  }
}
