/**
 * @clenergize/config-lib
 *
 * Configuration and environment validation library for Clenergize microservices.
 * Validates all environment variables at startup using Zod schemas.
 *
 * @packageDocumentation
 */

// Configuration Service
export * from './config.service';

// Schemas
export * from './schemas';

// Re-export for convenience
export { ConfigService, createConfigService } from './config.service';
export {
  BaseConfigSchema,
  DatabaseConfigSchema,
  RedisConfigSchema,
  AWSConfigSchema,
  JWTConfigSchema,
  SecretsConfigSchema,
  CompleteConfigSchema,
} from './schemas/base-config.schema';
export {
  IdentityServiceConfigSchema,
  OrganizationServiceConfigSchema,
  ReferenceServiceConfigSchema,
  ActivityServiceConfigSchema,
  CalculationServiceConfigSchema,
  ReportingServiceConfigSchema,
  AuditServiceConfigSchema,
} from './schemas/service-configs.schema';
