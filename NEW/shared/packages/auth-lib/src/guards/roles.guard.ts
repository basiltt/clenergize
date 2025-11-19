import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../utils/jwt.service';

/**
 * Roles Guard
 *
 * Checks if user has required role(s) to access a route.
 * Must be used AFTER JwtAuthGuard.
 *
 * Usage:
 * ```typescript
 * @Get('admin-only')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN')
 * getAdminData() {
 *   return { message: 'Admin-only data' };
 * }
 *
 * @Post('create-project')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN', 'PROJECT_MANAGER') // User needs ANY of these roles
 * createProject() {
 *   return { message: 'Project created' };
 * }
 * ```
 */

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request (set by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has required role
    const userRole = user.role;

    if (!userRole) {
      throw new ForbiddenException('User has no role assigned');
    }

    // User needs to have at least ONE of the required roles
    const hasRole = requiredRoles.includes(userRole);

    if (!hasRole) {
      // Log authorization failure for security monitoring
      console.warn('Authorization failed', {
        userId: user.sub,
        userRole,
        requiredRoles,
        path: request.url
      });

      throw new ForbiddenException(`Required role: ${requiredRoles.join(' or ')}`);
    }

    return true;
  }
}
