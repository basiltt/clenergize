# Strategy Service - Specification

> **Version**: 1.0.0
> **Port**: 3042
> **Phase**: 2 (Months 9-12)
> **Story Points**: 45
> **Agent**: Strategy Agent
> **Modules Covered**: Module 5 (Strategy & Policies), Module 6 (KPI & Targets)

## 1. Overview

### Purpose
The Strategy Service manages the complete ESG strategy lifecycle, including vision and mission definition, initiative portfolio management, target setting (including science-based targets), KPI tracking, and ROI measurement. It enables organizations to plan, execute, monitor, and report on their ESG transformation journey.

### Domain
Strategic ESG Management

### Business Value
- **Strategic Alignment**: Links ESG initiatives to corporate strategy and business objectives
- **Target Achievement**: Science-based target setting with SBTi validation and automated progress tracking
- **Resource Optimization**: Portfolio management with budget tracking and ROI measurement
- **Accountability**: KPI cascade from corporate to individual level with performance monitoring
- **Transparency**: Roadmap visualization and stakeholder communication
- **Decision Support**: Data-driven insights for strategy adjustments and investment prioritization

### User Modules Covered
- **Module 5**: Strategy & Policies
  - ESG strategy framework (vision, mission, pillars)
  - Initiative and project portfolio management
  - Roadmap development and visualization
  - Budget and ROI tracking
  - Strategic reporting and dashboards

- **Module 6**: KPI & Targets
  - Science-based target setting (SBTi, net-zero)
  - KPI library and custom metric builder
  - Target tracking and progress monitoring
  - Target cascade (corporate → BU → facility → individual)
  - SDG alignment and contribution mapping
  - Performance forecasting

### Key Stakeholders
- Chief Sustainability Officers (CSOs)
- ESG Directors and Managers
- Strategy Teams
- C-Suite Executives
- Board Sustainability Committees
- Business Unit Leaders
- Facility Managers
- Individual Contributors

---

## 2. Core Features

### 2.1 ESG Strategy Framework

#### Strategy Definition
- Vision and mission statement builder
- Strategic pillar creation (environmental, social, governance)
- Theory of change mapping
- Materiality alignment
- Business case development
- Risk and opportunity analysis

#### Strategic Planning
- Multi-year strategic plan development
- Quarterly and annual planning cycles
- Scenario planning integration
- Strategic initiatives identification
- Priority ranking and sequencing
- Resource allocation planning

#### Strategy Governance
- Strategy approval workflow
- Board oversight tracking
- Executive committee reviews
- Strategy refresh triggers
- Version control and change management
- Stakeholder alignment tracking

### 2.2 Initiative Portfolio Management

#### Initiative Definition
- Initiative creation wizard
- Business case templates
- Scope and objective definition
- Success criteria establishment
- Resource requirement planning
- Timeline and milestone definition

#### Portfolio Management
- Initiative portfolio dashboard
- Portfolio optimization tools
- Capacity planning
- Dependency mapping
- Risk assessment and mitigation
- Portfolio balancing (quick wins vs transformational)

#### Execution Tracking
- Milestone tracking and RAG status
- Progress updates (manual and automated)
- Issue and risk logging
- Decision tracking
- Change request management
- Sprint/agile integration

#### Budget Management
- Budget allocation by initiative
- Cost tracking (planned vs actual)
- Variance analysis
- Forecasting and reforecasting
- CapEx and OpEx categorization
- Multi-currency support

#### ROI Tracking
- Cost-benefit analysis
- Payback period calculation
- NPV and IRR calculation
- Carbon abatement cost ($/tCO2e)
- Non-financial benefits tracking
- Avoided cost calculation

### 2.3 Science-Based Target Setting

#### Target Setting Tools
- SBTi methodology wizard
  - Sector Decarbonization Approach (SDA)
  - Absolute Contraction Approach (ACA)
  - Science-Based Trajectory (SBT)
  - Sectoral pathways (IEA, IPCC)
- Temperature alignment calculator (1.5°C, 2°C, BAU)
- Target ambition assessment
- Scope coverage validation
- Timeline recommendation (5, 10, 15, 20 years)

#### Net-Zero Planning
- Net-zero roadmap builder
- Interim target setting (2030, 2040)
- Abatement curve generation
- Residual emission estimation
- Carbon removal strategy
- Offset strategy and limitations
- Just transition planning

#### Target Validation
- SBTi submission preparation
- Validation checklist
- Documentation package
- Target consistency checks
- Peer comparison
- Internal review workflow
- External verification support

#### SBTi Integration
- SBTi submission tracking
- Approval status monitoring
- Commitment letter generation
- Progress reporting (annual)
- Re-validation triggers
- Public disclosure support

### 2.4 KPI Management

#### KPI Library
- Pre-built KPI templates (500+ metrics)
  - Environmental KPIs (GHG, water, waste, energy, biodiversity)
  - Social KPIs (safety, diversity, engagement, training)
  - Governance KPIs (board composition, ethics, compliance)
- Industry-specific KPIs
- Framework-aligned KPIs (GRI, SASB, TCFD, SDG)
- Leading vs lagging indicators
- KPI metadata (owner, frequency, calculation method)

#### Custom Metric Builder
- Formula builder with validation
- Data source mapping
- Unit of measure configuration
- Aggregation rules (sum, average, weighted average)
- Normalization factors (per employee, per revenue, per m²)
- Threshold and target setting
- Visualization preferences

#### KPI Hierarchy
- KPI grouping and categorization
- Parent-child relationships
- Roll-up calculations
- Weighted aggregation
- Drill-down capabilities

### 2.5 Target Tracking & Progress Monitoring

#### Target Definition
- Target type selection
  - Absolute targets (reduce by X tons)
  - Intensity targets (reduce by X% per unit)
  - Relative targets (increase renewable energy to X%)
- Baseline year and value
- Target year and value
- Interim milestones (annual, quarterly)
- Scope and boundary definition
- Exclusions and assumptions

#### Progress Tracking
- Automated data collection from source services
- Manual data entry with approval workflow
- Progress calculation (% complete)
- Trajectory analysis (on track, ahead, behind)
- Forecast vs actual comparison
- Gap to target calculation
- Alert configuration (thresholds)

#### Performance Forecasting
- Linear extrapolation
- Machine learning predictions
- Scenario-based forecasting (best, base, worst)
- Confidence intervals
- Sensitivity analysis
- What-if modeling
- Recommendation engine (actions to get back on track)

#### Target Cascade
- Corporate target definition
- Business unit target allocation
  - Pro-rata allocation
  - Custom allocation (weighted by emissions, revenue, headcount)
  - Bottom-up aggregation
- Facility target assignment
- Individual goal alignment
- Cascade validation (sum of parts = whole)
- Contribution tracking

### 2.6 SDG Alignment & Contribution Mapping

#### SDG Mapping
- Initiative-to-SDG mapping
- Target-to-SDG mapping
- Multi-goal alignment (primary, secondary, tertiary)
- Positive and negative impacts
- Trade-off analysis
- SDG target selection (169 targets)
- Indicator selection (231 indicators)

#### Impact Measurement
- SDG contribution quantification
- Outcome tracking
- Impact valuation (social, environmental, economic)
- Attribution modeling
- Additionality assessment
- Aggregate impact reporting

#### SDG Reporting
- SDG dashboard with progress by goal
- Visual storytelling (case studies, infographics)
- Integration with GRI, SASB, CDP reporting
- Public disclosure support
- Investor communication

### 2.7 Roadmap Visualization

#### Roadmap Builder
- Drag-and-drop roadmap creation
- Multi-year timeline (5-10 years)
- Initiative placement and sequencing
- Milestone visualization
- Dependency lines
- Critical path highlighting
- Swimlane grouping (by pillar, by BU, by theme)

#### Interactive Features
- Zoom and pan
- Filtering (by status, by priority, by owner)
- Scenario comparison (plan A vs plan B)
- Export to PowerPoint, PDF, PNG
- Real-time collaboration
- Version comparison

#### Status Tracking
- RAG status (Red, Amber, Green)
- Progress bars
- Alerts and notifications
- At-risk highlighting
- Completion tracking
- Archived initiatives

### 2.8 Strategy Reporting & Dashboards

#### Executive Dashboards
- Strategy health scorecard
- Portfolio performance summary
- Target achievement dashboard
- Budget vs actual
- ROI summary
- Key risk and issue summary
- Upcoming milestone summary

#### Board Presentations
- One-page strategy summary
- Quarterly progress reports
- Annual strategy review
- Investment requests
- Decision papers
- Board-ready visualizations

#### Stakeholder Communication
- Public-facing strategy webpage
- Investor updates
- Employee communications
- Customer disclosures
- Regulatory submissions

---

## 3. API Endpoints

### 3.1 Strategy Management Endpoints

#### Strategy CRUD
```yaml
POST /v1/strategies
  Description: Create a new ESG strategy
  Request:
    - name: string (required, "Net-Zero Strategy 2024-2050")
    - description: string (required)
    - vision: string (required, 500 words max)
    - mission: string (required, 500 words max)
    - strategicPillars: StrategicPillar[] (required)
    - timeHorizon: { startYear: number, endYear: number } (required)
    - status: "draft" | "approved" | "active" | "archived"
    - approvalWorkflowId: string (optional)
    - metadata: object
  Response:
    - strategyId: string
    - strategy: Strategy
    - message: string
  Events Published:
    - strategic.strategy.created.v1

GET /v1/strategies
  Description: List all strategies
  Query:
    - status: "draft" | "approved" | "active" | "archived"
    - organizationId: string
    - page: number
    - limit: number
  Response:
    - strategies: Strategy[]
    - total: number
    - page: number

GET /v1/strategies/:strategyId
  Description: Get strategy details
  Response:
    - strategy: Strategy
    - pillars: StrategicPillar[]
    - initiatives: InitiativeSummary[]
    - targets: TargetSummary[]
    - performance: StrategyPerformance

PUT /v1/strategies/:strategyId
  Description: Update strategy
  Request:
    - (same as POST, all fields optional)
  Response:
    - strategy: Strategy
  Events Published:
    - strategic.strategy.updated.v1

DELETE /v1/strategies/:strategyId
  Description: Archive strategy
  Response:
    - success: boolean
  Events Published:
    - strategic.strategy.archived.v1
```

#### Strategic Pillar Management
```yaml
POST /v1/strategies/:strategyId/pillars
  Description: Add strategic pillar
  Request:
    - name: string (required, "Decarbonization")
    - description: string
    - objectives: string[]
    - keyResults: KeyResult[]
    - owner: string (userId)
    - budget: number
  Response:
    - pillar: StrategicPillar
  Events Published:
    - strategic.strategy.pillar-added.v1

PUT /v1/strategies/:strategyId/pillars/:pillarId
  Description: Update pillar
  Response:
    - pillar: StrategicPillar

DELETE /v1/strategies/:strategyId/pillars/:pillarId
  Description: Remove pillar
  Response:
    - success: boolean
```

### 3.2 Initiative Portfolio Endpoints

#### Initiative Management
```yaml
POST /v1/initiatives
  Description: Create new initiative
  Request:
    - name: string (required)
    - description: string
    - strategyId: string (required)
    - pillarId: string (required)
    - businessCase: BusinessCase (required)
    - scope: string
    - objectives: string[]
    - successCriteria: string[]
    - startDate: date (required)
    - endDate: date (required)
    - owner: string (userId)
    - budget: Budget
    - tags: string[]
  Response:
    - initiativeId: string
    - initiative: Initiative
  Events Published:
    - strategic.strategy.initiative-launched.v1

GET /v1/initiatives
  Description: List initiatives with filters
  Query:
    - strategyId: string
    - pillarId: string
    - status: "planning" | "in-progress" | "on-hold" | "completed" | "cancelled"
    - priority: "critical" | "high" | "medium" | "low"
    - owner: string (userId)
    - tags: string[]
    - search: string
    - page: number
    - limit: number
  Response:
    - initiatives: Initiative[]
    - total: number
    - portfolioMetrics: PortfolioMetrics

GET /v1/initiatives/:initiativeId
  Description: Get initiative details
  Response:
    - initiative: Initiative
    - milestones: Milestone[]
    - risks: Risk[]
    - budget: BudgetDetail
    - roi: ROICalculation
    - dependencies: InitiativeDependency[]
    - updates: ProgressUpdate[]

PUT /v1/initiatives/:initiativeId
  Description: Update initiative
  Request:
    - (same as POST, all fields optional)
  Response:
    - initiative: Initiative
  Events Published:
    - strategic.strategy.initiative-updated.v1

DELETE /v1/initiatives/:initiativeId
  Description: Cancel/archive initiative
  Response:
    - success: boolean
```

#### Milestone Tracking
```yaml
POST /v1/initiatives/:initiativeId/milestones
  Description: Add milestone
  Request:
    - name: string (required)
    - description: string
    - dueDate: date (required)
    - owner: string (userId)
    - deliverables: string[]
    - dependencies: string[] (milestoneIds)
  Response:
    - milestone: Milestone
  Events Published:
    - strategic.strategy.milestone-created.v1

PUT /v1/initiatives/:initiativeId/milestones/:milestoneId
  Description: Update milestone (including status)
  Request:
    - status: "not-started" | "in-progress" | "completed" | "delayed"
    - completionDate: date (optional)
    - notes: string
  Response:
    - milestone: Milestone
  Events Published:
    - strategic.strategy.milestone-reached.v1 (when completed)

GET /v1/milestones/upcoming
  Description: Get upcoming milestones across all initiatives
  Query:
    - days: number (default: 30)
    - owner: string (userId)
  Response:
    - milestones: Milestone[]
```

#### Budget Tracking
```yaml
POST /v1/initiatives/:initiativeId/budget/allocations
  Description: Allocate budget to initiative
  Request:
    - amount: number (required)
    - currency: string (required, ISO 4217)
    - budgetYear: number (required)
    - category: "capex" | "opex" (required)
    - source: string (cost center, fund)
    - approvedBy: string (userId)
  Response:
    - allocation: BudgetAllocation
  Events Published:
    - strategic.strategy.budget-allocated.v1

POST /v1/initiatives/:initiativeId/budget/expenditures
  Description: Record expenditure
  Request:
    - amount: number (required)
    - currency: string (required)
    - category: "capex" | "opex" (required)
    - description: string
    - date: date (required)
    - invoiceNumber: string
    - vendor: string
  Response:
    - expenditure: Expenditure

GET /v1/initiatives/:initiativeId/budget/summary
  Description: Get budget summary
  Response:
    - allocated: number
    - spent: number
    - committed: number
    - available: number
    - variance: number
    - variancePercent: number
    - forecastToComplete: number
    - byCategory: { capex: BudgetBreakdown, opex: BudgetBreakdown }
```

#### ROI Calculation
```yaml
POST /v1/initiatives/:initiativeId/roi/calculate
  Description: Calculate ROI for initiative
  Request:
    - costs: CostBreakdown (capex, opex, maintenance)
    - benefits: BenefitBreakdown
      - carbonReduction: { tCO2e: number, valuationMethod: string, $/tCO2e: number }
      - costSavings: { energy: number, waste: number, water: number, other: number }
      - revenueGeneration: number
      - riskMitigation: number
      - reputationalValue: number
    - timeHorizon: number (years)
    - discountRate: number (%)
  Response:
    - roi: number (%)
    - paybackPeriod: number (years)
    - npv: number
    - irr: number
    - carbonAbatementCost: number ($/tCO2e)
    - bcr: number (benefit-cost ratio)
    - summary: string
  Events Published:
    - strategic.strategy.roi-calculated.v1

GET /v1/initiatives/:initiativeId/roi
  Description: Get latest ROI calculation
  Response:
    - roi: ROICalculation
    - historicalROI: ROICalculation[] (quarterly snapshots)
```

#### Portfolio Analytics
```yaml
GET /v1/portfolio/dashboard
  Description: Get portfolio-level metrics
  Query:
    - strategyId: string
    - pillarId: string
  Response:
    - totalInitiatives: number
    - byStatus: { planning: number, inProgress: number, completed: number }
    - totalBudget: number
    - totalSpent: number
    - avgROI: number
    - atRiskCount: number
    - completionRate: number
    - topPerformers: Initiative[]
    - needsAttention: Initiative[]

GET /v1/portfolio/dependencies
  Description: Get initiative dependency graph
  Response:
    - nodes: Initiative[]
    - edges: Dependency[]
    - criticalPath: string[] (initiativeIds)
```

### 3.3 Target Setting Endpoints

#### Science-Based Target Setting
```yaml
POST /v1/targets/sbti/wizard
  Description: SBTi target setting wizard
  Request:
    - baselineYear: number (required)
    - baselineEmissions: { scope1: number, scope2: number, scope3: number } (tCO2e)
    - targetYear: number (required, must be 5-15 years from baseline)
    - temperatureAlignment: "1.5C" | "2C" | "well-below-2C"
    - methodology: "SDA" | "ACA" | "absolute"
    - sector: string (GICS sector)
    - scope3Inclusion: boolean
    - nearTermTarget: boolean (2030 target)
    - longTermTarget: boolean (net-zero target)
  Response:
    - recommendedTargets: RecommendedTarget[]
    - validation: SBTiValidation
    - trajectory: EmissionTrajectory[]
    - narrative: string

POST /v1/targets/sbti
  Description: Create SBTi target
  Request:
    - name: string (required)
    - scope: "scope1" | "scope2" | "scope3" | "scope1+2" | "scope1+2+3"
    - targetType: "absolute" | "intensity"
    - baselineYear: number
    - baselineValue: number
    - targetYear: number
    - targetValue: number
    - reductionPercent: number
    - methodology: string
    - intensityMetric: string (optional, "per revenue", "per FTE")
    - sector: string
    - sbtiValidated: boolean
    - sbtiSubmissionDate: date (optional)
  Response:
    - targetId: string
    - target: Target
  Events Published:
    - strategic.target.set.v1

GET /v1/targets/sbti/validate
  Description: Validate target against SBTi criteria
  Query:
    - targetId: string
  Response:
    - valid: boolean
    - errors: ValidationError[]
    - warnings: string[]
    - recommendations: string[]
```

#### Net-Zero Planning
```yaml
POST /v1/netzero/roadmap
  Description: Generate net-zero roadmap
  Request:
    - baselineYear: number
    - baselineEmissions: number (tCO2e)
    - netZeroYear: number (required, 2040-2050)
    - interimMilestones: number[] (years, e.g., [2030, 2040])
    - abatementOptions: AbatementOption[]
      - name: string
      - reductionPotential: number (tCO2e)
      - cost: number
      - implementationYear: number
    - residualEmissions: number (estimated)
    - removalStrategy: "nature-based" | "technology-based" | "hybrid"
  Response:
    - roadmap: NetZeroRoadmap
    - abatementCurve: AbatementPoint[]
    - financialProjection: FinancialForecast
    - narrative: string
  Events Published:
    - strategic.strategy.netzero-roadmap-created.v1

GET /v1/netzero/roadmap/:roadmapId
  Description: Get net-zero roadmap
  Response:
    - roadmap: NetZeroRoadmap
    - progress: NetZeroProgress
    - risks: NetZeroRisk[]
```

### 3.4 KPI Management Endpoints

#### KPI Library
```yaml
GET /v1/kpis/library
  Description: Get KPI library
  Query:
    - category: "environmental" | "social" | "governance"
    - subcategory: string
    - framework: "GRI" | "SASB" | "TCFD" | "SDG" | "CDP"
    - industry: string
    - search: string
  Response:
    - kpis: KPITemplate[]
    - total: number

GET /v1/kpis/library/:kpiId
  Description: Get KPI template details
  Response:
    - kpi: KPITemplate
    - calculation: CalculationMethod
    - dataSources: DataSource[]
    - benchmarks: Benchmark[]
```

#### Custom KPI Builder
```yaml
POST /v1/kpis/custom
  Description: Create custom KPI
  Request:
    - name: string (required)
    - description: string
    - category: string (required)
    - unit: string (required)
    - formula: string (required, mathematical expression)
    - dataSourceMapping: DataSourceMap[] (required)
      - variable: string (e.g., "total_emissions")
      - sourceService: string (e.g., "carbon-service")
      - sourceMetric: string
      - aggregation: "sum" | "avg" | "max" | "min" | "weighted-avg"
    - normalizationFactor: string (optional, "per_revenue", "per_fte", "per_sqm")
    - frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually"
    - owner: string (userId)
    - visibility: "public" | "private" | "organization"
  Response:
    - kpiId: string
    - kpi: CustomKPI
  Events Published:
    - strategic.kpi.created.v1

PUT /v1/kpis/custom/:kpiId/test
  Description: Test custom KPI calculation
  Request:
    - testData: object (sample data)
  Response:
    - result: number
    - calculation: CalculationStep[]
    - valid: boolean
    - errors: ValidationError[]
```

#### KPI Instance Management
```yaml
POST /v1/kpis/:kpiId/instances
  Description: Instantiate KPI for organization/facility
  Request:
    - organizationId: string (required)
    - facilityId: string (optional)
    - startDate: date (required)
    - targetValue: number (optional)
    - threshold: { green: number, amber: number, red: number } (optional)
    - owner: string (userId)
  Response:
    - instanceId: string
    - instance: KPIInstance

GET /v1/kpis/instances
  Description: Get KPI instances
  Query:
    - organizationId: string
    - facilityId: string
    - category: string
    - owner: string
  Response:
    - instances: KPIInstance[]

POST /v1/kpis/instances/:instanceId/values
  Description: Record KPI value
  Request:
    - value: number (required)
    - date: date (required)
    - source: "manual" | "automated" | "integration"
    - notes: string
  Response:
    - valueId: string
    - value: KPIValue
  Events Published:
    - strategic.kpi.value-recorded.v1

GET /v1/kpis/instances/:instanceId/values
  Description: Get KPI values (time series)
  Query:
    - startDate: date
    - endDate: date
    - aggregation: "raw" | "daily" | "weekly" | "monthly"
  Response:
    - values: KPIValue[]
    - statistics: { min: number, max: number, avg: number, trend: string }
```

### 3.5 Target Tracking Endpoints

#### Target Management
```yaml
POST /v1/targets
  Description: Create target
  Request:
    - name: string (required)
    - kpiId: string (required)
    - targetType: "absolute" | "intensity" | "relative"
    - baselineYear: number (required)
    - baselineValue: number (required)
    - targetYear: number (required)
    - targetValue: number (required)
    - interimMilestones: Milestone[]
      - year: number
      - value: number
    - scope: string (e.g., "global", "region:EMEA", "facility:123")
    - owner: string (userId)
    - parentTargetId: string (optional, for cascaded targets)
    - sdgAlignment: string[] (SDG goal numbers)
    - tags: string[]
  Response:
    - targetId: string
    - target: Target
  Events Published:
    - strategic.target.set.v1

GET /v1/targets
  Description: List targets
  Query:
    - kpiId: string
    - status: "active" | "achieved" | "at-risk" | "missed" | "archived"
    - owner: string
    - scope: string
    - sdg: string
    - search: string
  Response:
    - targets: Target[]
    - total: number

GET /v1/targets/:targetId
  Description: Get target details
  Response:
    - target: Target
    - progress: TargetProgress
    - trajectory: TrajectoryPoint[]
    - forecast: TargetForecast
    - risks: TargetRisk[]

PUT /v1/targets/:targetId
  Description: Update target
  Request:
    - (same as POST, all fields optional)
  Response:
    - target: Target
  Events Published:
    - strategic.target.updated.v1
```

#### Progress Tracking
```yaml
POST /v1/targets/:targetId/progress
  Description: Record manual progress update
  Request:
    - currentValue: number (required)
    - date: date (required)
    - notes: string
    - source: string
  Response:
    - progress: TargetProgress
  Events Published:
    - strategic.target.progress-measured.v1

GET /v1/targets/:targetId/progress
  Description: Get progress history
  Query:
    - startDate: date
    - endDate: date
  Response:
    - history: ProgressPoint[]
    - currentProgress: TargetProgress
    - trajectory: "on-track" | "ahead" | "behind" | "at-risk"
    - gapToTarget: number
    - percentComplete: number

POST /v1/targets/:targetId/forecast
  Description: Generate forecast
  Request:
    - method: "linear" | "ml" | "scenario"
    - scenarioAssumptions: object (optional, for scenario-based)
  Response:
    - forecast: TargetForecast
    - confidence: number (%)
    - projectedAchievement: { date: date, value: number }
    - gapAnalysis: GapAnalysis
    - recommendations: string[]
  Events Published:
    - strategic.target.forecast-generated.v1
```

#### Target Cascade
```yaml
POST /v1/targets/:targetId/cascade
  Description: Cascade target to lower levels
  Request:
    - cascadeMethod: "pro-rata" | "weighted" | "custom"
    - levels: CascadeLevel[]
      - scope: string (e.g., "business-unit", "facility", "individual")
      - entities: string[] (entity IDs)
      - allocationWeights: object (optional, for weighted method)
    - validation: boolean (default: true)
  Response:
    - cascadedTargets: Target[]
    - validation: CascadeValidation
  Events Published:
    - strategic.target.cascaded.v1

GET /v1/targets/:targetId/cascade
  Description: Get cascade hierarchy
  Response:
    - parent: Target
    - children: Target[]
    - grandchildren: Target[]
    - aggregation: CascadeAggregation
    - contributionAnalysis: Contribution[]
```

### 3.6 SDG Alignment Endpoints

```yaml
POST /v1/sdg/alignments
  Description: Create SDG alignment
  Request:
    - entityType: "strategy" | "initiative" | "target"
    - entityId: string (required)
    - sdgGoal: number (required, 1-17)
    - sdgTargets: string[] (e.g., ["1.1", "1.2"])
    - sdgIndicators: string[] (optional)
    - alignmentType: "primary" | "secondary" | "tertiary"
    - impact: "positive" | "negative" | "mixed"
    - contribution: string (qualitative description)
    - quantification: number (optional)
  Response:
    - alignmentId: string
    - alignment: SDGAlignment

GET /v1/sdg/alignments
  Description: Get SDG alignments
  Query:
    - entityType: string
    - entityId: string
    - sdgGoal: number
  Response:
    - alignments: SDGAlignment[]

GET /v1/sdg/dashboard
  Description: Get SDG contribution dashboard
  Query:
    - organizationId: string
  Response:
    - byGoal: SDGContribution[] (17 goals)
    - totalContribution: AggregateSDGImpact
    - topContributors: Initiative[]
    - tradeOffs: SDGTradeoff[]

POST /v1/sdg/impact/measure
  Description: Measure SDG impact
  Request:
    - initiativeId: string (required)
    - sdgGoal: number (required)
    - outcomes: Outcome[]
      - indicator: string
      - baseline: number
      - actual: number
      - date: date
    - attribution: number (%, how much of outcome is due to initiative)
  Response:
    - impact: SDGImpact
    - valuation: number (optional, monetized value)
```

### 3.7 Roadmap Visualization Endpoints

```yaml
POST /v1/roadmaps
  Description: Create roadmap
  Request:
    - name: string (required)
    - strategyId: string (required)
    - startYear: number (required)
    - endYear: number (required)
    - viewType: "timeline" | "gantt" | "swimlane"
    - initiativeIds: string[] (required)
    - groupBy: "pillar" | "owner" | "priority" | "custom"
  Response:
    - roadmapId: string
    - roadmap: Roadmap

GET /v1/roadmaps/:roadmapId
  Description: Get roadmap
  Response:
    - roadmap: Roadmap
    - initiatives: InitiativeWithTimeline[]
    - milestones: MilestoneWithPosition[]
    - dependencies: Dependency[]
    - criticalPath: string[] (initiativeIds)

PUT /v1/roadmaps/:roadmapId/layout
  Description: Update roadmap layout
  Request:
    - positions: { [initiativeId: string]: Position }
  Response:
    - roadmap: Roadmap

GET /v1/roadmaps/:roadmapId/export
  Description: Export roadmap
  Query:
    - format: "png" | "pdf" | "pptx" | "json"
  Response:
    - file: Buffer (binary)
    - contentType: string
```

### 3.8 Reporting Endpoints

```yaml
GET /v1/reports/strategy/executive-summary
  Description: Get executive summary report
  Query:
    - strategyId: string (required)
    - asOfDate: date (default: today)
  Response:
    - strategy: StrategySummary
    - performance: PerformanceMetrics
    - portfolio: PortfolioHealth
    - targets: TargetAchievement
    - financials: FinancialSummary
    - risks: RiskSummary
    - upcomingMilestones: Milestone[]

GET /v1/reports/strategy/board-presentation
  Description: Get board presentation data
  Query:
    - strategyId: string
    - quarter: string (e.g., "2024-Q3")
  Response:
    - slides: PresentationSlide[]
    - narrative: string
    - keyMessages: string[]
    - charts: ChartData[]

GET /v1/reports/initiatives/portfolio-dashboard
  Description: Get portfolio dashboard
  Query:
    - strategyId: string
  Response:
    - overview: PortfolioOverview
    - byStatus: InitiativesByStatus
    - byPillar: InitiativesByPillar
    - budgetSummary: BudgetSummary
    - roiSummary: ROISummary
    - atRisk: Initiative[]

GET /v1/reports/targets/achievement
  Description: Get target achievement report
  Query:
    - year: number
    - category: string
  Response:
    - targets: TargetWithProgress[]
    - achievementRate: number
    - onTrack: number
    - atRisk: number
    - achieved: number
    - missed: number
```

---

## 4. Data Models

### 4.1 MongoDB Collections

#### strategies
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId (ref: organizations),
  name: string,
  description: string,
  vision: string,
  mission: string,
  timeHorizon: {
    startYear: number,
    endYear: number
  },
  status: "draft" | "approved" | "active" | "archived",
  approvedBy: ObjectId (ref: users),
  approvedDate: Date,
  pillars: [
    {
      pillarId: ObjectId,
      name: string,
      description: string,
      objectives: string[],
      keyResults: [
        {
          kr: string,
          targetValue: number,
          currentValue: number,
          status: "on-track" | "at-risk" | "achieved"
        }
      ],
      owner: ObjectId (ref: users),
      budget: number
    }
  ],
  metadata: {
    createdBy: ObjectId,
    createdAt: Date,
    updatedBy: ObjectId,
    updatedAt: Date,
    version: number
  },
  tags: string[]
}

Indexes:
  - { organizationId: 1, status: 1 }
  - { "pillars.owner": 1 }
  - { "metadata.createdAt": -1 }
```

#### initiatives
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId (ref: organizations),
  strategyId: ObjectId (ref: strategies),
  pillarId: ObjectId,
  name: string,
  description: string,
  businessCase: {
    problem: string,
    solution: string,
    benefits: string[],
    risks: string[],
    assumptions: string[]
  },
  scope: string,
  objectives: string[],
  successCriteria: string[],
  status: "planning" | "in-progress" | "on-hold" | "completed" | "cancelled",
  priority: "critical" | "high" | "medium" | "low",
  startDate: Date,
  endDate: Date,
  actualEndDate: Date,
  owner: ObjectId (ref: users),
  team: [
    {
      userId: ObjectId (ref: users),
      role: string,
      allocation: number (%)
    }
  ],
  milestones: [
    {
      milestoneId: ObjectId,
      name: string,
      description: string,
      dueDate: Date,
      completionDate: Date,
      status: "not-started" | "in-progress" | "completed" | "delayed",
      owner: ObjectId (ref: users),
      deliverables: string[],
      dependencies: ObjectId[] (milestoneIds)
    }
  ],
  budget: {
    allocated: number,
    spent: number,
    committed: number,
    currency: string,
    byCategory: {
      capex: number,
      opex: number
    }
  },
  roi: {
    calculatedDate: Date,
    roi: number,
    paybackPeriod: number,
    npv: number,
    irr: number,
    carbonAbatementCost: number
  },
  dependencies: [
    {
      dependsOn: ObjectId (ref: initiatives),
      dependencyType: "finish-to-start" | "start-to-start" | "finish-to-finish"
    }
  ],
  risks: [
    {
      riskId: ObjectId,
      description: string,
      probability: "low" | "medium" | "high",
      impact: "low" | "medium" | "high",
      mitigation: string,
      status: "open" | "mitigated" | "closed"
    }
  ],
  progressUpdates: [
    {
      date: Date,
      ragStatus: "green" | "amber" | "red",
      update: string,
      author: ObjectId (ref: users)
    }
  ],
  metadata: {
    createdBy: ObjectId,
    createdAt: Date,
    updatedBy: ObjectId,
    updatedAt: Date
  },
  tags: string[]
}

Indexes:
  - { strategyId: 1, status: 1 }
  - { owner: 1 }
  - { status: 1, priority: -1 }
  - { "milestones.dueDate": 1 }
  - { tags: 1 }
```

#### targets
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId (ref: organizations),
  strategyId: ObjectId (ref: strategies),
  kpiId: ObjectId (ref: kpis or kpiInstances),
  name: string,
  description: string,
  targetType: "absolute" | "intensity" | "relative",
  baselineYear: number,
  baselineValue: number,
  targetYear: number,
  targetValue: number,
  reductionPercent: number,
  unit: string,
  intensityMetric: string, // e.g., "per revenue", "per FTE"
  scope: {
    type: "global" | "region" | "business-unit" | "facility" | "individual",
    id: string
  },
  interimMilestones: [
    {
      year: number,
      value: number,
      achieved: boolean
    }
  ],
  status: "active" | "achieved" | "at-risk" | "missed" | "archived",
  owner: ObjectId (ref: users),
  sbti: {
    isSBTi: boolean,
    methodology: "SDA" | "ACA" | "absolute",
    temperatureAlignment: "1.5C" | "2C" | "well-below-2C",
    validated: boolean,
    submissionDate: Date,
    approvalDate: Date,
    sector: string
  },
  parentTargetId: ObjectId (ref: targets), // for cascaded targets
  childTargetIds: ObjectId[] (ref: targets),
  cascadeMethod: "pro-rata" | "weighted" | "custom",
  sdgAlignment: [
    {
      goal: number (1-17),
      targets: string[], // e.g., ["1.1", "1.2"]
      indicators: string[],
      alignmentType: "primary" | "secondary" | "tertiary",
      impact: "positive" | "negative" | "mixed"
    }
  ],
  progress: [
    {
      date: Date,
      value: number,
      source: "manual" | "automated" | "integration",
      notes: string
    }
  ],
  currentProgress: {
    date: Date,
    value: number,
    percentComplete: number,
    trajectory: "on-track" | "ahead" | "behind" | "at-risk",
    gapToTarget: number
  },
  forecast: {
    generatedDate: Date,
    method: "linear" | "ml" | "scenario",
    projectedAchievement: {
      date: Date,
      value: number,
      confidence: number
    },
    recommendations: string[]
  },
  metadata: {
    createdBy: ObjectId,
    createdAt: Date,
    updatedBy: ObjectId,
    updatedAt: Date
  },
  tags: string[]
}

Indexes:
  - { organizationId: 1, status: 1 }
  - { strategyId: 1 }
  - { kpiId: 1 }
  - { owner: 1 }
  - { "sbti.isSBTi": 1 }
  - { parentTargetId: 1 }
  - { "sdgAlignment.goal": 1 }
  - { "currentProgress.trajectory": 1 }
```

#### kpis
```typescript
{
  _id: ObjectId,
  type: "library" | "custom",
  name: string,
  description: string,
  category: "environmental" | "social" | "governance",
  subcategory: string,
  unit: string,
  formula: string, // mathematical expression
  dataSources: [
    {
      variable: string,
      sourceService: string,
      sourceMetric: string,
      aggregation: "sum" | "avg" | "max" | "min" | "weighted-avg"
    }
  ],
  normalizationFactor: string, // "per_revenue", "per_fte", "per_sqm"
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually",
  frameworkAlignment: [
    {
      framework: "GRI" | "SASB" | "TCFD" | "SDG" | "CDP",
      code: string,
      description: string
    }
  ],
  industry: string,
  visibility: "public" | "private" | "organization",
  owner: ObjectId (ref: users),
  metadata: {
    createdBy: ObjectId,
    createdAt: Date,
    updatedBy: ObjectId,
    updatedAt: Date
  }
}

Indexes:
  - { type: 1, category: 1 }
  - { "frameworkAlignment.framework": 1 }
  - { industry: 1 }
  - { owner: 1 }
```

#### kpiInstances
```typescript
{
  _id: ObjectId,
  kpiId: ObjectId (ref: kpis),
  organizationId: ObjectId (ref: organizations),
  facilityId: ObjectId (ref: facilities), // optional
  startDate: Date,
  targetValue: number,
  threshold: {
    green: number,
    amber: number,
    red: number
  },
  owner: ObjectId (ref: users),
  values: [
    {
      date: Date,
      value: number,
      source: "manual" | "automated" | "integration",
      notes: string,
      recordedBy: ObjectId (ref: users)
    }
  ],
  currentValue: number,
  trend: "improving" | "stable" | "declining",
  status: "green" | "amber" | "red",
  metadata: {
    createdBy: ObjectId,
    createdAt: Date,
    updatedBy: ObjectId,
    updatedAt: Date
  }
}

Indexes:
  - { kpiId: 1, organizationId: 1 }
  - { facilityId: 1 }
  - { owner: 1 }
  - { "values.date": 1 }
```

#### roadmaps
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId (ref: organizations),
  strategyId: ObjectId (ref: strategies),
  name: string,
  viewType: "timeline" | "gantt" | "swimlane",
  startYear: number,
  endYear: number,
  groupBy: "pillar" | "owner" | "priority" | "custom",
  layout: {
    initiativePositions: {
      [initiativeId: string]: {
        x: number,
        y: number,
        swimlane: string
      }
    }
  },
  filters: {
    status: string[],
    priority: string[],
    owner: string[]
  },
  metadata: {
    createdBy: ObjectId,
    createdAt: Date,
    updatedBy: ObjectId,
    updatedAt: Date
  }
}

Indexes:
  - { strategyId: 1 }
  - { organizationId: 1 }
```

#### budgetAllocations
```typescript
{
  _id: ObjectId,
  initiativeId: ObjectId (ref: initiatives),
  amount: number,
  currency: string,
  budgetYear: number,
  category: "capex" | "opex",
  source: string, // cost center, fund
  approvedBy: ObjectId (ref: users),
  approvalDate: Date,
  metadata: {
    createdBy: ObjectId,
    createdAt: Date
  }
}

Indexes:
  - { initiativeId: 1, budgetYear: 1 }
  - { category: 1 }
```

#### expenditures
```typescript
{
  _id: ObjectId,
  initiativeId: ObjectId (ref: initiatives),
  amount: number,
  currency: string,
  category: "capex" | "opex",
  description: string,
  date: Date,
  invoiceNumber: string,
  vendor: string,
  approvedBy: ObjectId (ref: users),
  metadata: {
    createdBy: ObjectId,
    createdAt: Date
  }
}

Indexes:
  - { initiativeId: 1, date: -1 }
  - { category: 1 }
```

#### sdgAlignments
```typescript
{
  _id: ObjectId,
  entityType: "strategy" | "initiative" | "target",
  entityId: ObjectId,
  sdgGoal: number (1-17),
  sdgTargets: string[], // e.g., ["1.1", "1.2"]
  sdgIndicators: string[],
  alignmentType: "primary" | "secondary" | "tertiary",
  impact: "positive" | "negative" | "mixed",
  contribution: string,
  quantification: number,
  impactMeasurements: [
    {
      indicator: string,
      baseline: number,
      actual: number,
      date: Date,
      attribution: number (%)
    }
  ],
  metadata: {
    createdBy: ObjectId,
    createdAt: Date,
    updatedBy: ObjectId,
    updatedAt: Date
  }
}

Indexes:
  - { entityType: 1, entityId: 1 }
  - { sdgGoal: 1 }
```

### 4.2 Time-Series Data (InfluxDB)

#### Measurement: target_progress
```typescript
{
  time: timestamp,
  tags: {
    targetId: string,
    organizationId: string,
    kpiId: string,
    scope: string
  },
  fields: {
    value: float,
    baselineValue: float,
    targetValue: float,
    percentComplete: float,
    gapToTarget: float,
    trajectory: string ("on-track", "ahead", "behind", "at-risk")
  }
}
```

#### Measurement: initiative_health
```typescript
{
  time: timestamp,
  tags: {
    initiativeId: string,
    strategyId: string,
    pillarId: string,
    owner: string
  },
  fields: {
    ragStatus: string ("green", "amber", "red"),
    budgetUtilization: float (%),
    scheduleVariance: float (days),
    milestonesCompleted: integer,
    milestonesTotal: integer,
    riskCount: integer
  }
}
```

#### Measurement: portfolio_metrics
```typescript
{
  time: timestamp,
  tags: {
    strategyId: string,
    organizationId: string
  },
  fields: {
    totalInitiatives: integer,
    activeInitiatives: integer,
    completedInitiatives: integer,
    totalBudget: float,
    totalSpent: float,
    avgROI: float,
    atRiskCount: integer,
    completionRate: float
  }
}
```

### 4.3 Graph Data (Neo4j)

#### Nodes

**Strategy**
```cypher
(:Strategy {
  id: string,
  name: string,
  organizationId: string,
  status: string
})
```

**Initiative**
```cypher
(:Initiative {
  id: string,
  name: string,
  status: string,
  priority: string,
  startDate: date,
  endDate: date
})
```

**Target**
```cypher
(:Target {
  id: string,
  name: string,
  targetType: string,
  targetYear: integer,
  status: string
})
```

**KPI**
```cypher
(:KPI {
  id: string,
  name: string,
  category: string
})
```

**SDG**
```cypher
(:SDG {
  goal: integer,
  name: string
})
```

#### Relationships

```cypher
// Strategy to Initiative
(:Strategy)-[:HAS_INITIATIVE]->(:Initiative)

// Initiative dependencies
(:Initiative)-[:DEPENDS_ON {type: string}]->(:Initiative)

// Initiative to Target
(:Initiative)-[:CONTRIBUTES_TO]->(:Target)

// Target cascade
(:Target)-[:CASCADED_FROM]->(:Target)

// Target to KPI
(:Target)-[:MEASURES]->(:KPI)

// SDG alignment
(:Initiative)-[:ALIGNS_WITH {type: string, impact: string}]->(:SDG)
(:Target)-[:ALIGNS_WITH {type: string}]->(:SDG)

// Initiative to Pillar
(:Initiative)-[:BELONGS_TO]->(:StrategicPillar)
```

---

## 5. Events

### 5.1 Events Published

#### Strategy Events
```typescript
strategic.strategy.created.v1
{
  strategyId: string,
  organizationId: string,
  name: string,
  status: string,
  createdBy: string,
  timestamp: ISO8601
}

strategic.strategy.updated.v1
{
  strategyId: string,
  changes: object,
  updatedBy: string,
  timestamp: ISO8601
}

strategic.strategy.approved.v1
{
  strategyId: string,
  approvedBy: string,
  approvalDate: ISO8601,
  timestamp: ISO8601
}

strategic.strategy.archived.v1
{
  strategyId: string,
  archivedBy: string,
  timestamp: ISO8601
}
```

#### Initiative Events
```typescript
strategic.strategy.initiative-launched.v1
{
  initiativeId: string,
  strategyId: string,
  pillarId: string,
  name: string,
  owner: string,
  startDate: ISO8601,
  timestamp: ISO8601
}

strategic.strategy.initiative-updated.v1
{
  initiativeId: string,
  changes: object,
  updatedBy: string,
  timestamp: ISO8601
}

strategic.strategy.milestone-reached.v1
{
  initiativeId: string,
  milestoneId: string,
  milestoneName: string,
  completionDate: ISO8601,
  timestamp: ISO8601
}

strategic.strategy.budget-allocated.v1
{
  initiativeId: string,
  amount: number,
  currency: string,
  category: string,
  budgetYear: number,
  timestamp: ISO8601
}

strategic.strategy.roi-calculated.v1
{
  initiativeId: string,
  roi: number,
  paybackPeriod: number,
  npv: number,
  irr: number,
  carbonAbatementCost: number,
  timestamp: ISO8601
}
```

#### Target Events
```typescript
strategic.target.set.v1
{
  targetId: string,
  organizationId: string,
  kpiId: string,
  name: string,
  targetType: string,
  baselineYear: number,
  targetYear: number,
  targetValue: number,
  owner: string,
  timestamp: ISO8601
}

strategic.target.updated.v1
{
  targetId: string,
  changes: object,
  updatedBy: string,
  timestamp: ISO8601
}

strategic.target.progress-measured.v1
{
  targetId: string,
  date: ISO8601,
  value: number,
  percentComplete: number,
  trajectory: string,
  timestamp: ISO8601
}

strategic.target.achieved.v1
{
  targetId: string,
  achievementDate: ISO8601,
  finalValue: number,
  timestamp: ISO8601
}

strategic.target.missed.v1
{
  targetId: string,
  targetYear: number,
  targetValue: number,
  actualValue: number,
  gap: number,
  timestamp: ISO8601
}

strategic.target.cascaded.v1
{
  parentTargetId: string,
  childTargetIds: string[],
  cascadeMethod: string,
  timestamp: ISO8601
}

strategic.target.forecast-generated.v1
{
  targetId: string,
  forecastMethod: string,
  projectedAchievement: object,
  confidence: number,
  timestamp: ISO8601
}
```

#### KPI Events
```typescript
strategic.kpi.created.v1
{
  kpiId: string,
  name: string,
  category: string,
  type: string,
  createdBy: string,
  timestamp: ISO8601
}

strategic.kpi.value-recorded.v1
{
  kpiInstanceId: string,
  kpiId: string,
  date: ISO8601,
  value: number,
  source: string,
  timestamp: ISO8601
}
```

#### SDG Events
```typescript
strategic.sdg.alignment-created.v1
{
  alignmentId: string,
  entityType: string,
  entityId: string,
  sdgGoal: number,
  alignmentType: string,
  impact: string,
  timestamp: ISO8601
}

strategic.sdg.impact-measured.v1
{
  alignmentId: string,
  sdgGoal: number,
  indicator: string,
  baseline: number,
  actual: number,
  date: ISO8601,
  timestamp: ISO8601
}
```

### 5.2 Events Consumed

#### From Organization Service
```typescript
platform.organization.created.v1
// Use: Auto-create default strategy template

platform.facility.added.v1
// Use: Extend target cascade to new facility
```

#### From Identity Service
```typescript
platform.user.created.v1
// Use: Add user to target ownership options

platform.user.role-assigned.v1
// Use: Grant strategy management permissions
```

#### From Carbon Service
```typescript
environmental.carbon.emission-calculated.v1
// Use: Auto-update carbon reduction target progress

environmental.carbon.scope1-calculated.v1
environmental.carbon.scope2-calculated.v1
environmental.carbon.scope3-calculated.v1
// Use: Update scope-specific target progress
```

#### From Water Service
```typescript
environmental.water.consumption-recorded.v1
// Use: Update water reduction target progress
```

#### From Waste Service
```typescript
environmental.waste.diverted.v1
// Use: Update waste diversion target progress
```

#### From Energy Service
```typescript
environmental.energy.renewable-generated.v1
// Use: Update renewable energy target progress
```

#### From Workflow Service
```typescript
platform.approval.granted.v1
// Use: Activate approved strategy or initiative

platform.approval.rejected.v1
// Use: Mark strategy/initiative as needs-revision
```

#### From Audit Service
```typescript
platform.audit.compliance-check.v1
// Use: Log compliance-related target verification
```

---

## 6. Service Dependencies

### 6.1 Upstream Dependencies

**Identity Service (3001)**
- User authentication and authorization
- User profile information
- Role and permission validation

**Organization Service (3002)**
- Organization hierarchy
- Facility information
- Business unit structure

**Reference Service (3003)**
- ESG factor library
- Industry benchmarks
- Framework mappings (GRI, SASB, TCFD, SDG)

**Carbon Service (3011)**
- Emission data for carbon targets
- SBTi validation support
- Carbon abatement project data

**Water Service (3012)**
- Water consumption data
- Water stress metrics

**Waste Service (3013)**
- Waste generation and diversion data

**Energy Service (3015)**
- Energy consumption data
- Renewable energy generation data

**Workflow Service (3009)**
- Approval workflows for strategies and budgets
- Automated reminders for milestone due dates
- Escalation for at-risk initiatives

**Audit Service (3007)**
- Audit trail for strategy changes
- Compliance verification

**Notification Service (3008)**
- Email notifications for milestone due dates
- Alerts for at-risk targets
- Report distribution

### 6.2 Downstream Consumers

**Reporting Service (3044)**
- Strategy performance data for ESG reports
- Target achievement data for sustainability reports
- Initiative portfolio for disclosure

**Analytics Service (3045)**
- Strategy effectiveness analysis
- Target trajectory modeling
- Portfolio optimization recommendations

**ML Service (3046)**
- Target achievement prediction models
- Initiative risk prediction
- ROI forecasting

**Benchmark Service (3043)**
- Peer comparison of strategy ambition
- Industry target benchmarking

**Materiality Service (3041)**
- Strategy alignment with material topics
- Initiative prioritization based on materiality

**Stakeholder Service (3038)**
- Strategy communication to stakeholders
- Target disclosure

**Frontend Application**
- Strategy dashboards
- Initiative portfolio view
- Target tracking UI
- Roadmap visualization

### 6.3 External Integrations

**SBTi Platform (future)**
- Target submission API
- Validation status polling
- Public target database

**ERP Systems (SAP, Oracle)**
- Budget data import
- Actual expenditure data
- Financial metrics for ROI calculation

**Project Management Tools (Jira, Asana)**
- Initiative synchronization
- Milestone tracking
- Team collaboration

**Sustainability Platforms (Workiva, Persefoni)**
- Target data export
- Initiative data sharing

**Data Providers (MSCI, CDP)**
- Industry benchmarks
- Peer target data
- Best practice repository

---

## 7. Non-Functional Requirements

### 7.1 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p95) | <200ms | All GET endpoints |
| API Response Time (p99) | <500ms | All GET endpoints |
| Write Operations | <1s | Target progress update, initiative create |
| Complex Calculations | <3s | ROI calculation, target cascade, forecast generation |
| Report Generation | <5s | Executive summary, board presentation |
| Roadmap Rendering | <2s | Roadmap with 100+ initiatives |
| Concurrent Users | 1,000+ | Peak load during strategy planning cycles |
| Database Queries | <100ms | MongoDB queries with proper indexing |

### 7.2 Scalability Requirements

**Data Volume**
- Support 10,000+ initiatives per organization
- Handle 1,000+ targets with cascaded levels
- Store 10 years of historical progress data
- Manage 500+ KPIs per organization

**User Scale**
- Support 10,000+ users across all tenants
- Handle 100 concurrent strategy editing sessions
- Manage 50 concurrent roadmap visualizations

**Growth**
- 50% year-over-year data growth
- Horizontal scaling for API layer
- Read replicas for reporting queries
- Caching for frequently accessed data

### 7.3 Security Requirements

**Authentication & Authorization**
- JWT-based authentication with JWKS verification
- Role-based access control (RBAC)
  - Strategy Admin: Full strategy management
  - Initiative Owner: Manage assigned initiatives
  - Target Owner: Update target progress
  - Viewer: Read-only access
- Attribute-based access control (ABAC) for multi-tenant isolation
- API key authentication for service-to-service calls

**Data Protection**
- Encryption at rest (AES-256) for sensitive strategy data
- Encryption in transit (TLS 1.3)
- PII redaction in logs
- Sensitive field masking (budget amounts) based on user role

**Audit & Compliance**
- Complete audit trail for all strategy changes
- Immutable event log for target updates
- Change history with user attribution
- Compliance with SOC 2, ISO 27001

**Input Validation**
- Schema validation for all API requests (Zod)
- XSS prevention
- SQL/NoSQL injection prevention
- File upload validation (size, type for document attachments)

### 7.4 Compliance Requirements

**Data Privacy**
- GDPR compliance for EU users
- CCPA compliance for California users
- Data retention policies (7 years for financial data)
- Right to be forgotten (user data deletion)

**Financial Data**
- SOX compliance for budget and expenditure tracking
- Audit trail for financial transactions
- Separation of duties (budget allocation vs expenditure approval)

**ESG Reporting**
- SBTi validation compliance
- GRI Standards alignment
- SASB disclosure support
- TCFD recommendations adherence

---

## 8. Testing Strategy

### 8.1 Unit Test Coverage

**Target Coverage**: 90%

**Key Areas**
- Strategy creation and validation logic
- Initiative ROI calculation algorithms
- Target progress calculation
- Target cascade logic (pro-rata, weighted allocation)
- SBTi validation rules
- KPI formula parser and calculator
- Forecast algorithms (linear, ML-based)

**Example Test Cases**
```typescript
describe('Target Cascade', () => {
  it('should allocate target pro-rata by baseline emissions', () => {
    const parentTarget = createTarget({ baselineValue: 1000, targetValue: 500 });
    const facilities = [
      { id: 'A', baselineEmissions: 600 },
      { id: 'B', baselineEmissions: 400 }
    ];

    const cascaded = cascadeTarget(parentTarget, facilities, 'pro-rata');

    expect(cascaded[0].targetValue).toBe(300); // 60% of 500
    expect(cascaded[1].targetValue).toBe(200); // 40% of 500
  });
});

describe('SBTi Validation', () => {
  it('should reject target with insufficient ambition', () => {
    const target = createTarget({
      baselineYear: 2020,
      targetYear: 2030,
      baselineValue: 1000,
      targetValue: 900, // Only 10% reduction
      methodology: 'absolute',
      temperatureAlignment: '1.5C'
    });

    const result = validateSBTi(target);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Reduction insufficient for 1.5°C pathway');
  });
});
```

### 8.2 Integration Test Scenarios

**Target Coverage**: 80%

**Test Scenarios**

1. **End-to-End Strategy Creation**
   - Create strategy → Add pillars → Launch initiatives → Set targets
   - Verify: All entities created, relationships established, events published

2. **Target Progress Auto-Update**
   - Consume emission event from Carbon Service → Update target progress
   - Verify: Progress calculated, trajectory updated, alerts triggered if at-risk

3. **Target Cascade Validation**
   - Create parent target → Cascade to 10 facilities → Update one facility progress
   - Verify: Parent progress aggregates correctly, percentages sum to 100%

4. **ROI Calculation Pipeline**
   - Record expenditures → Calculate carbon abatement → Compute ROI
   - Verify: NPV, IRR, payback period calculated correctly

5. **SBTi Submission Workflow**
   - Set science-based target → Validate → Submit to approval workflow → Approve
   - Verify: Workflow transitions, validation checks, email notifications

6. **Roadmap Export**
   - Create roadmap with 50 initiatives → Export to PDF/PPTX
   - Verify: Visual layout preserved, data accuracy, performance <5s

### 8.3 Contract Tests

**Pact Consumer Tests**

Strategy Service as **Consumer** of Carbon Service:
```typescript
pactWith({ consumer: 'StrategyService', provider: 'CarbonService' }, (provider) => {
  describe('GET /v1/emissions/organization/:orgId/total', () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: 'organization has emissions data',
        uponReceiving: 'a request for total emissions',
        withRequest: {
          method: 'GET',
          path: '/v1/emissions/organization/org-123/total',
          query: { year: '2023' }
        },
        willRespondWith: {
          status: 200,
          body: {
            scope1: 1000,
            scope2: 500,
            scope3: 2000,
            total: 3500,
            unit: 'tCO2e'
          }
        }
      });
    });

    it('fetches total emissions for target progress', async () => {
      const emissions = await carbonClient.getTotalEmissions('org-123', 2023);
      expect(emissions.total).toBe(3500);
    });
  });
});
```

Strategy Service as **Provider** for Reporting Service:
```typescript
// Reporting Service expects this contract
{
  state: 'strategy exists with targets',
  uponReceiving: 'a request for target achievement data',
  withRequest: {
    method: 'GET',
    path: '/v1/reports/targets/achievement',
    query: { year: '2023' }
  },
  willRespondWith: {
    status: 200,
    body: {
      targets: [{
        targetId: Matchers.string,
        name: Matchers.string,
        percentComplete: Matchers.number,
        trajectory: Matchers.regex(/on-track|ahead|behind|at-risk/)
      }],
      achievementRate: Matchers.number
    }
  }
}
```

**Contract Validation**: Run provider verification against Reporting Service contracts weekly.

### 8.4 E2E Test Flows

**Critical User Journeys**

1. **ESG Manager - Create Net-Zero Strategy**
   - Login → Create strategy "Net-Zero 2050"
   - Add pillars (Decarbonization, Renewable Energy, Offsets)
   - Set SBTi-aligned target (1.5°C pathway)
   - Launch 5 key initiatives
   - Create roadmap visualization
   - Export board presentation
   - **Duration**: <60s

2. **Facility Manager - Track Target Progress**
   - Login → View assigned targets
   - Record monthly progress update
   - View trajectory and gap analysis
   - Review recommendations to get back on track
   - **Duration**: <30s

3. **C-Suite Executive - Review Portfolio Dashboard**
   - Login → View executive dashboard
   - Drill down into at-risk initiatives
   - Review budget vs actual
   - Export executive summary PDF
   - **Duration**: <45s

**E2E Test Automation**: Use Playwright with Allure reporting.

---

## 9. Implementation Phases

### 9.1 MVP Features (Sprint 1-2, 4 weeks)

**Core Strategy Management**
- Strategy CRUD operations
- Strategic pillar definition
- Basic initiative management
- Manual target setting
- Simple progress tracking (manual input)

**MVP Deliverables**
- Create strategy with pillars
- Add initiatives with owners
- Set absolute reduction targets
- Record manual progress updates
- View basic dashboard (RAG status)

**Success Criteria**
- User can create complete strategy in <10 minutes
- Target progress updates in <30 seconds
- Dashboard loads in <2 seconds

### 9.2 Phase 2 Enhancements (Sprint 3-5, 6 weeks)

**Advanced Target Setting**
- SBTi methodology wizard
- Target cascade (pro-rata and weighted)
- Interim milestones
- Automated progress from source services

**Initiative Portfolio Management**
- Milestone tracking with dependencies
- Budget allocation and tracking
- ROI calculation
- Risk and issue logging

**Roadmap & Reporting**
- Interactive roadmap builder
- Executive dashboard
- Target achievement report
- Email notifications and alerts

**Success Criteria**
- SBTi target wizard completion rate >80%
- Target cascade validation passes for 95% of cases
- ROI calculation accuracy within 5% of manual calculation
- Roadmap renders 100+ initiatives in <3s

### 9.3 Phase 3 Enhancements (Sprint 6-8, 6 weeks)

**KPI Management**
- KPI library (500+ pre-built KPIs)
- Custom KPI builder with formula validation
- KPI instance tracking
- Framework alignment (GRI, SASB, TCFD)

**SDG Alignment**
- Initiative-to-SDG mapping
- Impact measurement
- SDG contribution dashboard
- SDG reporting

**Advanced Analytics**
- Performance forecasting (ML-based)
- Scenario modeling (best/base/worst)
- What-if analysis
- Recommendation engine

**Success Criteria**
- Custom KPI creation time <5 minutes
- Forecast accuracy >85% for next quarter
- SDG dashboard loads in <2s

### 9.4 Future Roadmap (Post-Phase 3)

**Advanced Features**
- AI-powered initiative recommendations
- Automated ESG strategy generation from materiality assessment
- Blockchain-based target verification (immutable progress records)
- Integration with CDP, GRI Data Partner platforms
- Mobile app for on-the-go progress updates
- Voice AI for natural language strategy queries
- Predictive analytics for initiative success probability
- Supplier target cascade (Scope 3 value chain targets)

**Platform Integrations**
- Jira/Asana bidirectional sync
- SAP S/4HANA financial data connector
- Workday HR data integration
- Salesforce sustainability cloud integration

**Emerging Technologies**
- Digital twin for scenario modeling
- Quantum computing for portfolio optimization
- Augmented reality for roadmap visualization

---

## 10. Migration Strategy

### 10.1 Data Migration

**No Legacy System**: This is a greenfield service.

**Initial Data Seeding**
- KPI library from industry standards (GRI, SASB)
- SBTi sector pathways and methodologies
- SDG targets and indicators
- ESG factor database from Reference Service

**Data Import Tools**
- CSV import for bulk initiative upload
- Excel template for target import
- API-based migration from external systems (if applicable)

### 10.2 Rollout Approach

**Phase 1: Pilot (1 organization)**
- Select early adopter organization
- Create initial strategy and targets
- Validate workflows and usability
- Gather feedback and iterate

**Phase 2: Limited Release (10 organizations)**
- Onboard organizations with existing ESG strategies
- Migrate existing target data (manual)
- Train users on strategy planning
- Monitor performance and stability

**Phase 3: General Availability**
- Open to all organizations
- Self-service onboarding
- Documentation and training materials
- 24/7 support

### 10.3 Rollback Procedures

**Rollback Triggers**
- Critical bug affecting target calculations (data integrity)
- Performance degradation >50% (API latency spike)
- Security vulnerability discovered

**Rollback Process**
1. Stop deployment pipeline
2. Revert to previous stable version (blue-green deployment)
3. Restore database snapshot (if data corruption)
4. Notify affected users
5. Incident post-mortem within 24 hours

**Data Backup**
- Hourly snapshots for last 24 hours
- Daily backups for last 30 days
- Monthly backups for last 12 months
- Point-in-time recovery within 15 minutes

---

## 11. Monitoring & Observability

### 11.1 Key Metrics

**Business Metrics**
- Total strategies created
- Active initiatives count
- Total targets set
- SBTi targets validated
- Target achievement rate (%)
- Average ROI across initiatives
- Budget utilization (%)
- User engagement (DAU, WAU, MAU)

**Technical Metrics**
- API request rate (req/s)
- API error rate (%)
- API latency (p50, p95, p99)
- Database query latency
- Event publish success rate
- Cache hit rate
- Background job success rate

**Custom Metrics**
```typescript
// Prometheus metrics
strategy_total{status="active|archived"}
initiatives_total{status="planning|in-progress|completed"}
targets_total{status="active|achieved|at-risk"}
target_achievement_rate{category="environmental|social|governance"}
roi_average{pillar="decarbonization|renewable|circular"}
```

### 11.2 Alerts

**Critical Alerts** (PagerDuty)
- API error rate >5% for 5 minutes
- Database connection pool exhausted
- Event publishing failures >10% for 2 minutes
- Target calculation errors affecting >5 targets

**Warning Alerts** (Email)
- API latency p95 >500ms for 10 minutes
- Cache hit rate <70% for 15 minutes
- Background job queue depth >1000
- Disk usage >80%

**Business Alerts**
- Target at-risk (trajectory analysis) → Email to target owner
- Milestone overdue → Email to initiative owner + manager
- Budget overrun warning (>90% allocated) → Email to CFO
- SBTi validation failure → Email to sustainability manager

### 11.3 Dashboards

**Operational Dashboard (Grafana)**
- API request volume and latency
- Error rate by endpoint
- Database performance (query time, connection pool)
- Event bus health (publish rate, consumer lag)
- Infrastructure metrics (CPU, memory, disk)

**Business Dashboard (Strategy Service UI)**
- Active strategies and initiatives
- Target achievement rate
- Portfolio health (RAG status distribution)
- Budget utilization
- Top performers and at-risk initiatives

**Executive Dashboard (Tableau/Power BI)**
- ESG strategy performance summary
- Target achievement vs plan
- Initiative ROI summary
- Strategic pillar progress

### 11.4 SLOs (Service Level Objectives)

| Metric | SLO | Measurement Window |
|--------|-----|-------------------|
| Availability | 99.9% | 30 days |
| API Latency (p95) | <200ms | 7 days |
| Error Rate | <0.5% | 24 hours |
| Event Processing Lag | <30s | 1 hour |
| Data Freshness | <5 minutes | Real-time |
| Target Calculation Accuracy | 100% | Always |

**Error Budget**: 0.1% (43 minutes downtime per month)

---

## 12. Related Documentation

### 12.1 Architecture Documentation
- [ESG Platform Overview](../../ESG_PLATFORM_OVERVIEW.md)
- [Platform Roadmap](../../FUTURE-ROADMAP/PLATFORM_ROADMAP_OVERVIEW.md)
- [Phase 2 Strategic ESG Overview](../Phase2_Strategic_ESG_Overview.md)
- [Service Dependency Diagram](../../SERVICE_DEPENDENCY_DIAGRAM.md)
- [Event Schema Registry](../../ESG_EVENT_SCHEMA_REGISTRY.md)

### 12.2 Related Service Specifications
- [Materiality Service (3041)](./41_Materiality_Service.md) - Double materiality assessment
- [Benchmark Service (3043)](./43_Benchmark_Service.md) - Peer comparison and gap analysis
- [Reporting Service (3044)](./44_Reporting_Service.md) - Multi-framework reporting
- [Analytics Service (3045)](./45_Analytics_Service.md) - Advanced analytics and insights
- [Carbon Service (3011)](../../Phase3-Environmental/service-specs/11_Carbon_Service.md) - GHG emissions data

### 12.3 API Documentation
- [Strategy API Specification](./api/strategy-api-spec.yaml) - OpenAPI 3.0 spec
- [Target API Specification](./api/target-api-spec.yaml) - OpenAPI 3.0 spec
- [GraphQL Schema](./api/strategy-graphql-schema.graphql) - GraphQL schema

### 12.4 Data Models
- [Phase 2 Data Models](../Phase2_Data_Models.md) - Complete data model documentation
- [MongoDB Schema Migrations](./migrations/README.md) - Migration scripts

### 12.5 Testing Documentation
- [Testing Strategy](../../PHASE5_SDLC_Quality_Strategy.md) - Overall testing approach
- [Contract Tests](./tests/contracts/README.md) - Pact contract definitions
- [E2E Test Scenarios](./tests/e2e/README.md) - Playwright test suites

### 12.6 User Guides
- [Strategy Planning Guide](./user-guides/strategy-planning-guide.md)
- [SBTi Target Setting Guide](./user-guides/sbti-target-setting-guide.md)
- [Initiative Portfolio Management Guide](./user-guides/initiative-portfolio-guide.md)
- [KPI Builder Tutorial](./user-guides/kpi-builder-tutorial.md)

### 12.7 JIRA References
- [EPIC-026: Target Setting & SBTi](https://clenergize.atlassian.net/browse/EPIC-026)
- [EPIC-027: Strategy Management](https://clenergize.atlassian.net/browse/EPIC-027)
- [CLNZ-2701: Build strategy framework](https://clenergize.atlassian.net/browse/CLNZ-2701)
- [CLNZ-2702: Implement initiative tracking](https://clenergize.atlassian.net/browse/CLNZ-2702)
- [CLNZ-2601: Build science-based target tools](https://clenergize.atlassian.net/browse/CLNZ-2601)

---

**Document Status**: ✅ COMPLETE
**Last Updated**: November 20, 2024
**Version**: 1.0.0
**Author**: Strategy Agent
**Reviewers**: Architecture Agent, Master Coordinator
**Next Review**: Start of Phase 2 Implementation
