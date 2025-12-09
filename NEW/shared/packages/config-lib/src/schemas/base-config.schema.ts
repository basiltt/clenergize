import { z } from 'zod';

/**
 * Base Configuration Schema
 *
 * Common environment variables shared across all microservices.
 * Each service can extend this schema with service-specific variables.
 *
 * Environment variables are CRITICAL - missing or invalid values can cause runtime failures.
 * This schema validates ALL configuration at startup, preventing the application from running
 * with invalid configuration.
 */

/**
 * Node environment
 */
export const NodeEnvSchema = z.enum(['development', 'test', 'staging', 'production']);

/**
 * Log level
 */
export const LogLevelSchema = z.enum(['error', 'warn', 'info', 'debug', 'verbose']);

/**
 * Base configuration schema (common to all services)
 */
export const BaseConfigSchema = z.object({
  // Application
  NODE_ENV: NodeEnvSchema.default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  SERVICE_NAME: z.string().min(1),
  VERSION: z.string().default('1.0.0'),

  // Logging
  LOG_LEVEL: LogLevelSchema.default('info'),

  // CORS
  CORS_ORIGINS: z
    .string()
    .transform((val) => val.split(',').map((origin) => origin.trim()))
    .default('http://localhost:3000'),

  // API
  API_PREFIX: z.string().default('/api/v1'),
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  API_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000), // 1 minute
});

/**
 * Database configuration schema
 */
export const DatabaseConfigSchema = z.object({
  MONGODB_URI: z.string().url(),
  MONGODB_DB_NAME: z.string().min(1),
  MONGODB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(10),
  MONGODB_MIN_POOL_SIZE: z.coerce.number().int().nonnegative().default(2),
  MONGODB_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
});

/**
 * Redis configuration schema
 */
export const RedisConfigSchema = z.object({
  REDIS_URL: z.string().url(),
  REDIS_CACHE_DB: z.coerce.number().int().min(0).max(15).default(0),
  REDIS_PUBSUB_DB: z.coerce.number().int().min(0).max(15).default(1),
  REDIS_TTL_SECONDS: z.coerce.number().int().positive().default(3600), // 1 hour
});

/**
 * AWS configuration schema
 */
export const AWSConfigSchema = z.object({
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_ENDPOINT: z.string().url().optional(), // For LocalStack
});

/**
 * JWT configuration schema
 */
export const JWTConfigSchema = z.object({
  JWT_ISSUER: z.string().url(),
  JWT_AUDIENCE: z.string().min(1),
  JWKS_URI: z.string().url(),
  JWT_ALGORITHMS: z
    .string()
    .transform((val) => val.split(',').map((alg) => alg.trim()))
    .default('RS256'),
});

/**
 * Secrets Manager configuration schema
 */
export const SecretsConfigSchema = z.object({
  SECRETS_MANAGER_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  SECRETS_MANAGER_PREFIX: z.string().default('clenergize'),
});

/**
 * Complete configuration schema (all services)
 */
export const CompleteConfigSchema = BaseConfigSchema.merge(DatabaseConfigSchema)
  .merge(RedisConfigSchema)
  .merge(AWSConfigSchema)
  .merge(JWTConfigSchema)
  .merge(SecretsConfigSchema);

/**
 * Type exports
 */
export type NodeEnv = z.infer<typeof NodeEnvSchema>;
export type LogLevel = z.infer<typeof LogLevelSchema>;
export type BaseConfig = z.infer<typeof BaseConfigSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export type AWSConfig = z.infer<typeof AWSConfigSchema>;
export type JWTConfig = z.infer<typeof JWTConfigSchema>;
export type SecretsConfig = z.infer<typeof SecretsConfigSchema>;
export type CompleteConfig = z.infer<typeof CompleteConfigSchema>;
