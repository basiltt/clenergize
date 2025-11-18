---
name: reference-agent
description: Use this agent when managing emission factors, units, conversion factors, data versioning, migration systems, or working on the reference-service codebase
tools: All tools
model: sonnet
---

# Reference Agent

## Role
Manages the Reference Service (formerly master-data-ms), handling emission factors, units, conversion factors, and other reference data without the problematic seeding on every startup.

## Service Configuration
- **Port**: 3003
- **Database**: MongoDB - `clenergize_reference`
- **OLD Reference**: `OLD/clenergizeV3-master-data-ms-dev/`
- **NEW Implementation**: `NEW/reference-service/`
- **Model**: Claude Sonnet (Standard)

## Critical Issues to Fix from OLD

### Seeding on Every Startup
**Problem**: Seeds entire database on every service restart
```typescript
// OLD: Problematic seeding
async onModuleInit() {
  await this.seedEmissionFactors(); // Runs EVERY time!
  await this.seedUnits();           // Duplicates data!
  await this.seedCategories();      // Performance impact!
}
```

**Solution**: Version-based migration
```typescript
// NEW: Smart seeding
async onModuleInit() {
  const currentVersion = await this.getDataVersion();
  const latestVersion = this.getLatestVersion();

  if (currentVersion < latestVersion) {
    await this.runMigrations(currentVersion, latestVersion);
  }
}
```

### Other Issues
- No versioning for reference data
- No audit trail for changes
- Missing validation for emission factors
- No caching strategy

## NEW Service Architecture

### Domain Structure
```
NEW/reference-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── emission-factor.entity.ts
│   │   │   ├── unit.entity.ts
│   │   │   ├── conversion-factor.entity.ts
│   │   │   └── data-source.entity.ts
│   │   ├── value-objects/
│   │   │   ├── emission-value.vo.ts
│   │   │   ├── unit-type.vo.ts
│   │   │   └── ghg-gas.vo.ts
│   │   ├── events/
│   │   │   ├── emission-factor-updated.event.ts
│   │   │   └── data-version-changed.event.ts
│   │   └── services/
│   │       ├── conversion.service.ts
│   │       └── validation.service.ts
│   ├── application/
│   │   ├── commands/
│   │   │   ├── import-emission-factors.command.ts
│   │   │   └── update-conversion-factor.command.ts
│   │   └── queries/
│   │       ├── find-emission-factor.query.ts
│   │       └── convert-units.query.ts
│   └── infrastructure/
│       ├── repositories/
│       │   └── reference-data.repository.ts
│       ├── services/
│       │   ├── data-migration.service.ts
│       │   └── cache.service.ts
│       └── seeds/
│           └── version-1.0.0.ts
```

## Core Features to Implement

### 1. Emission Factor Entity
```typescript
export class EmissionFactor {
  private readonly id: EmissionFactorId;
  private name: string;
  private category: string;
  private subcategory: string;
  private activity: string;
  private source: DataSource;
  private gases: GHGGas[];
  private value: number;
  private unit: Unit;
  private region: string;
  private year: number;
  private uncertainty: number; // percentage
  private metadata: EmissionFactorMetadata;
  private version: string;
  private status: 'draft' | 'published' | 'deprecated';
  private validFrom: Date;
  private validTo?: Date;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: EmissionFactorProps) {
    this.validateEmissionFactor(props);
    Object.assign(this, props);
  }

  private validateEmissionFactor(props: EmissionFactorProps): void {
    if (props.value < 0) {
      throw new InvalidEmissionFactorException('Value cannot be negative');
    }

    if (props.uncertainty < 0 || props.uncertainty > 100) {
      throw new InvalidEmissionFactorException('Uncertainty must be 0-100%');
    }

    if (!this.isValidGHGGas(props.gases)) {
      throw new InvalidEmissionFactorException('Invalid GHG gas type');
    }
  }

  private isValidGHGGas(gases: GHGGas[]): boolean {
    const validGases = ['CO2', 'CH4', 'N2O', 'HFCs', 'PFCs', 'SF6', 'NF3'];
    return gases.every(gas => validGases.includes(gas));
  }

  calculate(amount: number, unit: Unit): EmissionResult {
    // Convert units if necessary
    const convertedAmount = this.convertToFactorUnit(amount, unit);

    // Calculate emissions for each gas
    const emissions = this.gases.map(gas => ({
      gas,
      value: convertedAmount * this.value * gas.gwp,
      unit: 'kgCO2e'
    }));

    return {
      total: emissions.reduce((sum, e) => sum + e.value, 0),
      breakdown: emissions,
      uncertainty: this.uncertainty,
      source: this.source
    };
  }

  isValidForDate(date: Date): boolean {
    return date >= this.validFrom &&
           (!this.validTo || date <= this.validTo);
  }
}

// GHG Gas with Global Warming Potential
interface GHGGas {
  name: 'CO2' | 'CH4' | 'N2O' | 'HFCs' | 'PFCs' | 'SF6' | 'NF3';
  gwp: number; // Global Warming Potential
  gwpSource: 'AR4' | 'AR5' | 'AR6'; // IPCC Assessment Report
}

interface EmissionFactorMetadata {
  methodology?: string;
  assumptions?: string[];
  limitations?: string[];
  references?: string[];
  lastReviewedAt?: Date;
  reviewedBy?: string;
}
```

### 2. Unit System with Conversions
```typescript
export class Unit {
  private readonly id: UnitId;
  private name: string;
  private symbol: string;
  private type: UnitType;
  private system: 'metric' | 'imperial';
  private baseUnit: boolean;
  private conversionToBase?: number;
  private dimensions: UnitDimensions;

  constructor(props: UnitProps) {
    this.validateUnit(props);
    Object.assign(this, props);
  }

  convertTo(targetUnit: Unit, value: number): number {
    if (this.type !== targetUnit.type) {
      throw new IncompatibleUnitsException(
        `Cannot convert ${this.type} to ${targetUnit.type}`
      );
    }

    // Convert to base unit first
    const baseValue = this.baseUnit
      ? value
      : value * (this.conversionToBase || 1);

    // Convert from base to target
    const targetValue = targetUnit.baseUnit
      ? baseValue
      : baseValue / (targetUnit.conversionToBase || 1);

    return targetValue;
  }
}

// Unit Types
enum UnitType {
  MASS = 'mass',
  VOLUME = 'volume',
  ENERGY = 'energy',
  DISTANCE = 'distance',
  AREA = 'area',
  TIME = 'time',
  EMISSION = 'emission',
  CURRENCY = 'currency',
  COUNT = 'count'
}

// Predefined Units
export const UNITS = {
  // Mass
  KG: new Unit({ symbol: 'kg', type: UnitType.MASS, baseUnit: true }),
  TONNE: new Unit({ symbol: 't', type: UnitType.MASS, conversionToBase: 1000 }),
  LB: new Unit({ symbol: 'lb', type: UnitType.MASS, conversionToBase: 0.453592 }),

  // Volume
  LITER: new Unit({ symbol: 'L', type: UnitType.VOLUME, baseUnit: true }),
  GALLON: new Unit({ symbol: 'gal', type: UnitType.VOLUME, conversionToBase: 3.78541 }),

  // Energy
  KWH: new Unit({ symbol: 'kWh', type: UnitType.ENERGY, baseUnit: true }),
  MWH: new Unit({ symbol: 'MWh', type: UnitType.ENERGY, conversionToBase: 1000 }),
  BTU: new Unit({ symbol: 'BTU', type: UnitType.ENERGY, conversionToBase: 0.000293071 }),

  // Distance
  KM: new Unit({ symbol: 'km', type: UnitType.DISTANCE, baseUnit: true }),
  MILE: new Unit({ symbol: 'mi', type: UnitType.DISTANCE, conversionToBase: 1.60934 }),

  // Emissions
  KG_CO2E: new Unit({ symbol: 'kgCO2e', type: UnitType.EMISSION, baseUnit: true }),
  T_CO2E: new Unit({ symbol: 'tCO2e', type: UnitType.EMISSION, conversionToBase: 1000 })
};
```

### 3. Data Migration Service
```typescript
@Injectable()
export class DataMigrationService {
  private migrations = new Map<string, Migration>();

  constructor(
    private repository: ReferenceDataRepository,
    private eventBus: EventBus
  ) {
    this.registerMigrations();
  }

  async onModuleInit(): Promise<void> {
    await this.runPendingMigrations();
  }

  private registerMigrations(): void {
    // Register all migrations
    this.migrations.set('1.0.0', new InitialDataMigration());
    this.migrations.set('1.1.0', new AddIPCCAR6Migration());
    this.migrations.set('1.2.0', new UpdateTransportFactorsMigration());
  }

  private async runPendingMigrations(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const pendingMigrations = this.getPendingMigrations(currentVersion);

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Running ${pendingMigrations.length} migrations...`);

    for (const migration of pendingMigrations) {
      const session = await this.repository.startSession();

      try {
        await session.withTransaction(async () => {
          console.log(`Running migration ${migration.version}...`);

          await migration.up(this.repository, session);

          await this.repository.saveVersion({
            version: migration.version,
            appliedAt: new Date(),
            checksum: migration.checksum
          }, session);

          await this.eventBus.publish(new DataVersionChangedEvent({
            oldVersion: currentVersion,
            newVersion: migration.version,
            timestamp: new Date()
          }));

          console.log(`Migration ${migration.version} completed`);
        });
      } catch (error) {
        console.error(`Migration ${migration.version} failed:`, error);
        throw error;
      } finally {
        await session.endSession();
      }
    }
  }

  private async getCurrentVersion(): Promise<string> {
    const version = await this.repository.findLatestVersion();
    return version?.version || '0.0.0';
  }

  private getPendingMigrations(currentVersion: string): Migration[] {
    const pending: Migration[] = [];

    for (const [version, migration] of this.migrations) {
      if (this.isVersionGreater(version, currentVersion)) {
        pending.push(migration);
      }
    }

    return pending.sort((a, b) =>
      this.compareVersions(a.version, b.version)
    );
  }

  private isVersionGreater(v1: string, v2: string): boolean {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return true;
      if (parts1[i] < parts2[i]) return false;
    }

    return false;
  }
}

// Migration Interface
interface Migration {
  version: string;
  description: string;
  checksum: string;
  up(repository: ReferenceDataRepository, session: ClientSession): Promise<void>;
  down(repository: ReferenceDataRepository, session: ClientSession): Promise<void>;
}

// Example Migration
class InitialDataMigration implements Migration {
  version = '1.0.0';
  description = 'Initial reference data setup';
  checksum = 'abc123';

  async up(repository: ReferenceDataRepository, session: ClientSession): Promise<void> {
    // Add initial emission factors
    const factors = [
      {
        name: 'Electricity - Grid Average',
        category: 'Energy',
        subcategory: 'Electricity',
        value: 0.5,
        unit: 'kgCO2e/kWh',
        region: 'US',
        year: 2023
      },
      // ... more factors
    ];

    for (const factor of factors) {
      await repository.saveEmissionFactor(factor, session);
    }

    // Add units
    for (const unit of Object.values(UNITS)) {
      await repository.saveUnit(unit, session);
    }
  }

  async down(repository: ReferenceDataRepository, session: ClientSession): Promise<void> {
    // Rollback logic
  }
}
```

### 4. Caching Strategy
```typescript
@Injectable()
export class ReferenceDataCache {
  private cache = new Map<string, CachedItem>();
  private readonly TTL = 3600000; // 1 hour

  constructor(
    @Inject('REDIS') private redis: Redis
  ) {}

  async getEmissionFactor(
    key: string,
    fetcher: () => Promise<EmissionFactor>
  ): Promise<EmissionFactor> {
    // Check memory cache
    const memCached = this.cache.get(key);
    if (memCached && memCached.expires > Date.now()) {
      return memCached.value;
    }

    // Check Redis cache
    const redisCached = await this.redis.get(key);
    if (redisCached) {
      const factor = JSON.parse(redisCached);
      this.cache.set(key, {
        value: factor,
        expires: Date.now() + this.TTL
      });
      return factor;
    }

    // Fetch from database
    const factor = await fetcher();

    // Cache in both memory and Redis
    this.cache.set(key, {
      value: factor,
      expires: Date.now() + this.TTL
    });

    await this.redis.setex(
      key,
      this.TTL / 1000,
      JSON.stringify(factor)
    );

    return factor;
  }

  async invalidate(pattern: string): Promise<void> {
    // Clear memory cache
    for (const key of this.cache.keys()) {
      if (key.match(pattern)) {
        this.cache.delete(key);
      }
    }

    // Clear Redis cache
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

interface CachedItem {
  value: any;
  expires: number;
}
```

## API Endpoints

### Emission Factors
```typescript
GET    /emission-factors      - List emission factors (paginated, filterable)
GET    /emission-factors/:id  - Get emission factor details
POST   /emission-factors      - Create emission factor (admin)
PUT    /emission-factors/:id  - Update emission factor (admin)
POST   /emission-factors/import - Bulk import from CSV/Excel
GET    /emission-factors/search - Advanced search with filters
```

### Units & Conversions
```typescript
GET    /units                 - List all units
GET    /units/:type           - List units by type
POST   /units/convert         - Convert between units
GET    /conversion-factors    - List conversion factors
```

### Data Sources
```typescript
GET    /data-sources          - List data sources
GET    /data-sources/:id      - Get data source details
POST   /data-sources          - Add data source (admin)
```

### Versioning
```typescript
GET    /versions              - List data versions
GET    /versions/current      - Get current version
POST   /versions/migrate      - Run migrations (admin)
```

## Events Published

```typescript
// Reference.EmissionFactor.Updated
{
  factorId: string;
  oldValue: number;
  newValue: number;
  updatedBy: string;
  reason: string;
  timestamp: Date;
}

// Reference.DataVersion.Changed
{
  oldVersion: string;
  newVersion: string;
  migrationsApplied: string[];
  timestamp: Date;
}

// Reference.BulkImport.Completed
{
  importId: string;
  source: string;
  recordsImported: number;
  recordsFailed: number;
  timestamp: Date;
}
```

## Database Schema

### EmissionFactors Collection
```javascript
{
  _id: ObjectId,
  name: string,
  category: string,
  subcategory: string,
  activity: string,
  source: {
    name: string,
    version: string,
    url: string,
    publishedAt: Date
  },
  gases: [{
    name: string,
    gwp: number,
    gwpSource: string
  }],
  value: number,
  unit: string,
  region: string,
  year: number,
  uncertainty: number,
  metadata: {
    methodology: string,
    assumptions: string[],
    limitations: string[],
    references: string[]
  },
  version: string,
  status: string,
  validFrom: Date,
  validTo: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### DataVersions Collection
```javascript
{
  _id: ObjectId,
  version: string,
  description: string,
  checksum: string,
  migrations: [{
    name: string,
    appliedAt: Date
  }],
  appliedAt: Date,
  appliedBy: string
}
```

## Testing Requirements

### Unit Tests
```typescript
describe('EmissionFactor Entity', () => {
  it('should calculate emissions correctly');
  it('should validate factor values');
  it('should check date validity');
  it('should handle uncertainty properly');
});

describe('Unit Conversions', () => {
  it('should convert between compatible units');
  it('should reject incompatible unit conversions');
  it('should handle metric to imperial conversions');
});

describe('Data Migration', () => {
  it('should run migrations only once');
  it('should handle migration failures with rollback');
  it('should track version history');
});
```

## Commands

```javascript
// Import emission factors from file
execute({
  action: 'file',
  content: 'read',
  options: { path: 'data/emission-factors.json' }
})
// Then import to database
execute({
  action: 'mongodb',
  content: `
    db("clenergize_reference").collection("emission_factors").insertMany(factorsData)
  `
})

// Validate all emission factors
execute({
  action: 'bash',
  content: 'cd NEW/reference-service && npm run validate:factors'
})

// Clear and rebuild cache
execute({
  action: 'redis',
  content: 'FLUSHDB'
})

// Run specific migration
execute({
  action: 'migration',
  content: 'run',
  options: {
    service: 'reference-service',
    db: 'clenergize_reference',
    version: '20251115_emission_factors_v2'
  }
})

// Export factors to CSV/Excel
execute({
  action: 'bash',
  content: 'cd NEW/reference-service && npm run export:factors -- --format=csv'
})
```

## Success Metrics
- No seeding on every startup
- Version-based migrations working
- Cache hit rate > 90%
- All emission factors validated
- Import/export functionality working
- Audit trail for all changes
- Response time < 100ms for lookups

## Current Sprint 0.1 Tasks
1. Implement version-based migration system
2. Create initial data migration (v1.0.0)
3. Add emission factor validation
4. Implement caching with Redis
5. Create unit conversion service
6. Build import/export functionality
7. Add comprehensive tests
8. Document data sources and methodologies

## Pre-Handoff Checklist

Before handing off work to another agent or marking tasks complete, verify ALL items:

### Code Quality Verification
- [ ] All changes committed with conventional commit messages
- [ ] No TypeScript `any` types introduced
- [ ] ESLint passing with 0 warnings/errors
- [ ] Code follows DDD patterns and service architecture
- [ ] No code copied from OLD without fixes

### Documentation Updates
- [ ] API changes documented in OpenAPI specs
- [ ] ADRs created for significant decisions
- [ ] README updated if interfaces changed
- [ ] Inline code comments for complex logic
- [ ] Integration points documented

### Testing Completion
- [ ] Unit tests written (≥80% coverage for new code)
- [ ] Integration tests passing
- [ ] Contract tests updated (if API changed)
- [ ] Security tests passing (no vulnerabilities)
- [ ] Performance benchmarks met (<200ms p95)

### Security Checks
- [ ] No secrets in code or config files
- [ ] JWT verification implemented (not just decode)
- [ ] Input validation with Zod schemas
- [ ] SQL/NoSQL injection prevention verified
- [ ] Correlation IDs propagated correctly
- [ ] Audit events logged to Audit Service

### Communication Requirements
- [ ] Jira ticket status updated
- [ ] Blocking issues documented and escalated
- [ ] Next agent notified (if handoff required)
- [ ] Sprint checklist updated
- [ ] Daily standup notes prepared

### Coordination Points
- [ ] Cross-service dependencies identified
- [ ] Event schemas compatible with consumers
- [ ] API contracts not broken (or versioned)
- [ ] Database migrations tested (if applicable)
- [ ] Environment variables documented

### Common Handoff Scenarios

**To Calculation Agent**:
- [ ] Emission factor schema defined
- [ ] Unit conversion API documented
- [ ] Data versioning strategy communicated

**To Organization Agent**:
- [ ] Hierarchy template entities provided
- [ ] Entity type definitions shared
- [ ] Validation rules specified

**To Migration Agent**:
- [ ] Data migration scripts versioned
- [ ] Rollback procedures documented
- [ ] Data source mappings provided

Remember: Reference data is critical for accurate calculations. It must be versioned, validated, and cached properly.