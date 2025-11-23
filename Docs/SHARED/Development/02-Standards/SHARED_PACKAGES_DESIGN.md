# Shared Packages Design - Clenergize V3

**Document Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: Design Phase Complete
**Owner**: Architecture Team

---

## Executive Summary

This document defines the architecture and implementation strategy for shared packages across the Clenergize V3 monorepo. These packages provide type-safe contracts, utilities, and domain logic that ensure consistency between frontend and backend services while preventing code duplication.

### Package Overview

| Package | Purpose | Consumers | Size | Complexity |
|---------|---------|-----------|------|------------|
| `@clenergize/types` | Shared TypeScript types and interfaces | All services + frontend | Medium | Low |
| `@clenergize/contracts` | Domain event schemas (92 events) | All backend services | Large | Medium |
| `@clenergize/validators` | Zod validation schemas | All services + frontend | Medium | Low |
| `@clenergize/errors` | Error classes and handling | All services + frontend | Small | Low |
| `@clenergize/utils` | Utility functions | All services + frontend | Medium | Low |
| `@clenergize/constants` | Enums, constants, configuration | All services + frontend | Small | Low |
| `@clenergize/api-client` | Type-safe API client (frontend only) | Frontend | Medium | Medium |
| `@clenergize/test-utils` | Testing utilities and mocks | All services (dev) | Small | Low |

### Key Benefits

1. **Type Safety**: Single source of truth for types ensures frontend/backend consistency
2. **DRY Principle**: Shared validation logic eliminates duplication
3. **Versioning**: Independent package versioning allows gradual adoption
4. **Developer Experience**: Auto-complete and IntelliSense across all projects
5. **Maintainability**: Changes propagate through semantic versioning
6. **Performance**: Tree-shakeable exports reduce bundle size

---

## 1. Monorepo Structure

### 1.1 Directory Layout

```
ClenergizeV3/
├── packages/
│   ├── types/                    # @clenergize/types
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── entities/         # Domain entities
│   │   │   ├── dtos/             # Data Transfer Objects
│   │   │   ├── enums/            # Enumerations
│   │   │   └── common/           # Common types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── contracts/                # @clenergize/contracts
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── events/           # Domain events (92 schemas)
│   │   │   ├── commands/         # Command contracts
│   │   │   └── queries/          # Query contracts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── validators/               # @clenergize/validators
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── entities/         # Entity validators
│   │   │   ├── dtos/             # DTO validators
│   │   │   └── common/           # Common validators
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── errors/                   # @clenergize/errors
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── base/             # Base error classes
│   │   │   ├── domain/           # Domain-specific errors
│   │   │   └── handlers/         # Error handlers
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utils/                    # @clenergize/utils
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── date/             # Date utilities
│   │   │   ├── string/           # String utilities
│   │   │   ├── number/           # Number utilities
│   │   │   ├── object/           # Object utilities
│   │   │   └── crypto/           # Cryptographic utilities
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── constants/                # @clenergize/constants
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── enums.ts          # All enumerations
│   │   │   ├── config.ts         # Configuration constants
│   │   │   └── regex.ts          # Regular expressions
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api-client/               # @clenergize/api-client
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── client.ts         # Base API client
│   │   │   ├── endpoints/        # Type-safe endpoint methods
│   │   │   └── types.ts          # Client-specific types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── test-utils/               # @clenergize/test-utils
│       ├── src/
│       │   ├── index.ts
│       │   ├── mocks/            # Mock data generators
│       │   ├── factories/        # Entity factories
│       │   └── helpers/          # Test helpers
│       ├── package.json
│       └── tsconfig.json
│
├── services/
│   ├── identity-service/
│   ├── organization-service/
│   └── ...
│
├── frontend/
│
├── package.json                  # Root package.json
├── turbo.json                    # Turborepo configuration
└── pnpm-workspace.yaml           # PNPM workspaces
```

### 1.2 Package Manager Choice: PNPM

**Why PNPM over NPM/Yarn**:
- **Disk Efficiency**: Content-addressable storage saves ~30% disk space
- **Performance**: Faster installs (2-3x vs npm, 1.5x vs yarn)
- **Strict**: Prevents phantom dependencies by default
- **Monorepo Support**: Native workspace support with filtering

**Workspace Configuration** (`pnpm-workspace.yaml`):

```yaml
packages:
  - 'packages/*'
  - 'services/*'
  - 'frontend'
```

### 1.3 Turborepo Configuration

**Why Turborepo**:
- **Caching**: Remote caching for CI/CD speedup
- **Parallelization**: Optimal task scheduling
- **Dependency Graph**: Automatic topological ordering
- **Incremental Builds**: Only rebuild what changed

**Configuration** (`turbo.json`):

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env", "tsconfig.json"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "cache": true
    },
    "lint": {
      "cache": true
    },
    "type-check": {
      "dependsOn": ["^build"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## 2. @clenergize/types

### 2.1 Purpose

Single source of truth for TypeScript types shared between frontend and backend. Ensures API contracts are type-safe and prevents drift between services.

### 2.2 Package Structure

```typescript
// packages/types/src/index.ts
export * from './entities';
export * from './dtos';
export * from './enums';
export * from './common';
export * from './api';
```

### 2.3 Entity Types

**User Entity**:

```typescript
// packages/types/src/entities/user.entity.ts
import { UserRole, UserStatus } from '../enums';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roles: UserRole[];
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  cognitoId?: string;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  weekly: boolean;
}
```

**Project Entity**:

```typescript
// packages/types/src/entities/project.entity.ts
import { ProjectStatus, ReportingStandard } from '../enums';

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  reportingYear: number;
  reportingStandard: ReportingStandard;
  hierarchyNodeId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: ProjectMetadata;
}

export interface ProjectMetadata {
  industry?: string;
  country?: string;
  region?: string;
  size?: 'small' | 'medium' | 'large';
  tags?: string[];
}
```

**Activity Data Entity**:

```typescript
// packages/types/src/entities/activity-data.entity.ts
import { ActivityDataStatus, DataQuality, EmissionScope } from '../enums';

export interface ActivityData {
  id: string;
  projectId: string;
  organizationId: string;
  categoryId: string;
  subcategoryId?: string;
  activityType: string;
  value: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  scope: EmissionScope;
  status: ActivityDataStatus;
  dataQuality: DataQuality;
  source?: string;
  uploadedBy: string;
  uploadedAt: Date;
  validatedAt?: Date;
  metadata?: Record<string, any>;
}
```

### 2.4 DTO Types

**Create User DTO**:

```typescript
// packages/types/src/dtos/user/create-user.dto.ts
import { UserRole } from '../../enums';

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roles?: UserRole[];
  password?: string; // Only for non-SSO users
  sendInvite?: boolean;
}

export interface CreateUserResponseDto {
  user: User;
  inviteUrl?: string;
}
```

**Create Project DTO**:

```typescript
// packages/types/src/dtos/project/create-project.dto.ts
import { ReportingStandard } from '../../enums';

export interface CreateProjectDto {
  organizationId: string;
  name: string;
  description?: string;
  reportingYear: number;
  reportingStandard: ReportingStandard;
  hierarchyNodeId: string;
  metadata?: ProjectMetadata;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  metadata?: Partial<ProjectMetadata>;
}
```

**Bulk Activity Upload DTO**:

```typescript
// packages/types/src/dtos/activity/bulk-upload.dto.ts
export interface BulkActivityUploadDto {
  projectId: string;
  file: File | Buffer;
  fileName: string;
  fileType: 'csv' | 'xlsx';
  mappings?: FieldMapping[];
  validateOnly?: boolean;
}

export interface FieldMapping {
  sourceColumn: string;
  targetField: string;
  transform?: 'uppercase' | 'lowercase' | 'trim' | 'number';
}

export interface BulkUploadResultDto {
  totalRows: number;
  successCount: number;
  errorCount: number;
  warnings: ValidationWarning[];
  errors: ValidationError[];
  uploadId: string;
}
```

### 2.5 API Response Types

**Standard Response Wrapper**:

```typescript
// packages/types/src/api/response.types.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  metadata: ResponseMetadata;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
    path?: string;
  };
}

export interface ResponseMetadata {
  timestamp: string;
  version: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}

export interface PaginationMetadata {
  total: number;
  pageSize: number;
  currentCursor?: string;
  nextCursor?: string | null;
  prevCursor?: string | null;
  hasMore: boolean;
}
```

### 2.6 Package Configuration

**package.json**:

```json
{
  "name": "@clenergize/types",
  "version": "1.0.0",
  "description": "Shared TypeScript types for Clenergize V3",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./entities": {
      "import": "./dist/entities/index.mjs",
      "require": "./dist/entities/index.js",
      "types": "./dist/entities/index.d.ts"
    },
    "./dtos": {
      "import": "./dist/dtos/index.mjs",
      "require": "./dist/dtos/index.js",
      "types": "./dist/dtos/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "type-check": "tsc --noEmit",
    "lint": "eslint src",
    "test": "vitest"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
```

**tsconfig.json**:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## 3. @clenergize/contracts

### 3.1 Purpose

Define domain event schemas for event-driven architecture. These contracts ensure all services publish and consume events with consistent schemas.

### 3.2 Event Structure

**Base Event Interface**:

```typescript
// packages/contracts/src/events/base.event.ts
export interface BaseEvent {
  eventId: string;
  eventType: string;
  eventVersion: string;
  timestamp: string;
  correlationId: string;
  causationId?: string;
  aggregateId: string;
  aggregateType: string;
  metadata?: EventMetadata;
}

export interface EventMetadata {
  userId?: string;
  organizationId?: string;
  requestId?: string;
  source: string;
  environment: 'development' | 'staging' | 'production';
}
```

### 3.3 Identity Context Events

**User Events**:

```typescript
// packages/contracts/src/events/identity/user-created.event.ts
import { BaseEvent } from '../base.event';
import { UserRole, UserStatus } from '@clenergize/types';

export interface UserCreatedEvent extends BaseEvent {
  eventType: 'Identity.User.Created';
  eventVersion: '1.0.0';
  aggregateType: 'User';
  payload: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    roles: UserRole[];
    status: UserStatus;
    createdBy: string;
  };
}

export interface UserAuthenticatedEvent extends BaseEvent {
  eventType: 'Identity.User.Authenticated';
  eventVersion: '1.0.0';
  aggregateType: 'User';
  payload: {
    userId: string;
    email: string;
    authMethod: 'cognito' | 'sso' | 'password';
    ipAddress: string;
    userAgent: string;
  };
}

export interface UserRoleAssignedEvent extends BaseEvent {
  eventType: 'Identity.User.RoleAssigned';
  eventVersion: '1.0.0';
  aggregateType: 'User';
  payload: {
    userId: string;
    role: UserRole;
    assignedBy: string;
  };
}

export interface UserDeactivatedEvent extends BaseEvent {
  eventType: 'Identity.User.Deactivated';
  eventVersion: '1.0.0';
  aggregateType: 'User';
  payload: {
    userId: string;
    reason: string;
    deactivatedBy: string;
  };
}
```

### 3.4 Organization Context Events

**Project Events**:

```typescript
// packages/contracts/src/events/organization/project-created.event.ts
import { BaseEvent } from '../base.event';
import { ReportingStandard } from '@clenergize/types';

export interface ProjectCreatedEvent extends BaseEvent {
  eventType: 'Organization.Project.Created';
  eventVersion: '1.0.0';
  aggregateType: 'Project';
  payload: {
    projectId: string;
    organizationId: string;
    name: string;
    reportingYear: number;
    reportingStandard: ReportingStandard;
    hierarchyNodeId: string;
    createdBy: string;
  };
}

export interface HierarchyModifiedEvent extends BaseEvent {
  eventType: 'Organization.Hierarchy.Modified';
  eventVersion: '1.0.0';
  aggregateType: 'Hierarchy';
  payload: {
    hierarchyId: string;
    organizationId: string;
    modificationType: 'node_added' | 'node_removed' | 'node_moved' | 'node_renamed';
    nodeId: string;
    parentNodeId?: string;
    nodePath: string;
    modifiedBy: string;
  };
}
```

### 3.5 Activity Context Events

```typescript
// packages/contracts/src/events/activity/data-ingested.event.ts
import { BaseEvent } from '../base.event';
import { DataQuality, EmissionScope } from '@clenergize/types';

export interface DataIngestedEvent extends BaseEvent {
  eventType: 'Activity.Data.Ingested';
  eventVersion: '1.0.0';
  aggregateType: 'ActivityData';
  payload: {
    activityDataId: string;
    projectId: string;
    organizationId: string;
    categoryId: string;
    value: number;
    unit: string;
    scope: EmissionScope;
    dataQuality: DataQuality;
    uploadedBy: string;
  };
}

export interface ValidationFailedEvent extends BaseEvent {
  eventType: 'Activity.Validation.Failed';
  eventVersion: '1.0.0';
  aggregateType: 'ActivityData';
  payload: {
    activityDataId: string;
    projectId: string;
    validationErrors: Array<{
      field: string;
      error: string;
      value: any;
    }>;
    uploadedBy: string;
  };
}

export interface BulkUploadCompletedEvent extends BaseEvent {
  eventType: 'Activity.BulkUpload.Completed';
  eventVersion: '1.0.0';
  aggregateType: 'BulkUpload';
  payload: {
    uploadId: string;
    projectId: string;
    totalRows: number;
    successCount: number;
    errorCount: number;
    uploadedBy: string;
  };
}
```

### 3.6 Calculation Context Events

```typescript
// packages/contracts/src/events/calculation/emission-calculated.event.ts
import { BaseEvent } from '../base.event';

export interface EmissionCalculatedEvent extends BaseEvent {
  eventType: 'Calculation.Emission.Calculated';
  eventVersion: '1.0.0';
  aggregateType: 'Emission';
  payload: {
    calculationId: string;
    activityDataId: string;
    projectId: string;
    emissionFactorId: string;
    co2e: number;
    co2: number;
    ch4: number;
    n2o: number;
    uncertaintyPercentage: number;
    calculatedAt: string;
  };
}

export interface RollupCompletedEvent extends BaseEvent {
  eventType: 'Calculation.Rollup.Completed';
  eventVersion: '1.0.0';
  aggregateType: 'Rollup';
  payload: {
    rollupId: string;
    projectId: string;
    hierarchyNodeId: string;
    scope: 1 | 2 | 3;
    totalCo2e: number;
    childNodeCount: number;
    activityCount: number;
    calculatedAt: string;
  };
}
```

### 3.7 Event Registry

**Type-Safe Event Registry**:

```typescript
// packages/contracts/src/events/registry.ts
import { UserCreatedEvent, UserAuthenticatedEvent } from './identity';
import { ProjectCreatedEvent, HierarchyModifiedEvent } from './organization';
import { DataIngestedEvent, ValidationFailedEvent } from './activity';
import { EmissionCalculatedEvent, RollupCompletedEvent } from './calculation';

export type DomainEvent =
  // Identity events (12 total)
  | UserCreatedEvent
  | UserAuthenticatedEvent
  | UserRoleAssignedEvent
  | UserDeactivatedEvent
  // Organization events (18 total)
  | ProjectCreatedEvent
  | ProjectUpdatedEvent
  | ProjectClosedEvent
  | HierarchyModifiedEvent
  | OrganizationCreatedEvent
  // Reference events (8 total)
  | EmissionFactorUpdatedEvent
  | EmissionFactorDeprecatedEvent
  // Activity events (22 total)
  | DataIngestedEvent
  | DataValidatedEvent
  | ValidationFailedEvent
  | BulkUploadStartedEvent
  | BulkUploadCompletedEvent
  | BulkUploadFailedEvent
  // Calculation events (18 total)
  | EmissionCalculatedEvent
  | CalculationFailedEvent
  | RollupStartedEvent
  | RollupCompletedEvent
  | RollupFailedEvent
  // Reporting events (10 total)
  | ReportGeneratedEvent
  | ReportExportedEvent
  | ReportScheduledEvent
  // Audit events (4 total)
  | AuditLogCreatedEvent
  | ComplianceCheckCompletedEvent;

export const EVENT_TYPES = {
  // Identity
  USER_CREATED: 'Identity.User.Created',
  USER_AUTHENTICATED: 'Identity.User.Authenticated',
  USER_ROLE_ASSIGNED: 'Identity.User.RoleAssigned',
  USER_DEACTIVATED: 'Identity.User.Deactivated',

  // Organization
  PROJECT_CREATED: 'Organization.Project.Created',
  PROJECT_UPDATED: 'Organization.Project.Updated',
  HIERARCHY_MODIFIED: 'Organization.Hierarchy.Modified',

  // Activity
  DATA_INGESTED: 'Activity.Data.Ingested',
  VALIDATION_FAILED: 'Activity.Validation.Failed',
  BULK_UPLOAD_COMPLETED: 'Activity.BulkUpload.Completed',

  // Calculation
  EMISSION_CALCULATED: 'Calculation.Emission.Calculated',
  ROLLUP_COMPLETED: 'Calculation.Rollup.Completed'
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];
```

### 3.8 Event Versioning Strategy

```typescript
// packages/contracts/src/events/versioning.ts
export interface EventUpgrader<TOld, TNew> {
  fromVersion: string;
  toVersion: string;
  upgrade(oldEvent: TOld): TNew;
}

// Example: Upgrading UserCreatedEvent from v1.0.0 to v1.1.0
export class UserCreatedEventUpgrader implements EventUpgrader<UserCreatedEventV1, UserCreatedEventV1_1> {
  fromVersion = '1.0.0';
  toVersion = '1.1.0';

  upgrade(oldEvent: UserCreatedEventV1): UserCreatedEventV1_1 {
    return {
      ...oldEvent,
      eventVersion: '1.1.0',
      payload: {
        ...oldEvent.payload,
        preferences: {
          theme: 'auto',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            inApp: true,
            weekly: false
          }
        }
      }
    };
  }
}
```

### 3.9 Package Configuration

```json
{
  "name": "@clenergize/contracts",
  "version": "1.0.0",
  "description": "Domain event contracts for Clenergize V3",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./events": {
      "import": "./dist/events/index.mjs",
      "require": "./dist/events/index.js",
      "types": "./dist/events/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "type-check": "tsc --noEmit",
    "test": "vitest"
  },
  "dependencies": {
    "@clenergize/types": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## 4. @clenergize/validators

### 4.1 Purpose

Provide Zod validation schemas that can be used both on the frontend (client-side validation) and backend (server-side validation). Ensures consistent validation rules across the entire application.

### 4.2 Zod Schema Design

**Why Zod**:
- Type inference (schemas generate TypeScript types automatically)
- Runtime validation
- Composable schemas
- Excellent error messages
- Small bundle size (~8KB minified)

### 4.3 Entity Validators

**User Validators**:

```typescript
// packages/validators/src/entities/user.validator.ts
import { z } from 'zod';
import { UserRole, UserStatus } from '@clenergize/types';

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const userSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  organizationId: z.string().uuid(),
  roles: z.array(z.nativeEnum(UserRole)).min(1, 'At least one role is required'),
  status: z.nativeEnum(UserStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
  cognitoId: z.string().optional(),
  lastLoginAt: z.date().optional()
});

export const createUserSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  organizationId: z.string().uuid(),
  roles: z.array(z.nativeEnum(UserRole)).optional().default([UserRole.VIEWER]),
  password: passwordSchema.optional(),
  sendInvite: z.boolean().optional().default(true)
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  roles: z.array(z.nativeEnum(UserRole)).optional(),
  status: z.nativeEnum(UserStatus).optional()
});

// Type inference
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

**Project Validators**:

```typescript
// packages/validators/src/entities/project.validator.ts
import { z } from 'zod';
import { ProjectStatus, ReportingStandard } from '@clenergize/types';

export const projectSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(200, 'Project name must not exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  status: z.nativeEnum(ProjectStatus),
  reportingYear: z
    .number()
    .int()
    .min(2020, 'Reporting year must be 2020 or later')
    .max(2100, 'Invalid reporting year'),
  reportingStandard: z.nativeEnum(ReportingStandard),
  hierarchyNodeId: z.string().uuid(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const createProjectSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(3).max(200).trim(),
  description: z.string().max(2000).optional(),
  reportingYear: z.number().int().min(2020).max(2100),
  reportingStandard: z.nativeEnum(ReportingStandard),
  hierarchyNodeId: z.string().uuid()
});

export const updateProjectSchema = z.object({
  name: z.string().min(3).max(200).trim().optional(),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(ProjectStatus).optional()
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
```

**Activity Data Validators**:

```typescript
// packages/validators/src/entities/activity-data.validator.ts
import { z } from 'zod';
import { EmissionScope, DataQuality } from '@clenergize/types';

export const activityDataSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  organizationId: z.string().uuid(),
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid().optional(),
  activityType: z.string().min(1),
  value: z.number().positive('Value must be positive').finite(),
  unit: z.string().min(1),
  startDate: z.date(),
  endDate: z.date(),
  scope: z.nativeEnum(EmissionScope),
  dataQuality: z.nativeEnum(DataQuality),
  source: z.string().max(500).optional(),
  uploadedBy: z.string().uuid(),
  uploadedAt: z.date()
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

export const createActivityDataSchema = z.object({
  projectId: z.string().uuid(),
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid().optional(),
  activityType: z.string().min(1),
  value: z.number().positive().finite(),
  unit: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  scope: z.nativeEnum(EmissionScope),
  dataQuality: z.nativeEnum(DataQuality).default(DataQuality.ESTIMATED),
  source: z.string().max(500).optional()
}).refine(
  (data) => data.endDate >= data.startDate,
  'End date must be after start date'
);

export const bulkUploadSchema = z.object({
  projectId: z.string().uuid(),
  file: z.instanceof(File).or(z.instanceof(Buffer)),
  fileName: z.string().min(1),
  fileType: z.enum(['csv', 'xlsx']),
  validateOnly: z.boolean().optional().default(false)
});

export type CreateActivityDataInput = z.infer<typeof createActivityDataSchema>;
export type BulkUploadInput = z.infer<typeof bulkUploadSchema>;
```

### 4.4 Common Validators

```typescript
// packages/validators/src/common/pagination.validator.ts
import { z } from 'zod';

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  pageSize: z
    .number()
    .int()
    .positive()
    .min(1)
    .max(100)
    .optional()
    .default(20)
});

export const filterSchema = z.object({
  search: z.string().max(200).optional(),
  status: z.string().or(z.array(z.string())).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc')
});

export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
```

### 4.5 Custom Validators

```typescript
// packages/validators/src/common/custom.validator.ts
import { z } from 'zod';

// MongoDB ObjectId validator
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// File size validator
export const fileSizeSchema = (maxSizeInMB: number) =>
  z.number().max(maxSizeInMB * 1024 * 1024, `File size must not exceed ${maxSizeInMB}MB`);

// Phone number validator
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)');

// URL validator
export const urlSchema = z.string().url('Invalid URL format');

// Hex color validator
export const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format');

// Latitude validator
export const latitudeSchema = z
  .number()
  .min(-90, 'Latitude must be between -90 and 90')
  .max(90, 'Latitude must be between -90 and 90');

// Longitude validator
export const longitudeSchema = z
  .number()
  .min(-180, 'Longitude must be between -180 and 180')
  .max(180, 'Longitude must be between -180 and 180');
```

### 4.6 Usage Examples

**Backend (NestJS)**:

```typescript
// In NestJS controller
import { createUserSchema } from '@clenergize/validators';
import { ZodValidationPipe } from '@anatine/zod-nestjs';

@Post()
async createUser(
  @Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto
) {
  return this.userService.create(dto);
}
```

**Frontend (React Hook Form)**:

```typescript
// In React component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, type CreateProjectInput } from '@clenergize/validators';

export function ProjectForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema)
  });

  const onSubmit = (data: CreateProjectInput) => {
    // Data is validated and type-safe
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

### 4.7 Package Configuration

```json
{
  "name": "@clenergize/validators",
  "version": "1.0.0",
  "description": "Zod validation schemas for Clenergize V3",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest"
  },
  "dependencies": {
    "@clenergize/types": "workspace:*",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## 5. @clenergize/errors

### 5.1 Purpose

Standardized error handling across all services with consistent error codes, messages, and HTTP status mappings.

### 5.2 Base Error Classes

```typescript
// packages/errors/src/base/application.error.ts
export abstract class ApplicationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, any>
  ) {
    super(message);

    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      details: this.details
    };
  }
}
```

### 5.3 Domain Error Classes

**Validation Errors**:

```typescript
// packages/errors/src/domain/validation.error.ts
import { ApplicationError } from '../base/application.error';

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, true, details);
  }
}

export class InvalidInputError extends ValidationError {
  constructor(field: string, value: any, reason: string) {
    super(`Invalid input for field '${field}': ${reason}`, {
      field,
      value,
      reason
    });
    this.code = 'INVALID_INPUT';
  }
}

export class MissingRequiredFieldError extends ValidationError {
  constructor(field: string) {
    super(`Required field '${field}' is missing`, { field });
    this.code = 'MISSING_REQUIRED_FIELD';
  }
}
```

**Not Found Errors**:

```typescript
// packages/errors/src/domain/not-found.error.ts
import { ApplicationError } from '../base/application.error';

export class NotFoundError extends ApplicationError {
  constructor(resource: string, identifier: string) {
    super(
      `${resource} with identifier '${identifier}' not found`,
      'NOT_FOUND',
      404,
      true,
      { resource, identifier }
    );
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(userId: string) {
    super('User', userId);
    this.code = 'USER_NOT_FOUND';
  }
}

export class ProjectNotFoundError extends NotFoundError {
  constructor(projectId: string) {
    super('Project', projectId);
    this.code = 'PROJECT_NOT_FOUND';
  }
}
```

**Authorization Errors**:

```typescript
// packages/errors/src/domain/authorization.error.ts
import { ApplicationError } from '../base/application.error';

export class AuthorizationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, details);
  }
}

export class InsufficientPermissionsError extends AuthorizationError {
  constructor(requiredPermission: string) {
    super(`Insufficient permissions. Required: ${requiredPermission}`, {
      requiredPermission
    });
    this.code = 'INSUFFICIENT_PERMISSIONS';
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401, true);
  }
}
```

**Business Logic Errors**:

```typescript
// packages/errors/src/domain/business.error.ts
import { ApplicationError } from '../base/application.error';

export class BusinessRuleViolationError extends ApplicationError {
  constructor(rule: string, details?: Record<string, any>) {
    super(`Business rule violated: ${rule}`, 'BUSINESS_RULE_VIOLATION', 422, true, details);
  }
}

export class DuplicateResourceError extends ApplicationError {
  constructor(resource: string, field: string, value: any) {
    super(
      `${resource} with ${field} '${value}' already exists`,
      'DUPLICATE_RESOURCE',
      409,
      true,
      { resource, field, value }
    );
  }
}

export class InvalidStateTransitionError extends BusinessRuleViolationError {
  constructor(from: string, to: string) {
    super(`Invalid state transition from '${from}' to '${to}'`, {
      fromState: from,
      toState: to
    });
    this.code = 'INVALID_STATE_TRANSITION';
  }
}
```

### 5.4 Error Codes Registry

```typescript
// packages/errors/src/codes.ts
export const ERROR_CODES = {
  // Validation (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',

  // Authentication (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Authorization (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Not Found (404)
  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  ORGANIZATION_NOT_FOUND: 'ORGANIZATION_NOT_FOUND',

  // Conflict (409)
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',

  // Business Rules (422)
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',

  // Internal (500)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
```

### 5.5 Error Handler Utilities

```typescript
// packages/errors/src/handlers/error-handler.ts
import { ApplicationError } from '../base/application.error';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}

export function formatError(
  error: Error | ApplicationError,
  requestId: string
): ErrorResponse {
  if (error instanceof ApplicationError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp.toISOString(),
        requestId
      }
    };
  }

  // Unknown error - don't expose details
  return {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId
    }
  };
}

export function isOperationalError(error: Error): boolean {
  if (error instanceof ApplicationError) {
    return error.isOperational;
  }
  return false;
}
```

### 5.6 Package Configuration

```json
{
  "name": "@clenergize/errors",
  "version": "1.0.0",
  "description": "Standardized error handling for Clenergize V3",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## 6. @clenergize/utils

### 6.1 Purpose

Collection of utility functions used across frontend and backend for common operations (date formatting, string manipulation, number formatting, etc.).

### 6.2 Date Utilities

```typescript
// packages/utils/src/date/format.ts
import { format, parseISO, isValid, differenceInDays } from 'date-fns';

export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) {
    throw new Error(`Invalid date: ${date}`);
  }
  return format(dateObj, formatStr);
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
}

export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const days = differenceInDays(now, dateObj);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function getFinancialYear(date: Date, startMonth: number = 4): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= startMonth ? year : year - 1;
}

export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}
```

### 6.3 String Utilities

```typescript
// packages/utils/src/string/format.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}
```

### 6.4 Number Utilities

```typescript
// packages/utils/src/number/format.ts
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('en-US', options).format(value);
}

export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatEmission(co2e: number): string {
  if (co2e < 1000) return `${co2e.toFixed(2)} kg CO₂e`;
  if (co2e < 1000000) return `${(co2e / 1000).toFixed(2)} tonnes CO₂e`;
  return `${(co2e / 1000000).toFixed(2)} Mt CO₂e`;
}

export function roundToDecimalPlaces(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

### 6.5 Object Utilities

```typescript
// packages/utils/src/object/helpers.ts
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as any;

  const clonedObj = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

export function groupBy<T>(
  array: T[],
  keyGetter: (item: T) => string | number
): Record<string | number, T[]> {
  return array.reduce((result, item) => {
    const key = keyGetter(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<string | number, T[]>);
}
```

### 6.6 Crypto Utilities

```typescript
// packages/utils/src/crypto/hash.ts
import crypto from 'crypto';

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const saltValue = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, saltValue, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: saltValue };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function hashData(data: string, algorithm: string = 'sha256'): string {
  return crypto.createHash(algorithm).update(data).digest('hex');
}
```

### 6.7 Package Configuration

```json
{
  "name": "@clenergize/utils",
  "version": "1.0.0",
  "description": "Utility functions for Clenergize V3",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest"
  },
  "dependencies": {
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## 7. @clenergize/constants

### 7.1 Purpose

Central repository for enums, constants, and configuration values used across the application.

### 7.2 Enumerations

```typescript
// packages/constants/src/enums.ts

// User-related enums
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  MANAGER = 'MANAGER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

// Project-related enums
export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum ReportingStandard {
  GHG_PROTOCOL = 'GHG_PROTOCOL',
  ISO_14064 = 'ISO_14064',
  CDP = 'CDP',
  TCFD = 'TCFD',
  GRI = 'GRI',
  SASB = 'SASB'
}

// Emission-related enums
export enum EmissionScope {
  SCOPE_1 = 'SCOPE_1',
  SCOPE_2 = 'SCOPE_2',
  SCOPE_3 = 'SCOPE_3'
}

export enum Scope3Category {
  PURCHASED_GOODS = 'PURCHASED_GOODS',
  CAPITAL_GOODS = 'CAPITAL_GOODS',
  FUEL_ENERGY = 'FUEL_ENERGY',
  UPSTREAM_TRANSPORT = 'UPSTREAM_TRANSPORT',
  WASTE = 'WASTE',
  BUSINESS_TRAVEL = 'BUSINESS_TRAVEL',
  EMPLOYEE_COMMUTING = 'EMPLOYEE_COMMUTING',
  UPSTREAM_LEASED_ASSETS = 'UPSTREAM_LEASED_ASSETS',
  DOWNSTREAM_TRANSPORT = 'DOWNSTREAM_TRANSPORT',
  PROCESSING_SOLD_PRODUCTS = 'PROCESSING_SOLD_PRODUCTS',
  USE_SOLD_PRODUCTS = 'USE_SOLD_PRODUCTS',
  END_OF_LIFE = 'END_OF_LIFE',
  DOWNSTREAM_LEASED_ASSETS = 'DOWNSTREAM_LEASED_ASSETS',
  FRANCHISES = 'FRANCHISES',
  INVESTMENTS = 'INVESTMENTS'
}

export enum DataQuality {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  ESTIMATED = 'ESTIMATED',
  PROXY = 'PROXY'
}

export enum ActivityDataStatus {
  DRAFT = 'DRAFT',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED'
}

// Report-related enums
export enum ReportType {
  INVENTORY = 'INVENTORY',
  FOOTPRINT = 'FOOTPRINT',
  COMPARISON = 'COMPARISON',
  TREND = 'TREND',
  CUSTOM = 'CUSTOM'
}

export enum ReportFormat {
  PDF = 'PDF',
  XLSX = 'XLSX',
  CSV = 'CSV',
  JSON = 'JSON'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}
```

### 7.3 Application Constants

```typescript
// packages/constants/src/config.ts

export const APP_CONFIG = {
  NAME: 'Clenergize V3',
  VERSION: '3.0.0',
  API_VERSION: 'v1',
  SUPPORT_EMAIL: 'support@clenergize.com',
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_TIMEZONE: 'UTC'
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1
} as const;

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  ALLOWED_EXTENSIONS: ['.csv', '.xlsx', '.xls']
} as const;

export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const;

export const RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  SKIP_SUCCESSFUL_REQUESTS: false
} as const;

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '30d',
  ALGORITHM: 'RS256' as const
} as const;
```

### 7.4 Validation Regular Expressions

```typescript
// packages/constants/src/regex.ts

export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  PASSWORD: {
    MIN_LENGTH: /.{8,}/,
    UPPERCASE: /[A-Z]/,
    LOWERCASE: /[a-z]/,
    NUMBER: /[0-9]/,
    SPECIAL: /[^A-Za-z0-9]/
  },

  PHONE: {
    E164: /^\+?[1-9]\d{1,14}$/,
    US: /^(\+1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
  },

  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,

  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,

  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

  MONGODB_OBJECTID: /^[0-9a-fA-F]{24}$/,

  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  ISO_DATE: /^\d{4}-\d{2}-\d{2}$/,

  ISO_DATETIME: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
} as const;
```

### 7.5 HTTP Status Codes

```typescript
// packages/constants/src/http-status.ts

export const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
```

### 7.6 Package Configuration

```json
{
  "name": "@clenergize/constants",
  "version": "1.0.0",
  "description": "Constants and enums for Clenergize V3",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0"
  }
}
```

---

## 8. @clenergize/api-client (Frontend Only)

### 8.1 Purpose

Type-safe API client for frontend to communicate with backend services. Provides automatic error handling, retries, and type inference.

### 8.2 Base Client

```typescript
// packages/api-client/src/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ApiResponse, ApiErrorResponse } from '@clenergize/types';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
  getAccessToken?: () => string | null;
  onUnauthorized?: () => void;
}

export class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      withCredentials: config.withCredentials !== false,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.config.getAccessToken?.();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          this.config.onUnauthorized?.();
        }
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private transformError(error: AxiosError<ApiErrorResponse>): Error {
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      const err = new Error(apiError.message);
      (err as any).code = apiError.code;
      (err as any).details = apiError.details;
      return err;
    }
    return error;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }
}
```

### 8.3 Endpoint Methods

**Users API**:

```typescript
// packages/api-client/src/endpoints/users.ts
import { ApiClient } from '../client';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  PaginatedResponse,
  CursorPaginationInput
} from '@clenergize/types';

export class UsersApi {
  constructor(private client: ApiClient) {}

  async getUsers(params?: CursorPaginationInput): Promise<PaginatedResponse<User>> {
    return this.client.get('/api/v1/users', { params });
  }

  async getUserById(id: string): Promise<User> {
    return this.client.get(`/api/v1/users/${id}`);
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.client.post('/api/v1/users', data);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.client.patch(`/api/v1/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<void> {
    return this.client.delete(`/api/v1/users/${id}`);
  }

  async assignRole(userId: string, role: string): Promise<User> {
    return this.client.post(`/api/v1/users/${userId}/roles`, { role });
  }
}
```

**Projects API**:

```typescript
// packages/api-client/src/endpoints/projects.ts
import { ApiClient } from '../client';
import {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  PaginatedResponse
} from '@clenergize/types';

export class ProjectsApi {
  constructor(private client: ApiClient) {}

  async getProjects(organizationId: string): Promise<PaginatedResponse<Project>> {
    return this.client.get('/api/v1/projects', {
      params: { organizationId }
    });
  }

  async getProjectById(id: string): Promise<Project> {
    return this.client.get(`/api/v1/projects/${id}`);
  }

  async createProject(data: CreateProjectDto): Promise<Project> {
    return this.client.post('/api/v1/projects', data);
  }

  async updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
    return this.client.patch(`/api/v1/projects/${id}`, data);
  }

  async deleteProject(id: string): Promise<void> {
    return this.client.delete(`/api/v1/projects/${id}`);
  }

  async closeProject(id: string): Promise<Project> {
    return this.client.post(`/api/v1/projects/${id}/close`);
  }
}
```

### 8.4 Main API Client Instance

```typescript
// packages/api-client/src/index.ts
import { ApiClient } from './client';
import { UsersApi } from './endpoints/users';
import { ProjectsApi } from './endpoints/projects';
import { ActivityDataApi } from './endpoints/activity-data';
import { EmissionsApi } from './endpoints/emissions';
import { ReportsApi } from './endpoints/reports';

export class ClenergizeApiClient {
  public users: UsersApi;
  public projects: ProjectsApi;
  public activityData: ActivityDataApi;
  public emissions: EmissionsApi;
  public reports: ReportsApi;

  constructor(config: ApiClientConfig) {
    const client = new ApiClient(config);

    this.users = new UsersApi(client);
    this.projects = new ProjectsApi(client);
    this.activityData = new ActivityDataApi(client);
    this.emissions = new EmissionsApi(client);
    this.reports = new ReportsApi(client);
  }
}

// Usage in frontend:
// const api = new ClenergizeApiClient({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   getAccessToken: () => localStorage.getItem('accessToken'),
//   onUnauthorized: () => router.push('/login')
// });
//
// const users = await api.users.getUsers({ pageSize: 20 });
// const project = await api.projects.getProjectById('123');
```

### 8.5 Package Configuration

```json
{
  "name": "@clenergize/api-client",
  "version": "1.0.0",
  "description": "Type-safe API client for Clenergize V3 frontend",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest"
  },
  "dependencies": {
    "@clenergize/types": "workspace:*",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## 9. @clenergize/test-utils (Dev Dependency)

### 9.1 Purpose

Testing utilities, mock data generators, and factories for consistent test data across all services.

### 9.2 Entity Factories

```typescript
// packages/test-utils/src/factories/user.factory.ts
import { User, UserRole, UserStatus } from '@clenergize/types';
import { faker } from '@faker-js/faker';

export class UserFactory {
  static create(overrides?: Partial<User>): User {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      organizationId: faker.string.uuid(),
      roles: [UserRole.VIEWER],
      status: UserStatus.ACTIVE,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides
    };
  }

  static createMany(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createAdmin(overrides?: Partial<User>): User {
    return this.create({
      roles: [UserRole.ORG_ADMIN],
      ...overrides
    });
  }
}
```

**Project Factory**:

```typescript
// packages/test-utils/src/factories/project.factory.ts
import { Project, ProjectStatus, ReportingStandard } from '@clenergize/types';
import { faker } from '@faker-js/faker';

export class ProjectFactory {
  static create(overrides?: Partial<Project>): Project {
    return {
      id: faker.string.uuid(),
      organizationId: faker.string.uuid(),
      name: faker.company.name() + ' Carbon Project',
      description: faker.lorem.sentence(),
      status: ProjectStatus.ACTIVE,
      reportingYear: 2024,
      reportingStandard: ReportingStandard.GHG_PROTOCOL,
      hierarchyNodeId: faker.string.uuid(),
      createdBy: faker.string.uuid(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides
    };
  }

  static createMany(count: number, overrides?: Partial<Project>): Project[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
```

### 9.3 Mock Data Generators

```typescript
// packages/test-utils/src/mocks/emission-data.mock.ts
import { ActivityData, EmissionScope, DataQuality } from '@clenergize/types';
import { faker } from '@faker-js/faker';

export class EmissionDataMock {
  static generateActivityData(count: number = 100): ActivityData[] {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      projectId: faker.string.uuid(),
      organizationId: faker.string.uuid(),
      categoryId: faker.string.uuid(),
      activityType: faker.helpers.arrayElement(['electricity', 'natural_gas', 'fuel', 'transport']),
      value: faker.number.float({ min: 1, max: 10000, precision: 0.01 }),
      unit: faker.helpers.arrayElement(['kWh', 'm3', 'liters', 'km']),
      startDate: faker.date.past(),
      endDate: faker.date.recent(),
      scope: faker.helpers.enumValue(EmissionScope),
      status: ActivityDataStatus.VALIDATED,
      dataQuality: faker.helpers.enumValue(DataQuality),
      uploadedBy: faker.string.uuid(),
      uploadedAt: faker.date.recent()
    }));
  }
}
```

### 9.4 Test Helpers

```typescript
// packages/test-utils/src/helpers/date.helper.ts
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function createDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function freezeTime(date: Date): () => void {
  const originalNow = Date.now;
  const frozenTime = date.getTime();

  Date.now = () => frozenTime;
  global.Date = class extends Date {
    constructor() {
      super();
      return new Date(frozenTime);
    }
  } as any;

  // Return cleanup function
  return () => {
    Date.now = originalNow;
    global.Date = Date;
  };
}
```

### 9.5 API Mocking Helpers

```typescript
// packages/test-utils/src/mocks/api.mock.ts
import { rest } from 'msw';
import { ApiResponse } from '@clenergize/types';

export function createMockHandler<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  path: string,
  data: T,
  status: number = 200
) {
  return rest[method](path, (req, res, ctx) => {
    const response: ApiResponse<T> = {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId: 'mock-request-id'
      }
    };

    return res(ctx.status(status), ctx.json(response));
  });
}

// Usage:
// const handlers = [
//   createMockHandler('get', '/api/v1/users', UserFactory.createMany(10)),
//   createMockHandler('post', '/api/v1/projects', ProjectFactory.create())
// ];
```

### 9.6 Package Configuration

```json
{
  "name": "@clenergize/test-utils",
  "version": "1.0.0",
  "description": "Testing utilities for Clenergize V3",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
  },
  "dependencies": {
    "@clenergize/types": "workspace:*",
    "@faker-js/faker": "^8.3.0",
    "msw": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0"
  }
}
```

---

## 10. Build & Publishing Strategy

### 10.1 Root Package Configuration

```json
{
  "name": "clenergize-v3-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "services/*",
    "frontend"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "publish-packages": "changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "turbo": "^1.11.0",
    "typescript": "^5.3.0",
    "prettier": "^3.1.0",
    "eslint": "^8.55.0"
  },
  "packageManager": "pnpm@8.12.0"
}
```

### 10.2 Changesets for Version Management

**Why Changesets**:
- Semantic versioning automation
- Changelog generation
- Coordinate releases across multiple packages
- CI/CD integration

**Configuration** (`.changeset/config.json`):

```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [["@clenergize/*"]],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

**Creating a Changeset**:

```bash
# Developer runs this after making changes
pnpm changeset

# Prompts:
# - Which packages changed? (@clenergize/types)
# - What type of change? (major, minor, patch)
# - Summary: "Add ProjectMetadata interface"

# Creates .changeset/random-name.md
```

**Releasing Packages**:

```bash
# Update versions and generate changelogs
pnpm version-packages

# Publish to npm registry
pnpm publish-packages
```

### 10.3 Semantic Versioning Strategy

**Version Bumps**:
- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features (backward compatible)
- **Patch** (1.0.0 → 1.0.1): Bug fixes

**Breaking Change Policy**:
```typescript
// Before (v1.0.0)
export interface User {
  name: string;
}

// Breaking change - remove field (v2.0.0)
export interface User {
  firstName: string; // ❌ Breaking: 'name' removed
  lastName: string;
}

// Non-breaking change - add optional field (v1.1.0)
export interface User {
  name: string;
  email?: string; // ✅ Non-breaking: optional field
}
```

### 10.4 Dependency Management

**Workspace Protocol**:

```json
{
  "dependencies": {
    "@clenergize/types": "workspace:*",
    "@clenergize/validators": "workspace:^1.0.0"
  }
}
```

**Update All Packages**:

```bash
# Update all dependencies in workspace
pnpm update -r

# Update specific package
pnpm update @clenergize/types -r
```

### 10.5 CI/CD Integration

**GitHub Actions Workflow**:

```yaml
name: Publish Packages

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v2
        with:
          version: 8.12.0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build --filter='@clenergize/*'

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm publish-packages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 11. Usage Examples

### 11.1 Backend Service Usage

**Identity Service Example**:

```typescript
// services/identity-service/src/application/commands/create-user.handler.ts
import { CreateUserDto } from '@clenergize/types';
import { createUserSchema } from '@clenergize/validators';
import { UserCreatedEvent } from '@clenergize/contracts';
import { ValidationError, DuplicateResourceError } from '@clenergize/errors';
import { generateUUID } from '@clenergize/utils';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler {
  async execute(command: CreateUserCommand): Promise<User> {
    // Validate input
    const validatedData = createUserSchema.parse(command.data);

    // Check for duplicates
    const existing = await this.userRepo.findByEmail(validatedData.email);
    if (existing) {
      throw new DuplicateResourceError('User', 'email', validatedData.email);
    }

    // Create user
    const user = User.create(
      new Email(validatedData.email),
      validatedData.firstName,
      validatedData.lastName,
      validatedData.organizationId,
      validatedData.roles
    );

    // Save
    const savedUser = await this.userRepo.save(user);

    // Publish event
    const event: UserCreatedEvent = {
      eventId: generateUUID(),
      eventType: 'Identity.User.Created',
      eventVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      correlationId: command.correlationId,
      aggregateId: savedUser.id,
      aggregateType: 'User',
      payload: {
        userId: savedUser.id,
        email: savedUser.email.value,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        organizationId: savedUser.organizationId,
        roles: savedUser.roles,
        status: savedUser.status,
        createdBy: command.createdBy
      }
    };

    await this.eventBus.publish(event);

    return savedUser;
  }
}
```

### 11.2 Frontend Usage

**Project Form Component**:

```typescript
// frontend/src/components/forms/project-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, type CreateProjectInput } from '@clenergize/validators';
import { ReportingStandard } from '@clenergize/constants';
import { formatDate } from '@clenergize/utils';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function ProjectForm({ organizationId }: { organizationId: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      organizationId,
      reportingYear: new Date().getFullYear()
    }
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProjectInput) => api.projects.createProject(data),
    onSuccess: (project) => {
      console.log('Project created:', project);
      // Redirect or show success message
    }
  });

  const onSubmit = (data: CreateProjectInput) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name">Project Name</label>
        <input
          id="name"
          {...register('name')}
          className="w-full rounded border px-3 py-2"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          {...register('description')}
          className="w-full rounded border px-3 py-2"
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="reportingYear">Reporting Year</label>
        <input
          id="reportingYear"
          type="number"
          {...register('reportingYear', { valueAsNumber: true })}
          className="w-full rounded border px-3 py-2"
        />
        {errors.reportingYear && (
          <p className="text-sm text-red-600">{errors.reportingYear.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="reportingStandard">Reporting Standard</label>
        <select
          id="reportingStandard"
          {...register('reportingStandard')}
          className="w-full rounded border px-3 py-2"
        >
          {Object.values(ReportingStandard).map((standard) => (
            <key={standard} value={standard}>
              {standard}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
}
```

---

## 12. Testing Strategy

### 12.1 Unit Testing Shared Packages

```typescript
// packages/validators/src/entities/user.validator.test.ts
import { describe, it, expect } from 'vitest';
import { createUserSchema } from './user.validator';
import { UserRole } from '@clenergize/types';

describe('createUserSchema', () => {
  it('validates valid user data', () => {
    const validData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      organizationId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const invalidData = {
      email: 'not-an-email',
      firstName: 'John',
      lastName: 'Doe',
      organizationId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Invalid email');
    }
  });

  it('applies default roles', () => {
    const data = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      organizationId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const result = createUserSchema.parse(data);
    expect(result.roles).toEqual([UserRole.VIEWER]);
  });
});
```

### 12.2 Integration Testing with Shared Packages

```typescript
// services/identity-service/test/integration/create-user.integration.test.ts
import { UserFactory } from '@clenergize/test-utils';
import { createUserSchema } from '@clenergize/validators';
import { UserCreatedEvent } from '@clenergize/contracts';

describe('Create User Integration', () => {
  it('creates user and publishes event', async () => {
    const userData = UserFactory.create();

    // Validate with shared schema
    const validatedData = createUserSchema.parse(userData);

    // Create user
    const response = await request(app)
      .post('/api/v1/users')
      .send(validatedData);

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName
    });

    // Verify event was published
    const events = await getPublishedEvents();
    const userCreatedEvent = events.find(
      (e) => e.eventType === 'Identity.User.Created'
    ) as UserCreatedEvent;

    expect(userCreatedEvent).toBeDefined();
    expect(userCreatedEvent.payload.email).toBe(userData.email);
  });
});
```

---

## 13. Performance Considerations

### 13.1 Bundle Size Optimization

**Tree-Shaking**:

```typescript
// ✅ Good - Import only what you need
import { createUserSchema } from '@clenergize/validators/entities/user';

// ❌ Bad - Imports everything
import { createUserSchema } from '@clenergize/validators';
```

**Package Exports Configuration**:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./entities/*": "./dist/entities/*.js",
    "./dtos/*": "./dist/dtos/*.js"
  },
  "sideEffects": false
}
```

### 13.2 Caching Strategy

**Build Cache**:

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "cache": true
    }
  }
}
```

**Remote Cache (Vercel)**:

```bash
# Enable remote caching
turbo link

# Build with remote cache
turbo build --remote-cache
```

---

## 14. Migration Plan from OLD System

### 14.1 Phase 1: Install Shared Packages (Week 1)

```bash
# Create packages directory
mkdir -p packages/{types,contracts,validators,errors,utils,constants}

# Initialize each package
for pkg in types contracts validators errors utils constants; do
  cd packages/$pkg
  pnpm init
  cd ../..
done

# Install in services
cd services/identity-service
pnpm add @clenergize/types@workspace:* @clenergize/validators@workspace:*
```

### 14.2 Phase 2: Migrate Types (Week 2)

1. Extract all TypeScript interfaces from OLD services
2. Consolidate into `@clenergize/types`
3. Remove duplicates and fix inconsistencies
4. Update all services to import from `@clenergize/types`

### 14.3 Phase 3: Add Validation (Week 3)

1. Create Zod schemas for all DTOs
2. Replace manual validation with `@clenergize/validators`
3. Add client-side validation in frontend

### 14.4 Phase 4: Standardize Errors (Week 4)

1. Create error classes in `@clenergize/errors`
2. Replace all `throw new Error()` with custom error classes
3. Update error handling middleware

---

## Summary

This Shared Packages Design provides:

1. **8 Core Packages** covering types, contracts, validation, errors, utils, constants, API client, and test utilities
2. **Monorepo Setup** with PNPM workspaces and Turborepo for optimal build performance
3. **Type Safety** across frontend and backend with shared TypeScript types
4. **Consistent Validation** using Zod schemas on both client and server
5. **Standardized Error Handling** with custom error classes and codes
6. **Event-Driven Architecture** with 92 domain event contracts
7. **Developer Experience** with factories, mocks, and test utilities
8. **Version Management** using Changesets for semantic versioning
9. **Bundle Optimization** with tree-shaking and modular exports
10. **Migration Path** from OLD system to shared packages

### Quick Start

```bash
# Initialize monorepo
mkdir ClenergizeV3 && cd ClenergizeV3
pnpm init

# Create packages
mkdir -p packages/{types,contracts,validators,errors,utils,constants,api-client,test-utils}

# Install Turborepo
pnpm add -D turbo @changesets/cli

# Build all packages
pnpm build

# Develop with watch mode
pnpm dev

# Run tests
pnpm test
```

### Next Steps

1. ✅ **Completed**: Shared Packages Design
2. **Next**: CI/CD Pipeline Templates (final design phase task)
3. **Next**: Begin Sprint 0.1 implementation

---

**Document Complete**: November 18, 2025
**Total Packages**: 8
**Total Lines of Code**: ~2,700 (estimated across all packages)
**Bundle Size** (minified): ~45KB total (tree-shakeable)
