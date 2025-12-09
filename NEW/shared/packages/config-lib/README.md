# @clenergize/config-lib

> Configuration and environment validation library for Clenergize microservices

## Installation

```bash
npm install @clenergize/config-lib @clenergize/common
```

## Features

- ✅ **Environment Validation** - Validates all env vars at startup with Zod
- ✅ **Type-Safe Access** - Full TypeScript support for configuration
- ✅ **Service-Specific Schemas** - Pre-defined schemas for all 7 microservices
- ✅ **Fail-Fast** - Application won't start with invalid config
- ✅ **Default Values** - Sensible defaults for optional variables
- ✅ **Transform Support** - Automatic type conversion (string → number, boolean, array)

## Quick Start

### 1. Create .env file

```env
# Application
NODE_ENV=development
PORT=3001
SERVICE_NAME=identity-service
VERSION=1.0.0

# Database
MONGODB_URI=mongodb://admin:localdev123@localhost:27017
MONGODB_DB_NAME=clenergize_identity

# Redis
REDIS_URL=redis://localhost:6379
REDIS_CACHE_DB=0
REDIS_PUBSUB_DB=1

# JWT
JWT_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/your-pool
JWT_AUDIENCE=your-app-client-id
JWKS_URI=https://cognito-idp.us-east-1.amazonaws.com/your-pool/.well-known/jwks.json

# AWS
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:4566

# Identity Service Specific
PASSWORD_SALT_ROUNDS=12
SESSION_EXPIRY_HOURS=8
MFA_ENABLED=false
```

### 2. Use ConfigService in your application

```typescript
import { ConfigService, IdentityServiceConfigSchema } from '@clenergize/config-lib';

// Create configuration service (validates on instantiation)
const configService = new ConfigService(IdentityServiceConfigSchema);

// Get entire config object
const config = configService.get();
console.log(config.PORT); // 3001 (type-safe)

// Get specific values (type-safe)
const port = configService.get('PORT'); // number
const serviceName = configService.get('SERVICE_NAME'); // string
const mongoUri = configService.get('MONGODB_URI'); // string

// Helper methods
const isProduction = configService.isProduction(); // boolean
const isDevelopment = configService.isDevelopment(); // boolean

// Application startup
async function bootstrap() {
  const config = configService.get();

  const app = await NestFactory.create(AppModule);
  await app.listen(config.PORT);

  console.log(`${config.SERVICE_NAME} running on port ${config.PORT}`);
}
```

### 3. Validation happens automatically

```typescript
// ❌ Missing required variable
// MONGODB_URI not set in .env

const configService = new ConfigService(IdentityServiceConfigSchema);
// Throws: InternalError
// Environment validation failed:
//   - MONGODB_URI: Required

// ✅ Invalid value
// PORT=not-a-number

const configService = new ConfigService(IdentityServiceConfigSchema);
// Throws: InternalError
// Environment validation failed:
//   - PORT: Expected number, received string
```

## Service-Specific Schemas

### Identity Service

```typescript
import { ConfigService, IdentityServiceConfigSchema } from '@clenergize/config-lib';

const config = new ConfigService(IdentityServiceConfigSchema);

// Type-safe access to identity-specific config
const saltRounds = config.get('PASSWORD_SALT_ROUNDS'); // number (default: 12)
const sessionExpiry = config.get('SESSION_EXPIRY_HOURS'); // number (default: 8)
const mfaEnabled = config.get('MFA_ENABLED'); // boolean (default: false)
```

**Additional Variables**:
- `PASSWORD_SALT_ROUNDS` - bcrypt salt rounds (10-15, default: 12)
- `SESSION_EXPIRY_HOURS` - JWT session expiry (default: 8)
- `REFRESH_TOKEN_EXPIRY_DAYS` - Refresh token expiry (default: 30)
- `MFA_ENABLED` - Enable multi-factor auth (default: false)
- `EMAIL_SERVICE_URL` - Email service endpoint (optional)

### Organization Service

```typescript
import { ConfigService, OrganizationServiceConfigSchema } from '@clenergize/config-lib';

const config = new ConfigService(OrganizationServiceConfigSchema);

const maxDepth = config.get('MAX_HIERARCHY_DEPTH'); // number (default: 10)
const timezone = config.get('DEFAULT_COMPANY_TIMEZONE'); // string (default: 'UTC')
```

**Additional Variables**:
- `MAX_HIERARCHY_DEPTH` - Maximum nesting level (default: 10)
- `DEFAULT_COMPANY_TIMEZONE` - Default timezone (default: 'UTC')

### Reference Service

```typescript
import { ConfigService, ReferenceServiceConfigSchema } from '@clenergize/config-lib';

const config = new ConfigService(ReferenceServiceConfigSchema);

const cacheTTL = config.get('EMISSION_FACTOR_CACHE_TTL_HOURS'); // number (default: 24)
const autoSeed = config.get('AUTO_SEED_ENABLED'); // boolean (default: true)
```

**Additional Variables**:
- `EMISSION_FACTOR_CACHE_TTL_HOURS` - Cache TTL (default: 24)
- `AUTO_SEED_ENABLED` - Auto-seed reference data (default: true)

### Activity Service

```typescript
import { ConfigService, ActivityServiceConfigSchema } from '@clenergize/config-lib';

const config = new ConfigService(ActivityServiceConfigSchema);

const maxUpload = config.get('MAX_UPLOAD_SIZE_MB'); // number (default: 10)
const allowedTypes = config.get('ALLOWED_FILE_TYPES'); // string[] (default: ['csv', 'xlsx', 'json'])
```

**Additional Variables**:
- `MAX_UPLOAD_SIZE_MB` - Max file upload size (default: 10)
- `ALLOWED_FILE_TYPES` - Comma-separated file types (default: 'csv,xlsx,json')
- `S3_BUCKET_NAME` - S3 bucket for file storage (optional)

### Calculation Service

```typescript
import { ConfigService, CalculationServiceConfigSchema } from '@clenergize/config-lib';

const config = new ConfigService(CalculationServiceConfigSchema);

const timeout = config.get('CALCULATION_TIMEOUT_SECONDS'); // number (default: 300)
const maxConcurrent = config.get('MAX_CONCURRENT_CALCULATIONS'); // number (default: 10)
```

**Additional Variables**:
- `CALCULATION_TIMEOUT_SECONDS` - Calculation timeout (default: 300)
- `MAX_CONCURRENT_CALCULATIONS` - Max parallel calculations (default: 10)
- `CALCULATION_CACHE_ENABLED` - Enable result caching (default: true)

### Reporting Service

```typescript
import { ConfigService, ReportingServiceConfigSchema } from '@clenergize/config-lib';

const config = new ConfigService(ReportingServiceConfigSchema);

const timeout = config.get('REPORT_GENERATION_TIMEOUT_SECONDS'); // number (default: 600)
const formats = config.get('EXPORT_FORMATS'); // string[] (default: ['pdf', 'xlsx', 'csv'])
```

**Additional Variables**:
- `REPORT_GENERATION_TIMEOUT_SECONDS` - Report timeout (default: 600)
- `MAX_REPORT_SIZE_MB` - Max report size (default: 50)
- `EXPORT_FORMATS` - Comma-separated formats (default: 'pdf,xlsx,csv')
- `SQS_QUEUE_URL` - SQS queue for async reports (optional)

### Audit Service

```typescript
import { ConfigService, AuditServiceConfigSchema } from '@clenergize/config-lib';

const config = new ConfigService(AuditServiceConfigSchema);

const retention = config.get('AUDIT_LOG_RETENTION_DAYS'); // number (default: 90)
const level = config.get('AUDIT_LOG_LEVEL'); // 'basic' | 'detailed' | 'full' (default: 'detailed')
```

**Additional Variables**:
- `AUDIT_LOG_RETENTION_DAYS` - Log retention period (default: 90)
- `AUDIT_LOG_LEVEL` - Log verbosity (default: 'detailed')
- `COMPLIANCE_MODE_ENABLED` - Enable compliance mode (default: false)

## Base Configuration (All Services)

All services include these base variables:

```typescript
NODE_ENV: 'development' | 'test' | 'staging' | 'production'
PORT: number (1-65535, default: 3000)
SERVICE_NAME: string (required)
VERSION: string (default: '1.0.0')
LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug' | 'verbose'
CORS_ORIGINS: string[] (comma-separated, default: 'http://localhost:3000')
API_PREFIX: string (default: '/api/v1')
API_RATE_LIMIT_MAX: number (default: 100)
API_RATE_LIMIT_WINDOW_MS: number (default: 60000)
```

## Custom Schemas

Create your own schema for custom services:

```typescript
import { z } from 'zod';
import { BaseConfigSchema } from '@clenergize/config-lib';

const CustomServiceConfigSchema = BaseConfigSchema.extend({
  CUSTOM_VAR_1: z.string().min(1),
  CUSTOM_VAR_2: z.coerce.number().int().positive(),
  CUSTOM_FEATURE_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
});

const config = new ConfigService(CustomServiceConfigSchema);
```

## Type Transformations

Zod automatically transforms environment variables:

```typescript
// .env
PORT=3001                              // string
API_RATE_LIMIT_MAX=100                 // string
MFA_ENABLED=true                       // string
CORS_ORIGINS=http://localhost:3000,http://localhost:3001  // string
JWT_ALGORITHMS=RS256,RS384             // string

// After validation
config.get('PORT');                    // number (3001)
config.get('API_RATE_LIMIT_MAX');      // number (100)
config.get('MFA_ENABLED');             // boolean (true)
config.get('CORS_ORIGINS');            // string[] (['http://localhost:3000', 'http://localhost:3001'])
config.get('JWT_ALGORITHMS');          // string[] (['RS256', 'RS384'])
```

## Testing

```typescript
import { ConfigService } from '@clenergize/config-lib';

describe('ConfigService', () => {
  it('should validate configuration', () => {
    process.env.SERVICE_NAME = 'test-service';
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    // ... set other required vars

    const config = new ConfigService(IdentityServiceConfigSchema);

    expect(config.get('SERVICE_NAME')).toBe('test-service');
    expect(config.get('PORT')).toBe(3000); // default
  });

  it('should throw on invalid configuration', () => {
    delete process.env.SERVICE_NAME; // Required field

    expect(() => new ConfigService(IdentityServiceConfigSchema))
      .toThrow('Environment validation failed');
  });
});
```

## Migration from OLD Codebase

### Before (VULNERABLE)

```typescript
// OLD codebase - No validation, runtime errors possible
const port = process.env.PORT || 3000;  // ❌ String, not number!
const mongoUri = process.env.MONGO_URI; // ❌ Might be undefined!

app.listen(port); // ❌ Runtime error if PORT is not a number
mongoose.connect(mongoUri); // ❌ Runtime error if MONGO_URI is undefined
```

### After (SAFE)

```typescript
// NEW codebase - Validated at startup
const configService = new ConfigService(IdentityServiceConfigSchema);
const config = configService.get();

app.listen(config.PORT); // ✅ Type-safe, guaranteed to be a number
mongoose.connect(config.MONGODB_URI); // ✅ Guaranteed to be present and valid URL
```

## Best Practices

1. **Validate early** - Create ConfigService at application startup
2. **Use type-safe access** - Always use `config.get('KEY')` instead of `process.env.KEY`
3. **Set defaults** - Use `.default()` for optional variables
4. **Document variables** - List all variables in README or .env.example
5. **Never commit .env** - Add to .gitignore
6. **Use AWS Secrets Manager** - For production secrets (passwords, tokens, keys)

## License

PROPRIETARY - Clenergize Team

## Links

- [Clenergize V3 Documentation](../../Docs/)
- [Environment Configuration Guide](../../Docs/ENVIRONMENT_CONFIGURATION_GUIDE.md)
- [Zod Documentation](https://zod.dev/)
