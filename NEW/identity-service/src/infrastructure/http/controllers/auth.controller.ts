import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Ip,
  Get,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../../../application/services/auth.service';
import {
  RegisterDto,
  LoginDto,
  LoginResponseDto,
  UserDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from '../../../application/dtos/auth.dto';
import { Public } from '../../auth/jwks-auth.guard';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async register(@Body() registerDto: RegisterDto): Promise<UserDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or account locked',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginDto, ipAddress);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: UserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCurrentUser(@Request() req: any): Promise<UserDto> {
    // User is already attached to request by LocalJwtGuard
    return req.user;
  }

  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 204,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or current password incorrect',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid new password',
  })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    await this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Ip() ipAddress: string
  ): Promise<LoginResponseDto> {
    // TODO: Implement refresh token logic
    throw new Error('Not implemented yet');
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 204,
    description: 'Logout successful',
  })
  async logout(@Request() req: any): Promise<void> {
    // TODO: Implement logout logic (invalidate refresh token)
    // For now, logout is handled client-side by discarding tokens
  }
}
