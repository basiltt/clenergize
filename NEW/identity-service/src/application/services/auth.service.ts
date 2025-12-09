import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { PasswordService } from '@clenergize/auth-lib';
import {
  RegisterDto,
  LoginDto,
  LoginResponseDto,
  UserDto,
  ChangePasswordDto,
} from '../dtos/auth.dto';
import {
  AuthenticationError,
  ValidationError,
  ConflictError,
  BusinessLogicError,
} from '@clenergize/common';
import { User } from '../../domain/entities/user.entity';
import { EventBridgeEventBus } from '@clenergize/event-lib';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: NestJwtService,
    private readonly eventBus: EventBridgeEventBus
  ) {}

  async register(registerDto: RegisterDto): Promise<UserDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictError(
        'User with this email already exists',
        'IDENTITY_REG_001'
      );
    }

    // Validate password complexity
    const passwordValidation = this.passwordService.validatePasswordComplexity(
      registerDto.password
    );
    if (!passwordValidation.isValid) {
      throw new ValidationError(
        `Password does not meet requirements: ${passwordValidation.errors.join(', ')}`,
        'IDENTITY_REG_002',
        { errors: passwordValidation.errors }
      );
    }

    // Hash password
    const passwordHash = await this.passwordService.hashPassword(registerDto.password);

    // Create user
    const user = await this.userRepository.create({
      email: registerDto.email.toLowerCase(),
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      passwordHash,
      roles: ['USER'],
      status: 'PENDING',
      organizationId: registerDto.organizationId,
      emailVerified: false,
    });

    // Publish UserCreated event
    await this.publishUserCreatedEvent(user);

    return this.mapUserToDto(user);
  }

  async login(loginDto: LoginDto, ipAddress: string): Promise<LoginResponseDto> {
    // Find user with password
    const user = await this.userRepository.findByEmailWithPassword(loginDto.email);

    if (!user) {
      throw new AuthenticationError(
        'Invalid email or password',
        'IDENTITY_AUTH_001'
      );
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new AuthenticationError(
        'Account is temporarily locked due to multiple failed login attempts',
        'IDENTITY_AUTH_002',
        { lockedUntil: user.lockedUntil }
      );
    }

    // Check if account is suspended
    if (user.status === 'SUSPENDED') {
      throw new AuthenticationError(
        'Account is suspended',
        'IDENTITY_AUTH_003'
      );
    }

    // Check if account is deleted
    if (user.status === 'DELETED') {
      throw new AuthenticationError(
        'Account not found',
        'IDENTITY_AUTH_001'
      );
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verifyPassword(
      loginDto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      // Record failed login attempt
      await this.userRepository.recordLoginAttempt(user.id, false, ipAddress);

      throw new AuthenticationError(
        'Invalid email or password',
        'IDENTITY_AUTH_001'
      );
    }

    // Record successful login
    await this.userRepository.recordLoginAttempt(user.id, true, ipAddress);

    // Generate tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    // Publish UserAuthenticated event
    await this.publishUserAuthenticatedEvent(user, ipAddress);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600, // 1 hour
      user: this.mapUserToDto(user),
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    // Find user with password
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found', 'IDENTITY_AUTH_001');
    }

    // Get user with password hash
    const userWithPassword = await this.userRepository.findByEmailWithPassword(user.email);
    if (!userWithPassword) {
      throw new AuthenticationError('User not found', 'IDENTITY_AUTH_001');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordService.verifyPassword(
      changePasswordDto.currentPassword,
      userWithPassword.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new AuthenticationError(
        'Current password is incorrect',
        'IDENTITY_PWD_001'
      );
    }

    // Check if new password is same as current
    const isSameAsCurrentPassword = await this.passwordService.verifyPassword(
      changePasswordDto.newPassword,
      userWithPassword.passwordHash
    );

    if (isSameAsCurrentPassword) {
      throw new BusinessLogicError(
        'New password must be different from current password',
        'IDENTITY_PWD_002'
      );
    }

    // Check if new password was used recently (check password history)
    for (const oldPasswordHash of userWithPassword.passwordHistory || []) {
      const isInHistory = await this.passwordService.verifyPassword(
        changePasswordDto.newPassword,
        oldPasswordHash
      );
      if (isInHistory) {
        throw new BusinessLogicError(
          'New password was used recently. Please choose a different password.',
          'IDENTITY_PWD_003'
        );
      }
    }

    // Validate new password complexity
    const passwordValidation = this.passwordService.validatePasswordComplexity(
      changePasswordDto.newPassword
    );
    if (!passwordValidation.isValid) {
      throw new ValidationError(
        `Password does not meet requirements: ${passwordValidation.errors.join(', ')}`,
        'IDENTITY_PWD_004',
        { errors: passwordValidation.errors }
      );
    }

    // Hash new password
    const newPasswordHash = await this.passwordService.hashPassword(
      changePasswordDto.newPassword
    );

    // Update password
    await this.userRepository.updatePassword(userId, newPasswordHash);
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findById(payload.sub);

      if (!user || user.status !== 'ACTIVE') {
        throw new AuthenticationError('Invalid token', 'IDENTITY_AUTH_004');
      }

      return user;
    } catch (error) {
      throw new AuthenticationError('Invalid token', 'IDENTITY_AUTH_004');
    }
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      organizationId: user.organizationId,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  }

  private mapUserToDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      roles: user.roles,
      status: user.status,
      organizationId: user.organizationId,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  private async publishUserCreatedEvent(user: User): Promise<void> {
    // TODO: Implement event publishing when EventBus is configured
    // const event = new UserCreatedEvent({...});
    // await this.eventBus.publish(event);
  }

  private async publishUserAuthenticatedEvent(user: User, ipAddress: string): Promise<void> {
    // TODO: Implement event publishing when EventBus is configured
    // const event = new UserAuthenticatedEvent({...});
    // await this.eventBus.publish(event);
  }
}
