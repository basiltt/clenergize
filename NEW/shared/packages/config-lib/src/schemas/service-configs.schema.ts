import { z } from 'zod';
import {
  BaseConfigSchema,
  DatabaseConfigSchema,
  RedisConfigSchema,
  AWSConfigSchema,
  JWTConfigSchema,
  SecretsConfigSchema,
} from './base-config.schema';

/**
 * Service-Specific Configuration Schemas
 *
 * Each microservice extends the base configuration with service-specific variables.
 * This ensures type safety and validation for all environment variables.
 */

/**
 * Identity Service Configuration
 */
export const IdentityServiceConfigSchema = BaseConfigSchema.merge(DatabaseConfigSchema)
  .merge(RedisConfigSchema)
  .merge(AWSConfigSchema)
  .merge(JWTConfigSchema)
  .merge(SecretsConfigSchema)
  .extend({
    // Identity-specific config
    PASSWORD_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
    SESSION_EXPIRY_HOURS: z.coerce.number().int().positive().default(8),
    REFRESH_TOKEN_EXPIRY_DAYS: z.coerce.number().int().positive().default(30),
    MFA_ENABLED: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),
    EMAIL_SERVICE_URL: z.string().url().optional(),
  });

/**
 * Organization Service Configuration
 */
export const OrganizationServiceConfigSchema = BaseConfigSchema.merge(DatabaseConfigSchema)
  .merge(RedisConfigSchema)
  .merge(AWSConfigSchema)
  .merge(JWTConfigSchema)
  .extend({
    // Organization-specific config
    MAX_HIERARCHY_DEPTH: z.coerce.number().int().positive().default(10),
    DEFAULT_COMPANY_TIMEZONE: z.string().default('UTC'),
  });

/**
 * Reference Service Configuration
 */
export const ReferenceServiceConfigSchema = BaseConfigSchema.merge(DatabaseConfigSchema)
  .merge(RedisConfigSchema)
  .merge(AWSConfigSchema)
  .merge(JWTConfigSchema)
  .extend({
    // Reference-specific config
    EMISSION_FACTOR_CACHE_TTL_HOURS: z.coerce.number().int().positive().default(24),
    AUTO_SEED_ENABLED: z
      .string()
      .transform((val) => val === 'true')
      .default('true'),
  });

/**
 * Activity Service Configuration
 */
export const ActivityServiceConfigSchema = BaseConfigSchema.merge(DatabaseConfigSchema)
  .merge(RedisConfigSchema)
  .merge(AWSConfigSchema)
  .merge(JWTConfigSchema)
  .extend({
    // Activity-specific config
    MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(10),
    ALLOWED_FILE_TYPES: z
      .string()
      .transform((val) => val.split(',').map((type) => type.trim()))
      .default('csv,xlsx,json'),
    S3_BUCKET_NAME: z.string().optional(),
  });

/**
 * Calculation Service Configuration
 */
export const CalculationServiceConfigSchema = BaseConfigSchema.merge(DatabaseConfigSchema)
  .merge(RedisConfigSchema)
  .merge(AWSConfigSchema)
  .merge(JWTConfigSchema)
  .extend({
    // Calculation-specific config
    CALCULATION_TIMEOUT_SECONDS: z.coerce.number().int().positive().default(300),
    MAX_CONCURRENT_CALCULATIONS: z.coerce.number().int().positive().default(10),
    CALCULATION_CACHE_ENABLED: z
      .string()
      .transform((val) => val === 'true')
      .default('true'),
  });

/**
 * Reporting Service Configuration
 */
export const ReportingServiceConfigSchema = BaseConfigSchema.merge(DatabaseConfigSchema)
  .merge(RedisConfigSchema)
  .merge(AWSConfigSchema)
  .merge(JWTConfigSchema)
  .extend({
    // Reporting-specific config
    REPORT_GENERATION_TIMEOUT_SECONDS: z.coerce.number().int().positive().default(600),
    MAX_REPORT_SIZE_MB: z.coerce.number().int().positive().default(50),
    EXPORT_FORMATS: z
      .string()
      .transform((val) => val.split(',').map((format) => format.trim()))
      .default('pdf,xlsx,csv'),
    SQS_QUEUE_URL: z.string().url().optional(),
  });

/**
 * Audit Service Configuration
 */
export const AuditServiceConfigSchema = BaseConfigSchema.merge(DatabaseConfigSchema)
  .merge(RedisConfigSchema)
  .merge(AWSConfigSchema)
  .merge(JWTConfigSchema)
  .extend({
    // Audit-specific config
    AUDIT_LOG_RETENTION_DAYS: z.coerce.number().int().positive().default(90),
    AUDIT_LOG_LEVEL: z.enum(['basic', 'detailed', 'full']).default('detailed'),
    COMPLIANCE_MODE_ENABLED: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),
  });

/**
 * Type exports
 */
export type IdentityServiceConfig = z.infer<typeof IdentityServiceConfigSchema>;
export type OrganizationServiceConfig = z.infer<typeof OrganizationServiceConfigSchema>;
export type ReferenceServiceConfig = z.infer<typeof ReferenceServiceConfigSchema>;
export type ActivityServiceConfig = z.infer<typeof ActivityServiceConfigSchema>;
export type CalculationServiceConfig = z.infer<typeof CalculationServiceConfigSchema>;
export type ReportingServiceConfig = z.infer<typeof ReportingServiceConfigSchema>;
export type AuditServiceConfig = z.infer<typeof AuditServiceConfigSchema>;
