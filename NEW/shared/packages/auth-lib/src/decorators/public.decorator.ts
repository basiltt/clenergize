import { SetMetadata } from '@nestjs/common';

/**
 * Public route decorator
 *
 * Marks a route as public (no authentication required).
 * Bypasses JwtAuthGuard.
 *
 * Usage:
 * ```typescript
 * @Controller('auth')
 * @UseGuards(JwtAuthGuard) // Protect all routes by default
 * export class AuthController {
 *   @Post('login')
 *   @Public() // This route is public
 *   login(@Body() credentials: LoginDto) {
 *     return this.authService.login(credentials);
 *   }
 *
 *   @Get('profile')
 *   // This route is protected (no @Public() decorator)
 *   getProfile(@CurrentUser() user: JwtPayload) {
 *     return user;
 *   }
 * }
 * ```
 */

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
