# Forecast Service - Specification

> **Version**: 1.0.0
> **Port**: 3047
> **Phase**: 6 (Months 21-24)
> **Story Points**: 30
> **Agent**: Forecast Agent
> **Modules Covered**: Module 15 (Forecasting & Predictive Analytics), Module 6 (KPI & Targets)

## 1. Overview

### Purpose
The Forecast Service provides comprehensive ESG forecasting, predictive modeling, and target setting capabilities. It enables organizations to project future ESG performance, establish science-based targets (SBTi), model net-zero pathways, forecast resource consumption, predict social metrics trends, and assess financial impacts of climate change and ESG initiatives.

### Domain
Analytics & Machine Learning - Forecasting & Predictive Analytics

### Business Value
- **Strategic Planning**: Multi-year ESG forecasts inform strategic decisions and resource allocation
- **Target Setting**: Science-based target validation with SBTi methodology integration
- **Risk Mitigation**: Early warning of trajectory deviations from targets
- **Financial Planning**: Carbon pricing impact forecasts, climate risk cost projections
- **Stakeholder Confidence**: Transparent forecasting with accuracy tracking builds trust
- **Regulatory Compliance**: Forward-looking disclosures for TCFD, CSRD, SEC climate rules
- **Performance Management**: Baseline establishment, business-as-usual scenarios, intervention tracking
- **Continuous Improvement**: Forecast vs. actual variance analysis drives methodology improvements

### User Modules Covered
- **Module 15**: Forecasting & Predictive Analytics
  - Emissions forecasting (Scope 1/2/3)
  - Resource consumption forecasting (energy, water, waste)
  - Social metrics forecasting (safety, diversity, turnover)
  - Financial impact forecasting (carbon pricing, climate risk)
  - Scenario modeling (BAU, intervention, best/worst case)
  - Forecast accuracy tracking and improvement

- **Module 6**: KPI & Targets (Integration)
  - Science-based target validation (SBTi)
  - Net-zero pathway modeling
  - Interim milestone setting
  - Target trajectory analysis
  - Gap-to-target forecasting

### Key Stakeholders
- Chief Sustainability Officers (CSOs)
- ESG Directors and Analysts
- Strategy Teams
- Finance Directors (FP&A)
- Investor Relations
- Board Sustainability Committees
- Regulators (for forward-looking disclosures)
- External Auditors and Assurance Providers

---

## 2. Core Features

### 2.1 Emissions Forecasting

#### Scope 1/2 Forecasting
- Historical trend analysis (3-10 years)
- Seasonal decomposition (monthly, quarterly patterns)
- Growth factor integration (production volume, headcount, floor area)
- Energy efficiency improvement tracking
- Fuel switching scenarios
- Renewable energy procurement plans
- Facility expansion/closure impacts
- Technology adoption curves (EVs, heat pumps, LED)

#### Scope 3 Forecasting
- Category-level forecasts (all 15 categories)
- Supplier decarbonization assumptions
- Industry transition scenarios (IEA, IPCC)
- Supply chain growth projections
- Product lifecycle changes
- Business travel policy impacts
- Remote work trends
- Circular economy initiatives

#### Carbon Budget Tracking
- Remaining carbon budget calculation
- Annual budget allocation
- Budget depletion trajectory
- Overshoot scenarios
- Budget extension strategies
- Temperature alignment tracking (1.5°C, 2°C)
- Cumulative emissions tracking

#### Decarbonization Pathways
- Linear reduction pathways
- Exponential reduction curves
- S-curve adoption models
- Abatement curve integration
- Technology roadmap alignment
- Investment sequencing
- Just transition considerations

### 2.2 Science-Based Target Setting & Validation

#### SBTi Methodology Implementation
- Sector Decarbonization Approach (SDA)
  - Convergence pathways by sector
  - IEA Net Zero by 2050 scenario alignment
  - Sector-specific benchmarks (power, steel, cement, transport, buildings)
- Absolute Contraction Approach (ACA)
  - Linear reduction from baseline
  - Annual reduction rate calculation
  - Temperature alignment validation
- Science-Based Trajectory (SBT)
  - Custom pathways with scientific validation
  - Near-term targets (5-10 years)
  - Long-term targets (2050 net-zero)

#### Net-Zero Pathway Modeling
- Net-zero commitment year selection (2040, 2045, 2050)
- Interim milestone setting (2025, 2030, 2035)
- Abatement potential assessment
- Residual emissions estimation
- Carbon removal strategy
  - Nature-based solutions (afforestation, soil carbon)
  - Technological solutions (DACCS, BECCS)
  - Carbon credits strategy (avoid, reduce, neutralize)
- Scope 3 decarbonization challenges
- Supply chain engagement plans

#### Target Validation
- SBTi criteria validation checklist
  - Scope coverage (Scope 1+2 mandatory, Scope 3 if >40%)
  - Time horizon (5-15 years)
  - Ambition level (1.5°C or well-below 2°C)
  - Base year data quality
  - Third-party verification
- Temperature alignment calculator
- Peer target comparison
- Internal consistency checks
- Disclosure requirement mapping

#### Target Trajectory Analysis
- Annual progress tracking against target
- Linear vs. actual trajectory comparison
- Acceleration/deceleration detection
- Gap-to-target quantification
- Corrective action recommendations
- Re-baselining triggers
- Target revision scenarios

### 2.3 Resource Forecasting

#### Energy Forecasting
- Total energy consumption projections
- Energy by source (electricity, natural gas, diesel, renewables)
- Renewable energy penetration forecasting
- On-site generation forecasts (solar PV, wind)
- Energy intensity trends (per unit production, per employee)
- Energy efficiency program impacts
- Building energy modeling integration
- ISO 50001 energy baseline alignment

#### Water Forecasting
- Total water withdrawal projections
- Water consumption by source (municipal, groundwater, surface water, recycled)
- Water stress scenario modeling
- Water efficiency program impacts
- Wastewater generation forecasts
- Water recycling rate improvements
- Drought scenario planning
- Water pricing impact forecasting

#### Waste Forecasting
- Total waste generation projections
- Waste by type (hazardous, non-hazardous, recycling, composting)
- Landfill diversion rate forecasting
- Circular economy initiative impacts
- Extended producer responsibility (EPR) compliance
- Waste-to-energy scenarios
- Zero waste target modeling

#### Material Forecasting
- Raw material consumption projections
- Recycled content penetration
- Material substitution scenarios
- Supply chain material efficiency
- Circular material flows

### 2.4 Social Metrics Forecasting

#### Workforce Trends
- Headcount projections (by geography, by function, by level)
- Turnover rate forecasting
- Talent acquisition needs
- Retirement projections
- Workforce demographics evolution
- Remote vs. on-site workforce mix

#### Health & Safety Forecasting
- Incident rate projections (TRIR, LTIR, severity rate)
- Leading indicator trends (near misses, safety observations)
- Safety culture maturity progression
- Target zero harm pathway modeling
- Industry benchmark convergence

#### Diversity & Inclusion Forecasting
- Gender representation projections (by level, by function)
- Ethnicity representation trends
- Pay equity gap closure trajectories
- Leadership diversity targets
- Diverse talent pipeline forecasting
- Inclusion index progression

#### Training & Development Forecasting
- Training hours per employee projections
- Skills gap evolution
- Leadership development pipeline
- Reskilling/upskilling needs
- Training investment forecasts

### 2.5 Financial Impact Forecasting

#### Carbon Pricing Impact
- Internal carbon price (ICP) evolution
- Shadow carbon price scenarios (low, medium, high)
- Carbon tax jurisdiction expansion
- ETS price forecasts (EU ETS, UK ETS, California Cap-and-Trade)
- Carbon border adjustment mechanism (CBAM) impacts
- Product carbon footprint cost allocation
- Revenue impact on carbon-intensive products
- Carbon pricing revenue recycling

#### Climate Risk Cost Forecasting
- Physical risk costs
  - Asset damage from extreme weather
  - Business interruption losses
  - Supply chain disruption costs
  - Adaptation investment needs
- Transition risk costs
  - Stranded asset write-downs
  - Technology transition costs
  - Regulatory compliance costs
  - Litigation and liability costs
- Insurance premium evolution
- Credit rating impacts
- Cost of capital changes

#### ESG Initiative ROI Forecasting
- Capital expenditure forecasts (renewable energy, energy efficiency, water efficiency)
- Operating cost savings trajectories
- Payback period tracking
- NPV and IRR projections
- Carbon abatement cost curves ($/tCO2e)
- Co-benefits quantification (health, productivity, brand)
- Risk-adjusted returns

#### Green Revenue Forecasting
- Sustainable product revenue growth
- Green bond issuance potential
- Sustainability-linked loan savings
- ESG rating premium capture
- Carbon offset revenue (if applicable)

### 2.6 Baseline & Business-As-Usual (BAU) Scenarios

#### Baseline Establishment
- Historical baseline year selection (typically 2019 or 2020)
- Base year data validation
- Organic growth adjustments
- Acquisition/divestiture normalization
- Structural change documentation
- Restatement triggers and procedures

#### Business-As-Usual (BAU) Forecasting
- No-intervention scenario modeling
- Historical trend extrapolation
- Organic growth assumptions
- Industry benchmark alignment
- Regulatory baseline assumptions
- BAU vs. intervention scenario comparison
- Avoided emissions calculation

#### Scenario Definitions
- Best case scenario (aggressive decarbonization)
- Base case scenario (current commitments)
- Worst case scenario (no action or increased emissions)
- Regulatory compliance scenario (minimum legal requirements)
- Sector transition scenario (IEA, IPCC pathways)

### 2.7 Forecast Accuracy Tracking & Improvement

#### Variance Analysis
- Forecast vs. actual comparison (monthly, quarterly, annual)
- Mean Absolute Percentage Error (MAPE) calculation
- Root Mean Square Error (RMSE) tracking
- Bias detection (systematic over/under-forecasting)
- Variance attribution analysis
  - Volume variance (production changes)
  - Efficiency variance (performance improvements)
  - Methodology variance (calculation changes)
  - External variance (weather, market changes)

#### Accuracy Improvement
- Forecast model refinement triggers
- Parameter recalibration
- Data quality improvement initiatives
- Assumption validation
- Expert judgment incorporation
- Machine learning model retraining
- Ensemble forecasting (combining multiple models)

#### Forecast Governance
- Forecast review schedule (quarterly, annually)
- Assumption documentation
- Scenario rationale
- Model selection justification
- Sensitivity analysis documentation
- Forecast approval workflow
- Version control and audit trail

#### Performance Metrics
- Forecast accuracy by metric (emissions, energy, water, safety)
- Forecast accuracy by time horizon (1-year, 3-year, 5-year)
- Forecast accuracy by geography/business unit
- Model performance comparison (time-series vs. regression vs. ML)
- Continuous improvement tracking

### 2.8 Forecasting Methodologies

#### Time-Series Methods
- ARIMA (AutoRegressive Integrated Moving Average)
  - Trend, seasonality, cyclical component modeling
  - Automatic parameter selection
  - Confidence intervals
- Prophet (Facebook's forecasting library)
  - Handling of missing data and outliers
  - Multiple seasonality (daily, weekly, yearly)
  - Holiday effects
  - Changepoint detection
- Exponential Smoothing (ETS)
  - Simple, double, triple exponential smoothing
  - Adaptive to trend and seasonality changes
- Seasonal Decomposition (STL)
  - Trend extraction
  - Seasonal pattern identification
  - Residual analysis

#### Regression Methods
- Multiple Linear Regression
  - Driver-based forecasting (production volume, headcount, degree days)
  - Feature engineering
  - Multicollinearity detection
- Polynomial Regression (for non-linear trends)
- Ridge/Lasso Regression (for high-dimensional data)
- Quantile Regression (for uncertainty quantification)

#### Machine Learning Methods
- Random Forest Regression
  - Non-linear relationships
  - Feature importance ranking
  - Robustness to outliers
- Gradient Boosting (XGBoost, LightGBM)
  - High prediction accuracy
  - Hyperparameter tuning
  - Overfitting prevention
- Neural Networks (LSTM for sequential data)
  - Long-term dependency modeling
  - Multi-step ahead forecasting
  - Attention mechanisms

#### Hybrid Methods
- Ensemble forecasting (combining time-series + regression + ML)
- Weighted average of multiple models
- Model selection based on accuracy metrics
- Bayesian model averaging
- Expert adjustment layer

#### Scenario-Based Methods
- Monte Carlo simulation (stochastic forecasting)
- Sensitivity analysis (tornado charts)
- What-if analysis
- Decision tree modeling
- Agent-based modeling (for complex systems)

---

## 3. Technical Architecture

### 3.1 Service Design Patterns

```typescript
// Domain-Driven Design Structure
src/
├── domain/                          # Core business logic
│   ├── aggregates/
│   │   ├── forecast/                # Forecast configurations and results
│   │   ├── baseline/                # Baseline definitions and BAU scenarios
│   │   ├── target/                  # Science-based targets and milestones
│   │   ├── variance-analysis/       # Forecast vs. actual tracking
│   │   ├── forecast-model/          # Forecasting methodology definitions
│   │   ├── scenario/                # Scenario definitions (best, base, worst)
│   │   └── carbon-budget/           # Carbon budget tracking
│   ├── entities/
│   │   ├── forecast-run.entity.ts
│   │   ├── forecast-result.entity.ts
│   │   ├── baseline.entity.ts
│   │   ├── target.entity.ts
│   │   ├── actual-data.entity.ts
│   │   └── model-performance.entity.ts
│   ├── value-objects/
│   │   ├── time-horizon.vo.ts
│   │   ├── confidence-interval.vo.ts
│   │   ├── scenario-type.vo.ts
│   │   ├── forecast-metric.vo.ts
│   │   └── accuracy-score.vo.ts
│   ├── events/
│   │   ├── forecast-generated.event.ts
│   │   ├── target-validated.event.ts
│   │   ├── variance-detected.event.ts
│   │   ├── baseline-updated.event.ts
│   │   └── model-retrained.event.ts
│   └── services/
│       ├── forecast-engine.service.ts
│       ├── target-validation.service.ts
│       ├── variance-analysis.service.ts
│       └── accuracy-tracking.service.ts
├── application/                     # Use cases and orchestration
│   ├── commands/
│   │   ├── generate-forecast.command.ts
│   │   ├── validate-sbti-target.command.ts
│   │   ├── establish-baseline.command.ts
│   │   ├── track-variance.command.ts
│   │   └── retrain-model.command.ts
│   ├── queries/
│   │   ├── get-forecast.query.ts
│   │   ├── get-target-trajectory.query.ts
│   │   ├── get-variance-analysis.query.ts
│   │   ├── get-carbon-budget.query.ts
│   │   └── get-model-performance.query.ts
│   ├── sagas/
│   │   ├── forecast-generation.saga.ts
│   │   └── target-validation.saga.ts
│   └── validators/
│       ├── forecast-config.validator.ts
│       └── sbti-criteria.validator.ts
├── infrastructure/                  # External integrations
│   ├── persistence/
│   │   ├── mongodb/                 # Forecast configs, results, baselines, targets
│   │   ├── influxdb/                # Time-series actual data, forecast time-series
│   │   ├── redis/                   # Caching forecast results
│   │   └── s3/                      # Model artifacts (serialized models)
│   ├── messaging/
│   │   ├── kafka/                   # Event publishing
│   │   └── event-handlers/
│   ├── integration/
│   │   ├── ml-service/              # ML model training and prediction (3046)
│   │   ├── scenario-service/        # Scenario definitions (3048)
│   │   ├── carbon-service/          # Historical emissions data (3011)
│   │   ├── energy-service/          # Historical energy data (3015)
│   │   ├── water-service/           # Historical water data (3012)
│   │   ├── workforce-service/       # Historical workforce data (3021)
│   │   ├── strategy-service/        # Targets and initiatives (3042)
│   │   └── sbti-api/                # SBTi validation tools (external)
│   ├── python-engine/               # Python forecasting engine
│   │   ├── time_series/             # ARIMA, Prophet, ETS
│   │   ├── regression/              # Linear, polynomial, quantile
│   │   ├── ml_models/               # Random Forest, XGBoost, LSTM
│   │   ├── ensemble/                # Model combination
│   │   └── utils/                   # Data preprocessing, feature engineering
│   └── monitoring/
└── interfaces/                      # API layer
    ├── rest/
    ├── graphql/
    └── grpc/                        # High-performance forecast generation
```

### 3.2 Technology Stack

- **Runtime**: Node.js 20 LTS with TypeScript 5.3
- **Framework**: NestJS 10.x with CQRS module
- **Python Engine**: Python 3.11+ (forecasting algorithms)
  - **Libraries**:
    - Time-series: `statsmodels`, `prophet`, `pmdarima`
    - ML: `scikit-learn`, `xgboost`, `lightgbm`, `tensorflow`/`pytorch` (LSTM)
    - Data: `pandas`, `numpy`, `scipy`
    - Visualization: `matplotlib`, `seaborn`
- **Databases**:
  - MongoDB 7.x (forecast configurations, results, baselines, targets)
  - InfluxDB 2.7 (time-series actual data, forecast time-series)
  - Redis 7.x (caching forecast results, model metadata)
  - AWS S3 (model artifacts storage)
- **Messaging**: Apache Kafka 3.6 (EventBridge for AWS)
- **API**: RESTful + GraphQL Federation + gRPC (for high-performance forecast generation)
- **ML Ops**: MLflow (model versioning, experiment tracking)
- **Compute**: AWS Lambda (Python) for on-demand forecast generation
- **Documentation**: OpenAPI 3.1 + AsyncAPI 2.6

### 3.3 Integration Architecture

```typescript
// Service Dependencies
const INTEGRATIONS = {
  // Data Sources (Historical Data)
  'carbon-service': 'Historical emissions data (Scope 1/2/3)',
  'energy-service': 'Historical energy consumption',
  'water-service': 'Historical water consumption',
  'waste-service': 'Historical waste generation',
  'workforce-service': 'Historical headcount, turnover, diversity',
  'safety-service': 'Historical incident rates',
  'diversity-service': 'Historical DEI metrics',

  // Context & Configuration
  'strategy-service': 'Target definitions, initiatives, roadmaps',
  'organization-service': 'Facility expansion/closure plans',
  'materiality-service': 'Material topics for forecasting focus',
  'scenario-service': 'Scenario definitions (best, base, worst)',

  // Analytics & ML
  'ml-service': 'ML model training, hyperparameter tuning, predictions',
  'analytics-service': 'Historical trend analysis, driver identification',

  // External APIs
  'sbti-api': 'SBTi target validation tools (external)',
  'iea-data': 'IEA sector pathways',
  'ipcc-data': 'IPCC climate scenarios',
  'weather-api': 'Weather data for degree-day forecasting',

  // Downstream Consumers
  'reporting-service': 'Forward-looking disclosures (TCFD, CSRD)',
  'risk-service': 'Climate risk cost forecasting',
  'transparency-service': 'Public disclosure of targets and forecasts'
};
```

---

## 4. Data Architecture

### 4.1 Core Data Models

#### 1. Forecast Configuration

```typescript
interface ForecastConfiguration {
  id: string;
  forecastId: string;
  organizationId: string;

  // Forecast Definition
  forecast: {
    name: string;
    description: string;
    forecastType: string; // EMISSIONS, ENERGY, WATER, WASTE, SOCIAL, FINANCIAL
    metric: string; // GHG_EMISSIONS, ENERGY_CONSUMPTION, WATER_WITHDRAWAL, TRIR, etc.
    unit: string; // tCO2e, MWh, m3, incidents per million hours
    category?: string; // For emissions: SCOPE_1, SCOPE_2, SCOPE_3_CAT_1, etc.
  };

  // Time Horizon
  timeHorizon: {
    baselineYear: number; // e.g., 2020
    startYear: number; // First forecast year, e.g., 2024
    endYear: number; // Last forecast year, e.g., 2050
    granularity: string; // ANNUAL, QUARTERLY, MONTHLY
  };

  // Scope & Boundary
  scope: {
    geographies: string[]; // Country/region codes
    businessUnits: string[];
    facilities: string[];
    categories?: string[]; // For Scope 3
    exclusions?: string[];
    boundaryRationale: string;
  };

  // Methodology
  methodology: {
    modelType: string; // TIME_SERIES, REGRESSION, ML, ENSEMBLE, SCENARIO
    algorithm?: string; // ARIMA, PROPHET, RANDOM_FOREST, XGBOOST, LSTM
    features?: string[]; // For regression/ML: production_volume, headcount, degree_days
    hyperparameters?: Record<string, any>;
    ensembleWeights?: Record<string, number>; // For ensemble: {arima: 0.3, prophet: 0.4, xgboost: 0.3}
  };

  // Assumptions
  assumptions: [{
    category: string; // GROWTH, EFFICIENCY, FUEL_MIX, RENEWABLES, POLICY, etc.
    assumption: string;
    value?: number;
    unit?: string;
    rationale: string;
    source?: string; // IEA, IPCC, Internal Planning, etc.
    uncertainty?: {
      low: number;
      high: number;
      distribution?: string; // NORMAL, UNIFORM, TRIANGULAR
    };
  }];

  // Scenario
  scenario: {
    scenarioType: string; // BAU, BASE_CASE, BEST_CASE, WORST_CASE, REGULATORY, NET_ZERO
    scenarioName: string;
    interventions?: [{
      intervention: string;
      impactYear: number;
      impactMagnitude: number; // % reduction or absolute value
      confidence: string; // LOW, MEDIUM, HIGH
    }];
  };

  // Validation & Accuracy
  validation: {
    trainingPeriod: { startYear: number; endYear: number };
    testPeriod: { startYear: number; endYear: number };
    crossValidation: boolean;
    accuracyTarget: number; // MAPE threshold, e.g., 10%
    benchmarkModels?: string[]; // Models to compare against
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    version: number;
    status: string; // DRAFT, ACTIVE, ARCHIVED
    approvedBy?: string;
    approvalDate?: Date;
  };
}
```

#### 2. Forecast Result

```typescript
interface ForecastResult {
  id: string;
  resultId: string;
  forecastId: string; // Link to ForecastConfiguration
  organizationId: string;

  // Execution Information
  execution: {
    runDate: Date;
    executionTime: number; // Milliseconds
    modelVersion: string;
    status: string; // SUCCESS, FAILED, PARTIAL
    errorMessage?: string;
  };

  // Forecast Time Series
  timeSeries: [{
    year: number;
    quarter?: number;
    month?: number;
    date?: Date; // For monthly/daily forecasts

    // Point Forecast
    forecastValue: number;

    // Confidence Intervals
    confidenceInterval: {
      level: number; // e.g., 95
      lower: number;
      upper: number;
    };

    // Scenario Variants (if applicable)
    scenarios?: {
      bau?: number;
      baseCase?: number;
      bestCase?: number;
      worstCase?: number;
    };

    // Decomposition (for time-series models)
    decomposition?: {
      trend: number;
      seasonal: number;
      residual: number;
    };
  }];

  // Aggregates
  aggregates: {
    totalForecast: number; // Sum over all periods
    averageAnnual: number;
    peakYear?: number;
    peakValue?: number;
    endValue: number; // Value in final forecast year
    cumulativeChange: number; // % change from baseline to end year
  };

  // Model Performance (on test set)
  performance: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    mae: number; // Mean Absolute Error
    r2: number; // R-squared (for regression)
    bias: number; // Average forecast error (positive = over-forecasting)
    accuracyGrade: string; // EXCELLENT (<5%), GOOD (5-10%), FAIR (10-20%), POOR (>20%)
  };

  // Feature Importance (for ML models)
  featureImportance?: [{
    feature: string;
    importance: number; // 0-1
    rank: number;
  }];

  // Metadata
  metadata: {
    createdAt: Date;
    generatedBy: string; // User or system
    storedInInflux: boolean; // Time-series data stored in InfluxDB
    storedInS3: boolean; // Model artifacts stored in S3
  };
}
```

#### 3. Baseline Definition

```typescript
interface Baseline {
  id: string;
  baselineId: string;
  organizationId: string;

  // Baseline Information
  baseline: {
    name: string;
    description: string;
    baselineType: string; // HISTORICAL, PROJECTED_BAU, ADJUSTED
    baselineYear: number; // e.g., 2020
    metric: string; // GHG_EMISSIONS, ENERGY_CONSUMPTION, etc.
    unit: string;
  };

  // Baseline Value
  value: {
    absoluteValue: number;
    intensityValue?: number; // Per unit of activity (e.g., tCO2e per $ revenue)
    intensityDenominator?: string; // REVENUE, PRODUCTION, HEADCOUNT, FLOOR_AREA
    denominatorValue?: number;
    denominatorUnit?: string;
  };

  // Scope & Boundary
  scope: {
    geographies: string[];
    businessUnits: string[];
    facilities: string[];
    categories?: string[]; // For Scope 3
    exclusions?: string[];
    boundaryRationale: string;
  };

  // Data Quality
  dataQuality: {
    dataSource: string; // METERED, ESTIMATED, CALCULATED, SUPPLIER_PROVIDED
    dataQualityScore: number; // 1-5 (GHG Protocol)
    uncertainty: number; // % uncertainty
    verificationStatus: string; // UNVERIFIED, INTERNALLY_VERIFIED, EXTERNALLY_ASSURED
    verificationDate?: Date;
    verificationProvider?: string;
  };

  // Restatement
  restatement: {
    restatementRequired: boolean;
    restatementTrigger?: string; // ACQUISITION, DIVESTITURE, METHODOLOGY_CHANGE, ERROR_CORRECTION
    previousValue?: number;
    adjustmentValue?: number;
    adjustmentRationale?: string;
    restatementDate?: Date;
  };

  // Business-As-Usual (BAU) Projection
  bauProjection?: {
    forecastId: string; // Link to BAU forecast
    growthAssumptions: [{
      driver: string; // PRODUCTION_GROWTH, HEADCOUNT_GROWTH, FLOOR_AREA_GROWTH
      annualGrowthRate: number; // %
      rationale: string;
    }];
    projectedValue2030?: number;
    projectedValue2050?: number;
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    status: string; // DRAFT, APPROVED, RESTATED, ARCHIVED
    approvedBy?: string;
    approvalDate?: Date;
  };
}
```

#### 4. Science-Based Target (SBTi)

```typescript
interface ScienceBasedTarget {
  id: string;
  targetId: string;
  organizationId: string;

  // Target Definition
  target: {
    name: string;
    description: string;
    targetType: string; // ABSOLUTE, INTENSITY, RENEWABLE_ENERGY, FLAG_SHIP
    scope: string; // SCOPE_1_2, SCOPE_3, COMBINED
    categories?: string[]; // For Scope 3 targets
    targetYear: number; // e.g., 2030
    baselineYear: number; // e.g., 2020
  };

  // Baseline & Target Values
  values: {
    baselineValue: number;
    baselineUnit: string;
    targetValue: number;
    targetUnit: string;
    reductionPercentage: number; // % reduction from baseline
    absoluteReduction?: number; // Absolute reduction in same unit

    // For intensity targets
    intensityDenominator?: string; // REVENUE, PRODUCTION, etc.
    baselineDenominatorValue?: number;
    targetDenominatorValue?: number;
  };

  // SBTi Methodology
  sbtiMethodology: {
    approach: string; // SDA, ACA, SBT
    temperatureAlignment: string; // 1.5C, WELL_BELOW_2C, 2C
    sector?: string; // For SDA
    sectorPathway?: string; // IEA_NZE_2050, IPCC_SR15
    annualLinearReductionRate?: number; // % per year (for ACA)
    convergenceYear?: number; // For SDA
    convergenceValue?: number; // For SDA
  };

  // SBTi Validation
  sbtiValidation: {
    submittedToSbti: boolean;
    submissionDate?: Date;
    validationStatus: string; // NOT_SUBMITTED, SUBMITTED, APPROVED, REJECTED, REVISION_REQUESTED
    approvalDate?: Date;
    commitmentLetter?: string; // Document link
    validationNotes?: string;
    nextRevalidationDate?: Date; // Targets must be revalidated every 5 years
  };

  // Near-Term vs. Long-Term
  timeHorizon: {
    targetHorizon: string; // NEAR_TERM (5-10 years), LONG_TERM (2050)
    isNearTerm: boolean;
    isLongTerm: boolean;
    netZeroCommitment: boolean;
    netZeroYear?: number; // e.g., 2050
  };

  // Interim Milestones
  milestones: [{
    year: number;
    milestoneValue: number;
    milestoneUnit: string;
    reductionFromBaseline: number; // %
    status: string; // NOT_STARTED, IN_PROGRESS, ACHIEVED, MISSED
    achievedDate?: Date;
  }];

  // Scope 3 Engagement
  scope3Engagement?: {
    supplierEngagementTarget: boolean;
    engagementPercentage?: number; // % of suppliers by emissions
    engagementDeadline?: number; // Year
    supplierSBTiRequirement: boolean; // Require suppliers to set their own SBTs
  };

  // Carbon Removals
  carbonRemovals?: {
    allowedInTarget: boolean; // Only for long-term targets
    removalTypes: string[]; // AFFORESTATION, REFORESTATION, SOIL_CARBON, DACCS, BECCS
    estimatedRemovalVolume?: number; // tCO2e
    removalStrategy?: string;
  };

  // Forecast Link
  forecast: {
    forecastId: string; // Link to trajectory forecast
    trajectoryValidated: boolean;
    gapToTarget?: number; // Current gap in tCO2e or %
    onTrack: boolean;
    correctionNeeded?: string;
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    status: string; // DRAFT, APPROVED, SUBMITTED, VALIDATED, ACHIEVED, ARCHIVED
    approvedBy?: string;
    approvalDate?: Date;
    tags: string[];
  };
}
```

#### 5. Actual Data (for Variance Analysis)

```typescript
interface ActualData {
  id: string;
  organizationId: string;

  // Time Period
  period: {
    year: number;
    quarter?: number;
    month?: number;
    date?: Date;
  };

  // Metric
  metric: {
    metricType: string; // GHG_EMISSIONS, ENERGY, WATER, WASTE, TRIR, DIVERSITY, etc.
    category?: string; // SCOPE_1, SCOPE_2, SCOPE_3_CAT_1, etc.
    unit: string;
  };

  // Actual Value
  value: {
    actualValue: number;
    intensityValue?: number;
    intensityDenominator?: string;
    denominatorValue?: number;
  };

  // Scope
  scope: {
    geography?: string;
    businessUnit?: string;
    facility?: string;
  };

  // Data Source
  dataSource: {
    sourceType: string; // METERED, IOT, ERP, MANUAL_ENTRY, CALCULATED
    sourceSystem: string;
    sourceId: string;
    dataQualityScore: number; // 1-5
    verificationStatus: string; // UNVERIFIED, VERIFIED, ASSURED
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    storedInInflux: boolean; // Also stored in InfluxDB for time-series queries
  };
}
```

#### 6. Variance Analysis

```typescript
interface VarianceAnalysis {
  id: string;
  analysisId: string;
  organizationId: string;

  // Analysis Period
  period: {
    year: number;
    quarter?: number;
    month?: number;
  };

  // Forecast Reference
  forecast: {
    forecastId: string;
    forecastName: string;
    forecastDate: Date; // When forecast was generated
  };

  // Metric
  metric: {
    metricType: string;
    category?: string;
    unit: string;
  };

  // Variance Calculation
  variance: {
    forecastValue: number;
    actualValue: number;
    absoluteVariance: number; // Actual - Forecast
    percentageVariance: number; // ((Actual - Forecast) / Forecast) * 100
    varianceType: string; // FAVORABLE, UNFAVORABLE, NEUTRAL
    significanceLevel: string; // IMMATERIAL (<5%), MATERIAL (5-10%), SIGNIFICANT (>10%)
  };

  // Variance Attribution
  attribution: [{
    factor: string; // VOLUME, EFFICIENCY, FUEL_MIX, WEATHER, POLICY, OTHER
    contribution: number; // % of total variance attributed to this factor
    description: string;
    quantifiedImpact?: number; // Quantified in same unit as metric
  }];

  // Corrective Actions
  correctiveActions?: [{
    action: string;
    owner: string;
    deadline: Date;
    status: string; // PLANNED, IN_PROGRESS, COMPLETED
    expectedImpact?: number; // Expected reduction in variance
  }];

  // Forecast Adjustment Recommendation
  forecastAdjustment?: {
    adjustmentRecommended: boolean;
    adjustmentType: string; // ASSUMPTION_CHANGE, MODEL_RETRAINING, SCENARIO_CHANGE
    adjustmentRationale: string;
    revisedForecastId?: string; // Link to updated forecast
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    reviewedBy?: string;
    reviewDate?: Date;
    status: string; // DRAFT, REVIEWED, CLOSED
  };
}
```

#### 7. Carbon Budget

```typescript
interface CarbonBudget {
  id: string;
  budgetId: string;
  organizationId: string;

  // Budget Definition
  budget: {
    name: string;
    description: string;
    temperatureAlignment: string; // 1.5C, WELL_BELOW_2C, 2C
    scope: string; // SCOPE_1_2, SCOPE_3, COMBINED
    startYear: number;
    endYear: number; // e.g., 2050 (net-zero year)
  };

  // Total Carbon Budget
  totalBudget: {
    value: number; // Total allowable cumulative emissions (tCO2e)
    unit: string; // tCO2e
    methodology: string; // IPCC, SBTi, CUSTOM
    budgetRationale: string;
    scientificBasis?: string; // IPCC SR1.5, IEA NZE 2050, etc.
  };

  // Annual Budget Allocation
  annualAllocations: [{
    year: number;
    allocatedBudget: number; // tCO2e allowed for this year
    allocationMethod: string; // LINEAR, EXPONENTIAL, CUSTOM
  }];

  // Budget Consumption
  consumption: {
    cumulativeEmissions: number; // tCO2e emitted from start year to current
    remainingBudget: number; // Total budget - cumulative emissions
    percentageConsumed: number; // (Cumulative / Total) * 100
    budgetDepletionYear?: number; // Forecasted year when budget is exhausted
    daysToDepletion?: number; // If current trajectory continues
  };

  // Overshoot Scenario
  overshoot?: {
    overshootExpected: boolean;
    overshootYear?: number;
    overshootMagnitude?: number; // tCO2e over budget
    negativeEmissionsRequired?: number; // tCO2e to offset overshoot
    negativeEmissionsStrategy?: string;
  };

  // Forecast Link
  forecast: {
    forecastId: string; // Link to emissions forecast
    trajectoryAligned: boolean; // Is forecast aligned with budget?
    gapToBudget?: number; // Forecasted cumulative - budget
    correctionRequired?: boolean;
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    lastRecalculated: Date;
    status: string; // ACTIVE, EXCEEDED, RETIRED
  };
}
```

#### 8. Model Performance Tracking

```typescript
interface ModelPerformance {
  id: string;
  performanceId: string;
  organizationId: string;

  // Model Information
  model: {
    modelId: string;
    modelName: string;
    modelType: string; // TIME_SERIES, REGRESSION, ML, ENSEMBLE
    algorithm: string; // ARIMA, PROPHET, XGBOOST, etc.
    version: string;
    trainingDate: Date;
  };

  // Metric
  metric: {
    metricType: string;
    category?: string;
    unit: string;
  };

  // Performance Metrics (on test set)
  performance: {
    mape: number;
    rmse: number;
    mae: number;
    r2?: number;
    bias: number;
    accuracyGrade: string; // EXCELLENT, GOOD, FAIR, POOR
  };

  // Cross-Validation Performance
  crossValidation?: {
    folds: number;
    avgMape: number;
    stdMape: number;
    avgRmse: number;
    stdRmse: number;
  };

  // Performance by Time Horizon
  performanceByHorizon: [{
    horizon: string; // 1_YEAR, 3_YEAR, 5_YEAR, 10_YEAR
    mape: number;
    rmse: number;
    degradation: number; // % degradation compared to 1-year horizon
  }];

  // Performance Trend
  performanceTrend: {
    improving: boolean;
    trendDirection: string; // IMPROVING, STABLE, DEGRADING
    mapeChange: number; // % change from previous version
    retrainingRecommended: boolean;
  };

  // Model Comparison (vs. benchmark models)
  benchmarkComparison?: [{
    benchmarkModel: string; // NAIVE, MOVING_AVERAGE, LINEAR_REGRESSION
    relativeMape: number; // % improvement over benchmark
    outperforms: boolean;
  }];

  // Metadata
  metadata: {
    evaluatedAt: Date;
    evaluatedBy: string;
    nextEvaluationDate: Date; // Quarterly or annual
  };
}
```

#### 9. Forecast Approval Workflow

```typescript
interface ForecastApproval {
  id: string;
  approvalId: string;
  forecastId: string;
  organizationId: string;

  // Approval Workflow
  workflow: {
    workflowName: string; // QUARTERLY_FORECAST_APPROVAL, SBTI_TARGET_APPROVAL
    currentStage: string;
    status: string; // PENDING, APPROVED, REJECTED, REVISION_REQUESTED
  };

  // Approvers
  approvers: [{
    approverRole: string; // ESG_ANALYST, ESG_DIRECTOR, CFO, BOARD
    approverId: string;
    approverName: string;
    approvalStatus: string; // PENDING, APPROVED, REJECTED
    approvalDate?: Date;
    comments?: string;
    requestedRevisions?: string[];
  }];

  // Review Checklist
  reviewChecklist: [{
    checkItem: string;
    checkStatus: string; // PASS, FAIL, NOT_APPLICABLE
    reviewer: string;
    reviewDate: Date;
    notes?: string;
  }];

  // Documentation
  documentation: {
    assumptionsDocumented: boolean;
    sensitivityAnalysisIncluded: boolean;
    peerReviewCompleted: boolean;
    externalValidationObtained?: boolean;
    attachments: string[];
  };

  // Metadata
  metadata: {
    submittedAt: Date;
    submittedBy: string;
    finalApprovalDate?: Date;
    finalApprovedBy?: string;
  };
}
```

### 4.2 Database Strategy

#### MongoDB Collections

```typescript
const MONGODB_COLLECTIONS = {
  // Core forecast data
  forecasts: 'Forecast configurations',
  forecastResults: 'Forecast results and predictions',
  baselines: 'Baseline definitions and BAU scenarios',
  targets: 'Science-based targets and milestones',
  carbonBudgets: 'Carbon budget tracking',
  varianceAnalyses: 'Forecast vs. actual variance analyses',
  modelPerformance: 'Model performance tracking',
  forecastApprovals: 'Forecast approval workflows',
  assumptions: 'Assumption library and documentation'
};
```

#### InfluxDB Measurements

```typescript
const INFLUXDB_MEASUREMENTS = {
  actualData: 'Time-series actual data (emissions, energy, water, social metrics)',
  forecastTimeSeries: 'Time-series forecast predictions with confidence intervals',
  dailyVariance: 'Daily/monthly variance tracking',
  rollingAccuracy: 'Rolling window accuracy metrics (e.g., 12-month MAPE)'
};
```

#### Redis Caching Strategy

```typescript
const REDIS_KEYS = {
  forecastResult: 'forecast:result:{forecastId}', // TTL: 24 hours
  targetTrajectory: 'target:trajectory:{targetId}', // TTL: 12 hours
  varianceAnalysis: 'variance:analysis:{analysisId}', // TTL: 6 hours
  carbonBudget: 'carbon:budget:{budgetId}', // TTL: 1 hour (frequently updated)
  modelMetadata: 'model:metadata:{modelId}', // TTL: 7 days
};
```

#### S3 Storage

```typescript
const S3_BUCKETS = {
  modelArtifacts: 'clenergize-forecast-models', // Serialized ML models (pickle, joblib)
  trainingData: 'clenergize-forecast-training-data', // Historical data snapshots for retraining
  forecastReports: 'clenergize-forecast-reports', // PDF/Excel exports of forecasts
  assumptionDocuments: 'clenergize-forecast-assumptions' // Supporting documentation
};
```

---

## 5. API Specifications

### 5.1 RESTful API Endpoints

#### Forecast Management

```typescript
// Generate Forecast
POST /api/v1/forecasts/generate
Request: {
  forecastConfig: ForecastConfiguration,
  runAsync: boolean // If true, return job ID; if false, wait for completion
}
Response: {
  success: true,
  data: {
    forecastId: string,
    resultId: string,
    jobId?: string, // If async
    result?: ForecastResult // If sync
  }
}

// Get Forecast Result
GET /api/v1/forecasts/{forecastId}/results/{resultId}
Response: {
  success: true,
  data: ForecastResult
}

// List Forecasts
GET /api/v1/forecasts?organizationId={id}&metric={type}&status={status}
Response: {
  success: true,
  data: {
    forecasts: ForecastConfiguration[],
    pagination: { ... }
  }
}

// Update Forecast Configuration
PUT /api/v1/forecasts/{forecastId}
Request: Partial<ForecastConfiguration>
Response: {
  success: true,
  data: ForecastConfiguration
}

// Delete Forecast
DELETE /api/v1/forecasts/{forecastId}
Response: {
  success: true,
  message: 'Forecast deleted successfully'
}
```

#### Target Management

```typescript
// Validate SBTi Target
POST /api/v1/targets/validate-sbti
Request: {
  targetConfig: ScienceBasedTarget,
  validationLevel: 'BASIC' | 'FULL' // BASIC: internal checks, FULL: SBTi API integration
}
Response: {
  success: true,
  data: {
    valid: boolean,
    validationResults: [{
      criterion: string,
      passed: boolean,
      message: string
    }],
    temperatureAlignment: string,
    recommendations: string[]
  }
}

// Get Target Trajectory
GET /api/v1/targets/{targetId}/trajectory
Response: {
  success: true,
  data: {
    target: ScienceBasedTarget,
    trajectory: [{
      year: number,
      targetValue: number,
      forecastValue: number,
      actualValue?: number,
      gapToTarget: number,
      onTrack: boolean
    }],
    overallStatus: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK'
  }
}

// Create Target
POST /api/v1/targets
Request: ScienceBasedTarget
Response: {
  success: true,
  data: ScienceBasedTarget
}

// Submit to SBTi
POST /api/v1/targets/{targetId}/submit-sbti
Request: {
  commitmentLetter: string, // Document URL
  supportingDocs: string[]
}
Response: {
  success: true,
  data: {
    submissionId: string,
    submissionDate: Date,
    status: 'SUBMITTED'
  }
}
```

#### Baseline Management

```typescript
// Establish Baseline
POST /api/v1/baselines
Request: Baseline
Response: {
  success: true,
  data: Baseline
}

// Generate BAU Forecast
POST /api/v1/baselines/{baselineId}/generate-bau
Request: {
  endYear: number,
  growthAssumptions: [{
    driver: string,
    annualGrowthRate: number,
    rationale: string
  }]
}
Response: {
  success: true,
  data: {
    baselineId: string,
    bauForecastId: string,
    bauProjection: {
      2030: number,
      2040: number,
      2050: number
    }
  }
}

// Restate Baseline
POST /api/v1/baselines/{baselineId}/restate
Request: {
  restatementTrigger: string,
  adjustmentValue: number,
  adjustmentRationale: string
}
Response: {
  success: true,
  data: Baseline // Updated baseline
}
```

#### Variance Analysis

```typescript
// Track Variance
POST /api/v1/variance/analyze
Request: {
  forecastId: string,
  year: number,
  quarter?: number,
  month?: number
}
Response: {
  success: true,
  data: VarianceAnalysis
}

// Get Variance Analysis
GET /api/v1/variance/{analysisId}
Response: {
  success: true,
  data: VarianceAnalysis
}

// List Variance Analyses
GET /api/v1/variance?forecastId={id}&year={year}&significanceLevel={level}
Response: {
  success: true,
  data: {
    analyses: VarianceAnalysis[],
    summary: {
      totalAnalyses: number,
      significantVariances: number,
      averageMape: number
    }
  }
}
```

#### Carbon Budget

```typescript
// Get Carbon Budget
GET /api/v1/carbon-budget/{budgetId}
Response: {
  success: true,
  data: CarbonBudget
}

// Update Carbon Budget (recalculate consumption)
POST /api/v1/carbon-budget/{budgetId}/recalculate
Response: {
  success: true,
  data: CarbonBudget // Updated consumption metrics
}

// Get Budget Status
GET /api/v1/carbon-budget/{budgetId}/status
Response: {
  success: true,
  data: {
    budgetId: string,
    remainingBudget: number,
    percentageConsumed: number,
    daysToDepletion: number,
    trajectoryAligned: boolean,
    overshootExpected: boolean,
    alerts: [{
      alertType: string,
      severity: string,
      message: string
    }]
  }
}
```

#### Model Performance

```typescript
// Get Model Performance
GET /api/v1/model-performance/{performanceId}
Response: {
  success: true,
  data: ModelPerformance
}

// Compare Models
POST /api/v1/model-performance/compare
Request: {
  modelIds: string[],
  metric: string,
  testPeriod: { startYear: number, endYear: number }
}
Response: {
  success: true,
  data: {
    comparison: [{
      modelId: string,
      modelName: string,
      mape: number,
      rmse: number,
      rank: number,
      recommended: boolean
    }],
    bestModel: string
  }
}

// Trigger Model Retraining
POST /api/v1/model-performance/retrain
Request: {
  modelId: string,
  trainingPeriod: { startYear: number, endYear: number },
  hyperparameterTuning: boolean
}
Response: {
  success: true,
  data: {
    jobId: string,
    status: 'QUEUED',
    estimatedCompletionTime: Date
  }
}
```

### 5.2 GraphQL Schema

```graphql
type Forecast {
  id: ID!
  forecastId: String!
  organizationId: String!
  forecast: ForecastInfo!
  timeHorizon: TimeHorizon!
  scope: ForecastScope!
  methodology: Methodology!
  assumptions: [Assumption!]!
  scenario: Scenario!
  validation: ValidationConfig!
  results: [ForecastResult!]!
  latestResult: ForecastResult
  metadata: Metadata!
}

type ForecastResult {
  id: ID!
  resultId: String!
  forecastId: String!
  execution: ExecutionInfo!
  timeSeries: [TimeSeriesPoint!]!
  aggregates: Aggregates!
  performance: ModelPerformance!
  featureImportance: [FeatureImportance!]
  metadata: Metadata!
}

type ScienceBasedTarget {
  id: ID!
  targetId: String!
  organizationId: String!
  target: TargetInfo!
  values: TargetValues!
  sbtiMethodology: SBTiMethodology!
  sbtiValidation: SBTiValidation!
  timeHorizon: TargetTimeHorizon!
  milestones: [Milestone!]!
  scope3Engagement: Scope3Engagement
  carbonRemovals: CarbonRemovals
  forecast: TargetForecast!
  trajectory: TargetTrajectory!
  metadata: Metadata!
}

type TargetTrajectory {
  trajectoryPoints: [TrajectoryPoint!]!
  overallStatus: TrajectoryStatus!
  currentProgress: Float!
  projectedAchievement: Float!
  gapToTarget: Float!
  correctionNeeded: String
}

type TrajectoryPoint {
  year: Int!
  targetValue: Float!
  forecastValue: Float
  actualValue: Float
  gapToTarget: Float!
  onTrack: Boolean!
}

type VarianceAnalysis {
  id: ID!
  analysisId: String!
  period: Period!
  forecast: ForecastReference!
  metric: MetricInfo!
  variance: Variance!
  attribution: [VarianceAttribution!]!
  correctiveActions: [CorrectiveAction!]
  forecastAdjustment: ForecastAdjustment
  metadata: Metadata!
}

type CarbonBudget {
  id: ID!
  budgetId: String!
  organizationId: String!
  budget: BudgetInfo!
  totalBudget: TotalBudget!
  annualAllocations: [AnnualAllocation!]!
  consumption: BudgetConsumption!
  overshoot: Overshoot
  forecast: BudgetForecast!
  status: BudgetStatus!
  metadata: Metadata!
}

type BudgetConsumption {
  cumulativeEmissions: Float!
  remainingBudget: Float!
  percentageConsumed: Float!
  budgetDepletionYear: Int
  daysToDepletion: Int
  alerts: [BudgetAlert!]!
}

# Queries
type Query {
  # Forecasts
  forecast(forecastId: String!): Forecast
  forecasts(
    organizationId: String!
    metricType: String
    status: String
    limit: Int
    offset: Int
  ): ForecastConnection!

  # Targets
  target(targetId: String!): ScienceBasedTarget
  targets(
    organizationId: String!
    scope: String
    status: String
  ): [ScienceBasedTarget!]!
  targetTrajectory(targetId: String!): TargetTrajectory!

  # Variance
  varianceAnalysis(analysisId: String!): VarianceAnalysis
  varianceAnalyses(
    forecastId: String!
    year: Int
    significanceLevel: String
  ): [VarianceAnalysis!]!

  # Carbon Budget
  carbonBudget(budgetId: String!): CarbonBudget
  carbonBudgetStatus(budgetId: String!): BudgetStatus!

  # Model Performance
  modelPerformance(modelId: String!): ModelPerformance
  compareModels(modelIds: [String!]!, metric: String!): ModelComparison!
}

# Mutations
type Mutation {
  # Forecasts
  generateForecast(config: ForecastConfigInput!, runAsync: Boolean): GenerateForecastResult!
  updateForecast(forecastId: String!, updates: ForecastConfigInput!): Forecast!
  deleteForecast(forecastId: String!): DeleteResult!

  # Targets
  createTarget(target: ScienceBasedTargetInput!): ScienceBasedTarget!
  validateSBTiTarget(targetId: String!, validationLevel: ValidationLevel!): SBTiValidationResult!
  submitToSBTi(targetId: String!, commitmentLetter: String!, supportingDocs: [String!]): SubmissionResult!

  # Baselines
  establishBaseline(baseline: BaselineInput!): Baseline!
  generateBAUForecast(baselineId: String!, endYear: Int!, growthAssumptions: [GrowthAssumptionInput!]!): BAUForecastResult!
  restateBaseline(baselineId: String!, restatement: RestatementInput!): Baseline!

  # Variance
  analyzeVariance(forecastId: String!, year: Int!, quarter: Int, month: Int): VarianceAnalysis!

  # Carbon Budget
  recalculateCarbonBudget(budgetId: String!): CarbonBudget!

  # Model Performance
  retrainModel(modelId: String!, trainingPeriod: PeriodInput!, hyperparameterTuning: Boolean): RetrainingResult!
}

# Subscriptions
type Subscription {
  # Real-time forecast generation progress
  forecastProgress(jobId: String!): ForecastProgress!

  # Real-time variance alerts
  varianceAlerts(organizationId: String!): VarianceAlert!

  # Real-time carbon budget depletion alerts
  budgetAlerts(budgetId: String!): BudgetAlert!
}
```

### 5.3 Event Schemas (AsyncAPI)

```yaml
asyncapi: 2.6.0
info:
  title: Forecast Service Events
  version: 1.0.0

channels:
  forecast.generated:
    publish:
      summary: Forecast generation completed
      message:
        payload:
          type: object
          properties:
            forecastId:
              type: string
            resultId:
              type: string
            organizationId:
              type: string
            metricType:
              type: string
            endYear:
              type: number
            performanceMetrics:
              type: object
              properties:
                mape:
                  type: number
                accuracyGrade:
                  type: string
            generatedAt:
              type: string
              format: date-time
            correlationId:
              type: string

  target.validated:
    publish:
      summary: SBTi target validated
      message:
        payload:
          type: object
          properties:
            targetId:
              type: string
            organizationId:
              type: string
            validationStatus:
              type: string
              enum: [APPROVED, REJECTED, REVISION_REQUESTED]
            temperatureAlignment:
              type: string
            validatedAt:
              type: string
              format: date-time
            correlationId:
              type: string

  variance.detected:
    publish:
      summary: Significant variance detected between forecast and actual
      message:
        payload:
          type: object
          properties:
            analysisId:
              type: string
            forecastId:
              type: string
            organizationId:
              type: string
            metricType:
              type: string
            period:
              type: object
              properties:
                year:
                  type: number
                quarter:
                  type: number
            variance:
              type: object
              properties:
                percentageVariance:
                  type: number
                significanceLevel:
                  type: string
                varianceType:
                  type: string
            detectedAt:
              type: string
              format: date-time
            correlationId:
              type: string

  baseline.updated:
    publish:
      summary: Baseline restated or updated
      message:
        payload:
          type: object
          properties:
            baselineId:
              type: string
            organizationId:
              type: string
            baselineYear:
              type: number
            previousValue:
              type: number
            newValue:
              type: number
            restatementTrigger:
              type: string
            updatedAt:
              type: string
              format: date-time
            correlationId:
              type: string

  model.retrained:
    publish:
      summary: Forecast model retrained
      message:
        payload:
          type: object
          properties:
            modelId:
              type: string
            organizationId:
              type: string
            modelType:
              type: string
            previousMape:
              type: number
            newMape:
              type: number
            improvement:
              type: number
            retrainedAt:
              type: string
              format: date-time
            correlationId:
              type: string

  budget.alert:
    publish:
      summary: Carbon budget alert triggered
      message:
        payload:
          type: object
          properties:
            budgetId:
              type: string
            organizationId:
              type: string
            alertType:
              type: string
              enum: [THRESHOLD_EXCEEDED, DEPLETION_IMMINENT, TRAJECTORY_MISALIGNED]
            percentageConsumed:
              type: number
            daysToDepletion:
              type: number
            severity:
              type: string
              enum: [LOW, MEDIUM, HIGH, CRITICAL]
            triggeredAt:
              type: string
              format: date-time
            correlationId:
              type: string
```

---

## 6. Business Logic & Domain Services

### 6.1 Forecast Engine Service

```typescript
@Injectable()
export class ForecastEngineService {
  constructor(
    private pythonGateway: PythonForecastGateway,
    private mlService: MLServiceClient,
    private dataService: HistoricalDataService,
    private eventBus: EventBus
  ) {}

  /**
   * Generate forecast based on configuration
   */
  async generateForecast(
    config: ForecastConfiguration
  ): Promise<ForecastResult> {
    // 1. Fetch historical data
    const historicalData = await this.dataService.fetchHistoricalData({
      organizationId: config.organizationId,
      metric: config.forecast.metric,
      category: config.forecast.category,
      startYear: config.timeHorizon.baselineYear,
      endYear: new Date().getFullYear(),
      scope: config.scope
    });

    // 2. Validate data quality
    this.validateDataQuality(historicalData);

    // 3. Select forecasting methodology
    let forecast: ForecastResult;
    switch (config.methodology.modelType) {
      case 'TIME_SERIES':
        forecast = await this.timeSeriesForecast(config, historicalData);
        break;
      case 'REGRESSION':
        forecast = await this.regressionForecast(config, historicalData);
        break;
      case 'ML':
        forecast = await this.mlForecast(config, historicalData);
        break;
      case 'ENSEMBLE':
        forecast = await this.ensembleForecast(config, historicalData);
        break;
      case 'SCENARIO':
        forecast = await this.scenarioForecast(config, historicalData);
        break;
      default:
        throw new Error(`Unsupported model type: ${config.methodology.modelType}`);
    }

    // 4. Calculate confidence intervals
    forecast.timeSeries = forecast.timeSeries.map(point => ({
      ...point,
      confidenceInterval: this.calculateConfidenceInterval(point, config)
    }));

    // 5. Calculate aggregates
    forecast.aggregates = this.calculateAggregates(forecast.timeSeries);

    // 6. Publish event
    await this.eventBus.publish(new ForecastGeneratedEvent({
      forecastId: config.forecastId,
      resultId: forecast.resultId,
      organizationId: config.organizationId,
      metricType: config.forecast.metric,
      endYear: config.timeHorizon.endYear,
      performanceMetrics: forecast.performance
    }));

    return forecast;
  }

  /**
   * Time-series forecasting (ARIMA, Prophet, ETS)
   */
  private async timeSeriesForecast(
    config: ForecastConfiguration,
    historicalData: HistoricalDataPoint[]
  ): Promise<ForecastResult> {
    // Delegate to Python engine
    return await this.pythonGateway.timeSeriesForecast({
      algorithm: config.methodology.algorithm, // ARIMA, PROPHET, ETS
      historicalData: historicalData,
      forecastHorizon: config.timeHorizon.endYear - config.timeHorizon.startYear + 1,
      seasonality: this.detectSeasonality(historicalData),
      hyperparameters: config.methodology.hyperparameters
    });
  }

  /**
   * Regression-based forecasting (driver-based)
   */
  private async regressionForecast(
    config: ForecastConfiguration,
    historicalData: HistoricalDataPoint[]
  ): Promise<ForecastResult> {
    // Fetch feature data (e.g., production volume, headcount)
    const featureData = await this.dataService.fetchFeatureData({
      organizationId: config.organizationId,
      features: config.methodology.features,
      startYear: config.timeHorizon.baselineYear,
      endYear: config.timeHorizon.endYear
    });

    return await this.pythonGateway.regressionForecast({
      algorithm: config.methodology.algorithm, // LINEAR, POLYNOMIAL, RIDGE, LASSO
      historicalData: historicalData,
      featureData: featureData,
      forecastHorizon: config.timeHorizon.endYear - config.timeHorizon.startYear + 1,
      hyperparameters: config.methodology.hyperparameters
    });
  }

  /**
   * ML-based forecasting (Random Forest, XGBoost, LSTM)
   */
  private async mlForecast(
    config: ForecastConfiguration,
    historicalData: HistoricalDataPoint[]
  ): Promise<ForecastResult> {
    // Use ML Service for model training and prediction
    const modelId = await this.mlService.trainModel({
      algorithm: config.methodology.algorithm,
      trainingData: historicalData,
      features: config.methodology.features,
      hyperparameters: config.methodology.hyperparameters
    });

    const predictions = await this.mlService.predict({
      modelId: modelId,
      forecastHorizon: config.timeHorizon.endYear - config.timeHorizon.startYear + 1
    });

    return this.convertMLPredictionsToForecastResult(predictions, config);
  }

  /**
   * Ensemble forecasting (combine multiple models)
   */
  private async ensembleForecast(
    config: ForecastConfiguration,
    historicalData: HistoricalDataPoint[]
  ): Promise<ForecastResult> {
    // Generate forecasts from multiple models
    const forecasts = await Promise.all([
      this.timeSeriesForecast({ ...config, methodology: { ...config.methodology, algorithm: 'ARIMA' } }, historicalData),
      this.timeSeriesForecast({ ...config, methodology: { ...config.methodology, algorithm: 'PROPHET' } }, historicalData),
      this.mlForecast({ ...config, methodology: { ...config.methodology, algorithm: 'XGBOOST' } }, historicalData)
    ]);

    // Combine forecasts using weighted average
    const ensembleWeights = config.methodology.ensembleWeights || {
      ARIMA: 0.3,
      PROPHET: 0.4,
      XGBOOST: 0.3
    };

    return this.combineForecasts(forecasts, ensembleWeights);
  }

  /**
   * Scenario-based forecasting (BAU, intervention scenarios)
   */
  private async scenarioForecast(
    config: ForecastConfiguration,
    historicalData: HistoricalDataPoint[]
  ): Promise<ForecastResult> {
    // Generate BAU forecast
    const bauForecast = await this.timeSeriesForecast(config, historicalData);

    // Apply intervention impacts
    const interventionAdjustedForecast = this.applyInterventions(
      bauForecast,
      config.scenario.interventions
    );

    return interventionAdjustedForecast;
  }

  /**
   * Apply interventions to BAU forecast
   */
  private applyInterventions(
    bauForecast: ForecastResult,
    interventions: Intervention[]
  ): ForecastResult {
    const adjustedTimeSeries = bauForecast.timeSeries.map(point => {
      let adjustedValue = point.forecastValue;

      interventions.forEach(intervention => {
        if (point.year >= intervention.impactYear) {
          // Apply reduction (percentage or absolute)
          adjustedValue *= (1 - intervention.impactMagnitude / 100);
        }
      });

      return { ...point, forecastValue: adjustedValue };
    });

    return {
      ...bauForecast,
      timeSeries: adjustedTimeSeries,
      aggregates: this.calculateAggregates(adjustedTimeSeries)
    };
  }
}
```

### 6.2 SBTi Target Validation Service

```typescript
@Injectable()
export class SBTiTargetValidationService {
  constructor(
    private sbtiApiClient: SBTiAPIClient,
    private forecastEngine: ForecastEngineService,
    private eventBus: EventBus
  ) {}

  /**
   * Validate target against SBTi criteria
   */
  async validateTarget(
    target: ScienceBasedTarget,
    validationLevel: 'BASIC' | 'FULL'
  ): Promise<SBTiValidationResult> {
    const results: ValidationCheck[] = [];

    // 1. Scope coverage validation
    results.push(this.validateScopeCoverage(target));

    // 2. Time horizon validation
    results.push(this.validateTimeHorizon(target));

    // 3. Ambition level validation
    results.push(await this.validateAmbition(target));

    // 4. Base year data quality validation
    results.push(this.validateBaseYearData(target));

    // 5. Temperature alignment validation
    results.push(await this.validateTemperatureAlignment(target));

    // 6. External validation (if FULL)
    if (validationLevel === 'FULL') {
      results.push(await this.sbtiApiClient.validateTarget(target));
    }

    const allPassed = results.every(r => r.passed);

    // Publish event
    await this.eventBus.publish(new TargetValidatedEvent({
      targetId: target.targetId,
      organizationId: target.organizationId,
      validationStatus: allPassed ? 'APPROVED' : 'REVISION_REQUESTED',
      temperatureAlignment: target.sbtiMethodology.temperatureAlignment
    }));

    return {
      valid: allPassed,
      validationResults: results,
      temperatureAlignment: target.sbtiMethodology.temperatureAlignment,
      recommendations: this.generateRecommendations(results)
    };
  }

  /**
   * Validate scope coverage
   */
  private validateScopeCoverage(target: ScienceBasedTarget): ValidationCheck {
    const hasScope1And2 = target.target.scope === 'SCOPE_1_2' || target.target.scope === 'COMBINED';
    const hasScope3 = target.target.scope === 'SCOPE_3' || target.target.scope === 'COMBINED';

    // SBTi requires Scope 1+2 coverage
    // Scope 3 required if >40% of total emissions
    const passed = hasScope1And2;

    return {
      criterion: 'Scope Coverage',
      passed: passed,
      message: passed
        ? 'Scope 1 and 2 coverage is mandatory and included.'
        : 'SBTi requires Scope 1 and 2 coverage.'
    };
  }

  /**
   * Validate time horizon
   */
  private validateTimeHorizon(target: ScienceBasedTarget): ValidationCheck {
    const timeHorizon = target.target.targetYear - target.target.baselineYear;
    const passed = timeHorizon >= 5 && timeHorizon <= 15;

    return {
      criterion: 'Time Horizon',
      passed: passed,
      message: passed
        ? `Time horizon of ${timeHorizon} years is within SBTi range (5-15 years).`
        : `Time horizon of ${timeHorizon} years is outside SBTi range (5-15 years).`
    };
  }

  /**
   * Validate ambition level (temperature alignment)
   */
  private async validateAmbition(target: ScienceBasedTarget): Promise<ValidationCheck> {
    const methodology = target.sbtiMethodology;

    // Calculate actual temperature alignment based on reduction percentage
    const temperatureAlignment = await this.calculateTemperatureAlignment(
      target.values.reductionPercentage,
      target.target.targetYear - target.target.baselineYear,
      methodology.approach
    );

    const passed = temperatureAlignment <= 1.5 ||
                   (methodology.temperatureAlignment === 'WELL_BELOW_2C' && temperatureAlignment < 2.0);

    return {
      criterion: 'Ambition Level',
      passed: passed,
      message: passed
        ? `Target aligns with ${temperatureAlignment}°C pathway.`
        : `Target aligns with ${temperatureAlignment}°C pathway, which is insufficient.`
    };
  }

  /**
   * Calculate temperature alignment
   */
  private async calculateTemperatureAlignment(
    reductionPercentage: number,
    years: number,
    approach: string
  ): Promise<number> {
    const annualReductionRate = reductionPercentage / years;

    // Simplified temperature alignment calculation
    // In practice, this would use SBTi sector pathways
    if (annualReductionRate >= 4.2) {
      return 1.5; // 1.5°C pathway
    } else if (annualReductionRate >= 2.5) {
      return 1.8; // Well-below 2°C pathway
    } else {
      return 2.5; // >2°C pathway
    }
  }
}
```

### 6.3 Variance Analysis Service

```typescript
@Injectable()
export class VarianceAnalysisService {
  constructor(
    private actualDataService: ActualDataService,
    private forecastRepository: ForecastRepository,
    private eventBus: EventBus
  ) {}

  /**
   * Analyze variance between forecast and actual
   */
  async analyzeVariance(
    forecastId: string,
    year: number,
    quarter?: number,
    month?: number
  ): Promise<VarianceAnalysis> {
    // 1. Fetch forecast
    const forecast = await this.forecastRepository.findById(forecastId);
    const forecastResult = await this.forecastRepository.findLatestResult(forecastId);

    // 2. Fetch actual data
    const actualData = await this.actualDataService.getActualData({
      organizationId: forecast.organizationId,
      metric: forecast.forecast.metric,
      category: forecast.forecast.category,
      year: year,
      quarter: quarter,
      month: month
    });

    if (!actualData) {
      throw new Error(`No actual data found for year ${year}`);
    }

    // 3. Get forecast value for same period
    const forecastPoint = forecastResult.timeSeries.find(
      point => point.year === year &&
               (!quarter || point.quarter === quarter) &&
               (!month || point.month === month)
    );

    if (!forecastPoint) {
      throw new Error(`No forecast found for year ${year}`);
    }

    // 4. Calculate variance
    const absoluteVariance = actualData.value.actualValue - forecastPoint.forecastValue;
    const percentageVariance = (absoluteVariance / forecastPoint.forecastValue) * 100;

    // 5. Determine significance
    const significanceLevel = this.determineSignificance(Math.abs(percentageVariance));

    // 6. Attribute variance to factors
    const attribution = await this.attributeVariance(
      forecast,
      forecastPoint,
      actualData,
      absoluteVariance
    );

    // 7. Create variance analysis
    const analysis: VarianceAnalysis = {
      id: uuidv4(),
      analysisId: uuidv4(),
      organizationId: forecast.organizationId,
      period: { year, quarter, month },
      forecast: {
        forecastId: forecast.forecastId,
        forecastName: forecast.forecast.name,
        forecastDate: forecastResult.execution.runDate
      },
      metric: {
        metricType: forecast.forecast.metric,
        category: forecast.forecast.category,
        unit: forecast.forecast.unit
      },
      variance: {
        forecastValue: forecastPoint.forecastValue,
        actualValue: actualData.value.actualValue,
        absoluteVariance: absoluteVariance,
        percentageVariance: percentageVariance,
        varianceType: absoluteVariance > 0 ? 'UNFAVORABLE' : 'FAVORABLE',
        significanceLevel: significanceLevel
      },
      attribution: attribution,
      metadata: {
        createdAt: new Date(),
        createdBy: 'SYSTEM',
        status: 'DRAFT'
      }
    };

    // 8. Publish event if significant
    if (significanceLevel === 'SIGNIFICANT' || significanceLevel === 'MATERIAL') {
      await this.eventBus.publish(new VarianceDetectedEvent({
        analysisId: analysis.analysisId,
        forecastId: forecast.forecastId,
        organizationId: forecast.organizationId,
        metricType: forecast.forecast.metric,
        period: { year, quarter },
        variance: {
          percentageVariance: percentageVariance,
          significanceLevel: significanceLevel,
          varianceType: analysis.variance.varianceType
        }
      }));
    }

    return analysis;
  }

  /**
   * Determine significance level
   */
  private determineSignificance(percentageVariance: number): string {
    if (percentageVariance < 5) {
      return 'IMMATERIAL';
    } else if (percentageVariance < 10) {
      return 'MATERIAL';
    } else {
      return 'SIGNIFICANT';
    }
  }

  /**
   * Attribute variance to factors
   */
  private async attributeVariance(
    forecast: ForecastConfiguration,
    forecastPoint: TimeSeriesPoint,
    actualData: ActualData,
    absoluteVariance: number
  ): Promise<VarianceAttribution[]> {
    // Simplified attribution logic
    // In practice, this would use statistical analysis to decompose variance

    const attribution: VarianceAttribution[] = [];

    // Example: Volume variance (if production volume changed)
    // Example: Efficiency variance (if intensity improved more than expected)
    // Example: Weather variance (if degree days were different)
    // Example: Methodology variance (if calculation method changed)

    // Placeholder attribution
    attribution.push({
      factor: 'EFFICIENCY',
      contribution: 60, // 60% of variance
      description: 'Better-than-expected efficiency improvements',
      quantifiedImpact: absoluteVariance * 0.6
    });

    attribution.push({
      factor: 'VOLUME',
      contribution: 30,
      description: 'Higher production volume than forecasted',
      quantifiedImpact: absoluteVariance * 0.3
    });

    attribution.push({
      factor: 'OTHER',
      contribution: 10,
      description: 'Other factors',
      quantifiedImpact: absoluteVariance * 0.1
    });

    return attribution;
  }
}
```

---

## 7. Integration Patterns

### 7.1 Historical Data Fetching

```typescript
@Injectable()
export class HistoricalDataService {
  constructor(
    private carbonService: CarbonServiceClient,
    private energyService: EnergyServiceClient,
    private waterService: WaterServiceClient,
    private workforceService: WorkforceServiceClient
  ) {}

  /**
   * Fetch historical data from relevant service
   */
  async fetchHistoricalData(params: {
    organizationId: string;
    metric: string;
    category?: string;
    startYear: number;
    endYear: number;
    scope: ForecastScope;
  }): Promise<HistoricalDataPoint[]> {
    switch (params.metric) {
      case 'GHG_EMISSIONS':
        return await this.carbonService.getHistoricalEmissions({
          organizationId: params.organizationId,
          scope: params.category, // SCOPE_1, SCOPE_2, SCOPE_3
          startDate: `${params.startYear}-01-01`,
          endDate: `${params.endYear}-12-31`,
          geographies: params.scope.geographies,
          businessUnits: params.scope.businessUnits,
          facilities: params.scope.facilities
        });

      case 'ENERGY_CONSUMPTION':
        return await this.energyService.getHistoricalConsumption({
          organizationId: params.organizationId,
          startDate: `${params.startYear}-01-01`,
          endDate: `${params.endYear}-12-31`,
          scope: params.scope
        });

      case 'WATER_WITHDRAWAL':
        return await this.waterService.getHistoricalWithdrawal({
          organizationId: params.organizationId,
          startDate: `${params.startYear}-01-01`,
          endDate: `${params.endYear}-12-31`,
          scope: params.scope
        });

      case 'TRIR':
      case 'LTIR':
        return await this.workforceService.getHistoricalSafetyMetrics({
          organizationId: params.organizationId,
          metric: params.metric,
          startDate: `${params.startYear}-01-01`,
          endDate: `${params.endYear}-12-31`,
          scope: params.scope
        });

      default:
        throw new Error(`Unsupported metric: ${params.metric}`);
    }
  }
}
```

### 7.2 Python Forecasting Engine Integration

```typescript
@Injectable()
export class PythonForecastGateway {
  constructor(
    private httpService: HttpService,
    private config: ConfigService
  ) {}

  /**
   * Call Python time-series forecasting engine
   */
  async timeSeriesForecast(params: {
    algorithm: string;
    historicalData: HistoricalDataPoint[];
    forecastHorizon: number;
    seasonality: string;
    hyperparameters?: any;
  }): Promise<ForecastResult> {
    const pythonEngineUrl = this.config.get('PYTHON_ENGINE_URL');

    const response = await this.httpService.post(
      `${pythonEngineUrl}/forecast/time-series`,
      {
        algorithm: params.algorithm,
        data: params.historicalData.map(point => ({
          date: point.date,
          value: point.value
        })),
        forecast_horizon: params.forecastHorizon,
        seasonality: params.seasonality,
        hyperparameters: params.hyperparameters
      }
    ).toPromise();

    return this.convertPythonResponse(response.data);
  }

  /**
   * Call Python regression forecasting engine
   */
  async regressionForecast(params: {
    algorithm: string;
    historicalData: HistoricalDataPoint[];
    featureData: FeatureData[];
    forecastHorizon: number;
    hyperparameters?: any;
  }): Promise<ForecastResult> {
    const pythonEngineUrl = this.config.get('PYTHON_ENGINE_URL');

    const response = await this.httpService.post(
      `${pythonEngineUrl}/forecast/regression`,
      {
        algorithm: params.algorithm,
        target_data: params.historicalData,
        feature_data: params.featureData,
        forecast_horizon: params.forecastHorizon,
        hyperparameters: params.hyperparameters
      }
    ).toPromise();

    return this.convertPythonResponse(response.data);
  }

  /**
   * Convert Python response to ForecastResult
   */
  private convertPythonResponse(pythonResponse: any): ForecastResult {
    return {
      id: uuidv4(),
      resultId: uuidv4(),
      forecastId: pythonResponse.forecast_id,
      organizationId: pythonResponse.organization_id,
      execution: {
        runDate: new Date(),
        executionTime: pythonResponse.execution_time_ms,
        modelVersion: pythonResponse.model_version,
        status: 'SUCCESS'
      },
      timeSeries: pythonResponse.predictions.map((pred: any) => ({
        year: pred.year,
        quarter: pred.quarter,
        month: pred.month,
        forecastValue: pred.forecast_value,
        confidenceInterval: {
          level: 95,
          lower: pred.lower_bound,
          upper: pred.upper_bound
        }
      })),
      aggregates: {
        totalForecast: pythonResponse.aggregates.total,
        averageAnnual: pythonResponse.aggregates.average_annual,
        endValue: pythonResponse.aggregates.end_value,
        cumulativeChange: pythonResponse.aggregates.cumulative_change
      },
      performance: {
        mape: pythonResponse.performance.mape,
        rmse: pythonResponse.performance.rmse,
        mae: pythonResponse.performance.mae,
        r2: pythonResponse.performance.r2,
        bias: pythonResponse.performance.bias,
        accuracyGrade: this.calculateAccuracyGrade(pythonResponse.performance.mape)
      },
      metadata: {
        createdAt: new Date(),
        generatedBy: 'PYTHON_ENGINE',
        storedInInflux: false,
        storedInS3: false
      }
    };
  }

  private calculateAccuracyGrade(mape: number): string {
    if (mape < 5) return 'EXCELLENT';
    if (mape < 10) return 'GOOD';
    if (mape < 20) return 'FAIR';
    return 'POOR';
  }
}
```

---

## 8. Quality Assurance

### 8.1 Testing Strategy

#### Unit Tests (Target: 90% coverage)

```typescript
describe('ForecastEngineService', () => {
  describe('generateForecast', () => {
    it('should generate ARIMA forecast with valid configuration', async () => {
      const config: ForecastConfiguration = {
        // ... valid config
        methodology: { modelType: 'TIME_SERIES', algorithm: 'ARIMA' }
      };

      const result = await service.generateForecast(config);

      expect(result).toHaveProperty('timeSeries');
      expect(result.timeSeries.length).toBeGreaterThan(0);
      expect(result.performance.mape).toBeLessThan(20); // Reasonable accuracy
    });

    it('should throw error for invalid data quality', async () => {
      const config: ForecastConfiguration = { /* config with poor data */ };

      await expect(service.generateForecast(config)).rejects.toThrow('Insufficient data quality');
    });
  });

  describe('applyInterventions', () => {
    it('should reduce forecast values after intervention year', () => {
      const bauForecast: ForecastResult = {
        timeSeries: [
          { year: 2024, forecastValue: 1000 },
          { year: 2025, forecastValue: 1050 },
          { year: 2026, forecastValue: 1100 }
        ]
      };

      const interventions = [{
        intervention: 'Solar PV installation',
        impactYear: 2025,
        impactMagnitude: 20 // 20% reduction
      }];

      const result = service.applyInterventions(bauForecast, interventions);

      expect(result.timeSeries[0].forecastValue).toBe(1000); // Before intervention
      expect(result.timeSeries[1].forecastValue).toBe(840); // 1050 * 0.8
      expect(result.timeSeries[2].forecastValue).toBe(880); // 1100 * 0.8
    });
  });
});

describe('SBTiTargetValidationService', () => {
  describe('validateTarget', () => {
    it('should approve target with 1.5°C alignment', async () => {
      const target: ScienceBasedTarget = {
        // ... target with 42% reduction over 10 years (1.5°C)
        values: { reductionPercentage: 42 },
        target: { baselineYear: 2020, targetYear: 2030 },
        sbtiMethodology: { temperatureAlignment: '1.5C', approach: 'ACA' }
      };

      const result = await service.validateTarget(target, 'BASIC');

      expect(result.valid).toBe(true);
      expect(result.temperatureAlignment).toBe('1.5C');
    });

    it('should reject target with insufficient ambition', async () => {
      const target: ScienceBasedTarget = {
        // ... target with only 10% reduction over 10 years (>2°C)
        values: { reductionPercentage: 10 },
        target: { baselineYear: 2020, targetYear: 2030 },
        sbtiMethodology: { temperatureAlignment: '2C', approach: 'ACA' }
      };

      const result = await service.validateTarget(target, 'BASIC');

      expect(result.valid).toBe(false);
      expect(result.validationResults.some(r => r.criterion === 'Ambition Level' && !r.passed)).toBe(true);
    });
  });
});

describe('VarianceAnalysisService', () => {
  describe('analyzeVariance', () => {
    it('should detect significant positive variance', async () => {
      // Mock forecast: 1000 tCO2e
      // Mock actual: 850 tCO2e (15% better than forecast)

      const analysis = await service.analyzeVariance(forecastId, 2024);

      expect(analysis.variance.percentageVariance).toBeCloseTo(-15, 1);
      expect(analysis.variance.varianceType).toBe('FAVORABLE');
      expect(analysis.variance.significanceLevel).toBe('SIGNIFICANT');
    });

    it('should attribute variance to factors', async () => {
      const analysis = await service.analyzeVariance(forecastId, 2024);

      expect(analysis.attribution.length).toBeGreaterThan(0);
      const totalContribution = analysis.attribution.reduce((sum, attr) => sum + attr.contribution, 0);
      expect(totalContribution).toBeCloseTo(100, 0); // Should sum to 100%
    });
  });
});
```

#### Integration Tests

```typescript
describe('Forecast Service Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ForecastModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('POST /api/v1/forecasts/generate', () => {
    it('should generate forecast and return result', async () => {
      const config: ForecastConfiguration = {
        // ... valid config
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/forecasts/generate')
        .send({ forecastConfig: config, runAsync: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('result');
      expect(response.body.data.result.timeSeries.length).toBeGreaterThan(0);
    });

    it('should handle async forecast generation', async () => {
      const config: ForecastConfiguration = {
        // ... config for long-running forecast
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/forecasts/generate')
        .send({ forecastConfig: config, runAsync: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('jobId');

      // Poll for completion
      const jobId = response.body.data.jobId;
      let completed = false;
      for (let i = 0; i < 10 && !completed; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const statusResponse = await request(app.getHttpServer())
          .get(`/api/v1/forecasts/jobs/${jobId}/status`)
          .expect(200);

        if (statusResponse.body.data.status === 'COMPLETED') {
          completed = true;
          expect(statusResponse.body.data.result).toHaveProperty('timeSeries');
        }
      }

      expect(completed).toBe(true);
    });
  });

  describe('POST /api/v1/targets/validate-sbti', () => {
    it('should validate SBTi target', async () => {
      const target: ScienceBasedTarget = {
        // ... valid SBTi target
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/targets/validate-sbti')
        .send({ targetConfig: target, validationLevel: 'BASIC' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('valid');
      expect(response.body.data).toHaveProperty('validationResults');
    });
  });
});
```

#### Performance Tests

```typescript
describe('Forecast Performance', () => {
  it('should generate 10-year emissions forecast in <10 seconds', async () => {
    const config: ForecastConfiguration = {
      // ... 10-year emissions forecast
      timeHorizon: { baselineYear: 2020, startYear: 2024, endYear: 2034, granularity: 'ANNUAL' }
    };

    const startTime = Date.now();
    const result = await service.generateForecast(config);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(10000); // <10 seconds
    expect(result.timeSeries.length).toBe(11); // 2024-2034 = 11 years
  });

  it('should analyze variance in <3 seconds', async () => {
    const startTime = Date.now();
    const analysis = await service.analyzeVariance(forecastId, 2024);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(3000); // <3 seconds
    expect(analysis).toHaveProperty('variance');
  });

  it('should handle 100 concurrent forecast requests', async () => {
    const requests = Array(100).fill(null).map(() =>
      service.generateForecast(validConfig)
    );

    const startTime = Date.now();
    const results = await Promise.all(requests);
    const duration = Date.now() - startTime;

    expect(results.length).toBe(100);
    expect(results.every(r => r.execution.status === 'SUCCESS')).toBe(true);
    expect(duration).toBeLessThan(60000); // All complete within 60 seconds
  });
});
```

### 8.2 Data Validation

```typescript
@Injectable()
export class ForecastDataValidator {
  /**
   * Validate historical data quality
   */
  validateDataQuality(historicalData: HistoricalDataPoint[]): void {
    // Minimum data points
    if (historicalData.length < 12) {
      throw new Error('Insufficient historical data. Minimum 12 months required.');
    }

    // Check for missing data
    const missingPercentage = this.calculateMissingPercentage(historicalData);
    if (missingPercentage > 10) {
      throw new Error(`Too many missing data points: ${missingPercentage}%`);
    }

    // Check for outliers
    const outliers = this.detectOutliers(historicalData);
    if (outliers.length > historicalData.length * 0.05) {
      console.warn(`${outliers.length} outliers detected in historical data`);
    }

    // Check for negative values (for metrics that shouldn't be negative)
    const negativeValues = historicalData.filter(point => point.value < 0);
    if (negativeValues.length > 0) {
      throw new Error(`Negative values detected in historical data`);
    }

    // Check for zero variance
    const variance = this.calculateVariance(historicalData.map(p => p.value));
    if (variance === 0) {
      throw new Error('Historical data has zero variance. Cannot generate meaningful forecast.');
    }
  }

  /**
   * Validate forecast configuration
   */
  validateForecastConfig(config: ForecastConfiguration): void {
    // Validate time horizon
    if (config.timeHorizon.endYear <= config.timeHorizon.startYear) {
      throw new Error('End year must be after start year');
    }

    if (config.timeHorizon.endYear - config.timeHorizon.startYear > 50) {
      throw new Error('Forecast horizon exceeds maximum of 50 years');
    }

    // Validate methodology
    const validModelTypes = ['TIME_SERIES', 'REGRESSION', 'ML', 'ENSEMBLE', 'SCENARIO'];
    if (!validModelTypes.includes(config.methodology.modelType)) {
      throw new Error(`Invalid model type: ${config.methodology.modelType}`);
    }

    // Validate scope
    if (!config.scope.geographies || config.scope.geographies.length === 0) {
      throw new Error('At least one geography must be specified');
    }

    // Validate assumptions
    if (!config.assumptions || config.assumptions.length === 0) {
      console.warn('No assumptions documented. This is required for TCFD disclosure.');
    }
  }

  private calculateMissingPercentage(data: HistoricalDataPoint[]): number {
    const missingCount = data.filter(point => point.value === null || point.value === undefined).length;
    return (missingCount / data.length) * 100;
  }

  private detectOutliers(data: HistoricalDataPoint[]): HistoricalDataPoint[] {
    const values = data.map(p => p.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    );

    return data.filter(point => Math.abs(point.value - mean) > 3 * stdDev);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }
}
```

---

## 9. Deployment & Operations

### 9.1 Performance Requirements

```yaml
Performance SLAs:
  - Forecast Generation:
      - Simple forecast (10-year ARIMA): <5 seconds
      - Complex forecast (30-year ensemble): <10 seconds
      - ML model training: <60 seconds (async)

  - Variance Analysis: <3 seconds

  - Target Validation: <2 seconds

  - API Response Time:
      - GET /forecasts: <200ms (p95)
      - GET /targets: <200ms (p95)
      - POST /forecasts/generate (sync): <10s (p95)

  - Throughput:
      - 100 concurrent forecast requests
      - 1,000 variance analyses per hour
      - 10,000 API requests per minute

  - Data Limits:
      - Historical data: up to 100 years
      - Forecast horizon: up to 50 years
      - Time-series data points: up to 10,000 per forecast
```

### 9.2 Monitoring & Alerting

```typescript
const METRICS = {
  // Business Metrics
  'forecast.generation.count': 'Total forecasts generated',
  'forecast.generation.duration': 'Forecast generation time (ms)',
  'forecast.accuracy.mape': 'Forecast accuracy (MAPE)',
  'target.validation.count': 'SBTi targets validated',
  'target.validation.pass_rate': 'SBTi validation pass rate (%)',
  'variance.detection.count': 'Variances detected',
  'variance.significance.distribution': 'Distribution by significance level',

  // Technical Metrics
  'api.request.duration': 'API response time (ms)',
  'api.request.error_rate': 'API error rate (%)',
  'python_engine.availability': 'Python engine uptime (%)',
  'model.training.duration': 'ML model training time (ms)',
  'cache.hit_rate': 'Cache hit rate (%)',

  // Data Quality Metrics
  'data.quality.completeness': 'Historical data completeness (%)',
  'data.quality.outlier_rate': 'Outlier detection rate (%)',
  'forecast.result.confidence_interval_width': 'Average CI width (% of point forecast)'
};

const ALERTS = {
  // Critical Alerts
  'ForecastGenerationFailure': {
    condition: 'forecast.generation.error_rate > 5%',
    severity: 'CRITICAL',
    action: 'Page on-call engineer'
  },

  'PythonEngineDown': {
    condition: 'python_engine.availability < 95%',
    severity: 'CRITICAL',
    action: 'Restart Python engine, page on-call'
  },

  // Warning Alerts
  'ForecastAccuracyDegraded': {
    condition: 'forecast.accuracy.mape > 15%',
    severity: 'WARNING',
    action: 'Review model performance, consider retraining'
  },

  'HighVarianceDetected': {
    condition: 'variance.significance.SIGNIFICANT > 20% of total',
    severity: 'WARNING',
    action: 'Review forecast assumptions, investigate root causes'
  },

  'SlowForecastGeneration': {
    condition: 'forecast.generation.duration.p95 > 15000ms',
    severity: 'WARNING',
    action: 'Optimize Python engine, consider scaling'
  }
};
```

### 9.3 Disaster Recovery

```yaml
Backup Strategy:
  - MongoDB (forecast configs, results, targets):
      Frequency: Continuous replication + daily snapshots
      Retention: 30 days
      RTO: 1 hour
      RPO: 15 minutes

  - InfluxDB (time-series data):
      Frequency: Continuous replication + daily snapshots
      Retention: 90 days
      RTO: 2 hours
      RPO: 1 hour

  - S3 (model artifacts):
      Frequency: Automatic versioning + cross-region replication
      Retention: Indefinite
      RTO: Immediate (multi-region)
      RPO: 0 (synchronous replication)

Disaster Recovery Procedures:
  1. Database Restoration:
     - Restore MongoDB from snapshot
     - Restore InfluxDB from snapshot
     - Verify data integrity

  2. Model Recovery:
     - Retrieve model artifacts from S3
     - Redeploy Python engine
     - Validate model predictions

  3. Service Recovery:
     - Restart forecast service
     - Re-establish integrations with data sources
     - Run health checks
     - Notify stakeholders
```

---

## 10. Compliance & Security

### 10.1 Regulatory Compliance

```yaml
TCFD (Task Force on Climate-related Financial Disclosures):
  - Forward-looking statements: Forecast scenarios (BAU, best, worst case)
  - Climate risk assessment: Physical and transition risk cost forecasts
  - Strategy resilience: Scenario analysis (1.5°C, 2°C, 4°C pathways)
  - Metrics and targets: SBTi targets, net-zero pathways, carbon budgets

CSRD (Corporate Sustainability Reporting Directive):
  - ESRS E1: GHG emissions forecasts, decarbonization pathways
  - Forward-looking information: Medium-term (5-year) and long-term (2050) forecasts
  - Scenario analysis: Climate transition scenarios
  - Target setting: Science-based targets (mandatory for large companies)

SEC Climate Disclosure Rules:
  - Scope 1 and 2 emissions forecasts (if material)
  - Transition plan disclosure: Net-zero pathways, interim milestones
  - Scenario analysis: Climate-related risks and opportunities
  - Third-party assurance: Forecast methodology and assumptions

SBTi (Science Based Targets initiative):
  - Target validation: Automated SBTi criteria checks
  - Temperature alignment: 1.5°C or well-below 2°C pathways
  - Progress tracking: Annual progress reports
  - Revalidation: Every 5 years or on material change
```

### 10.2 Data Security

```yaml
Data Classification:
  - Public: Published forecasts, SBTi-approved targets
  - Internal: Draft forecasts, variance analyses
  - Confidential: Baseline data, assumptions, model parameters
  - Restricted: M&A-related forecasts, strategic plans

Security Controls:
  - Encryption at Rest:
      - MongoDB: AES-256 encryption
      - InfluxDB: AES-256 encryption
      - S3: SSE-S3 or SSE-KMS

  - Encryption in Transit:
      - TLS 1.3 for all API connections
      - mTLS for service-to-service communication

  - Access Control:
      - RBAC: Role-based access (ESG Analyst, ESG Director, CFO, Board)
      - Forecast Creation: ESG Analyst+
      - Target Approval: ESG Director+
      - SBTi Submission: CFO or Board
      - Baseline Restatement: CFO or Board (with audit trail)

  - Audit Trail:
      - All forecast generations logged
      - All target validations logged
      - All baseline restatements logged with approval chain
      - Retention: 7 years (regulatory requirement)

  - API Security:
      - JWT authentication
      - Rate limiting (per user and per organization)
      - Input sanitization (SQL injection, XSS prevention)
```

---

## 11. Roadmap & Future Enhancements

### Phase 1 (Months 21-22) - MVP
- Emissions forecasting (Scope 1/2, ARIMA/Prophet)
- SBTi target validation (basic criteria)
- Baseline establishment
- Variance analysis
- RESTful API

### Phase 2 (Months 23-24) - Advanced Features
- ML forecasting (Random Forest, XGBoost)
- Scope 3 forecasting (all 15 categories)
- Net-zero pathway modeling
- Carbon budget tracking
- Ensemble forecasting
- GraphQL API

### Phase 3 (Months 25-26) - Resource & Social Forecasting
- Energy, water, waste forecasting
- Social metrics forecasting (safety, diversity, turnover)
- Financial impact forecasting (carbon pricing, climate risk)
- Scenario analysis (best, base, worst case)

### Phase 4 (Months 27-28) - ML/AI Enhancements
- LSTM for long-term forecasts
- Deep learning for complex patterns
- Automated hyperparameter tuning
- Automated model selection
- Real-time forecast updates

### Phase 5 (Months 29-30) - Stakeholder & Reporting Integration
- TCFD scenario analysis integration
- CSRD forward-looking disclosure automation
- SEC climate disclosure support
- Interactive forecast explorer (frontend)
- Stakeholder-facing forecast dashboards

### Future Enhancements (Beyond MVP)
- Bayesian forecasting (probabilistic forecasts)
- Causal inference (identify intervention impacts)
- Transfer learning (learn from peer companies)
- Explainable AI (forecast interpretability)
- Real-time streaming forecasts (IoT integration)
- Agent-based modeling (complex system simulation)

---

## 12. Success Metrics

### Business KPIs
- **Forecast Accuracy**: MAPE <10% for 1-year horizon, <15% for 5-year horizon
- **Target Achievement**: 90% of organizations with SBTi-validated targets
- **Variance Detection**: 100% of significant variances (>10%) detected within 1 month of actuals
- **User Adoption**: 80% of ESG teams using forecast service for strategic planning
- **Regulatory Compliance**: 100% of TCFD/CSRD forward-looking disclosures supported

### Technical KPIs
- **API Response Time**: <200ms (p95)
- **Forecast Generation Time**: <10s for 10-year forecast
- **System Uptime**: 99.9%
- **Data Quality**: <5% missing data, <3% outliers
- **Model Performance**: Continuous improvement (MAPE reduction >5% YoY)

### User Satisfaction
- **NPS Score**: >50
- **Feature Satisfaction**: >4.5/5 for forecast accuracy, scenario analysis, target validation
- **Support Ticket Volume**: <10 tickets per 1,000 forecasts generated

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-22
**Author**: Forecast Agent
**Reviewers**: ESG Platform Master Coordinator, Strategy Agent, ML Agent, Analytics Agent
**Status**: Draft - Pending Review
