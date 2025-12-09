import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator
 *
 * Specifies which role(s) are required to access a route.
 * Must be used with RolesGuard.
 *
 * Usage:
 * ```typescript
 * @Get('admin-dashboard')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN')
 * getAdminDashboard() {
 *   return { message: 'Admin dashboard data' };
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

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
