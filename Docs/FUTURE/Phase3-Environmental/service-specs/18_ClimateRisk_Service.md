# Climate Risk Service Specification

## Service Overview

**Service Name**: Climate Risk Service
**Port**: 3018
**Type**: Environmental Domain Service
**Phase**: 3 (Environmental - Climate Risk & TCFD)
**Criticality**: CRITICAL
**Story Points**: 70 (LARGEST Phase 3 Service)

### Purpose

The Climate Risk Service is the most comprehensive environmental service in the Clenergize platform, providing complete climate risk assessment, scenario analysis, and financial impact quantification following TCFD recommendations. This service is critical for regulatory compliance (TCFD, CSRD, SEC) and strategic climate risk management, enabling organizations to understand, quantify, and manage both physical and transition climate risks while identifying climate-related opportunities.

### Business Value

- **Regulatory Compliance**: Meet TCFD, CSRD, SEC climate disclosure requirements
- **Risk Quantification**: Quantify financial impacts of climate change
- **Strategic Planning**: Inform business strategy with scenario analysis
- **Investor Confidence**: Provide transparent climate risk disclosure
- **Resilience Building**: Identify vulnerabilities and adaptation measures
- **Opportunity Identification**: Discover climate-related business opportunities
- **Cost Optimization**: Reduce climate-related operational costs
- **Competitive Advantage**: Lead in climate risk management

## Core Responsibilities

### 1. TCFD Framework Implementation
- Complete TCFD governance, strategy, risk management, metrics & targets
- Board-level climate oversight tracking
- Management accountability and roles
- Climate strategy integration
- Risk management processes
- Metrics and target setting

### 2. Physical Risk Assessment
- Acute risk modeling (extreme weather events)
- Chronic risk assessment (long-term climate changes)
- Asset-level vulnerability scoring
- Supply chain risk mapping
- Infrastructure resilience assessment
- Climate hazard quantification

### 3. Transition Risk Analysis
- Policy and regulatory risk assessment
- Technology transition risk evaluation
- Market risk analysis
- Reputation risk monitoring
- Stranded asset identification
- Carbon pricing exposure

### 4. Scenario Analysis
- NGFS scenario implementation
- IEA scenario modeling
- IPCC pathway analysis
- Custom scenario development
- Multi-scenario comparison
- Sensitivity analysis

### 5. Financial Impact Modeling
- Revenue impact quantification
- Operating cost projections
- Capital expenditure planning
- Asset valuation impacts
- Insurance cost modeling
- Cost of capital assessment

### 6. Opportunity Assessment
- Resource efficiency opportunities
- Low-carbon product potential
- New market identification
- Resilience value creation
- Green finance opportunities
- Innovation potential

## Technical Architecture

### Domain Model

```typescript
// Core Entities
interface TCFDAssessment {
  id: string;
  organizationId: string;
  assessmentPeriod: {
    startDate: Date;
    endDate: Date;
  };
  governance: TCFDGovernance;
  strategy: TCFDStrategy;
  riskManagement: TCFDRiskManagement;
  metricsTargets: TCFDMetricsTargets;
  status: AssessmentStatus;
  version: string;
  auditTrail: AuditEntry[];
  createdAt: Date;
  updatedAt: Date;
}

interface PhysicalRisk {
  id: string;
  organizationId: string;
  assetId: string;
  riskType: PhysicalRiskType;
  hazardType: ClimateHazard;
  probability: number; // 0-1
  severity: RiskSeverity;
  financialImpact: FinancialImpact;
  timeHorizon: TimeHorizon;
  scenario: ClimateScenario;
  vulnerabilityScore: number; // 0-100
  exposureMetrics: ExposureMetrics;
  adaptationMeasures: AdaptationMeasure[];
  lastAssessedAt: Date;
}

interface TransitionRisk {
  id: string;
  organizationId: string;
  riskCategory: TransitionRiskCategory;
  riskDriver: string;
  likelihood: number; // 0-1
  magnitude: RiskMagnitude;
  financialImpact: FinancialImpact;
  timeHorizon: TimeHorizon;
  scenario: TransitionScenario;
  exposureFactors: ExposureFactor[];
  mitigationActions: MitigationAction[];
  dependencies: RiskDependency[];
  assessmentDate: Date;
}

interface ClimateScenarioAnalysis {
  id: string;
  organizationId: string;
  scenarioSet: ScenarioSet;
  baselineYear: number;
  targetYears: number[];
  scenarios: ScenarioResult[];
  assumptions: ScenarioAssumption[];
  sensitivities: SensitivityAnalysis[];
  financialProjections: FinancialProjection[];
  strategicImplications: StrategicImplication[];
  uncertaintyRange: UncertaintyBand;
  validationStatus: ValidationStatus;
  createdAt: Date;
}

interface ClimateOpportunity {
  id: string;
  organizationId: string;
  opportunityType: OpportunityType;
  category: OpportunityCategory;
  description: string;
  potentialValue: FinancialValue;
  realizationProbability: number;
  timeToRealize: TimeFrame;
  requiredInvestment: Investment;
  strategicAlignment: StrategicScore;
  enablers: OpportunityEnabler[];
  barriers: OpportunityBarrier[];
  actionPlan: ActionItem[];
  status: OpportunityStatus;
}

// Value Objects
interface TCFDGovernance {
  boardOversight: {
    climateCommittee: boolean;
    meetingFrequency: string;
    responsibilities: string[];
    expertise: ExpertiseLevel;
  };
  managementRole: {
    responsibleExecutive: string;
    reportingLine: string;
    performanceMetrics: string[];
    compensationLink: boolean;
  };
  policies: GovernancePolicy[];
  training: TrainingProgram[];
}

interface TCFDStrategy {
  risksIdentified: StrategicRisk[];
  opportunitiesIdentified: StrategicOpportunity[];
  businessImpact: BusinessImpactAssessment;
  strategyResilience: ResilienceAssessment;
  scenariosUsed: ScenarioReference[];
  timeHorizons: {
    short: TimeHorizonDefinition;
    medium: TimeHorizonDefinition;
    long: TimeHorizonDefinition;
  };
}

interface TCFDRiskManagement {
  identificationProcess: RiskProcess;
  assessmentMethodology: AssessmentMethod[];
  managementApproach: ManagementFramework;
  integrationLevel: IntegrationMaturity;
  monitoringFrequency: string;
  escalationProtocol: EscalationPath[];
}

interface TCFDMetricsTargets {
  ghgEmissions: EmissionsMetrics;
  climateMetrics: ClimateKPI[];
  riskMetrics: RiskIndicator[];
  opportunityMetrics: OpportunityKPI[];
  targets: ClimateTarget[];
  performanceTracking: PerformanceData[];
}

interface FinancialImpact {
  impactType: FinancialImpactType;
  amount: {
    best: number;
    expected: number;
    worst: number;
    currency: string;
  };
  timing: {
    startYear: number;
    peakYear: number;
    duration: number;
  };
  drivers: ImpactDriver[];
  assumptions: string[];
  confidence: ConfidenceLevel;
  methodology: string;
}

interface ClimateScenario {
  framework: ScenarioFramework; // NGFS, IEA, IPCC
  name: string;
  pathway: string; // e.g., "Net Zero 2050"
  temperatureOutcome: number; // degrees Celsius
  assumptions: {
    carbonPrice: CarbonPriceTrajectory;
    policyStringency: PolicyLevel;
    technologyDevelopment: TechProgress;
    behaviorChange: BehaviorShift;
  };
  parameters: ScenarioParameter[];
}

interface AdaptationMeasure {
  id: string;
  type: AdaptationType;
  description: string;
  cost: {
    capital: number;
    operational: number;
    currency: string;
  };
  effectiveness: number; // 0-100%
  implementationTime: number; // months
  cobenefits: string[];
  barriers: string[];
  status: ImplementationStatus;
  timeline: Timeline;
}

// Enums
enum PhysicalRiskType {
  ACUTE_HURRICANE = 'ACUTE_HURRICANE',
  ACUTE_FLOOD = 'ACUTE_FLOOD',
  ACUTE_WILDFIRE = 'ACUTE_WILDFIRE',
  ACUTE_HEATWAVE = 'ACUTE_HEATWAVE',
  ACUTE_DROUGHT = 'ACUTE_DROUGHT',
  CHRONIC_TEMPERATURE = 'CHRONIC_TEMPERATURE',
  CHRONIC_SEA_LEVEL = 'CHRONIC_SEA_LEVEL',
  CHRONIC_PRECIPITATION = 'CHRONIC_PRECIPITATION',
  CHRONIC_WATER_STRESS = 'CHRONIC_WATER_STRESS'
}

enum TransitionRiskCategory {
  POLICY_LEGAL = 'POLICY_LEGAL',
  TECHNOLOGY = 'TECHNOLOGY',
  MARKET = 'MARKET',
  REPUTATION = 'REPUTATION'
}

enum OpportunityType {
  RESOURCE_EFFICIENCY = 'RESOURCE_EFFICIENCY',
  ENERGY_SOURCE = 'ENERGY_SOURCE',
  PRODUCTS_SERVICES = 'PRODUCTS_SERVICES',
  MARKETS = 'MARKETS',
  RESILIENCE = 'RESILIENCE'
}

enum ScenarioFramework {
  NGFS = 'NGFS',
  IEA = 'IEA',
  IPCC = 'IPCC',
  CUSTOM = 'CUSTOM'
}

enum TimeHorizon {
  SHORT = 'SHORT', // 0-3 years
  MEDIUM = 'MEDIUM', // 3-10 years
  LONG = 'LONG' // 10+ years
}
```

### Service Interface

```typescript
interface IClimateRiskService {
  // TCFD Assessment
  createTCFDAssessment(data: CreateTCFDAssessmentDto): Promise<TCFDAssessment>;
  updateTCFDAssessment(id: string, updates: UpdateTCFDAssessmentDto): Promise<TCFDAssessment>;
  getTCFDAssessment(id: string): Promise<TCFDAssessment>;
  generateTCFDReport(assessmentId: string): Promise<TCFDReport>;

  // Physical Risk
  assessPhysicalRisks(params: PhysicalRiskParams): Promise<PhysicalRisk[]>;
  calculateAssetVulnerability(assetId: string, scenario: string): Promise<VulnerabilityScore>;
  projectClimateHazards(location: Location, scenarios: string[]): Promise<HazardProjection[]>;
  evaluateAdaptationMeasures(riskId: string): Promise<AdaptationOption[]>;

  // Transition Risk
  assessTransitionRisks(params: TransitionRiskParams): Promise<TransitionRisk[]>;
  analyzePolicyExposure(organizationId: string): Promise<PolicyExposure>;
  evaluateTechnologyRisks(portfolio: AssetPortfolio): Promise<TechRiskAssessment>;
  assessMarketRisks(products: Product[]): Promise<MarketRiskProfile>;

  // Scenario Analysis
  runScenarioAnalysis(params: ScenarioAnalysisParams): Promise<ClimateScenarioAnalysis>;
  compareScenarios(scenarios: string[]): Promise<ScenarioComparison>;
  performSensitivityAnalysis(baseScenario: string, variables: string[]): Promise<SensitivityResult>;
  generateScenarioNarrative(scenarioId: string): Promise<ScenarioNarrative>;

  // Financial Impact
  quantifyFinancialImpact(risks: Risk[]): Promise<FinancialImpact>;
  projectRevenueImpact(scenarios: string[]): Promise<RevenueProjection>;
  estimateOperatingCosts(climate: ClimateProjection): Promise<OpExProjection>;
  assessAssetValuation(portfolio: AssetPortfolio): Promise<ValuationImpact>;

  // Opportunities
  identifyOpportunities(context: BusinessContext): Promise<ClimateOpportunity[]>;
  evaluateOpportunityValue(opportunityId: string): Promise<OpportunityValuation>;
  prioritizeOpportunities(opportunities: string[]): Promise<PriorityMatrix>;
  developActionPlan(opportunityId: string): Promise<ActionPlan>;

  // Resilience
  assessResilience(organizationId: string): Promise<ResilienceScore>;
  testStressScenarios(params: StressTestParams): Promise<StressTestResult>;
  evaluateAdaptiveCapacity(organizationId: string): Promise<AdaptiveCapacityScore>;
  recommendResilienceActions(gaps: ResilienceGap[]): Promise<ResilienceAction[]>;
}
```

## API Endpoints

### RESTful Endpoints

```yaml
# TCFD Assessment Management
POST   /api/v1/climate-risk/tcfd-assessments
GET    /api/v1/climate-risk/tcfd-assessments
GET    /api/v1/climate-risk/tcfd-assessments/{id}
PUT    /api/v1/climate-risk/tcfd-assessments/{id}
DELETE /api/v1/climate-risk/tcfd-assessments/{id}
POST   /api/v1/climate-risk/tcfd-assessments/{id}/submit
POST   /api/v1/climate-risk/tcfd-assessments/{id}/report

# Physical Risk Assessment
POST   /api/v1/climate-risk/physical-risks/assess
GET    /api/v1/climate-risk/physical-risks
GET    /api/v1/climate-risk/physical-risks/{id}
POST   /api/v1/climate-risk/physical-risks/{id}/adaptation-measures
GET    /api/v1/climate-risk/assets/{assetId}/vulnerability
POST   /api/v1/climate-risk/hazards/project
GET    /api/v1/climate-risk/hazards/map

# Transition Risk Assessment
POST   /api/v1/climate-risk/transition-risks/assess
GET    /api/v1/climate-risk/transition-risks
GET    /api/v1/climate-risk/transition-risks/{id}
POST   /api/v1/climate-risk/transition-risks/{id}/mitigation-actions
GET    /api/v1/climate-risk/policy-exposure
GET    /api/v1/climate-risk/technology-risks
GET    /api/v1/climate-risk/market-risks

# Scenario Analysis
POST   /api/v1/climate-risk/scenarios/analyze
GET    /api/v1/climate-risk/scenarios
GET    /api/v1/climate-risk/scenarios/{id}
POST   /api/v1/climate-risk/scenarios/compare
POST   /api/v1/climate-risk/scenarios/sensitivity
GET    /api/v1/climate-risk/scenarios/{id}/narrative
POST   /api/v1/climate-risk/scenarios/custom

# Financial Impact Quantification
POST   /api/v1/climate-risk/financial-impact/calculate
GET    /api/v1/climate-risk/financial-impact/{riskId}
POST   /api/v1/climate-risk/revenue-projection
POST   /api/v1/climate-risk/cost-projection
POST   /api/v1/climate-risk/asset-valuation
GET    /api/v1/climate-risk/financial-summary

# Climate Opportunities
POST   /api/v1/climate-risk/opportunities/identify
GET    /api/v1/climate-risk/opportunities
GET    /api/v1/climate-risk/opportunities/{id}
POST   /api/v1/climate-risk/opportunities/{id}/evaluate
POST   /api/v1/climate-risk/opportunities/prioritize
POST   /api/v1/climate-risk/opportunities/{id}/action-plan

# Resilience Assessment
POST   /api/v1/climate-risk/resilience/assess
GET    /api/v1/climate-risk/resilience/{organizationId}
POST   /api/v1/climate-risk/resilience/stress-test
GET    /api/v1/climate-risk/adaptive-capacity
POST   /api/v1/climate-risk/resilience/recommendations

# Reporting and Analytics
GET    /api/v1/climate-risk/dashboard
GET    /api/v1/climate-risk/metrics
GET    /api/v1/climate-risk/trends
POST   /api/v1/climate-risk/reports/generate
GET    /api/v1/climate-risk/benchmarks
```

### GraphQL Schema

```graphql
type Query {
  # TCFD Assessments
  tcfdAssessment(id: ID!): TCFDAssessment
  tcfdAssessments(filter: TCFDFilter, pagination: Pagination): TCFDAssessmentConnection

  # Physical Risks
  physicalRisk(id: ID!): PhysicalRisk
  physicalRisks(filter: PhysicalRiskFilter): [PhysicalRisk!]!
  assetVulnerability(assetId: ID!, scenario: String!): VulnerabilityScore
  climateHazards(location: LocationInput!, timeHorizon: TimeHorizon!): [ClimateHazard!]!

  # Transition Risks
  transitionRisk(id: ID!): TransitionRisk
  transitionRisks(filter: TransitionRiskFilter): [TransitionRisk!]!
  policyExposure(organizationId: ID!): PolicyExposure
  technologyRisks(portfolio: ID!): [TechnologyRisk!]!

  # Scenario Analysis
  climateScenario(id: ID!): ClimateScenarioAnalysis
  scenarios(framework: ScenarioFramework): [ClimateScenario!]!
  scenarioComparison(scenarios: [ID!]!): ScenarioComparison

  # Financial Impact
  financialImpact(riskId: ID!): FinancialImpact
  financialProjections(scenarioId: ID!): FinancialProjections

  # Opportunities
  climateOpportunity(id: ID!): ClimateOpportunity
  opportunities(filter: OpportunityFilter): [ClimateOpportunity!]!
  opportunityPrioritization: PriorityMatrix

  # Resilience
  resilienceScore(organizationId: ID!): ResilienceScore
  adaptiveCapacity(organizationId: ID!): AdaptiveCapacityScore

  # Analytics
  climateRiskDashboard(organizationId: ID!): ClimateRiskDashboard
  riskTrends(period: DateRange!): RiskTrendAnalysis
  peerBenchmark(organizationId: ID!): BenchmarkComparison
}

type Mutation {
  # TCFD Assessment
  createTCFDAssessment(input: CreateTCFDAssessmentInput!): TCFDAssessment!
  updateTCFDAssessment(id: ID!, input: UpdateTCFDAssessmentInput!): TCFDAssessment!
  submitTCFDAssessment(id: ID!): TCFDAssessment!

  # Risk Assessment
  assessPhysicalRisks(input: PhysicalRiskAssessmentInput!): [PhysicalRisk!]!
  assessTransitionRisks(input: TransitionRiskAssessmentInput!): [TransitionRisk!]!

  # Scenario Analysis
  runScenarioAnalysis(input: ScenarioAnalysisInput!): ClimateScenarioAnalysis!
  createCustomScenario(input: CustomScenarioInput!): ClimateScenario!

  # Financial Impact
  calculateFinancialImpact(input: FinancialImpactInput!): FinancialImpact!

  # Opportunities
  identifyOpportunities(input: OpportunityIdentificationInput!): [ClimateOpportunity!]!
  evaluateOpportunity(id: ID!): OpportunityValuation!

  # Adaptation & Mitigation
  createAdaptationPlan(input: AdaptationPlanInput!): AdaptationPlan!
  createTransitionPlan(input: TransitionPlanInput!): TransitionPlan!

  # Resilience
  performStressTest(input: StressTestInput!): StressTestResult!
  generateResilienceRecommendations(input: ResilienceGapInput!): [ResilienceAction!]!
}

type Subscription {
  # Real-time Risk Monitoring
  physicalRiskAlert(severity: RiskSeverity!): PhysicalRiskAlert!
  transitionRiskUpdate(category: TransitionRiskCategory!): TransitionRiskUpdate!

  # Scenario Updates
  scenarioParameterChange(framework: ScenarioFramework!): ScenarioUpdate!

  # Climate Data Updates
  climateDataUpdate(location: LocationInput!): ClimateDataUpdate!
  hazardAlert(hazardType: ClimateHazard!): HazardAlert!

  # Financial Impact Tracking
  financialImpactChange(threshold: Float!): FinancialImpactAlert!
}
```

## Event Sourcing

### Published Events

```typescript
// Physical Risk Events
interface PhysicalRiskIdentifiedEvent {
  type: 'climate-risk.physical-risk.identified.v1';
  aggregateId: string;
  organizationId: string;
  assetId: string;
  riskType: PhysicalRiskType;
  hazardType: ClimateHazard;
  severity: RiskSeverity;
  financialImpact: number;
  scenario: string;
  timeHorizon: TimeHorizon;
  correlationId: string;
  timestamp: Date;
}

// Transition Risk Events
interface TransitionRiskIdentifiedEvent {
  type: 'climate-risk.transition-risk.identified.v1';
  aggregateId: string;
  organizationId: string;
  riskCategory: TransitionRiskCategory;
  likelihood: number;
  magnitude: RiskMagnitude;
  financialImpact: number;
  scenario: string;
  correlationId: string;
  timestamp: Date;
}

// Scenario Analysis Events
interface ScenarioAnalyzedEvent {
  type: 'climate-risk.scenario.analyzed.v1';
  aggregateId: string;
  organizationId: string;
  scenarioSet: string;
  scenarios: string[];
  timeHorizons: number[];
  keyFindings: KeyFinding[];
  correlationId: string;
  timestamp: Date;
}

// Financial Impact Events
interface FinancialImpactQuantifiedEvent {
  type: 'climate-risk.financial-impact.quantified.v1';
  aggregateId: string;
  organizationId: string;
  impactType: FinancialImpactType;
  amount: {
    best: number;
    expected: number;
    worst: number;
  };
  timeframe: TimeFrame;
  confidence: ConfidenceLevel;
  correlationId: string;
  timestamp: Date;
}

// TCFD Assessment Events
interface TCFDAssessmentCompletedEvent {
  type: 'climate-risk.tcfd-assessment.completed.v1';
  aggregateId: string;
  organizationId: string;
  assessmentId: string;
  completionDate: Date;
  maturityScore: number;
  keyRisks: string[];
  keyOpportunities: string[];
  correlationId: string;
  timestamp: Date;
}

// Adaptation Events
interface AdaptationMeasureImplementedEvent {
  type: 'climate-risk.adaptation-measure.implemented.v1';
  aggregateId: string;
  organizationId: string;
  measureId: string;
  measureType: AdaptationType;
  riskAddressed: string;
  effectiveness: number;
  cost: number;
  correlationId: string;
  timestamp: Date;
}

// Transition Planning Events
interface TransitionPlanUpdatedEvent {
  type: 'climate-risk.transition-plan.updated.v1';
  aggregateId: string;
  organizationId: string;
  planId: string;
  targetYear: number;
  pathwayType: string;
  milestones: Milestone[];
  correlationId: string;
  timestamp: Date;
}
```

### Consumed Events

```typescript
// From Organization Service
interface FacilityCreatedEvent {
  type: 'organization.facility.created.v1';
  facilityId: string;
  location: Location;
  assetValue: number;
  operationalImportance: string;
}

// From Carbon Service
interface EmissionCalculatedEvent {
  type: 'carbon.emission.calculated.v1';
  scope: EmissionScope;
  amount: number;
  trend: TrendDirection;
}

// From Water Service
interface WaterStressAssessmentCompletedEvent {
  type: 'water.stress.assessment.completed.v1';
  locationId: string;
  stressLevel: WaterStressLevel;
  futureProjection: WaterProjection;
}

// From Biodiversity Service
interface BiodiversityAssessmentCompletedEvent {
  type: 'biodiversity.assessment.completed.v1';
  siteId: string;
  ecosystemDependencies: Dependency[];
  biodiversityRisks: Risk[];
}
```

## Data Models

### MongoDB Collections

```typescript
// tcfd_assessments Collection
{
  _id: ObjectId,
  organizationId: string,
  assessmentYear: number,
  status: 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'PUBLISHED',

  governance: {
    boardOversight: {
      hasClimateCommittee: boolean,
      committeeMembers: string[],
      meetingFrequency: string,
      climateExpertise: {
        level: string,
        trainingProvided: boolean,
        externalAdvisors: string[]
      },
      keyDecisions: string[],
      reportingFrequency: string
    },
    managementRole: {
      chiefSustainabilityOfficer: string,
      climateSteeringCommittee: boolean,
      reportingStructure: string,
      kpis: string[],
      compensationLinked: boolean,
      compensationMetrics: string[]
    },
    policies: [{
      name: string,
      scope: string,
      lastUpdated: Date,
      nextReview: Date
    }]
  },

  strategy: {
    timeHorizons: {
      short: { years: string, definition: string },
      medium: { years: string, definition: string },
      long: { years: string, definition: string }
    },
    risksIdentified: [{
      type: string,
      description: string,
      impact: string,
      likelihood: string,
      timeHorizon: string,
      financialImpact: number
    }],
    opportunitiesIdentified: [{
      type: string,
      description: string,
      potential: string,
      timeHorizon: string,
      investment: number,
      return: number
    }],
    scenariosUsed: [{
      framework: string,
      name: string,
      temperature: number,
      description: string
    }],
    strategyResilience: {
      score: number,
      assessment: string,
      adaptationMeasures: string[]
    }
  },

  riskManagement: {
    identificationProcess: string,
    assessmentMethodology: string[],
    managementApproach: string,
    integrationLevel: string,
    tools: string[],
    frequency: string,
    responsibilities: object
  },

  metricsTargets: {
    ghgEmissions: {
      scope1: number,
      scope2: number,
      scope3: number,
      intensity: number,
      trend: string
    },
    climateMetrics: [{
      name: string,
      value: number,
      unit: string,
      target: number,
      progress: number
    }],
    targets: [{
      type: string,
      baseline: number,
      target: number,
      year: number,
      progress: number,
      verified: boolean
    }]
  },

  maturityScore: {
    governance: number,
    strategy: number,
    riskManagement: number,
    metricsTargets: number,
    overall: number
  },

  assurance: {
    level: string,
    provider: string,
    scope: string[],
    date: Date,
    findings: string[]
  },

  metadata: {
    createdBy: string,
    createdAt: Date,
    updatedBy: string,
    updatedAt: Date,
    version: number,
    tags: string[]
  }
}

// physical_risks Collection
{
  _id: ObjectId,
  organizationId: string,
  assetId: string,
  assetDetails: {
    name: string,
    type: string,
    location: {
      address: string,
      coordinates: {
        lat: number,
        lng: number
      },
      elevation: number,
      coastalDistance: number
    },
    value: {
      book: number,
      replacement: number,
      currency: string
    },
    criticalityScore: number
  },

  riskAssessment: {
    hazardType: string,
    hazardCategory: 'ACUTE' | 'CHRONIC',
    currentExposure: {
      frequency: number,
      intensity: number,
      duration: number
    },
    futureExposure: {
      2030: { frequency: number, intensity: number },
      2050: { frequency: number, intensity: number },
      2100: { frequency: number, intensity: number }
    },
    scenarios: [{
      name: string,
      pathway: string,
      exposure: object,
      confidence: number
    }]
  },

  vulnerability: {
    structuralVulnerability: number,
    operationalVulnerability: number,
    supplyChainVulnerability: number,
    overallScore: number,
    factors: [{
      name: string,
      score: number,
      weight: number
    }]
  },

  financialImpact: {
    directDamage: {
      best: number,
      expected: number,
      worst: number
    },
    businessInterruption: {
      days: number,
      revenue: number,
      recovery: number
    },
    indirectCosts: {
      supplyChain: number,
      reputation: number,
      regulatory: number
    },
    insurance: {
      covered: number,
      deductible: number,
      premiumIncrease: number
    },
    totalImpact: number
  },

  adaptationOptions: [{
    measure: string,
    type: string,
    effectiveness: number,
    cost: {
      capital: number,
      operational: number
    },
    implementationTime: number,
    cobenefits: string[],
    selected: boolean,
    status: string
  }],

  riskScore: {
    inherent: number,
    residual: number,
    trend: string
  },

  assessmentDate: Date,
  nextReview: Date,
  dataQuality: {
    score: number,
    sources: string[],
    gaps: string[]
  }
}

// transition_risks Collection
{
  _id: ObjectId,
  organizationId: string,
  riskId: string,

  category: 'POLICY_LEGAL' | 'TECHNOLOGY' | 'MARKET' | 'REPUTATION',

  policyLegal: {
    carbonPricing: {
      currentExposure: number,
      projectedCosts: {
        2030: number,
        2040: number,
        2050: number
      },
      jurisdictions: string[],
      complianceCost: number
    },
    regulations: [{
      name: string,
      jurisdiction: string,
      effectiveDate: Date,
      impact: string,
      complianceStatus: string
    }],
    litigation: {
      currentCases: number,
      potentialExposure: number,
      insuranceCoverage: number
    }
  },

  technology: {
    strandedAssets: [{
      asset: string,
      value: number,
      usefulLife: number,
      strandingRisk: number,
      strandingDate: Date
    }],
    substitutionRisk: {
      products: string[],
      marketShare: number,
      substitutionRate: number,
      timeline: string
    },
    r&dRequirements: {
      investment: number,
      timeline: number,
      success: number
    }
  },

  market: {
    demandShift: {
      products: string[],
      currentDemand: number,
      projectedChange: number,
      revenue: number
    },
    inputCosts: [{
      input: string,
      currentCost: number,
      projectedIncrease: number,
      alternatives: string[]
    }],
    energyCosts: {
      current: number,
      projected: object,
      renewableShare: number
    }
  },

  reputation: {
    stakeholderConcerns: [{
      stakeholder: string,
      concern: string,
      impact: string,
      engagement: string
    }],
    esgRatings: {
      current: number,
      trend: string,
      peerComparison: number
    },
    brandValue: {
      current: number,
      atRisk: number,
      protection: string[]
    }
  },

  financialQuantification: {
    scenario: string,
    timeHorizon: string,
    probability: number,
    impact: {
      revenue: number,
      costs: number,
      capex: number,
      marketCap: number
    },
    npv: number
  },

  mitigationStrategy: {
    actions: [{
      action: string,
      cost: number,
      timeline: string,
      effectiveness: number,
      status: string
    }],
    investmentRequired: number,
    riskReduction: number
  },

  monitoring: {
    indicators: string[],
    frequency: string,
    threshold: object,
    lastUpdate: Date
  }
}

// climate_scenarios Collection
{
  _id: ObjectId,
  organizationId: string,
  analysisId: string,

  scenarioSet: {
    framework: 'NGFS' | 'IEA' | 'IPCC' | 'CUSTOM',
    version: string,
    baselineYear: number,
    projectionYears: number[]
  },

  scenarios: [{
    name: string,
    narrative: string,
    temperature: number,
    pathway: string,

    parameters: {
      carbonPrice: [{
        year: number,
        price: number,
        coverage: number
      }],
      energyMix: [{
        year: number,
        fossil: number,
        renewable: number,
        nuclear: number
      }],
      gdpGrowth: [{
        year: number,
        rate: number
      }],
      technologyAdoption: [{
        technology: string,
        adoptionRate: object
      }],
      policyStringency: {
        level: string,
        timeline: string
      }
    },

    physicalClimate: {
      temperatureChange: object,
      precipitationChange: object,
      extremeEvents: object,
      seaLevelRise: object
    },

    transitionPathway: {
      emissionsTrajectory: object,
      sectoralChanges: object,
      investmentRequired: object
    }
  }],

  organizationProjections: {
    businessAsUsual: {
      revenue: object,
      costs: object,
      emissions: object
    },
    scenarioImpacts: [{
      scenario: string,
      revenue: object,
      operatingCosts: object,
      capitalRequirements: object,
      assetValues: object,
      marketShare: object
    }]
  },

  financialResults: {
    npvComparison: object,
    irrComparison: object,
    paybackPeriod: object,
    breakEvenAnalysis: object
  },

  sensitivityAnalysis: [{
    variable: string,
    baseCase: number,
    variations: object,
    impact: object
  }],

  strategicImplications: {
    keyFindings: string[],
    recommendations: string[],
    decisionPoints: object,
    noRegretsActions: string[]
  },

  validation: {
    methodology: string,
    peerReview: boolean,
    expertInput: string[],
    dataQuality: number
  },

  metadata: {
    analysisDate: Date,
    analysts: string[],
    approvedBy: string,
    nextUpdate: Date
  }
}

// climate_opportunities Collection
{
  _id: ObjectId,
  organizationId: string,
  opportunityId: string,

  category: 'RESOURCE_EFFICIENCY' | 'ENERGY' | 'PRODUCTS' | 'MARKETS' | 'RESILIENCE',

  description: {
    title: string,
    summary: string,
    businessCase: string,
    strategicFit: string
  },

  resourceEfficiency: {
    type: string[],
    currentUsage: object,
    efficiencyGain: number,
    costSavings: number,
    implementation: string
  },

  energySource: {
    currentMix: object,
    targetMix: object,
    renewableOptions: string[],
    costComparison: object,
    incentives: string[]
  },

  productsServices: {
    innovations: [{
      product: string,
      market: string,
      revenue: number,
      growth: number
    }],
    r&dInvestment: number,
    timeToMarket: number,
    competitiveAdvantage: string
  },

  newMarkets: {
    markets: [{
      name: string,
      size: number,
      growth: number,
      entry: string
    }],
    barriers: string[],
    enablers: string[]
  },

  resilience: {
    capabilities: string[],
    investments: object,
    riskReduction: number,
    valueCreation: number
  },

  financialAnalysis: {
    investment: {
      capital: number,
      operational: number,
      timeline: object
    },
    returns: {
      revenue: object,
      costSavings: object,
      roi: number,
      payback: number
    },
    risks: [{
      risk: string,
      likelihood: number,
      impact: number
    }]
  },

  implementation: {
    phases: [{
      phase: string,
      activities: string[],
      timeline: object,
      milestones: string[]
    }],
    resources: {
      human: object,
      financial: number,
      technical: string[]
    },
    dependencies: string[],
    successFactors: string[]
  },

  priorityScore: {
    strategicAlignment: number,
    financialReturn: number,
    feasibility: number,
    riskLevel: number,
    overall: number,
    rank: number
  },

  status: {
    stage: string,
    progress: number,
    nextSteps: string[],
    blockers: string[]
  },

  tracking: {
    kpis: object,
    targets: object,
    actuals: object,
    variance: object
  }
}

// adaptation_measures Collection
{
  _id: ObjectId,
  organizationId: string,
  measureId: string,

  riskAddressed: {
    riskId: string,
    riskType: string,
    severity: string
  },

  measure: {
    type: string,
    category: string,
    name: string,
    description: string
  },

  technical: {
    specifications: string[],
    technology: string,
    vendor: string,
    standards: string[]
  },

  effectiveness: {
    riskReduction: number,
    confidence: number,
    timeline: string,
    durability: number
  },

  costs: {
    capital: {
      equipment: number,
      installation: number,
      engineering: number
    },
    operational: {
      maintenance: number,
      monitoring: number,
      replacement: number
    },
    lifecycle: number
  },

  implementation: {
    startDate: Date,
    completionDate: Date,
    phases: object,
    responsible: string,
    contractors: string[]
  },

  cobenefits: {
    environmental: string[],
    social: string[],
    economic: string[]
  },

  performance: {
    indicators: object,
    monitoring: string,
    maintenance: object,
    review: string
  },

  status: {
    current: string,
    progress: number,
    issues: string[],
    lastUpdate: Date
  }
}

// climate_metrics Collection
{
  _id: ObjectId,
  organizationId: string,
  period: {
    year: number,
    month: number
  },

  tcfdMetrics: {
    governance: {
      boardMeetings: number,
      trainingHours: number,
      climateDecisions: number
    },
    strategy: {
      scenariosAnalyzed: number,
      risksIdentified: number,
      opportunitiesIdentified: number
    },
    riskManagement: {
      risksAssessed: number,
      controlsImplemented: number,
      incidentsReported: number
    },
    metricsTargets: {
      targetProgress: object,
      performanceScore: number
    }
  },

  riskMetrics: {
    physicalRiskScore: number,
    transitionRiskScore: number,
    aggregateRiskScore: number,
    valueAtRisk: number,
    riskTrend: string
  },

  resilienceMetrics: {
    adaptationInvestment: number,
    adaptationProgress: number,
    resilienceScore: number,
    recoveryTime: number
  },

  financialMetrics: {
    climateRevenue: number,
    climateCosts: number,
    climateCapex: number,
    climateROI: number
  },

  performanceMetrics: {
    ghgReduction: number,
    energyEfficiency: number,
    renewableShare: number,
    waterEfficiency: number
  }
}
```

### PostgreSQL with PostGIS Schema

```sql
-- Geospatial climate hazard data
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE climate_hazards (
  id UUID PRIMARY KEY,
  hazard_type VARCHAR(50) NOT NULL,
  geometry GEOMETRY(POLYGON, 4326),
  severity_level INTEGER,
  probability DECIMAL(3,2),
  scenario VARCHAR(50),
  time_horizon INTEGER,
  data_source VARCHAR(100),
  updated_at TIMESTAMP,
  metadata JSONB
);

CREATE SPATIAL INDEX ON climate_hazards USING GIST(geometry);

CREATE TABLE asset_locations (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  asset_id VARCHAR(100),
  location GEOMETRY(POINT, 4326),
  elevation DECIMAL(10,2),
  coastal_distance DECIMAL(10,2),
  flood_zone VARCHAR(10),
  hazard_exposure JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SPATIAL INDEX ON asset_locations USING GIST(location);

-- Climate data time series
CREATE TABLE climate_projections (
  id UUID PRIMARY KEY,
  location GEOMETRY(POINT, 4326),
  scenario VARCHAR(50),
  year INTEGER,
  temperature_anomaly DECIMAL(5,2),
  precipitation_change DECIMAL(5,2),
  sea_level_rise DECIMAL(5,2),
  extreme_heat_days INTEGER,
  drought_severity DECIMAL(3,2),
  data_source VARCHAR(100)
);

CREATE INDEX ON climate_projections(scenario, year);
CREATE SPATIAL INDEX ON climate_projections USING GIST(location);
```

### Neo4j Graph Schema

```cypher
// Supply chain risk propagation network
CREATE CONSTRAINT asset_id ON (a:Asset) ASSERT a.id IS UNIQUE;
CREATE CONSTRAINT supplier_id ON (s:Supplier) ASSERT s.id IS UNIQUE;
CREATE CONSTRAINT location_id ON (l:Location) ASSERT l.id IS UNIQUE;

// Nodes
(a:Asset {
  id: String,
  name: String,
  value: Float,
  criticality: Float,
  vulnerability: Float
})

(s:Supplier {
  id: String,
  name: String,
  tier: Integer,
  climateRisk: Float,
  alternatives: Integer
})

(l:Location {
  id: String,
  coordinates: Point,
  hazardExposure: Map,
  riskLevel: String
})

(r:ClimateRisk {
  id: String,
  type: String,
  severity: Float,
  timeHorizon: String
})

// Relationships
(a)-[:LOCATED_AT]->(l)
(a)-[:SUPPLIED_BY]->(s)
(s)-[:LOCATED_IN]->(l)
(a)-[:DEPENDS_ON {criticality: Float}]->(a2)
(l)-[:EXPOSED_TO {probability: Float}]->(r)
(s)-[:ALTERNATIVE_TO {switchCost: Float}]->(s2)

// Risk propagation queries
MATCH path = (a:Asset)-[:DEPENDS_ON*1..5]->()-[:EXPOSED_TO]->(r:ClimateRisk)
WHERE r.severity > 0.7
RETURN path,
       reduce(risk = 1.0, rel IN relationships(path) |
              risk * COALESCE(rel.criticality, 1.0)) as propagatedRisk
ORDER BY propagatedRisk DESC
```

### InfluxDB Schema

```sql
-- Climate metrics time series
CREATE DATABASE climate_metrics;

USE climate_metrics;

-- Physical risk measurements
physical_risk,
  organization_id=<org_id>,
  asset_id=<asset_id>,
  hazard_type=<type>,
  scenario=<scenario>
  severity=<value>,
  probability=<value>,
  financial_impact=<value>,
  vulnerability_score=<value>
  <timestamp>

-- Transition risk tracking
transition_risk,
  organization_id=<org_id>,
  category=<category>,
  risk_driver=<driver>,
  scenario=<scenario>
  likelihood=<value>,
  magnitude=<value>,
  financial_impact=<value>
  <timestamp>

-- Climate KPIs
climate_kpi,
  organization_id=<org_id>,
  metric_name=<name>,
  category=<category>
  value=<value>,
  target=<value>,
  variance=<value>
  <timestamp>

-- Scenario results
scenario_analysis,
  organization_id=<org_id>,
  scenario=<scenario>,
  time_horizon=<year>
  revenue_impact=<value>,
  cost_impact=<value>,
  asset_value_impact=<value>,
  total_impact=<value>
  <timestamp>
```

## Service Implementation

### Service Architecture

```typescript
// src/domain/services/climate-risk-assessment.service.ts
import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ClimateDataProvider } from '../interfaces/climate-data-provider.interface';
import { ScenarioEngine } from './scenario-engine.service';
import { FinancialModeler } from './financial-modeler.service';

@Injectable()
export class ClimateRiskAssessmentService {
  constructor(
    private readonly eventBus: EventBus,
    private readonly climateDataProvider: ClimateDataProvider,
    private readonly scenarioEngine: ScenarioEngine,
    private readonly financialModeler: FinancialModeler,
    private readonly physicalRiskRepository: PhysicalRiskRepository,
    private readonly transitionRiskRepository: TransitionRiskRepository
  ) {}

  async assessPhysicalRisks(
    organizationId: string,
    assets: Asset[],
    scenarios: ClimateScenario[]
  ): Promise<PhysicalRisk[]> {
    const risks: PhysicalRisk[] = [];

    for (const asset of assets) {
      // Get climate hazard data for asset location
      const hazards = await this.climateDataProvider.getHazards(
        asset.location,
        scenarios
      );

      // Calculate vulnerability score
      const vulnerability = await this.calculateVulnerability(asset, hazards);

      // Quantify financial impact
      const financialImpact = await this.financialModeler.calculatePhysicalImpact(
        asset,
        hazards,
        vulnerability
      );

      // Create physical risk assessment
      const risk = new PhysicalRisk({
        organizationId,
        assetId: asset.id,
        hazards,
        vulnerability,
        financialImpact,
        scenarios
      });

      await this.physicalRiskRepository.save(risk);
      risks.push(risk);

      // Publish event
      await this.eventBus.publish(
        new PhysicalRiskIdentifiedEvent({
          organizationId,
          assetId: asset.id,
          riskType: risk.riskType,
          severity: risk.severity,
          financialImpact: financialImpact.expected
        })
      );
    }

    return risks;
  }

  async assessTransitionRisks(
    organizationId: string,
    businessContext: BusinessContext,
    scenarios: TransitionScenario[]
  ): Promise<TransitionRisk[]> {
    const risks: TransitionRisk[] = [];

    // Policy & Legal Risks
    const policyRisks = await this.assessPolicyRisks(
      businessContext,
      scenarios
    );

    // Technology Risks
    const techRisks = await this.assessTechnologyRisks(
      businessContext.assets,
      scenarios
    );

    // Market Risks
    const marketRisks = await this.assessMarketRisks(
      businessContext.products,
      scenarios
    );

    // Reputation Risks
    const reputationRisks = await this.assessReputationRisks(
      businessContext,
      scenarios
    );

    // Aggregate and save all risks
    const allRisks = [
      ...policyRisks,
      ...techRisks,
      ...marketRisks,
      ...reputationRisks
    ];

    for (const risk of allRisks) {
      await this.transitionRiskRepository.save(risk);
      risks.push(risk);

      await this.eventBus.publish(
        new TransitionRiskIdentifiedEvent({
          organizationId,
          riskCategory: risk.category,
          likelihood: risk.likelihood,
          financialImpact: risk.financialImpact.expected
        })
      );
    }

    return risks;
  }

  private async calculateVulnerability(
    asset: Asset,
    hazards: ClimateHazard[]
  ): Promise<VulnerabilityScore> {
    // Complex vulnerability calculation
    const structuralFactors = this.assessStructuralVulnerability(asset);
    const operationalFactors = this.assessOperationalVulnerability(asset);
    const adaptiveCapacity = this.assessAdaptiveCapacity(asset);

    return new VulnerabilityScore({
      structural: structuralFactors,
      operational: operationalFactors,
      adaptive: adaptiveCapacity,
      overall: this.calculateOverallVulnerability(
        structuralFactors,
        operationalFactors,
        adaptiveCapacity,
        hazards
      )
    });
  }
}
```

### Scenario Analysis Engine

```typescript
// src/domain/services/scenario-engine.service.ts
import { Injectable } from '@nestjs/common';
import { MonteCarloSimulator } from './monte-carlo.service';
import { NGFSProvider } from '../providers/ngfs.provider';
import { IEAProvider } from '../providers/iea.provider';

@Injectable()
export class ScenarioEngine {
  constructor(
    private readonly monteCarloSimulator: MonteCarloSimulator,
    private readonly ngfsProvider: NGFSProvider,
    private readonly ieaProvider: IEAProvider
  ) {}

  async runScenarioAnalysis(
    organizationContext: OrganizationContext,
    scenarioSet: ScenarioSet,
    timeHorizons: number[]
  ): Promise<ScenarioAnalysisResult> {
    // Load scenario parameters
    const scenarios = await this.loadScenarios(scenarioSet);

    // Initialize results
    const results: ScenarioProjection[] = [];

    for (const scenario of scenarios) {
      // Run physical climate projections
      const physicalProjections = await this.projectPhysicalClimate(
        scenario,
        organizationContext.locations,
        timeHorizons
      );

      // Run transition pathway modeling
      const transitionPathway = await this.modelTransitionPathway(
        scenario,
        organizationContext.sector,
        timeHorizons
      );

      // Calculate business impacts
      const businessImpacts = await this.calculateBusinessImpacts(
        organizationContext,
        physicalProjections,
        transitionPathway,
        timeHorizons
      );

      // Run Monte Carlo simulation for uncertainty
      const uncertaintyBands = await this.monteCarloSimulator.simulate(
        businessImpacts,
        1000 // iterations
      );

      results.push({
        scenario,
        physicalProjections,
        transitionPathway,
        businessImpacts,
        uncertaintyBands
      });
    }

    // Perform sensitivity analysis
    const sensitivities = await this.performSensitivityAnalysis(
      results,
      ['carbonPrice', 'temperatureChange', 'technologyCost']
    );

    // Generate strategic implications
    const implications = this.deriveStrategicImplications(results);

    return new ScenarioAnalysisResult({
      scenarioSet,
      timeHorizons,
      projections: results,
      sensitivities,
      implications,
      confidence: this.calculateConfidenceLevel(results)
    });
  }

  private async projectPhysicalClimate(
    scenario: ClimateScenario,
    locations: Location[],
    timeHorizons: number[]
  ): Promise<PhysicalProjection> {
    const projections: LocationProjection[] = [];

    for (const location of locations) {
      const climateData = await this.getClimateProjections(
        location,
        scenario.pathway,
        timeHorizons
      );

      projections.push({
        location,
        temperature: climateData.temperature,
        precipitation: climateData.precipitation,
        extremeEvents: climateData.extremeEvents,
        seaLevel: climateData.seaLevel
      });
    }

    return new PhysicalProjection({
      scenario: scenario.name,
      locations: projections,
      aggregateRisk: this.calculateAggregatePhysicalRisk(projections)
    });
  }

  private async modelTransitionPathway(
    scenario: TransitionScenario,
    sector: string,
    timeHorizons: number[]
  ): Promise<TransitionPathway> {
    // Model carbon pricing trajectory
    const carbonPricing = await this.projectCarbonPricing(
      scenario,
      timeHorizons
    );

    // Model technology costs
    const technologyCosts = await this.projectTechnologyCosts(
      scenario,
      sector,
      timeHorizons
    );

    // Model market shifts
    const marketDynamics = await this.projectMarketDynamics(
      scenario,
      sector,
      timeHorizons
    );

    // Model policy evolution
    const policyEvolution = await this.projectPolicyEvolution(
      scenario,
      timeHorizons
    );

    return new TransitionPathway({
      carbonPricing,
      technologyCosts,
      marketDynamics,
      policyEvolution,
      transitionSpeed: scenario.transitionSpeed
    });
  }
}
```

### Financial Impact Modeler

```typescript
// src/domain/services/financial-modeler.service.ts
import { Injectable } from '@nestjs/common';
import { DiscountedCashFlow } from './dcf.service';
import { ValueAtRisk } from './var.service';

@Injectable()
export class FinancialModeler {
  constructor(
    private readonly dcf: DiscountedCashFlow,
    private readonly var: ValueAtRisk
  ) {}

  async calculateFinancialImpact(
    risks: ClimateRisk[],
    opportunities: ClimateOpportunity[],
    timeHorizon: number
  ): Promise<FinancialImpactSummary> {
    // Calculate risk impacts
    const riskImpacts = await this.calculateRiskImpacts(risks, timeHorizon);

    // Calculate opportunity values
    const opportunityValues = await this.calculateOpportunityValues(
      opportunities,
      timeHorizon
    );

    // Calculate net impact
    const netImpact = this.calculateNetImpact(riskImpacts, opportunityValues);

    // Calculate Value at Risk
    const valueAtRisk = await this.var.calculate(
      riskImpacts,
      0.95, // 95% confidence level
      timeHorizon
    );

    // NPV calculation
    const npv = await this.dcf.calculateNPV(
      netImpact.cashFlows,
      0.08 // discount rate
    );

    return new FinancialImpactSummary({
      riskImpacts,
      opportunityValues,
      netImpact,
      valueAtRisk,
      npv,
      breakeven: this.calculateBreakeven(netImpact.cashFlows)
    });
  }

  private async calculateRiskImpacts(
    risks: ClimateRisk[],
    timeHorizon: number
  ): Promise<RiskImpactProjection> {
    const impacts: AnnualImpact[] = [];

    for (let year = 0; year <= timeHorizon; year++) {
      let annualImpact = {
        year: new Date().getFullYear() + year,
        revenue: 0,
        operatingCosts: 0,
        capitalCosts: 0,
        assetImpairment: 0
      };

      for (const risk of risks) {
        // Revenue impact
        annualImpact.revenue += this.calculateRevenueImpact(risk, year);

        // Operating cost impact
        annualImpact.operatingCosts += this.calculateOpExImpact(risk, year);

        // Capital expenditure impact
        annualImpact.capitalCosts += this.calculateCapExImpact(risk, year);

        // Asset value impact
        annualImpact.assetImpairment += this.calculateAssetImpact(risk, year);
      }

      impacts.push(annualImpact);
    }

    return new RiskImpactProjection({
      impacts,
      totalImpact: this.sumImpacts(impacts),
      peakImpactYear: this.findPeakImpactYear(impacts)
    });
  }

  private calculateRevenueImpact(risk: ClimateRisk, year: number): number {
    // Complex revenue impact calculation based on risk type
    if (risk.type === 'PHYSICAL') {
      return this.calculatePhysicalRevenueImpact(risk as PhysicalRisk, year);
    } else {
      return this.calculateTransitionRevenueImpact(risk as TransitionRisk, year);
    }
  }

  private calculatePhysicalRevenueImpact(
    risk: PhysicalRisk,
    year: number
  ): number {
    // Business interruption days
    const interruptionDays = risk.getProjectedInterruption(year);
    const dailyRevenue = risk.asset.annualRevenue / 365;

    // Direct revenue loss
    const directLoss = interruptionDays * dailyRevenue;

    // Supply chain impact
    const supplyChainImpact = directLoss * 0.3; // 30% additional impact

    // Market share loss
    const marketShareLoss = risk.severity > 0.7 ? dailyRevenue * 30 : 0;

    return directLoss + supplyChainImpact + marketShareLoss;
  }
}
```

### TCFD Report Generator

```typescript
// src/domain/services/tcfd-report.service.ts
import { Injectable } from '@nestjs/common';
import { PDFGenerator } from '@/shared/pdf/pdf-generator';
import { XBRLMapper } from './xbrl-mapper.service';

@Injectable()
export class TCFDReportService {
  constructor(
    private readonly pdfGenerator: PDFGenerator,
    private readonly xbrlMapper: XBRLMapper,
    private readonly assessmentRepository: TCFDAssessmentRepository
  ) {}

  async generateTCFDReport(
    assessmentId: string,
    format: ReportFormat
  ): Promise<Report> {
    // Load assessment data
    const assessment = await this.assessmentRepository.findById(assessmentId);

    // Compile report sections
    const report = {
      executiveSummary: await this.generateExecutiveSummary(assessment),
      governance: await this.generateGovernanceSection(assessment.governance),
      strategy: await this.generateStrategySection(assessment.strategy),
      riskManagement: await this.generateRiskSection(assessment.riskManagement),
      metricsTargets: await this.generateMetricsSection(assessment.metricsTargets),
      appendices: await this.generateAppendices(assessment)
    };

    // Generate output based on format
    switch (format) {
      case ReportFormat.PDF:
        return await this.pdfGenerator.generate(report);
      case ReportFormat.XBRL:
        return await this.xbrlMapper.mapToXBRL(report);
      case ReportFormat.JSON:
        return report;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private async generateExecutiveSummary(
    assessment: TCFDAssessment
  ): Promise<ExecutiveSummary> {
    return {
      keyFindings: [
        `Identified ${assessment.physicalRisks.length} physical climate risks with potential impact of $${assessment.totalPhysicalImpact}M`,
        `Assessed ${assessment.transitionRisks.length} transition risks across ${assessment.scenarios.length} climate scenarios`,
        `Discovered ${assessment.opportunities.length} climate opportunities with potential value of $${assessment.totalOpportunityValue}M`,
        `Climate resilience score: ${assessment.resilienceScore}/100`
      ],
      materialRisks: assessment.getMaterialRisks(),
      keyOpportunities: assessment.getKeyOpportunities(),
      strategicPriorities: assessment.getStrategicPriorities(),
      targetProgress: assessment.getTargetProgress()
    };
  }
}
```

## Testing

### Unit Tests

```typescript
// src/domain/services/__tests__/climate-risk-assessment.spec.ts
import { Test } from '@nestjs/testing';
import { ClimateRiskAssessmentService } from '../climate-risk-assessment.service';

describe('ClimateRiskAssessmentService', () => {
  let service: ClimateRiskAssessmentService;
  let climateDataProvider: MockClimateDataProvider;
  let scenarioEngine: MockScenarioEngine;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ClimateRiskAssessmentService,
        {
          provide: ClimateDataProvider,
          useClass: MockClimateDataProvider
        },
        {
          provide: ScenarioEngine,
          useClass: MockScenarioEngine
        }
      ]
    }).compile();

    service = module.get(ClimateRiskAssessmentService);
    climateDataProvider = module.get(ClimateDataProvider);
    scenarioEngine = module.get(ScenarioEngine);
  });

  describe('assessPhysicalRisks', () => {
    it('should identify acute physical risks for coastal assets', async () => {
      // Arrange
      const coastalAsset = createCoastalAsset();
      const scenarios = [createRCP85Scenario()];

      climateDataProvider.getHazards.mockResolvedValue([
        createHurricaneHazard(),
        createSeaLevelRiseHazard()
      ]);

      // Act
      const risks = await service.assessPhysicalRisks(
        'org-123',
        [coastalAsset],
        scenarios
      );

      // Assert
      expect(risks).toHaveLength(2);
      expect(risks[0].hazardType).toBe('ACUTE_HURRICANE');
      expect(risks[0].financialImpact.expected).toBeGreaterThan(1000000);
      expect(risks[1].hazardType).toBe('CHRONIC_SEA_LEVEL');
    });

    it('should calculate vulnerability scores correctly', async () => {
      // Test vulnerability calculation logic
      const asset = createAssetWithAdaptation();
      const hazards = [createFloodHazard()];

      const vulnerability = await service.calculateVulnerability(
        asset,
        hazards
      );

      expect(vulnerability.overall).toBeLessThan(50); // Due to adaptation
      expect(vulnerability.adaptive).toBeGreaterThan(70);
    });
  });

  describe('assessTransitionRisks', () => {
    it('should identify carbon pricing exposure', async () => {
      // Arrange
      const context = createHighEmissionContext();
      const scenarios = [createNetZeroScenario()];

      // Act
      const risks = await service.assessTransitionRisks(
        'org-123',
        context,
        scenarios
      );

      // Assert
      const carbonPriceRisk = risks.find(r =>
        r.category === 'POLICY_LEGAL' &&
        r.driver === 'CARBON_PRICING'
      );

      expect(carbonPriceRisk).toBeDefined();
      expect(carbonPriceRisk.financialImpact.expected).toBeGreaterThan(5000000);
    });

    it('should assess stranded asset risk', async () => {
      // Test for fossil fuel assets
      const context = createFossilFuelContext();
      const scenarios = [createAcceleratedTransitionScenario()];

      const risks = await service.assessTransitionRisks(
        'org-123',
        context,
        scenarios
      );

      const strandedAssetRisk = risks.find(r =>
        r.category === 'TECHNOLOGY' &&
        r.driver === 'STRANDED_ASSETS'
      );

      expect(strandedAssetRisk).toBeDefined();
      expect(strandedAssetRisk.likelihood).toBeGreaterThan(0.7);
    });
  });
});
```

### Integration Tests

```typescript
// src/infrastructure/http/__tests__/climate-risk.e2e.spec.ts
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

describe('Climate Risk API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('POST /api/v1/climate-risk/scenarios/analyze', () => {
    it('should run complete scenario analysis', async () => {
      // Arrange
      const analysisRequest = {
        organizationId: 'org-123',
        scenarioSet: 'NGFS',
        scenarios: ['NET_ZERO_2050', 'CURRENT_POLICIES'],
        timeHorizons: [2030, 2050],
        includePhysical: true,
        includeTransition: true,
        sensitivityVariables: ['carbonPrice', 'temperatureChange']
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/climate-risk/scenarios/analyze')
        .send(analysisRequest)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        data: {
          analysisId: expect.any(String),
          scenarios: expect.arrayContaining([
            expect.objectContaining({
              name: 'NET_ZERO_2050',
              physicalProjections: expect.any(Object),
              transitionPathway: expect.any(Object),
              financialImpact: expect.any(Object)
            })
          ]),
          sensitivities: expect.any(Array),
          strategicImplications: expect.any(Object)
        }
      });
    });

    it('should handle large-scale portfolio analysis', async () => {
      // Test with 1000+ assets
      const portfolio = generateLargePortfolio(1000);

      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .post('/api/v1/climate-risk/physical-risks/assess')
        .send({
          assets: portfolio,
          scenarios: ['RCP4.5', 'RCP8.5']
        })
        .expect(200);

      const executionTime = Date.now() - startTime;

      expect(executionTime).toBeLessThan(60000); // Under 60 seconds
      expect(response.body.data.risks).toHaveLength(portfolio.length);
    });
  });

  describe('GraphQL Subscriptions', () => {
    it('should stream real-time risk alerts', async (done) => {
      const subscription = `
        subscription OnPhysicalRiskAlert($severity: RiskSeverity!) {
          physicalRiskAlert(severity: $severity) {
            assetId
            hazardType
            severity
            immediateAction
          }
        }
      `;

      const client = createGraphQLSubscriptionClient();

      client.subscribe(
        {
          query: subscription,
          variables: { severity: 'HIGH' }
        },
        {
          next: (data) => {
            expect(data.physicalRiskAlert).toMatchObject({
              assetId: expect.any(String),
              severity: 'HIGH',
              immediateAction: expect.any(String)
            });
            done();
          }
        }
      );

      // Trigger alert
      await simulateExtremeWeatherEvent();
    });
  });
});
```

### Performance Tests

```typescript
// src/performance/climate-risk.perf.ts
import { check } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Spike to 200
    { duration: '5m', target: 200 }, // Stay at 200
    { duration: '2m', target: 0 }    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<60000'], // 95% under 60s for complex analysis
    'http_req_duration{name:API}': ['p(95)<500'], // API calls under 500ms
    errors: ['rate<0.01'] // Error rate under 1%
  }
};

export default function() {
  // Scenario analysis performance test
  const scenarioPayload = JSON.stringify({
    organizationId: 'org-test',
    scenarios: ['NET_ZERO_2050', 'DELAYED_TRANSITION'],
    timeHorizons: [2030, 2050],
    monteCarlo: true,
    iterations: 1000
  });

  const scenarioResponse = http.post(
    'http://localhost:3018/api/v1/climate-risk/scenarios/analyze',
    scenarioPayload,
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'ScenarioAnalysis' }
    }
  );

  check(scenarioResponse, {
    'scenario analysis completed': (r) => r.status === 200,
    'execution under 60s': (r) => r.timings.duration < 60000
  });

  errorRate.add(scenarioResponse.status !== 200);

  // API endpoint performance
  const apiResponse = http.get(
    'http://localhost:3018/api/v1/climate-risk/metrics',
    { tags: { name: 'API' } }
  );

  check(apiResponse, {
    'API response OK': (r) => r.status === 200,
    'API under 500ms': (r) => r.timings.duration < 500
  });
}
```

## Deployment

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install Python for climate modeling libraries
RUN apk add --no-cache python3 py3-pip python3-dev g++ make

COPY package*.json ./
COPY requirements.txt ./

# Install Node dependencies
RUN npm ci --only=production

# Install Python dependencies for climate modeling
RUN pip3 install -r requirements.txt

COPY . .

RUN npm run build

FROM node:18-alpine

RUN apk add --no-cache python3 py3-pip

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /usr/lib/python3.9/site-packages /usr/lib/python3.9/site-packages

EXPOSE 3018

CMD ["node", "dist/main.js"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: climate-risk-service
  namespace: esg-platform
spec:
  replicas: 3 # High availability for critical service
  selector:
    matchLabels:
      app: climate-risk-service
  template:
    metadata:
      labels:
        app: climate-risk-service
    spec:
      containers:
      - name: climate-risk
        image: clenergize/climate-risk-service:latest
        ports:
        - containerPort: 3018
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        env:
        - name: NODE_ENV
          value: production
        - name: PORT
          value: "3018"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: uri
        - name: CLIMATE_DATA_API_KEY
          valueFrom:
            secretKeyRef:
              name: climate-data-secret
              key: api-key
        livenessProbe:
          httpGet:
            path: /health
            port: 3018
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3018
          initialDelaySeconds: 10
          periodSeconds: 5
      - name: scenario-worker
        image: clenergize/scenario-worker:latest
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
          limits:
            memory: "8Gi"
            cpu: "4000m"
---
apiVersion: v1
kind: Service
metadata:
  name: climate-risk-service
  namespace: esg-platform
spec:
  selector:
    app: climate-risk-service
  ports:
  - port: 3018
    targetPort: 3018
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: climate-risk-hpa
  namespace: esg-platform
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: climate-risk-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Monitoring & Observability

### Metrics

```typescript
// src/infrastructure/monitoring/metrics.ts
import { Counter, Histogram, Gauge } from 'prom-client';

export const climateRiskMetrics = {
  // Risk Assessment Metrics
  physicalRisksAssessed: new Counter({
    name: 'climate_physical_risks_assessed_total',
    help: 'Total physical climate risks assessed',
    labelNames: ['organization', 'hazard_type', 'severity']
  }),

  transitionRisksAssessed: new Counter({
    name: 'climate_transition_risks_assessed_total',
    help: 'Total transition risks assessed',
    labelNames: ['organization', 'category', 'likelihood']
  }),

  // Scenario Analysis Metrics
  scenarioAnalysisExecutionTime: new Histogram({
    name: 'climate_scenario_analysis_duration_seconds',
    help: 'Scenario analysis execution time',
    labelNames: ['organization', 'scenario_set', 'num_scenarios'],
    buckets: [10, 30, 60, 120, 300, 600] // Up to 10 minutes
  }),

  // Financial Impact Metrics
  totalFinancialImpact: new Gauge({
    name: 'climate_total_financial_impact_dollars',
    help: 'Total climate-related financial impact',
    labelNames: ['organization', 'impact_type', 'scenario']
  }),

  // TCFD Metrics
  tcfdMaturityScore: new Gauge({
    name: 'tcfd_maturity_score',
    help: 'TCFD disclosure maturity score',
    labelNames: ['organization', 'category']
  }),

  // Data Quality Metrics
  climateDataQuality: new Gauge({
    name: 'climate_data_quality_score',
    help: 'Climate data quality score',
    labelNames: ['data_source', 'data_type']
  })
};
```

### Logging

```typescript
// src/infrastructure/logging/climate-risk-logger.ts
import { LoggerService } from '@/shared/logger/logger.service';

export class ClimateRiskLogger extends LoggerService {
  logRiskIdentified(risk: ClimateRisk): void {
    this.info('Climate risk identified', {
      riskId: risk.id,
      type: risk.type,
      severity: risk.severity,
      financialImpact: risk.financialImpact,
      correlationId: this.getCorrelationId()
    });
  }

  logScenarioAnalysisStarted(params: ScenarioAnalysisParams): void {
    this.info('Scenario analysis started', {
      organizationId: params.organizationId,
      scenarios: params.scenarios,
      timeHorizons: params.timeHorizons,
      correlationId: this.getCorrelationId()
    });
  }

  logFinancialImpactCalculated(impact: FinancialImpact): void {
    this.info('Financial impact calculated', {
      impactType: impact.type,
      expected: impact.amount.expected,
      worst: impact.amount.worst,
      confidence: impact.confidence,
      correlationId: this.getCorrelationId()
    });
  }

  logAdaptationMeasureImplemented(measure: AdaptationMeasure): void {
    this.info('Adaptation measure implemented', {
      measureId: measure.id,
      type: measure.type,
      cost: measure.cost,
      effectiveness: measure.effectiveness,
      correlationId: this.getCorrelationId()
    });
  }
}
```

## Security

### Authentication & Authorization

```typescript
// src/infrastructure/security/climate-risk.guards.ts
import { Injectable, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ClimateRiskAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check for climate risk specific permissions
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );

    if (!requiredPermissions) {
      return true;
    }

    // Scenario analysis requires special permission
    if (requiredPermissions.includes('climate:scenario:run')) {
      return user.hasRole('CLIMATE_ANALYST') || user.hasRole('ADMIN');
    }

    // Financial impact calculation requires finance role
    if (requiredPermissions.includes('climate:financial:calculate')) {
      return user.hasRole('FINANCE') || user.hasRole('CLIMATE_ANALYST');
    }

    return user.hasAnyPermission(requiredPermissions);
  }
}
```

### Data Encryption

```typescript
// src/infrastructure/security/encryption.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ClimateDataEncryption {
  private algorithm = 'aes-256-gcm';

  encryptSensitiveData(data: any): EncryptedData {
    // Encrypt financial projections and strategic data
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decryptSensitiveData(encryptedData: EncryptedData): any {
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}
```

## Error Handling

```typescript
// src/domain/exceptions/climate-risk.exceptions.ts
export class ClimateRiskException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'ClimateRiskException';
  }
}

export class ScenarioAnalysisException extends ClimateRiskException {
  constructor(message: string, details?: any) {
    super(message, 'SCENARIO_ANALYSIS_ERROR', 500);
    this.details = details;
  }
}

export class ClimateDataUnavailableException extends ClimateRiskException {
  constructor(location: string, dataType: string) {
    super(
      `Climate data unavailable for location: ${location}, type: ${dataType}`,
      'CLIMATE_DATA_UNAVAILABLE',
      503
    );
  }
}

export class FinancialModelingException extends ClimateRiskException {
  constructor(message: string, modelType: string) {
    super(
      `Financial modeling error: ${message}`,
      'FINANCIAL_MODELING_ERROR',
      500
    );
    this.modelType = modelType;
  }
}
```

## Documentation

### API Documentation

```yaml
openapi: 3.0.0
info:
  title: Climate Risk Service API
  version: 1.0.0
  description: Comprehensive climate risk assessment and TCFD reporting

paths:
  /api/v1/climate-risk/scenarios/analyze:
    post:
      summary: Run climate scenario analysis
      operationId: runScenarioAnalysis
      tags:
        - Scenario Analysis
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - organizationId
                - scenarioSet
                - timeHorizons
              properties:
                organizationId:
                  type: string
                  format: uuid
                scenarioSet:
                  type: string
                  enum: [NGFS, IEA, IPCC, CUSTOM]
                scenarios:
                  type: array
                  items:
                    type: string
                timeHorizons:
                  type: array
                  items:
                    type: integer
                    minimum: 2025
                    maximum: 2100
                includePhysical:
                  type: boolean
                  default: true
                includeTransition:
                  type: boolean
                  default: true
                monteCarlo:
                  type: boolean
                  default: false
                iterations:
                  type: integer
                  minimum: 100
                  maximum: 10000
      responses:
        200:
          description: Scenario analysis completed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ScenarioAnalysisResult'
        400:
          description: Invalid parameters
        500:
          description: Analysis error

components:
  schemas:
    ScenarioAnalysisResult:
      type: object
      properties:
        analysisId:
          type: string
          format: uuid
        scenarios:
          type: array
          items:
            $ref: '#/components/schemas/ScenarioProjection'
        financialImpact:
          $ref: '#/components/schemas/FinancialImpact'
        strategicImplications:
          type: object
        confidence:
          type: number
          minimum: 0
          maximum: 1
```

## Performance Requirements

| Operation | Target | Max | Notes |
|-----------|--------|-----|-------|
| Physical Risk Assessment (single asset) | < 2s | 5s | Including hazard data fetch |
| Transition Risk Assessment | < 5s | 10s | All categories |
| Scenario Analysis (3 scenarios) | < 30s | 60s | Including Monte Carlo |
| Financial Impact Calculation | < 10s | 30s | Complex DCF modeling |
| TCFD Report Generation | < 20s | 45s | Full PDF report |
| Climate Data Query | < 500ms | 1s | Cached data |
| API Response Time (p95) | < 500ms | 1s | Simple queries |
| Batch Processing (1000 assets) | < 60s | 120s | Parallel processing |

## SLA Requirements

- **Availability**: 99.9% (allows 43 minutes downtime/month)
- **Scenario Analysis Success Rate**: > 99%
- **Data Freshness**: Climate data updated daily
- **Report Generation**: Available within 60 seconds
- **Support Response**: Critical issues < 1 hour
- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 1 hour

---

**Document Version**: 1.0.0
**Last Updated**: 2024-12-20
**Status**: DRAFT - Pending Technical Review
**Owner**: Climate Risk Team
**Next Review**: 2025-01-20