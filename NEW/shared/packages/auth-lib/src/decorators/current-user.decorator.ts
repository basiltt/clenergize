import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../utils/jwt.service';

/**
 * Current User Decorator
 *
 * Extracts the authenticated user from the request.
 * User is set by JwtAuthGuard after successful authentication.
 *
 * Usage:
 * ```typescript
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return {
 *     id: user.sub,
 *     email: user.email,
 *     role: user.role
 *   };
 * }
 *
 * // Get specific property
 * @Get('my-id')
 * @UseGuards(JwtAuthGuard)
 * getMyId(@CurrentUser('sub') userId: string) {
 *   return { userId };
 * }
 * ```
 */

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // If specific property requested, return it
    if (data) {
      return user?.[data];
    }

    // Otherwise return entire user object
    return user;
  },
);
