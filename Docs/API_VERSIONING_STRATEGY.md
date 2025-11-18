# API Versioning Strategy

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: ACTIVE
**Sprint**: 0.3
**Priority**: MEDIUM

---

## Executive Summary

This document defines the comprehensive API versioning strategy for all Clenergize V3 microservices. We use **URI-based versioning** (`/v1`, `/v2`) with semantic versioning principles to ensure backward compatibility, smooth upgrades, and clear API evolution.

### Key Objectives

- ✅ **Backward Compatibility**: Support multiple API versions simultaneously
- ✅ **Clear Deprecation Path**: Transparent timeline for version sunset
- ✅ **Zero-Downtime Migrations**: Clients can upgrade on their schedule
- ✅ **Type Safety**: Version-specific DTOs prevent runtime errors

---

## Table of Contents

1. [Versioning Approach](#versioning-approach)
2. [NestJS Implementation](#nestjs-implementation)
3. [DTO Versioning](#dto-versioning)
4. [Breaking vs Non-Breaking Changes](#breaking-vs-non-breaking-changes)
5. [Deprecation Policy](#deprecation-policy)
6. [Version Discovery](#version-discovery)
7. [Migration Examples](#migration-examples)
8. [Best Practices](#best-practices)

---

## Versioning Approach

### URI Versioning (Chosen Strategy)

```
Format: /v{major-version}/{resource}

Examples:
✅ GET /v1/users
✅ GET /v2/users
✅ POST /v1/projects
✅ POST /v2/projects
```

#### Why URI Versioning?

| Criterion | URI | Header | Query Param | Media Type |
|-----------|-----|--------|-------------|------------|
| **Visibility** | ✅ Explicit | ❌ Hidden | ⚠️ Visible | ❌ Hidden |
| **Cacheability** | ✅ Easy | ❌ Complex | ⚠️ Moderate | ❌ Complex |
| **Routing** | ✅ Simple | ❌ Complex | ⚠️ Moderate | ❌ Complex |
| **Tooling** | ✅ Wide support | ⚠️ Moderate | ⚠️ Moderate | ❌ Limited |
| **Clarity** | ✅ Very clear | ❌ Not obvious | ⚠️ Moderate | ❌ Not obvious |

**Decision**: URI versioning wins for simplicity, visibility, and tooling support.

---

## NestJS Implementation

### Controller Versioning

```typescript
import { Controller, Get, Version } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * V1 API - Returns basic user fields
   */
  @Get()
  @Version('1')
  async findAllV1(): Promise<UserDtoV1[]> {
    const users = await this.usersService.findAll();
    return users.map(user => this.mapToV1Dto(user));
  }

  /**
   * V2 API - Returns enhanced user fields + avatar
   */
  @Get()
  @Version('2')
  async findAllV2(): Promise<UserDtoV2[]> {
    const users = await this.usersService.findAll();
    return users.map(user => this.mapToV2Dto(user));
  }

  /**
   * V1 API - Get single user
   */
  @Get(':id')
  @Version('1')
  async findOneV1(@Param('id') id: string): Promise<UserDtoV1> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User', id);
    }
    return this.mapToV1Dto(user);
  }

  /**
   * V2 API - Get single user with enhanced fields
   */
  @Get(':id')
  @Version('2')
  async findOneV2(@Param('id') id: string): Promise<UserDtoV2> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User', id);
    }
    return this.mapToV2Dto(user);
  }

  // Mapping helpers
  private mapToV1Dto(user: User): UserDtoV1 {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString()
    };
  }

  private mapToV2Dto(user: User): UserDtoV2 {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || null,
      timezone: user.timezone || 'UTC',
      preferences: user.preferences || {},
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString()
    };
  }
}
```

### Global Versioning Configuration

```typescript
// main.ts
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable URI versioning globally
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', // Fallback to V1 if no version specified
    prefix: 'v' // Prefix for version (e.g., /v1, /v2)
  });

  await app.listen(3000);
}
```

### Route Registration

```
Resulting Routes:
GET  /v1/users       → UsersController.findAllV1()
GET  /v2/users       → UsersController.findAllV2()
GET  /v1/users/:id   → UsersController.findOneV1()
GET  /v2/users/:id   → UsersController.findOneV2()
POST /v1/users       → UsersController.createV1()
POST /v2/users       → UsersController.createV2()
```

---

## DTO Versioning

### Version-Specific DTOs

```typescript
// src/api/dtos/v1/user.dto.ts
export class UserDtoV1 {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  createdAt: string;
}

// src/api/dtos/v2/user.dto.ts
export class UserDtoV2 extends UserDtoV1 {
  @ApiProperty({
    example: 'https://cdn.example.com/avatars/123.jpg',
    nullable: true
  })
  avatar: string | null;

  @ApiProperty({ example: 'America/New_York' })
  timezone: string;

  @ApiProperty({ example: { theme: 'dark', language: 'en' } })
  preferences: Record<string, any>;

  @ApiProperty({ example: '2025-01-16T14:20:00Z', required: false })
  updatedAt?: string;
}
```

### Request DTO Versioning

```typescript
// V1 Create User Request
export class CreateUserDtoV1 {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;
}

// V2 Create User Request (with additional fields)
export class CreateUserDtoV2 extends CreateUserDtoV1 {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ required: false, default: 'UTC' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  preferences?: Record<string, any>;
}
```

---

## Breaking vs Non-Breaking Changes

### Non-Breaking Changes (PATCH version)

✅ **Safe to add without new API version:**

- Adding new optional fields to responses
- Adding new optional query parameters
- Adding new endpoints
- Adding new enum values (at end of list)
- Relaxing validation rules
- Improving error messages

```typescript
// Example: Adding optional field (non-breaking)
export class UserDtoV1 {
  id: string;
  email: string;
  name: string;
  createdAt: string;

  // ✅ NEW optional field - non-breaking!
  @ApiProperty({ required: false })
  lastLoginAt?: string;
}
```

### Breaking Changes (MAJOR version)

❌ **Require new API version:**

- Removing fields from responses
- Renaming fields
- Changing field types
- Making optional fields required
- Changing HTTP status codes
- Removing endpoints
- Changing endpoint URLs
- Changing authentication requirements

```typescript
// Example: Breaking change - requires V2
export class UserDtoV1 {
  id: string;
  email: string;
  name: string; // Single field
}

export class UserDtoV2 {
  id: string;
  email: string;
  firstName: string; // ❌ BREAKING: Split 'name' into two fields
  lastName: string;  // ❌ BREAKING: Requires new version
}
```

---

## Deprecation Policy

### Deprecation Timeline

```
Sprint N: V2 API released, V1 marked as deprecated
  ↓
Sprint N+1: Deprecation notices in logs/emails
  ↓
Sprint N+2: V1 marked with Sunset header
  ↓
Sprint N+3: V1 returns 410 Gone (forced migration)
  ↓
Sprint N+4: V1 code removed from codebase
```

### Deprecation Headers

```typescript
@Get()
@Version('1')
@ApiDeprecated({
  version: '1',
  sunset: '2026-06-30T23:59:59Z',
  replacement: '/v2/users',
  link: 'https://docs.clenergize.com/api/migration/v1-to-v2'
})
async findAllV1(@Res() res: Response): Promise<UserDtoV1[]> {
  // Add deprecation headers
  res.setHeader('Deprecation', 'true');
  res.setHeader('Sunset', 'Wed, 30 Jun 2026 23:59:59 GMT');
  res.setHeader('Link', '</v2/users>; rel="successor-version"');

  const users = await this.usersService.findAll();
  return users.map(user => this.mapToV1Dto(user));
}
```

### Client Response Headers

```http
HTTP/1.1 200 OK
Content-Type: application/json
Deprecation: true
Sunset: Wed, 30 Jun 2026 23:59:59 GMT
Link: </v2/users>; rel="successor-version"
X-API-Version: 1
X-API-Warn-Deprecated: This API version will be removed on 2026-06-30
```

### Deprecation Decorator

```typescript
// src/common/decorators/api-deprecated.decorator.ts
export function ApiDeprecated(options: {
  version: string;
  sunset: string;
  replacement: string;
  link?: string;
}) {
  return applyDecorators(
    SetMetadata('deprecated', true),
    SetMetadata('deprecationInfo', options),
    ApiHeader({
      name: 'Deprecation',
      description: 'Indicates this API version is deprecated',
      required: false
    }),
    ApiHeader({
      name: 'Sunset',
      description: 'Date when this API version will be removed',
      required: false
    })
  );
}
```

---

## Version Discovery

### API Info Endpoint

```typescript
@Controller()
export class AppController {
  @Get()
  getApiInfo(): ApiInfoDto {
    return {
      service: 'identity-service',
      versions: {
        supported: ['1', '2'],
        default: '1',
        latest: '2',
        deprecated: ['1']
      },
      deprecationInfo: {
        'v1': {
          sunsetDate: '2026-06-30T23:59:59Z',
          replacement: 'v2',
          migrationGuide: 'https://docs.clenergize.com/api/migration/v1-to-v2'
        }
      },
      links: {
        documentation: 'https://docs.clenergize.com/api',
        status: 'https://status.clenergize.com',
        support: 'https://support.clenergize.com'
      }
    };
  }
}
```

### OpenAPI/Swagger Documentation

```typescript
// main.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // V1 API Documentation
  const configV1 = new DocumentBuilder()
    .setTitle('Clenergize Identity API V1')
    .setDescription('User authentication and authorization (DEPRECATED)')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('deprecated', 'This version will be sunset on 2026-06-30')
    .build();

  const documentV1 = SwaggerModule.createDocument(app, configV1, {
    include: [UsersModule],
    deepScanRoutes: true,
    operationIdFactory: (controllerKey, methodKey) => `${methodKey}V1`
  });

  SwaggerModule.setup('api/v1/docs', app, documentV1);

  // V2 API Documentation
  const configV2 = new DocumentBuilder()
    .setTitle('Clenergize Identity API V2')
    .setDescription('User authentication and authorization (CURRENT)')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const documentV2 = SwaggerModule.createDocument(app, configV2, {
    include: [UsersModule],
    deepScanRoutes: true,
    operationIdFactory: (controllerKey, methodKey) => `${methodKey}V2`
  });

  SwaggerModule.setup('api/v2/docs', app, documentV2);

  await app.listen(3000);
}
```

---

## Migration Examples

### Example 1: Split Field (Name → First Name + Last Name)

#### V1 API

```typescript
// GET /v1/users/123
{
  "id": "123",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

#### V2 API

```typescript
// GET /v2/users/123
{
  "id": "123",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

#### Backward Compatibility Layer

```typescript
export class UsersController {
  @Get(':id')
  @Version('1')
  async findOneV1(@Param('id') id: string): Promise<UserDtoV1> {
    const user = await this.usersService.findById(id);

    // Combine firstName + lastName for V1 compatibility
    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`, // ✅ Backward compatible
      createdAt: user.createdAt.toISOString()
    };
  }

  @Get(':id')
  @Version('2')
  async findOneV2(@Param('id') id: string): Promise<UserDtoV2> {
    const user = await this.usersService.findById(id);

    // Return split fields in V2
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt.toISOString()
    };
  }
}
```

### Example 2: Status Enum Change

#### V1 API (Simple Status)

```typescript
enum UserStatusV1 {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export class UserDtoV1 {
  id: string;
  email: string;
  status: UserStatusV1;
}
```

#### V2 API (Granular Status)

```typescript
enum UserStatusV2 {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
  DELETED = 'DELETED'
}

export class UserDtoV2 {
  id: string;
  email: string;
  status: UserStatusV2;
}
```

#### Mapping Logic

```typescript
export class UsersController {
  private mapStatusToV1(statusV2: UserStatusV2): UserStatusV1 {
    switch (statusV2) {
      case UserStatusV2.ACTIVE:
        return UserStatusV1.ACTIVE;
      case UserStatusV2.PENDING:
      case UserStatusV2.SUSPENDED:
      case UserStatusV2.DEACTIVATED:
      case UserStatusV2.DELETED:
        return UserStatusV1.INACTIVE;
    }
  }

  @Get(':id')
  @Version('1')
  async findOneV1(@Param('id') id: string): Promise<UserDtoV1> {
    const user = await this.usersService.findById(id);
    return {
      id: user.id,
      email: user.email,
      status: this.mapStatusToV1(user.status) // ✅ Map to V1 enum
    };
  }

  @Get(':id')
  @Version('2')
  async findOneV2(@Param('id') id: string): Promise<UserDtoV2> {
    const user = await this.usersService.findById(id);
    return {
      id: user.id,
      email: user.email,
      status: user.status // ✅ Return full V2 enum
    };
  }
}
```

---

## Best Practices

### 1. Version Coupling

✅ **DO:**
```typescript
// Each version has independent DTO
export class UserDtoV1 { ... }
export class UserDtoV2 { ... }

// Each version has independent mapper
private mapToV1Dto(user: User): UserDtoV1 { ... }
private mapToV2Dto(user: User): UserDtoV2 { ... }
```

❌ **DON'T:**
```typescript
// Sharing DTO across versions
export class UserDto { ... } // ❌ Used by both V1 and V2

// Using conditional logic in single mapper
private mapToDto(user: User, version: string): UserDto {
  if (version === '1') { ... } // ❌ Fragile
  else if (version === '2') { ... } // ❌ Hard to maintain
}
```

### 2. Feature Flags

```typescript
// Use feature flags to gradually roll out V2
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly featureFlags: FeatureFlagService
  ) {}

  @Get()
  async findAll(@Version() version: string): Promise<UserDtoV1[] | UserDtoV2[]> {
    const users = await this.usersService.findAll();

    // Check if V2 is enabled for this request
    const useV2 = version === '2' && await this.featureFlags.isEnabled('api-v2-users');

    return useV2
      ? users.map(u => this.mapToV2Dto(u))
      : users.map(u => this.mapToV1Dto(u));
  }
}
```

### 3. Version Header Validation

```typescript
// middleware/version-validator.middleware.ts
export class VersionValidatorMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const version = req.path.match(/\/v(\d+)\//)?[1];

    if (version && !['1', '2'].includes(version)) {
      throw new BadRequestException(
        `Unsupported API version: v${version}. Supported versions: v1, v2`
      );
    }

    // Add version to request for logging
    req['apiVersion'] = version || 'unknown';
    next();
  }
}
```

### 4. Monitoring Version Usage

```typescript
// interceptors/version-metrics.interceptor.ts
@Injectable()
export class VersionMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const version = request.path.match(/\/v(\d+)\//)?[1] || 'unknown';

    // Track version usage
    this.metrics.increment('api.request', {
      version,
      endpoint: request.path,
      method: request.method
    });

    return next.handle();
  }
}
```

### 5. Testing Both Versions

```typescript
describe('UsersController', () => {
  describe('V1 API', () => {
    it('should return V1 user DTO', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/users/123')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).not.toHaveProperty('firstName');
      expect(response.body).not.toHaveProperty('lastName');
    });
  });

  describe('V2 API', () => {
    it('should return V2 user DTO', async () => {
      const response = await request(app.getHttpServer())
        .get('/v2/users/123')
        .expect(200);

      expect(response.body).toHaveProperty('firstName');
      expect(response.body).toHaveProperty('lastName');
      expect(response.body).not.toHaveProperty('name');
    });
  });

  describe('Backward Compatibility', () => {
    it('V1 name should equal V2 firstName + lastName', async () => {
      const v1Response = await request(app.getHttpServer())
        .get('/v1/users/123');

      const v2Response = await request(app.getHttpServer())
        .get('/v2/users/123');

      const expectedName = `${v2Response.body.firstName} ${v2Response.body.lastName}`;
      expect(v1Response.body.name).toBe(expectedName);
    });
  });
});
```

---

## Appendix

### Version Support Matrix

| Service | V1 Status | V2 Status | V1 Sunset Date | Notes |
|---------|-----------|-----------|----------------|-------|
| Identity | Deprecated | Current | 2026-06-30 | Name split in V2 |
| Organization | Current | In Development | N/A | V2 planned for Sprint 1.2 |
| Reference | Current | N/A | N/A | Stable, no V2 needed yet |
| Activity | Current | Planned | N/A | V2 in roadmap |
| Calculation | Current | Planned | N/A | V2 in roadmap |
| Reporting | Current | N/A | N/A | Recently launched |
| Audit | Current | N/A | N/A | Recently launched |

### Migration Checklist

When releasing a new API version:

- [ ] Create version-specific DTOs (Request & Response)
- [ ] Implement version-specific controllers/handlers
- [ ] Add backward compatibility mappers
- [ ] Update OpenAPI/Swagger documentation
- [ ] Write migration guide for clients
- [ ] Add deprecation headers to old version
- [ ] Configure feature flags
- [ ] Add monitoring/metrics for version usage
- [ ] Write E2E tests for both versions
- [ ] Test backward compatibility
- [ ] Announce deprecation (if applicable)
- [ ] Schedule sunset date (6 months minimum)
- [ ] Monitor client migration progress
- [ ] Remove old version after sunset

---

**Last Updated**: November 18, 2025
**Next Review**: Sprint 0.4
**Maintained By**: Architecture Agent + All Service Agents
