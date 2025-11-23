# Frontend-Backend Integration Guide
**Clenergize V3 - OpenAPI, Type Generation & API Client SDK**

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Owner**: Frontend Agent + Architecture Agent
**Status**: Implementation Ready
**Sprint**: 0.1-0.2

---

## Table of Contents
1. [Overview](#overview)
2. [OpenAPI Spec Generation](#openapi-spec-generation)
3. [TypeScript Type Generation](#typescript-type-generation)
4. [API Client SDK Generation](#api-client-sdk-generation)
5. [Frontend Integration](#frontend-integration)
6. [Error Handling](#error-handling)
7. [CI/CD Integration](#cicd-integration)
8. [Best Practices](#best-practices)

---

## 1. Overview

### Problem Statement

**Without Type-Safe API Integration**:
```typescript
// ❌ Backend changes, frontend breaks at runtime
const user = await fetch('/api/v1/users/me').then(r => r.json());
console.log(user.emailAddress);  // Runtime error! Field is 'email', not 'emailAddress'
```

**With Type-Safe API Integration**:
```typescript
// ✅ Compile-time type checking
import { usersApi } from '@/api/generated';

const user = await usersApi.getCurrentUser();
console.log(user.emailAddress);  // TypeScript error! Property doesn't exist
// IDE suggests: user.email ✓
```

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   INTEGRATION FLOW                           │
└──────────────────────────────────────────────────────────────┘

1. Backend Services (NestJS)
   └─→ @nestjs/swagger decorators
       └─→ Generate OpenAPI JSON (swagger.json)

2. OpenAPI Spec
   └─→ Stored in backend/openapi/ directory
       └─→ Versioned in Git

3. Frontend Build Process
   └─→ @openapitools/openapi-generator-cli
       └─→ Generate TypeScript types & API client
           └─→ frontend/src/api/generated/

4. Frontend Code
   └─→ Import generated API client
       └─→ Type-safe API calls with autocomplete
```

### Benefits

| Benefit | Description |
|---------|-------------|
| **Type Safety** | Catch API mismatches at compile time, not runtime |
| **Auto-completion** | IDE suggests available fields and methods |
| **Refactoring** | Rename fields in backend → TypeScript errors in frontend |
| **Documentation** | Generated types serve as API documentation |
| **Reduced Bugs** | Impossible to call non-existent endpoints |
| **Faster Development** | No need to manually write API types |

---

## 2. OpenAPI Spec Generation

### 2.1 Backend Setup (NestJS + Swagger)

**Install Dependencies** (all backend services):
```bash
cd services/identity-service

npm install --save \
  @nestjs/swagger \
  swagger-ui-express
```

### 2.2 Configure Swagger in main.ts

Create `src/main.ts` with Swagger configuration:

```typescript
// services/identity-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('Identity Service API')
    .setDescription('Authentication, authorization, and user management')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token'
    })
    .addServer('http://localhost:3001', 'Local Development')
    .addServer('https://api.clenergize.com/api/v1', 'Production')
    .addTag('Authentication', 'Login, logout, token refresh')
    .addTag('Users', 'User management')
    .addTag('Roles', 'Role and permission management')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Serve Swagger UI at /api/docs
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true
    }
  });

  // Export OpenAPI JSON for frontend codegen
  const openApiDir = join(__dirname, '..', '..', '..', 'openapi');
  writeFileSync(
    join(openApiDir, 'identity-service.json'),
    JSON.stringify(document, null, 2)
  );

  console.log(`✅ OpenAPI spec exported to: openapi/identity-service.json`);

  await app.listen(3001);
  console.log(`🚀 Identity Service running on: http://localhost:3001`);
  console.log(`📚 Swagger UI available at: http://localhost:3001/api/docs`);
}

bootstrap();
```

### 2.3 Annotate DTOs with Swagger Decorators

**Example DTO** (`src/dtos/create-user.dto.ts`):

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  VIEWER = 'VIEWER'
}

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecureP@ssw0rd!',
    minLength: 8,
    format: 'password'
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
    default: UserRole.USER
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsString()
  organizationId: string;
}
```

**Response DTO** (`src/dtos/user-response.dto.ts`):

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './create-user.dto';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe'
  })
  lastName: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER
  })
  role: UserRole;

  @ApiProperty({
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  organizationId: string;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2025-01-01T00:00:00Z',
    format: 'date-time'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2025-01-01T00:00:00Z',
    format: 'date-time'
  })
  updatedAt: Date;
}
```

### 2.4 Annotate Controllers with Swagger Decorators

**Example Controller** (`src/controllers/users.controller.ts`):

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { RolesGuard } from '@/guards/roles.guard';
import { Roles } from '@/decorators/roles.decorator';
import { CreateUserDto } from '@/dtos/create-user.dto';
import { UpdateUserDto } from '@/dtos/update-user.dto';
import { UserResponseDto } from '@/dtos/user-response.dto';
import { ErrorResponseDto } from '@/dtos/error-response.dto';
import { UsersService } from '@/services/users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Create new user',
    description: 'Creates a new user account. Only admins can create users.'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ErrorResponseDto
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
    type: ErrorResponseDto
  })
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns the currently authenticated user details'
  })
  @ApiResponse({
    status: 200,
    description: 'Current user details',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto
  })
  async getCurrentUser(@Req() req): Promise<UserResponseDto> {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Returns user details by user ID'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto
  })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates user details. Only admins can update users.'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto
  })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user account. Only admins can delete users.'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto
  })
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.usersService.delete(id);
  }
}
```

### 2.5 Generate OpenAPI Spec

**Run Service**:
```bash
cd services/identity-service
npm run start:dev

# OpenAPI spec automatically exported to:
# openapi/identity-service.json
```

**Verify Swagger UI**:
```bash
open http://localhost:3001/api/docs
```

### 2.6 Directory Structure

```
ClenergizeV3/
├── openapi/
│   ├── identity-service.json       # Generated by Identity Service
│   ├── organization-service.json   # Generated by Organization Service
│   ├── reference-service.json      # Generated by Reference Service
│   ├── activity-service.json       # Generated by Activity Service
│   ├── calculation-service.json    # Generated by Calculation Service
│   ├── reporting-service.json      # Generated by Reporting Service
│   └── audit-service.json          # Generated by Audit Service
│
├── services/
│   ├── identity-service/
│   ├── organization-service/
│   ├── reference-service/
│   ├── activity-service/
│   ├── calculation-service/
│   ├── reporting-service/
│   └── audit-service/
│
└── frontend/
    └── src/
        └── api/
            └── generated/          # TypeScript types generated here
                ├── identity/
                ├── organization/
                ├── reference/
                ├── activity/
                ├── calculation/
                ├── reporting/
                └── audit/
```

---

## 3. TypeScript Type Generation

### 3.1 Install OpenAPI Generator CLI

**In Frontend Project**:
```bash
cd frontend

npm install --save-dev \
  @openapitools/openapi-generator-cli@^2.7.0
```

### 3.2 Configure OpenAPI Generator

Create `openapitools.json` in frontend root:

```json
{
  "$schema": "node_modules/@openapitools/openapi-generator-cli/config.schema.json",
  "spaces": 2,
  "generator-cli": {
    "version": "7.1.0",
    "storageDir": "~/.openapi-generator",
    "generators": {
      "identity": {
        "generatorName": "typescript-fetch",
        "inputSpec": "../openapi/identity-service.json",
        "output": "./src/api/generated/identity",
        "additionalProperties": {
          "supportsES6": true,
          "withInterfaces": true,
          "typescriptThreePlus": true,
          "useSingleRequestParameter": true,
          "withSeparateModelsAndApi": true
        }
      },
      "organization": {
        "generatorName": "typescript-fetch",
        "inputSpec": "../openapi/organization-service.json",
        "output": "./src/api/generated/organization",
        "additionalProperties": {
          "supportsES6": true,
          "withInterfaces": true,
          "typescriptThreePlus": true,
          "useSingleRequestParameter": true,
          "withSeparateModelsAndApi": true
        }
      },
      "reference": {
        "generatorName": "typescript-fetch",
        "inputSpec": "../openapi/reference-service.json",
        "output": "./src/api/generated/reference"
      },
      "activity": {
        "generatorName": "typescript-fetch",
        "inputSpec": "../openapi/activity-service.json",
        "output": "./src/api/generated/activity"
      },
      "calculation": {
        "generatorName": "typescript-fetch",
        "inputSpec": "../openapi/calculation-service.json",
        "output": "./src/api/generated/calculation"
      },
      "reporting": {
        "generatorName": "typescript-fetch",
        "inputSpec": "../openapi/reporting-service.json",
        "output": "./src/api/generated/reporting"
      },
      "audit": {
        "generatorName": "typescript-fetch",
        "inputSpec": "../openapi/audit-service.json",
        "output": "./src/api/generated/audit"
      }
    }
  }
}
```

### 3.3 Generate TypeScript Types

Add npm scripts to `package.json`:

```json
{
  "scripts": {
    "generate:api": "npm run generate:api:all",
    "generate:api:all": "npm run generate:api:identity && npm run generate:api:organization && npm run generate:api:reference && npm run generate:api:activity && npm run generate:api:calculation && npm run generate:api:reporting && npm run generate:api:audit",
    "generate:api:identity": "openapi-generator-cli generate -g identity",
    "generate:api:organization": "openapi-generator-cli generate -g organization",
    "generate:api:reference": "openapi-generator-cli generate -g reference",
    "generate:api:activity": "openapi-generator-cli generate -g activity",
    "generate:api:calculation": "openapi-generator-cli generate -g calculation",
    "generate:api:reporting": "openapi-generator-cli generate -g reporting",
    "generate:api:audit": "openapi-generator-cli generate -g audit"
  }
}
```

**Generate Types**:
```bash
npm run generate:api

# Output:
# ✔ Generated TypeScript types for Identity Service
# ✔ Generated TypeScript types for Organization Service
# ✔ Generated TypeScript types for Reference Service
# ✔ Generated TypeScript types for Activity Service
# ✔ Generated TypeScript types for Calculation Service
# ✔ Generated TypeScript types for Reporting Service
# ✔ Generated TypeScript types for Audit Service
```

### 3.4 Generated Files Structure

```
frontend/src/api/generated/identity/
├── models/
│   ├── CreateUserDto.ts
│   ├── UpdateUserDto.ts
│   ├── UserResponseDto.ts
│   ├── LoginDto.ts
│   ├── TokenResponseDto.ts
│   ├── ErrorResponseDto.ts
│   └── index.ts
├── apis/
│   ├── AuthenticationApi.ts
│   ├── UsersApi.ts
│   ├── RolesApi.ts
│   └── index.ts
├── runtime.ts
├── index.ts
└── configuration.ts
```

---

## 4. API Client SDK Generation

### 4.1 Create Custom API Client Wrapper

Create `frontend/src/lib/api-client.ts`:

```typescript
// frontend/src/lib/api-client.ts
import { Configuration } from '@/api/generated/identity';
import * as Identity from '@/api/generated/identity';
import * as Organization from '@/api/generated/organization';
import * as Reference from '@/api/generated/reference';
import * as Activity from '@/api/generated/activity';
import * as Calculation from '@/api/generated/calculation';
import * as Reporting from '@/api/generated/reporting';
import * as Audit from '@/api/generated/audit';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';

// Shared configuration for all API clients
const createConfig = (accessToken?: string): Configuration => {
  return new Configuration({
    basePath: API_BASE_URL,
    accessToken,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0'
    },
    // Custom middleware for correlation IDs
    middleware: [
      {
        pre: async (context) => {
          const correlationId = generateCorrelationId();
          context.init.headers = {
            ...context.init.headers,
            'X-Correlation-Id': correlationId
          };
          return context;
        },
        post: async (context) => {
          // Log responses for debugging
          if (process.env.NODE_ENV === 'development') {
            console.log(`[API] ${context.url}`, context.response.status);
          }
          return context.response;
        }
      }
    ]
  });
};

// Identity Service APIs
export const createIdentityApis = (accessToken?: string) => {
  const config = createConfig(accessToken);
  return {
    authentication: new Identity.AuthenticationApi(config),
    users: new Identity.UsersApi(config),
    roles: new Identity.RolesApi(config)
  };
};

// Organization Service APIs
export const createOrganizationApis = (accessToken?: string) => {
  const config = createConfig(accessToken);
  return {
    organizations: new Organization.OrganizationsApi(config),
    projects: new Organization.ProjectsApi(config),
    hierarchies: new Organization.HierarchiesApi(config),
    entities: new Organization.EntitiesApi(config)
  };
};

// Reference Service APIs
export const createReferenceApis = (accessToken?: string) => {
  const config = createConfig(accessToken);
  return {
    emissionFactors: new Reference.EmissionFactorsApi(config),
    parameters: new Reference.ParametersApi(config),
    units: new Reference.UnitsApi(config),
    conversions: new Reference.ConversionsApi(config)
  };
};

// Activity Service APIs
export const createActivityApis = (accessToken?: string) => {
  const config = createConfig(accessToken);
  return {
    carbonScopes: new Activity.CarbonScopesApi(config),
    activityData: new Activity.ActivityDataApi(config),
    bulkImport: new Activity.BulkImportApi(config),
    dataQuality: new Activity.DataQualityApi(config)
  };
};

// Calculation Service APIs
export const createCalculationApis = (accessToken?: string) => {
  const config = createConfig(accessToken);
  return {
    calculations: new Calculation.CalculationsApi(config),
    rollups: new Calculation.RollupsApi(config)
  };
};

// Reporting Service APIs
export const createReportingApis = (accessToken?: string) => {
  const config = createConfig(accessToken);
  return {
    reports: new Reporting.ReportsApi(config),
    exports: new Reporting.ExportsApi(config)
  };
};

// Audit Service APIs
export const createAuditApis = (accessToken?: string) => {
  const config = createConfig(accessToken);
  return {
    auditLogs: new Audit.AuditLogsApi(config),
    compliance: new Audit.ComplianceApi(config)
  };
};

// Helper function to generate correlation IDs
function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Export all generated types
export type {
  // Identity Service types
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  LoginDto,
  TokenResponseDto
} from '@/api/generated/identity';

export type {
  // Organization Service types
  CreateOrganizationDto,
  OrganizationResponseDto,
  CreateProjectDto,
  ProjectResponseDto
} from '@/api/generated/organization';

export type {
  // Reference Service types
  EmissionFactorResponseDto,
  ParameterResponseDto
} from '@/api/generated/reference';

// ... export other types
```

---

## 5. Frontend Integration

### 5.1 React Hook for API Client

Create `frontend/src/hooks/use-api.ts`:

```typescript
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import {
  createIdentityApis,
  createOrganizationApis,
  createReferenceApis,
  createActivityApis,
  createCalculationApis,
  createReportingApis,
  createAuditApis
} from '@/lib/api-client';

export function useApi() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const api = useMemo(() => {
    return {
      identity: createIdentityApis(accessToken),
      organization: createOrganizationApis(accessToken),
      reference: createReferenceApis(accessToken),
      activity: createActivityApis(accessToken),
      calculation: createCalculationApis(accessToken),
      reporting: createReportingApis(accessToken),
      audit: createAuditApis(accessToken)
    };
  }, [accessToken]);

  return api;
}
```

### 5.2 Example: User Profile Component

```typescript
// frontend/src/components/user-profile.tsx
'use client';

import { useApi } from '@/hooks/use-api';
import { useQuery } from '@tanstack/react-query';
import { UserResponseDto } from '@/lib/api-client';

export function UserProfile() {
  const api = useApi();

  // Type-safe API call with React Query
  const { data: user, isLoading, error } = useQuery<UserResponseDto>({
    queryKey: ['user', 'me'],
    queryFn: () => api.identity.users.getCurrentUser()
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="user-profile">
      <h2>{user.firstName} {user.lastName}</h2>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
      {/* TypeScript knows all available fields! */}
    </div>
  );
}
```

### 5.3 Example: Create User Form

```typescript
// frontend/src/components/create-user-form.tsx
'use client';

import { useApi } from '@/hooks/use-api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateUserDto } from '@/lib/api-client';

// Zod schema matches backend CreateUserDto
const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'VIEWER']),
  organizationId: z.string().uuid()
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export function CreateUserForm() {
  const api = useApi();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema)
  });

  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserDto) => api.identity.users.createUser({ createUserDto: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('User created successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.error?.message || error.message}`);
    }
  });

  const onSubmit = (data: CreateUserFormData) => {
    createUserMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('firstName')} placeholder="First Name" />
      {errors.firstName && <span>{errors.firstName.message}</span>}

      <input {...register('lastName')} placeholder="Last Name" />
      {errors.lastName && <span>{errors.lastName.message}</span>}

      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <select {...register('role')}>
        <option value="USER">User</option>
        <option value="MANAGER">Manager</option>
        <option value="ADMIN">Admin</option>
      </select>

      <button type="submit" disabled={createUserMutation.isPending}>
        {createUserMutation.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

---

## 6. Error Handling

### 6.1 Global Error Handler

Create `frontend/src/lib/api-error-handler.ts`:

```typescript
import { ErrorResponseDto } from '@/lib/api-client';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleApiError(response: Response): Promise<never> {
  let errorData: ErrorResponseDto;

  try {
    errorData = await response.json();
  } catch {
    throw new ApiError(
      response.status,
      'UNKNOWN_ERROR',
      'An unexpected error occurred'
    );
  }

  throw new ApiError(
    response.status,
    errorData.error?.code || 'UNKNOWN_ERROR',
    errorData.error?.message || response.statusText,
    errorData.error?.details
  );
}

// Error toast notifications
export function showApiError(error: unknown) {
  if (error instanceof ApiError) {
    // Show user-friendly error
    toast.error(error.message, {
      description: `Error code: ${error.errorCode}`
    });
  } else if (error instanceof Error) {
    toast.error('An unexpected error occurred', {
      description: error.message
    });
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

### 6.2 React Query Error Handling

```typescript
// frontend/src/app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { showApiError } from '@/lib/api-error-handler';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
          return false;
        }
        return failureCount < 3;
      },
      onError: (error) => {
        showApiError(error);
      }
    },
    mutations: {
      onError: (error) => {
        showApiError(error);
      }
    }
  }
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

## 7. CI/CD Integration

### 7.1 GitHub Actions Workflow

Create `.github/workflows/frontend-build.yml`:

```yaml
name: Frontend Build with Type Generation

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  backend-openapi:
    name: Generate OpenAPI Specs
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          - identity-service
          - organization-service
          - reference-service
          - activity-service
          - calculation-service
          - reporting-service
          - audit-service

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: services/${{ matrix.service }}/package-lock.json

      - name: Install dependencies
        working-directory: services/${{ matrix.service }}
        run: npm ci

      - name: Generate OpenAPI spec
        working-directory: services/${{ matrix.service }}
        run: |
          npm run build
          npm run start:prod &
          sleep 10  # Wait for service to start
          curl http://localhost:${{ matrix.port }}/api/docs-json > ../../openapi/${{ matrix.service }}.json

      - name: Upload OpenAPI spec
        uses: actions/upload-artifact@v3
        with:
          name: openapi-specs
          path: openapi/${{ matrix.service }}.json

  frontend-build:
    name: Build Frontend with Generated Types
    runs-on: ubuntu-latest
    needs: backend-openapi

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download OpenAPI specs
        uses: actions/download-artifact@v3
        with:
          name: openapi-specs
          path: openapi/

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Generate TypeScript types
        working-directory: frontend
        run: npm run generate:api

      - name: Type check
        working-directory: frontend
        run: npm run type-check

      - name: Build frontend
        working-directory: frontend
        run: npm run build

      - name: Run tests
        working-directory: frontend
        run: npm test
```

---

## 8. Best Practices

### 8.1 Keep Generated Code Separate

**✅ DO**:
```
src/
├── api/
│   └── generated/       # Generated code (never edit manually)
│       ├── identity/
│       ├── organization/
│       └── reference/
├── lib/
│   └── api-client.ts    # Custom wrapper (edit this)
└── components/
```

**❌ DON'T**:
```
src/
├── api/
│   ├── identity-api.ts  # Mixing generated and custom code
│   ├── organization-api.ts
│   └── reference-api.ts
```

### 8.2 Version OpenAPI Specs

**Commit generated specs to Git**:
```bash
git add openapi/*.json
git commit -m "chore: update OpenAPI specs for services"
```

**Why?**: Frontend and backend can evolve independently. Frontend uses committed specs even if backend isn't running.

### 8.3 Regenerate Types Regularly

**Pre-commit hook** (`.husky/pre-commit`):
```bash
#!/bin/sh
cd frontend && npm run generate:api && git add src/api/generated
```

### 8.4 Handle Breaking Changes Gracefully

**Use API versioning**:
```typescript
// v1 API
export const createIdentityApisV1 = (token) => { ... }

// v2 API (breaking changes)
export const createIdentityApisV2 = (token) => { ... }

// Frontend can support both during migration
const api = useApiVersion() === 'v2' ? createIdentityApisV2(token) : createIdentityApisV1(token);
```

---

**Document Status**: ✅ Complete
**Ready for Implementation**: YES
**Sprint**: 0.1-0.2
**Next Steps**: Implement OpenAPI generation in all backend services
