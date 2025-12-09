import { z } from 'zod';
import * as dotenv from 'dotenv';
import { InternalError } from '@clenergize/common';

/**
 * Configuration Service
 *
 * Loads and validates environment variables using Zod schemas.
 * Throws on startup if any required variable is missing or invalid.
 *
 * This prevents the application from running with invalid configuration,
 * catching configuration errors at startup instead of at runtime.
 *
 * Usage:
 * ```typescript
 * import { ConfigService, IdentityServiceConfigSchema } from '@clenergize/config-lib';
 *
 * const configService = new ConfigService(IdentityServiceConfigSchema);
 * const config = configService.get(); // Validated config
 * const port = configService.get('PORT'); // Type-safe access
 * ```
 */

export class ConfigService<T extends z.ZodType> {
  private config: z.infer<T>;
  private schema: T;

  constructor(schema: T, envPath?: string) {
    this.schema = schema;

    // Load .env file (optional in production)
    if (envPath) {
      const result = dotenv.config({ path: envPath });
      if (result.error) {
        console.warn(`Warning: Could not load .env file from ${envPath}`);
      }
    } else {
      dotenv.config();
    }

    // Validate configuration
    this.config = this.validateConfig();
  }

  /**
   * Validate environment variables against schema
   * @throws InternalError if validation fails
   */
  private validateConfig(): z.infer<T> {
    try {
      const parsed = this.schema.safeParse(process.env);

      if (!parsed.success) {
        const errors = parsed.error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        // Format error message
        const errorMessage = errors
          .map((err) => `  - ${err.path}: ${err.message}`)
          .join('\n');

        throw InternalError.configuration(
          'ENVIRONMENT_VALIDATION',
          `Environment validation failed:\n${errorMessage}`,
          'CONFIG_VALIDATION_001'
        );
      }

      return parsed.data;
    } catch (error) {
      if (error instanceof InternalError) {
        throw error;
      }

      throw InternalError.configuration(
        'ENVIRONMENT_VALIDATION',
        `Failed to validate configuration: ${(error as Error).message}`,
        'CONFIG_VALIDATION_002'
      );
    }
  }

  /**
   * Get entire configuration object
   */
  get(): z.infer<T>;

  /**
   * Get specific configuration value (type-safe)
   */
  get<K extends keyof z.infer<T>>(key: K): z.infer<T>[K];

  /**
   * Implementation
   */
  get<K extends keyof z.infer<T>>(key?: K): z.infer<T> | z.infer<T>[K] {
    if (key === undefined) {
      return this.config;
    }
    return this.config[key];
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.get('NODE_ENV' as keyof z.infer<T>) === 'production';
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.get('NODE_ENV' as keyof z.infer<T>) === 'development';
  }

  /**
   * Check if running in test
   */
  isTest(): boolean {
    return this.get('NODE_ENV' as keyof z.infer<T>) === 'test';
  }

  /**
   * Get service name
   */
  getServiceName(): string {
    return this.get('SERVICE_NAME' as keyof z.infer<T>) as string;
  }

  /**
   * Get port
   */
  getPort(): number {
    return this.get('PORT' as keyof z.infer<T>) as number;
  }

  /**
   * Validate partial configuration (useful for testing)
   */
  static validatePartial<S extends z.ZodType>(
    schema: S,
    config: Partial<z.infer<S>>
  ): z.infer<S> {
    const parsed = schema.safeParse(config);

    if (!parsed.success) {
      throw new Error(`Validation failed: ${parsed.error.message}`);
    }

    return parsed.data;
  }

  /**
   * Create configuration service from environment
   */
  static fromEnv<S extends z.ZodType>(schema: S, envPath?: string): ConfigService<S> {
    return new ConfigService(schema, envPath);
  }
}

/**
 * Factory function to create configuration service
 */
export function createConfigService<T extends z.ZodType>(
  schema: T,
  envPath?: string
): ConfigService<T> {
  return new ConfigService(schema, envPath);
}
