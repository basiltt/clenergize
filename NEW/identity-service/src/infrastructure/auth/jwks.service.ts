import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwksRsa from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  email?: string;
  roles?: string[];
  organizationId?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}

export interface JwksConfig {
  jwksUri?: string;
  issuer?: string;
  audience?: string | string[];
  algorithms?: string[];
  useLocalKeys?: boolean;
  privateKey?: string;
  publicKey?: string;
}

/**
 * Service for JWT verification using JWKS (JSON Web Key Set)
 * Supports both RSA256 asymmetric verification and local development keys
 * Implements caching and rate limiting for production JWKS endpoints
 */
@Injectable()
export class JwksService {
  private readonly logger = new Logger(JwksService.name);
  private jwksClient: jwksRsa.JwksClient | null = null;
  private readonly config: JwksConfig;

  constructor(private configService: ConfigService) {
    this.config = this.initializeConfig();
    this.initializeJwksClient();
  }

  /**
   * Initialize configuration from environment variables
   */
  private initializeConfig(): JwksConfig {
    const config: JwksConfig = {
      jwksUri: this.configService.get<string>('JWKS_URI'),
      issuer: this.configService.get<string>('JWT_ISSUER') || 'clenergize-identity',
      audience: this.configService.get<string>('JWT_AUDIENCE') || 'clenergize-api',
      algorithms: ['RS256'],
      useLocalKeys: this.configService.get<string>('NODE_ENV') === 'development' &&
                    !this.configService.get<string>('JWKS_URI'),
    };

    // For local development without JWKS endpoint
    if (config.useLocalKeys) {
      config.privateKey = this.configService.get<string>('JWT_PRIVATE_KEY');
      config.publicKey = this.configService.get<string>('JWT_PUBLIC_KEY');

      if (!config.privateKey || !config.publicKey) {
        this.logger.warn('Local development mode: Using RS256 with generated keys. Configure JWT_PRIVATE_KEY and JWT_PUBLIC_KEY for production.');
      }
    }

    return config;
  }

  /**
   * Initialize JWKS client for fetching public keys
   */
  private initializeJwksClient(): void {
    if (!this.config.jwksUri) {
      if (!this.config.useLocalKeys) {
        throw new Error('JWKS_URI must be configured for production environments');
      }
      this.logger.warn('No JWKS_URI configured, using local key verification');
      return;
    }

    this.jwksClient = jwksRsa({
      jwksUri: this.config.jwksUri,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 10,
      strictSsl: this.configService.get<string>('NODE_ENV') === 'production',
    });

    this.logger.log(`JWKS client initialized with URI: ${this.config.jwksUri}`);
  }

  /**
   * Verify and decode a JWT token using JWKS or local keys
   * @param token The JWT token to verify
   * @returns The decoded and verified JWT payload
   * @throws UnauthorizedException if verification fails
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      // Decode token header to get kid (key ID)
      const decoded = jwt.decode(token, { complete: true }) as any;

      if (!decoded || !decoded.header) {
        throw new UnauthorizedException('Invalid token format');
      }

      // Get the signing key
      const signingKey = await this.getSigningKey(decoded.header.kid);

      // Verify the token
      const payload = jwt.verify(token, signingKey, {
        algorithms: this.config.algorithms as jwt.Algorithm[],
        issuer: this.config.issuer,
        audience: this.config.audience,
        clockTolerance: 5, // Allow 5 seconds clock skew
      }) as JwtPayload;

      // Additional validation
      this.validatePayload(payload);

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(`Invalid token: ${error.message}`);
      }

      this.logger.error('Token verification failed', error);
      throw new UnauthorizedException('Token verification failed');
    }
  }

  /**
   * Sign a JWT token (for local development and testing)
   * Only works when useLocalKeys is true
   */
  async signToken(payload: Partial<JwtPayload>, options?: jwt.SignOptions): Promise<string> {
    if (!this.config.useLocalKeys) {
      throw new Error('Token signing is only available in local development mode');
    }

    if (!this.config.privateKey) {
      throw new Error('JWT_PRIVATE_KEY must be configured for token signing');
    }

    const defaultOptions: jwt.SignOptions = {
      algorithm: 'RS256',
      issuer: this.config.issuer,
      audience: this.config.audience,
      expiresIn: '1h',
      keyid: 'local-dev-key',
    };

    return jwt.sign(payload as any, this.config.privateKey, {
      ...defaultOptions,
      ...options,
    });
  }

  /**
   * Get the signing key for verification
   * @param kid The key ID from the JWT header
   */
  private async getSigningKey(kid?: string): Promise<string> {
    // Use JWKS client if available
    if (this.jwksClient) {
      return new Promise((resolve, reject) => {
        this.jwksClient!.getSigningKey(kid, (err, key) => {
          if (err) {
            this.logger.error(`Failed to fetch signing key for kid: ${kid}`, err);
            reject(new UnauthorizedException('Unable to fetch signing key'));
            return;
          }

          const signingKey = key?.getPublicKey();
          if (!signingKey) {
            reject(new UnauthorizedException('No signing key found'));
            return;
          }

          resolve(signingKey);
        });
      });
    }

    // Use local public key for development
    if (this.config.useLocalKeys && this.config.publicKey) {
      return this.config.publicKey;
    }

    throw new UnauthorizedException('No signing key configuration available');
  }

  /**
   * Validate JWT payload for required fields and business rules
   */
  private validatePayload(payload: JwtPayload): void {
    // Check required fields
    if (!payload.sub) {
      throw new UnauthorizedException('Token missing subject (sub) claim');
    }

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new UnauthorizedException('Token has expired');
    }

    // Check not before
    if (payload.iat && payload.iat > Date.now() / 1000 + 5) {
      throw new UnauthorizedException('Token not yet valid');
    }

    // Validate issuer
    if (payload.iss && payload.iss !== this.config.issuer) {
      throw new UnauthorizedException(`Invalid issuer: ${payload.iss}`);
    }

    // Validate audience
    if (payload.aud) {
      const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      const expectedAudiences = Array.isArray(this.config.audience)
        ? this.config.audience
        : [this.config.audience].filter(Boolean);

      if (expectedAudiences.length > 0 && !audiences.some(aud => expectedAudiences.includes(aud))) {
        throw new UnauthorizedException('Invalid audience');
      }
    }
  }

  /**
   * Generate RSA key pair for local development
   * This is a utility method for initial setup
   */
  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const crypto = require('crypto');
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return { privateKey, publicKey };
  }

  /**
   * Get JWKS endpoint response for local development
   * This can be used to simulate a JWKS endpoint locally
   */
  getLocalJwks(): any {
    if (!this.config.useLocalKeys || !this.config.publicKey) {
      throw new Error('Local JWKS only available in development mode with configured keys');
    }

    const crypto = require('crypto');
    const publicKeyObject = crypto.createPublicKey(this.config.publicKey);
    const jwk = publicKeyObject.export({ format: 'jwk' });

    return {
      keys: [
        {
          ...jwk,
          kid: 'local-dev-key',
          use: 'sig',
          alg: 'RS256',
        },
      ],
    };
  }

  /**
   * Refresh token validation (separate from access token)
   * Refresh tokens may have different validation rules
   */
  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const payload = await this.verifyToken(token);

    // Additional refresh token specific validation
    if (!payload.sub || (payload as any).type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return payload;
  }
}