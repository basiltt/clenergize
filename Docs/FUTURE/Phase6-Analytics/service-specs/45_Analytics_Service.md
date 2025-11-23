# Analytics Service Specification

## Service Overview

**Service Name**: Analytics Service (ESG Data Analytics & Intelligence)
**Port**: 3045
**Phase**: 6 (Analytics & ML Domain - Analytics)
**Sprint**: 6.1-6.3 (Months 16-18)
**Story Points**: 35
**Dependencies**: All ESG services (Environmental, Social, Governance), Reporting (3044), ML (3046), Materiality (3041), Benchmark (3043)

### Business Purpose

The Analytics Service is the central intelligence platform for ESG data analytics, dashboards, KPI tracking, trend analysis, and benchmarking. This service enables organizations to:

- **Create Interactive Dashboards**: Executive, operational, functional dashboards with real-time updates and drill-down capabilities
- **Track 500+ ESG KPIs**: Pre-built indicators across all ESG dimensions (GRI, SASB, CSRD, CDP, SDGs)
- **Analyze Trends**: Time-series analysis, YoY/MoM comparisons, variance analysis, forecasting
- **Benchmark Performance**: Peer comparison, industry averages, best-in-class, percentile rankings
- **Define Custom Metrics**: User-defined KPIs, formulas, aggregations, calculated fields
- **Visualize Data**: Charts, graphs, heat maps, geographic maps, sankey diagrams, network graphs
- **Enable Drill-Down**: Multi-level analysis from corporate → business unit → facility → asset
- **Alert Stakeholders**: Threshold-based alerts, anomaly detection, performance notifications
- **Export & Share**: PDF, Excel, PowerPoint, scheduled reports, email distribution

### Key Business Capabilities

1. **ESG Dashboard Management**: Executive dashboards, operational dashboards, functional dashboards (carbon, water, diversity, safety)
2. **KPI Library**: 500+ pre-built ESG KPIs mapped to frameworks (GRI, SASB, CSRD, TCFD, CDP, SDGs)
3. **Trend Analysis**: Time-series analysis, moving averages, seasonality detection, variance analysis
4. **Benchmarking**: Peer group comparison, industry averages, percentile rankings, gap analysis
5. **Custom Metrics**: Formula builder, calculated fields, aggregations, user-defined dimensions
6. **Data Visualization**: 40+ chart types, geographic maps, heat maps, network graphs, custom visualizations
7. **Drill-Down & Roll-Up**: Corporate → BU → facility → asset, hierarchical analysis, slice-and-dice
8. **Alerts & Notifications**: Threshold-based alerts, anomaly detection, scheduled notifications, escalation rules
9. **Export & Sharing**: PDF reports, Excel exports, PowerPoint decks, API access, scheduled distribution
10. **Mobile Analytics**: Responsive dashboards, mobile-optimized KPIs, offline access

## Technical Architecture

### Service Design Patterns

```typescript
// Domain-Driven Design Structure
src/
├── domain/                          # Core business logic
│   ├── aggregates/
│   │   ├── dashboard/               # Dashboard configuration and widgets
│   │   ├── kpi/                     # KPI definitions and calculations
│   │   ├── metric/                  # Custom metrics and formulas
│   │   ├── trend-analysis/          # Time-series analysis and forecasting
│   │   ├── benchmark/               # Benchmarking and peer comparison
│   │   ├── visualization/           # Chart configurations and data
│   │   ├── alert/                   # Alert rules and notifications
│   │   ├── export/                  # Export templates and jobs
│   │   └── analytics-session/       # User analytics sessions
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── services/
├── application/                     # Use cases and orchestration
│   ├── commands/
│   ├── queries/
│   ├── sagas/
│   └── validators/
├── infrastructure/                  # External integrations
│   ├── persistence/
│   │   ├── mongodb/                 # Dashboard configs, KPI definitions
│   │   ├── clickhouse/              # OLAP queries, aggregations
│   │   ├── influxdb/                # Time-series data
│   │   └── redis/                   # Dashboard cache, query cache
│   ├── messaging/
│   ├── integration/
│   │   ├── data-sources/            # Connect to all ESG services
│   │   ├── visualization/           # D3.js, Recharts, Plotly
│   │   └── export/                  # PDF, Excel, PowerPoint generation
│   └── monitoring/
└── interfaces/                      # API layer
    ├── rest/
    ├── graphql/
    └── websocket/                   # Real-time dashboard updates
```

### Technology Stack

- **Runtime**: Node.js 20 LTS with TypeScript 5.3
- **Framework**: NestJS 10.x with CQRS module
- **Databases**:
  - MongoDB 7.x (dashboard configs, KPI definitions)
  - ClickHouse 24.x (OLAP queries, fast aggregations)
  - InfluxDB 2.7 (time-series data for trends)
  - Redis 7.x (dashboard cache, query cache)
- **Messaging**: Apache Kafka 3.6 (EventBridge for AWS)
- **Analytics**:
  - Cube.js (OLAP analytics layer)
  - Apache Superset (embedded analytics)
  - Metabase (embedded dashboards)
- **Visualization**:
  - D3.js v7 (custom visualizations)
  - Recharts 2.x (React charts)
  - Plotly.js (interactive plots)
  - Mapbox GL JS (geographic maps)
- **Export**:
  - Puppeteer (PDF generation)
  - ExcelJS (Excel exports)
  - PptxGenJS (PowerPoint exports)
- **Caching**: Redis 7.x with clustering
- **API**: RESTful + GraphQL Federation
- **Real-time**: Socket.io for live dashboard updates
- **Documentation**: OpenAPI 3.1 + AsyncAPI 2.6

## Data Architecture

### Core Data Models

#### 1. Dashboard Configuration

```typescript
interface DashboardConfiguration {
  id: string;
  dashboardId: string;
  organizationId: string;

  // Dashboard Metadata
  metadata: {
    name: string;
    description: string;
    type: string; // EXECUTIVE, OPERATIONAL, FUNCTIONAL, CUSTOM
    category: string; // ENVIRONMENTAL, SOCIAL, GOVERNANCE, INTEGRATED, CUSTOM
    scope: string; // CORPORATE, BUSINESS_UNIT, FACILITY, ASSET
    scopeEntityId?: string; // If scoped to specific entity
    tags: string[];
    icon: string;
    color: string; // Theme color
  };

  // Dashboard Layout
  layout: {
    layoutType: string; // GRID, FLEX, CUSTOM
    columns: number; // Grid columns (typically 12)
    rows: number;
    widgets: DashboardWidget[];
    responsiveBreakpoints: {
      mobile: { columns: number; rows: number };
      tablet: { columns: number; rows: number };
      desktop: { columns: number; rows: number };
    };
  };

  // Dashboard Settings
  settings: {
    refreshInterval: number; // Seconds (0 = no auto-refresh)
    liveUpdates: boolean; // WebSocket real-time updates
    dateRange: {
      type: string; // LAST_7_DAYS, LAST_30_DAYS, LAST_90_DAYS, LAST_YEAR, YTD, CUSTOM
      startDate?: Date;
      endDate?: Date;
    };
    comparisonPeriod?: {
      type: string; // PREVIOUS_PERIOD, PREVIOUS_YEAR, CUSTOM
      startDate?: Date;
      endDate?: Date;
    };
    currency: string; // For financial metrics
    locale: string; // For number formatting
    timezone: string; // For date/time display
  };

  // Access Control
  access: {
    visibility: string; // PUBLIC, PRIVATE, SHARED
    owner: {
      userId: string;
      userName: string;
      email: string;
    };
    sharedWith: {
      userId?: string;
      roleId?: string;
      teamId?: string;
      permissions: string[]; // VIEW, EDIT, SHARE, DELETE
    }[];
    isDefault: boolean; // Default dashboard for role
    isFavorite: boolean; // User's favorite dashboard
  };

  // Filters
  filters: {
    globalFilters: DashboardFilter[];
    widgetFilters: { [widgetId: string]: DashboardFilter[] };
    filterInteractions: {
      filterWidgetId: string; // Widget that provides filter values
      targetWidgetIds: string[]; // Widgets affected by filter
      crossFiltering: boolean; // Enable cross-filtering
    }[];
  };

  // Alerts & Notifications
  alerts: {
    enabled: boolean;
    rules: AlertRule[];
    notificationChannels: string[]; // EMAIL, SLACK, SMS, IN_APP
    recipients: string[]; // User IDs
  };

  // Export Settings
  export: {
    allowPdfExport: boolean;
    allowExcelExport: boolean;
    allowPowerpointExport: boolean;
    scheduledExports: ScheduledExport[];
  };

  // Performance
  performance: {
    cacheTtl: number; // Cache TTL in seconds
    preloadData: boolean; // Preload data on dashboard load
    lazyLoadWidgets: boolean; // Lazy load widgets on scroll
    optimizationLevel: string; // LOW, MEDIUM, HIGH
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    version: number;
    lastViewedAt: Date;
    lastViewedBy: string;
    viewCount: number;
  };
}

interface DashboardWidget {
  widgetId: string;
  widgetType: string; // KPI_CARD, LINE_CHART, BAR_CHART, PIE_CHART, TABLE, MAP, HEATMAP, GAUGE, SANKEY, NETWORK, CUSTOM
  title: string;
  description: string;

  // Widget Position
  position: {
    x: number; // Grid column start (1-based)
    y: number; // Grid row start (1-based)
    width: number; // Columns span
    height: number; // Rows span
    zIndex: number; // Layering
  };

  // Data Source
  dataSource: {
    type: string; // KPI, METRIC, QUERY, API, STATIC
    kpiId?: string; // If type = KPI
    metricId?: string; // If type = METRIC
    query?: DataQuery; // If type = QUERY
    apiEndpoint?: string; // If type = API
    staticData?: any; // If type = STATIC
    refreshInterval: number; // Seconds
  };

  // Visualization Config
  visualization: {
    chartType: string; // LINE, BAR, AREA, SCATTER, PIE, DONUT, GAUGE, MAP, TABLE, etc.
    config: {
      xAxis?: AxisConfig;
      yAxis?: AxisConfig;
      series?: SeriesConfig[];
      legend?: LegendConfig;
      tooltip?: TooltipConfig;
      colors?: string[];
      thresholds?: Threshold[];
      annotations?: Annotation[];
      formatting?: FormattingConfig;
    };
  };

  // Interactions
  interactions: {
    enableDrillDown: boolean;
    drillDownPath?: string[]; // e.g., ['region', 'country', 'facility']
    enableCrossFilter: boolean;
    crossFilterTargets?: string[]; // Widget IDs
    enableTooltip: boolean;
    enableZoom: boolean;
    enablePan: boolean;
    onClickAction?: {
      type: string; // NAVIGATE, FILTER, OPEN_MODAL, EXPORT, CUSTOM
      target?: string;
      params?: any;
    };
  };

  // Conditional Formatting
  conditionalFormatting: {
    enabled: boolean;
    rules: ConditionalFormattingRule[];
  }[];

  // Widget Settings
  settings: {
    showTitle: boolean;
    showDescription: boolean;
    showExportButton: boolean;
    showRefreshButton: boolean;
    allowResize: boolean;
    allowMove: boolean;
    allowRemove: boolean;
  };
}

interface DataQuery {
  queryType: string; // SQL, NOSQL, GRAPHQL, API
  query: string; // Query string
  parameters?: { [key: string]: any };
  aggregations?: Aggregation[];
  filters?: Filter[];
  sorting?: Sorting[];
  limit?: number;
  offset?: number;
}

interface DashboardFilter {
  filterId: string;
  filterName: string;
  filterType: string; // DROPDOWN, MULTI_SELECT, DATE_RANGE, TEXT_SEARCH, SLIDER, CHECKBOX
  field: string; // Field to filter on
  operator: string; // EQUALS, NOT_EQUALS, GREATER_THAN, LESS_THAN, CONTAINS, IN, BETWEEN
  values: any[];
  defaultValue?: any;
  options?: { label: string; value: any }[];
  required: boolean;
  visible: boolean;
}

interface ScheduledExport {
  scheduleId: string;
  format: string; // PDF, EXCEL, POWERPOINT
  schedule: string; // Cron expression
  recipients: string[];
  includeWidgets: string[]; // Widget IDs (empty = all)
  filters?: DashboardFilter[];
  enabled: boolean;
  lastRunAt?: Date;
  nextRunAt: Date;
}
```

#### 2. KPI Definition

```typescript
interface KPIDefinition {
  id: string;
  kpiId: string;
  organizationId: string;

  // KPI Metadata
  metadata: {
    name: string;
    displayName: string;
    description: string;
    category: string; // ENVIRONMENTAL, SOCIAL, GOVERNANCE, ECONOMIC
    subcategory: string; // CARBON, WATER, WASTE, ENERGY, DIVERSITY, SAFETY, ETHICS, etc.
    dimension: string; // PLANET, PEOPLE, PROSPERITY, GOVERNANCE
    tags: string[];
    icon: string;
    color: string;
  };

  // Framework Mapping
  frameworks: {
    gri: {
      standard: string; // e.g., "GRI 305"
      disclosure: string; // e.g., "305-1"
      indicator: string; // e.g., "Direct GHG emissions (Scope 1)"
      mandatory: boolean;
    }[];
    sasb: {
      industry: string; // e.g., "Technology & Communications"
      category: string; // e.g., "GHG Emissions"
      code: string; // e.g., "TC-SI-110a.1"
      metric: string;
      mandatory: boolean;
    }[];
    csrd: {
      esrs: string; // e.g., "ESRS E1"
      datapoint: string; // e.g., "E1-1"
      description: string;
      mandatory: boolean;
    }[];
    tcfd: {
      pillar: string; // GOVERNANCE, STRATEGY, RISK_MANAGEMENT, METRICS_TARGETS
      recommendation: string;
      metric: string;
    }[];
    cdp: {
      questionnaire: string; // CLIMATE, WATER, FORESTS
      question: string; // e.g., "C6.1"
      metric: string;
    }[];
    sdg: {
      goal: number; // 1-17
      target: string; // e.g., "13.2"
      indicator: string; // e.g., "13.2.1"
    }[];
    custom: {
      framework: string;
      code: string;
      description: string;
    }[];
  };

  // Calculation Method
  calculation: {
    calculationType: string; // SIMPLE, FORMULA, AGGREGATION, RATIO, PERCENTAGE, CUSTOM
    formula?: string; // Mathematical expression (e.g., "scope1 + scope2 + scope3")
    aggregation?: {
      method: string; // SUM, AVG, MIN, MAX, COUNT, MEDIAN, PERCENTILE
      field: string;
      groupBy?: string[];
      filters?: Filter[];
    };
    ratio?: {
      numerator: string; // Field or KPI ID
      denominator: string; // Field or KPI ID
      multiplier: number; // e.g., 1000 for "per 1000 employees"
    };
    dataSources: DataSource[];
    dependencies: string[]; // Other KPI IDs required
    customLogic?: string; // JavaScript function for complex calculations
  };

  // Units & Formatting
  units: {
    baseUnit: string; // e.g., "tCO2e", "m3", "kWh", "employees", "USD"
    displayUnit: string; // User-friendly display
    conversionFactor: number; // From base to display
    prefix: string; // e.g., "$", "%"
    suffix: string; // e.g., "kg", "L", "%"
    decimalPlaces: number;
    thousandsSeparator: string;
    decimalSeparator: string;
    formatPattern: string; // e.g., "#,##0.00"
  };

  // Target & Thresholds
  targets: {
    targetValue: number;
    targetType: string; // ABSOLUTE, INTENSITY, PERCENTAGE_REDUCTION
    baselineValue: number;
    baselineYear: number;
    targetYear: number;
    targetReductionPercentage?: number;
    onTrack: boolean; // Calculated
    variance: number; // Actual vs target
    variancePercentage: number;
  };

  thresholds: {
    critical: { min?: number; max?: number; color: string; label: string };
    warning: { min?: number; max?: number; color: string; label: string };
    good: { min?: number; max?: number; color: string; label: string };
    excellent: { min?: number; max?: number; color: string; label: string };
  };

  // Time Dimensions
  timeDimensions: {
    granularity: string; // DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL
    aggregationMethod: string; // SUM, AVG, LAST, MAX, MIN
    fiscalYearStart: string; // Month (e.g., "April")
    historicalPeriods: number; // Number of periods to retain
    forecastPeriods: number; // Number of periods to forecast
  };

  // Scope & Hierarchy
  scope: {
    level: string; // CORPORATE, BUSINESS_UNIT, FACILITY, ASSET, PRODUCT
    rollupMethod: string; // SUM, AVG, WEIGHTED_AVG
    rollupWeights?: { [entityId: string]: number };
    excludeEntities?: string[]; // Entity IDs to exclude
    includeOnlyEntities?: string[]; // Entity IDs to include
  };

  // Benchmarking
  benchmarking: {
    enabled: boolean;
    peerGroupId?: string;
    industryAverage?: number;
    percentileRanking?: number; // 0-100
    bestInClass?: number;
    medianValue?: number;
  };

  // Data Quality
  dataQuality: {
    source: string; // MEASURED, ESTIMATED, THIRD_PARTY, CALCULATED
    accuracy: string; // HIGH, MEDIUM, LOW
    completeness: number; // Percentage (0-100)
    timeliness: string; // REAL_TIME, DAILY, WEEKLY, MONTHLY, ANNUAL
    lastUpdated: Date;
    dataOwner: string; // User ID
    verificationStatus: string; // UNVERIFIED, VERIFIED, AUDITED
    verifiedBy?: string; // User ID
    verifiedAt?: Date;
  };

  // Visualization
  defaultVisualization: {
    chartType: string; // LINE, BAR, GAUGE, CARD, TREND
    colors: string[];
    showTrend: boolean;
    showComparison: boolean;
    comparisonType: string; // YOY, MOM, VS_TARGET, VS_BASELINE
    showTarget: boolean;
    showThresholds: boolean;
  };

  // Status
  status: {
    isActive: boolean;
    isPublished: boolean;
    isDeprecated: boolean;
    deprecationReason?: string;
    replacedByKpiId?: string;
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    version: number;
    lastCalculatedAt?: Date;
    calculationCount: number;
  };
}

interface DataSource {
  sourceType: string; // SERVICE, DATABASE, API, FILE
  serviceName?: string; // e.g., "carbon-service"
  collection?: string; // MongoDB collection
  table?: string; // SQL table
  apiEndpoint?: string;
  fields: string[];
  filters?: Filter[];
  transformations?: Transformation[];
}

interface Filter {
  field: string;
  operator: string; // EQUALS, NOT_EQUALS, GREATER_THAN, LESS_THAN, IN, BETWEEN, CONTAINS
  value: any;
}

interface Transformation {
  type: string; // MAP, REDUCE, FILTER, AGGREGATE, CALCULATE
  expression: string;
}
```

#### 3. Custom Metric

```typescript
interface CustomMetric {
  id: string;
  metricId: string;
  organizationId: string;

  // Metric Metadata
  metadata: {
    name: string;
    displayName: string;
    description: string;
    category: string;
    tags: string[];
    icon: string;
    color: string;
  };

  // Metric Formula
  formula: {
    expression: string; // Mathematical expression
    variables: MetricVariable[];
    functions: string[]; // Allowed: SUM, AVG, MIN, MAX, COUNT, IF, AND, OR, NOT
    syntax: string; // SQL, JAVASCRIPT, CUSTOM
    validationRules: ValidationRule[];
  };

  // Variables
  variables: MetricVariable[];

  // Calculation
  calculation: {
    calculationEngine: string; // JAVASCRIPT, SQL, PYTHON
    calculationFrequency: string; // REAL_TIME, HOURLY, DAILY, WEEKLY, MONTHLY
    cacheResults: boolean;
    cacheTtl: number; // Seconds
    retryOnFailure: boolean;
    maxRetries: number;
  };

  // Units & Formatting
  units: {
    baseUnit: string;
    displayUnit: string;
    conversionFactor: number;
    prefix: string;
    suffix: string;
    decimalPlaces: number;
    formatPattern: string;
  };

  // Dimensions
  dimensions: {
    timeDimension: string; // YEAR, QUARTER, MONTH, WEEK, DAY
    geographicDimension?: string; // REGION, COUNTRY, STATE, CITY
    organizationalDimension?: string; // CORPORATE, BU, FACILITY
    customDimensions?: { name: string; values: string[] }[];
  };

  // Access Control
  access: {
    visibility: string; // PUBLIC, PRIVATE, SHARED
    owner: string; // User ID
    sharedWith: string[]; // User IDs
    permissions: { userId: string; canView: boolean; canEdit: boolean }[];
  };

  // Status
  status: {
    isActive: boolean;
    isValid: boolean;
    validationErrors: string[];
    lastCalculatedAt?: Date;
    lastCalculatedValue?: number;
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    version: number;
  };
}

interface MetricVariable {
  name: string;
  displayName: string;
  type: string; // NUMBER, STRING, DATE, BOOLEAN, ARRAY
  dataType: string; // INTEGER, FLOAT, TEXT, DATETIME
  source: {
    type: string; // KPI, FIELD, CONSTANT, PARAMETER
    kpiId?: string;
    field?: string;
    collection?: string;
    value?: any; // For constants
  };
  defaultValue?: any;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    allowedValues?: any[];
  };
}

interface ValidationRule {
  ruleType: string; // RANGE, PATTERN, DEPENDENCY, CUSTOM
  condition: string;
  errorMessage: string;
}
```

#### 4. Trend Analysis

```typescript
interface TrendAnalysis {
  id: string;
  analysisId: string;
  organizationId: string;

  // Analysis Metadata
  metadata: {
    name: string;
    description: string;
    kpiId: string;
    kpiName: string;
    metricId?: string; // If analyzing custom metric
  };

  // Time Period
  timePeriod: {
    startDate: Date;
    endDate: Date;
    granularity: string; // DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL
    dataPoints: number; // Number of time periods
  };

  // Trend Statistics
  statistics: {
    mean: number;
    median: number;
    standardDeviation: number;
    variance: number;
    min: { value: number; date: Date };
    max: { value: number; date: Date };
    range: number;
    coefficientOfVariation: number; // Percentage
    skewness: number;
    kurtosis: number;
  };

  // Trend Direction
  trendDirection: {
    overall: string; // INCREASING, DECREASING, STABLE, VOLATILE
    recentTrend: string; // Last 3-6 months
    confidence: number; // Percentage (0-100)
    slope: number; // Rate of change
    rSquared: number; // Goodness of fit (0-1)
  };

  // Moving Averages
  movingAverages: {
    sma7: number[]; // 7-period simple moving average
    sma30: number[]; // 30-period simple moving average
    sma90: number[]; // 90-period simple moving average
    ema12: number[]; // 12-period exponential moving average
    ema26: number[]; // 26-period exponential moving average
  };

  // Seasonality
  seasonality: {
    detected: boolean;
    pattern: string; // WEEKLY, MONTHLY, QUARTERLY, ANNUAL
    peaks: { date: Date; value: number }[];
    troughs: { date: Date; value: number }[];
    seasonalIndices: { [period: string]: number };
  };

  // Comparisons
  comparisons: {
    yearOverYear: {
      currentPeriod: number;
      previousPeriod: number;
      absoluteChange: number;
      percentageChange: number;
      trend: string; // IMPROVEMENT, DETERIORATION, STABLE
    };
    monthOverMonth: {
      currentPeriod: number;
      previousPeriod: number;
      absoluteChange: number;
      percentageChange: number;
      trend: string;
    };
    vsTarget: {
      currentValue: number;
      targetValue: number;
      variance: number;
      variancePercentage: number;
      onTrack: boolean;
    };
    vsBaseline: {
      currentValue: number;
      baselineValue: number;
      baselineYear: number;
      absoluteChange: number;
      percentageChange: number;
    };
  };

  // Forecast
  forecast: {
    enabled: boolean;
    method: string; // LINEAR_REGRESSION, ARIMA, EXPONENTIAL_SMOOTHING, PROPHET, ML_MODEL
    forecastPeriods: number;
    predictions: {
      date: Date;
      predictedValue: number;
      lowerBound: number; // 95% confidence interval
      upperBound: number;
      confidence: number;
    }[];
    accuracy: {
      mae: number; // Mean Absolute Error
      mape: number; // Mean Absolute Percentage Error
      rmse: number; // Root Mean Squared Error
    };
  };

  // Anomalies
  anomalies: {
    detected: boolean;
    detectionMethod: string; // Z_SCORE, IQR, ISOLATION_FOREST, LSTM
    anomalies: {
      date: Date;
      value: number;
      expectedValue: number;
      deviation: number;
      severity: string; // LOW, MEDIUM, HIGH, CRITICAL
      reason?: string;
    }[];
  };

  // Volatility
  volatility: {
    standardDeviation: number;
    averageDeviation: number;
    volatilityIndex: number; // 0-100
    volatilityClassification: string; // LOW, MEDIUM, HIGH
  };

  // Correlation Analysis
  correlations: {
    correlatedKpis: {
      kpiId: string;
      kpiName: string;
      correlationCoefficient: number; // -1 to 1
      significance: number; // p-value
      relationship: string; // POSITIVE, NEGATIVE, NONE
    }[];
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    lastUpdatedAt: Date;
    refreshInterval: string; // MANUAL, DAILY, WEEKLY, MONTHLY
    nextRefreshAt?: Date;
  };
}
```

#### 5. Benchmark Comparison

```typescript
interface BenchmarkComparison {
  id: string;
  comparisonId: string;
  organizationId: string;

  // Comparison Metadata
  metadata: {
    name: string;
    description: string;
    kpiId: string;
    kpiName: string;
    comparisonType: string; // PEER_GROUP, INDUSTRY, BEST_IN_CLASS, CUSTOM
  };

  // Organization Performance
  organizationPerformance: {
    value: number;
    year: number;
    quarter?: number;
    month?: number;
    rank?: number; // Rank in peer group
    percentile: number; // 0-100
    classification: string; // LAGGARD, BELOW_AVERAGE, AVERAGE, ABOVE_AVERAGE, LEADER
  };

  // Peer Group
  peerGroup: {
    peerGroupId: string;
    peerGroupName: string;
    peerCount: number;
    peers: {
      organizationId: string;
      organizationName: string;
      industry: string;
      revenue: number;
      employees: number;
      value: number;
      rank: number;
      percentile: number;
    }[];
  };

  // Industry Benchmarks
  industryBenchmarks: {
    industry: string; // NAICS code or name
    geography: string; // GLOBAL, NORTH_AMERICA, EUROPE, etc.
    average: number;
    median: number;
    percentile25: number;
    percentile75: number;
    min: number;
    max: number;
    sampleSize: number;
    dataSource: string; // CDP, Bloomberg, Sustainalytics, etc.
    year: number;
  };

  // Best in Class
  bestInClass: {
    value: number;
    organizationId?: string;
    organizationName?: string;
    industry?: string;
    gap: number; // Difference from organization value
    gapPercentage: number;
    yearsToClose?: number; // Estimated years to reach best-in-class
  };

  // Performance Gap Analysis
  gapAnalysis: {
    vsIndustryAverage: {
      gap: number;
      gapPercentage: number;
      better: boolean;
    };
    vsIndustryMedian: {
      gap: number;
      gapPercentage: number;
      better: boolean;
    };
    vsBestInClass: {
      gap: number;
      gapPercentage: number;
      closingRate?: number; // Units per year
    };
    vsTarget: {
      gap: number;
      gapPercentage: number;
      onTrack: boolean;
    };
  };

  // Recommendations
  recommendations: {
    priority: string; // HIGH, MEDIUM, LOW
    recommendation: string;
    estimatedImpact: number; // Improvement in KPI value
    estimatedCost?: number;
    estimatedTimeframe: string; // IMMEDIATE, SHORT_TERM, MEDIUM_TERM, LONG_TERM
    confidenceLevel: number; // 0-100
  }[];

  // Historical Comparison
  historicalComparison: {
    year: number;
    organizationValue: number;
    industryAverage: number;
    bestInClass: number;
    percentile: number;
  }[];

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    lastUpdatedAt: Date;
    dataAsOfDate: Date;
  };
}
```

#### 6. Alert Rule

```typescript
interface AlertRule {
  id: string;
  ruleId: string;
  organizationId: string;

  // Rule Metadata
  metadata: {
    name: string;
    description: string;
    category: string; // THRESHOLD, ANOMALY, TREND, TARGET, BENCHMARK, CUSTOM
    severity: string; // INFO, WARNING, CRITICAL
    priority: string; // LOW, MEDIUM, HIGH, CRITICAL
    tags: string[];
  };

  // Rule Condition
  condition: {
    conditionType: string; // THRESHOLD, CHANGE, TREND, ANOMALY, FORMULA
    kpiId?: string;
    metricId?: string;
    field?: string;

    // Threshold Conditions
    threshold?: {
      operator: string; // GREATER_THAN, LESS_THAN, EQUALS, BETWEEN
      value: number;
      value2?: number; // For BETWEEN
      comparison: string; // VALUE, TARGET, BASELINE, PREVIOUS_PERIOD
    };

    // Change Conditions
    change?: {
      changeType: string; // ABSOLUTE, PERCENTAGE
      operator: string; // INCREASES_BY, DECREASES_BY
      value: number;
      comparisonPeriod: string; // PREVIOUS_DAY, PREVIOUS_WEEK, PREVIOUS_MONTH, PREVIOUS_YEAR
    };

    // Trend Conditions
    trend?: {
      direction: string; // INCREASING, DECREASING
      duration: number; // Number of periods
      slope?: number; // Minimum slope
    };

    // Anomaly Conditions
    anomaly?: {
      detectionMethod: string; // Z_SCORE, IQR, ML_MODEL
      sensitivity: string; // LOW, MEDIUM, HIGH
      threshold: number; // Number of standard deviations
    };

    // Formula Conditions
    formula?: {
      expression: string;
      variables: { [name: string]: string }; // Variable name → KPI/Field ID
    };
  };

  // Evaluation
  evaluation: {
    frequency: string; // REAL_TIME, HOURLY, DAILY, WEEKLY, MONTHLY
    schedule?: string; // Cron expression
    timezone: string;
    lookbackPeriod?: number; // Periods to consider
    minimumDataPoints?: number;
    requireConsecutiveViolations?: number; // Number of consecutive violations before alerting
  };

  // Notifications
  notifications: {
    channels: NotificationChannel[];
    recipients: Recipient[];
    notificationTemplate: string;
    includeData: boolean;
    includeChart: boolean;
    includeRecommendations: boolean;
    throttling: {
      enabled: boolean;
      maxAlertsPerHour?: number;
      maxAlertsPerDay?: number;
      cooldownPeriod?: number; // Minutes
    };
  };

  // Actions
  actions: {
    autoEscalate: boolean;
    escalationRules?: EscalationRule[];
    createTicket: boolean;
    ticketSystem?: string; // JIRA, SERVICENOW
    ticketPriority?: string;
    runWorkflow: boolean;
    workflowId?: string;
    webhooks?: {
      url: string;
      method: string; // GET, POST
      headers?: { [key: string]: string };
      body?: any;
    }[];
  };

  // Alert History
  history: {
    totalTriggered: number;
    lastTriggeredAt?: Date;
    lastResolvedAt?: Date;
    averageResolutionTime?: number; // Minutes
    falsePositiveRate?: number; // Percentage
  };

  // Status
  status: {
    isActive: boolean;
    isEnabled: boolean;
    currentlyTriggered: boolean;
    triggeredCount: number;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolvedBy?: string;
    resolvedAt?: Date;
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    version: number;
  };
}

interface NotificationChannel {
  channel: string; // EMAIL, SLACK, SMS, WEBHOOK, IN_APP, TEAMS, PAGERDUTY
  enabled: boolean;
  config: {
    emailAddresses?: string[];
    slackChannel?: string;
    slackWebhookUrl?: string;
    phoneNumbers?: string[];
    webhookUrl?: string;
    teamsWebhookUrl?: string;
    pagerdutyServiceKey?: string;
  };
}

interface Recipient {
  type: string; // USER, ROLE, TEAM, EMAIL
  userId?: string;
  roleId?: string;
  teamId?: string;
  email?: string;
}

interface EscalationRule {
  level: number;
  delay: number; // Minutes
  recipients: Recipient[];
  channels: NotificationChannel[];
}
```

#### 7. Export Job

```typescript
interface ExportJob {
  id: string;
  jobId: string;
  organizationId: string;

  // Export Metadata
  metadata: {
    name: string;
    description: string;
    exportType: string; // DASHBOARD, KPI, REPORT, DATA, CUSTOM
    format: string; // PDF, EXCEL, POWERPOINT, CSV, JSON
  };

  // Export Source
  source: {
    sourceType: string; // DASHBOARD, KPI, METRIC, QUERY
    dashboardId?: string;
    kpiIds?: string[];
    metricIds?: string[];
    query?: DataQuery;
  };

  // Export Settings
  settings: {
    // Dashboard Export
    includeWidgets?: string[]; // Widget IDs (empty = all)
    pageSize?: string; // A4, LETTER, LEGAL, A3
    orientation?: string; // PORTRAIT, LANDSCAPE
    includeFilters?: boolean;
    includeComments?: boolean;

    // Data Export
    includeHeaders?: boolean;
    includeMetadata?: boolean;
    dateFormat?: string;
    numberFormat?: string;
    delimiter?: string; // For CSV
    encoding?: string; // UTF-8, ASCII

    // Chart Export
    chartResolution?: string; // LOW, MEDIUM, HIGH
    chartFormat?: string; // PNG, SVG, PDF
  };

  // Filters
  filters: {
    dateRange?: {
      startDate: Date;
      endDate: Date;
    };
    entities?: string[]; // Organization entity IDs
    customFilters?: DashboardFilter[];
  };

  // Schedule
  schedule: {
    scheduleType: string; // ONE_TIME, RECURRING
    schedule?: string; // Cron expression
    timezone: string;
    enabled: boolean;
    nextRunAt?: Date;
  };

  // Distribution
  distribution: {
    recipients: {
      type: string; // USER, EMAIL, SFTP, S3
      userId?: string;
      email?: string;
      sftpConfig?: {
        host: string;
        port: number;
        username: string;
        path: string;
      };
      s3Config?: {
        bucket: string;
        key: string;
        region: string;
      };
    }[];
    subject?: string;
    message?: string;
    attachmentName: string;
  };

  // Job Execution
  execution: {
    status: string; // PENDING, RUNNING, COMPLETED, FAILED
    startedAt?: Date;
    completedAt?: Date;
    duration?: number; // Seconds
    errorMessage?: string;
    retryCount: number;
    maxRetries: number;
  };

  // Output
  output: {
    fileUrl?: string;
    fileSize?: number; // Bytes
    expiresAt?: Date;
    downloadCount?: number;
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    lastRunAt?: Date;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
  };
}
```

#### 8. Visualization Configuration

```typescript
interface VisualizationConfiguration {
  id: string;
  visualizationId: string;
  organizationId: string;

  // Visualization Metadata
  metadata: {
    name: string;
    description: string;
    type: string; // LINE, BAR, AREA, PIE, DONUT, SCATTER, BUBBLE, GAUGE, MAP, HEATMAP, SANKEY, NETWORK, CUSTOM
    category: string; // CHART, MAP, TABLE, CUSTOM
    tags: string[];
  };

  // Data Source
  dataSource: {
    sourceType: string; // KPI, METRIC, QUERY, API
    kpiId?: string;
    metricId?: string;
    query?: DataQuery;
    apiEndpoint?: string;
    refreshInterval: number; // Seconds
  };

  // Chart Configuration
  chartConfig: {
    // General
    title: {
      text: string;
      visible: boolean;
      position: string; // TOP, BOTTOM, LEFT, RIGHT
      align: string; // LEFT, CENTER, RIGHT
      fontSize: number;
      fontWeight: string;
      color: string;
    };

    // Axes
    xAxis: {
      type: string; // CATEGORY, LINEAR, TIME, LOG
      field: string;
      label: string;
      visible: boolean;
      gridLines: boolean;
      tickCount?: number;
      format?: string;
      min?: number;
      max?: number;
      reversed?: boolean;
    };

    yAxis: {
      type: string;
      field: string;
      label: string;
      visible: boolean;
      gridLines: boolean;
      tickCount?: number;
      format?: string;
      min?: number;
      max?: number;
      reversed?: boolean;
      logarithmic?: boolean;
    };

    // Series
    series: {
      name: string;
      type: string; // LINE, BAR, AREA, SCATTER, BUBBLE
      dataField: string;
      color?: string;
      lineWidth?: number;
      lineStyle?: string; // SOLID, DASHED, DOTTED
      markerSize?: number;
      markerShape?: string; // CIRCLE, SQUARE, TRIANGLE
      fillOpacity?: number;
      stackGroup?: string; // For stacked charts
      yAxisId?: string; // For dual-axis charts
    }[];

    // Legend
    legend: {
      visible: boolean;
      position: string; // TOP, BOTTOM, LEFT, RIGHT
      align: string; // LEFT, CENTER, RIGHT
      layout: string; // HORIZONTAL, VERTICAL
      interactive: boolean;
    };

    // Tooltip
    tooltip: {
      enabled: boolean;
      trigger: string; // HOVER, CLICK
      format: string;
      showSeriesName: boolean;
      showValue: boolean;
      showPercentage: boolean;
      customTemplate?: string;
    };

    // Colors
    colors: {
      palette: string; // CATEGORICAL, SEQUENTIAL, DIVERGING, CUSTOM
      colors: string[];
      reverseColors: boolean;
    };

    // Annotations
    annotations: {
      lines: {
        axis: string; // X, Y
        value: number;
        label: string;
        color: string;
        lineStyle: string;
      }[];
      bands: {
        axis: string;
        from: number;
        to: number;
        label: string;
        color: string;
        opacity: number;
      }[];
      points: {
        x: any;
        y: number;
        label: string;
        color: string;
        size: number;
      }[];
    };

    // Interactivity
    interactivity: {
      enableZoom: boolean;
      enablePan: boolean;
      enableBrush: boolean; // Data selection
      enableCrosshair: boolean;
      enableDataLabels: boolean;
      dataLabelFormat?: string;
    };

    // Thresholds
    thresholds: {
      value: number;
      label: string;
      color: string;
      lineStyle: string;
    }[];
  };

  // Map Configuration (for geographic visualizations)
  mapConfig?: {
    mapType: string; // CHOROPLETH, SYMBOL, HEATMAP, BUBBLE, FLOW
    baseMap: string; // STREETS, SATELLITE, TERRAIN, DARK, LIGHT
    center: { lat: number; lng: number };
    zoom: number;
    bounds?: { north: number; south: number; east: number; west: number };

    layers: {
      layerId: string;
      layerType: string; // CHOROPLETH, SYMBOL, HEATMAP, CLUSTER
      dataSource: DataSource;
      geoField: string; // Field containing lat/lng or region codes
      valueField: string;
      colorScale: {
        type: string; // SEQUENTIAL, DIVERGING, CATEGORICAL
        colors: string[];
        domain: number[]; // Min/max values
      };
      popup: {
        enabled: boolean;
        template: string;
      };
      clustering?: {
        enabled: boolean;
        radius: number;
        maxZoom: number;
      };
    }[];
  };

  // Table Configuration (for tabular visualizations)
  tableConfig?: {
    columns: {
      field: string;
      header: string;
      width?: number;
      align: string; // LEFT, CENTER, RIGHT
      sortable: boolean;
      filterable: boolean;
      format?: string;
      aggregation?: string; // SUM, AVG, COUNT, MIN, MAX
    }[];
    pagination: {
      enabled: boolean;
      pageSize: number;
      pageSizeOptions: number[];
    };
    sorting: {
      field: string;
      direction: string; // ASC, DESC
    };
    filtering: {
      enabled: boolean;
      filterType: string; // TEXT, DROPDOWN, RANGE
    };
    export: {
      enabled: boolean;
      formats: string[]; // CSV, EXCEL, PDF
    };
  };

  // Responsive
  responsive: {
    breakpoints: {
      mobile: { width: number; config: any };
      tablet: { width: number; config: any };
      desktop: { width: number; config: any };
    };
  };

  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    version: number;
  };
}
```

### Database Collections

```typescript
// MongoDB Collections (analytics database)
const COLLECTIONS = {
  DASHBOARDS: 'dashboards',                    // Dashboard configurations
  DASHBOARD_WIDGETS: 'dashboard_widgets',      // Widget configurations
  KPI_DEFINITIONS: 'kpi_definitions',          // KPI library
  CUSTOM_METRICS: 'custom_metrics',            // User-defined metrics
  TREND_ANALYSES: 'trend_analyses',            // Trend analysis results
  BENCHMARK_COMPARISONS: 'benchmark_comparisons', // Benchmark data
  ALERT_RULES: 'alert_rules',                  // Alert configurations
  ALERT_HISTORY: 'alert_history',              // Alert trigger history
  EXPORT_JOBS: 'export_jobs',                  // Export job configurations
  EXPORT_HISTORY: 'export_history',            // Export execution history
  VISUALIZATIONS: 'visualizations',            // Visualization configs
  ANALYTICS_SESSIONS: 'analytics_sessions',    // User session tracking
  QUERY_CACHE: 'query_cache',                  // Cached query results
  DATA_SNAPSHOTS: 'data_snapshots'            // Point-in-time data snapshots
};

// ClickHouse Tables (OLAP analytics)
const CLICKHOUSE_TABLES = {
  KPI_VALUES: 'kpi_values',                    // Aggregated KPI values
  METRIC_VALUES: 'metric_values',              // Custom metric values
  DIMENSIONAL_DATA: 'dimensional_data',        // Multi-dimensional data cube
  TIME_SERIES: 'time_series_data',            // Time-series aggregations
  BENCHMARK_DATA: 'benchmark_data'            // Industry benchmark data
};

// InfluxDB Measurements (time-series)
const INFLUX_MEASUREMENTS = {
  REAL_TIME_KPI: 'real_time_kpi',             // Real-time KPI updates
  DASHBOARD_METRICS: 'dashboard_metrics',      // Dashboard usage metrics
  QUERY_PERFORMANCE: 'query_performance'       // Query execution metrics
};
```

### Indexes

```typescript
// MongoDB Indexes
db.dashboards.createIndex({ organizationId: 1, 'metadata.type': 1 });
db.dashboards.createIndex({ 'access.owner.userId': 1 });
db.dashboards.createIndex({ 'metadata.tags': 1 });

db.kpi_definitions.createIndex({ organizationId: 1, 'metadata.category': 1 });
db.kpi_definitions.createIndex({ kpiId: 1 }, { unique: true });
db.kpi_definitions.createIndex({ 'frameworks.gri.disclosure': 1 });
db.kpi_definitions.createIndex({ 'frameworks.sasb.code': 1 });
db.kpi_definitions.createIndex({ 'frameworks.csrd.datapoint': 1 });

db.custom_metrics.createIndex({ organizationId: 1, 'access.owner': 1 });
db.custom_metrics.createIndex({ metricId: 1 }, { unique: true });

db.alert_rules.createIndex({ organizationId: 1, 'status.isActive': 1 });
db.alert_rules.createIndex({ 'condition.kpiId': 1 });
db.alert_rules.createIndex({ 'notifications.recipients.userId': 1 });

db.export_jobs.createIndex({ organizationId: 1, 'schedule.scheduleType': 1 });
db.export_jobs.createIndex({ 'schedule.nextRunAt': 1 });
```

## API Specification

### REST Endpoints

```yaml
# Dashboard Management
GET    /api/v1/analytics/dashboards                    # List all dashboards
POST   /api/v1/analytics/dashboards                    # Create dashboard
GET    /api/v1/analytics/dashboards/:id                # Get dashboard
PUT    /api/v1/analytics/dashboards/:id                # Update dashboard
DELETE /api/v1/analytics/dashboards/:id                # Delete dashboard
GET    /api/v1/analytics/dashboards/:id/data           # Get dashboard data
POST   /api/v1/analytics/dashboards/:id/duplicate      # Duplicate dashboard
POST   /api/v1/analytics/dashboards/:id/share          # Share dashboard
GET    /api/v1/analytics/dashboards/templates          # Get dashboard templates

# Widget Management
GET    /api/v1/analytics/widgets                       # List all widgets
POST   /api/v1/analytics/widgets                       # Create widget
GET    /api/v1/analytics/widgets/:id                   # Get widget
PUT    /api/v1/analytics/widgets/:id                   # Update widget
DELETE /api/v1/analytics/widgets/:id                   # Delete widget
GET    /api/v1/analytics/widgets/:id/data              # Get widget data

# KPI Management
GET    /api/v1/analytics/kpis                          # List all KPIs
POST   /api/v1/analytics/kpis                          # Create KPI
GET    /api/v1/analytics/kpis/:id                      # Get KPI
PUT    /api/v1/analytics/kpis/:id                      # Update KPI
DELETE /api/v1/analytics/kpis/:id                      # Delete KPI
GET    /api/v1/analytics/kpis/:id/values               # Get KPI values
POST   /api/v1/analytics/kpis/:id/calculate            # Calculate KPI
GET    /api/v1/analytics/kpis/library                  # Get KPI library (500+ pre-built)
GET    /api/v1/analytics/kpis/frameworks/:framework    # Get KPIs by framework

# Custom Metrics
GET    /api/v1/analytics/metrics                       # List custom metrics
POST   /api/v1/analytics/metrics                       # Create custom metric
GET    /api/v1/analytics/metrics/:id                   # Get custom metric
PUT    /api/v1/analytics/metrics/:id                   # Update custom metric
DELETE /api/v1/analytics/metrics/:id                   # Delete custom metric
POST   /api/v1/analytics/metrics/:id/validate          # Validate formula
GET    /api/v1/analytics/metrics/:id/values            # Get metric values

# Trend Analysis
GET    /api/v1/analytics/trends                        # List trend analyses
POST   /api/v1/analytics/trends                        # Create trend analysis
GET    /api/v1/analytics/trends/:id                    # Get trend analysis
POST   /api/v1/analytics/trends/:id/refresh            # Refresh analysis
GET    /api/v1/analytics/trends/:id/forecast           # Get forecast
GET    /api/v1/analytics/trends/:id/anomalies          # Get anomalies

# Benchmarking
GET    /api/v1/analytics/benchmarks                    # List benchmark comparisons
POST   /api/v1/analytics/benchmarks                    # Create benchmark comparison
GET    /api/v1/analytics/benchmarks/:id                # Get benchmark comparison
POST   /api/v1/analytics/benchmarks/:id/refresh        # Refresh benchmark data
GET    /api/v1/analytics/benchmarks/industry/:industry # Get industry benchmarks
GET    /api/v1/analytics/benchmarks/peers              # Get peer group benchmarks

# Alerts
GET    /api/v1/analytics/alerts                        # List alert rules
POST   /api/v1/analytics/alerts                        # Create alert rule
GET    /api/v1/analytics/alerts/:id                    # Get alert rule
PUT    /api/v1/analytics/alerts/:id                    # Update alert rule
DELETE /api/v1/analytics/alerts/:id                    # Delete alert rule
POST   /api/v1/analytics/alerts/:id/test               # Test alert rule
GET    /api/v1/analytics/alerts/:id/history            # Get alert history
POST   /api/v1/analytics/alerts/:id/acknowledge        # Acknowledge alert

# Exports
GET    /api/v1/analytics/exports                       # List export jobs
POST   /api/v1/analytics/exports                       # Create export job
GET    /api/v1/analytics/exports/:id                   # Get export job
PUT    /api/v1/analytics/exports/:id                   # Update export job
DELETE /api/v1/analytics/exports/:id                   # Delete export job
POST   /api/v1/analytics/exports/:id/run               # Run export job
GET    /api/v1/analytics/exports/:id/download          # Download export file

# Visualizations
GET    /api/v1/analytics/visualizations                # List visualizations
POST   /api/v1/analytics/visualizations                # Create visualization
GET    /api/v1/analytics/visualizations/:id            # Get visualization
PUT    /api/v1/analytics/visualizations/:id            # Update visualization
DELETE /api/v1/analytics/visualizations/:id            # Delete visualization
GET    /api/v1/analytics/visualizations/:id/data       # Get visualization data
GET    /api/v1/analytics/visualizations/:id/render     # Render visualization (image)

# Query API
POST   /api/v1/analytics/query                         # Execute ad-hoc query
POST   /api/v1/analytics/query/sql                     # Execute SQL query (ClickHouse)
POST   /api/v1/analytics/query/validate                # Validate query
GET    /api/v1/analytics/query/schema                  # Get available fields/tables
```

### GraphQL Schema

```graphql
type Query {
  # Dashboards
  dashboards(filter: DashboardFilter, pagination: Pagination): [Dashboard!]!
  dashboard(id: ID!): Dashboard
  dashboardData(id: ID!, filters: [FilterInput!]): DashboardData!

  # KPIs
  kpis(filter: KPIFilter, pagination: Pagination): [KPI!]!
  kpi(id: ID!): KPI
  kpiValues(id: ID!, timeRange: TimeRangeInput!): [KPIValue!]!
  kpiLibrary(framework: Framework): [KPI!]!

  # Trends
  trendAnalysis(kpiId: ID!, timeRange: TimeRangeInput!): TrendAnalysis!
  forecast(kpiId: ID!, periods: Int!): [ForecastPoint!]!

  # Benchmarks
  benchmarkComparison(kpiId: ID!, peerGroupId: ID): BenchmarkComparison!
  industryBenchmarks(industry: String!, kpiId: ID!): [IndustryBenchmark!]!

  # Alerts
  alerts(filter: AlertFilter): [Alert!]!
  alertHistory(alertId: ID!, limit: Int): [AlertEvent!]!
}

type Mutation {
  # Dashboards
  createDashboard(input: CreateDashboardInput!): Dashboard!
  updateDashboard(id: ID!, input: UpdateDashboardInput!): Dashboard!
  deleteDashboard(id: ID!): Boolean!
  duplicateDashboard(id: ID!): Dashboard!

  # KPIs
  createKPI(input: CreateKPIInput!): KPI!
  updateKPI(id: ID!, input: UpdateKPIInput!): KPI!
  deleteKPI(id: ID!): Boolean!
  calculateKPI(id: ID!, timeRange: TimeRangeInput): KPIValue!

  # Metrics
  createCustomMetric(input: CreateMetricInput!): CustomMetric!
  updateCustomMetric(id: ID!, input: UpdateMetricInput!): CustomMetric!
  deleteCustomMetric(id: ID!): Boolean!

  # Alerts
  createAlert(input: CreateAlertInput!): Alert!
  updateAlert(id: ID!, input: UpdateAlertInput!): Alert!
  deleteAlert(id: ID!): Boolean!
  acknowledgeAlert(id: ID!): Boolean!

  # Exports
  exportDashboard(dashboardId: ID!, format: ExportFormat!): ExportJob!
  scheduleExport(input: ScheduleExportInput!): ExportJob!
}

type Subscription {
  # Real-time updates
  dashboardUpdated(dashboardId: ID!): DashboardData!
  kpiUpdated(kpiId: ID!): KPIValue!
  alertTriggered(alertIds: [ID!]): AlertEvent!
}
```

### WebSocket Events

```typescript
// Client → Server
{
  "event": "subscribe_dashboard",
  "data": { "dashboardId": "dash-123" }
}

// Server → Client
{
  "event": "dashboard_updated",
  "data": {
    "dashboardId": "dash-123",
    "widgetId": "widget-456",
    "value": 12345,
    "timestamp": "2025-11-22T10:30:00Z"
  }
}

// Alert events
{
  "event": "alert_triggered",
  "data": {
    "alertId": "alert-789",
    "kpiId": "kpi-101",
    "severity": "CRITICAL",
    "value": 95000,
    "threshold": 100000,
    "message": "Carbon emissions approaching target"
  }
}
```

## Event Schema

### Domain Events Published

```typescript
// Dashboard Events
interface DashboardCreatedEvent {
  type: 'analytics.dashboard.created.v1';
  data: {
    dashboardId: string;
    organizationId: string;
    name: string;
    type: string;
    createdBy: string;
  };
  metadata: EventMetadata;
}

interface DashboardSharedEvent {
  type: 'analytics.dashboard.shared.v1';
  data: {
    dashboardId: string;
    organizationId: string;
    sharedWith: string[]; // User IDs
    sharedBy: string;
  };
  metadata: EventMetadata;
}

// KPI Events
interface KPICalculatedEvent {
  type: 'analytics.kpi.calculated.v1';
  data: {
    kpiId: string;
    organizationId: string;
    value: number;
    period: string; // YYYY-MM-DD or YYYY-MM or YYYY
    calculatedAt: Date;
  };
  metadata: EventMetadata;
}

interface KPITargetMissedEvent {
  type: 'analytics.kpi.target-missed.v1';
  data: {
    kpiId: string;
    kpiName: string;
    organizationId: string;
    actualValue: number;
    targetValue: number;
    variance: number;
    period: string;
  };
  metadata: EventMetadata;
}

// Alert Events
interface AlertTriggeredEvent {
  type: 'analytics.alert.triggered.v1';
  data: {
    alertId: string;
    alertName: string;
    organizationId: string;
    kpiId: string;
    severity: string;
    value: number;
    threshold: number;
    triggeredAt: Date;
  };
  metadata: EventMetadata;
}

interface AlertResolvedEvent {
  type: 'analytics.alert.resolved.v1';
  data: {
    alertId: string;
    organizationId: string;
    resolvedBy: string;
    resolvedAt: Date;
    resolutionNote: string;
  };
  metadata: EventMetadata;
}

// Export Events
interface ExportCompletedEvent {
  type: 'analytics.export.completed.v1';
  data: {
    exportId: string;
    organizationId: string;
    format: string;
    fileUrl: string;
    fileSize: number;
    completedAt: Date;
  };
  metadata: EventMetadata;
}
```

### Domain Events Consumed

```typescript
// Environmental Events
'environmental.carbon.emission-calculated.v1'   // Update carbon KPIs
'environmental.water.consumption-updated.v1'   // Update water KPIs
'environmental.waste.generated.v1'             // Update waste KPIs
'environmental.energy.consumption-updated.v1'  // Update energy KPIs

// Social Events
'social.diversity.metric-updated.v1'           // Update diversity KPIs
'social.safety.incident-reported.v1'           // Update safety KPIs
'social.workforce.headcount-updated.v1'        // Update workforce KPIs

// Governance Events
'governance.board.composition-updated.v1'      // Update governance KPIs
'governance.ethics.violation-reported.v1'      // Update ethics KPIs
'governance.risk.assessment-completed.v1'      // Update risk KPIs

// Reporting Events
'reporting.report.published.v1'                // Update reporting KPIs
'reporting.disclosure.submitted.v1'            // Update disclosure KPIs

// Materiality Events
'materiality.assessment.completed.v1'          // Update materiality-weighted KPIs

// Benchmark Events
'benchmark.industry-data-updated.v1'           // Update benchmark comparisons
'benchmark.peer-group-updated.v1'              // Refresh peer comparisons
```

## Business Logic

### KPI Calculation Engine

```typescript
class KPICalculationEngine {
  async calculateKPI(
    kpiId: string,
    organizationId: string,
    period: string,
    scope?: { level: string; entityId: string }
  ): Promise<KPIValue> {
    // 1. Load KPI definition
    const kpi = await this.kpiRepository.findById(kpiId);
    if (!kpi) throw new Error('KPI not found');

    // 2. Resolve data sources
    const data = await this.resolveDataSources(kpi.calculation.dataSources, organizationId, period);

    // 3. Apply filters
    const filteredData = this.applyFilters(data, kpi.calculation.aggregation?.filters);

    // 4. Calculate based on type
    let value: number;
    switch (kpi.calculation.calculationType) {
      case 'SIMPLE':
        value = filteredData[0].value;
        break;

      case 'FORMULA':
        value = this.evaluateFormula(kpi.calculation.formula!, data);
        break;

      case 'AGGREGATION':
        value = this.aggregate(filteredData, kpi.calculation.aggregation!);
        break;

      case 'RATIO':
        const numerator = this.resolveValue(kpi.calculation.ratio!.numerator, data);
        const denominator = this.resolveValue(kpi.calculation.ratio!.denominator, data);
        value = (numerator / denominator) * (kpi.calculation.ratio!.multiplier || 1);
        break;

      case 'CUSTOM':
        value = await this.executeCustomLogic(kpi.calculation.customLogic!, data);
        break;

      default:
        throw new Error(`Unsupported calculation type: ${kpi.calculation.calculationType}`);
    }

    // 5. Apply scope rollup (if hierarchical)
    if (scope && scope.level !== 'CORPORATE') {
      value = await this.rollupValue(value, kpi, scope);
    }

    // 6. Convert units
    const convertedValue = value * kpi.units.conversionFactor;

    // 7. Store result
    const kpiValue: KPIValue = {
      kpiId,
      organizationId,
      period,
      value: convertedValue,
      rawValue: value,
      unit: kpi.units.displayUnit,
      calculatedAt: new Date(),
      dataQuality: this.assessDataQuality(data)
    };

    await this.kpiValueRepository.create(kpiValue);

    // 8. Publish event
    await this.eventBus.publish(new KPICalculatedEvent({ ...kpiValue }));

    // 9. Check thresholds and targets
    await this.checkThresholds(kpiValue, kpi);
    await this.checkTarget(kpiValue, kpi);

    return kpiValue;
  }

  private evaluateFormula(formula: string, data: any): number {
    // Safe formula evaluation (no eval!)
    const parser = new FormulaParser();
    return parser.parse(formula, data);
  }

  private aggregate(data: any[], config: Aggregation): number {
    switch (config.method) {
      case 'SUM':
        return data.reduce((sum, item) => sum + item[config.field], 0);
      case 'AVG':
        return data.reduce((sum, item) => sum + item[config.field], 0) / data.length;
      case 'MIN':
        return Math.min(...data.map(item => item[config.field]));
      case 'MAX':
        return Math.max(...data.map(item => item[config.field]));
      case 'COUNT':
        return data.length;
      case 'MEDIAN':
        const sorted = data.map(item => item[config.field]).sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      default:
        throw new Error(`Unsupported aggregation method: ${config.method}`);
    }
  }

  private async checkThresholds(kpiValue: KPIValue, kpi: KPIDefinition): Promise<void> {
    const thresholds = kpi.thresholds;
    let severity: string | null = null;

    if (this.isInRange(kpiValue.value, thresholds.critical)) {
      severity = 'CRITICAL';
    } else if (this.isInRange(kpiValue.value, thresholds.warning)) {
      severity = 'WARNING';
    }

    if (severity) {
      await this.alertService.triggerThresholdAlert(kpi, kpiValue, severity);
    }
  }

  private async checkTarget(kpiValue: KPIValue, kpi: KPIDefinition): Promise<void> {
    if (!kpi.targets) return;

    const variance = kpiValue.value - kpi.targets.targetValue;
    const variancePercentage = (variance / kpi.targets.targetValue) * 100;

    if (Math.abs(variancePercentage) > 10) {
      await this.eventBus.publish(new KPITargetMissedEvent({
        kpiId: kpi.kpiId,
        kpiName: kpi.metadata.name,
        organizationId: kpi.organizationId,
        actualValue: kpiValue.value,
        targetValue: kpi.targets.targetValue,
        variance,
        period: kpiValue.period
      }));
    }
  }
}
```

### Trend Analysis Service

```typescript
class TrendAnalysisService {
  async analyzeTrend(
    kpiId: string,
    organizationId: string,
    startDate: Date,
    endDate: Date,
    granularity: string
  ): Promise<TrendAnalysis> {
    // 1. Fetch historical data
    const data = await this.kpiValueRepository.findByDateRange(
      kpiId,
      organizationId,
      startDate,
      endDate,
      granularity
    );

    // 2. Calculate statistics
    const values = data.map(d => d.value);
    const statistics = this.calculateStatistics(values);

    // 3. Detect trend direction
    const trendDirection = this.detectTrendDirection(values);

    // 4. Calculate moving averages
    const movingAverages = this.calculateMovingAverages(values);

    // 5. Detect seasonality
    const seasonality = this.detectSeasonality(data);

    // 6. Calculate comparisons
    const comparisons = await this.calculateComparisons(kpiId, organizationId, data);

    // 7. Forecast future values
    const forecast = await this.forecastValues(values, granularity);

    // 8. Detect anomalies
    const anomalies = this.detectAnomalies(data, statistics);

    // 9. Calculate volatility
    const volatility = this.calculateVolatility(values, statistics);

    // 10. Correlation analysis
    const correlations = await this.correlationAnalysis(kpiId, organizationId, data);

    const analysis: TrendAnalysis = {
      id: uuidv4(),
      analysisId: `trend-${Date.now()}`,
      organizationId,
      metadata: {
        name: `Trend Analysis - ${kpiId}`,
        description: '',
        kpiId,
        kpiName: ''
      },
      timePeriod: {
        startDate,
        endDate,
        granularity,
        dataPoints: data.length
      },
      statistics,
      trendDirection,
      movingAverages,
      seasonality,
      comparisons,
      forecast,
      anomalies,
      volatility,
      correlations,
      metadata: {
        createdAt: new Date(),
        createdBy: 'system',
        lastUpdatedAt: new Date(),
        refreshInterval: 'DAILY',
        nextRefreshAt: new Date(Date.now() + 86400000)
      }
    };

    await this.trendAnalysisRepository.create(analysis);

    return analysis;
  }

  private detectTrendDirection(values: number[]): TrendDirection {
    // Linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssResidual = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const rSquared = 1 - (ssResidual / ssTotal);

    let direction: string;
    if (Math.abs(slope) < 0.01) {
      direction = 'STABLE';
    } else if (slope > 0) {
      direction = 'INCREASING';
    } else {
      direction = 'DECREASING';
    }

    return {
      overall: direction,
      recentTrend: this.detectRecentTrend(values.slice(-6)), // Last 6 periods
      confidence: rSquared * 100,
      slope,
      rSquared
    };
  }

  private detectSeasonality(data: KPIValue[]): Seasonality {
    // Simple seasonal decomposition
    const values = data.map(d => d.value);
    const periods = this.detectSeasonalPeriod(values);

    if (!periods) {
      return { detected: false, pattern: '', peaks: [], troughs: [], seasonalIndices: {} };
    }

    // Find peaks and troughs
    const peaks: { date: Date; value: number }[] = [];
    const troughs: { date: Date; value: number }[] = [];

    for (let i = 1; i < data.length - 1; i++) {
      if (data[i].value > data[i - 1].value && data[i].value > data[i + 1].value) {
        peaks.push({ date: new Date(data[i].period), value: data[i].value });
      }
      if (data[i].value < data[i - 1].value && data[i].value < data[i + 1].value) {
        troughs.push({ date: new Date(data[i].period), value: data[i].value });
      }
    }

    return {
      detected: true,
      pattern: periods === 12 ? 'MONTHLY' : periods === 4 ? 'QUARTERLY' : 'ANNUAL',
      peaks,
      troughs,
      seasonalIndices: {}
    };
  }

  private async forecastValues(values: number[], granularity: string): Promise<Forecast> {
    // Simple exponential smoothing
    const alpha = 0.3; // Smoothing parameter
    const forecastPeriods = granularity === 'MONTHLY' ? 12 : granularity === 'QUARTERLY' ? 4 : 1;

    let level = values[0];
    const predictions: ForecastPrediction[] = [];

    for (let i = 0; i < forecastPeriods; i++) {
      level = alpha * values[values.length - 1] + (1 - alpha) * level;

      const stdDev = this.calculateStdDev(values);
      const confidence = 95;
      const zScore = 1.96; // 95% confidence

      predictions.push({
        date: new Date(Date.now() + (i + 1) * 30 * 86400000),
        predictedValue: level,
        lowerBound: level - zScore * stdDev,
        upperBound: level + zScore * stdDev,
        confidence
      });
    }

    return {
      enabled: true,
      method: 'EXPONENTIAL_SMOOTHING',
      forecastPeriods,
      predictions,
      accuracy: {
        mae: 0,
        mape: 0,
        rmse: 0
      }
    };
  }

  private detectAnomalies(data: KPIValue[], statistics: Statistics): Anomalies {
    const anomalies: AnomalyPoint[] = [];
    const threshold = 3; // Z-score threshold

    data.forEach(point => {
      const zScore = (point.value - statistics.mean) / statistics.standardDeviation;

      if (Math.abs(zScore) > threshold) {
        anomalies.push({
          date: new Date(point.period),
          value: point.value,
          expectedValue: statistics.mean,
          deviation: point.value - statistics.mean,
          severity: Math.abs(zScore) > 4 ? 'CRITICAL' : Math.abs(zScore) > 3.5 ? 'HIGH' : 'MEDIUM'
        });
      }
    });

    return {
      detected: anomalies.length > 0,
      detectionMethod: 'Z_SCORE',
      anomalies
    };
  }
}
```

## Integration Points

### Data Source Integrations

```typescript
// Environmental Services
CarbonService (3011) → Scope 1/2/3 emissions, carbon intensity
WaterService (3012) → Water consumption, wastewater, water stress
WasteService (3013) → Waste generated, recycled, diverted
EnergyService (3015) → Energy consumption, renewable energy percentage

// Social Services
WorkforceService (3021) → Employee count, turnover, diversity
SafetyService (3022) → Incidents, LTIFR, TRIFR
DiversityService (3028) → Gender diversity, pay equity

// Governance Services
BoardService (3031) → Board diversity, independence
EthicsService (3032) → Code violations, training completion
RiskService (3033) → ESG risk scores

// Strategic Services
MaterialityService (3041) → Material issues
ReportingService (3044) → Disclosure completeness
BenchmarkService (3043) → Industry benchmarks
```

### External Integrations

```typescript
// Business Intelligence
- Tableau (embedded analytics)
- Power BI (embedded dashboards)
- Looker (embedded visualizations)

// Data Warehouses
- Snowflake (ESG data warehouse)
- BigQuery (analytics data lake)
- Redshift (AWS data warehouse)

// Benchmark Data Providers
- CDP (climate disclosure scores)
- Sustainalytics (ESG ratings)
- MSCI (ESG scores)
- Bloomberg ESG Data
- Refinitiv (ESG data)

// Export Integrations
- Microsoft Office (Excel, PowerPoint)
- Google Workspace (Sheets, Slides)
- PDF generation (Puppeteer)
```

## Security & Compliance

### Data Access Control

```typescript
// Row-Level Security
class AnalyticsAuthorizationService {
  async canAccessDashboard(userId: string, dashboardId: string): Promise<boolean> {
    const dashboard = await this.dashboardRepository.findById(dashboardId);

    // Owner has full access
    if (dashboard.access.owner.userId === userId) return true;

    // Check shared access
    const sharedAccess = dashboard.access.sharedWith.find(s => s.userId === userId);
    if (sharedAccess && sharedAccess.permissions.includes('VIEW')) return true;

    // Check role-based access
    const userRoles = await this.userService.getUserRoles(userId);
    const roleAccess = dashboard.access.sharedWith.find(s => userRoles.includes(s.roleId!));
    if (roleAccess && roleAccess.permissions.includes('VIEW')) return true;

    // Public dashboards
    if (dashboard.access.visibility === 'PUBLIC') return true;

    return false;
  }

  async canAccessKPI(userId: string, kpiId: string): Promise<boolean> {
    const kpi = await this.kpiRepository.findById(kpiId);

    // Published KPIs are accessible to all
    if (kpi.status.isPublished) return true;

    // Only owner can access unpublished KPIs
    return kpi.metadata.createdBy === userId;
  }
}
```

### Data Privacy

```typescript
// Personal Data Handling
// NOTE: Analytics Service does NOT store personal data.
// All KPIs/metrics are aggregated at organizational level.
// No individual employee/customer data is stored.

// Exception: User preferences and dashboard configurations
// are stored per user (not sensitive personal data).
```

### Audit Logging

```typescript
// All analytics operations are logged
interface AnalyticsAuditLog {
  userId: string;
  action: string; // VIEW_DASHBOARD, CALCULATE_KPI, EXPORT_DATA, CREATE_ALERT
  resourceType: string; // DASHBOARD, KPI, METRIC, EXPORT
  resourceId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  result: string; // SUCCESS, FAILURE
  details?: any;
}

// Sensitive operations (exports) logged to Audit Service
await this.auditService.logExport({
  userId,
  exportType: 'DASHBOARD_PDF',
  dashboardId,
  fileUrl,
  recipients,
  timestamp: new Date()
});
```

## Performance Optimization

### Caching Strategy

```typescript
// Multi-layer caching
class AnalyticsCacheService {
  // L1: In-memory cache (Node.js)
  private memoryCache = new LRU({ max: 1000, ttl: 300000 }); // 5 min

  // L2: Redis cache (shared across instances)
  private redisCache: Redis;

  // L3: ClickHouse materialized views (pre-aggregated data)
  // L4: MongoDB (persistent storage)

  async getDashboardData(dashboardId: string, filters: any): Promise<any> {
    const cacheKey = `dashboard:${dashboardId}:${JSON.stringify(filters)}`;

    // L1: Memory
    let data = this.memoryCache.get(cacheKey);
    if (data) return data;

    // L2: Redis
    const cached = await this.redisCache.get(cacheKey);
    if (cached) {
      data = JSON.parse(cached);
      this.memoryCache.set(cacheKey, data);
      return data;
    }

    // L3/L4: Query database
    data = await this.queryDashboardData(dashboardId, filters);

    // Store in cache
    await this.redisCache.setex(cacheKey, 300, JSON.stringify(data)); // 5 min TTL
    this.memoryCache.set(cacheKey, data);

    return data;
  }

  async invalidateDashboard(dashboardId: string): Promise<void> {
    const pattern = `dashboard:${dashboardId}:*`;
    const keys = await this.redisCache.keys(pattern);
    if (keys.length > 0) {
      await this.redisCache.del(...keys);
    }
    this.memoryCache.clear();
  }
}
```

### Query Optimization

```typescript
// ClickHouse OLAP queries
class ClickHouseQueryService {
  async aggregateKPI(
    kpiId: string,
    organizationId: string,
    dimensions: string[],
    filters: Filter[]
  ): Promise<any[]> {
    // Use materialized views for common aggregations
    const sql = `
      SELECT
        ${dimensions.join(', ')},
        SUM(value) as total,
        AVG(value) as average,
        COUNT(*) as count
      FROM kpi_values_mv
      WHERE organization_id = {organizationId:String}
        AND kpi_id = {kpiId:String}
        ${this.buildFilterClause(filters)}
      GROUP BY ${dimensions.join(', ')}
      ORDER BY total DESC
    `;

    return await this.clickhouse.query(sql, { organizationId, kpiId }).toPromise();
  }

  // Materialized view for fast aggregations
  async createMaterializedView(): Promise<void> {
    await this.clickhouse.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS kpi_values_mv
      ENGINE = AggregatingMergeTree()
      PARTITION BY toYYYYMM(period_date)
      ORDER BY (organization_id, kpi_id, period_date)
      AS SELECT
        organization_id,
        kpi_id,
        toDate(period) as period_date,
        sumState(value) as value_sum,
        avgState(value) as value_avg,
        countState() as count
      FROM kpi_values
      GROUP BY organization_id, kpi_id, period_date
    `).toPromise();
  }
}
```

### Real-time Updates

```typescript
// WebSocket optimization
class DashboardWebSocketService {
  private connections = new Map<string, Set<WebSocket>>();

  subscribeToDashboard(dashboardId: string, ws: WebSocket): void {
    if (!this.connections.has(dashboardId)) {
      this.connections.set(dashboardId, new Set());
    }
    this.connections.get(dashboardId)!.add(ws);
  }

  async broadcastUpdate(dashboardId: string, widgetId: string, data: any): Promise<void> {
    const subscribers = this.connections.get(dashboardId);
    if (!subscribers) return;

    const message = JSON.stringify({
      event: 'dashboard_updated',
      data: { dashboardId, widgetId, ...data }
    });

    // Broadcast to all subscribers (throttled)
    const promises = Array.from(subscribers).map(ws => {
      return this.sendThrottled(ws, message);
    });

    await Promise.all(promises);
  }

  private sendThrottled(ws: WebSocket, message: string): Promise<void> {
    // Throttle updates to max 1 per second per widget
    return new Promise((resolve) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
      resolve();
    });
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('KPICalculationEngine', () => {
  describe('calculateKPI', () => {
    it('should calculate simple KPI from single data source', async () => {
      const kpi = mockKPIDefinition({ calculationType: 'SIMPLE' });
      const data = [{ value: 12345 }];

      const result = await engine.calculateKPI(kpi.kpiId, 'org-1', '2025-11');

      expect(result.value).toBe(12345);
    });

    it('should calculate formula-based KPI', async () => {
      const kpi = mockKPIDefinition({
        calculationType: 'FORMULA',
        formula: 'scope1 + scope2 + scope3'
      });

      const result = await engine.calculateKPI(kpi.kpiId, 'org-1', '2025-11');

      expect(result.value).toBe(30000); // 10000 + 15000 + 5000
    });

    it('should calculate ratio KPI with multiplier', async () => {
      const kpi = mockKPIDefinition({
        calculationType: 'RATIO',
        ratio: {
          numerator: 'carbon_emissions',
          denominator: 'revenue',
          multiplier: 1000000 // per million USD
        }
      });

      const result = await engine.calculateKPI(kpi.kpiId, 'org-1', '2025-11');

      expect(result.value).toBe(100); // (50000 / 500000000) * 1000000
    });

    it('should trigger alert when threshold exceeded', async () => {
      const kpi = mockKPIDefinition({
        thresholds: { critical: { max: 10000 } }
      });

      await engine.calculateKPI(kpi.kpiId, 'org-1', '2025-11');

      expect(alertService.triggerThresholdAlert).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ value: 15000 }),
        'CRITICAL'
      );
    });
  });
});
```

### Integration Tests

```typescript
describe('Analytics API', () => {
  it('should create dashboard and return configuration', async () => {
    const response = await request(app)
      .post('/api/v1/analytics/dashboards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Executive Dashboard',
        type: 'EXECUTIVE',
        layout: { columns: 12, rows: 10, widgets: [] }
      });

    expect(response.status).toBe(201);
    expect(response.body.data.dashboardId).toBeDefined();
  });

  it('should calculate KPI and return value', async () => {
    const response = await request(app)
      .post('/api/v1/analytics/kpis/kpi-carbon-scope1/calculate')
      .set('Authorization', `Bearer ${token}`)
      .send({ period: '2025-11' });

    expect(response.status).toBe(200);
    expect(response.body.data.value).toBeGreaterThan(0);
  });

  it('should export dashboard to PDF', async () => {
    const response = await request(app)
      .post('/api/v1/analytics/exports')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dashboardId: 'dash-123',
        format: 'PDF'
      });

    expect(response.status).toBe(202); // Accepted
    expect(response.body.data.jobId).toBeDefined();
  });
});
```

### Performance Tests

```typescript
describe('Performance', () => {
  it('should load dashboard in under 2 seconds', async () => {
    const start = Date.now();

    await request(app)
      .get('/api/v1/analytics/dashboards/dash-123/data')
      .set('Authorization', `Bearer ${token}`);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  it('should calculate KPI in under 500ms', async () => {
    const start = Date.now();

    await engine.calculateKPI('kpi-carbon-scope1', 'org-1', '2025-11');

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });

  it('should handle 100 concurrent dashboard requests', async () => {
    const requests = Array(100).fill(0).map(() =>
      request(app)
        .get('/api/v1/analytics/dashboards/dash-123/data')
        .set('Authorization', `Bearer ${token}`)
    );

    const results = await Promise.all(requests);

    expect(results.every(r => r.status === 200)).toBe(true);
  });
});
```

## Deployment

### Infrastructure Requirements

```yaml
# Production Environment
Compute:
  - API Servers: 4 instances (m5.2xlarge)
  - Background Workers: 2 instances (c5.xlarge) # KPI calculation, exports
  - WebSocket Servers: 2 instances (c5.large) # Real-time updates

Databases:
  - MongoDB: Cluster (M50) # 32 GB RAM, 500 GB storage
  - ClickHouse: Cluster (3 nodes, 32 GB RAM each)
  - InfluxDB: Enterprise (16 GB RAM)
  - Redis: Cluster (r5.large, 2 nodes)

Storage:
  - S3: Export files, cached reports (1 TB)

Estimated Cost: $4,500/month
```

### Monitoring

```yaml
Metrics:
  - Dashboard load time (p50, p95, p99)
  - KPI calculation time
  - Query execution time (ClickHouse)
  - Cache hit rate (Redis)
  - WebSocket connection count
  - Alert trigger rate
  - Export job success rate

Alerts:
  - Dashboard load time > 5s
  - KPI calculation failures > 5%
  - Query timeout rate > 1%
  - Cache hit rate < 80%
  - Export job failures > 10%
```

## Migration Plan

### Phase 1: Foundation (Sprint 6.1)
- Set up MongoDB, ClickHouse, InfluxDB, Redis
- Implement KPI library (500+ pre-built KPIs)
- Implement KPI calculation engine
- Implement dashboard configuration API
- Basic visualization components

### Phase 2: Analytics (Sprint 6.2)
- Implement trend analysis
- Implement benchmarking
- Implement custom metrics
- Implement alert rules
- Implement export functionality

### Phase 3: Advanced Features (Sprint 6.3)
- Real-time WebSocket updates
- Advanced visualizations (maps, network graphs)
- ML-powered anomaly detection
- Predictive forecasting
- Mobile analytics

## Success Metrics

```yaml
Performance:
  - Dashboard load time: <2s (p95)
  - KPI calculation time: <500ms (p95)
  - Query response time: <200ms (p95)
  - WebSocket latency: <100ms
  - Export generation time: <10s for PDF, <30s for Excel

Adoption:
  - 500+ pre-built KPIs available
  - 50+ dashboard templates
  - 100% ESG framework coverage (GRI, SASB, CSRD)
  - 90% user satisfaction score

Quality:
  - 90% unit test coverage
  - 80% integration test coverage
  - Zero data integrity issues
  - 99.9% uptime SLA
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Next Review**: Sprint 6.1 Planning
