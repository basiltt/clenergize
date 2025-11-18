# Clenergize V3 Project Structure & Repository Organization

## Directory Structure Overview

```
ClenergizeV3/
├── 📁 OLD/                                    # Reference codebase (DO NOT MODIFY)
│   ├── clenergizeV3-backend-ms-dev/         # Gateway + mixed concerns (anti-pattern)
│   ├── clenergizeV3-carbon-footprint-ms-dev/# Calculation service
│   ├── clenergizeV3-companyDetails-ms-dev/  # Company metadata
│   ├── clenergizeV3-frontend-dev/           # Next.js frontend
│   ├── clenergizeV3-master-data-ms-dev/     # Reference data
│   ├── clenergizeV3-project-management-ms-dev/ # Projects & hierarchies
│   ├── clenergizeV3-user-management-ms-dev/ # User & auth
│   └── DESIGN-REVIEW.md                     # Architecture issues
│
├── 📁 NEW/                                    # Clean microservices architecture
│   ├── identity-service/                    # Port 3001 (replaces user-management)
│   ├── organization-service/                # Port 3002 (replaces project-management)
│   ├── reference-service/                   # Port 3003 (replaces master-data)
│   ├── activity-service/                    # Port 3004 (new - separated from carbon)
│   ├── calculation-service/                 # Port 3005 (replaces carbon-footprint)
│   ├── reporting-service/                   # Port 3006 (new - separated from backend)
│   ├── audit-service/                       # Port 3007 (new - compliance & logging)
│   ├── frontend/                            # Port 3000 (rebuilt Next.js app)
│   └── shared/                              # Shared libraries & contracts
│       ├── contracts/                       # Event schemas, API contracts
│       ├── common/                          # Utilities, helpers
│       └── config/                          # Shared configuration
│
├── 📁 .claude/                               # Claude agent configurations
│   ├── agents/                              # Agent-specific contexts
│   └── skills/                              # Custom skills
│
├── 📁 .idea/                                 # IDE settings (IntelliJ/WebStorm)
├── 📁 Docs.zip                              # Project documentation
├── 📁 .gitignore                            # Git ignore rules
├── docker-compose.dev.yml                   # Local development environment
├── docker-compose.prod.yml                  # Production deployment
├── Makefile                                  # Developer commands
└── README.md                                # Project overview
```

## Service Mapping: OLD → NEW

### 1. User Management → Identity Service

**OLD Path**: `OLD/clenergizeV3-user-management-ms-dev/`
**NEW Path**: `NEW/identity-service/`

```yaml
Mapping:
  OLD Modules:
    - user.module (registration, profile)
    - auth flows (Cognito integration)
    - legacy migration
    
  NEW Structure:
    identity-service/
    ├── src/
    │   ├── domain/
    │   │   ├── user/
    │   │   ├── authentication/
    │   │   └── authorization/
    │   ├── infrastructure/
    │   │   ├── cognito/
    │   │   └── database/
    │   └── application/
    │       ├── commands/
    │       └── queries/
```

### 2. Project Management → Organization Service

**OLD Path**: `OLD/clenergizeV3-project-management-ms-dev/`
**NEW Path**: `NEW/organization-service/`

```yaml
Mapping:
  OLD Issues:
    - Cloned hierarchies (CRITICAL)
    - Denormalized data
    - Permission as nested objects
    
  NEW Fixes:
    - Reference-based hierarchies
    - Normalized permissions
    - Event-driven updates
```

### 3. Master Data → Reference Service

**OLD Path**: `OLD/clenergizeV3-master-data-ms-dev/`
**NEW Path**: `NEW/reference-service/`

```yaml
Mapping:
  OLD Components:
    - Emission factors
    - Conversion factors
    - Parameters
    - Energy values
    
  NEW Improvements:
    - Versioned reference data
    - Approval workflows
    - Change tracking
```

### 4. Carbon Footprint → Activity + Calculation Services

**OLD Path**: `OLD/clenergizeV3-carbon-footprint-ms-dev/`
**NEW Paths**: 
- `NEW/activity-service/` (data collection)
- `NEW/calculation-service/` (emissions calc)

```yaml
Split Rationale:
  Activity Service:
    - Data ingestion
    - Validation
    - Import/Export
    
  Calculation Service:
    - Emission calculations
    - Aggregations
    - Roll-ups
```

### 5. Backend MS → Gateway + Reporting Service

**OLD Path**: `OLD/clenergizeV3-backend-ms-dev/`
**NEW Paths**:
- API Gateway (AWS/Kong)
- `NEW/reporting-service/`

```yaml
Decomposition:
  Remove from Backend:
    - V1 calculation modules → calculation-service
    - Result reports → reporting-service
    - Authentication → identity-service
    
  Gateway Only:
    - Request routing
    - Rate limiting
    - CORS
```

### 6. Company Details → Part of Organization Service

**OLD Path**: `OLD/clenergizeV3-companyDetails-ms-dev/`
**NEW Path**: `NEW/organization-service/domain/company/`

```yaml
Integration:
  - Merge into organization context
  - Share database with org service
  - Unified API endpoints
```

### 7. Frontend → Complete Rebuild

**OLD Path**: `OLD/clenergizeV3-frontend-dev/`
**NEW Path**: `NEW/frontend/`

```yaml
Technology Stack:
  OLD:
    - Next.js 15
    - Ant Design 5
    - Redux Toolkit
    
  NEW (keep same):
    - Next.js 15
    - Ant Design 5
    - Redux Toolkit
    - Add: WCAG 2.1 compliance
    - Add: BaseAPIClient pattern
```

## Repository Structure per Service

### Standard Service Structure

```
NEW/[service-name]/
├── src/
│   ├── domain/               # Business logic
│   │   ├── entities/         # Domain models
│   │   ├── events/           # Domain events
│   │   ├── services/         # Domain services
│   │   └── repositories/     # Repository interfaces
│   │
│   ├── application/          # Use cases
│   │   ├── commands/         # Write operations
│   │   ├── queries/          # Read operations
│   │   └── handlers/         # Event handlers
│   │
│   ├── infrastructure/       # External interfaces
│   │   ├── database/         # MongoDB implementations
│   │   ├── messaging/        # EventBridge/SQS
│   │   ├── http/            # REST controllers
│   │   └── external/        # Third-party integrations
│   │
│   └── shared/              # Service-specific shared code
│       ├── decorators/      # Custom decorators
│       ├── filters/         # Exception filters
│       ├── guards/          # Auth guards
│       └── pipes/           # Validation pipes
│
├── test/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                # End-to-end tests
│
├── .env.example            # Environment template
├── .gitignore             # Git ignore
├── Dockerfile             # Production container
├── Dockerfile.dev         # Development container
├── nest-cli.json          # NestJS CLI config
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── README.md              # Service documentation
```

## Shared Libraries Structure

```
NEW/shared/
├── contracts/
│   ├── events/
│   │   ├── identity/
│   │   │   ├── user-created.event.ts
│   │   │   ├── user-authenticated.event.ts
│   │   │   └── role-assigned.event.ts
│   │   ├── organization/
│   │   │   ├── project-created.event.ts
│   │   │   └── hierarchy-modified.event.ts
│   │   └── index.ts
│   │
│   ├── api/
│   │   ├── openapi/
│   │   │   ├── identity-api.yaml
│   │   │   ├── organization-api.yaml
│   │   │   └── reference-api.yaml
│   │   └── types/
│   │       ├── responses.ts
│   │       └── errors.ts
│   │
│   └── package.json
│
├── common/
│   ├── utils/
│   │   ├── id-converter.ts
│   │   ├── date-helper.ts
│   │   └── validation.ts
│   ├── constants/
│   │   ├── modules.ts
│   │   └── permissions.ts
│   └── package.json
│
└── config/
    ├── schemas/
    │   ├── database.schema.ts
    │   ├── aws.schema.ts
    │   └── service.schema.ts
    └── package.json
```

### Shared Packages Setup Instructions

The shared packages provide common functionality across all microservices using NPM workspaces for efficient dependency management.

#### Step 1: Initialize Monorepo Structure

```bash
cd NEW

# Create root package.json with workspaces
cat > package.json << 'EOF'
{
  "name": "clenergize-v3",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "shared/packages/*",
    "services/*"
  ],
  "scripts": {
    "build:shared": "npm run build --workspaces --if-present",
    "test:shared": "npm test --workspaces --if-present",
    "lint": "eslint . --ext .ts,.tsx",
    "clean": "npm run clean --workspaces --if-present"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "typescript": "^5.3.0"
  }
}
EOF

# Create base TypeScript configuration
cat > tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "exclude": ["node_modules", "dist"]
}
EOF

# Create shared packages directory structure
mkdir -p shared/packages/{common,contracts,security,database}
```

#### Step 2: Create @clenergize/common Package

```bash
cd shared/packages/common

# Package configuration
cat > package.json << 'EOF'
{
  "name": "@clenergize/common",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "pino": "^8.16.0",
    "zod": "^3.22.0",
    "nanoid": "^5.0.0",
    "mongodb": "^6.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
EOF

# TypeScript configuration
cat > tsconfig.json << 'EOF'
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
EOF

# Create source structure
mkdir -p src/{logger,errors,utils,types}

# Logger implementation
cat > src/logger/index.ts << 'EOF'
import pino from 'pino';

export interface LoggerConfig {
  serviceName: string;
  level?: string;
  redact?: string[];
}

export const createLogger = (config: LoggerConfig) => {
  return pino({
    name: config.serviceName,
    level: config.level || process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        '*.password',
        '*.token',
        '*.secret',
        ...(config.redact || [])
      ],
      remove: true
    },
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err
    }
  });
};

export type Logger = ReturnType<typeof createLogger>;
EOF

# Error classes
cat > src/errors/index.ts << 'EOF'
export class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context
    };
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, context?: Record<string, any>) {
    super('VALIDATION_ERROR', message, 400, context);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} with id ${id} not found`, 404);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, context?: Record<string, any>) {
    super('CONFLICT', message, 409, context);
  }
}

export class InternalServerError extends DomainError {
  constructor(message: string = 'Internal server error', context?: Record<string, any>) {
    super('INTERNAL_ERROR', message, 500, context);
  }
}
EOF

# Utility functions
cat > src/utils/index.ts << 'EOF'
import { nanoid } from 'nanoid';
import { ObjectId } from 'mongodb';

export const generateId = () => nanoid();

export const toObjectId = (id: string | ObjectId): ObjectId => {
  if (typeof id === 'string') {
    return new ObjectId(id);
  }
  return id;
};

export const isValidObjectId = (id: string): boolean => {
  return ObjectId.isValid(id);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};
EOF

# Main export
cat > src/index.ts << 'EOF'
export * from './logger';
export * from './errors';
export * from './utils';
EOF

# Install and build
npm install
npm run build
```

#### Step 3: Create @clenergize/contracts Package

```bash
cd ../contracts

cat > package.json << 'EOF'
{
  "name": "@clenergize/contracts",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "test": "jest"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
EOF

cat > tsconfig.json << 'EOF'
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
EOF

mkdir -p src/events

# Base event schema
cat > src/events/base.ts << 'EOF'
import { z } from 'zod';

export const BaseEventSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.string(),
  version: z.string().regex(/^\d+\.\d+$/),
  timestamp: z.string().datetime(),
  source: z.string(),
  correlationId: z.string().uuid(),
  metadata: z.object({
    userId: z.string().optional(),
    tenantId: z.string().optional()
  }).optional()
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;
EOF

# Example event schemas
cat > src/events/user.events.ts << 'EOF'
import { z } from 'zod';
import { BaseEventSchema } from './base';

export const UserRegisteredEventSchema = BaseEventSchema.extend({
  eventType: z.literal('UserRegistered'),
  payload: z.object({
    userId: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string()
  })
});

export type UserRegisteredEvent = z.infer<typeof UserRegisteredEventSchema>;

export const UserAuthenticatedEventSchema = BaseEventSchema.extend({
  eventType: z.literal('UserAuthenticated'),
  payload: z.object({
    userId: z.string(),
    sessionId: z.string(),
    ipAddress: z.string()
  })
});

export type UserAuthenticatedEvent = z.infer<typeof UserAuthenticatedEventSchema>;
EOF

cat > src/index.ts << 'EOF'
export * from './events/base';
export * from './events/user.events';
EOF

npm install
npm run build
```

#### Step 4: Create @clenergize/security Package

```bash
cd ../security

cat > package.json << 'EOF'
{
  "name": "@clenergize/security",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "test": "jest"
  },
  "dependencies": {
    "jsonwebtoken": "^9.0.0",
    "jwks-rsa": "^3.0.0",
    "@clenergize/common": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "typescript": "^5.3.0"
  }
}
EOF

cat > tsconfig.json << 'EOF'
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
EOF

mkdir -p src

cat > src/jwt.middleware.ts << 'EOF'
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { UnauthorizedError } from '@clenergize/common';

export interface JWTConfig {
  jwksUri: string;
  issuer: string;
  audience: string;
}

export class JWTVerifier {
  private jwksClient: jwksRsa.JwksClient;

  constructor(private config: JWTConfig) {
    this.jwksClient = jwksRsa({
      jwksUri: config.jwksUri,
      cache: true,
      rateLimit: true
    });
  }

  async verify(token: string) {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || !decoded.header.kid) {
        throw new UnauthorizedError('Invalid token format');
      }

      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const signingKey = key.getPublicKey();

      return jwt.verify(token, signingKey, {
        algorithms: ['RS256'],
        issuer: this.config.issuer,
        audience: this.config.audience
      });
    } catch (error) {
      throw new UnauthorizedError('Token verification failed');
    }
  }
}
EOF

cat > src/index.ts << 'EOF'
export * from './jwt.middleware';
EOF

npm install
npm run build
```

#### Step 5: Create @clenergize/database Package

```bash
cd ../database

cat > package.json << 'EOF'
{
  "name": "@clenergize/database",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "test": "jest"
  },
  "dependencies": {
    "mongodb": "^6.0.0",
    "@clenergize/common": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
EOF

cat > tsconfig.json << 'EOF'
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
EOF

mkdir -p src

cat > src/repository.base.ts << 'EOF'
import { Collection, ClientSession, Document } from 'mongodb';

export interface IRepository<T extends Document> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export abstract class BaseRepository<T extends Document> implements IRepository<T> {
  constructor(protected collection: Collection<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.collection.findOne({ _id: id } as any);
  }

  async findAll(filter?: Partial<T>): Promise<T[]> {
    return this.collection.find(filter || {}).toArray();
  }

  async create(entity: T): Promise<T> {
    const result = await this.collection.insertOne(entity);
    return { ...entity, _id: result.insertedId };
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id } as any,
      { $set: entity },
      { returnDocument: 'after' }
    );
    return result!;
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id } as any);
  }

  protected async withTransaction<R>(
    fn: (session: ClientSession) => Promise<R>
  ): Promise<R> {
    const session = this.collection.client.startSession();
    try {
      return await session.withTransaction(fn);
    } finally {
      await session.endSession();
    }
  }
}
EOF

cat > src/index.ts << 'EOF'
export * from './repository.base';
EOF

npm install
npm run build
```

#### Step 6: Install All Workspaces

```bash
# Return to NEW directory
cd ../../../

# Install all dependencies
npm install

# Build all shared packages
npm run build:shared

# Verify workspace setup
npm ls --workspaces
```

#### Step 7: Use Shared Packages in Services

In each service's `package.json`:

```json
{
  "name": "@clenergize/identity-service",
  "version": "1.0.0",
  "dependencies": {
    "@clenergize/common": "workspace:*",
    "@clenergize/contracts": "workspace:*",
    "@clenergize/security": "workspace:*",
    "@clenergize/database": "workspace:*",
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0",
    "mongoose": "^8.0.0"
  }
}
```

Then in service code:

```typescript
// identity-service/src/main.ts
import { createLogger } from '@clenergize/common';
import { JWTVerifier } from '@clenergize/security';
import { UserRegisteredEventSchema } from '@clenergize/contracts';

const logger = createLogger({ serviceName: 'identity-service' });
logger.info('Service starting...');

const jwtVerifier = new JWTVerifier({
  jwksUri: process.env.JWKS_URI!,
  issuer: process.env.JWT_ISSUER!,
  audience: process.env.JWT_AUDIENCE!
});
```

#### Verification Checklist

- [ ] Root `package.json` created with workspaces config
- [ ] `tsconfig.base.json` created
- [ ] `@clenergize/common` package created and built
- [ ] `@clenergize/contracts` package created and built
- [ ] `@clenergize/security` package created and built
- [ ] `@clenergize/database` package created and built
- [ ] `npm install` runs successfully
- [ ] `npm run build:shared` builds all packages
- [ ] Services can import from shared packages
- [ ] TypeScript types are resolved correctly

## Git Repository Strategy

### Monorepo vs Multi-repo Decision

**Recommended: Monorepo with Lerna/NX**

```yaml
Advantages:
  - Atomic commits across services
  - Shared dependency management
  - Simplified CI/CD
  - Easier refactoring

Structure:
  clenergize-v3-rebuild/
  ├── packages/
  │   ├── identity-service/
  │   ├── organization-service/
  │   ├── reference-service/
  │   ├── activity-service/
  │   ├── calculation-service/
  │   ├── reporting-service/
  │   ├── audit-service/
  │   ├── frontend/
  │   └── shared/
  ├── lerna.json
  ├── nx.json
  └── package.json
```

## Development Workflow

### 1. Reference OLD Code

```bash
# When implementing a feature, reference OLD code
cd OLD/clenergizeV3-[service]-ms-dev
# Understand existing logic
# Identify issues from DESIGN-REVIEW.md
# DON'T copy-paste, rewrite cleanly
```

### 2. Implement in NEW

```bash
# Create clean implementation
cd NEW/[service-name]
# Follow DDD principles
# Fix identified issues
# Write tests first (TDD)
```

### 3. Migration Mapping

```typescript
// Create migration maps for data
// OLD/clenergizeV3-project-management-ms-dev
interface OldProject {
  clonedEntities: Entity[];  // BAD: Cloned data
}

// NEW/organization-service
interface NewProject {
  entityRefs: string[];      // GOOD: References only
}

// Migration script
async function migrateProject(old: OldProject): Promise<NewProject> {
  const entityIds = await createEntityReferences(old.clonedEntities);
  return {
    entityRefs: entityIds
  };
}
```

## Agent Assignment by Service

### Service-to-Agent Mapping

```yaml
Services:
  identity-service:
    Agent: Identity Agent
    Context: OLD/clenergizeV3-user-management-ms-dev
    
  organization-service:
    Agent: Organization Agent
    Context: OLD/clenergizeV3-project-management-ms-dev
    
  reference-service:
    Agent: Reference Agent
    Context: OLD/clenergizeV3-master-data-ms-dev
    
  activity-service:
    Agent: Activity Agent
    Context: OLD/clenergizeV3-carbon-footprint-ms-dev (partial)
    
  calculation-service:
    Agent: Calculation Agent
    Context: OLD/clenergizeV3-carbon-footprint-ms-dev (partial)
    
  reporting-service:
    Agent: Reporting Agent
    Context: OLD/clenergizeV3-backend-ms-dev (RESULT-REPORT)
    
  audit-service:
    Agent: Audit Agent
    Context: NEW (no OLD equivalent)
    
  frontend:
    Agent: Frontend Agent
    Context: OLD/clenergizeV3-frontend-dev
```

## Critical Fixes from OLD to NEW

### Priority 1: Security (Sprint 0.1)

```typescript
// OLD: BAD - No JWT verification
const decoded = jwt.decode(token);  // VULNERABLE!

// NEW: GOOD - Proper verification
import { JwksClient } from 'jwks-rsa';
const verified = await jwt.verify(token, getKey);
```

### Priority 2: Data Consistency (Sprint 0.2)

```typescript
// OLD: BAD - Cloning hierarchies
const project = {
  entities: [...cloneDeep(templateEntities)]  // DATA DUPLICATION!
};

// NEW: GOOD - References
const project = {
  entityRefs: templateEntityIds,  // Just IDs
  templateVersion: "v1.2.3"       // Track version
};
```

### Priority 3: Resilience (Sprint 0.2)

```typescript
// OLD: BAD - Infinite loop
while(true) {
  const messages = await sqs.receiveMessage();  // BLOCKS FOREVER!
}

// NEW: GOOD - Graceful polling
class SQSConsumer {
  private shutdown = false;
  
  async start() {
    while (!this.shutdown) {
      await this.pollWithBackoff();
    }
  }
  
  async stop() {
    this.shutdown = true;
  }
}
```

## Environment Configuration

### Local Development (.env.development)

```bash
# Service Ports
IDENTITY_SERVICE_PORT=3001
ORGANIZATION_SERVICE_PORT=3002
REFERENCE_SERVICE_PORT=3003
ACTIVITY_SERVICE_PORT=3004
CALCULATION_SERVICE_PORT=3005
REPORTING_SERVICE_PORT=3006
AUDIT_SERVICE_PORT=3007

# MongoDB (Local)
MONGODB_URI=mongodb://admin:localdev123@localhost:27017

# Redis (Local)
REDIS_URL=redis://localhost:6379

# LocalStack (AWS Mock)
AWS_ENDPOINT=http://localhost:4566
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# Service Discovery
SERVICE_REGISTRY=http://localhost:8500  # Consul
```

## Docker Compose Integration

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # Infrastructure
  mongodb:
    image: mongo:7.0
    ports: ["27017:27017"]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  localstack:
    image: localstack/localstack:latest
    ports: ["4566:4566"]
    
  # NEW Services
  identity-service:
    build: ./NEW/identity-service
    ports: ["3001:3001"]
    volumes:
      - ./NEW/identity-service:/app
      - ./OLD/clenergizeV3-user-management-ms-dev:/reference:ro
    
  organization-service:
    build: ./NEW/organization-service
    ports: ["3002:3002"]
    volumes:
      - ./NEW/organization-service:/app
      - ./OLD/clenergizeV3-project-management-ms-dev:/reference:ro
    
  # ... other services
```

## Migration Checklist

### Per Service Migration Steps

- [ ] Analyze OLD service code
- [ ] Review DESIGN-REVIEW.md issues
- [ ] Create NEW service structure
- [ ] Define domain models
- [ ] Implement repositories
- [ ] Create use cases
- [ ] Build REST controllers
- [ ] Add event publishers
- [ ] Write unit tests (80% coverage)
- [ ] Write integration tests
- [ ] Create migration scripts
- [ ] Document API contracts
- [ ] Update shared contracts
- [ ] Test with OLD data
- [ ] Performance benchmarks

## Success Metrics

### Code Quality Metrics
- Test Coverage: ≥80% (unit), ≥70% (integration)
- Code Duplication: <3%
- Cyclomatic Complexity: <10 per method
- Technical Debt Ratio: <5%

### Architecture Metrics
- Service Coupling: Low (events only)
- API Response Time: <200ms p95
- Build Time: <2 minutes per service
- Deployment Time: <5 minutes

### Security Metrics
- No hardcoded secrets
- All JWTs verified
- Zero critical vulnerabilities
- OWASP Top 10 compliance

## Conclusion

This structure ensures:
1. Clean separation from OLD code (reference only)
2. Proper microservice boundaries in NEW
3. Shared contracts and utilities
4. Clear migration path
5. Agent-specific contexts
6. Comprehensive testing
7. Security-first implementation

Each agent can work independently on their service while maintaining consistency through shared contracts and the Master Coordinator's oversight.
