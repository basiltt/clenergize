import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { AuthenticationError } from '@clenergize/common';

/**
 * JWT Service
 *
 * Provides secure JWT token verification using JWKS (JSON Web Key Set).
 * Fixes the CRITICAL vulnerability in OLD codebase where tokens were decoded without verification.
 *
 * ❌ OLD (VULNERABLE):
 * ```typescript
 * const decoded = jwt.decode(token); // NO SIGNATURE VERIFICATION!
 * ```
 *
 * ✅ NEW (SECURE):
 * ```typescript
 * const decoded = await jwtService.verifyToken(token); // JWKS verification
 * ```
 */

export interface JwtConfig {
  jwksUri: string;
  issuer: string;
  audience: string;
  algorithms?: jwt.Algorithm[];
  cacheEnabled?: boolean;
  rateLimit?: boolean;
}

export interface JwtPayload {
  sub: string;           // Subject (user ID)
  email?: string;        // User email
  role?: string;         // User role
  permissions?: string[]; // User permissions
  iat: number;          // Issued at
  exp: number;          // Expiration time
  iss: string;          // Issuer
  aud: string;          // Audience
  [key: string]: any;   // Additional claims
}

export class JwtService {
  private jwksClient: jwksRsa.JwksClient;
  private config: Required<JwtConfig>;

  constructor(config: JwtConfig) {
    this.config = {
      algorithms: config.algorithms || ['RS256'],
      cacheEnabled: config.cacheEnabled ?? true,
      rateLimit: config.rateLimit ?? true,
      ...config
    };

    this.jwksClient = jwksRsa({
      jwksUri: this.config.jwksUri,
      cache: this.config.cacheEnabled,
      rateLimit: this.config.rateLimit,
      jwksRequestsPerMinute: 10,
      cacheMaxAge: 600000 // 10 minutes
    });
  }

  /**
   * Verify JWT token with JWKS
   * @throws AuthenticationError if token is invalid
   */
  async verifyToken(token: string, errorCode: string = 'AUTH_JWT_001'): Promise<JwtPayload> {
    try {
      // Step 1: Decode token header to get 'kid' (key ID)
      const decoded = jwt.decode(token, { complete: true });

      if (!decoded || !decoded.header.kid) {
        throw AuthenticationError.tokenInvalid(
          errorCode,
          'Token missing kid (key ID) in header'
        );
      }

      // Step 2: Get signing key from JWKS using kid
      const key = await this.getSigningKey(decoded.header.kid);

      // Step 3: Verify token signature with public key
      const verified = jwt.verify(token, key, {
        algorithms: this.config.algorithms,
        issuer: this.config.issuer,
        audience: this.config.audience,
        complete: false
      }) as JwtPayload;

      // Step 4: Additional validation
      this.validatePayload(verified, errorCode);

      return verified;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw AuthenticationError.tokenExpired(errorCode, error.expiredAt.toISOString());
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw AuthenticationError.tokenInvalid(errorCode, error.message);
      }

      throw AuthenticationError.tokenInvalid(
        errorCode,
        `Token verification failed: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get signing key from JWKS
   */
  private async getSigningKey(kid: string): Promise<string> {
    try {
      const key = await this.jwksClient.getSigningKey(kid);
      return key.getPublicKey();
    } catch (error) {
      throw new Error(`Failed to get signing key: ${(error as Error).message}`);
    }
  }

  /**
   * Validate JWT payload
   */
  private validatePayload(payload: JwtPayload, errorCode: string): void {
    // Check required fields
    if (!payload.sub) {
      throw AuthenticationError.tokenInvalid(errorCode, 'Token missing sub (subject)');
    }

    if (!payload.iat) {
      throw AuthenticationError.tokenInvalid(errorCode, 'Token missing iat (issued at)');
    }

    if (!payload.exp) {
      throw AuthenticationError.tokenInvalid(errorCode, 'Token missing exp (expiration)');
    }

    // Check if token is not yet valid (iat in future)
    const now = Math.floor(Date.now() / 1000);
    if (payload.iat > now + 60) { // Allow 60s clock skew
      throw AuthenticationError.tokenInvalid(errorCode, 'Token not yet valid (iat in future)');
    }
  }

  /**
   * Decode token WITHOUT verification (use only for debugging)
   * ⚠️ WARNING: This does NOT verify the signature. NEVER use for authentication.
   */
  decodeTokenUnsafe(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }

  /**
   * Check if token is expired (without verification)
   * Useful for refresh token logic
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeTokenUnsafe(token);

    if (!decoded || !decoded.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  /**
   * Get time until token expires (in seconds)
   */
  getTimeUntilExpiry(token: string): number | null {
    const decoded = this.decodeTokenUnsafe(token);

    if (!decoded || !decoded.exp) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - now);
  }
}

/**
 * Factory function to create JWT service
 */
export function createJwtService(config: JwtConfig): JwtService {
  return new JwtService(config);
}
