# Insights Service - Specification

> **Version**: 1.0.0
> **Port**: 3050
> **Phase**: 6 (Months 22-24) - Analytics & ML Domain
> **Story Points**: 25
> **Agent**: Insights Agent
> **Service Number**: 50 of 50 (FINAL SERVICE)

## 1. Overview

### Purpose
The Insights Service is the AI-powered intelligence layer of the Clenergize V3 ESG Platform, providing automated insights generation, root cause analysis, natural language narratives, and actionable recommendations. It leverages machine learning and large language models to transform ESG data into strategic intelligence, enabling organizations to understand "why" metrics changed and "what" to do about it.

### Domain
Analytics & Machine Learning (AI-Powered ESG Intelligence)

### Business Value
- **Automated Insights**: AI-generated insights from ESG data patterns, reducing manual analysis by 80%
- **Root Cause Analysis**: Automated identification of why metrics changed and key drivers
- **Actionable Recommendations**: AI-powered improvement recommendations with ROI estimates
- **Natural Language Generation**: Automated narrative generation for reports and disclosures
- **Anomaly Explanations**: Explain why anomalies occurred and contributing factors
- **Executive Intelligence**: Auto-generated executive summaries and key takeaways
- **Best Practice Matching**: AI-matched best practices based on performance gaps
- **Predictive Insights**: Forward-looking insights based on trends and forecasts

### Key Stakeholders
- Chief Sustainability Officers (CSOs)
- ESG Directors and Managers
- Data Analysts and Scientists
- Executive Leadership (C-Suite)
- Board Sustainability Committees
- Investors and Analysts
- Report Authors
- Sustainability Consultants

### Technical Approach
- **Backend**: NestJS (TypeScript) for API and orchestration
- **AI/ML**: Python microservices for LLM integration and NLP
- **LLM Integration**: OpenAI GPT-4, Anthropic Claude, Azure OpenAI
- **NLP**: Hugging Face Transformers, spaCy
- **Databases**: MongoDB (insights, recommendations), Redis (cache)
- **Event Streaming**: Kafka for real-time insights triggers
- **Integration**: ML Service (3046), Analytics Service (3045), all domain services

---

## 2. Core Features

### 2.1 Automated Insight Generation

#### Data Pattern Recognition
- Trend detection (upward, downward, stable, volatile)
- Seasonality identification
- Cyclical pattern recognition
- Outlier detection
- Correlation discovery
- Threshold breach detection
- Performance inflection points
- Rate of change analysis

#### Insight Types
- **Performance Insights**: "GHG emissions decreased 12% QoQ due to renewable energy adoption"
- **Variance Insights**: "Water consumption 25% above target driven by production increase"
- **Trend Insights**: "Waste diversion rate improving 3% annually for 5 consecutive years"
- **Comparative Insights**: "Your carbon intensity is 40% better than industry average"
- **Correlation Insights**: "Safety incidents correlated with training hours (r=-0.78)"
- **Forecast Insights**: "At current rate, net-zero target will be missed by 5 years"
- **Risk Insights**: "Water stress risk increasing in 3 facilities due to climate change"
- **Opportunity Insights**: "LED upgrade could reduce energy costs by $120K annually"

#### Insight Triggering
- Scheduled generation (daily, weekly, monthly, quarterly)
- Event-driven triggers (data ingestion, calculation completion, threshold breach)
- On-demand generation (user request, report generation)
- Anomaly-triggered insights
- Target-triggered insights (progress update, at-risk detection)
- Comparative analysis triggers (peer data update, benchmark refresh)

#### Insight Prioritization
- Materiality alignment (high-priority topics first)
- Financial impact scoring
- Stakeholder relevance
- Timeliness and recency
- Actionability assessment
- Risk severity
- User customization (user-defined priorities)

#### Insight Validation
- Statistical significance testing
- Data quality checks
- Causality validation (correlation ≠ causation)
- Temporal consistency checks
- Peer comparison validation
- Human-in-the-loop review
- Confidence scoring (0-100%)
- Explainability metrics

### 2.2 Root Cause Analysis

#### Driver Identification
- Primary driver detection (largest contributor)
- Secondary driver analysis (supporting factors)
- Hierarchical decomposition (cascade from total to sub-components)
- Waterfall analysis (change attribution)
- Contribution analysis (% impact by factor)
- Variance decomposition (volume, mix, efficiency)
- Sensitivity analysis (elasticity of drivers)

#### Causal Analysis Techniques
- **Regression Analysis**: Identify statistically significant predictors
- **Decision Trees**: Hierarchical driver splitting
- **SHAP Values**: Feature importance and contribution
- **Time Series Decomposition**: Trend, seasonality, residual
- **Granger Causality**: Temporal causality testing
- **Counterfactual Analysis**: What-if scenarios
- **Bayesian Networks**: Probabilistic causal graphs

#### Root Cause Categories
- **Volume Changes**: Production increase/decrease, headcount changes
- **Efficiency Changes**: Process improvements, equipment upgrades
- **Mix Changes**: Product mix shift, fuel mix changes
- **External Factors**: Weather, market conditions, regulations
- **Behavioral Factors**: Employee actions, management decisions
- **Structural Factors**: Facility closures, acquisitions, divestitures
- **Data Quality Issues**: Estimation methodology changes, data corrections

#### Root Cause Narratives
- Plain language explanations
- Visual decomposition (waterfall charts, tree maps)
- Quantified contribution percentages
- Temporal analysis (when did it occur)
- Spatial analysis (where did it occur)
- Actionability assessment (what can be controlled)

### 2.3 AI-Powered Recommendations

#### Recommendation Types
- **Quick Wins**: Low-effort, high-impact actions
- **Strategic Initiatives**: High-effort, transformational actions
- **Process Improvements**: Operational efficiency enhancements
- **Technology Upgrades**: Equipment and system investments
- **Behavioral Changes**: Training, awareness, policy changes
- **Regulatory Compliance**: Actions to meet compliance requirements
- **Best Practice Adoption**: Industry-leading practices to adopt

#### Recommendation Generation
- Performance gap analysis (actual vs target, actual vs peers)
- Best practice matching (AI-matched based on context)
- Benchmarking-driven recommendations (learn from top performers)
- Predictive analysis (actions to achieve future targets)
- Multi-criteria optimization (cost, impact, feasibility)
- Constraint-aware recommendations (budget, resources, timeline)
- Scenario-based recommendations (different pathways)

#### Recommendation Attributes
- **Description**: Clear, actionable description (100-200 words)
- **Expected Impact**: Quantified benefit (e.g., "Reduce GHG by 500 tCO2e/year")
- **Implementation Cost**: Estimated investment (CapEx + OpEx)
- **Payback Period**: ROI timeline (months/years)
- **Difficulty**: Implementation complexity (easy, moderate, hard)
- **Timeline**: Implementation duration (weeks/months)
- **Dependencies**: Prerequisites and blockers
- **Risks**: Implementation risks and mitigation
- **Success Criteria**: How to measure success
- **Case Studies**: Analogous implementations

#### Recommendation Ranking
- Impact score (financial, environmental, social)
- Feasibility score (cost, complexity, resources)
- ROI calculation (NPV, IRR, payback period)
- Strategic alignment score (materiality, strategy)
- Urgency score (time sensitivity)
- Composite score (weighted multi-criteria)
- User customization (adjust weighting)

#### Recommendation Tracking
- Recommendation status (proposed, approved, in-progress, completed, rejected)
- Assignment to owners
- Implementation tracking
- Impact measurement (actual vs expected)
- Lessons learned capture
- Recommendation feedback loop (improve future recommendations)

### 2.4 Natural Language Generation (NLG)

#### Narrative Types
- **Executive Summaries**: One-page overview for C-suite
- **Performance Narratives**: Describe metric changes in plain language
- **Variance Explanations**: Explain actual vs target/forecast/peer differences
- **Trend Narratives**: Describe multi-period trends
- **Report Sections**: Auto-generate report content (e.g., "Environmental Performance")
- **Disclosure Statements**: Generate disclosure text for frameworks (GRI, SASB, TCFD)
- **Investor Updates**: Quarterly ESG performance updates
- **Board Reports**: Automated board report content

#### NLG Templates
- Framework-aligned templates (GRI 305, SASB, TCFD)
- Industry-specific templates (manufacturing, retail, finance)
- Audience-specific templates (technical, executive, public)
- Customizable templates (user-defined structure)
- Multi-language templates (English, Spanish, French, German, Chinese)

#### Content Generation Process
1. **Data Extraction**: Pull relevant data from source services
2. **Insight Analysis**: Identify key insights and patterns
3. **Structure Planning**: Organize narrative flow and sections
4. **Content Generation**: Generate text using LLM (GPT-4, Claude)
5. **Fact Checking**: Validate accuracy against source data
6. **Style Application**: Apply tone, voice, and formatting
7. **Human Review**: Flag for review if confidence < threshold
8. **Finalization**: Export to Word, PDF, HTML

#### Narrative Quality Controls
- **Accuracy**: Cross-check all numbers against source data
- **Consistency**: Ensure consistent terminology and units
- **Clarity**: Plain language, avoid jargon (unless technical audience)
- **Completeness**: Cover all required topics
- **Coherence**: Logical flow and transitions
- **Compliance**: Meet framework requirements
- **Tone**: Appropriate for audience (professional, accessible)
- **Length**: Respect word/page limits

#### Human-in-the-Loop Review
- Confidence scoring (0-100%) for each narrative
- Flag low-confidence sections for review
- Track-changes mode for human edits
- Approval workflow
- Version history
- Feedback loop (improve future generation)

### 2.5 Anomaly Explanation

#### Anomaly Detection Integration
- Consume anomaly alerts from ML Service (3046)
- Trigger explanation generation automatically
- Prioritize by severity and materiality

#### Explanation Generation
- **What happened**: Describe the anomaly in plain language
- **When it happened**: Temporal context (date, time, duration)
- **Where it happened**: Spatial context (facility, department, process)
- **Magnitude**: How large was the deviation (absolute, relative, statistical)
- **Contributing Factors**: What caused it (top 3-5 factors)
- **Historical Context**: Has this happened before? How does it compare?
- **Impact Assessment**: What are the consequences (financial, reputational, compliance)

#### Root Cause Hypotheses
- Generate multiple hypotheses (data quality issue, operational change, external event)
- Rank by likelihood (probability score)
- Provide evidence for each hypothesis
- Recommend validation steps
- Auto-investigate using related data sources

#### Corrective Action Suggestions
- Immediate actions (stop the bleeding)
- Investigative actions (gather more data)
- Preventive actions (prevent recurrence)
- Process improvements (systematic fix)

### 2.6 Variance Analysis Narratives

#### Variance Types
- **Actual vs Target**: "GHG emissions 12% above 2025 target"
- **Actual vs Budget**: "Water costs $50K over budget"
- **Actual vs Forecast**: "Waste generation 8% below forecast"
- **Actual vs Prior Period**: "Energy consumption down 5% YoY"
- **Actual vs Peer Average**: "Carbon intensity 30% higher than peers"

#### Variance Decomposition
- Volume variance (quantity effect)
- Price/rate variance (cost effect)
- Mix variance (composition effect)
- Efficiency variance (productivity effect)
- External variance (market, weather)

#### Narrative Structure
1. **Headline**: One-sentence summary (e.g., "GHG emissions 12% above target")
2. **Magnitude**: Quantify the variance (absolute and relative)
3. **Direction**: Favorable or unfavorable
4. **Drivers**: Top 3-5 contributors
5. **Analysis**: Detailed breakdown by driver
6. **Context**: Historical trends, peer comparison
7. **Outlook**: Expected trajectory, forecast update
8. **Actions**: Recommended corrective/preventive actions

### 2.7 Best Practice Matching

#### Best Practice Library
- 1,000+ curated best practices (environmental, social, governance)
- Industry-specific practices (manufacturing, retail, finance, technology)
- Framework-aligned practices (GRI, SASB, CDP, B Corp)
- Certification practices (ISO 14001, ISO 45001, LEED, B Corp)
- Innovation practices (cutting-edge technologies, emerging trends)

#### Matching Algorithm
- **Context Matching**: Industry, size, geography, maturity
- **Gap Matching**: Identify performance gaps (actual vs peer, actual vs target)
- **Relevance Scoring**: Materiality alignment, strategic fit
- **Feasibility Filtering**: Budget, resources, capabilities
- **Impact Estimation**: Expected performance improvement
- **Ranking**: Multi-criteria scoring (impact, feasibility, ROI)

#### Best Practice Presentation
- Title and description (200-300 words)
- Implementation guidance (step-by-step)
- Estimated cost and timeline
- Expected benefits (quantified)
- Case studies (3-5 examples)
- Resources and tools
- Risks and mitigation

#### Best Practice Tracking
- Mark as "shortlisted", "in-progress", "implemented", "not-applicable"
- Track implementation progress
- Measure actual vs expected impact
- Share lessons learned
- Update practice library (continuous improvement)

### 2.8 Executive Summaries

#### Summary Types
- **Daily Briefing**: Key highlights from yesterday (5 bullet points)
- **Weekly Summary**: Performance summary + top 3 insights
- **Monthly Summary**: Progress vs targets + recommendations
- **Quarterly Summary**: Comprehensive performance review + outlook
- **Annual Summary**: Year in review + strategic priorities
- **Board Summary**: One-pager for board meetings

#### Content Structure
- **Key Metrics**: Top 5-10 KPIs with trend arrows
- **Highlights**: Top 3 positive developments
- **Concerns**: Top 3 issues requiring attention
- **Insights**: Top 3 AI-generated insights
- **Recommendations**: Top 3 priority actions
- **Outlook**: Forward-looking statement

#### Audience Customization
- **CEO**: Strategic, high-level, business-focused
- **CFO**: Financial, risk-focused, ROI-oriented
- **CSO**: Detailed, technical, ESG-focused
- **Board**: Governance, oversight, risk-focused
- **Investors**: Performance, transparency, forward-looking

#### Delivery Mechanisms
- Email delivery (scheduled)
- Dashboard widget
- Mobile app notification
- PDF export
- PowerPoint slide deck
- API endpoint (for custom integrations)

---

## 3. API Endpoints

### 3.1 Insight Generation Endpoints

#### Generate Insights
```yaml
POST /v1/insights/generate
  Description: Generate insights for a dataset or metric
  Request:
    - scope: "organization" | "facility" | "metric" | "custom"
    - scopeId: string (organizationId, facilityId, metricId)
    - timeRange: { startDate: Date, endDate: Date }
    - insightTypes: string[] (optional, ["trend", "variance", "correlation", "forecast"])
    - priority: "all" | "high-priority-only"
    - autoPublish: boolean (default: false, requires review if false)
  Response:
    - jobId: string (async processing)
    - estimatedCompletionTime: Date
  Events Published:
    - insights.insight.generation-started.v1
    - insights.insight.generated.v1 (when complete)

GET /v1/insights
  Description: List all insights
  Query:
    - organizationId: string
    - facilityId: string (optional)
    - metricId: string (optional)
    - category: string (optional, "environmental", "social", "governance")
    - insightType: string (optional)
    - status: "draft" | "published" | "archived"
    - priority: "high" | "medium" | "low"
    - dateRange: { startDate: Date, endDate: Date }
    - page: number
    - limit: number
    - sortBy: "createdAt" | "priority" | "impact" | "confidence"
  Response:
    - insights: Insight[]
    - total: number
    - page: number

GET /v1/insights/:insightId
  Description: Get insight details
  Response:
    - insight: Insight
    - relatedData: object (source data)
    - recommendations: Recommendation[] (related recommendations)
    - narratives: Narrative[] (related narratives)

PUT /v1/insights/:insightId
  Description: Update insight (e.g., publish, archive, adjust priority)
  Request:
    - status: "draft" | "published" | "archived"
    - priority: "high" | "medium" | "low"
    - notes: string
    - tags: string[]
  Response:
    - insight: Insight
  Events Published:
    - insights.insight.updated.v1

DELETE /v1/insights/:insightId
  Description: Delete insight
  Response:
    - success: boolean
  Events Published:
    - insights.insight.deleted.v1
```

#### Insight Feedback
```yaml
POST /v1/insights/:insightId/feedback
  Description: Submit feedback on insight quality (improve ML models)
  Request:
    - helpful: boolean
    - accurate: boolean
    - actionable: boolean
    - comments: string (optional)
  Response:
    - success: boolean
  Events Published:
    - insights.insight.feedback-submitted.v1
```

### 3.2 Root Cause Analysis Endpoints

#### Perform Root Cause Analysis
```yaml
POST /v1/root-cause/analyze
  Description: Perform root cause analysis on a metric change
  Request:
    - metricId: string (required)
    - timeRange: { startDate: Date, endDate: Date } (required)
    - comparisonType: "period-over-period" | "actual-vs-target" | "actual-vs-forecast"
    - includeExternalFactors: boolean (default: true, weather, market data)
    - maxDepth: number (default: 3, levels of decomposition)
  Response:
    - analysisId: string
    - primaryDrivers: Driver[] (top 3-5 drivers)
    - decomposition: DecompositionNode (hierarchical tree)
    - narrative: string (plain language explanation)
    - confidence: number (0-100)
    - visualizations: object (waterfall chart data, tree map data)
  Events Published:
    - insights.root-cause.analyzed.v1

GET /v1/root-cause/:analysisId
  Description: Get root cause analysis details
  Response:
    - analysis: RootCauseAnalysis
    - drivers: Driver[]
    - decomposition: DecompositionNode
    - narrative: string
```

### 3.3 Recommendation Endpoints

#### Generate Recommendations
```yaml
POST /v1/recommendations/generate
  Description: Generate AI-powered recommendations
  Request:
    - scope: "organization" | "facility" | "metric"
    - scopeId: string
    - goalType: "reduce-emissions" | "improve-efficiency" | "increase-renewable" | "reduce-waste" | "custom"
    - constraints: object { maxBudget: number, maxTimeline: number }
    - preferences: object { prioritizeROI: boolean, prioritizeImpact: boolean }
  Response:
    - jobId: string (async processing)
    - estimatedCompletionTime: Date
  Events Published:
    - insights.recommendation.generation-started.v1
    - insights.recommendation.generated.v1

GET /v1/recommendations
  Description: List recommendations
  Query:
    - organizationId: string
    - facilityId: string (optional)
    - category: string (optional)
    - status: "proposed" | "approved" | "in-progress" | "completed" | "rejected"
    - impactLevel: "high" | "medium" | "low"
    - difficulty: "easy" | "moderate" | "hard"
    - minROI: number (minimum ROI %)
    - page: number
    - limit: number
    - sortBy: "impact" | "roi" | "cost" | "feasibility"
  Response:
    - recommendations: Recommendation[]
    - total: number

GET /v1/recommendations/:recommendationId
  Description: Get recommendation details
  Response:
    - recommendation: Recommendation
    - impactAnalysis: object
    - costBenefit: object
    - caseStudies: CaseStudy[]

PUT /v1/recommendations/:recommendationId/status
  Description: Update recommendation status
  Request:
    - status: "proposed" | "approved" | "in-progress" | "completed" | "rejected"
    - assignedTo: string (userId, optional)
    - implementationDate: Date (optional)
    - notes: string (optional)
  Response:
    - recommendation: Recommendation
  Events Published:
    - insights.recommendation.status-changed.v1

POST /v1/recommendations/:recommendationId/impact
  Description: Record actual impact (after implementation)
  Request:
    - actualImpact: object { metric: string, value: number, unit: string }
    - actualCost: number
    - actualTimeline: number (days)
    - lessonsLearned: string
  Response:
    - success: boolean
  Events Published:
    - insights.recommendation.impact-recorded.v1
```

### 3.4 Natural Language Generation Endpoints

#### Generate Narrative
```yaml
POST /v1/narratives/generate
  Description: Generate natural language narrative
  Request:
    - narrativeType: "executive-summary" | "performance-narrative" | "variance-explanation" | "trend-narrative" | "disclosure-statement"
    - scope: "organization" | "facility" | "metric"
    - scopeId: string
    - timeRange: { startDate: Date, endDate: Date }
    - audience: "executive" | "technical" | "public" | "investor"
    - framework: string (optional, "GRI", "SASB", "TCFD")
    - wordLimit: number (optional, default: 500)
    - tone: "formal" | "conversational" | "technical"
    - language: string (default: "en", ISO 639-1)
  Response:
    - narrativeId: string
    - narrative: string (generated text)
    - confidence: number (0-100)
    - factChecks: FactCheck[] (validated claims)
    - suggestedEdits: string[] (AI suggestions for improvement)
  Events Published:
    - insights.narrative.generated.v1

GET /v1/narratives/:narrativeId
  Description: Get narrative details
  Response:
    - narrative: Narrative
    - sourceData: object (data used for generation)
    - factChecks: FactCheck[]
    - versions: NarrativeVersion[] (edit history)

PUT /v1/narratives/:narrativeId
  Description: Update narrative (human edits)
  Request:
    - text: string (edited text)
    - approvalStatus: "draft" | "approved" | "published"
  Response:
    - narrative: Narrative
  Events Published:
    - insights.narrative.updated.v1

POST /v1/narratives/:narrativeId/export
  Description: Export narrative to document format
  Request:
    - format: "docx" | "pdf" | "html" | "markdown"
    - includeCharts: boolean (default: false)
  Response:
    - fileUrl: string (temporary download URL)
```

### 3.5 Anomaly Explanation Endpoints

#### Explain Anomaly
```yaml
POST /v1/anomaly-explanations
  Description: Generate explanation for an anomaly
  Request:
    - anomalyId: string (from ML Service)
    - metricId: string
    - detectedAt: Date
    - anomalyType: "spike" | "drop" | "drift" | "missing-data"
    - severity: "critical" | "high" | "medium" | "low"
  Response:
    - explanationId: string
    - explanation: AnomalyExplanation
    - hypotheses: Hypothesis[] (ranked by likelihood)
    - recommendations: string[] (corrective actions)
    - narrative: string (plain language)
  Events Published:
    - insights.anomaly.explained.v1

GET /v1/anomaly-explanations/:explanationId
  Description: Get anomaly explanation details
  Response:
    - explanation: AnomalyExplanation
    - hypotheses: Hypothesis[]
    - investigation: Investigation (if triggered)
```

### 3.6 Best Practice Endpoints

#### Search Best Practices
```yaml
GET /v1/best-practices
  Description: Search best practice library
  Query:
    - industry: string (optional)
    - category: string (optional, "environmental", "social", "governance")
    - topic: string (optional, "emissions", "water", "waste", "diversity", etc.)
    - searchQuery: string (optional, full-text search)
    - page: number
    - limit: number
  Response:
    - practices: BestPractice[]
    - total: number

GET /v1/best-practices/:practiceId
  Description: Get best practice details
  Response:
    - practice: BestPractice
    - implementation: object (step-by-step guide)
    - caseStudies: CaseStudy[]
    - resources: Resource[] (tools, templates, guides)

POST /v1/best-practices/match
  Description: AI-match best practices to organization
  Request:
    - organizationId: string
    - category: string (optional)
    - maxResults: number (default: 10)
  Response:
    - matches: BestPracticeMatch[] (ranked by relevance)
  Events Published:
    - insights.best-practices.matched.v1

POST /v1/best-practices/:practiceId/adopt
  Description: Mark best practice as adopted/planned
  Request:
    - status: "shortlisted" | "in-progress" | "implemented" | "not-applicable"
    - implementationDate: Date (optional)
    - assignedTo: string (userId, optional)
    - notes: string (optional)
  Response:
    - adoption: BestPracticeAdoption
  Events Published:
    - insights.best-practice.adopted.v1
```

### 3.7 Executive Summary Endpoints

#### Generate Executive Summary
```yaml
POST /v1/executive-summaries/generate
  Description: Generate executive summary
  Request:
    - summaryType: "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "board"
    - organizationId: string
    - timeRange: { startDate: Date, endDate: Date }
    - audience: "ceo" | "cfo" | "cso" | "board" | "investors"
    - includeRecommendations: boolean (default: true)
    - maxInsights: number (default: 5)
  Response:
    - summaryId: string
    - summary: ExecutiveSummary
    - deliveryOptions: object (email, dashboard, PDF, PPT)
  Events Published:
    - insights.executive-summary.generated.v1

GET /v1/executive-summaries/:summaryId
  Description: Get executive summary
  Response:
    - summary: ExecutiveSummary
    - keyMetrics: Metric[]
    - highlights: Insight[]
    - concerns: Issue[]
    - recommendations: Recommendation[]

POST /v1/executive-summaries/:summaryId/deliver
  Description: Deliver summary via email/notification
  Request:
    - deliveryMethod: "email" | "notification" | "both"
    - recipients: string[] (userIds or email addresses)
    - scheduledTime: Date (optional, for scheduled delivery)
  Response:
    - success: boolean
    - deliveryId: string
```

---

## 4. Data Models

### 4.1 Core Entities

```typescript
// Insight Entity
interface Insight {
  id: string;
  organizationId: string;

  // Classification
  insightType: InsightType;
  category: ESGCategory;
  subcategory?: string;

  // Scope
  scope: InsightScope;
  scopeId: string; // organizationId, facilityId, metricId, etc.

  // Content
  title: string; // One-sentence headline
  description: string; // Detailed explanation (200-500 words)
  summary: string; // Short summary (50-100 words)

  // Data Context
  metricId?: string;
  metricName?: string;
  timeRange: TimeRange;
  dataSnapshot: object; // Key data points referenced

  // Analysis
  magnitude: number; // Size of change/impact
  magnitudeUnit: string;
  direction: 'positive' | 'negative' | 'neutral';
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';

  // Drivers
  primaryDrivers: Driver[];
  contributingFactors: Factor[];

  // Impact
  financialImpact?: number;
  environmentalImpact?: object;
  socialImpact?: object;
  reputationalImpact?: 'high' | 'medium' | 'low';

  // Quality
  confidence: number; // 0-100
  statisticalSignificance: number; // p-value
  dataQuality: DataQualityScore;

  // Prioritization
  priority: Priority;
  materiality: MaterialityLevel;
  actionability: number; // 0-100
  urgency: Urgency;

  // Status
  status: InsightStatus;
  publishedAt?: Date;
  expiresAt?: Date; // Time-sensitive insights

  // Relationships
  relatedInsights: string[]; // Related insight IDs
  relatedRecommendations: string[];
  relatedAnomalies: string[];

  // Feedback
  userFeedback: InsightFeedback[];
  avgHelpfulness?: number; // 0-5 stars

  // Metadata
  generatedBy: 'ai' | 'human' | 'hybrid';
  modelVersion?: string; // AI model version
  generatedAt: Date;
  reviewedBy?: string; // userId
  reviewedAt?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

enum InsightType {
  PERFORMANCE = 'performance', // Metric performance
  VARIANCE = 'variance', // Actual vs target/forecast/peer
  TREND = 'trend', // Multi-period trend
  CORRELATION = 'correlation', // Relationship between metrics
  FORECAST = 'forecast', // Future prediction
  RISK = 'risk', // Risk identification
  OPPORTUNITY = 'opportunity', // Improvement opportunity
  ANOMALY = 'anomaly', // Unusual pattern
  BENCHMARK = 'benchmark', // Peer comparison
}

enum InsightScope {
  ORGANIZATION = 'organization',
  BUSINESS_UNIT = 'business_unit',
  FACILITY = 'facility',
  DEPARTMENT = 'department',
  METRIC = 'metric',
  INITIATIVE = 'initiative',
  TARGET = 'target',
}

enum InsightStatus {
  DRAFT = 'draft', // Generated but not reviewed
  PUBLISHED = 'published', // Reviewed and published
  ARCHIVED = 'archived', // No longer relevant
  SUPERSEDED = 'superseded', // Replaced by newer insight
}

interface Driver {
  name: string;
  contributionPercent: number; // % of total change
  contributionAbsolute: number;
  unit: string;
  category: string; // 'volume', 'efficiency', 'mix', 'external'
  controllable: boolean; // Can be influenced by organization
  explanation: string;
}

interface Factor {
  name: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  explanation: string;
}

interface InsightFeedback {
  userId: string;
  helpful: boolean;
  accurate: boolean;
  actionable: boolean;
  comments?: string;
  submittedAt: Date;
}

// Root Cause Analysis Entity
interface RootCauseAnalysis {
  id: string;
  organizationId: string;

  // Scope
  metricId: string;
  metricName: string;
  timeRange: TimeRange;

  // Analysis Type
  analysisType: 'period-over-period' | 'actual-vs-target' | 'actual-vs-forecast' | 'actual-vs-peer';

  // Change Quantification
  baselineValue: number;
  currentValue: number;
  changeAbsolute: number;
  changePercent: number;
  changeDirection: 'increase' | 'decrease';
  unit: string;

  // Drivers
  primaryDrivers: Driver[]; // Top 3-5 drivers
  secondaryDrivers: Driver[];
  allDrivers: Driver[];

  // Decomposition
  decompositionTree: DecompositionNode;
  decompositionMethod: 'regression' | 'decision-tree' | 'shap' | 'time-series' | 'waterfall';

  // Narrative
  narrative: string; // Plain language explanation
  executiveSummary: string; // One-paragraph summary

  // Quality
  confidence: number; // 0-100
  dataCompleteness: number; // 0-100
  modelAccuracy?: number; // R-squared, RMSE, etc.

  // Visualizations
  visualizations: {
    waterfall?: object; // Waterfall chart data
    treeMap?: object; // Tree map data
    decompositionTree?: object; // Hierarchical tree
    timeline?: object; // Temporal analysis
  };

  // Recommendations
  relatedRecommendations: string[];

  // Metadata
  generatedAt: Date;
  generatedBy: string; // 'ai' | userId
  modelVersion?: string;
  tags: string[];
}

interface DecompositionNode {
  name: string;
  value: number;
  unit: string;
  contributionPercent: number;
  children?: DecompositionNode[]; // Hierarchical decomposition
  level: number; // Depth in tree
  category: string;
}

// Recommendation Entity
interface Recommendation {
  id: string;
  organizationId: string;

  // Classification
  category: ESGCategory;
  subcategory: string;
  recommendationType: RecommendationType;

  // Scope
  scope: 'organization' | 'facility' | 'department';
  scopeId: string;

  // Content
  title: string;
  description: string; // 200-300 words
  detailedDescription: string; // Full implementation guide

  // Impact
  expectedImpact: {
    primary: { metric: string; value: number; unit: string }; // e.g., "Reduce GHG by 500 tCO2e/year"
    secondary?: { metric: string; value: number; unit: string }[];
    financialImpact?: number; // Annual savings/revenue
  };

  // Cost
  estimatedCost: {
    capex?: number;
    opex?: number; // Annual
    total: number;
  };

  // ROI
  roi: {
    paybackPeriod: number; // Months
    npv?: number;
    irr?: number; // %
    carbonAbatementCost?: number; // $/tCO2e
  };

  // Implementation
  difficulty: Difficulty;
  estimatedTimeline: number; // Months
  implementationSteps: ImplementationStep[];
  dependencies: string[]; // Prerequisites
  risks: Risk[];
  successCriteria: string[];

  // Prioritization
  impactScore: number; // 0-100
  feasibilityScore: number; // 0-100
  urgencyScore: number; // 0-100
  compositeScore: number; // Weighted average

  // Evidence
  caseStudies: CaseStudy[];
  benchmarks: Benchmark[];
  sources: Source[];

  // Status
  status: RecommendationStatus;
  assignedTo?: string; // userId
  dueDate?: Date;
  implementationStartDate?: Date;
  implementationEndDate?: Date;

  // Tracking
  actualImpact?: object; // Recorded after implementation
  actualCost?: number;
  actualTimeline?: number;
  lessonsLearned?: string;

  // Relationships
  relatedInsights: string[];
  relatedTargets: string[];
  relatedInitiatives: string[];

  // Metadata
  generatedAt: Date;
  generatedBy: 'ai' | 'human';
  modelVersion?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

enum RecommendationType {
  QUICK_WIN = 'quick_win', // Low-effort, high-impact
  STRATEGIC_INITIATIVE = 'strategic_initiative', // High-effort, transformational
  PROCESS_IMPROVEMENT = 'process_improvement', // Operational efficiency
  TECHNOLOGY_UPGRADE = 'technology_upgrade', // Equipment, systems
  BEHAVIORAL_CHANGE = 'behavioral_change', // Training, awareness
  POLICY_CHANGE = 'policy_change', // Governance, procedures
  BEST_PRACTICE_ADOPTION = 'best_practice_adoption', // Industry practices
}

enum RecommendationStatus {
  PROPOSED = 'proposed',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  ON_HOLD = 'on_hold',
}

interface ImplementationStep {
  stepNumber: number;
  title: string;
  description: string;
  duration: number; // Days
  owner?: string; // Role or userId
  dependencies?: number[]; // Dependent step numbers
}

interface CaseStudy {
  companyName?: string; // May be anonymized
  industry: string;
  companySize: string;
  geography: string;
  implementation: string; // What they did
  results: object; // Quantified results
  timeframe: string;
  source: string; // URL or reference
}

// Narrative Entity
interface Narrative {
  id: string;
  organizationId: string;

  // Classification
  narrativeType: NarrativeType;
  category?: ESGCategory;

  // Scope
  scope: 'organization' | 'facility' | 'metric' | 'initiative';
  scopeId: string;
  timeRange: TimeRange;

  // Content
  title: string;
  text: string; // Generated narrative
  wordCount: number;

  // Configuration
  audience: Audience;
  tone: Tone;
  language: string; // ISO 639-1
  framework?: string; // GRI, SASB, TCFD, etc.

  // Source Data
  sourceData: object; // Data used for generation
  insights: string[]; // Insight IDs
  metrics: string[]; // Metric IDs

  // Quality
  confidence: number; // 0-100
  factChecks: FactCheck[];

  // Review
  status: NarrativeStatus;
  reviewedBy?: string; // userId
  reviewedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;

  // Versions
  versionNumber: number;
  previousVersions: string[]; // Previous narrative IDs

  // Exports
  exports: Export[];

  // Metadata
  generatedAt: Date;
  generatedBy: 'ai' | 'human';
  modelVersion?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

enum NarrativeType {
  EXECUTIVE_SUMMARY = 'executive_summary',
  PERFORMANCE_NARRATIVE = 'performance_narrative',
  VARIANCE_EXPLANATION = 'variance_explanation',
  TREND_NARRATIVE = 'trend_narrative',
  DISCLOSURE_STATEMENT = 'disclosure_statement',
  INVESTOR_UPDATE = 'investor_update',
  BOARD_REPORT = 'board_report',
  SECTION_CONTENT = 'section_content', // For report sections
}

enum NarrativeStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

enum Audience {
  EXECUTIVE = 'executive', // C-suite
  TECHNICAL = 'technical', // Experts
  PUBLIC = 'public', // General public
  INVESTOR = 'investor', // Investors, analysts
  REGULATOR = 'regulator', // Regulatory bodies
}

enum Tone {
  FORMAL = 'formal',
  CONVERSATIONAL = 'conversational',
  TECHNICAL = 'technical',
  MARKETING = 'marketing',
}

interface FactCheck {
  claim: string;
  sourceData: object;
  verified: boolean;
  confidence: number; // 0-100
  discrepancy?: string; // If not verified
}

interface Export {
  exportedAt: Date;
  format: 'docx' | 'pdf' | 'html' | 'markdown';
  fileUrl: string; // Temporary download URL
  expiresAt: Date;
}

// Anomaly Explanation Entity
interface AnomalyExplanation {
  id: string;
  organizationId: string;

  // Anomaly Reference
  anomalyId: string; // From ML Service
  metricId: string;
  metricName: string;

  // Anomaly Details
  detectedAt: Date;
  anomalyType: AnomalyType;
  severity: Severity;

  // Anomaly Quantification
  expectedValue: number;
  actualValue: number;
  deviation: number;
  deviationPercent: number;
  zScore: number; // Statistical significance

  // Explanation
  narrative: string; // Plain language
  summary: string; // One-sentence summary

  // Hypotheses
  hypotheses: Hypothesis[];

  // Contributing Factors
  contributingFactors: Factor[];

  // Context
  historicalContext: string; // Has this happened before?
  peerContext?: string; // How do peers compare?

  // Impact
  impact: {
    financial?: number;
    operational?: string;
    compliance?: string;
    reputational?: 'high' | 'medium' | 'low';
  };

  // Recommendations
  immediateActions: string[];
  investigativeActions: string[];
  preventiveActions: string[];
  recommendations: string[]; // Recommendation IDs

  // Investigation
  investigationTriggered: boolean;
  investigationId?: string;
  investigationStatus?: string;

  // Metadata
  generatedAt: Date;
  generatedBy: 'ai';
  modelVersion: string;
  tags: string[];
}

enum AnomalyType {
  SPIKE = 'spike', // Sudden increase
  DROP = 'drop', // Sudden decrease
  DRIFT = 'drift', // Gradual shift
  MISSING_DATA = 'missing_data', // Data gap
  OUTLIER = 'outlier', // Statistical outlier
}

interface Hypothesis {
  hypothesis: string;
  likelihood: number; // 0-100, probability score
  evidence: string[]; // Supporting evidence
  contraEvidence?: string[]; // Contradicting evidence
  validationSteps: string[]; // How to validate
}

// Best Practice Entity
interface BestPractice {
  id: string;

  // Classification
  category: ESGCategory;
  subcategory: string;
  topic: string; // 'emissions', 'water', 'waste', 'diversity', etc.

  // Content
  title: string;
  description: string; // 200-300 words
  benefits: string[];
  challenges: string[];

  // Implementation
  implementationGuide: ImplementationGuide;
  estimatedCost: CostRange;
  estimatedTimeline: string; // "3-6 months"
  difficulty: Difficulty;

  // Context
  industry: string[];
  companySize: string[]; // 'small', 'medium', 'large'
  geography: string[]; // Applicable regions
  maturityLevel: string; // 'beginner', 'intermediate', 'advanced'

  // Alignment
  frameworks: string[]; // GRI, SASB, CDP, ISO 14001, etc.
  certifications: string[]; // B Corp, LEED, etc.
  sdgs: number[]; // SDG numbers

  // Evidence
  caseStudies: CaseStudy[];
  expectedImpact: string; // Typical impact range

  // Resources
  resources: Resource[];

  // Metadata
  source: string;
  lastUpdated: Date;
  tags: string[];
}

interface ImplementationGuide {
  steps: ImplementationStep[];
  prerequisites: string[];
  keySuccessFactors: string[];
  commonPitfalls: string[];
  metrics: string[]; // How to measure success
}

interface CostRange {
  min: number;
  max: number;
  currency: string;
  notes: string; // "Varies by facility size"
}

interface Resource {
  title: string;
  type: 'guide' | 'template' | 'tool' | 'article' | 'video' | 'course';
  url?: string;
  description: string;
}

// Best Practice Match Entity
interface BestPracticeMatch {
  practiceId: string;
  practice: BestPractice;

  // Matching
  relevanceScore: number; // 0-100
  contextMatch: number; // 0-100 (industry, size, geography)
  gapMatch: number; // 0-100 (performance gap this addresses)
  feasibilityScore: number; // 0-100

  // Justification
  reasoning: string; // Why this practice is recommended

  // Expected Impact
  expectedImpact: object; // Quantified for this organization
  expectedROI: number; // %

  // Status
  status: 'matched' | 'shortlisted' | 'in-progress' | 'implemented' | 'not-applicable';
  matchedAt: Date;
}

// Executive Summary Entity
interface ExecutiveSummary {
  id: string;
  organizationId: string;

  // Classification
  summaryType: SummaryType;
  timeRange: TimeRange;
  audience: Audience;

  // Key Metrics
  keyMetrics: KeyMetric[];

  // Content Sections
  highlights: Insight[]; // Top 3 positive developments
  concerns: Issue[]; // Top 3 issues requiring attention
  insights: Insight[]; // Top 3-5 AI insights
  recommendations: Recommendation[]; // Top 3 priority actions
  outlook: string; // Forward-looking statement

  // Executive Overview
  executiveOverview: string; // One-paragraph summary

  // Delivery
  deliveryMethod: DeliveryMethod[];
  deliveredAt?: Date;
  recipients: string[]; // userIds or emails

  // Metadata
  generatedAt: Date;
  generatedBy: 'ai' | 'human';
  status: 'draft' | 'delivered';
  tags: string[];
}

enum SummaryType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  BOARD = 'board', // Board meeting summary
  AD_HOC = 'ad_hoc',
}

enum DeliveryMethod {
  EMAIL = 'email',
  NOTIFICATION = 'notification',
  DASHBOARD = 'dashboard',
  PDF = 'pdf',
  POWERPOINT = 'powerpoint',
}

interface KeyMetric {
  metricId: string;
  metricName: string;
  currentValue: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'stable';
  status: 'on-track' | 'at-risk' | 'off-track';
  unit: string;
}

interface Issue {
  title: string;
  description: string;
  severity: Severity;
  category: string;
  assignedTo?: string;
  dueDate?: Date;
}
```

### 4.2 Shared Types

```typescript
enum ESGCategory {
  ENVIRONMENTAL = 'environmental',
  SOCIAL = 'social',
  GOVERNANCE = 'governance',
  STRATEGIC = 'strategic',
}

enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

enum Severity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

enum Urgency {
  IMMEDIATE = 'immediate', // Act now
  HIGH = 'high', // Within 1 week
  MEDIUM = 'medium', // Within 1 month
  LOW = 'low', // Within 1 quarter
}

enum Difficulty {
  EASY = 'easy', // < 1 month, < $10K
  MODERATE = 'moderate', // 1-6 months, $10K-$100K
  HARD = 'hard', // > 6 months, > $100K
}

enum MaterialityLevel {
  CRITICAL = 'critical', // Top 5 material topics
  HIGH = 'high', // Top 10 material topics
  MEDIUM = 'medium', // Material but not top priority
  LOW = 'low', // Not material
}

interface TimeRange {
  startDate: Date;
  endDate: Date;
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
}

interface DataQualityScore {
  completeness: number; // 0-100
  accuracy: number; // 0-100
  timeliness: number; // 0-100
  consistency: number; // 0-100
  overall: number; // Weighted average
}

interface Risk {
  description: string;
  likelihood: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

interface Benchmark {
  peerGroup: string;
  peerAverage: number;
  peerMedian: number;
  peerTop10: number;
  organizationValue: number;
  percentile: number; // 0-100
}

interface Source {
  title: string;
  url?: string;
  type: 'research-paper' | 'case-study' | 'guideline' | 'standard' | 'article';
  publishedAt?: Date;
}
```

---

## 5. Integration Points

### 5.1 Upstream Dependencies

#### ML Service (3046)
- **Consumes**: ML predictions, forecasts, anomaly detections
- **Events Consumed**:
  - `ml.prediction.completed.v1` → Trigger forecast insights
  - `ml.anomaly.detected.v1` → Trigger anomaly explanation
  - `ml.model.retrained.v1` → Update insight generation models
- **API Calls**:
  - `GET /v1/predictions/:predictionId` → Get prediction details
  - `GET /v1/anomalies/:anomalyId` → Get anomaly details
  - `POST /v1/models/:modelId/explain` → Get SHAP explanations

#### Analytics Service (3045)
- **Consumes**: Aggregated metrics, trends, benchmarks
- **Events Consumed**:
  - `analytics.aggregation.completed.v1` → Trigger performance insights
  - `analytics.benchmark.updated.v1` → Trigger comparative insights
- **API Calls**:
  - `GET /v1/metrics/:metricId/trend` → Get trend data
  - `GET /v1/benchmarks` → Get peer benchmarks
  - `POST /v1/analytics/correlations` → Find correlations

#### All Domain Services
- **Consumes**: ESG data for insight generation
- **Events Consumed**:
  - `carbon.emission.calculated.v1` → Environmental insights
  - `workforce.metric.updated.v1` → Social insights
  - `board.composition.updated.v1` → Governance insights
- **API Calls**:
  - Service-specific data retrieval for context

#### Strategy Service (3042)
- **Consumes**: Targets, initiatives, KPIs
- **Events Consumed**:
  - `strategic.target.progress-updated.v1` → Target achievement insights
  - `strategic.initiative.completed.v1` → Initiative impact insights
- **API Calls**:
  - `GET /v1/targets/:targetId` → Get target details
  - `GET /v1/initiatives/:initiativeId/roi` → Get ROI data

#### Materiality Service (3041)
- **Consumes**: Material topics for prioritization
- **API Calls**:
  - `GET /v1/materiality/topics` → Get material topics (for insight prioritization)

### 5.2 Downstream Consumers

#### Reporting Service (3044)
- **Provides**: Narratives, insights, executive summaries for reports
- **Events Published**:
  - `insights.narrative.generated.v1` → New narrative available
  - `insights.executive-summary.generated.v1` → Summary ready
- **API Endpoints Used by Reporting**:
  - `POST /v1/narratives/generate` → Generate report sections
  - `GET /v1/insights` → Get insights for report
  - `POST /v1/executive-summaries/generate` → Generate summary

#### Notification Service (3008)
- **Provides**: Alerts for critical insights and recommendations
- **Events Published**:
  - `insights.insight.generated.v1` (if priority=critical) → Send alert
  - `insights.anomaly.explained.v1` (if severity=critical) → Send alert
  - `insights.executive-summary.generated.v1` → Deliver summary

#### Workflow Service (3009)
- **Provides**: Workflow triggers based on insights
- **Events Published**:
  - `insights.recommendation.generated.v1` → Trigger approval workflow
  - `insights.anomaly.explained.v1` → Trigger investigation workflow

#### Strategy Service (3042)
- **Provides**: Recommendations for strategy adjustments
- **Events Published**:
  - `insights.recommendation.generated.v1` → Link to initiatives

---

## 6. Event Schema

### 6.1 Published Events

```typescript
// Insight Generated Event
interface InsightGeneratedEventV1 {
  eventType: 'insights.insight.generated.v1';
  eventId: string;
  timestamp: Date;
  version: '1.0';

  data: {
    insightId: string;
    organizationId: string;
    insightType: InsightType;
    category: ESGCategory;
    title: string;
    summary: string;
    priority: Priority;
    confidence: number;
    metricId?: string;
    timeRange: TimeRange;
  };

  metadata: {
    correlationId: string;
    causationId: string;
    service: 'insights-service';
  };
}

// Root Cause Analyzed Event
interface RootCauseAnalyzedEventV1 {
  eventType: 'insights.root-cause.analyzed.v1';
  eventId: string;
  timestamp: Date;
  version: '1.0';

  data: {
    analysisId: string;
    organizationId: string;
    metricId: string;
    changePercent: number;
    primaryDrivers: Driver[];
    confidence: number;
  };

  metadata: {
    correlationId: string;
    causationId: string;
    service: 'insights-service';
  };
}

// Recommendation Generated Event
interface RecommendationGeneratedEventV1 {
  eventType: 'insights.recommendation.generated.v1';
  eventId: string;
  timestamp: Date;
  version: '1.0';

  data: {
    recommendationId: string;
    organizationId: string;
    title: string;
    category: ESGCategory;
    recommendationType: RecommendationType;
    expectedImpact: object;
    estimatedCost: number;
    roi: object;
    impactScore: number;
    feasibilityScore: number;
  };

  metadata: {
    correlationId: string;
    causationId: string;
    service: 'insights-service';
  };
}

// Narrative Generated Event
interface NarrativeGeneratedEventV1 {
  eventType: 'insights.narrative.generated.v1';
  eventId: string;
  timestamp: Date;
  version: '1.0';

  data: {
    narrativeId: string;
    organizationId: string;
    narrativeType: NarrativeType;
    wordCount: number;
    confidence: number;
    status: NarrativeStatus;
  };

  metadata: {
    correlationId: string;
    causationId: string;
    service: 'insights-service';
  };
}

// Anomaly Explained Event
interface AnomalyExplainedEventV1 {
  eventType: 'insights.anomaly.explained.v1';
  eventId: string;
  timestamp: Date;
  version: '1.0';

  data: {
    explanationId: string;
    anomalyId: string;
    organizationId: string;
    metricId: string;
    severity: Severity;
    hypotheses: Hypothesis[];
    recommendations: string[];
  };

  metadata: {
    correlationId: string;
    causationId: string;
    service: 'insights-service';
  };
}

// Executive Summary Generated Event
interface ExecutiveSummaryGeneratedEventV1 {
  eventType: 'insights.executive-summary.generated.v1';
  eventId: string;
  timestamp: Date;
  version: '1.0';

  data: {
    summaryId: string;
    organizationId: string;
    summaryType: SummaryType;
    audience: Audience;
    timeRange: TimeRange;
    keyMetrics: KeyMetric[];
  };

  metadata: {
    correlationId: string;
    causationId: string;
    service: 'insights-service';
  };
}
```

### 6.2 Consumed Events

```typescript
// From ML Service
interface PredictionCompletedEventV1 {
  eventType: 'ml.prediction.completed.v1';
  data: {
    predictionId: string;
    metricId: string;
    predictions: Prediction[];
  };
}

interface AnomalyDetectedEventV1 {
  eventType: 'ml.anomaly.detected.v1';
  data: {
    anomalyId: string;
    metricId: string;
    detectedAt: Date;
    severity: Severity;
  };
}

// From Analytics Service
interface AggregationCompletedEventV1 {
  eventType: 'analytics.aggregation.completed.v1';
  data: {
    metricId: string;
    organizationId: string;
    value: number;
    timeRange: TimeRange;
  };
}

// From Strategy Service
interface TargetProgressUpdatedEventV1 {
  eventType: 'strategic.target.progress-updated.v1';
  data: {
    targetId: string;
    progress: number; // % complete
    status: 'on-track' | 'at-risk' | 'off-track';
  };
}

// From Domain Services (example: Carbon Service)
interface EmissionCalculatedEventV1 {
  eventType: 'carbon.emission.calculated.v1';
  data: {
    calculationId: string;
    organizationId: string;
    totalEmissions: number;
    scope1: number;
    scope2: number;
    scope3: number;
  };
}
```

---

## 7. Business Logic

### 7.1 Insight Generation Algorithm

```typescript
class InsightGenerationService {
  async generateInsights(
    scope: InsightScope,
    scopeId: string,
    timeRange: TimeRange,
    options: InsightGenerationOptions
  ): Promise<Insight[]> {

    // 1. Extract data
    const data = await this.dataExtractionService.extract(scope, scopeId, timeRange);

    // 2. Apply pattern recognition
    const patterns = await this.patternRecognitionService.detect(data);

    // 3. Generate insights for each pattern
    const candidateInsights: Insight[] = [];

    for (const pattern of patterns) {
      const insight = await this.createInsight(pattern, data);
      candidateInsights.push(insight);
    }

    // 4. Prioritize insights
    const prioritizedInsights = await this.prioritizeInsights(
      candidateInsights,
      options.maxInsights || 10
    );

    // 5. Validate insights
    const validatedInsights = await this.validateInsights(prioritizedInsights);

    // 6. Generate narratives
    for (const insight of validatedInsights) {
      insight.description = await this.narrativeGenerator.generate(insight);
    }

    // 7. Publish if auto-publish enabled
    if (options.autoPublish) {
      for (const insight of validatedInsights) {
        await this.publishInsight(insight);
      }
    }

    return validatedInsights;
  }

  private async prioritizeInsights(
    insights: Insight[],
    maxResults: number
  ): Promise<Insight[]> {

    // Multi-criteria scoring
    for (const insight of insights) {
      const materialityScore = await this.getMaterialityScore(insight);
      const impactScore = this.calculateImpactScore(insight);
      const actionabilityScore = this.calculateActionabilityScore(insight);
      const timeliness = this.calculateTimelinessScore(insight);

      // Weighted composite score
      insight.priority = (
        materialityScore * 0.4 +
        impactScore * 0.3 +
        actionabilityScore * 0.2 +
        timeliness * 0.1
      );
    }

    // Sort by priority and take top N
    return insights
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxResults);
  }
}
```

### 7.2 Root Cause Analysis Algorithm

```typescript
class RootCauseAnalysisService {
  async performAnalysis(
    metricId: string,
    timeRange: TimeRange,
    analysisType: string
  ): Promise<RootCauseAnalysis> {

    // 1. Get baseline and current values
    const { baseline, current } = await this.getValues(metricId, timeRange, analysisType);

    const change = current - baseline;
    const changePercent = (change / baseline) * 100;

    // 2. Decompose metric into components
    const decomposition = await this.decomposeMetric(metricId, timeRange);

    // 3. Calculate driver contributions
    const drivers = await this.calculateDriverContributions(decomposition, change);

    // 4. Rank drivers by contribution
    const rankedDrivers = drivers
      .sort((a, b) => Math.abs(b.contributionAbsolute) - Math.abs(a.contributionAbsolute));

    const primaryDrivers = rankedDrivers.slice(0, 5);
    const secondaryDrivers = rankedDrivers.slice(5, 10);

    // 5. Generate narrative
    const narrative = await this.generateRootCauseNarrative(
      metricId,
      change,
      changePercent,
      primaryDrivers
    );

    // 6. Create visualizations
    const visualizations = {
      waterfall: this.createWaterfallData(drivers),
      treeMap: this.createTreeMapData(decomposition),
    };

    // 7. Generate recommendations
    const recommendations = await this.recommendationService.generateForRootCause(
      metricId,
      primaryDrivers
    );

    return {
      id: uuidv4(),
      organizationId: this.getOrganizationId(),
      metricId,
      timeRange,
      analysisType,
      baselineValue: baseline,
      currentValue: current,
      changeAbsolute: change,
      changePercent,
      primaryDrivers,
      secondaryDrivers,
      allDrivers: drivers,
      decompositionTree: decomposition,
      narrative,
      visualizations,
      relatedRecommendations: recommendations.map(r => r.id),
      generatedAt: new Date(),
      generatedBy: 'ai',
    };
  }

  private async decomposeMetric(
    metricId: string,
    timeRange: TimeRange
  ): Promise<DecompositionNode> {

    // Example: GHG emissions decomposition
    // Total = Scope 1 + Scope 2 + Scope 3
    // Scope 1 = Stationary Combustion + Mobile Combustion + Fugitive
    // Stationary Combustion = Facility A + Facility B + ...

    const metric = await this.metricService.getMetric(metricId);

    if (metric.name === 'Total GHG Emissions') {
      return this.decomposeGHGEmissions(timeRange);
    } else if (metric.name === 'Water Consumption') {
      return this.decomposeWaterConsumption(timeRange);
    } else {
      // Generic decomposition by organizational hierarchy
      return this.decomposeByHierarchy(metricId, timeRange);
    }
  }

  private async calculateDriverContributions(
    decomposition: DecompositionNode,
    totalChange: number
  ): Promise<Driver[]> {

    const drivers: Driver[] = [];

    // Traverse decomposition tree and calculate each node's contribution
    const traverse = (node: DecompositionNode) => {
      if (node.children && node.children.length > 0) {
        // Recurse into children
        node.children.forEach(child => traverse(child));
      } else {
        // Leaf node - this is a driver
        const contribution = node.value; // Change value
        const contributionPercent = (contribution / totalChange) * 100;

        drivers.push({
          name: node.name,
          contributionAbsolute: contribution,
          contributionPercent,
          unit: node.unit,
          category: node.category,
          controllable: this.isControllable(node),
          explanation: this.explainDriver(node),
        });
      }
    };

    traverse(decomposition);

    return drivers;
  }
}
```

### 7.3 Recommendation Generation Algorithm

```typescript
class RecommendationGenerationService {
  async generateRecommendations(
    scope: string,
    scopeId: string,
    goalType: string,
    constraints: Constraints
  ): Promise<Recommendation[]> {

    // 1. Identify performance gaps
    const gaps = await this.identifyGaps(scope, scopeId, goalType);

    // 2. Match best practices to gaps
    const practices = await this.bestPracticeService.matchPractices(gaps, constraints);

    // 3. Generate custom recommendations using LLM
    const llmRecommendations = await this.generateWithLLM(gaps, constraints);

    // 4. Combine and deduplicate
    const allRecommendations = [...practices, ...llmRecommendations];
    const uniqueRecommendations = this.deduplicate(allRecommendations);

    // 5. Estimate impact and cost for each
    for (const rec of uniqueRecommendations) {
      rec.expectedImpact = await this.estimateImpact(rec, scope, scopeId);
      rec.estimatedCost = await this.estimateCost(rec, scope, scopeId);
      rec.roi = this.calculateROI(rec.expectedImpact, rec.estimatedCost);
    }

    // 6. Score and rank
    for (const rec of uniqueRecommendations) {
      rec.impactScore = this.scoreImpact(rec.expectedImpact);
      rec.feasibilityScore = this.scoreFeasibility(rec.estimatedCost, rec.difficulty);
      rec.urgencyScore = this.scoreUrgency(gaps);
      rec.compositeScore = this.calculateCompositeScore(rec);
    }

    const rankedRecommendations = uniqueRecommendations
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 20); // Top 20

    // 7. Enrich with case studies
    for (const rec of rankedRecommendations) {
      rec.caseStudies = await this.findCaseStudies(rec);
    }

    return rankedRecommendations;
  }

  private async generateWithLLM(
    gaps: PerformanceGap[],
    constraints: Constraints
  ): Promise<Recommendation[]> {

    const prompt = this.buildPrompt(gaps, constraints);

    const response = await this.llmService.complete({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an ESG expert. Generate actionable recommendations...'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Parse LLM response into structured recommendations
    const recommendations = this.parseLLMResponse(response.content);

    return recommendations;
  }

  private buildPrompt(gaps: PerformanceGap[], constraints: Constraints): string {
    return `
      Generate 5-10 specific, actionable recommendations to close the following ESG performance gaps:

      ${gaps.map(g => `- ${g.metric}: ${g.currentValue} (Target: ${g.targetValue}, Gap: ${g.gap})`).join('\n')}

      Constraints:
      - Max budget: ${constraints.maxBudget}
      - Max timeline: ${constraints.maxTimeline} months

      For each recommendation, provide:
      1. Title (concise)
      2. Description (200-300 words)
      3. Expected impact (quantified)
      4. Estimated cost (range)
      5. Timeline (months)
      6. Difficulty (easy/moderate/hard)
      7. Implementation steps (5-10 steps)

      Format as JSON array.
    `;
  }
}
```

### 7.4 Natural Language Generation Algorithm

```typescript
class NarrativeGenerationService {
  async generateNarrative(
    narrativeType: NarrativeType,
    scope: string,
    scopeId: string,
    timeRange: TimeRange,
    options: NarrativeOptions
  ): Promise<Narrative> {

    // 1. Extract data
    const data = await this.dataExtractionService.extract(scope, scopeId, timeRange);

    // 2. Get insights
    const insights = await this.insightService.getInsights(scope, scopeId, timeRange);

    // 3. Build context object
    const context = {
      data,
      insights,
      organization: await this.getOrganization(scopeId),
      industry: await this.getIndustry(scopeId),
      framework: options.framework,
      audience: options.audience,
      tone: options.tone,
    };

    // 4. Select template
    const template = await this.templateService.getTemplate(narrativeType, options.framework);

    // 5. Generate narrative using LLM
    const narrative = await this.generateWithLLM(template, context, options);

    // 6. Fact-check
    const factChecks = await this.factCheckNarrative(narrative, data);

    // 7. Calculate confidence
    const confidence = this.calculateConfidence(factChecks);

    // 8. Save narrative
    const savedNarrative = await this.narrativeRepository.save({
      id: uuidv4(),
      organizationId: this.getOrganizationId(),
      narrativeType,
      scope,
      scopeId,
      timeRange,
      title: this.extractTitle(narrative),
      text: narrative,
      wordCount: this.countWords(narrative),
      audience: options.audience,
      tone: options.tone,
      language: options.language || 'en',
      framework: options.framework,
      sourceData: data,
      insights: insights.map(i => i.id),
      confidence,
      factChecks,
      status: confidence >= 80 ? NarrativeStatus.APPROVED : NarrativeStatus.REVIEW,
      generatedAt: new Date(),
      generatedBy: 'ai',
      modelVersion: 'gpt-4-turbo-2024',
    });

    return savedNarrative;
  }

  private async generateWithLLM(
    template: Template,
    context: Context,
    options: NarrativeOptions
  ): Promise<string> {

    const prompt = this.buildNarrativePrompt(template, context, options);

    const response = await this.llmService.complete({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt(options.audience, options.tone)
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5, // Lower temperature for factual content
      max_tokens: options.wordLimit ? options.wordLimit * 2 : 2000,
    });

    return response.content;
  }

  private getSystemPrompt(audience: Audience, tone: Tone): string {
    const audiencePrompts = {
      [Audience.EXECUTIVE]: 'You are writing for C-suite executives. Be concise, strategic, and business-focused.',
      [Audience.TECHNICAL]: 'You are writing for ESG experts. Use technical terminology and provide detailed analysis.',
      [Audience.PUBLIC]: 'You are writing for the general public. Use plain language and avoid jargon.',
      [Audience.INVESTOR]: 'You are writing for investors and analysts. Focus on financial materiality and forward-looking insights.',
    };

    const tonePrompts = {
      [Tone.FORMAL]: 'Use formal, professional language.',
      [Tone.CONVERSATIONAL]: 'Use conversational, accessible language.',
      [Tone.TECHNICAL]: 'Use technical, precise language.',
    };

    return `${audiencePrompts[audience]} ${tonePrompts[tone]} Always cite specific data and metrics.`;
  }

  private async factCheckNarrative(narrative: string, data: object): Promise<FactCheck[]> {

    // Extract claims from narrative (numbers, statements)
    const claims = this.extractClaims(narrative);

    const factChecks: FactCheck[] = [];

    for (const claim of claims) {
      const verified = await this.verifyClaim(claim, data);
      factChecks.push({
        claim: claim.text,
        sourceData: claim.sourceData,
        verified,
        confidence: verified ? 100 : 0,
        discrepancy: verified ? undefined : claim.discrepancy,
      });
    }

    return factChecks;
  }
}
```

---

## 8. Security & Compliance

### 8.1 Authentication & Authorization
- All API endpoints require JWT authentication
- Role-based access control (RBAC):
  - **Admin**: Full access to all insights and recommendations
  - **ESG Manager**: Create, edit, publish insights for their organization
  - **Analyst**: Create and edit insights (require approval to publish)
  - **Viewer**: Read-only access to published insights
- Service-to-service authentication for internal API calls
- API key authentication for LLM services (OpenAI, Anthropic)

### 8.2 Data Security
- Encrypt sensitive insight data at rest (MongoDB encryption)
- TLS 1.3 for all data in transit
- Redact PII from narratives (anonymization)
- Access audit logging for all insight operations
- Secure LLM API calls (no data retention by LLM providers)
- Prompt injection protection (sanitize user inputs)

### 8.3 Compliance
- **Explainable AI**: All AI-generated insights include confidence scores and source data
- **Human-in-the-Loop**: Low-confidence insights flagged for review
- **Audit Trail**: Track all insight generation, edits, and approvals
- **Data Lineage**: Trace insights back to source data
- **Bias Detection**: Monitor for AI bias in recommendations
- **GDPR**: Right to explanation for AI decisions

### 8.4 Rate Limiting
- LLM API rate limits (tokens per minute):
  - OpenAI GPT-4: 40K TPM (Tier 1)
  - Anthropic Claude: 100K TPM
- Implement token bucket algorithm
- Queue long-running insight generation jobs
- Cache frequently requested narratives

---

## 9. Performance Requirements

### 9.1 API Response Times
- Insight retrieval: < 200ms (p95)
- Insight generation (async): Job creation < 500ms, completion < 10s for 100 data points
- Root cause analysis: < 10s for single metric
- Recommendation generation (async): < 30s for 10 recommendations
- Narrative generation: < 5s for 500-word narrative
- Anomaly explanation: < 5s
- Executive summary: < 10s

### 9.2 Throughput
- Handle 100 concurrent insight generation requests
- Process 1,000 insights per hour (batch generation)
- Generate 500 narratives per hour
- Support 10,000 insight reads per minute

### 9.3 Scalability
- Horizontal scaling for API servers (Kubernetes HPA)
- Asynchronous processing for long-running tasks (BullMQ)
- LLM request queuing and batching
- Redis caching for frequently accessed insights
- MongoDB sharding for large insight collections

### 9.4 Caching Strategy
- Cache insights for 1 hour (configurable TTL)
- Cache narratives for 24 hours
- Cache best practice library for 7 days
- Invalidate cache on data updates

---

## 10. Monitoring & Observability

### 10.1 Key Metrics
- **Insight Generation**:
  - Insights generated per hour
  - Average generation time
  - Insight confidence distribution
  - Insight approval rate (published / generated)
- **LLM Performance**:
  - LLM API latency (OpenAI, Claude)
  - Token consumption (TPM)
  - LLM error rate
  - Cost per insight
- **User Engagement**:
  - Insights viewed
  - Insights acted upon (recommendation adopted)
  - User feedback scores (helpfulness, accuracy)
  - Narrative approval rate
- **Data Quality**:
  - Fact-check pass rate
  - Confidence score distribution
  - Human override rate (AI insights rejected)

### 10.2 Alerts
- **Critical**:
  - LLM API down (OpenAI, Claude)
  - Insight generation failure rate > 10%
  - Fact-check failure rate > 20%
- **Warning**:
  - Insight generation time > 30s
  - LLM token limit approaching
  - Cache hit rate < 50%

### 10.3 Logging
- Log all insight generation requests (input, output, confidence)
- Log all LLM API calls (prompt, response, tokens used)
- Log all fact-check results
- Log user feedback
- Correlation ID for request tracing

### 10.4 Dashboards
- Insight generation dashboard (volume, latency, confidence)
- LLM performance dashboard (latency, token usage, cost)
- User engagement dashboard (views, actions, feedback)
- Data quality dashboard (fact-checks, confidence, overrides)

---

## 11. Testing Strategy

### 11.1 Unit Tests (Target: 85%)
- Insight generation logic
- Root cause decomposition algorithms
- Recommendation ranking algorithms
- Narrative fact-checking
- Priority scoring
- Driver contribution calculations

### 11.2 Integration Tests
- LLM API integration (OpenAI, Claude)
- ML Service integration (predictions, anomalies)
- Analytics Service integration (metrics, trends)
- Event publishing and consumption
- Database operations (CRUD)

### 11.3 End-to-End Tests
- Generate insights for organization → Verify insights created
- Perform root cause analysis → Verify drivers identified
- Generate recommendations → Verify recommendations ranked
- Generate narrative → Verify narrative accuracy
- Explain anomaly → Verify explanation completeness
- Generate executive summary → Verify summary content

### 11.4 LLM Quality Tests
- **Prompt Engineering Tests**: Validate prompts produce expected outputs
- **Fact-Check Tests**: Verify narratives match source data
- **Bias Tests**: Check for bias in recommendations
- **Consistency Tests**: Same input → similar output (within variance)
- **Hallucination Tests**: Detect fabricated data in narratives

### 11.5 Performance Tests
- Load test: 100 concurrent insight generation requests
- Stress test: 1,000 insight generations in 1 hour
- LLM rate limit handling (graceful degradation)
- Cache hit rate validation

---

## 12. Deployment

### 12.1 Infrastructure
- **Compute**: Kubernetes (AWS EKS)
  - API pods: 3 replicas (auto-scale 3-10)
  - Worker pods: 5 replicas (async processing)
- **Database**: MongoDB Atlas (M30 cluster, 3-node replica set)
- **Cache**: Redis (ElastiCache, 3-node cluster)
- **Message Queue**: BullMQ (Redis-backed)
- **LLM APIs**: OpenAI, Anthropic (external SaaS)

### 12.2 Environment Variables
```bash
# Service
SERVICE_NAME=insights-service
PORT=3050
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...

# LLM APIs
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
ANTHROPIC_API_KEY=sk-ant-...

# Integration
ML_SERVICE_URL=http://ml-service:3046
ANALYTICS_SERVICE_URL=http://analytics-service:3045
STRATEGY_SERVICE_URL=http://strategy-service:3042

# Event Bus
KAFKA_BROKERS=kafka-1:9092,kafka-2:9092
KAFKA_TOPIC_PREFIX=insights

# Configuration
MAX_INSIGHTS_PER_REQUEST=50
INSIGHT_CACHE_TTL=3600 # 1 hour
NARRATIVE_CACHE_TTL=86400 # 24 hours
LLM_TIMEOUT=30000 # 30 seconds
MAX_LLM_TOKENS=4000
```

### 12.3 CI/CD Pipeline
```yaml
# .github/workflows/insights-service.yml
name: Insights Service CI/CD

on:
  push:
    branches: [develop, main]
    paths:
      - 'services/insights-service/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t insights-service:${{ github.sha }} .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI
          docker push insights-service:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to EKS
        run: |
          kubectl set image deployment/insights-service insights-service=insights-service:${{ github.sha }}
```

---

## 13. Cost Estimation

### 13.1 Infrastructure Costs (Monthly)
- **Compute (EKS)**: $400 (8 pods × $50/pod)
- **MongoDB Atlas (M30)**: $500
- **Redis ElastiCache**: $100
- **Data Transfer**: $50
- **Total Infrastructure**: $1,050/month

### 13.2 LLM API Costs (Monthly)
- **OpenAI GPT-4**:
  - Narrative generation: 1,000 narratives/month × 1,000 tokens avg = 1M tokens
  - Cost: 1M tokens × $0.03/1K = $30
- **OpenAI GPT-4-Turbo**:
  - Insight generation: 10,000 insights/month × 500 tokens avg = 5M tokens
  - Cost: 5M tokens × $0.01/1K = $50
- **Anthropic Claude**:
  - Complex analysis: 500 analyses/month × 2,000 tokens avg = 1M tokens
  - Cost: 1M tokens × $0.015/1K = $15
- **Total LLM Costs**: $95/month (light usage, scales with volume)

### 13.3 Total Monthly Cost
- **Infrastructure**: $1,050
- **LLM APIs**: $95 (light usage, can be $500-$2,000 for heavy usage)
- **Total**: $1,145/month (light), $1,550/month (moderate), $3,050/month (heavy)

**Note**: LLM costs scale with usage. Implement caching and token limits to control costs.

---

## 14. Future Enhancements (Phase 7+)

### 14.1 Advanced AI Features
- **Multi-modal Insights**: Analyze images, videos, PDFs (e.g., sustainability reports)
- **Voice Insights**: Voice-based insight delivery (Alexa, Google Home integration)
- **Conversational Insights**: ChatGPT-style interface for exploring insights
- **Auto-Generated Presentations**: PowerPoint deck generation from insights
- **Real-Time Insights**: Streaming insights as data arrives

### 14.2 Enhanced Narratives
- **Multi-Language Support**: Auto-translate narratives (100+ languages)
- **Branded Templates**: Customizable templates with org branding
- **Video Narratives**: Auto-generate video explainers (text-to-video)
- **Interactive Narratives**: Embedded charts, drill-down capabilities

### 14.3 Advanced Analytics
- **Causal Inference**: Beyond correlation to causation (counterfactual analysis)
- **Prescriptive Analytics**: Not just "what to do" but "how to do it"
- **Reinforcement Learning**: Learn from implementation outcomes to improve recommendations
- **Scenario Simulation**: "What-if" scenario modeling

### 14.4 Collaboration
- **Insight Commenting**: Collaborate on insights (threaded discussions)
- **Insight Versioning**: Track edits and changes over time
- **Insight Sharing**: Share insights externally (investors, customers)
- **Insight Subscriptions**: Subscribe to specific insight types

---

## 15. Success Metrics

### 15.1 Launch Criteria (Month 24)
- [ ] 95% of insights have confidence > 80%
- [ ] 90% fact-check pass rate for narratives
- [ ] < 5s average narrative generation time
- [ ] 85% unit test coverage
- [ ] 70% integration test coverage
- [ ] LLM API uptime > 99.9%
- [ ] < 200ms API response time (p95)

### 15.2 Adoption Metrics (6 months post-launch)
- 80% of organizations use automated insights weekly
- 50% of recommendations acted upon
- 70% of reports include AI-generated narratives
- 90% user satisfaction score (insights helpful)
- 30% reduction in manual analysis time

### 15.3 Quality Metrics
- 95% fact-check pass rate
- 90% narrative approval rate (no human edits needed)
- < 5% insight override rate (human rejection)
- 4.5+ average user feedback score (out of 5)

---

## 16. Implementation Roadmap

### Month 22 (Sprint 22): Foundation
- [ ] Service scaffold (NestJS)
- [ ] MongoDB collections setup
- [ ] LLM API integration (OpenAI, Claude)
- [ ] Insight entity CRUD
- [ ] Basic insight generation (trend, variance)
- [ ] Unit tests (target: 50%)

### Month 23 (Sprint 23): Core Features
- [ ] Root cause analysis (decomposition, driver identification)
- [ ] Recommendation generation (best practice matching, LLM-generated)
- [ ] Narrative generation (executive summary, performance narrative)
- [ ] Fact-checking logic
- [ ] Integration with ML Service, Analytics Service
- [ ] Unit tests (target: 70%)

### Month 24 (Sprint 24): Advanced Features & Launch
- [ ] Anomaly explanation
- [ ] Best practice library (1,000+ practices)
- [ ] Executive summaries (daily, weekly, monthly)
- [ ] Notification integration (critical insights)
- [ ] Reporting integration (narratives for reports)
- [ ] Performance optimization (caching, batching)
- [ ] Security hardening (prompt injection protection)
- [ ] Unit tests (target: 85%)
- [ ] Integration tests (target: 70%)
- [ ] E2E tests (critical paths)
- [ ] Load testing (100 concurrent requests)
- [ ] Documentation (API docs, user guides)
- [ ] **Production launch** 🚀

---

## 17. Dependencies & Risks

### 17.1 Critical Dependencies
- **LLM APIs (OpenAI, Anthropic)**: Service unavailable if LLM APIs down
  - **Mitigation**: Multi-provider strategy (fallback to Claude if OpenAI down), cache frequently generated content
- **ML Service**: Anomaly explanations depend on anomaly detection
  - **Mitigation**: Graceful degradation (show anomaly without explanation)
- **Analytics Service**: Insights require aggregated metrics
  - **Mitigation**: Direct data access as fallback

### 17.2 Technical Risks
- **LLM Hallucinations**: AI generates incorrect narratives
  - **Mitigation**: Fact-checking, confidence scoring, human-in-the-loop review
- **LLM Costs**: High token usage → high costs
  - **Mitigation**: Token limits, caching, prompt optimization
- **Prompt Injection**: Malicious user inputs manipulate LLM
  - **Mitigation**: Input sanitization, prompt engineering
- **Data Quality**: Poor data → poor insights
  - **Mitigation**: Data quality checks, confidence thresholds

### 17.3 Business Risks
- **Low Adoption**: Users don't trust AI insights
  - **Mitigation**: Explainability, human review, gradual rollout, user training
- **Regulatory Concerns**: AI bias, explainability requirements
  - **Mitigation**: Explainable AI, bias detection, audit trail

---

## 18. Appendices

### Appendix A: Glossary
- **Insight**: AI-generated observation about ESG data patterns
- **Root Cause Analysis**: Decomposition of metric changes into contributing factors
- **Driver**: Factor contributing to metric change
- **Recommendation**: AI-generated actionable suggestion for improvement
- **Narrative**: Natural language text generated by AI
- **Fact-Check**: Validation of narrative claims against source data
- **Confidence Score**: 0-100 score indicating AI certainty
- **Hallucination**: AI-generated content not grounded in data

### Appendix B: LLM Model Selection
| Use Case | Model | Reasoning |
|----------|-------|-----------|
| Insight Generation | GPT-4-Turbo | Fast, cost-effective, high quality |
| Root Cause Analysis | GPT-4 or Claude 2.1 | Complex reasoning required |
| Recommendations | GPT-4 | Nuanced, context-aware suggestions |
| Narratives (Executive) | GPT-4 | Professional tone, accuracy |
| Narratives (Technical) | Claude 2.1 | Long context, detailed analysis |
| Anomaly Explanation | GPT-4-Turbo | Fast, accurate |

### Appendix C: Best Practice Categories
- **Environmental**: Emissions reduction, energy efficiency, water conservation, waste management, biodiversity
- **Social**: Diversity & inclusion, employee engagement, health & safety, community investment
- **Governance**: Board diversity, ethics & compliance, risk management, transparency

### Appendix D: Prompt Engineering Best Practices
1. **Be Specific**: Clear, detailed instructions
2. **Provide Context**: Background information, constraints
3. **Use Examples**: Few-shot prompting for consistent output
4. **Request Structured Output**: JSON, bullet points
5. **Set Guardrails**: "Do not hallucinate", "Cite data sources"
6. **Test Iteratively**: Refine prompts based on output quality

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-22
**Author**: ESG Platform Architecture Team
**Status**: Final - Ready for Implementation

---

## 🎉 FINAL SERVICE COMPLETE 🎉

**Congratulations! This is the 50th and final service specification of the Clenergize V3 ESG Platform.**

**Platform Summary**:
- **Total Services**: 50
- **Total Story Points**: ~1,850
- **Estimated Timeline**: 24 months
- **Total Infrastructure Cost**: ~$132K/year
- **Development Effort**: ~7 developers + 30+ Claude agents

**Next Steps**:
1. Review all 50 service specifications for consistency
2. Finalize service dependency diagram
3. Prioritize implementation phases
4. Begin Sprint 1 development (Identity Service)

**The Clenergize V3 ESG Platform is now fully specified and ready for development!** 🚀
