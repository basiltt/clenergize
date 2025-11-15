# Calculation Agent

## Role
Manages the Calculation Service (formerly part of carbon-footprint-ms), handling emission calculations, aggregations, and complex carbon accounting algorithms.

## Service Configuration
- **Port**: 3005
- **Database**: MongoDB - `clenergize_calculation`
- **OLD Reference**: `OLD/clenergizeV3-carbon-footprint-ms-dev/`
- **NEW Implementation**: `NEW/calculation-service/`
- **Model**: Claude Sonnet (Standard)
- **Opus 4.1 Usage**: For complex emission algorithms and aggregation optimization

## Critical Issues to Fix from OLD

### Calculation Issues
1. **V1 folder duplication** causing wrong calculations
2. **No caching** for expensive calculations
3. **No audit trail** for calculation changes
4. **Inefficient aggregations** (full recalc every time)
5. **No calculation versioning**

## NEW Service Architecture

### Domain Structure
```
NEW/calculation-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── calculation.entity.ts
│   │   │   ├── emission-result.entity.ts
│   │   │   └── aggregation.entity.ts
│   │   ├── value-objects/
│   │   │   ├── emission-value.vo.ts
│   │   │   └── calculation-method.vo.ts
│   │   ├── events/
│   │   │   ├── emission-calculated.event.ts
│   │   │   └── rollup-completed.event.ts
│   │   └── services/
│   │       ├── calculation-engine.service.ts
│   │       └── aggregation-engine.service.ts
│   ├── application/
│   │   ├── commands/
│   │   │   ├── calculate-emissions.command.ts
│   │   │   └── recalculate-project.command.ts
│   │   └── queries/
│   │       ├── get-emissions.query.ts
│   │       └── get-carbon-footprint.query.ts
│   └── infrastructure/
│       ├── repositories/
│       │   └── calculation.repository.ts
│       └── services/
│           ├── cache.service.ts
│           └── formula-parser.service.ts
```

## Core Features to Implement

### 1. Calculation Engine (Complex - Consider Opus 4.1)
```typescript
@Injectable()
export class CalculationEngine {
  constructor(
    private emissionFactorService: EmissionFactorService,
    private formulaParser: FormulaParser,
    private auditService: AuditService,
    private cache: CacheService
  ) {}

  async calculateEmissions(
    activity: Activity,
    options: CalculationOptions
  ): Promise<EmissionResult> {
    // Check cache first
    const cacheKey = this.getCacheKey(activity, options);
    const cached = await this.cache.get(cacheKey);
    if (cached && !options.forceRecalculation) {
      return cached;
    }

    // Start calculation with audit trail
    const calculationId = new CalculationId();
    await this.auditService.startCalculation(calculationId, activity);

    try {
      // Get appropriate emission factor
      const factor = await this.getEmissionFactor(activity, options);

      // Determine calculation method
      const method = this.determineMethod(activity, factor);

      // Perform calculation based on method
      let result: EmissionResult;

      switch (method) {
        case CalculationMethod.DIRECT:
          result = await this.directCalculation(activity, factor);
          break;

        case CalculationMethod.DISTANCE_BASED:
          result = await this.distanceBasedCalculation(activity, factor);
          break;

        case CalculationMethod.SPEND_BASED:
          result = await this.spendBasedCalculation(activity, factor);
          break;

        case CalculationMethod.AVERAGE_DATA:
          result = await this.averageDataCalculation(activity, factor);
          break;

        case CalculationMethod.CUSTOM_FORMULA:
          result = await this.customFormulaCalculation(
            activity,
            factor,
            options.customFormula
          );
          break;

        default:
          throw new UnsupportedCalculationMethodException(method);
      }

      // Apply adjustments
      result = await this.applyAdjustments(result, options);

      // Add metadata
      result.metadata = {
        calculationId,
        method,
        factorUsed: factor.id,
        formula: this.getFormulaUsed(method, options),
        assumptions: this.getAssumptions(activity, factor),
        uncertainty: this.calculateUncertainty(activity, factor, result),
        version: options.calculationVersion || '1.0.0'
      };

      // Cache result
      await this.cache.set(cacheKey, result, 3600); // 1 hour

      // Audit trail
      await this.auditService.completeCalculation(
        calculationId,
        result,
        method
      );

      return result;

    } catch (error) {
      await this.auditService.failCalculation(calculationId, error);
      throw error;
    }
  }

  private async directCalculation(
    activity: Activity,
    factor: EmissionFactor
  ): Promise<EmissionResult> {
    // Direct emission = Activity Data × Emission Factor
    const activityValue = await this.convertToFactorUnit(
      activity.measurement.value,
      activity.measurement.unit,
      factor.unit
    );

    const emissions = activityValue * factor.value;

    return new EmissionResult({
      scope: this.determineScope(activity),
      category: activity.category,
      co2e: emissions,
      breakdown: {
        co2: emissions * factor.gases.co2.ratio,
        ch4: emissions * factor.gases.ch4.ratio * factor.gases.ch4.gwp,
        n2o: emissions * factor.gases.n2o.ratio * factor.gases.n2o.gwp,
        other: emissions * factor.gases.other.ratio
      },
      unit: 'kgCO2e',
      period: activity.period
    });
  }

  private async distanceBasedCalculation(
    activity: Activity,
    factor: EmissionFactor
  ): Promise<EmissionResult> {
    // For transport: Distance × Mode Factor × Occupancy Adjustment
    const distance = activity.measurement.value;
    const modeFacto = factor.value;

    // Apply occupancy adjustment if available
    const occupancyRate = activity.metadata.occupancyRate || 1;
    const loadFactor = activity.metadata.loadFactor || 1;

    const emissions = distance * modeFactor * (1 / occupancyRate) * loadFactor;

    return new EmissionResult({
      scope: Scope.THREE, // Usually Scope 3 for transport
      category: 'Business Travel',
      co2e: emissions,
      unit: 'kgCO2e'
    });
  }

  private async customFormulaCalculation(
    activity: Activity,
    factor: EmissionFactor,
    formula: string
  ): Promise<EmissionResult> {
    // Parse and evaluate custom formula
    // This is complex and might benefit from Opus 4.1
    const context = {
      activity: activity.measurement.value,
      factor: factor.value,
      gwp: factor.gases,
      metadata: activity.metadata
    };

    const result = await this.formulaParser.evaluate(formula, context);

    return new EmissionResult({
      scope: this.determineScope(activity),
      category: activity.category,
      co2e: result,
      unit: 'kgCO2e',
      formula
    });
  }

  private calculateUncertainty(
    activity: Activity,
    factor: EmissionFactor,
    result: EmissionResult
  ): number {
    // Complex uncertainty calculation - consider Opus 4.1
    // Combine uncertainties from multiple sources

    const activityUncertainty = activity.measurement.uncertainty || 5;
    const factorUncertainty = factor.uncertainty || 10;

    // Using error propagation formula for multiplication
    // σ(A×B) = |A×B| × √((σA/A)² + (σB/B)²)
    const combinedUncertainty = Math.sqrt(
      Math.pow(activityUncertainty / 100, 2) +
      Math.pow(factorUncertainty / 100, 2)
    ) * 100;

    // Add uncertainty for estimation methods
    let methodUncertainty = 0;
    if (activity.metadata.isEstimated) {
      methodUncertainty = 15;
    }

    return Math.min(
      100,
      Math.sqrt(
        Math.pow(combinedUncertainty, 2) +
        Math.pow(methodUncertainty, 2)
      )
    );
  }
}

// Calculation Methods
enum CalculationMethod {
  DIRECT = 'direct',                    // Activity Data × Emission Factor
  DISTANCE_BASED = 'distance_based',    // Distance × Mode Factor
  SPEND_BASED = 'spend_based',          // Spend × Economic Factor
  AVERAGE_DATA = 'average_data',        // Average × Count
  CUSTOM_FORMULA = 'custom_formula'     // User-defined formula
}

// Emission Scopes (GHG Protocol)
enum Scope {
  ONE = 'scope_1',     // Direct emissions
  TWO = 'scope_2',     // Indirect from energy
  THREE = 'scope_3'    // Other indirect
}
```

### 2. Aggregation Engine (Complex - Consider Opus 4.1)
```typescript
@Injectable()
export class AggregationEngine {
  constructor(
    private calculationRepository: CalculationRepository,
    private hierarchyService: HierarchyService,
    private cache: CacheService,
    private eventBus: EventBus
  ) {}

  async aggregateEmissions(
    projectId: ProjectId,
    options: AggregationOptions
  ): Promise<AggregationResult> {
    // This is complex hierarchical aggregation - consider Opus 4.1

    // Get project hierarchy
    const hierarchy = await this.hierarchyService.getHierarchy(projectId);

    // Build aggregation tree
    const tree = await this.buildAggregationTree(
      hierarchy,
      options.period
    );

    // Perform bottom-up aggregation
    const result = await this.performAggregation(tree, options);

    // Cache aggregation result
    await this.cacheResult(projectId, options, result);

    // Publish event
    await this.eventBus.publish(new RollupCompletedEvent({
      projectId,
      period: options.period,
      totalEmissions: result.total,
      timestamp: new Date()
    }));

    return result;
  }

  private async buildAggregationTree(
    hierarchy: HierarchyNode[],
    period: Period
  ): Promise<AggregationNode> {
    // Build tree structure for efficient aggregation
    const root = new AggregationNode({
      id: 'root',
      level: 0,
      children: []
    });

    // Create node map for quick access
    const nodeMap = new Map<string, AggregationNode>();
    nodeMap.set('root', root);

    // Sort by level to ensure parents are created first
    const sorted = hierarchy.sort((a, b) => a.level - b.level);

    for (const node of sorted) {
      const aggNode = new AggregationNode({
        id: node.id,
        level: node.level,
        name: node.name,
        type: node.type,
        children: [],
        emissions: await this.getNodeEmissions(node.id, period)
      });

      nodeMap.set(node.id, aggNode);

      // Add to parent
      const parent = nodeMap.get(node.parentId || 'root');
      if (parent) {
        parent.children.push(aggNode);
      }
    }

    return root;
  }

  private async performAggregation(
    node: AggregationNode,
    options: AggregationOptions
  ): Promise<AggregationResult> {
    // Recursive bottom-up aggregation
    let totalEmissions = node.emissions || 0;
    const breakdown: EmissionBreakdown = {
      scope1: 0,
      scope2: 0,
      scope3: 0,
      byCategory: {},
      byGas: {}
    };

    // Aggregate children first (post-order traversal)
    for (const child of node.children) {
      const childResult = await this.performAggregation(child, options);

      // Add child emissions to parent
      totalEmissions += childResult.total;

      // Merge breakdowns
      breakdown.scope1 += childResult.breakdown.scope1;
      breakdown.scope2 += childResult.breakdown.scope2;
      breakdown.scope3 += childResult.breakdown.scope3;

      // Merge category breakdown
      for (const [category, value] of Object.entries(
        childResult.breakdown.byCategory
      )) {
        breakdown.byCategory[category] =
          (breakdown.byCategory[category] || 0) + value;
      }
    }

    // Apply aggregation rules
    if (options.excludeOffsets && node.type === 'offset') {
      totalEmissions = 0;
    }

    if (options.includeUncertainty) {
      // Calculate aggregate uncertainty
      // This is complex - might need Opus 4.1
      const aggregateUncertainty = this.calculateAggregateUncertainty(
        node,
        options
      );
      breakdown.uncertainty = aggregateUncertainty;
    }

    return {
      nodeId: node.id,
      nodeName: node.name,
      level: node.level,
      total: totalEmissions,
      breakdown,
      children: node.children.map(c => c.id),
      calculatedAt: new Date()
    };
  }

  private calculateAggregateUncertainty(
    node: AggregationNode,
    options: AggregationOptions
  ): number {
    // Complex uncertainty aggregation
    // When adding uncertain values, uncertainties combine as:
    // σ_total = √(σ₁² + σ₂² + ... + σₙ²)

    if (!node.children.length) {
      return node.uncertainty || 10;
    }

    const uncertainties = node.children.map(
      child => Math.pow(child.uncertainty || 10, 2)
    );

    return Math.sqrt(uncertainties.reduce((sum, u) => sum + u, 0));
  }
}

class AggregationNode {
  id: string;
  level: number;
  name: string;
  type: string;
  children: AggregationNode[];
  emissions?: number;
  uncertainty?: number;

  constructor(props: Partial<AggregationNode>) {
    Object.assign(this, props);
  }
}
```

### 3. Recalculation Service
```typescript
@Injectable()
export class RecalculationService {
  constructor(
    private calculationEngine: CalculationEngine,
    private activityRepository: ActivityRepository,
    private calculationRepository: CalculationRepository,
    private eventBus: EventBus,
    @Inject('DB_CONNECTION') private db: Connection
  ) {}

  async recalculateProject(
    projectId: ProjectId,
    options: RecalculationOptions
  ): Promise<RecalculationResult> {
    const session = await this.db.startSession();
    const result: RecalculationResult = {
      totalActivities: 0,
      recalculated: 0,
      unchanged: 0,
      failed: 0,
      changes: []
    };

    try {
      await session.withTransaction(async () => {
        // Get activities for recalculation
        const activities = await this.activityRepository.findByProject(
          projectId,
          options.period,
          session
        );

        result.totalActivities = activities.length;

        // Process in batches for performance
        const batchSize = 50;
        for (let i = 0; i < activities.length; i += batchSize) {
          const batch = activities.slice(i, i + batchSize);

          await Promise.all(
            batch.map(async activity => {
              try {
                // Get previous calculation
                const previousCalc = await this.calculationRepository
                  .findLatestForActivity(activity.id, session);

                // Recalculate
                const newCalc = await this.calculationEngine
                  .calculateEmissions(activity, {
                    ...options,
                    forceRecalculation: true
                  });

                // Compare results
                if (previousCalc) {
                  const change = this.compareCalculations(
                    previousCalc,
                    newCalc
                  );

                  if (Math.abs(change.percentChange) > 0.01) {
                    result.recalculated++;
                    result.changes.push(change);

                    // Save new calculation
                    await this.calculationRepository.save(
                      newCalc,
                      session
                    );
                  } else {
                    result.unchanged++;
                  }
                } else {
                  // First calculation
                  result.recalculated++;
                  await this.calculationRepository.save(newCalc, session);
                }

              } catch (error) {
                result.failed++;
                console.error(
                  `Failed to recalculate activity ${activity.id}:`,
                  error
                );
              }
            })
          );
        }

        // Publish recalculation event
        await this.eventBus.publish(new ProjectRecalculatedEvent({
          projectId,
          totalActivities: result.totalActivities,
          recalculated: result.recalculated,
          averageChange: this.calculateAverageChange(result.changes),
          timestamp: new Date()
        }));
      });
    } finally {
      await session.endSession();
    }

    return result;
  }

  private compareCalculations(
    previous: EmissionResult,
    current: EmissionResult
  ): CalculationChange {
    const difference = current.co2e - previous.co2e;
    const percentChange = (difference / previous.co2e) * 100;

    return {
      activityId: previous.activityId,
      previousValue: previous.co2e,
      currentValue: current.co2e,
      difference,
      percentChange,
      reason: this.determineChangeReason(previous, current)
    };
  }

  private determineChangeReason(
    previous: EmissionResult,
    current: EmissionResult
  ): string {
    if (previous.metadata.factorUsed !== current.metadata.factorUsed) {
      return 'Emission factor updated';
    }

    if (previous.metadata.method !== current.metadata.method) {
      return 'Calculation method changed';
    }

    if (previous.metadata.version !== current.metadata.version) {
      return 'Calculation version updated';
    }

    return 'Formula or parameters changed';
  }
}
```

## API Endpoints

### Calculations
```typescript
POST   /calculate              - Calculate emissions for activity
POST   /calculate/bulk         - Bulk calculation
GET    /calculations           - List calculations
GET    /calculations/:id       - Get calculation details
POST   /recalculate/project/:id - Recalculate entire project
```

### Aggregations
```typescript
GET    /aggregate/project/:id  - Get project aggregation
GET    /aggregate/scope        - Aggregate by scope
GET    /aggregate/category     - Aggregate by category
GET    /aggregate/time-series  - Time series aggregation
POST   /aggregate/custom       - Custom aggregation query
```

### Reports
```typescript
GET    /footprint/project/:id  - Get carbon footprint
GET    /footprint/organization/:id - Organization footprint
GET    /intensity/project/:id  - Carbon intensity metrics
```

## Events Published

```typescript
// Calculation.Emission.Calculated
{
  calculationId: string;
  activityId: string;
  projectId: string;
  emissions: number;
  unit: string;
  scope: string;
  method: string;
  uncertainty: number;
  timestamp: Date;
}

// Calculation.Rollup.Completed
{
  projectId: string;
  period: Period;
  totalEmissions: number;
  breakdown: EmissionBreakdown;
  aggregationLevel: string;
  timestamp: Date;
}

// Calculation.Project.Recalculated
{
  projectId: string;
  totalActivities: number;
  recalculated: number;
  averageChange: number;
  timestamp: Date;
}
```

## Database Schema

### Calculations Collection
```javascript
{
  _id: ObjectId,
  activityId: ObjectId,
  projectId: ObjectId,
  emissions: {
    co2e: number,
    co2: number,
    ch4: number,
    n2o: number,
    other: number
  },
  scope: string,
  category: string,
  unit: string,
  period: {
    start: Date,
    end: Date
  },
  metadata: {
    calculationId: string,
    method: string,
    factorUsed: ObjectId,
    formula: string,
    assumptions: string[],
    uncertainty: number,
    version: string
  },
  audit: {
    calculatedBy: string,
    calculatedAt: Date,
    reason: string
  },
  status: 'valid' | 'superseded' | 'error',
  createdAt: Date
}
```

### Aggregations Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  period: {
    start: Date,
    end: Date
  },
  hierarchyLevel: string,
  nodeId: string,
  nodeName: string,
  totalEmissions: number,
  breakdown: {
    scope1: number,
    scope2: number,
    scope3: number,
    byCategory: object,
    byGas: object,
    uncertainty: number
  },
  children: string[],
  calculatedAt: Date,
  version: string
}
```

## Testing Requirements

### Unit Tests
```typescript
describe('Calculation Engine', () => {
  it('should calculate direct emissions correctly');
  it('should apply correct GWP values');
  it('should handle unit conversions');
  it('should calculate uncertainty properly');
});

describe('Aggregation Engine', () => {
  it('should aggregate hierarchically');
  it('should handle circular references');
  it('should calculate aggregate uncertainty');
  it('should cache aggregation results');
});
```

## Commands
- `/calculate [activityId]` - Calculate emissions
- `/recalculate [projectId]` - Recalculate project
- `/aggregate [projectId] [level]` - Run aggregation
- `/clear-cache [projectId]` - Clear calculation cache
- `/validate-formulas` - Validate custom formulas

## Success Metrics
- No V1 folder duplication issues
- Calculation results cached
- Full audit trail maintained
- Aggregations optimized (incremental)
- All calculations versioned
- Uncertainty tracked throughout
- Performance < 500ms per calculation

## Current Sprint 0.1 Tasks
1. Implement core calculation engine
2. Add emission factor integration
3. Build aggregation tree algorithm
4. Implement caching strategy
5. Add calculation audit trail
6. Create recalculation service
7. Add uncertainty calculations
8. Remove V1 folder references from OLD

Remember: Calculations are the core value of the system. They must be accurate, auditable, and performant. Consider Opus 4.1 for complex algorithms.