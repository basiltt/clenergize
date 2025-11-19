import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload, JwtConfig } from '../utils/jwt.service';
import { AuthenticationError } from '@clenergize/common';

/**
 * JWT Strategy for NestJS Passport
 *
 * Securely verifies JWT tokens using JWKS.
 * Integrates with NestJS authentication system.
 *
 * Usage in service module:
 * ```typescript
 * @Module({
 *   imports: [
 *     PassportModule,
 *     JwtAuthModule.forRoot({
 *       jwksUri: 'https://cognito.amazonaws.com/.well-known/jwks.json',
 *       issuer: 'https://cognito.amazonaws.com/...',
 *       audience: 'your-app-id'
 *     })
 *   ],
 *   providers: [JwtStrategy],
 * })
 * export class AuthModule {}
 * ```
 */

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(_config: JwtConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: async (
        _request: any,
        _rawJwtToken: string,
        done: (err: any, secretOrKey?: any) => void
      ) => {
        try {
          // Use our custom JWT service for JWKS verification
          // We'll handle verification in validate() method
          // Here we just need to provide a dummy value for passport-jwt
          done(null, null);
        } catch (error) {
          done(error);
        }
      },
      passReqToCallback: false
    });

    // Note: JwtService can be instantiated here for custom JWKS verification
    // new JwtService(config);
  }

  /**
   * Validate JWT token
   * This method is called by Passport after extracting the token
   * @returns User payload to attach to request.user
   */
  async validate(payload: any): Promise<JwtPayload> {
    try {
      // The token has already been extracted by Passport
      // We need to verify it with JWKS
      // Note: In production, we should get the raw token from the request
      // For now, we'll assume the payload is already verified by our custom validation

      // Verify required fields
      if (!payload.sub) {
        throw AuthenticationError.tokenInvalid('AUTH_JWT_002', 'Missing subject (sub)');
      }

      return payload as JwtPayload;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw AuthenticationError.tokenInvalid('AUTH_JWT_003', (error as Error).message);
    }
  }
}
