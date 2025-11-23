# Rating Service - Service Specification

## Service Metadata

| Attribute | Value |
|-----------|-------|
| **Service Name** | Rating Service |
| **Service ID** | `rating-service` |
| **Port** | 3049 |
| **Phase** | Phase 6 - Analytics & ML Domain |
| **Story Points** | 25 |
| **Owner** | Rating Agent |
| **Status** | Future Roadmap |
| **Sprint** | Sprint 23 |
| **Dependencies** | Materiality Service, Benchmark Service, Analytics Service, Reporting Service, Reference Service |

## Executive Summary

The **Rating Service** is the ESG performance scoring engine that provides comprehensive ESG ratings, scores, and peer rankings using industry-standard methodologies (MSCI, CDP, Sustainalytics) and custom frameworks. It enables organizations to understand their ESG performance, track improvements, benchmark against peers, and simulate rating scenarios.

### Key Capabilities

1. **ESG Score Calculation** - Composite ESG scores with customizable weights
2. **Rating Methodologies** - MSCI-style, CDP scoring, Sustainalytics risk ratings
3. **Performance Ratings** - Absolute performance and improvement ratings
4. **Peer Rankings** - Industry rankings and sector comparisons
5. **Controversy Tracking** - ESG incidents and negative events monitoring
6. **Materiality-Weighted Scoring** - SASB materiality integration
7. **Custom Scoring Models** - User-defined weights, thresholds, methodologies
8. **Rating Simulations** - What-if scenarios for rating improvement

### Business Value

- **Strategic Insight**: Understand ESG performance across all dimensions
- **Investor Communication**: Align with rating methodologies used by investors
- **Continuous Improvement**: Track progress and identify improvement opportunities
- **Competitive Positioning**: Compare performance against industry peers
- **Risk Management**: Monitor controversies and ESG incidents
- **Goal Setting**: Simulate scenarios to plan rating improvements

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Domain Model](#domain-model)
3. [API Specification](#api-specification)
4. [Event Contracts](#event-contracts)
5. [Data Architecture](#data-architecture)
6. [Business Logic](#business-logic)
7. [Integration Points](#integration-points)
8. [Security & Compliance](#security--compliance)
9. [Performance Requirements](#performance-requirements)
10. [Testing Strategy](#testing-strategy)
11. [Deployment](#deployment)
12. [Monitoring & Observability](#monitoring--observability)

---

## System Architecture

### Service Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      RATING SERVICE                             │
│                      Port: 3049                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              API LAYER (NestJS)                        │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ Controllers:                                           │   │
│  │ • Rating Controller    • Score Controller             │   │
│  │ • Methodology Controller • Ranking Controller         │   │
│  │ • Controversy Controller • Simulation Controller      │   │
│  └────────────────────────────────────────────────────────┘   │
│                          │                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │           APPLICATION LAYER (CQRS)                     │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ Commands:                                              │   │
│  │ • CalculateESGScore    • CreateCustomMethodology      │   │
│  │ • RecordControversy    • GeneratePeerRanking          │   │
│  │ • SimulateScoreChange  • UpdateRatingWeights          │   │
│  │                                                         │   │
│  │ Queries:                                               │   │
│  │ • GetCurrentRating     • GetRatingHistory             │   │
│  │ • GetPeerRankings      • GetControversies             │   │
│  │ • GetScoreBreakdown    • GetImprovementOpportunities  │   │
│  └────────────────────────────────────────────────────────┘   │
│                          │                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              DOMAIN LAYER                              │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ Aggregates:                                            │   │
│  │ • ESGRating            • ScoreCard                    │   │
│  │ • RatingMethodology    • PeerRanking                  │   │
│  │ • Controversy          • RatingSimulation             │   │
│  │                                                         │   │
│  │ Domain Services:                                       │   │
│  │ • ScoreCalculationService                             │   │
│  │ • MethodologyEngineService                            │   │
│  │ • RankingService                                      │   │
│  │ • ControversyImpactService                            │   │
│  │ • SimulationEngineService                             │   │
│  └────────────────────────────────────────────────────────┘   │
│                          │                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │          INFRASTRUCTURE LAYER                          │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ • MongoDB Repository (ratings, scores, methodologies)  │   │
│  │ • ClickHouse Repository (rating calculations, trends) │   │
│  │ • Event Bus (AWS EventBridge)                         │   │
│  │ • Cache Layer (Redis - rating cache)                 │   │
│  │ • External APIs (MSCI, CDP, Sustainalytics proxies)  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js 20 LTS | Service execution |
| **Framework** | NestJS 10.x | Application framework |
| **Language** | TypeScript 5.x | Type-safe development |
| **Primary Database** | MongoDB 7.x | Ratings, methodologies, scores |
| **Analytics Database** | ClickHouse 23.x | Rating calculations, trends |
| **Cache** | Redis 7.x | Rating cache, real-time scores |
| **Event Bus** | AWS EventBridge | Async event processing |
| **Validation** | Zod | Schema validation |
| **Testing** | Jest + Supertest | Unit + Integration tests |
| **Documentation** | OpenAPI 3.1 | API documentation |

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AWS CLOUD INFRASTRUCTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Application Load Balancer                   │ │
│  │              (API Gateway: /api/v1/rating)              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                          │                                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │          ECS Fargate / EKS Cluster                       │ │
│  │  ┌─────────────────────────────────────────────┐        │ │
│  │  │  Rating Service Pods (Auto-scaling 2-10)    │        │ │
│  │  │  • CPU: 2 vCPU                              │        │ │
│  │  │  • Memory: 4GB RAM                          │        │ │
│  │  │  • Replicas: 3 (prod), 2 (staging)         │        │ │
│  │  └─────────────────────────────────────────────┘        │ │
│  └──────────────────────────────────────────────────────────┘ │
│           │                    │                    │          │
│  ┌────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  DocumentDB    │  │   ClickHouse     │  │  ElastiCache  │ │
│  │  (MongoDB)     │  │   Cluster        │  │  (Redis)      │ │
│  │  • Multi-AZ    │  │  • 3 nodes       │  │  • Cluster    │ │
│  │  • Encrypted   │  │  • Replicated    │  │  • Encrypted  │ │
│  └────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              AWS EventBridge Event Bus                   │ │
│  │  • rating.* events                                       │ │
│  │  • controversy.* events                                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Service Dependencies

**Upstream Dependencies** (Services this service depends on):
- **Materiality Service** (3041) - Materiality weights for scoring
- **Benchmark Service** (3043) - Peer data for rankings
- **Analytics Service** (3045) - Performance metrics aggregation
- **Reporting Service** (3044) - ESG data for scoring
- **Reference Service** (3003) - Industry classifications, rating scales

**Downstream Consumers** (Services that depend on this service):
- **Strategy Service** (3042) - Rating-based target setting
- **Dashboard Service** - Rating visualizations
- **Frontend Application** - Rating displays
- **External Reporting** - Rating disclosures

**External Integrations**:
- **MSCI ESG Ratings API** (read-only) - Rating methodology reference
- **CDP Scoring System** (read-only) - CDP score methodology
- **Sustainalytics API** (read-only) - Risk rating methodology
- **S&P Global ESG Scores** (read-only) - Rating comparisons

---

## Domain Model

### Core Aggregates

#### 1. ESGRating Aggregate

```typescript
/**
 * ESGRating - Primary aggregate representing an organization's ESG rating
 */
interface ESGRating {
  // Identity
  id: string;
  organizationId: string;
  projectId?: string; // Optional project-level rating

  // Rating Information
  overallRating: Rating;
  environmentalRating: Rating;
  socialRating: Rating;
  governanceRating: Rating;

  // Methodology
  methodologyId: string;
  methodologyName: string; // "MSCI-Style", "CDP", "Sustainalytics", "Custom"
  methodologyVersion: string;

  // Scoring
  overallScore: number; // 0-100
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;

  // Weights
  weights: {
    environmental: number; // Default: 33.33%
    social: number; // Default: 33.33%
    governance: number; // Default: 33.33%
  };

  // Performance Context
  industryAverage: number;
  percentile: number; // 0-100 (industry percentile)
  rank?: number; // Optional absolute rank
  totalCompanies?: number;

  // Materiality Integration
  materialityWeighted: boolean;
  materialityAssessmentId?: string;

  // Controversy Impact
  controversyAdjustment: number; // Negative adjustment
  activeControversies: number;

  // Period
  reportingPeriod: ReportingPeriod;
  calculatedAt: Date;
  validUntil: Date;

  // Change Tracking
  previousRating?: Rating;
  ratingChange?: 'UPGRADE' | 'DOWNGRADE' | 'STABLE';
  scoreChange: number; // Change from previous period

  // Metadata
  status: 'DRAFT' | 'CALCULATED' | 'REVIEWED' | 'PUBLISHED' | 'ARCHIVED';
  calculationMetadata: {
    dataCompleteness: number; // 0-100%
    dataSources: string[];
    calculationDuration: number; // milliseconds
    warnings: string[];
  };

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

/**
 * Rating - Standard rating value (AAA to CCC)
 */
interface Rating {
  letter: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  numeric: number; // 1-7 (AAA=7, CCC=1)
  outlook: 'POSITIVE' | 'STABLE' | 'NEGATIVE';
}

/**
 * ReportingPeriod
 */
interface ReportingPeriod {
  year: number;
  quarter?: 1 | 2 | 3 | 4;
  startDate: Date;
  endDate: Date;
}
```

#### 2. ScoreCard Aggregate

```typescript
/**
 * ScoreCard - Detailed breakdown of ESG score components
 */
interface ScoreCard {
  // Identity
  id: string;
  ratingId: string;
  organizationId: string;

  // Environmental Scores
  environmental: {
    overallScore: number;
    components: {
      carbonEmissions: ComponentScore;
      energyManagement: ComponentScore;
      waterManagement: ComponentScore;
      wasteManagement: ComponentScore;
      biodiversity: ComponentScore;
      pollutionPrevention: ComponentScore;
    };
    weight: number;
  };

  // Social Scores
  social: {
    overallScore: number;
    components: {
      humanCapital: ComponentScore;
      healthSafety: ComponentScore;
      laborRights: ComponentScore;
      diversityInclusion: ComponentScore;
      communityRelations: ComponentScore;
      supplyChain: ComponentScore;
    };
    weight: number;
  };

  // Governance Scores
  governance: {
    overallScore: number;
    components: {
      boardGovernance: ComponentScore;
      ethicsCompliance: ComponentScore;
      riskManagement: ComponentScore;
      dataPrivacy: ComponentScore;
      cybersecurity: ComponentScore;
      businessConduct: ComponentScore;
    };
    weight: number;
  };

  // Materiality Adjustments
  materialityAdjustments?: {
    appliedIssues: Array<{
      issueId: string;
      issueName: string;
      materialityScore: number; // 0-100
      weightAdjustment: number;
    }>;
    totalAdjustment: number;
  };

  // Controversy Impact
  controversyImpacts?: Array<{
    controversyId: string;
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
    scoreImpact: number; // Negative
  }>;

  // Peer Comparison
  peerComparison?: {
    industryAverage: number;
    topQuartile: number;
    median: number;
    bottomQuartile: number;
    organizationPosition: 'TOP_QUARTILE' | 'ABOVE_AVERAGE' | 'BELOW_AVERAGE' | 'BOTTOM_QUARTILE';
  };

  // Metadata
  calculatedAt: Date;
  methodologyId: string;
}

/**
 * ComponentScore - Individual component score
 */
interface ComponentScore {
  score: number; // 0-100
  weight: number; // Component weight within pillar
  dataQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  dataCompleteness: number; // 0-100%
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  industryAverage?: number;
  bestInClass?: number;
}
```

#### 3. RatingMethodology Aggregate

```typescript
/**
 * RatingMethodology - Rating calculation methodology
 */
interface RatingMethodology {
  // Identity
  id: string;
  name: string;
  type: 'MSCI_STYLE' | 'CDP' | 'SUSTAINALYTICS' | 'SP_GLOBAL' | 'CUSTOM';
  version: string;

  // Description
  description: string;
  source?: string; // Reference URL

  // Scoring Model
  scoringModel: {
    // Pillar Weights
    pillarWeights: {
      environmental: number; // 0-100%
      social: number;
      governance: number;
    };

    // Component Weights (per pillar)
    environmentalComponents: ComponentWeights;
    socialComponents: ComponentWeights;
    governanceComponents: ComponentWeights;

    // Materiality Integration
    materialityWeighted: boolean;
    materialitySource?: 'SASB' | 'GRI' | 'CUSTOM';

    // Controversy Treatment
    controversyImpact: {
      enabled: boolean;
      severityMultipliers: {
        LOW: number;
        MEDIUM: number;
        HIGH: number;
        SEVERE: number;
      };
      maxAdjustment: number; // Maximum score reduction
      decayPeriod: number; // Months until controversy impact fades
    };
  };

  // Rating Scale
  ratingScale: {
    AAA: { min: number; max: number }; // e.g., 90-100
    AA: { min: number; max: number };  // e.g., 80-89
    A: { min: number; max: number };   // e.g., 70-79
    BBB: { min: number; max: number }; // e.g., 60-69
    BB: { min: number; max: number };  // e.g., 50-59
    B: { min: number; max: number };   // e.g., 40-49
    CCC: { min: number; max: number }; // e.g., 0-39
  };

  // Data Requirements
  dataRequirements: {
    requiredMetrics: string[];
    optionalMetrics: string[];
    minimumDataCompleteness: number; // 0-100%
  };

  // Industry Adjustments
  industryAdjustments?: {
    enabled: boolean;
    adjustmentFactors: Record<string, number>; // industryCode -> factor
  };

  // Status
  status: 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED';
  effectiveFrom: Date;
  effectiveUntil?: Date;

  // Ownership
  isPublic: boolean; // Public vs. custom methodology
  organizationId?: string; // If custom

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

/**
 * ComponentWeights - Component weight configuration
 */
interface ComponentWeights {
  [componentName: string]: {
    weight: number; // 0-100%
    required: boolean;
    calculationMethod: 'ABSOLUTE' | 'IMPROVEMENT' | 'COMBINED';
  };
}
```

#### 4. PeerRanking Aggregate

```typescript
/**
 * PeerRanking - Industry/sector peer ranking
 */
interface PeerRanking {
  // Identity
  id: string;
  organizationId: string;

  // Ranking Context
  rankingType: 'INDUSTRY' | 'SECTOR' | 'REGION' | 'SIZE_COHORT' | 'CUSTOM';
  industryCode?: string; // GICS, NAICS, etc.
  sectorName?: string;
  region?: string;
  cohortCriteria?: Record<string, any>;

  // Rankings
  overallRanking: RankingPosition;
  environmentalRanking: RankingPosition;
  socialRanking: RankingPosition;
  governanceRanking: RankingPosition;

  // Peer Statistics
  peerStatistics: {
    totalPeers: number;
    averageScore: number;
    medianScore: number;
    topQuartileThreshold: number;
    bottomQuartileThreshold: number;
    standardDeviation: number;
  };

  // Peer Distribution
  scoreDistribution: Array<{
    bucket: string; // e.g., "90-100", "80-89"
    count: number;
    percentage: number;
  }>;

  // Top Performers
  topPerformers?: Array<{
    organizationId: string;
    organizationName: string;
    score: number;
    rating: Rating;
    rank: number;
  }>;

  // Performance Gap
  gapAnalysis: {
    gapToLeader: number;
    gapToTopQuartile: number;
    gapToAverage: number;
  };

  // Period
  reportingPeriod: ReportingPeriod;
  calculatedAt: Date;

  // Methodology
  methodologyId: string;

  // Metadata
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * RankingPosition - Position in ranking
 */
interface RankingPosition {
  rank: number; // Absolute rank
  percentile: number; // 0-100
  quartile: 1 | 2 | 3 | 4;
  score: number;
  rating: Rating;
}
```

#### 5. Controversy Aggregate

```typescript
/**
 * Controversy - ESG controversy/incident tracking
 */
interface Controversy {
  // Identity
  id: string;
  organizationId: string;
  projectId?: string;

  // Controversy Details
  title: string;
  description: string;
  category: 'ENVIRONMENTAL' | 'SOCIAL' | 'GOVERNANCE';
  subcategory: string; // e.g., "Environmental Violation", "Labor Dispute"

  // Severity
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  severityScore: number; // 0-100 (impact score)

  // Timeline
  incidentDate: Date;
  discoveredDate: Date;
  resolvedDate?: Date;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

  // Source
  sources: Array<{
    type: 'NEWS' | 'REGULATORY' | 'NGO' | 'INTERNAL' | 'OTHER';
    name: string;
    url?: string;
    publishedDate: Date;
  }>;

  // Impact
  ratingImpact: {
    scoreAdjustment: number; // Negative
    ratingDowngrade: number; // Number of rating levels
    affectedPillars: Array<'ENVIRONMENTAL' | 'SOCIAL' | 'GOVERNANCE'>;
    impactStartDate: Date;
    impactEndDate?: Date; // When impact fully fades
  };

  // Response
  organizationResponse?: {
    responseDate: Date;
    responseType: 'DENIAL' | 'ACKNOWLEDGMENT' | 'REMEDIATION' | 'LEGAL_ACTION';
    responseDescription: string;
    remediationPlan?: string;
    estimatedResolutionDate?: Date;
  };

  // Financial Impact
  financialImpact?: {
    estimatedCost: number;
    currency: string;
    finesPayments?: number;
    settlementAmount?: number;
    legalCosts?: number;
  };

  // Stakeholder Impact
  stakeholderImpact?: {
    affectedStakeholders: string[];
    numberOfPeopleAffected?: number;
    environmentalDamage?: string;
  };

  // Regulatory
  regulatoryActions?: Array<{
    agency: string;
    actionType: 'INVESTIGATION' | 'FINE' | 'LAWSUIT' | 'SETTLEMENT';
    actionDate: Date;
    outcome?: string;
  }>;

  // Tags
  tags: string[];

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}
```

#### 6. RatingSimulation Aggregate

```typescript
/**
 * RatingSimulation - What-if scenario for rating improvement
 */
interface RatingSimulation {
  // Identity
  id: string;
  organizationId: string;
  baseRatingId: string; // Current rating

  // Simulation Details
  name: string;
  description: string;
  scenarioType: 'IMPROVEMENT_PLAN' | 'CONTROVERSY_RESOLUTION' | 'WEIGHT_CHANGE' | 'CUSTOM';

  // Assumptions
  assumptions: Array<{
    category: string;
    component: string;
    currentScore: number;
    targetScore: number;
    improvementPercentage: number;
    timeframe: string; // e.g., "6 months", "1 year"
    rationale: string;
  }>;

  // Weight Adjustments
  weightAdjustments?: {
    environmental: number;
    social: number;
    governance: number;
  };

  // Simulated Results
  simulatedRating: {
    overallRating: Rating;
    overallScore: number;
    environmentalRating: Rating;
    environmentalScore: number;
    socialRating: Rating;
    socialScore: number;
    governanceRating: Rating;
    governanceScore: number;
  };

  // Comparison
  comparison: {
    currentRating: Rating;
    simulatedRating: Rating;
    ratingChange: number; // Number of levels
    scoreChange: number;
    percentileChange: number;
    rankChange?: number;
  };

  // Investment Required
  investmentEstimate?: {
    totalCost: number;
    currency: string;
    breakdown: Array<{
      initiative: string;
      cost: number;
      expectedImpact: number; // Score improvement
    }>;
    roi?: number; // Return on investment
  };

  // Timeline
  implementationPlan?: Array<{
    phase: string;
    duration: string;
    milestones: string[];
    expectedScoreIncrease: number;
  }>;

  // Status
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}
```

### Value Objects

```typescript
/**
 * ScoreRange - Valid score range
 */
interface ScoreRange {
  min: number; // 0
  max: number; // 100
}

/**
 * RatingThresholds - Rating letter thresholds
 */
interface RatingThresholds {
  AAA: number; // >= 90
  AA: number;  // >= 80
  A: number;   // >= 70
  BBB: number; // >= 60
  BB: number;  // >= 50
  B: number;   // >= 40
  CCC: number; // < 40
}

/**
 * PerformanceTrend
 */
interface PerformanceTrend {
  direction: 'IMPROVING' | 'STABLE' | 'DECLINING';
  changeRate: number; // Percentage change
  period: string; // e.g., "YoY", "QoQ"
}

/**
 * DataQualityMetrics
 */
interface DataQualityMetrics {
  completeness: number; // 0-100%
  accuracy: 'HIGH' | 'MEDIUM' | 'LOW';
  timeliness: 'CURRENT' | 'RECENT' | 'OUTDATED';
  lastUpdated: Date;
}
```

---

## API Specification

### REST Endpoints

#### Rating Management

```typescript
/**
 * POST /api/v1/rating/calculate
 * Calculate ESG rating for organization
 */
interface CalculateRatingRequest {
  organizationId: string;
  projectId?: string;
  methodologyId: string;
  reportingPeriod: ReportingPeriod;
  options?: {
    includeMaterialityWeighting?: boolean;
    includeControversyAdjustment?: boolean;
    customWeights?: {
      environmental: number;
      social: number;
      governance: number;
    };
  };
}

interface CalculateRatingResponse {
  success: true;
  data: {
    rating: ESGRating;
    scoreCard: ScoreCard;
    calculationTime: number; // milliseconds
    warnings: string[];
  };
}

/**
 * GET /api/v1/rating/:id
 * Get rating by ID
 */
interface GetRatingResponse {
  success: true;
  data: {
    rating: ESGRating;
    scoreCard: ScoreCard;
    peerRanking?: PeerRanking;
  };
}

/**
 * GET /api/v1/rating/organization/:organizationId/current
 * Get current rating for organization
 */
interface GetCurrentRatingRequest {
  organizationId: string;
  methodologyId?: string; // Optional filter
}

interface GetCurrentRatingResponse {
  success: true;
  data: {
    rating: ESGRating;
    scoreCard: ScoreCard;
    history: Array<{
      period: ReportingPeriod;
      rating: Rating;
      score: number;
      change: number;
    }>;
  };
}

/**
 * GET /api/v1/rating/organization/:organizationId/history
 * Get rating history
 */
interface GetRatingHistoryRequest {
  organizationId: string;
  startDate?: Date;
  endDate?: Date;
  methodologyId?: string;
}

interface GetRatingHistoryResponse {
  success: true;
  data: {
    ratings: ESGRating[];
    trend: PerformanceTrend;
    chartData: Array<{
      period: string;
      overallScore: number;
      environmentalScore: number;
      socialScore: number;
      governanceScore: number;
    }>;
  };
}

/**
 * PUT /api/v1/rating/:id/publish
 * Publish rating (make visible to stakeholders)
 */
interface PublishRatingRequest {
  id: string;
  publishDate?: Date;
  expiryDate?: Date;
}

interface PublishRatingResponse {
  success: true;
  data: {
    rating: ESGRating;
    publishedAt: Date;
  };
}
```

#### Score Management

```typescript
/**
 * GET /api/v1/rating/:ratingId/scorecard
 * Get detailed score breakdown
 */
interface GetScoreCardResponse {
  success: true;
  data: {
    scoreCard: ScoreCard;
    improvementOpportunities: Array<{
      component: string;
      currentScore: number;
      industryAverage: number;
      topQuartile: number;
      potentialGain: number;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
  };
}

/**
 * GET /api/v1/rating/:ratingId/component-scores
 * Get component-level scores
 */
interface GetComponentScoresResponse {
  success: true;
  data: {
    environmental: ComponentScore[];
    social: ComponentScore[];
    governance: ComponentScore[];
  };
}
```

#### Methodology Management

```typescript
/**
 * GET /api/v1/rating/methodologies
 * List available rating methodologies
 */
interface ListMethodologiesRequest {
  type?: 'MSCI_STYLE' | 'CDP' | 'SUSTAINALYTICS' | 'CUSTOM';
  status?: 'ACTIVE' | 'DEPRECATED';
  isPublic?: boolean;
}

interface ListMethodologiesResponse {
  success: true;
  data: {
    methodologies: RatingMethodology[];
    total: number;
  };
}

/**
 * GET /api/v1/rating/methodologies/:id
 * Get methodology details
 */
interface GetMethodologyResponse {
  success: true;
  data: {
    methodology: RatingMethodology;
  };
}

/**
 * POST /api/v1/rating/methodologies
 * Create custom methodology
 */
interface CreateMethodologyRequest {
  name: string;
  description: string;
  basedOn?: string; // Base methodology ID
  scoringModel: RatingMethodology['scoringModel'];
  ratingScale: RatingMethodology['ratingScale'];
  dataRequirements: RatingMethodology['dataRequirements'];
}

interface CreateMethodologyResponse {
  success: true;
  data: {
    methodology: RatingMethodology;
  };
}

/**
 * PUT /api/v1/rating/methodologies/:id
 * Update methodology (creates new version)
 */
interface UpdateMethodologyRequest {
  scoringModel?: Partial<RatingMethodology['scoringModel']>;
  ratingScale?: Partial<RatingMethodology['ratingScale']>;
  dataRequirements?: Partial<RatingMethodology['dataRequirements']>;
}

interface UpdateMethodologyResponse {
  success: true;
  data: {
    methodology: RatingMethodology;
    previousVersion: string;
  };
}
```

#### Peer Ranking

```typescript
/**
 * POST /api/v1/rating/ranking/generate
 * Generate peer ranking
 */
interface GenerateRankingRequest {
  organizationId: string;
  ratingId: string;
  rankingType: 'INDUSTRY' | 'SECTOR' | 'REGION' | 'SIZE_COHORT';
  industryCode?: string;
  sectorName?: string;
  region?: string;
  cohortCriteria?: Record<string, any>;
}

interface GenerateRankingResponse {
  success: true;
  data: {
    ranking: PeerRanking;
    peerCount: number;
  };
}

/**
 * GET /api/v1/rating/ranking/organization/:organizationId
 * Get organization peer rankings
 */
interface GetRankingResponse {
  success: true;
  data: {
    rankings: PeerRanking[];
    summary: {
      bestRanking: RankingPosition;
      worstRanking: RankingPosition;
      averagePercentile: number;
    };
  };
}

/**
 * GET /api/v1/rating/ranking/:rankingId/peers
 * Get peer details for ranking
 */
interface GetRankingPeersResponse {
  success: true;
  data: {
    ranking: PeerRanking;
    peers: Array<{
      organizationId: string;
      organizationName: string;
      rank: number;
      score: number;
      rating: Rating;
      isCurrentOrganization: boolean;
    }>;
  };
}
```

#### Controversy Management

```typescript
/**
 * POST /api/v1/rating/controversies
 * Record ESG controversy
 */
interface RecordControversyRequest {
  organizationId: string;
  title: string;
  description: string;
  category: 'ENVIRONMENTAL' | 'SOCIAL' | 'GOVERNANCE';
  subcategory: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  incidentDate: Date;
  sources: Controversy['sources'];
  tags?: string[];
}

interface RecordControversyResponse {
  success: true;
  data: {
    controversy: Controversy;
    ratingImpact: {
      affectedRatings: string[];
      estimatedScoreImpact: number;
    };
  };
}

/**
 * GET /api/v1/rating/controversies/organization/:organizationId
 * Get organization controversies
 */
interface GetControversiesRequest {
  organizationId: string;
  status?: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  category?: 'ENVIRONMENTAL' | 'SOCIAL' | 'GOVERNANCE';
  severityMin?: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
}

interface GetControversiesResponse {
  success: true;
  data: {
    controversies: Controversy[];
    summary: {
      total: number;
      active: number;
      resolved: number;
      totalScoreImpact: number;
    };
  };
}

/**
 * PUT /api/v1/rating/controversies/:id/resolve
 * Mark controversy as resolved
 */
interface ResolveControversyRequest {
  id: string;
  resolvedDate: Date;
  resolutionDescription: string;
  organizationResponse?: Controversy['organizationResponse'];
}

interface ResolveControversyResponse {
  success: true;
  data: {
    controversy: Controversy;
    ratingImpact: {
      scoreRecovery: number;
      affectedRatings: string[];
    };
  };
}
```

#### Rating Simulation

```typescript
/**
 * POST /api/v1/rating/simulations
 * Create rating improvement simulation
 */
interface CreateSimulationRequest {
  organizationId: string;
  baseRatingId: string;
  name: string;
  description: string;
  scenarioType: 'IMPROVEMENT_PLAN' | 'CONTROVERSY_RESOLUTION' | 'WEIGHT_CHANGE';
  assumptions: RatingSimulation['assumptions'];
  weightAdjustments?: {
    environmental: number;
    social: number;
    governance: number;
  };
}

interface CreateSimulationResponse {
  success: true;
  data: {
    simulation: RatingSimulation;
    comparison: {
      currentRating: Rating;
      simulatedRating: Rating;
      improvement: {
        ratingLevels: number;
        scorePoints: number;
        percentileGain: number;
      };
    };
  };
}

/**
 * GET /api/v1/rating/simulations/:id
 * Get simulation details
 */
interface GetSimulationResponse {
  success: true;
  data: {
    simulation: RatingSimulation;
    chartData: {
      componentImpacts: Array<{
        component: string;
        currentScore: number;
        simulatedScore: number;
        improvement: number;
      }>;
    };
  };
}

/**
 * GET /api/v1/rating/simulations/organization/:organizationId
 * List organization simulations
 */
interface ListSimulationsResponse {
  success: true;
  data: {
    simulations: RatingSimulation[];
    total: number;
  };
}

/**
 * PUT /api/v1/rating/simulations/:id/implement
 * Mark simulation as being implemented
 */
interface ImplementSimulationRequest {
  id: string;
  implementationPlan: RatingSimulation['implementationPlan'];
  investmentEstimate?: RatingSimulation['investmentEstimate'];
}

interface ImplementSimulationResponse {
  success: true;
  data: {
    simulation: RatingSimulation;
    status: 'ACTIVE';
  };
}
```

#### Analytics & Reporting

```typescript
/**
 * GET /api/v1/rating/analytics/trends
 * Get rating trends across organizations
 */
interface GetRatingTrendsRequest {
  industryCode?: string;
  region?: string;
  startDate: Date;
  endDate: Date;
  groupBy: 'MONTH' | 'QUARTER' | 'YEAR';
}

interface GetRatingTrendsResponse {
  success: true;
  data: {
    trends: Array<{
      period: string;
      averageScore: number;
      medianScore: number;
      topQuartile: number;
      bottomQuartile: number;
      ratingDistribution: Record<string, number>; // AAA -> count
    }>;
  };
}

/**
 * GET /api/v1/rating/analytics/improvement-opportunities
 * Get improvement opportunities for organization
 */
interface GetImprovementOpportunitiesRequest {
  organizationId: string;
  ratingId: string;
}

interface GetImprovementOpportunitiesResponse {
  success: true;
  data: {
    opportunities: Array<{
      component: string;
      pillar: 'ENVIRONMENTAL' | 'SOCIAL' | 'GOVERNANCE';
      currentScore: number;
      industryAverage: number;
      topQuartile: number;
      gap: number;
      potentialScoreGain: number;
      potentialRatingGain: number;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      recommendations: string[];
      estimatedEffort: 'LOW' | 'MEDIUM' | 'HIGH';
      estimatedCost?: string;
    }>;
    totalPotentialGain: number;
    quickWins: Array<any>; // High impact, low effort
  };
}

/**
 * GET /api/v1/rating/export/:ratingId
 * Export rating report
 */
interface ExportRatingRequest {
  ratingId: string;
  format: 'PDF' | 'EXCEL' | 'JSON';
  includeScoreCard: boolean;
  includePeerRanking: boolean;
  includeControversies: boolean;
}

interface ExportRatingResponse {
  success: true;
  data: {
    downloadUrl: string;
    expiresAt: Date;
  };
}
```

---

## Event Contracts

### Published Events

```typescript
/**
 * rating.calculated.v1
 * Published when ESG rating is calculated
 */
interface RatingCalculatedEvent {
  eventId: string;
  eventType: 'rating.calculated.v1';
  timestamp: Date;
  source: 'rating-service';

  data: {
    ratingId: string;
    organizationId: string;
    projectId?: string;

    overallRating: Rating;
    overallScore: number;

    previousRating?: Rating;
    previousScore?: number;

    ratingChange?: 'UPGRADE' | 'DOWNGRADE' | 'STABLE';
    scoreChange: number;

    methodologyId: string;
    methodologyName: string;

    reportingPeriod: ReportingPeriod;
    calculatedAt: Date;
  };

  metadata: {
    correlationId: string;
    causationId: string;
    userId?: string;
  };
}

/**
 * rating.published.v1
 * Published when rating is made public
 */
interface RatingPublishedEvent {
  eventId: string;
  eventType: 'rating.published.v1';
  timestamp: Date;
  source: 'rating-service';

  data: {
    ratingId: string;
    organizationId: string;
    overallRating: Rating;
    overallScore: number;
    publishedAt: Date;
    expiryDate?: Date;
  };

  metadata: {
    correlationId: string;
    causationId: string;
    userId?: string;
  };
}

/**
 * rating.upgraded.v1
 * Published when rating improves
 */
interface RatingUpgradedEvent {
  eventId: string;
  eventType: 'rating.upgraded.v1';
  timestamp: Date;
  source: 'rating-service';

  data: {
    ratingId: string;
    organizationId: string;

    previousRating: Rating;
    newRating: Rating;
    levelsImproved: number;

    previousScore: number;
    newScore: number;
    scoreIncrease: number;

    reportingPeriod: ReportingPeriod;
  };

  metadata: {
    correlationId: string;
    causationId: string;
    userId?: string;
  };
}

/**
 * rating.downgraded.v1
 * Published when rating declines
 */
interface RatingDowngradedEvent {
  eventId: string;
  eventType: 'rating.downgraded.v1';
  timestamp: Date;
  source: 'rating-service';

  data: {
    ratingId: string;
    organizationId: string;

    previousRating: Rating;
    newRating: Rating;
    levelsDeclined: number;

    previousScore: number;
    newScore: number;
    scoreDecrease: number;

    reasons: string[]; // e.g., ["Controversy impact", "Performance decline"]
    reportingPeriod: ReportingPeriod;
  };

  metadata: {
    correlationId: string;
    causationId: string;
    userId?: string;
  };
}

/**
 * controversy.recorded.v1
 * Published when controversy is recorded
 */
interface ControversyRecordedEvent {
  eventId: string;
  eventType: 'controversy.recorded.v1';
  timestamp: Date;
  source: 'rating-service';

  data: {
    controversyId: string;
    organizationId: string;
    projectId?: string;

    title: string;
    category: 'ENVIRONMENTAL' | 'SOCIAL' | 'GOVERNANCE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';

    incidentDate: Date;
    scoreImpact: number;

    affectedPillars: Array<'ENVIRONMENTAL' | 'SOCIAL' | 'GOVERNANCE'>;
  };

  metadata: {
    correlationId: string;
    causationId: string;
    userId?: string;
  };
}

/**
 * controversy.resolved.v1
 * Published when controversy is resolved
 */
interface ControversyResolvedEvent {
  eventId: string;
  eventType: 'controversy.resolved.v1';
  timestamp: Date;
  source: 'rating-service';

  data: {
    controversyId: string;
    organizationId: string;

    resolvedDate: Date;
    resolutionDescription: string;

    scoreRecovery: number;
    affectedRatings: string[];
  };

  metadata: {
    correlationId: string;
    causationId: string;
    userId?: string;
  };
}

/**
 * ranking.generated.v1
 * Published when peer ranking is generated
 */
interface RankingGeneratedEvent {
  eventId: string;
  eventType: 'ranking.generated.v1';
  timestamp: Date;
  source: 'rating-service';

  data: {
    rankingId: string;
    organizationId: string;

    rankingType: 'INDUSTRY' | 'SECTOR' | 'REGION' | 'SIZE_COHORT';
    overallRank: number;
    totalPeers: number;
    percentile: number;
    quartile: 1 | 2 | 3 | 4;

    reportingPeriod: ReportingPeriod;
  };

  metadata: {
    correlationId: string;
    causationId: string;
    userId?: string;
  };
}

/**
 * simulation.created.v1
 * Published when rating simulation is created
 */
interface SimulationCreatedEvent {
  eventId: string;
  eventType: 'simulation.created.v1';
  timestamp: Date;
  source: 'rating-service';

  data: {
    simulationId: string;
    organizationId: string;

    scenarioType: string;
    currentRating: Rating;
    simulatedRating: Rating;
    potentialImprovement: number;
  };

  metadata: {
    correlationId: string;
    causationId: string;
    userId?: string;
  };
}
```

### Consumed Events

```typescript
/**
 * materiality.assessment-completed.v1
 * From Materiality Service - use for materiality weighting
 */
interface MaterialityAssessmentCompletedEvent {
  eventId: string;
  eventType: 'materiality.assessment-completed.v1';
  data: {
    assessmentId: string;
    organizationId: string;
    materialIssues: Array<{
      issueId: string;
      issueName: string;
      materialityScore: number;
    }>;
  };
}
// Handler: Update rating calculations with materiality weights

/**
 * analytics.performance-calculated.v1
 * From Analytics Service - use performance data for scoring
 */
interface PerformanceCalculatedEvent {
  eventId: string;
  eventType: 'analytics.performance-calculated.v1';
  data: {
    organizationId: string;
    performanceMetrics: Record<string, number>;
    reportingPeriod: ReportingPeriod;
  };
}
// Handler: Calculate component scores from performance metrics

/**
 * benchmark.peer-data-updated.v1
 * From Benchmark Service - update peer statistics
 */
interface PeerDataUpdatedEvent {
  eventId: string;
  eventType: 'benchmark.peer-data-updated.v1';
  data: {
    industryCode: string;
    peerStatistics: {
      averageScore: number;
      medianScore: number;
      topQuartile: number;
    };
  };
}
// Handler: Update peer comparison data in ratings

/**
 * reporting.report-published.v1
 * From Reporting Service - trigger rating calculation
 */
interface ReportPublishedEvent {
  eventId: string;
  eventType: 'reporting.report-published.v1';
  data: {
    reportId: string;
    organizationId: string;
    reportingPeriod: ReportingPeriod;
    framework: string;
  };
}
// Handler: Calculate rating based on reported data
```

---

## Data Architecture

### MongoDB Collections

#### 1. ratings Collection

```typescript
/**
 * ratings - ESG ratings
 */
{
  _id: ObjectId,
  id: string, // UUID
  organizationId: string,
  projectId?: string,

  overallRating: {
    letter: string,
    numeric: number,
    outlook: string
  },
  environmentalRating: { /* ... */ },
  socialRating: { /* ... */ },
  governanceRating: { /* ... */ },

  overallScore: number,
  environmentalScore: number,
  socialScore: number,
  governanceScore: number,

  weights: {
    environmental: number,
    social: number,
    governance: number
  },

  methodologyId: string,
  methodologyName: string,
  methodologyVersion: string,

  industryAverage: number,
  percentile: number,
  rank?: number,
  totalCompanies?: number,

  materialityWeighted: boolean,
  materialityAssessmentId?: string,

  controversyAdjustment: number,
  activeControversies: number,

  reportingPeriod: {
    year: number,
    quarter?: number,
    startDate: Date,
    endDate: Date
  },

  calculatedAt: Date,
  validUntil: Date,

  previousRating?: { /* ... */ },
  ratingChange?: string,
  scoreChange: number,

  status: string,
  calculationMetadata: {
    dataCompleteness: number,
    dataSources: string[],
    calculationDuration: number,
    warnings: string[]
  },

  createdAt: Date,
  updatedAt: Date,
  createdBy: string,
  version: number,

  // Indexes
  indexes: [
    { organizationId: 1, reportingPeriod.year: -1 },
    { organizationId: 1, status: 1, calculatedAt: -1 },
    { methodologyId: 1, calculatedAt: -1 },
    { overallRating.numeric: 1, industryAverage: 1 }
  ]
}
```

#### 2. scorecards Collection

```typescript
/**
 * scorecards - Detailed score breakdowns
 */
{
  _id: ObjectId,
  id: string,
  ratingId: string,
  organizationId: string,

  environmental: {
    overallScore: number,
    components: {
      carbonEmissions: {
        score: number,
        weight: number,
        dataQuality: string,
        dataCompleteness: number,
        trend: string,
        industryAverage?: number,
        bestInClass?: number
      },
      // ... other components
    },
    weight: number
  },

  social: { /* similar structure */ },
  governance: { /* similar structure */ },

  materialityAdjustments?: {
    appliedIssues: Array<{
      issueId: string,
      issueName: string,
      materialityScore: number,
      weightAdjustment: number
    }>,
    totalAdjustment: number
  },

  controversyImpacts?: Array<{
    controversyId: string,
    category: string,
    severity: string,
    scoreImpact: number
  }>,

  peerComparison?: {
    industryAverage: number,
    topQuartile: number,
    median: number,
    bottomQuartile: number,
    organizationPosition: string
  },

  calculatedAt: Date,
  methodologyId: string,

  // Indexes
  indexes: [
    { ratingId: 1 },
    { organizationId: 1, calculatedAt: -1 }
  ]
}
```

#### 3. methodologies Collection

```typescript
/**
 * methodologies - Rating methodologies
 */
{
  _id: ObjectId,
  id: string,
  name: string,
  type: string, // MSCI_STYLE, CDP, SUSTAINALYTICS, CUSTOM
  version: string,

  description: string,
  source?: string,

  scoringModel: {
    pillarWeights: {
      environmental: number,
      social: number,
      governance: number
    },
    environmentalComponents: { /* ... */ },
    socialComponents: { /* ... */ },
    governanceComponents: { /* ... */ },
    materialityWeighted: boolean,
    materialitySource?: string,
    controversyImpact: {
      enabled: boolean,
      severityMultipliers: { /* ... */ },
      maxAdjustment: number,
      decayPeriod: number
    }
  },

  ratingScale: {
    AAA: { min: number, max: number },
    AA: { /* ... */ },
    // ... other ratings
  },

  dataRequirements: {
    requiredMetrics: string[],
    optionalMetrics: string[],
    minimumDataCompleteness: number
  },

  industryAdjustments?: {
    enabled: boolean,
    adjustmentFactors: Record<string, number>
  },

  status: string,
  effectiveFrom: Date,
  effectiveUntil?: Date,

  isPublic: boolean,
  organizationId?: string,

  createdAt: Date,
  updatedAt: Date,
  createdBy: string,
  version: number,

  // Indexes
  indexes: [
    { type: 1, status: 1 },
    { organizationId: 1, status: 1 },
    { name: 'text' }
  ]
}
```

#### 4. rankings Collection

```typescript
/**
 * rankings - Peer rankings
 */
{
  _id: ObjectId,
  id: string,
  organizationId: string,

  rankingType: string, // INDUSTRY, SECTOR, REGION, etc.
  industryCode?: string,
  sectorName?: string,
  region?: string,
  cohortCriteria?: object,

  overallRanking: {
    rank: number,
    percentile: number,
    quartile: number,
    score: number,
    rating: { /* ... */ }
  },
  environmentalRanking: { /* ... */ },
  socialRanking: { /* ... */ },
  governanceRanking: { /* ... */ },

  peerStatistics: {
    totalPeers: number,
    averageScore: number,
    medianScore: number,
    topQuartileThreshold: number,
    bottomQuartileThreshold: number,
    standardDeviation: number
  },

  scoreDistribution: Array<{
    bucket: string,
    count: number,
    percentage: number
  }>,

  topPerformers?: Array<{
    organizationId: string,
    organizationName: string,
    score: number,
    rating: object,
    rank: number
  }>,

  gapAnalysis: {
    gapToLeader: number,
    gapToTopQuartile: number,
    gapToAverage: number
  },

  reportingPeriod: {
    year: number,
    quarter?: number,
    startDate: Date,
    endDate: Date
  },

  calculatedAt: Date,
  methodologyId: string,

  status: string,
  createdAt: Date,
  updatedAt: Date,

  // Indexes
  indexes: [
    { organizationId: 1, rankingType: 1, reportingPeriod.year: -1 },
    { industryCode: 1, reportingPeriod.year: -1 },
    { rankingType: 1, calculatedAt: -1 }
  ]
}
```

#### 5. controversies Collection

```typescript
/**
 * controversies - ESG controversies
 */
{
  _id: ObjectId,
  id: string,
  organizationId: string,
  projectId?: string,

  title: string,
  description: string,
  category: string, // ENVIRONMENTAL, SOCIAL, GOVERNANCE
  subcategory: string,

  severity: string, // LOW, MEDIUM, HIGH, SEVERE
  severityScore: number,

  incidentDate: Date,
  discoveredDate: Date,
  resolvedDate?: Date,
  status: string, // ACTIVE, INVESTIGATING, RESOLVED, DISMISSED

  sources: Array<{
    type: string,
    name: string,
    url?: string,
    publishedDate: Date
  }>,

  ratingImpact: {
    scoreAdjustment: number,
    ratingDowngrade: number,
    affectedPillars: string[],
    impactStartDate: Date,
    impactEndDate?: Date
  },

  organizationResponse?: {
    responseDate: Date,
    responseType: string,
    responseDescription: string,
    remediationPlan?: string,
    estimatedResolutionDate?: Date
  },

  financialImpact?: {
    estimatedCost: number,
    currency: string,
    finesPayments?: number,
    settlementAmount?: number,
    legalCosts?: number
  },

  stakeholderImpact?: {
    affectedStakeholders: string[],
    numberOfPeopleAffected?: number,
    environmentalDamage?: string
  },

  regulatoryActions?: Array<{
    agency: string,
    actionType: string,
    actionDate: Date,
    outcome?: string
  }>,

  tags: string[],

  createdAt: Date,
  updatedAt: Date,
  createdBy: string,
  version: number,

  // Indexes
  indexes: [
    { organizationId: 1, status: 1, incidentDate: -1 },
    { category: 1, severity: 1 },
    { tags: 1 },
    { incidentDate: -1 }
  ]
}
```

#### 6. simulations Collection

```typescript
/**
 * simulations - Rating simulations
 */
{
  _id: ObjectId,
  id: string,
  organizationId: string,
  baseRatingId: string,

  name: string,
  description: string,
  scenarioType: string,

  assumptions: Array<{
    category: string,
    component: string,
    currentScore: number,
    targetScore: number,
    improvementPercentage: number,
    timeframe: string,
    rationale: string
  }>,

  weightAdjustments?: {
    environmental: number,
    social: number,
    governance: number
  },

  simulatedRating: {
    overallRating: { /* ... */ },
    overallScore: number,
    environmentalRating: { /* ... */ },
    environmentalScore: number,
    socialRating: { /* ... */ },
    socialScore: number,
    governanceRating: { /* ... */ },
    governanceScore: number
  },

  comparison: {
    currentRating: { /* ... */ },
    simulatedRating: { /* ... */ },
    ratingChange: number,
    scoreChange: number,
    percentileChange: number,
    rankChange?: number
  },

  investmentEstimate?: {
    totalCost: number,
    currency: string,
    breakdown: Array<{
      initiative: string,
      cost: number,
      expectedImpact: number
    }>,
    roi?: number
  },

  implementationPlan?: Array<{
    phase: string,
    duration: string,
    milestones: string[],
    expectedScoreIncrease: number
  }>,

  status: string,

  createdAt: Date,
  updatedAt: Date,
  createdBy: string,
  version: number,

  // Indexes
  indexes: [
    { organizationId: 1, status: 1, createdAt: -1 },
    { baseRatingId: 1 },
    { scenarioType: 1 }
  ]
}
```

### ClickHouse Tables (Analytics)

```sql
-- rating_calculations - Rating calculation history
CREATE TABLE rating_calculations (
  calculation_id String,
  rating_id String,
  organization_id String,

  overall_score Float64,
  environmental_score Float64,
  social_score Float64,
  governance_score Float64,

  methodology_id String,
  methodology_type String,

  calculation_time_ms UInt32,
  data_completeness Float64,

  reporting_year UInt16,
  reporting_quarter UInt8,

  calculated_at DateTime,

  INDEX idx_org_date (organization_id, calculated_at) TYPE minmax GRANULARITY 3
) ENGINE = MergeTree()
ORDER BY (organization_id, calculated_at);

-- score_trends - Component score trends
CREATE TABLE score_trends (
  organization_id String,
  component_name String,
  pillar String, -- ENVIRONMENTAL, SOCIAL, GOVERNANCE

  score Float64,
  weight Float64,

  period_year UInt16,
  period_quarter UInt8,

  industry_average Float64,
  percentile Float64,

  recorded_at DateTime,

  INDEX idx_org_component (organization_id, component_name) TYPE bloom_filter GRANULARITY 1
) ENGINE = MergeTree()
ORDER BY (organization_id, component_name, recorded_at);

-- controversy_impacts - Controversy impact tracking
CREATE TABLE controversy_impacts (
  controversy_id String,
  organization_id String,

  category String,
  severity String,

  score_impact Float64,
  affected_pillars Array(String),

  incident_date Date,
  impact_start_date Date,
  impact_end_date Nullable(Date),

  recorded_at DateTime
) ENGINE = MergeTree()
ORDER BY (organization_id, incident_date);

-- peer_rankings - Ranking history
CREATE TABLE peer_rankings (
  ranking_id String,
  organization_id String,
  ranking_type String,

  overall_rank UInt32,
  overall_percentile Float64,
  overall_score Float64,

  total_peers UInt32,
  industry_code String,

  period_year UInt16,
  period_quarter UInt8,

  calculated_at DateTime
) ENGINE = MergeTree()
ORDER BY (organization_id, ranking_type, calculated_at);
```

### Redis Cache Structure

```typescript
/**
 * Redis Cache Keys
 */

// Current rating cache (1 hour TTL)
`rating:current:${organizationId}:${methodologyId}` -> ESGRating (JSON)

// Score card cache (1 hour TTL)
`rating:scorecard:${ratingId}` -> ScoreCard (JSON)

// Peer ranking cache (4 hours TTL)
`rating:ranking:${organizationId}:${rankingType}` -> PeerRanking (JSON)

// Methodology cache (24 hours TTL)
`rating:methodology:${methodologyId}` -> RatingMethodology (JSON)

// Industry statistics cache (6 hours TTL)
`rating:industry:stats:${industryCode}` -> PeerStatistics (JSON)

// Rating calculation lock (prevent duplicate calculations)
`rating:lock:${organizationId}:${period}` -> 1 (60 second TTL)

// Controversy count cache (1 hour TTL)
`rating:controversies:count:${organizationId}` -> number
```

---

## Business Logic

### Core Business Rules

#### 1. ESG Score Calculation

```typescript
/**
 * ESG Score Calculation Algorithm
 */
class ScoreCalculationService {
  /**
   * Calculate overall ESG score
   */
  async calculateESGScore(
    organizationId: string,
    methodologyId: string,
    reportingPeriod: ReportingPeriod,
    options?: {
      includeMaterialityWeighting?: boolean;
      includeControversyAdjustment?: boolean;
      customWeights?: { environmental: number; social: number; governance: number };
    }
  ): Promise<{ rating: ESGRating; scoreCard: ScoreCard }> {

    // Step 1: Get methodology
    const methodology = await this.getMethodology(methodologyId);

    // Step 2: Calculate pillar scores
    const environmentalScore = await this.calculatePillarScore(
      organizationId,
      'ENVIRONMENTAL',
      methodology,
      reportingPeriod
    );

    const socialScore = await this.calculatePillarScore(
      organizationId,
      'SOCIAL',
      methodology,
      reportingPeriod
    );

    const governanceScore = await this.calculatePillarScore(
      organizationId,
      'GOVERNANCE',
      methodology,
      reportingPeriod
    );

    // Step 3: Apply pillar weights
    let weights = options?.customWeights || methodology.scoringModel.pillarWeights;

    // Step 4: Apply materiality weighting (if enabled)
    if (options?.includeMaterialityWeighting && methodology.scoringModel.materialityWeighted) {
      weights = await this.applyMaterialityWeights(organizationId, weights);
    }

    // Step 5: Calculate weighted overall score
    let overallScore =
      (environmentalScore * weights.environmental / 100) +
      (socialScore * weights.social / 100) +
      (governanceScore * weights.governance / 100);

    // Step 6: Apply controversy adjustment (if enabled)
    let controversyAdjustment = 0;
    if (options?.includeControversyAdjustment) {
      controversyAdjustment = await this.calculateControversyAdjustment(
        organizationId,
        methodology,
        reportingPeriod
      );
      overallScore = Math.max(0, overallScore + controversyAdjustment);
    }

    // Step 7: Convert score to rating
    const overallRating = this.scoreToRating(overallScore, methodology.ratingScale);
    const environmentalRating = this.scoreToRating(environmentalScore, methodology.ratingScale);
    const socialRating = this.scoreToRating(socialScore, methodology.ratingScale);
    const governanceRating = this.scoreToRating(governanceScore, methodology.ratingScale);

    // Step 8: Get industry context
    const industryAverage = await this.getIndustryAverage(organizationId, methodologyId);
    const percentile = await this.calculatePercentile(organizationId, overallScore, industryAverage);

    // Step 9: Build rating
    const rating: ESGRating = {
      id: uuidv4(),
      organizationId,
      overallRating,
      environmentalRating,
      socialRating,
      governanceRating,
      overallScore,
      environmentalScore,
      socialScore,
      governanceScore,
      weights,
      methodologyId,
      methodologyName: methodology.name,
      methodologyVersion: methodology.version,
      industryAverage,
      percentile,
      materialityWeighted: options?.includeMaterialityWeighting || false,
      controversyAdjustment,
      reportingPeriod,
      calculatedAt: new Date(),
      validUntil: this.calculateValidUntil(reportingPeriod),
      status: 'CALCULATED',
      calculationMetadata: {
        dataCompleteness: await this.calculateDataCompleteness(organizationId, methodology),
        dataSources: await this.getDataSources(organizationId),
        calculationDuration: Date.now() - startTime,
        warnings: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      version: 1
    };

    // Step 10: Build score card
    const scoreCard = await this.buildScoreCard(
      rating,
      methodology,
      { environmental: environmentalScore, social: socialScore, governance: governanceScore }
    );

    return { rating, scoreCard };
  }

  /**
   * Calculate pillar score (Environmental, Social, or Governance)
   */
  private async calculatePillarScore(
    organizationId: string,
    pillar: 'ENVIRONMENTAL' | 'SOCIAL' | 'GOVERNANCE',
    methodology: RatingMethodology,
    reportingPeriod: ReportingPeriod
  ): Promise<number> {

    const componentWeights = this.getComponentWeights(pillar, methodology);
    let weightedScore = 0;
    let totalWeight = 0;

    for (const [componentName, config] of Object.entries(componentWeights)) {
      // Get component performance data
      const componentScore = await this.getComponentScore(
        organizationId,
        pillar,
        componentName,
        reportingPeriod
      );

      if (componentScore !== null || !config.required) {
        const score = componentScore || 0; // Use 0 for missing optional components
        weightedScore += score * config.weight;
        totalWeight += config.weight;
      }
    }

    // Normalize to 0-100 scale
    return totalWeight > 0 ? (weightedScore / totalWeight) : 0;
  }

  /**
   * Get component score from performance data
   */
  private async getComponentScore(
    organizationId: string,
    pillar: string,
    componentName: string,
    reportingPeriod: ReportingPeriod
  ): Promise<number | null> {

    // Get performance metrics from Analytics Service
    const metrics = await this.analyticsService.getPerformanceMetrics(
      organizationId,
      reportingPeriod
    );

    // Map component to metrics and calculate score
    const componentMetrics = this.mapComponentToMetrics(pillar, componentName);
    const rawScore = this.calculateComponentRawScore(metrics, componentMetrics);

    // Normalize to 0-100 scale
    return this.normalizeScore(rawScore, componentMetrics.normalizationMethod);
  }

  /**
   * Convert numeric score to rating letter
   */
  private scoreToRating(score: number, ratingScale: RatingMethodology['ratingScale']): Rating {
    for (const [letter, range] of Object.entries(ratingScale)) {
      if (score >= range.min && score <= range.max) {
        return {
          letter: letter as Rating['letter'],
          numeric: this.letterToNumeric(letter),
          outlook: 'STABLE' // Default outlook
        };
      }
    }
    return { letter: 'CCC', numeric: 1, outlook: 'NEGATIVE' };
  }
}
```

#### 2. Controversy Impact Calculation

```typescript
/**
 * Controversy Impact Service
 */
class ControversyImpactService {
  /**
   * Calculate total controversy adjustment to rating
   */
  async calculateControversyAdjustment(
    organizationId: string,
    methodology: RatingMethodology,
    reportingPeriod: ReportingPeriod
  ): Promise<number> {

    if (!methodology.scoringModel.controversyImpact.enabled) {
      return 0;
    }

    // Get active controversies within impact period
    const controversies = await this.getActiveControversies(organizationId, reportingPeriod);

    let totalAdjustment = 0;

    for (const controversy of controversies) {
      // Calculate base impact from severity
      const severityMultiplier =
        methodology.scoringModel.controversyImpact.severityMultipliers[controversy.severity];

      const baseImpact = controversy.severityScore * severityMultiplier;

      // Apply time decay (impact fades over time)
      const monthsSinceIncident = this.getMonthsDifference(
        controversy.incidentDate,
        new Date()
      );

      const decayFactor = Math.max(
        0,
        1 - (monthsSinceIncident / methodology.scoringModel.controversyImpact.decayPeriod)
      );

      const adjustedImpact = baseImpact * decayFactor;

      totalAdjustment += adjustedImpact;
    }

    // Cap adjustment at maximum
    const maxAdjustment = methodology.scoringModel.controversyImpact.maxAdjustment;
    return -Math.min(totalAdjustment, maxAdjustment); // Negative adjustment
  }

  /**
   * Assess controversy severity automatically
   */
  async assessControversySeverity(controversy: Partial<Controversy>): Promise<{
    severity: Controversy['severity'];
    severityScore: number;
  }> {

    let score = 0;

    // Financial impact (0-30 points)
    if (controversy.financialImpact) {
      const cost = controversy.financialImpact.estimatedCost;
      if (cost > 100_000_000) score += 30;
      else if (cost > 10_000_000) score += 20;
      else if (cost > 1_000_000) score += 10;
      else score += 5;
    }

    // Stakeholder impact (0-30 points)
    if (controversy.stakeholderImpact) {
      const affected = controversy.stakeholderImpact.numberOfPeopleAffected || 0;
      if (affected > 10000) score += 30;
      else if (affected > 1000) score += 20;
      else if (affected > 100) score += 10;
      else score += 5;
    }

    // Regulatory action (0-25 points)
    if (controversy.regulatoryActions && controversy.regulatoryActions.length > 0) {
      const hasLawsuit = controversy.regulatoryActions.some(a => a.actionType === 'LAWSUIT');
      const hasFine = controversy.regulatoryActions.some(a => a.actionType === 'FINE');
      if (hasLawsuit) score += 25;
      else if (hasFine) score += 15;
      else score += 5;
    }

    // Media coverage (0-15 points)
    if (controversy.sources) {
      const newsCount = controversy.sources.filter(s => s.type === 'NEWS').length;
      if (newsCount > 10) score += 15;
      else if (newsCount > 5) score += 10;
      else if (newsCount > 0) score += 5;
    }

    // Determine severity level
    let severity: Controversy['severity'];
    if (score >= 75) severity = 'SEVERE';
    else if (score >= 50) severity = 'HIGH';
    else if (score >= 25) severity = 'MEDIUM';
    else severity = 'LOW';

    return { severity, severityScore: score };
  }
}
```

#### 3. Peer Ranking Generation

```typescript
/**
 * Ranking Service
 */
class RankingService {
  /**
   * Generate peer ranking for organization
   */
  async generatePeerRanking(
    organizationId: string,
    ratingId: string,
    rankingType: 'INDUSTRY' | 'SECTOR' | 'REGION' | 'SIZE_COHORT',
    criteria: {
      industryCode?: string;
      sectorName?: string;
      region?: string;
      cohortCriteria?: Record<string, any>;
    }
  ): Promise<PeerRanking> {

    // Step 1: Get organization rating
    const organizationRating = await this.ratingRepository.findById(ratingId);

    // Step 2: Get peer ratings
    const peerRatings = await this.getPeerRatings(rankingType, criteria);

    // Step 3: Calculate rankings
    const overallRanking = this.calculateRanking(
      organizationRating.overallScore,
      peerRatings.map(r => r.overallScore)
    );

    const environmentalRanking = this.calculateRanking(
      organizationRating.environmentalScore,
      peerRatings.map(r => r.environmentalScore)
    );

    const socialRanking = this.calculateRanking(
      organizationRating.socialScore,
      peerRatings.map(r => r.socialScore)
    );

    const governanceRanking = this.calculateRanking(
      organizationRating.governanceScore,
      peerRatings.map(r => r.governanceScore)
    );

    // Step 4: Calculate statistics
    const scores = peerRatings.map(r => r.overallScore);
    const peerStatistics = {
      totalPeers: peerRatings.length,
      averageScore: this.mean(scores),
      medianScore: this.median(scores),
      topQuartileThreshold: this.percentile(scores, 75),
      bottomQuartileThreshold: this.percentile(scores, 25),
      standardDeviation: this.standardDeviation(scores)
    };

    // Step 5: Build distribution
    const scoreDistribution = this.buildScoreDistribution(scores);

    // Step 6: Identify top performers
    const topPerformers = peerRatings
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 10)
      .map((rating, index) => ({
        organizationId: rating.organizationId,
        organizationName: rating.organizationName,
        score: rating.overallScore,
        rating: rating.overallRating,
        rank: index + 1
      }));

    // Step 7: Calculate gaps
    const leader = Math.max(...scores);
    const gapAnalysis = {
      gapToLeader: leader - organizationRating.overallScore,
      gapToTopQuartile: Math.max(0, peerStatistics.topQuartileThreshold - organizationRating.overallScore),
      gapToAverage: peerStatistics.averageScore - organizationRating.overallScore
    };

    // Step 8: Build ranking
    const ranking: PeerRanking = {
      id: uuidv4(),
      organizationId,
      rankingType,
      ...criteria,
      overallRanking,
      environmentalRanking,
      socialRanking,
      governanceRanking,
      peerStatistics,
      scoreDistribution,
      topPerformers,
      gapAnalysis,
      reportingPeriod: organizationRating.reportingPeriod,
      calculatedAt: new Date(),
      methodologyId: organizationRating.methodologyId,
      status: 'PUBLISHED',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return ranking;
  }

  /**
   * Calculate ranking position from score and peer scores
   */
  private calculateRanking(score: number, peerScores: number[]): RankingPosition {
    const sortedScores = peerScores.sort((a, b) => b - a);
    const rank = sortedScores.filter(s => s > score).length + 1;
    const percentile = ((peerScores.length - rank + 1) / peerScores.length) * 100;
    const quartile = this.getQuartile(percentile);

    return {
      rank,
      percentile,
      quartile,
      score,
      rating: this.scoreToRating(score)
    };
  }
}
```

#### 4. Rating Simulation

```typescript
/**
 * Simulation Engine Service
 */
class SimulationEngineService {
  /**
   * Create rating improvement simulation
   */
  async createSimulation(
    organizationId: string,
    baseRatingId: string,
    assumptions: RatingSimulation['assumptions'],
    options?: {
      weightAdjustments?: { environmental: number; social: number; governance: number };
    }
  ): Promise<RatingSimulation> {

    // Step 1: Get base rating
    const baseRating = await this.ratingRepository.findById(baseRatingId);
    const methodology = await this.methodologyRepository.findById(baseRating.methodologyId);

    // Step 2: Apply assumptions to component scores
    const adjustedScores = this.applyAssumptions(baseRating, assumptions);

    // Step 3: Recalculate pillar scores
    const environmentalScore = this.calculateAdjustedPillarScore(
      'ENVIRONMENTAL',
      adjustedScores,
      methodology
    );

    const socialScore = this.calculateAdjustedPillarScore(
      'SOCIAL',
      adjustedScores,
      methodology
    );

    const governanceScore = this.calculateAdjustedPillarScore(
      'GOVERNANCE',
      adjustedScores,
      methodology
    );

    // Step 4: Apply weight adjustments (if any)
    const weights = options?.weightAdjustments || baseRating.weights;

    // Step 5: Calculate simulated overall score
    const simulatedOverallScore =
      (environmentalScore * weights.environmental / 100) +
      (socialScore * weights.social / 100) +
      (governanceScore * weights.governance / 100);

    // Step 6: Convert to ratings
    const simulatedRating = {
      overallRating: this.scoreToRating(simulatedOverallScore, methodology.ratingScale),
      overallScore: simulatedOverallScore,
      environmentalRating: this.scoreToRating(environmentalScore, methodology.ratingScale),
      environmentalScore,
      socialRating: this.scoreToRating(socialScore, methodology.ratingScale),
      socialScore,
      governanceRating: this.scoreToRating(governanceScore, methodology.ratingScale),
      governanceScore
    };

    // Step 7: Calculate comparison
    const comparison = {
      currentRating: baseRating.overallRating,
      simulatedRating: simulatedRating.overallRating,
      ratingChange: simulatedRating.overallRating.numeric - baseRating.overallRating.numeric,
      scoreChange: simulatedOverallScore - baseRating.overallScore,
      percentileChange: await this.estimatePercentileChange(
        baseRating.overallScore,
        simulatedOverallScore,
        baseRating.methodologyId
      )
    };

    // Step 8: Build simulation
    const simulation: RatingSimulation = {
      id: uuidv4(),
      organizationId,
      baseRatingId,
      name: `Rating Improvement Simulation ${new Date().toISOString()}`,
      description: 'Simulated rating based on performance assumptions',
      scenarioType: 'IMPROVEMENT_PLAN',
      assumptions,
      weightAdjustments: options?.weightAdjustments,
      simulatedRating,
      comparison,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      version: 1
    };

    return simulation;
  }

  /**
   * Apply assumptions to component scores
   */
  private applyAssumptions(
    baseRating: ESGRating,
    assumptions: RatingSimulation['assumptions']
  ): Map<string, number> {

    const adjustedScores = new Map<string, number>();

    // Start with current scores (from scoreCard)
    const scoreCard = await this.scoreCardRepository.findByRatingId(baseRating.id);

    // Environmental components
    for (const [component, score] of Object.entries(scoreCard.environmental.components)) {
      adjustedScores.set(`environmental.${component}`, score.score);
    }

    // Social components
    for (const [component, score] of Object.entries(scoreCard.social.components)) {
      adjustedScores.set(`social.${component}`, score.score);
    }

    // Governance components
    for (const [component, score] of Object.entries(scoreCard.governance.components)) {
      adjustedScores.set(`governance.${component}`, score.score);
    }

    // Apply assumptions
    for (const assumption of assumptions) {
      const key = `${assumption.category.toLowerCase()}.${assumption.component}`;
      adjustedScores.set(key, assumption.targetScore);
    }

    return adjustedScores;
  }
}
```

---

## Integration Points

### Internal Service Integration

#### Materiality Service Integration

```typescript
/**
 * Get materiality weights for scoring
 */
async getMaterialityWeights(
  organizationId: string
): Promise<{ environmental: number; social: number; governance: number }> {

  const response = await this.httpClient.get(
    `${MATERIALITY_SERVICE_URL}/api/v1/materiality/assessments/organization/${organizationId}/current`
  );

  const assessment = response.data.assessment;

  // Calculate pillar weights based on material issues
  const environmentalIssues = assessment.materialIssues.filter(i => i.pillar === 'ENVIRONMENTAL');
  const socialIssues = assessment.materialIssues.filter(i => i.pillar === 'SOCIAL');
  const governanceIssues = assessment.materialIssues.filter(i => i.pillar === 'GOVERNANCE');

  const totalMaterialityScore =
    this.sumMaterialityScores(environmentalIssues) +
    this.sumMaterialityScores(socialIssues) +
    this.sumMaterialityScores(governanceIssues);

  return {
    environmental: (this.sumMaterialityScores(environmentalIssues) / totalMaterialityScore) * 100,
    social: (this.sumMaterialityScores(socialIssues) / totalMaterialityScore) * 100,
    governance: (this.sumMaterialityScores(governanceIssues) / totalMaterialityScore) * 100
  };
}
```

#### Benchmark Service Integration

```typescript
/**
 * Get peer data for ranking
 */
async getPeerRatings(
  rankingType: string,
  criteria: any
): Promise<ESGRating[]> {

  const response = await this.httpClient.post(
    `${BENCHMARK_SERVICE_URL}/api/v1/benchmarks/peer-data`,
    {
      rankingType,
      criteria,
      includeRatings: true
    }
  );

  return response.data.peers.map(p => p.rating);
}
```

#### Analytics Service Integration

```typescript
/**
 * Get performance metrics for scoring
 */
async getPerformanceMetrics(
  organizationId: string,
  reportingPeriod: ReportingPeriod
): Promise<Record<string, number>> {

  const response = await this.httpClient.get(
    `${ANALYTICS_SERVICE_URL}/api/v1/analytics/performance`,
    {
      params: {
        organizationId,
        startDate: reportingPeriod.startDate,
        endDate: reportingPeriod.endDate
      }
    }
  );

  return response.data.metrics;
}
```

### External API Integration

#### MSCI ESG Ratings API (Read-Only Reference)

```typescript
/**
 * Get MSCI rating methodology reference
 */
async getMSCIMethodologyReference(): Promise<any> {

  const response = await this.httpClient.get(
    'https://api.msci.com/esg/methodology',
    {
      headers: {
        'Authorization': `Bearer ${process.env.MSCI_API_KEY}`
      }
    }
  );

  return response.data;
}
```

#### CDP Scoring System (Read-Only Reference)

```typescript
/**
 * Get CDP scoring methodology
 */
async getCDPScoringMethodology(): Promise<any> {

  const response = await this.httpClient.get(
    'https://api.cdp.net/scoring/methodology',
    {
      headers: {
        'X-API-Key': process.env.CDP_API_KEY
      }
    }
  );

  return response.data;
}
```

---

## Security & Compliance

### Authentication & Authorization

```typescript
/**
 * Rating Service - Role-Based Access Control
 */
const RATING_PERMISSIONS = {
  // Read Permissions
  'rating:read:own': ['ESG_ANALYST', 'ESG_MANAGER', 'AUDITOR', 'ADMIN'],
  'rating:read:all': ['ESG_MANAGER', 'ADMIN'],

  // Write Permissions
  'rating:calculate': ['ESG_ANALYST', 'ESG_MANAGER', 'ADMIN'],
  'rating:publish': ['ESG_MANAGER', 'ADMIN'],

  // Methodology Permissions
  'methodology:create': ['ESG_MANAGER', 'ADMIN'],
  'methodology:update': ['ESG_MANAGER', 'ADMIN'],

  // Controversy Permissions
  'controversy:create': ['ESG_ANALYST', 'ESG_MANAGER', 'ADMIN'],
  'controversy:resolve': ['ESG_MANAGER', 'ADMIN'],

  // Simulation Permissions
  'simulation:create': ['ESG_ANALYST', 'ESG_MANAGER', 'ADMIN'],
  'simulation:implement': ['ESG_MANAGER', 'ADMIN'],

  // Admin Permissions
  'rating:delete': ['ADMIN'],
  'methodology:delete': ['ADMIN']
};

/**
 * Rating Access Guard
 */
@Injectable()
export class RatingAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ratingId = request.params.id;

    // Admin can access all
    if (user.role === 'ADMIN') {
      return true;
    }

    // Check if user can access this rating
    const rating = await this.ratingRepository.findById(ratingId);

    // User must belong to same organization
    return user.organizationId === rating.organizationId;
  }
}
```

### Data Privacy & Compliance

```typescript
/**
 * Data Privacy Controls
 */
const PRIVACY_CONTROLS = {
  // PII Fields (none in ratings - all aggregated data)
  piiFields: [],

  // Sensitive Fields (require elevated permissions)
  sensitiveFields: [
    'controversies.financialImpact',
    'simulations.investmentEstimate'
  ],

  // Public Fields (can be shared externally)
  publicFields: [
    'overallRating',
    'overallScore',
    'reportingPeriod'
  ]
};

/**
 * Field-Level Encryption (for sensitive data)
 */
class RatingEncryptionService {
  async encryptSensitiveFields(rating: ESGRating): Promise<ESGRating> {
    // No PII to encrypt in ratings
    return rating;
  }
}
```

### Audit Logging

```typescript
/**
 * Audit Events for Rating Service
 */
const AUDIT_EVENTS = {
  RATING_CALCULATED: 'rating.calculated',
  RATING_PUBLISHED: 'rating.published',
  RATING_DELETED: 'rating.deleted',
  CONTROVERSY_RECORDED: 'controversy.recorded',
  CONTROVERSY_RESOLVED: 'controversy.resolved',
  METHODOLOGY_CREATED: 'methodology.created',
  METHODOLOGY_UPDATED: 'methodology.updated',
  SIMULATION_CREATED: 'simulation.created',
  SIMULATION_IMPLEMENTED: 'simulation.implemented'
};

/**
 * Audit Logger
 */
async function logAuditEvent(
  event: string,
  data: any,
  userId: string,
  correlationId: string
) {
  await auditService.log({
    service: 'rating-service',
    event,
    data,
    userId,
    correlationId,
    timestamp: new Date()
  });
}
```

---

## Performance Requirements

### Service Level Objectives (SLOs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Rating Calculation Time** | < 5 seconds | p95 for standard org |
| **API Response Time** | < 200ms | p95 for GET endpoints |
| **Complex Simulation** | < 10 seconds | p95 |
| **Peer Ranking Generation** | < 3 seconds | p95 |
| **Uptime** | 99.9% | Monthly |
| **Error Rate** | < 0.1% | Per 1000 requests |

### Performance Optimization Strategies

```typescript
/**
 * 1. Rating Calculation Caching
 */
class RatingCacheService {
  async getCachedRating(
    organizationId: string,
    methodologyId: string
  ): Promise<ESGRating | null> {

    const cacheKey = `rating:current:${organizationId}:${methodologyId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    return null;
  }

  async cacheRating(rating: ESGRating): Promise<void> {
    const cacheKey = `rating:current:${rating.organizationId}:${rating.methodologyId}`;
    await this.redis.setex(
      cacheKey,
      3600, // 1 hour TTL
      JSON.stringify(rating)
    );
  }
}

/**
 * 2. Batch Peer Ranking
 */
class BatchRankingService {
  async generateBatchRankings(
    organizationIds: string[],
    rankingType: string
  ): Promise<Map<string, PeerRanking>> {

    // Load all ratings in single query
    const ratings = await this.ratingRepository.findByOrganizations(organizationIds);

    // Calculate all rankings in parallel
    const rankings = await Promise.all(
      ratings.map(rating =>
        this.rankingService.generatePeerRanking(rating.organizationId, rating.id, rankingType, {})
      )
    );

    return new Map(rankings.map(r => [r.organizationId, r]));
  }
}

/**
 * 3. Component Score Pre-calculation
 */
class ComponentScorePreCalculator {
  /**
   * Pre-calculate and cache component scores for faster rating calculation
   */
  async preCalculateComponentScores(
    organizationId: string,
    reportingPeriod: ReportingPeriod
  ): Promise<void> {

    const components = [
      'carbonEmissions', 'energyManagement', 'waterManagement',
      'humanCapital', 'healthSafety', 'diversityInclusion',
      'boardGovernance', 'ethicsCompliance', 'riskManagement'
    ];

    for (const component of components) {
      const score = await this.calculateComponentScore(organizationId, component, reportingPeriod);

      const cacheKey = `score:component:${organizationId}:${component}:${reportingPeriod.year}`;
      await this.redis.setex(cacheKey, 86400, score.toString()); // 24 hour TTL
    }
  }
}
```

### Database Query Optimization

```typescript
/**
 * Optimized queries for rating operations
 */

// 1. Get current rating with scorecard (single query)
const rating = await this.ratingRepository.aggregate([
  {
    $match: {
      organizationId,
      status: 'PUBLISHED'
    }
  },
  { $sort: { calculatedAt: -1 } },
  { $limit: 1 },
  {
    $lookup: {
      from: 'scorecards',
      localField: 'id',
      foreignField: 'ratingId',
      as: 'scoreCard'
    }
  }
]);

// 2. Get ratings with peer ranking (single query)
const ratingsWithRankings = await this.ratingRepository.aggregate([
  {
    $match: {
      organizationId,
      'reportingPeriod.year': year
    }
  },
  {
    $lookup: {
      from: 'rankings',
      let: { ratingId: '$id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$organizationId', organizationId] },
                { $eq: ['$reportingPeriod.year', year] }
              ]
            }
          }
        }
      ],
      as: 'rankings'
    }
  }
]);

// 3. Bulk controversy impact calculation (ClickHouse)
const controversyImpacts = await this.clickhouse.query(`
  SELECT
    organization_id,
    SUM(score_impact) as total_impact,
    COUNT(*) as active_count
  FROM controversy_impacts
  WHERE
    organization_id IN (${organizationIds.join(',')})
    AND impact_end_date IS NULL
  GROUP BY organization_id
`);
```

---

## Testing Strategy

### Unit Tests

```typescript
/**
 * Score Calculation Service Tests
 */
describe('ScoreCalculationService', () => {
  describe('calculateESGScore', () => {
    it('should calculate overall ESG score correctly', async () => {
      // Arrange
      const methodology = createTestMethodology({
        pillarWeights: { environmental: 40, social: 30, governance: 30 }
      });

      const componentScores = {
        environmental: 75,
        social: 60,
        governance: 80
      };

      // Act
      const result = await service.calculateESGScore(
        'org-123',
        methodology.id,
        { year: 2024, startDate: new Date(), endDate: new Date() }
      );

      // Assert
      expect(result.rating.overallScore).toBe(72); // (75*0.4) + (60*0.3) + (80*0.3)
      expect(result.rating.overallRating.letter).toBe('A');
    });

    it('should apply controversy adjustment correctly', async () => {
      // Arrange
      const baseScore = 80;
      const controversy = createTestControversy({ severity: 'HIGH' });

      // Act
      const adjustment = await service.calculateControversyAdjustment(
        'org-123',
        methodology,
        reportingPeriod
      );

      // Assert
      expect(adjustment).toBeLessThan(0);
      expect(baseScore + adjustment).toBeLessThan(baseScore);
    });

    it('should handle missing component data gracefully', async () => {
      // Test that optional components with missing data don't break calculation
    });
  });
});

/**
 * Ranking Service Tests
 */
describe('RankingService', () => {
  describe('generatePeerRanking', () => {
    it('should calculate correct ranking position', async () => {
      // Arrange
      const peerScores = [90, 85, 75, 70, 65, 60, 55, 50];
      const organizationScore = 75;

      // Act
      const ranking = await service.calculateRanking(organizationScore, peerScores);

      // Assert
      expect(ranking.rank).toBe(3);
      expect(ranking.percentile).toBeCloseTo(75, 0);
      expect(ranking.quartile).toBe(1); // Top quartile
    });

    it('should calculate peer statistics correctly', async () => {
      // Test mean, median, quartiles calculation
    });
  });
});

/**
 * Simulation Engine Tests
 */
describe('SimulationEngineService', () => {
  it('should apply assumptions correctly', async () => {
    // Test that component score assumptions are applied
  });

  it('should calculate rating improvement accurately', async () => {
    // Test simulated rating calculation
  });
});
```

### Integration Tests

```typescript
/**
 * Rating API Integration Tests
 */
describe('POST /api/v1/rating/calculate', () => {
  it('should calculate and return ESG rating', async () => {
    // Arrange
    const request = {
      organizationId: 'org-123',
      methodologyId: 'methodology-msci',
      reportingPeriod: { year: 2024, startDate: '2024-01-01', endDate: '2024-12-31' }
    };

    // Act
    const response = await supertest(app)
      .post('/api/v1/rating/calculate')
      .send(request)
      .expect(200);

    // Assert
    expect(response.body.success).toBe(true);
    expect(response.body.data.rating).toHaveProperty('overallRating');
    expect(response.body.data.rating).toHaveProperty('overallScore');
    expect(response.body.data.scoreCard).toHaveProperty('environmental');
  });

  it('should return 400 for invalid methodology', async () => {
    // Test error handling
  });
});

describe('POST /api/v1/rating/controversies', () => {
  it('should record controversy and calculate impact', async () => {
    // Test controversy recording
  });

  it('should publish controversy.recorded event', async () => {
    // Test event publishing
  });
});
```

### E2E Tests

```typescript
/**
 * Rating Improvement Workflow E2E Test
 */
describe('Rating Improvement Workflow', () => {
  it('should complete full rating improvement cycle', async () => {
    // Step 1: Calculate baseline rating
    const baseline = await calculateRating('org-123', 'methodology-msci', period);
    expect(baseline.overallRating.letter).toBe('BBB');

    // Step 2: Create improvement simulation
    const simulation = await createSimulation({
      organizationId: 'org-123',
      baseRatingId: baseline.id,
      assumptions: [
        { component: 'carbonEmissions', targetScore: 80, improvementPercentage: 20 }
      ]
    });
    expect(simulation.simulatedRating.letter).toBe('A');

    // Step 3: Implement improvements
    await implementSimulation(simulation.id);

    // Step 4: Recalculate rating (after period)
    const improved = await calculateRating('org-123', 'methodology-msci', nextPeriod);
    expect(improved.overallRating.letter).toBe('A');

    // Step 5: Verify rating upgraded event published
    expect(eventBus.published).toContainEqual(
      expect.objectContaining({ eventType: 'rating.upgraded.v1' })
    );
  });
});
```

### Performance Tests

```typescript
/**
 * Rating Calculation Performance Test
 */
describe('Rating Performance', () => {
  it('should calculate rating in < 5 seconds', async () => {
    const startTime = Date.now();

    await calculateRating('org-123', 'methodology-msci', period);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000);
  });

  it('should handle 100 concurrent rating calculations', async () => {
    // Load test
  });
});
```

---

## Deployment

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production
ENV PORT=3049

EXPOSE 3049

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3049/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

USER node

CMD ["node", "dist/main.js"]
```

### Kubernetes Configuration

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rating-service
  namespace: clenergize
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rating-service
  template:
    metadata:
      labels:
        app: rating-service
        version: v1
    spec:
      containers:
      - name: rating-service
        image: clenergize/rating-service:latest
        ports:
        - containerPort: 3049
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3049"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: rating-service-secrets
              key: mongodb-uri
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: rating-service-secrets
              key: redis-url
        - name: CLICKHOUSE_URL
          valueFrom:
            secretKeyRef:
              name: rating-service-secrets
              key: clickhouse-url
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 2000m
            memory: 4Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 3049
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3049
          initialDelaySeconds: 10
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: rating-service
  namespace: clenergize
spec:
  selector:
    app: rating-service
  ports:
  - port: 3049
    targetPort: 3049
  type: ClusterIP

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: rating-service-hpa
  namespace: clenergize
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: rating-service
  minReplicas: 2
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

### Environment Configuration

```bash
# .env.production
NODE_ENV=production
PORT=3049
SERVICE_NAME=rating-service

# Database
MONGODB_URI=mongodb://rating-service:PASSWORD@docdb-cluster:27017/clenergize_rating?replicaSet=rs0&readPreference=secondaryPreferred
CLICKHOUSE_URL=https://clickhouse-cluster:8123
CLICKHOUSE_DATABASE=clenergize_analytics

# Cache
REDIS_URL=redis://elasticache-cluster:6379
REDIS_CACHE_DB=0
REDIS_PUBSUB_DB=1

# Event Bus
EVENT_BUS_NAME=clenergize-event-bus
AWS_REGION=us-east-1

# Service URLs
MATERIALITY_SERVICE_URL=http://materiality-service:3041
BENCHMARK_SERVICE_URL=http://benchmark-service:3043
ANALYTICS_SERVICE_URL=http://analytics-service:3045
REPORTING_SERVICE_URL=http://reporting-service:3044
REFERENCE_SERVICE_URL=http://reference-service:3003

# External APIs
MSCI_API_KEY=<secret>
CDP_API_KEY=<secret>
SUSTAINALYTICS_API_KEY=<secret>

# Performance
RATING_CALCULATION_TIMEOUT=10000 # 10 seconds
CACHE_TTL=3600 # 1 hour

# Observability
LOG_LEVEL=info
CORRELATION_ID_HEADER=x-correlation-id
```

---

## Monitoring & Observability

### Metrics

```typescript
/**
 * Custom Metrics for Rating Service
 */
const RATING_METRICS = {
  // Calculation Metrics
  'rating.calculation.duration': 'Histogram - Rating calculation time',
  'rating.calculation.success': 'Counter - Successful calculations',
  'rating.calculation.failure': 'Counter - Failed calculations',

  // Score Metrics
  'rating.score.distribution': 'Histogram - Score distribution',
  'rating.rating.distribution': 'Gauge - Rating letter distribution',

  // Controversy Metrics
  'rating.controversy.recorded': 'Counter - Controversies recorded',
  'rating.controversy.impact': 'Histogram - Controversy score impact',

  // Ranking Metrics
  'rating.ranking.generated': 'Counter - Rankings generated',
  'rating.ranking.duration': 'Histogram - Ranking generation time',

  // Simulation Metrics
  'rating.simulation.created': 'Counter - Simulations created',
  'rating.simulation.implemented': 'Counter - Simulations implemented',

  // Cache Metrics
  'rating.cache.hit': 'Counter - Cache hits',
  'rating.cache.miss': 'Counter - Cache misses',

  // API Metrics
  'rating.api.request.duration': 'Histogram - API request duration',
  'rating.api.request.size': 'Histogram - Request body size',
  'rating.api.response.size': 'Histogram - Response body size'
};

/**
 * Prometheus Metrics Endpoint
 */
@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics(): Promise<string> {
    return prometheusRegistry.metrics();
  }
}
```

### Logging

```typescript
/**
 * Structured Logging
 */
logger.info('Rating calculated', {
  ratingId: rating.id,
  organizationId: rating.organizationId,
  overallScore: rating.overallScore,
  overallRating: rating.overallRating.letter,
  calculationDuration: duration,
  dataCompleteness: rating.calculationMetadata.dataCompleteness,
  correlationId: request.correlationId
});

logger.warn('Low data completeness for rating', {
  ratingId: rating.id,
  organizationId: rating.organizationId,
  dataCompleteness: rating.calculationMetadata.dataCompleteness,
  missingComponents: rating.calculationMetadata.warnings
});

logger.error('Rating calculation failed', {
  organizationId,
  methodologyId,
  error: error.message,
  stack: error.stack,
  correlationId: request.correlationId
});
```

### Alerts

```yaml
# CloudWatch Alarms
RatingCalculationFailureRate:
  Threshold: > 5% failures in 5 minutes
  Action: SNS notification to on-call team

RatingCalculationDuration:
  Threshold: p95 > 10 seconds
  Action: SNS notification + auto-scale

ControversyRecordedCritical:
  Threshold: SEVERE controversy recorded
  Action: Immediate SNS notification to ESG team

CacheHitRateLow:
  Threshold: < 50% hit rate for 10 minutes
  Action: SNS notification to DevOps

DatabaseConnectionFailure:
  Threshold: > 3 connection failures in 5 minutes
  Action: Page on-call + auto-restart
```

### Dashboards

```typescript
/**
 * Grafana Dashboard Panels
 */
const DASHBOARD_PANELS = [
  {
    title: 'Rating Calculations (per hour)',
    query: 'rate(rating_calculation_success_total[1h])',
    type: 'graph'
  },
  {
    title: 'Average Calculation Duration',
    query: 'histogram_quantile(0.95, rating_calculation_duration_bucket)',
    type: 'gauge'
  },
  {
    title: 'Rating Distribution',
    query: 'rating_rating_distribution',
    type: 'pie'
  },
  {
    title: 'Active Controversies',
    query: 'rating_controversy_recorded_total',
    type: 'stat'
  },
  {
    title: 'Peer Rankings Generated',
    query: 'rate(rating_ranking_generated_total[1h])',
    type: 'graph'
  },
  {
    title: 'Cache Hit Rate',
    query: 'rating_cache_hit_total / (rating_cache_hit_total + rating_cache_miss_total)',
    type: 'gauge'
  }
];
```

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| **ESG Rating** | Letter-grade assessment of ESG performance (AAA to CCC) |
| **ESG Score** | Numeric score (0-100) representing ESG performance |
| **Rating Methodology** | Framework for calculating ESG ratings (e.g., MSCI, CDP) |
| **Controversy** | Negative ESG incident that impacts rating |
| **Peer Ranking** | Comparative ranking against industry peers |
| **Materiality Weighting** | Adjusting pillar weights based on material issues |
| **Component Score** | Score for individual ESG component (e.g., carbon emissions) |
| **Rating Simulation** | What-if scenario for rating improvement |
| **Percentile** | Statistical ranking position (0-100%) |
| **Quartile** | One of four equal groups in distribution |

### Sample Data

```typescript
/**
 * Sample ESG Rating
 */
const sampleRating: ESGRating = {
  id: 'rating-123',
  organizationId: 'org-456',
  overallRating: { letter: 'A', numeric: 6, outlook: 'POSITIVE' },
  environmentalRating: { letter: 'AA', numeric: 7, outlook: 'STABLE' },
  socialRating: { letter: 'BBB', numeric: 4, outlook: 'STABLE' },
  governanceRating: { letter: 'A', numeric: 6, outlook: 'POSITIVE' },
  overallScore: 72.5,
  environmentalScore: 82.0,
  socialScore: 61.0,
  governanceScore: 75.0,
  weights: { environmental: 40, social: 30, governance: 30 },
  methodologyId: 'methodology-msci',
  methodologyName: 'MSCI-Style',
  methodologyVersion: '1.0',
  industryAverage: 65.0,
  percentile: 78,
  materialityWeighted: true,
  materialityAssessmentId: 'assessment-789',
  controversyAdjustment: -2.5,
  activeControversies: 1,
  reportingPeriod: {
    year: 2024,
    quarter: 4,
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-12-31')
  },
  calculatedAt: new Date('2024-12-31T23:59:59Z'),
  validUntil: new Date('2025-03-31T23:59:59Z'),
  previousRating: { letter: 'BBB', numeric: 4, outlook: 'STABLE' },
  ratingChange: 'UPGRADE',
  scoreChange: 7.5,
  status: 'PUBLISHED',
  calculationMetadata: {
    dataCompleteness: 92.5,
    dataSources: ['reporting-service', 'analytics-service'],
    calculationDuration: 3456,
    warnings: ['Missing water consumption data for Q3']
  },
  createdAt: new Date('2024-12-31T23:59:59Z'),
  updatedAt: new Date('2024-12-31T23:59:59Z'),
  createdBy: 'system',
  version: 1
};
```

### References

#### Industry Standards
- [MSCI ESG Ratings Methodology](https://www.msci.com/esg-ratings)
- [CDP Scoring Methodology](https://www.cdp.net/en/scores)
- [Sustainalytics ESG Risk Ratings](https://www.sustainalytics.com/esg-ratings)
- [S&P Global ESG Scores](https://www.spglobal.com/esg/scores/)

#### Frameworks
- [GRI Standards](https://www.globalreporting.org/standards/)
- [SASB Standards](https://www.sasb.org/standards/)
- [TCFD Recommendations](https://www.fsb-tcfd.org/)

#### Related Documentation
- [Materiality Service Specification](./41_Materiality_Service.md)
- [Benchmark Service Specification](./43_Benchmark_Service.md)
- [Analytics Service Specification](./45_Analytics_Service.md)
- [Reporting Service Specification](./44_Reporting_Service.md)
- [Event Schema Registry](../../../EVENT_SCHEMA_REGISTRY.md)

---

**Document Version**: 1.0
**Last Updated**: 2024-12-20
**Next Review**: Sprint 23 Planning
**Owner**: Rating Agent
**Status**: Future Roadmap - Awaiting Sprint 23
