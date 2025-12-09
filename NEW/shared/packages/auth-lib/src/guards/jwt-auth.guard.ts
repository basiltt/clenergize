import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT Authentication Guard
 *
 * Protects routes by requiring valid JWT token.
 * Respects @Public() decorator for public routes.
 *
 * Usage:
 * ```typescript
 * // Protect single route
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 *
 * // Protect entire controller
 * @Controller('users')
 * @UseGuards(JwtAuthGuard)
 * export class UsersController {
 *   // All routes protected except those marked with @Public()
 * }
 *
 * // Public route (no authentication)
 * @Post('login')
 * @Public()
 * login(@Body() credentials: LoginDto) {
 *   return this.authService.login(credentials);
 * }
 * ```
 */

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Check if route can be activated
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Call parent canActivate (passport-jwt validation)
    return super.canActivate(context);
  }

  /**
   * Handle authentication errors
   */
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    _status?: any
  ): TUser {
    // Log authentication failures for security monitoring
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const method = request.method;
      const url = request.url;
      const ip = request.ip;

      // TODO: Log to audit service
      console.warn('Authentication failed', {
        method,
        url,
        ip,
        error: err?.message || info?.message || 'Unauthorized'
      });

      throw err || new UnauthorizedException('Invalid or missing authentication token');
    }

    return user;
  }
}
