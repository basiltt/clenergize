/**
 * @clenergize/auth-lib
 *
 * Authentication and authorization library for Clenergize microservices.
 * Provides secure JWT verification with JWKS, NestJS guards, and decorators.
 *
 * @packageDocumentation
 */

// Utilities
export * from './utils';

// Guards
export * from './guards';

// Decorators
export * from './decorators';

// Strategies
export * from './strategies';

// Re-export for convenience
export { JwtService, createJwtService, JwtConfig, JwtPayload } from './utils/jwt.service';
export { PasswordService, createPasswordService, PasswordConfig } from './utils/password.service';
export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { RolesGuard } from './guards/roles.guard';
export { CurrentUser } from './decorators/current-user.decorator';
export { Public } from './decorators/public.decorator';
export { Roles } from './decorators/roles.decorator';
export { JwtStrategy } from './strategies/jwt.strategy';
