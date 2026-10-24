import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepo: any;
  let mockJwtService: any;

  beforeEach(() => {
    mockUserRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'user-uuid-1', ...d })),
    };
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };
    service = new AuthService(mockUserRepo, mockJwtService);
  });

  it('registers a new user successfully and returns token', async () => {
    mockUserRepo.findOne.mockResolvedValue(null);

    const res = await service.register({
      email: 'new@scala.corp',
      password: 'password123',
      fullName: 'Carlos Test',
    });

    expect(res.accessToken).toBe('mock-jwt-token');
    expect(res.user.email).toBe('new@scala.corp');
  });

  it('rejects registration if email already exists', async () => {
    mockUserRepo.findOne.mockResolvedValue({ id: 'exists' });

    await expect(
      service.register({
        email: 'exists@scala.corp',
        password: 'password123',
        fullName: 'Carlos Test',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('authenticates user with valid credentials', async () => {
    const hash = await bcrypt.hash('secret123', 10);
    mockUserRepo.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'carlos@scala.corp',
      passwordHash: hash,
      fullName: 'Carlos',
      role: 'OPERATOR',
      isActive: true,
    });

    const res = await service.login({
      email: 'carlos@scala.corp',
      password: 'secret123',
    });

    expect(res.accessToken).toBe('mock-jwt-token');
  });

  it('rejects invalid password', async () => {
    const hash = await bcrypt.hash('secret123', 10);
    mockUserRepo.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'carlos@scala.corp',
      passwordHash: hash,
      isActive: true,
    });

    await expect(
      service.login({
        email: 'carlos@scala.corp',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
