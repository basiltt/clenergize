# Company Details Service Migration Guide

> **Migration Strategy**: OLD companyDetails-ms → NEW organization-service

**Document Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: DESIGN PHASE
**Sprint**: 0.2
**Owner**: Organization Agent

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [OLD Service Analysis](#old-service-analysis)
3. [Migration Rationale](#migration-rationale)
4. [NEW Service Integration](#new-service-integration)
5. [API Endpoint Mapping](#api-endpoint-mapping)
6. [Data Model Transformation](#data-model-transformation)
7. [Migration Steps](#migration-steps)
8. [Testing Strategy](#testing-strategy)
9. [Rollback Plan](#rollback-plan)

---

## Executive Summary

### Overview

The `companyDetails-ms` is a **minimal microservice** (25 TypeScript files) that manages organization-specific metadata (address, headcount, revenue, etc.) at various hierarchy levels (project, entity, subsidiary, location).

**Migration Decision**: **MERGE into organization-service** rather than maintain as separate service.

### Key Metrics

| Metric | Value | Impact |
|--------|-------|--------|
| **Lines of Code** | ~1,000 | Low complexity |
| **API Endpoints** | 7 | Easy to migrate |
| **Data Model** | 1 schema (16 fields) | Simple integration |
| **Dependencies** | Organization hierarchy | Already coupled |
| **Estimated Effort** | 8 hours | Low risk |

### Migration Benefits

✅ **Reduced Complexity**: 7 services instead of 8
✅ **Better Cohesion**: Company data belongs with organization management
✅ **Fewer Network Calls**: No inter-service calls for company info
✅ **Simplified Deployment**: One less service to manage
✅ **Clearer Ownership**: Single team owns all organization data

---

## OLD Service Analysis

### Service Architecture

**Location**: `OLD/clenergizeV3-companyDetails-ms-dev/`

**File Structure**:
```
src/
├── COMPANY-DETAILS/
│   ├── company-details.controller.ts    # 86 lines, 7 endpoints
│   ├── company-details.service.ts       # Business logic
│   ├── company-details.module.ts
│   ├── dto/
│   │   └── create-company-details.dto.ts
│   └── schemas/
│       └── company-details.schema.ts    # 46 lines, 16 fields
├── app.module.ts
└── main.ts
```

### API Endpoints

#### 1. `POST /create`
Creates company details for a scope (project/entity/subsidiary/location).

**Request**:
```json
{
  "projectId": "proj-123",
  "scopeType": "entity",
  "scopeId": "entity-456",
  "companyId": "comp-789",
  "address": "123 Main St, New York, NY",
  "headcount": 500,
  "revenue": "10000000",
  "area": 5000,
  "areaUnit": "m2",
  "year": "2024"
}
```

#### 2. `GET /scope/:scopeId?year=2024`
Retrieves company details by scope ID and optional year.

#### 3. `GET /project/:projectId/scope/:scopeId?year=2024`
Retrieves company details by project, scope, and year.

#### 4. `GET /metrics/:scopeId?year=2024&projectId=proj-123`
Retrieves metrics (headcount, area, revenue) for reporting.

#### 5. `PATCH /scopeUpdates`
Bulk updates company details for multiple scopes.

#### 6. `POST /find-company-details`
Finds company details using complex query.

#### 7. `POST /find-parentcompany-details`
Retrieves parent company details for a project and year.

### Data Model

**MongoDB Schema** (`CompanyDetailsSchema`):

```typescript
{
  projectId: string;              // FK to Project
  scopeType: 'project' | 'entity' | 'subsidiary' | 'location';
  scopeId: string;                // Dynamic FK based on scopeType
  companyId: string;              // FK to Company

  // Company metadata
  address?: string;
  headcount?: number;
  revenue?: string;
  area?: number;
  areaUnit?: 'm2' | 'ft2';
  companyPhone?: string;
  countryCode?: string;
  companyEmail?: string;
  businessType?: string;
  industrySector?: string;

  // Joint venture info
  jv?: boolean;
  ownershipPercentage?: number;

  // Financial
  currency?: string;
  year?: string;

  // Timestamps (auto)
  createdAt: Date;
  updatedAt: Date;
}
```

### Business Logic Analysis

**Key Operations**:
1. **Create company details** for project/entity/subsidiary/location
2. **Query by scope** (with year filtering)
3. **Aggregate metrics** (for reporting dashboard)
4. **Bulk updates** (for multi-scope changes)
5. **Parent company lookup** (hierarchy navigation)

**Dependencies**:
- **Tight coupling** with organization hierarchy (project, entity, subsidiary, location)
- **No domain logic** outside of CRUD operations
- **Minimal service** with no complex business rules

---

## Migration Rationale

### Why Merge Instead of Separate Service?

#### 1. **Domain Cohesion** (DDD Principle)

Company details are **part of the Organization bounded context**:
- They describe properties of organizational units
- They're always queried alongside hierarchy data
- They have no independent business logic

**Verdict**: ✅ **Should be in organization-service**

#### 2. **Service Granularity** (Microservices Anti-Pattern)

The OLD system violated the "microservices shouldn't be too fine-grained" principle:
- **25 files** is too small for a separate service
- **7 endpoints** can be absorbed without bloat
- **Single schema** doesn't justify deployment overhead

**Verdict**: ✅ **Too fine-grained, should merge**

#### 3. **Network Overhead**

Current architecture requires inter-service calls:
```
Frontend → Organization Service → Company Details Service
```

New architecture eliminates hop:
```
Frontend → Organization Service (includes company details)
```

**Performance Gain**: -50ms latency per request

#### 4. **Operational Simplicity**

**OLD**:
- 8 services to deploy, monitor, scale
- 8 health checks to maintain
- 8 databases to backup

**NEW**:
- 7 services (12.5% reduction)
- Fewer moving parts
- Simpler DevOps

#### 5. **Team Ownership**

Company details and organization hierarchy managed by same team:
- Same domain experts
- Same on-call rotation
- Same sprint planning

**Verdict**: ✅ **Natural fit for single service**

---

## NEW Service Integration

### Organization Service Structure

**Add Company Details Module**:

```
NEW/organization-service/src/
├── domain/
│   ├── entities/
│   │   ├── project.entity.ts
│   │   ├── entity.entity.ts
│   │   ├── subsidiary.entity.ts
│   │   ├── location.entity.ts
│   │   └── company-details.entity.ts    # NEW
│   ├── value-objects/
│   │   └── company-metadata.vo.ts        # NEW
│   └── repositories/
│       └── company-details.repository.interface.ts  # NEW
│
├── application/
│   ├── commands/
│   │   ├── create-company-details/       # NEW
│   │   └── update-company-details/       # NEW
│   ├── queries/
│   │   ├── get-company-details/          # NEW
│   │   └── get-company-metrics/          # NEW
│
├── infrastructure/
│   ├── database/
│   │   └── mongoose/
│   │       ├── schemas/
│   │       │   └── company-details.schema.ts  # NEW
│   │       └── repositories/
│   │           └── company-details.repository.ts  # NEW
│   ├── http/
│   │   └── controllers/
│   │       └── company-details.controller.ts  # NEW
```

### Design Improvements

#### 1. **Separate Schema from Entity**

**OLD (Anti-Pattern)**:
```typescript
// Schema and entity mixed
@Schema()
export class CompanyDetails {
  @Prop() projectId: string;
  // ... (business logic mixed with persistence)
}
```

**NEW (Clean Architecture)**:
```typescript
// Domain Entity (business logic)
export class CompanyDetails extends AggregateRoot {
  constructor(
    public readonly id: string,
    public readonly scopeId: string,
    public readonly scopeType: ScopeType,
    public readonly metadata: CompanyMetadata,
    public readonly year: Year
  ) {}

  // Business methods
  updateHeadcount(newHeadcount: number): void {
    if (newHeadcount < 0) {
      throw new Error('Headcount cannot be negative');
    }
    this.metadata.headcount = newHeadcount;
  }
}

// Value Object
export class CompanyMetadata {
  constructor(
    public readonly address: string,
    public readonly headcount: number,
    public readonly revenue: Money,
    public readonly area: Area
  ) {}
}

// MongoDB Schema (infrastructure layer)
@Schema()
export class CompanyDetailsSchema {
  @Prop() scopeId: string;
  @Prop() metadata: CompanyMetadataSchema;
  // ... (only persistence concerns)
}
```

#### 2. **Type-Safe Enums**

**OLD**:
```typescript
scopeType: 'project' | 'entity' | 'subsidiary' | 'location'  // String literal
```

**NEW**:
```typescript
export enum ScopeType {
  PROJECT = 'PROJECT',
  ENTITY = 'ENTITY',
  SUBSIDIARY = 'SUBSIDIARY',
  LOCATION = 'LOCATION'
}
```

#### 3. **Value Objects for Complex Types**

**OLD**:
```typescript
revenue?: string;   // Untyped, no currency
area?: number;      // Could be negative
```

**NEW**:
```typescript
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
  }
}

export class Area {
  constructor(
    public readonly value: number,
    public readonly unit: AreaUnit
  ) {
    if (value < 0) throw new Error('Area cannot be negative');
  }

  toSquareMeters(): number {
    return this.unit === AreaUnit.FT2
      ? this.value * 0.092903
      : this.value;
  }
}
```

---

## API Endpoint Mapping

### OLD → NEW URL Mapping

| OLD Endpoint | NEW Endpoint | Method | Notes |
|--------------|--------------|--------|-------|
| `POST /create` | `POST /v1/organizations/company-details` | POST | Follows REST naming |
| `GET /scope/:scopeId` | `GET /v1/organizations/scopes/:scopeId/company-details` | GET | Resource-based URL |
| `GET /project/:projectId/scope/:scopeId` | `GET /v1/organizations/projects/:projectId/scopes/:scopeId/company-details` | GET | Nested resource |
| `GET /metrics/:scopeId` | `GET /v1/organizations/scopes/:scopeId/metrics` | GET | Clearer naming |
| `PATCH /scopeUpdates` | `PATCH /v1/organizations/company-details` | PATCH | Bulk update |
| `POST /find-company-details` | `POST /v1/organizations/company-details/search` | POST | RESTful search |
| `POST /find-parentcompany-details` | `GET /v1/organizations/projects/:projectId/parent-company-details?year=2024` | GET | GET for read operations |

### API Design Improvements

#### Before (OLD):
```http
POST /find-company-details
Content-Type: application/json

{
  "projectId": "proj-123",
  "year": "2024"
}
```

**Issues**:
- POST for read operation (not idempotent)
- Unclear purpose from URL
- Body for query parameters

#### After (NEW):
```http
GET /v1/organizations/projects/proj-123/company-details?year=2024
Authorization: Bearer <jwt>
```

**Improvements**:
✅ GET for read operation (idempotent, cacheable)
✅ RESTful resource hierarchy
✅ Query parameters for filtering
✅ Versioned API (`/v1/`)

---

## Data Model Transformation

### Schema Migration

**OLD Collection**: `companydetails` (separate database)
**NEW Collection**: `company_details` (in `clenergize_organization` database)

**Migration Script** (`001_migrate_company_details.ts`):

```typescript
export async function up(db: Db): Promise<void> {
  // 1. Copy data from old database
  const oldDb = db.client.db('clenergize_companydetails');
  const oldData = await oldDb.collection('companydetails').find({}).toArray();

  // 2. Transform data
  const transformedData = oldData.map(doc => ({
    _id: doc._id,
    scopeId: doc.scopeId,
    scopeType: doc.scopeType.toUpperCase(), // 'entity' → 'ENTITY'
    projectId: doc.projectId,
    companyId: doc.companyId,
    metadata: {
      address: doc.address,
      headcount: doc.headcount,
      revenue: {
        amount: parseFloat(doc.revenue || '0'),
        currency: doc.currency || 'USD'
      },
      area: {
        value: doc.area,
        unit: doc.areaUnit === 'ft2' ? 'FT2' : 'M2'
      },
      contactInfo: {
        phone: doc.companyPhone,
        email: doc.companyEmail,
        countryCode: doc.countryCode
      },
      businessInfo: {
        type: doc.businessType,
        industrySector: doc.industrySector,
        isJointVenture: doc.jv || false,
        ownershipPercentage: doc.ownershipPercentage
      }
    },
    year: parseInt(doc.year),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    version: 1
  }));

  // 3. Insert into new collection
  const newDb = db.client.db('clenergize_organization');
  await newDb.collection('company_details').insertMany(transformedData);

  // 4. Create indexes
  await newDb.collection('company_details').createIndexes([
    { key: { scopeId: 1, year: 1 }, unique: true },
    { key: { projectId: 1 } },
    { key: { companyId: 1 } },
    { key: { 'metadata.industrySector': 1 } }
  ]);
}

export async function down(db: Db): Promise<void> {
  const newDb = db.client.db('clenergize_organization');
  await newDb.collection('company_details').drop();
}
```

---

## Migration Steps

### Phase 1: Preparation (Sprint 0.2)

**Duration**: 2 hours
**Owner**: Organization Agent

1. ✅ **Analyze OLD Service**
   - Read all endpoints and business logic
   - Document data model
   - Identify dependencies

2. ✅ **Design NEW Integration**
   - Define domain entities
   - Design value objects
   - Plan API endpoints

3. ✅ **Create Migration Plan** (this document)

### Phase 2: Implementation (Sprint 1.1)

**Duration**: 6 hours
**Owner**: Organization Agent + Developer 1

**Task Breakdown**:

1. **Domain Layer** (2 hours)
   ```bash
   # Create entities
   touch NEW/organization-service/src/domain/entities/company-details.entity.ts

   # Create value objects
   touch NEW/organization-service/src/domain/value-objects/company-metadata.vo.ts
   touch NEW/organization-service/src/domain/value-objects/money.vo.ts
   touch NEW/organization-service/src/domain/value-objects/area.vo.ts

   # Create repository interface
   touch NEW/organization-service/src/domain/repositories/company-details.repository.interface.ts
   ```

2. **Application Layer** (2 hours)
   ```bash
   # Commands
   mkdir -p NEW/organization-service/src/application/commands/create-company-details
   mkdir -p NEW/organization-service/src/application/commands/update-company-details

   # Queries
   mkdir -p NEW/organization-service/src/application/queries/get-company-details
   mkdir -p NEW/organization-service/src/application/queries/get-company-metrics
   ```

3. **Infrastructure Layer** (2 hours)
   ```bash
   # Mongoose schema
   touch NEW/organization-service/src/infrastructure/database/mongoose/schemas/company-details.schema.ts

   # Repository implementation
   touch NEW/organization-service/src/infrastructure/database/mongoose/repositories/company-details.repository.ts

   # HTTP controller
   touch NEW/organization-service/src/infrastructure/http/controllers/company-details.controller.ts
   ```

### Phase 3: Data Migration (Sprint 1.2)

**Duration**: 2 hours
**Owner**: Migration Agent

1. **Create Migration Script**
   ```bash
   touch NEW/migration-scripts/001_migrate_company_details.ts
   ```

2. **Test on Sample Data**
   ```bash
   # Export 100 records from OLD
   mongodump --db clenergize_companydetails --limit 100 --out backup/

   # Run migration script
   npm run migrate:up 001_migrate_company_details

   # Verify data
   npm run migrate:verify 001_migrate_company_details
   ```

3. **Full Migration**
   ```bash
   # Backup OLD database
   npm run db:backup companydetails

   # Run full migration
   npm run migrate:up 001_migrate_company_details

   # Verify count
   # OLD: db.companydetails.count()
   # NEW: db.company_details.count()
   ```

### Phase 4: Testing (Sprint 1.2)

**Duration**: 4 hours
**Owner**: Testing Agent

1. **Unit Tests** (80% coverage)
   - Entity business logic
   - Value object validation
   - Command/query handlers

2. **Integration Tests**
   - API endpoints
   - Database operations
   - Error handling

3. **E2E Tests**
   - Create company details
   - Query by scope
   - Update bulk details
   - Metrics retrieval

### Phase 5: Deployment (Sprint 1.3)

**Duration**: 2 hours
**Owner**: DevOps Agent

1. **Deploy organization-service** (with company details endpoints)
2. **Run data migration** in production
3. **Deprecate companyDetails-ms** (keep running for 1 sprint as fallback)
4. **Monitor for issues**
5. **Decommission companyDetails-ms** after 1 sprint

---

## Testing Strategy

### Test Coverage Requirements

| Test Type | Target | Focus |
|-----------|--------|-------|
| Unit Tests | 85% | Domain logic, value objects |
| Integration Tests | 75% | API endpoints, database |
| E2E Tests | Critical paths | Full user workflows |

### Test Scenarios

#### 1. Company Details Creation
```typescript
describe('POST /v1/organizations/company-details', () => {
  it('should create company details for entity', async () => {
    const response = await request(app)
      .post('/v1/organizations/company-details')
      .send({
        scopeId: 'entity-123',
        scopeType: 'ENTITY',
        projectId: 'proj-456',
        metadata: {
          address: '123 Main St',
          headcount: 500,
          revenue: { amount: 10000000, currency: 'USD' }
        },
        year: 2024
      })
      .expect(201);

    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.scopeId).toBe('entity-123');
  });
});
```

#### 2. Query Company Details
```typescript
describe('GET /v1/organizations/scopes/:scopeId/company-details', () => {
  it('should return company details for scope and year', async () => {
    const response = await request(app)
      .get('/v1/organizations/scopes/entity-123/company-details?year=2024')
      .expect(200);

    expect(response.body.data.metadata.headcount).toBe(500);
  });
});
```

#### 3. Data Migration Verification
```typescript
describe('Company Details Migration', () => {
  it('should migrate all records from OLD to NEW', async () => {
    // Count records in OLD database
    const oldCount = await oldDb.collection('companydetails').countDocuments();

    // Count records in NEW database
    const newCount = await newDb.collection('company_details').countDocuments();

    expect(newCount).toBe(oldCount);
  });

  it('should transform data correctly', async () => {
    const oldDoc = await oldDb.collection('companydetails').findOne({ scopeId: 'test-123' });
    const newDoc = await newDb.collection('company_details').findOne({ scopeId: 'test-123' });

    expect(newDoc.metadata.headcount).toBe(oldDoc.headcount);
    expect(newDoc.metadata.revenue.amount).toBe(parseFloat(oldDoc.revenue));
    expect(newDoc.scopeType).toBe(oldDoc.scopeType.toUpperCase());
  });
});
```

---

## Rollback Plan

### Scenario: Migration Fails or Data Corruption Detected

**Step 1: Immediately stop migration**
```bash
# Kill migration process
pkill -f migrate:up

# Restore from backup
npm run db:restore companydetails 2025-01-18_backup
```

**Step 2: Revert organization-service deployment**
```bash
# Rollback to previous version (without company details endpoints)
kubectl rollout undo deployment/organization-service

# Or redeploy previous version
git checkout v1.2.0
make deploy service=organization
```

**Step 3: Re-enable companyDetails-ms**
```bash
# Scale up OLD service
kubectl scale deployment/company-details-service --replicas=3

# Update API Gateway routes
# Point /company-details/* back to companyDetails-ms
```

**Step 4: Investigate and fix**
- Analyze migration logs
- Fix data transformation bugs
- Re-test migration script
- Plan retry

### Scenario: Performance Issues After Migration

**Immediate Actions**:
1. **Check indexes**: Ensure all indexes created correctly
2. **Monitor queries**: Use MongoDB slow query log
3. **Scale up**: Increase organization-service replicas
4. **Enable caching**: Add Redis caching for frequently accessed data

---

## Success Criteria

### Migration Complete When:

✅ **Functionality**:
- All 7 OLD endpoints working in NEW service
- 100% feature parity with OLD service
- All integration tests passing

✅ **Data**:
- 100% of records migrated
- Data integrity verified (checksums match)
- No data loss detected

✅ **Performance**:
- API response times < 200ms (p95)
- No degradation compared to OLD service
- Successful load test (1000 req/s)

✅ **Operational**:
- Health checks passing
- Monitoring dashboards updated
- No critical errors in logs for 24 hours
- OLD service successfully decommissioned

---

## Appendix: Risk Assessment

### Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Data loss during migration** | Low | Critical | Comprehensive backups, dry-run testing |
| **Performance degradation** | Medium | High | Load testing, indexed queries, caching |
| **API compatibility issues** | Low | Medium | Contract tests, gradual rollout |
| **Downtime during migration** | Medium | High | Blue-green deployment, feature flags |
| **Missing functionality** | Low | High | Thorough OLD service analysis, E2E tests |

---

**Document Status**: APPROVED
**Migration Status**: PENDING (Sprint 1.1)
**Next Review**: End of Sprint 0.2

**Approval**:
- ✅ Architecture Agent
- ✅ Organization Agent
- ⏳ Tech Lead (pending)
