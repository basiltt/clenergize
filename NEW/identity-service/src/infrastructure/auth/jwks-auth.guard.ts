import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwksService } from './jwks.service';
import { CorrelationService } from '../../shared/correlation/correlation.service';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * JWT Guard that uses JWKS for token verification
 * Implements proper RS256 signature verification with public key fetching
 * Supports both production JWKS endpoints and local development
 */
@Injectable()
export class JwksAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwksAuthGuard.name);

  constructor(
    private jwksService: JwksService,
    private reflector: Reflector,
    private correlationService: CorrelationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const correlationId = this.correlationService.getCorrelationId();

    if (!token) {
      this.logger.warn(`No token provided for protected route`, { correlationId });
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify token using JWKS
      const payload = await this.jwksService.verifyToken(token);

      // Enrich request with user context
      request.user = {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles || [],
        organizationId: payload.organizationId,
        tokenIssuedAt: payload.iat,
        tokenExpiresAt: payload.exp,
      };

      // Log successful authentication
      this.logger.debug(`User ${payload.sub} authenticated successfully`, {
        correlationId,
        userId: payload.sub,
        email: payload.email,
      });

      return true;
    } catch (error) {
      // Log authentication failure
      this.logger.warn(`Authentication failed: ${error.message}`, {
        correlationId,
        error: error.message,
      });

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Extract Bearer token from Authorization header
   */
  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      this.logger.warn('Invalid authorization header format');
      return undefined;
    }

    return token;
  }
}

/**
 * Decorator to mark routes as public (no authentication required)
 */
export function Public() {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      // Method decorator
      Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor.value);
      return descriptor;
    } else {
      // Class decorator
      Reflect.defineMetadata(IS_PUBLIC_KEY, true, target);
      return target;
    }
  };
}

/**
 * Decorator to require specific roles
 */
export function RequireRoles(...roles: string[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('roles', roles, descriptor.value);
    return descriptor;
  };
}

/**
 * Guard to check for required roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}