# Service Specification: Training Service

## Service Overview

**Service Name**: Training Service
**Port**: 3030
**Purpose**: Manages employee training programs, skills development, compliance training, career development, and learning effectiveness metrics for ESG reporting - with STRICT data privacy and anonymization requirements
**Domain**: Social - Training & Development (Learning & Development)
**Team Ownership**: Social Domain Team
**Phase**: 4 (Social Domain)
**Story Points**: 30
**Sprint Allocation**: 2 sprints (4 weeks)

## 🚨 CRITICAL PRIVACY WARNING

> **ZERO TOLERANCE FOR PII IN TRAINING REPORTING**
>
> This service handles SENSITIVE employee training and development data. ALL ESG reporting MUST use:
> - **Aggregated data ONLY** (minimum group size: 5 employees)
> - **Anonymized metrics** (no individual training records)
> - **Statistical noise** (differential privacy for small groups)
> - **NO personal identifiers** (names, employee IDs, emails, individual certifications)
> - **GDPR/CCPA compliance** (right to be forgotten, data minimization)
>
> **Violations may result in**:
> - Regulatory fines (€20M or 4% of revenue under GDPR)
> - Reputational damage
> - Loss of employee trust
> - Legal liability
> - Discrimination claims (if training data reveals protected characteristics)

## 1. Functional Requirements

### 1.1 Core Features

#### Training Catalog Management
- Course catalog management (technical, leadership, compliance, soft skills, ESG)
- Course metadata (title, description, objectives, duration, delivery method)
- Training types (instructor-led, e-learning, blended, on-the-job, mentoring)
- Training categories (technical, leadership, compliance, ESG, soft skills, digital)
- Training providers (internal, external, universities, certification bodies)
- Course prerequisites and learning paths
- Course materials management (documents, videos, assessments)
- Course versioning (updates, deprecations)
- Course expiration policies (certifications, compliance training)
- Course capacity and scheduling (for instructor-led training)
- Multi-language support (course content localization)
- Accessibility compliance (WCAG 2.1 for e-learning)

**Privacy Controls**:
- NO individual enrollment data stored in Training Service
- Only aggregated participation metrics
- Course catalog public (no privacy concerns)

#### Training Metrics (ANONYMIZED)
- Training hours per employee (average, median by job category)
- Training participation rates (percentage by demographics)
- Training completion rates (percentage by course, category)
- Training investment ($ per employee, by category)
- Training ROI (business impact correlation)
- Skills gap closure (before/after assessments)
- Training utilization (capacity utilization for instructor-led)
- Training cost per hour (total cost / total hours)
- Training hours by delivery method (instructor-led vs. e-learning)
- Training hours by category (technical, leadership, compliance, ESG)
- Year-over-year training trends (historical comparisons)
- Benchmark comparisons (industry averages, peer companies)

**Privacy Controls**:
- ALL metrics aggregated (minimum group size: 5)
- NO individual training hours exposed
- Aggregation by role, location, demographics (with k-anonymity)
- Suppression of small groups (<5 employees)

#### Compliance Training (AGGREGATED)
- Mandatory training assignment (safety, ethics, DEI, cybersecurity, anti-corruption)
- Certification tracking (certifications earned, expiration dates)
- Completion status tracking (aggregated percentages)
- Delinquency tracking (percentage overdue, NOT individual names)
- Certification expiration alerts (for HR systems, not individual emails)
- Regulatory compliance verification (attestations, evidence)
- Attestation management (signed acknowledgments - stored in LMS)
- Recertification requirements (periodic renewals)
- Compliance reporting (audit-ready reports)
- Escalation workflows (for delinquent compliance training)

**Privacy Controls**:
- Individual compliance status stored in LMS ONLY (not in Training Service)
- Training Service stores aggregated compliance rates
- Delinquency percentage (not individual names)
- Certification expirations handled by LMS (Training Service receives events)
- k-anonymity for compliance metrics (minimum 5 employees)

#### Skills Development (ANONYMIZED)
- Skills taxonomy management (skills library, competency models)
- Skills categories (technical, digital, green, leadership, soft)
- Skills proficiency levels (novice, intermediate, advanced, expert)
- Skills assessments (self-assessment, manager assessment, 360-degree)
- Skills gap analysis (current vs. required skills)
- Upskilling programs (internal mobility, career transitions)
- Reskilling programs (workforce transformation, green transition)
- Green skills training (sustainability, circular economy, renewable energy)
- Digital skills training (AI, data science, cloud, cybersecurity)
- Skills inventory (aggregated: % of workforce with skill X)
- Future skills forecasting (skills needed for strategy execution)

**Privacy Controls**:
- Individual skills profiles stored in HRIS ONLY (not in Training Service)
- Training Service stores aggregated skills inventory
- Skills gap analysis at role level (not individual level)
- Minimum group size 5 for skills metrics
- NO individual skills assessment scores

#### Career Development (ANONYMIZED)
- Career pathing (available career paths by role)
- Individual development plans (IDPs - stored in HRIS, not Training Service)
- Mentorship programs (program participation rates, not mentor-mentee pairs)
- Leadership development programs (program enrollment, completion rates)
- High-potential (HiPo) talent development (percentage identified, NOT names)
- Internal mobility support (training for internal moves)
- Succession planning support (readiness assessment training)
- Career transition programs (outplacement, reskilling)
- Tuition reimbursement programs (participation rates, investment)
- Sabbatical programs (participation rates)

**Privacy Controls**:
- IDPs stored in HRIS/LMS ONLY (not in Training Service)
- Training Service tracks program participation rates (aggregated)
- NO individual development plans exposed
- Mentorship program metrics (# of mentors/mentees, satisfaction) - NOT pairs
- HiPo percentage (not individual names)

#### LMS Integration (DATA SYNC LAYER)
- Course catalog synchronization (from LMS to Training Service)
- Enrollment management (enrollment events from LMS)
- Completion tracking (completion events from LMS)
- Assessment scores (aggregated scores from LMS)
- Certification management (certification events from LMS)
- Learning paths (learning path definitions from LMS)
- Real-time data sync (incremental updates)
- Batch data sync (full catalog refresh, weekly)
- Data quality validation (completeness, consistency)
- Conflict resolution (LMS is source of truth)
- Anonymization pipeline (strip PII before storage)

**Privacy Controls**:
- LMS is source of truth for individual training records
- Training Service receives only aggregated data OR anonymized events
- NO individual enrollment/completion records stored in Training Service
- Only aggregated metrics retained for ESG reporting
- PII stripped during sync (names, emails, employee IDs)

#### Training Effectiveness (ANONYMIZED)
- Kirkpatrick Level 1: Reaction (course satisfaction surveys - aggregated)
- Kirkpatrick Level 2: Learning (pre/post assessment scores - aggregated)
- Kirkpatrick Level 3: Behavior (manager feedback on behavior change - aggregated)
- Kirkpatrick Level 4: Results (business outcome correlation - aggregated)
- Net Promoter Score (NPS) for training (aggregated by course/category)
- Training impact on performance (correlation analysis - aggregated)
- Training impact on retention (correlation analysis - aggregated)
- Training impact on promotion rates (correlation analysis - aggregated)
- Skills application on the job (manager surveys - aggregated)
- Business outcome tracking (safety incidents, quality, productivity)

**Privacy Controls**:
- ALL effectiveness metrics aggregated (minimum group size: 10 for surveys)
- NO individual assessment scores
- NO individual feedback (only aggregated sentiment)
- Correlation analysis at group level (not individual level)

#### ESG-Specific Training (AGGREGATED)
- Sustainability training participation (percentage by role, location)
- Human rights training (mandatory for supply chain roles)
- DEI training (diversity, equity, inclusion - participation rates)
- Ethics and anti-corruption training (completion rates, attestations)
- Health and safety training (OSHA, ISO 45001 requirements)
- Environmental training (ISO 14001, environmental management)
- Supply chain responsibility training (modern slavery, due diligence)
- Cybersecurity awareness training (phishing, data protection)
- Data privacy training (GDPR, CCPA compliance)
- Climate change training (TCFD, net-zero, SBTi)
- Circular economy training (waste reduction, recycling)
- Biodiversity training (nature-positive practices)

**Privacy Controls**:
- Aggregated participation rates ONLY
- Compliance training completion rates (percentage, not individual records)
- NO individual ESG training records
- Minimum group size 5 for ESG training metrics

### 1.2 API Endpoints

#### Training Catalog
```yaml
GET /v1/training/catalog
  Query:
    - organizationId: string (required)
    - category: "technical" | "leadership" | "compliance" | "ESG" | "soft-skills" | "digital"
    - deliveryMethod: "instructor-led" | "e-learning" | "blended" | "on-the-job"
    - language: string (ISO 639-1 code)
    - status: "active" | "archived" | "draft"
    - page: number (default: 1)
    - limit: number (default: 50)
  Response:
    - courses: array
        - courseId: string
        - title: string
        - description: string
        - category: string
        - deliveryMethod: string
        - duration: number (hours)
        - provider: string
        - cost: number
        - expirationPolicy: string (e.g., "12 months")
        - prerequisites: array<string>
        - learningObjectives: array<string>
        - languages: array<string>
    - totalCount: number
    - page: number
    - limit: number
  Privacy:
    - Course catalog is public (no privacy concerns)

POST /v1/training/catalog
  Request:
    - organizationId: string
    - title: string
    - description: string
    - category: "technical" | "leadership" | "compliance" | "ESG" | "soft-skills"
    - deliveryMethod: string
    - duration: number (hours)
    - provider: string
    - cost: number
    - expirationPolicy: string (e.g., "12 months" for certifications)
    - prerequisites: array<string>
    - learningObjectives: array<string>
    - materials: array<object>
    - correlationId: string
  Response:
    - courseId: string
    - status: "created"
    - message: "Course created successfully"
  Privacy:
    - No privacy concerns (catalog metadata)

PUT /v1/training/catalog/:courseId
  Request:
    - Same as POST (partial updates allowed)
    - correlationId: string
  Response:
    - courseId: string
    - status: "updated"
    - message: "Course updated successfully"
  Privacy:
    - No privacy concerns (catalog metadata)

DELETE /v1/training/catalog/:courseId
  Response:
    - status: "archived"
    - message: "Course archived (not deleted, to preserve historical data)"
  Privacy:
    - Archive (not delete) to preserve historical training metrics
```

#### Training Metrics (ANONYMIZED)
```yaml
GET /v1/training/metrics/summary
  Query:
    - organizationId: string (required)
    - startDate: date (required)
    - endDate: date (required)
    - groupBy: "job-category" | "location" | "department" | "month"
    - minimumGroupSize: number (default: 5, GDPR k-anonymity)
  Response:
    - totalTrainingHours: number
    - averageHoursPerEmployee: number
    - medianHoursPerEmployee: number
    - participationRate: number (percentage of workforce trained)
    - completionRate: number (percentage of enrollments completed)
    - totalInvestment: number
    - investmentPerEmployee: number
    - breakdown: array
        - category: string
        - hours: number
        - participants: number (aggregated, minimum 5)
        - investment: number
    - metadata:
        anonymizationApplied: boolean
        suppressedGroups: number (groups <5 employees)
  Privacy:
    - Aggregated metrics ONLY
    - Minimum group size 5 (k-anonymity)
    - Suppression of small groups (<5 employees)

GET /v1/training/metrics/participation
  Query:
    - organizationId: string
    - startDate: date
    - endDate: date
    - category: string (optional)
    - segmentBy: "job-category" | "location" | "demographics"
  Response:
    - participationRate: number (percentage of workforce)
    - participationBySegment: array
        - segment: string
        - participationRate: number (percentage)
        - participantCount: number (aggregated, minimum 5)
    - yearOverYearChange: number (percentage change)
    - metadata:
        minimumGroupSize: 5
        suppressedSegments: number
  Privacy:
    - Aggregated participation rates ONLY
    - Minimum group size 5
    - NO individual participation records

GET /v1/training/metrics/roi
  Query:
    - organizationId: string
    - startDate: date
    - endDate: date
    - category: string (optional)
  Response:
    - totalInvestment: number
    - totalHours: number
    - costPerHour: number
    - businessImpact: object
        - performanceImprovement: number (percentage, correlation)
        - retentionImprovement: number (percentage, correlation)
        - productivityGain: number (percentage, correlation)
        - safetyIncidentReduction: number (percentage, correlation)
    - roi: number (business impact / investment)
    - metadata:
        analysisMethod: "correlation analysis"
        confidenceLevel: number (statistical significance)
  Privacy:
    - Aggregated ROI metrics ONLY
    - Correlation analysis (not individual tracking)
    - NO individual performance/retention data
```

#### Compliance Training (AGGREGATED)
```yaml
GET /v1/training/compliance/summary
  Query:
    - organizationId: string (required)
    - asOfDate: date (optional, defaults to today)
    - trainingType: "safety" | "ethics" | "DEI" | "cybersecurity" | "anti-corruption"
  Response:
    - trainingType: string
    - totalRequired: number (employees required to complete)
    - totalCompleted: number (employees who completed)
    - completionRate: number (percentage)
    - delinquencyRate: number (percentage overdue)
    - averageDaysToComplete: number
    - upcomingExpirations: object
        - within30Days: number (certifications expiring)
        - within90Days: number
    - metadata:
        anonymizationApplied: boolean
        individualRecordsNotExposed: true
  Privacy:
    - Aggregated completion rates ONLY
    - Delinquency rate as percentage (NOT individual names)
    - NO individual compliance status
    - Certification expirations as counts (not individual names)

GET /v1/training/compliance/delinquency
  Query:
    - organizationId: string
    - trainingType: "safety" | "ethics" | "DEI" | "cybersecurity"
    - segmentBy: "job-category" | "location" | "department"
    - minimumGroupSize: number (default: 5)
  Response:
    - delinquencyRate: number (percentage)
    - delinquencyBySegment: array
        - segment: string
        - delinquencyRate: number (percentage)
        - delinquentCount: number (aggregated, minimum 5)
    - riskLevel: "low" | "medium" | "high" (based on compliance requirements)
    - metadata:
        suppressedSegments: number (segments <5 employees)
        individualNamesNotExposed: true
  Privacy:
    - Delinquency rate as percentage ONLY
    - NO individual delinquent employee names
    - Minimum group size 5
    - Alert sent to HR (not to Training Service)

POST /v1/training/compliance/assign
  Request:
    - organizationId: string
    - courseId: string
    - assignmentCriteria: object
        - jobCategories: array<string> (e.g., ["manager", "executive"])
        - locations: array<string>
        - departments: array<string>
    - dueDate: date
    - recurrence: "none" | "annual" | "biennial"
    - correlationId: string
  Response:
    - assignmentId: string
    - estimatedEmployees: number (count matching criteria)
    - status: "assigned"
    - message: "Compliance training assigned to matching employees"
  Privacy:
    - Assignment criteria (role-based, not individual-based)
    - LMS handles individual assignments (not Training Service)
    - Training Service creates assignment rule (applied by LMS)
```

#### Skills Development (ANONYMIZED)
```yaml
GET /v1/training/skills/inventory
  Query:
    - organizationId: string (required)
    - skillCategory: "technical" | "digital" | "green" | "leadership" | "soft"
    - asOfDate: date
  Response:
    - skillsInventory: array
        - skillName: string
        - skillCategory: string
        - workforceWithSkill: number (percentage)
        - proficiencyDistribution: object
            - novice: number (percentage)
            - intermediate: number (percentage)
            - advanced: number (percentage)
            - expert: number (percentage)
        - averageProficiency: number (1-5 scale)
    - totalSkillsTracked: number
    - metadata:
        anonymizationApplied: true
        individualProfilesNotExposed: true
  Privacy:
    - Aggregated skills inventory ONLY
    - Proficiency distribution as percentages
    - NO individual skills profiles
    - Individual skills stored in HRIS ONLY

GET /v1/training/skills/gap-analysis
  Query:
    - organizationId: string
    - targetRole: string (optional)
    - strategicInitiative: string (optional, e.g., "net-zero transition")
  Response:
    - skillsGaps: array
        - skillName: string
        - currentCoverage: number (percentage of workforce)
        - requiredCoverage: number (percentage needed)
        - gap: number (percentage points)
        - priority: "critical" | "high" | "medium" | "low"
        - trainingRecommendations: array<string>
    - criticalGaps: number (count of critical skill gaps)
    - estimatedTrainingCost: number
    - estimatedTimeToClose: number (months)
  Privacy:
    - Aggregated gap analysis ONLY
    - NO individual skills data
    - Gap analysis at organizational/role level

POST /v1/training/skills/assessment
  Request:
    - organizationId: string
    - skillName: string
    - assessmentType: "self" | "manager" | "360-degree"
    - targetPopulation: object
        - jobCategories: array<string>
        - departments: array<string>
    - correlationId: string
  Response:
    - assessmentId: string
    - estimatedParticipants: number
    - status: "launched"
    - message: "Skills assessment launched"
  Privacy:
    - Assessment responses stored in LMS (not Training Service)
    - Training Service receives aggregated results ONLY
    - NO individual assessment scores
```

#### Career Development (ANONYMIZED)
```yaml
GET /v1/training/career-development/programs
  Query:
    - organizationId: string (required)
    - programType: "mentorship" | "leadership-development" | "HiPo" | "succession"
  Response:
    - programs: array
        - programId: string
        - programName: string
        - programType: string
        - participationRate: number (percentage of eligible employees)
        - completionRate: number (percentage)
        - satisfaction: number (NPS or 1-5 rating, aggregated)
        - businessImpact: object
            - promotionRate: number (percentage promoted within 1 year)
            - retentionRate: number (percentage retained)
    - metadata:
        anonymizationApplied: true
        individualParticipantsNotExposed: true
  Privacy:
    - Aggregated program metrics ONLY
    - NO individual participant names
    - Participation rates as percentages

GET /v1/training/career-development/paths
  Query:
    - organizationId: string
    - fromRole: string (optional)
    - toRole: string (optional)
  Response:
    - careerPaths: array
        - fromRole: string
        - toRole: string
        - pathType: "promotion" | "lateral" | "transition"
        - requiredSkills: array<string>
        - recommendedTraining: array<object>
            - courseId: string
            - courseTitle: string
            - priority: "required" | "recommended"
        - averageTimeToTransition: number (months)
        - successRate: number (percentage who successfully transitioned)
    - totalPathsAvailable: number
  Privacy:
    - Career paths are organizational policy (no privacy concerns)
    - Success rate aggregated (not individual tracking)

GET /v1/training/career-development/mentorship
  Query:
    - organizationId: string
    - asOfDate: date
  Response:
    - programMetrics: object
        - activeMentorships: number (count)
        - mentorCount: number (count, anonymized)
        - menteeCount: number (count, anonymized)
        - averageDuration: number (months)
        - satisfactionRating: number (1-5, aggregated)
        - impactMetrics: object
            - menteePromotionRate: number (percentage)
            - menteeRetentionRate: number (percentage)
    - metadata:
        anonymizationApplied: true
        individualPairsNotExposed: true
  Privacy:
    - Aggregated mentorship metrics ONLY
    - NO mentor-mentee pairs exposed
    - Individual mentorship records in HRIS
```

#### LMS Integration
```yaml
POST /v1/training/lms/sync
  Request:
    - source: "cornerstone" | "successfactors-learning" | "workday-learning" | "moodle"
    - syncType: "full" | "incremental"
    - syncScope: "catalog" | "enrollments" | "completions" | "all"
    - anonymize: boolean (default: true, ALWAYS true for ESG)
    - correlationId: string
  Response:
    - syncId: string
    - status: "in-progress" | "completed" | "failed"
    - recordsSynced: number
    - recordsAnonymized: number
    - errors: array
    - lastSyncTime: timestamp
  Privacy:
    - Anonymization pipeline executed during sync
    - PII stripped from enrollment/completion records
    - Only aggregated data retained

GET /v1/training/lms/sync/status/:syncId
  Response:
    - syncId: string
    - status: "in-progress" | "completed" | "failed"
    - progress: number (percentage)
    - recordsSynced: number
    - errors: array
    - startTime: timestamp
    - endTime: timestamp (if completed)
  Privacy:
    - Sync status only (no privacy concerns)

POST /v1/training/lms/webhooks/enrollment
  Request:
    - eventType: "enrollment.created" | "enrollment.cancelled"
    - courseId: string
    - enrollmentDate: date
    - jobCategory: string (anonymized)
    - location: string (anonymized)
    - correlationId: string
  Response:
    - status: "acknowledged"
    - aggregationApplied: boolean
  Privacy:
    - Webhook receives anonymized event (no employee ID, name, email)
    - Event aggregated immediately (not stored individually)

POST /v1/training/lms/webhooks/completion
  Request:
    - eventType: "training.completed" | "certification.earned"
    - courseId: string
    - completionDate: date
    - assessmentScore: number (anonymized, aggregated)
    - jobCategory: string (anonymized)
    - location: string (anonymized)
    - correlationId: string
  Response:
    - status: "acknowledged"
    - aggregationApplied: boolean
  Privacy:
    - Webhook receives anonymized event
    - Event aggregated immediately (not stored individually)
    - NO individual completion records
```

#### Training Effectiveness
```yaml
GET /v1/training/effectiveness/kirkpatrick
  Query:
    - organizationId: string (required)
    - courseId: string (optional)
    - startDate: date
    - endDate: date
    - level: "1" | "2" | "3" | "4" (Kirkpatrick level)
  Response:
    - level: string
    - levelDescription: string
    - metrics: object
        - level1: object (Reaction - course satisfaction)
            - averageSatisfaction: number (1-5 scale)
            - nps: number (Net Promoter Score)
            - responseRate: number (percentage)
        - level2: object (Learning - knowledge gain)
            - averagePreScore: number (percentage)
            - averagePostScore: number (percentage)
            - averageImprovement: number (percentage points)
            - statisticalSignificance: number (p-value)
        - level3: object (Behavior - on-the-job application)
            - behaviorChangeRate: number (percentage reporting behavior change)
            - managerSatisfaction: number (1-5 scale)
            - skillsApplicationRate: number (percentage applying skills)
        - level4: object (Results - business impact)
            - performanceImprovement: number (percentage)
            - productivityGain: number (percentage)
            - safetyIncidentReduction: number (percentage)
            - retentionImprovement: number (percentage)
    - metadata:
        minimumResponsesRequired: 10
        anonymizationApplied: true
        individualScoresNotExposed: true
  Privacy:
    - ALL metrics aggregated (minimum 10 responses)
    - NO individual assessment scores
    - NO individual feedback
    - Correlation analysis (not individual tracking)

GET /v1/training/effectiveness/business-impact
  Query:
    - organizationId: string
    - courseId: string (optional)
    - startDate: date
    - endDate: date
    - impactMetric: "performance" | "retention" | "productivity" | "safety"
  Response:
    - impactMetric: string
    - baseline: number (before training)
    - current: number (after training)
    - improvement: number (percentage change)
    - correlation: number (-1 to 1, statistical correlation)
    - confidence: number (statistical confidence level)
    - roi: number (business impact / training investment)
    - metadata:
        analysisMethod: "correlation analysis"
        controlGroupUsed: boolean
        individualDataNotUsed: true
  Privacy:
    - Aggregated business impact ONLY
    - Correlation analysis (not individual tracking)
    - NO individual performance/retention data
```

#### ESG-Specific Training
```yaml
GET /v1/training/esg/sustainability
  Query:
    - organizationId: string (required)
    - startDate: date
    - endDate: date
    - trainingType: "climate-change" | "circular-economy" | "biodiversity" | "human-rights"
  Response:
    - trainingType: string
    - participationRate: number (percentage of workforce)
    - completionRate: number (percentage)
    - hoursPerEmployee: number (average)
    - trainingByRole: array
        - role: string
        - participationRate: number (percentage)
        - hoursPerEmployee: number (average)
    - businessImpact: object
        - sustainabilityMetricImprovement: number (percentage)
        - employeeEngagement: number (correlation)
    - metadata:
        minimumGroupSize: 5
        suppressedRoles: number
  Privacy:
    - Aggregated ESG training metrics ONLY
    - Minimum group size 5
    - NO individual training records

GET /v1/training/esg/compliance
  Query:
    - organizationId: string
    - asOfDate: date
    - complianceType: "safety" | "ethics" | "DEI" | "human-rights" | "anti-corruption"
  Response:
    - complianceType: string
    - completionRate: number (percentage)
    - delinquencyRate: number (percentage overdue)
    - averageDaysToComplete: number
    - attestationRate: number (percentage with signed attestations)
    - upcomingExpirations: object
        - within30Days: number (certifications expiring)
        - within90Days: number
    - auditReadiness: "compliant" | "at-risk" | "non-compliant"
    - metadata:
        individualRecordsNotExposed: true
        aggregatedDataOnly: true
  Privacy:
    - Aggregated compliance rates ONLY
    - NO individual compliance status
    - Attestations stored in LMS (not Training Service)

GET /v1/training/esg/green-skills
  Query:
    - organizationId: string
    - asOfDate: date
  Response:
    - greenSkillsCoverage: number (percentage of workforce with green skills)
    - greenSkillsInventory: array
        - skillName: string (e.g., "renewable energy", "circular economy")
        - coverage: number (percentage of workforce)
        - proficiency: number (average proficiency, 1-5 scale)
    - greenSkillsGap: number (percentage gap to net-zero targets)
    - trainingInProgress: number (employees currently in green skills training)
    - projectedCoverage: number (coverage after current training completes)
    - metadata:
        alignedToNetZeroStrategy: boolean
        individualProfilesNotExposed: true
  Privacy:
    - Aggregated green skills inventory ONLY
    - NO individual skills profiles
    - Skills gap at organizational level
```

#### Targets & Reporting
```yaml
GET /v1/training/targets
  Query:
    - organizationId: string (required)
    - targetYear: number (optional)
    - targetType: "training-hours" | "participation-rate" | "skills-coverage"
  Response:
    - targets: array
        - targetId: string
        - targetType: string
        - targetValue: number
        - targetYear: number
        - currentValue: number
        - progress: number (percentage toward target)
        - status: "on-track" | "at-risk" | "off-track"
    - overallProgress: number (percentage)
    - metadata:
        lastUpdated: timestamp
  Privacy:
    - Targets are organizational goals (no privacy concerns)

POST /v1/training/targets
  Request:
    - organizationId: string
    - targetType: "training-hours" | "participation-rate" | "skills-coverage"
    - targetValue: number
    - targetYear: number
    - targetScope: object (optional)
        - jobCategories: array<string>
        - locations: array<string>
    - correlationId: string
  Response:
    - targetId: string
    - status: "created"
    - message: "Training target created successfully"
  Privacy:
    - Targets are organizational goals (no privacy concerns)

GET /v1/training/reports/gri-404
  Query:
    - organizationId: string (required)
    - reportingYear: number (required)
  Response:
    - reportingYear: number
    - disclosure404_1: object (Average hours of training per year per employee)
        - averageHoursPerEmployee: number
        - averageHoursByGender: object
            - male: number
            - female: number
            - nonBinary: number
        - averageHoursByJobCategory: object
            - executives: number
            - seniorManagers: number
            - middleManagers: number
            - professionals: number
            - supportStaff: number
    - disclosure404_2: object (Programs for upgrading employee skills)
        - skillsDevelopmentPrograms: array<string>
        - participationRate: number (percentage)
        - transitionAssistancePrograms: array<string>
    - disclosure404_3: object (Percentage receiving performance reviews)
        - percentageReceivingReviews: number
        - percentageByGender: object
        - percentageByJobCategory: object
    - metadata:
        frameworkVersion: "GRI 404:2016"
        assuranceLevel: "limited" | "reasonable" | "none"
        anonymizationApplied: true
  Privacy:
    - Aggregated GRI metrics ONLY
    - Minimum group size 5 for demographics
    - NO individual training records

GET /v1/training/reports/csrd-s1
  Query:
    - organizationId: string
    - reportingYear: number
  Response:
    - reportingYear: number
    - skillsDevelopment: object
        - trainingHoursPerEmployee: number
        - skillsDevelopmentInvestment: number
        - skillsGapAnalysis: array
        - greenSkillsCoverage: number (percentage)
    - careerDevelopment: object
        - internalMobilityRate: number (percentage)
        - promotionRate: number (percentage)
        - leadershipDevelopmentParticipation: number (percentage)
    - metadata:
        frameworkVersion: "CSRD ESRS S1"
        doubleMateriality: "financial and impact materiality"
        anonymizationApplied: true
  Privacy:
    - Aggregated CSRD metrics ONLY
    - NO individual career development data
    - Internal mobility as percentage (not individual names)
```

### 1.3 Event Subscriptions

#### Consumes Events From
```yaml
workforce.employee.hired.v1:
  Source: Workforce Service (3021)
  Payload:
    - organizationId: string
    - employeeId: string (ANONYMIZED before storage)
    - jobCategory: string
    - location: string
    - startDate: date
  Action:
    - Assign mandatory onboarding training
    - Update training metrics (new employee added to denominator)
  Privacy:
    - Employee ID not stored in Training Service
    - Event used to trigger LMS assignment (via Integration Service)

workforce.employee.terminated.v1:
  Source: Workforce Service (3021)
  Payload:
    - organizationId: string
    - employeeId: string (ANONYMIZED)
    - jobCategory: string
    - location: string
    - terminationDate: date
  Action:
    - Remove from training metrics denominator
    - Archive employee training records (in LMS, not Training Service)
  Privacy:
    - Employee ID not stored in Training Service

workforce.employee.role-changed.v1:
  Source: Workforce Service (3021)
  Payload:
    - organizationId: string
    - employeeId: string (ANONYMIZED)
    - previousRole: string
    - newRole: string
    - changeDate: date
  Action:
    - Assign role-specific training
    - Update skills gap analysis
  Privacy:
    - Employee ID not stored in Training Service

safety.training.overdue.v1:
  Source: Safety Service (3022)
  Payload:
    - organizationId: string
    - trainingType: "safety-certification"
    - employeeCount: number (aggregated)
    - jobCategories: array<string>
    - locations: array<string>
    - overdueBy: number (days)
  Action:
    - Escalate to HR (via notification service)
    - Update compliance delinquency metrics
  Privacy:
    - Event contains aggregated counts ONLY (no individual employee IDs)

diversity.discrimination-complaint.filed.v1:
  Source: Diversity Service (3028)
  Payload:
    - organizationId: string
    - complaintType: "discrimination" | "harassment"
    - affectedDepartments: array<string>
    - complaintDate: date
  Action:
    - Trigger mandatory DEI training for affected departments
    - Update DEI training compliance metrics
  Privacy:
    - No individual identifiers (complaint filed anonymously)

organization.hierarchy.updated.v1:
  Source: Organization Service (3002)
  Payload:
    - organizationId: string
    - hierarchyType: "department" | "location" | "business-unit"
    - updateType: "created" | "updated" | "deleted"
    - hierarchyId: string
  Action:
    - Update training assignment rules (department-based assignments)
    - Recalculate training metrics by department/location
  Privacy:
    - Hierarchy metadata only (no individual data)
```

## 2. Data Model

### 2.1 MongoDB Collections

#### training_catalog
```typescript
{
  _id: ObjectId,
  organizationId: string,
  courseId: string (unique),
  title: string,
  description: string,
  category: "technical" | "leadership" | "compliance" | "ESG" | "soft-skills" | "digital",
  subcategory: string,
  deliveryMethod: "instructor-led" | "e-learning" | "blended" | "on-the-job" | "mentoring",
  duration: number, // hours
  provider: {
    type: "internal" | "external",
    name: string,
    contactInfo: string
  },
  cost: {
    amount: number,
    currency: "USD" | "EUR" | "GBP",
    costType: "per-employee" | "per-session" | "annual-license"
  },
  expirationPolicy: {
    expiresAfter: number, // months (null if no expiration)
    recertificationRequired: boolean
  },
  prerequisites: array<string>, // courseIds
  learningObjectives: array<string>,
  materials: array<{
    type: "document" | "video" | "assessment" | "link",
    title: string,
    url: string,
    accessibilityCompliant: boolean
  }>,
  languages: array<string>, // ISO 639-1 codes
  capacity: number, // max participants per session (null for e-learning)
  status: "active" | "archived" | "draft",
  metadata: {
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: string,
    version: number
  },
  esgRelevance: {
    isESGTraining: boolean,
    esgCategories: array<"environmental" | "social" | "governance">,
    frameworks: array<"GRI" | "SASB" | "CSRD" | "TCFD" | "SDG">
  }
}
```

**Indexes**:
- `{ organizationId: 1, status: 1 }`
- `{ category: 1, deliveryMethod: 1 }`
- `{ esgRelevance.isESGTraining: 1 }`

**Privacy**: Public catalog (no PII)

#### training_metrics (ANONYMIZED AGGREGATES)
```typescript
{
  _id: ObjectId,
  organizationId: string,
  reportingPeriod: {
    startDate: date,
    endDate: date,
    periodType: "monthly" | "quarterly" | "annual"
  },
  aggregationLevel: {
    type: "organization" | "location" | "department" | "job-category",
    value: string
  },
  metrics: {
    totalTrainingHours: number,
    averageHoursPerEmployee: number,
    medianHoursPerEmployee: number,
    participationRate: number, // percentage
    completionRate: number, // percentage
    employeeCount: number, // denominator for averages (MINIMUM 5)
    totalInvestment: number,
    investmentPerEmployee: number
  },
  trainingByCategory: array<{
    category: string,
    hours: number,
    participants: number, // MINIMUM 5
    investment: number,
    completionRate: number
  }>,
  trainingByDeliveryMethod: array<{
    deliveryMethod: string,
    hours: number,
    participants: number,
    investment: number
  }>,
  demographics: {
    byGender: array<{
      gender: string,
      averageHours: number,
      participationRate: number,
      employeeCount: number // MINIMUM 5
    }>,
    byJobCategory: array<{
      jobCategory: string,
      averageHours: number,
      participationRate: number,
      employeeCount: number // MINIMUM 5
    }>,
    byLocation: array<{
      location: string,
      averageHours: number,
      participationRate: number,
      employeeCount: number // MINIMUM 5
    }>
  },
  privacyMetadata: {
    minimumGroupSize: 5,
    suppressedGroups: number, // groups <5 employees
    anonymizationApplied: true,
    noIndividualDataStored: true
  },
  metadata: {
    calculatedAt: timestamp,
    dataSource: "LMS",
    lastSyncTime: timestamp
  }
}
```

**Indexes**:
- `{ organizationId: 1, reportingPeriod.startDate: -1 }`
- `{ aggregationLevel.type: 1, aggregationLevel.value: 1 }`

**Privacy**: k-anonymity enforced (minimum 5 employees per group)

#### compliance_training (AGGREGATED)
```typescript
{
  _id: ObjectId,
  organizationId: string,
  asOfDate: date,
  complianceType: "safety" | "ethics" | "DEI" | "cybersecurity" | "anti-corruption" | "human-rights" | "environmental",
  aggregationLevel: {
    type: "organization" | "location" | "department" | "job-category",
    value: string
  },
  compliance: {
    totalRequired: number, // employees required to complete
    totalCompleted: number,
    completionRate: number, // percentage
    delinquencyRate: number, // percentage overdue
    averageDaysToComplete: number,
    attestationRate: number // percentage with signed attestations
  },
  expirations: {
    expiredCount: number,
    expiringWithin30Days: number,
    expiringWithin90Days: number
  },
  auditReadiness: {
    status: "compliant" | "at-risk" | "non-compliant",
    riskFactors: array<string>,
    remediationActions: array<string>
  },
  privacyMetadata: {
    individualRecordsNotStored: true,
    delinquentNamesNotExposed: true,
    aggregatedDataOnly: true
  },
  metadata: {
    calculatedAt: timestamp,
    dataSource: "LMS",
    lastSyncTime: timestamp
  }
}
```

**Indexes**:
- `{ organizationId: 1, complianceType: 1, asOfDate: -1 }`
- `{ auditReadiness.status: 1 }`

**Privacy**: Aggregated compliance rates ONLY (no individual status)

#### skills_inventory (ANONYMIZED AGGREGATES)
```typescript
{
  _id: ObjectId,
  organizationId: string,
  asOfDate: date,
  skillCategory: "technical" | "digital" | "green" | "leadership" | "soft",
  skills: array<{
    skillId: string,
    skillName: string,
    skillCategory: string,
    coverage: number, // percentage of workforce with this skill
    proficiencyDistribution: {
      novice: number, // percentage
      intermediate: number,
      advanced: number,
      expert: number
    },
    averageProficiency: number, // 1-5 scale
    employeeCount: number, // MINIMUM 5
    trainingAvailable: array<string> // courseIds
  }>,
  skillsGaps: array<{
    skillName: string,
    currentCoverage: number, // percentage
    requiredCoverage: number, // percentage
    gap: number, // percentage points
    priority: "critical" | "high" | "medium" | "low",
    trainingRecommendations: array<string>
  }>,
  privacyMetadata: {
    individualProfilesNotStored: true,
    minimumGroupSize: 5,
    aggregatedDataOnly: true
  },
  metadata: {
    calculatedAt: timestamp,
    dataSource: "HRIS + LMS",
    lastSyncTime: timestamp
  }
}
```

**Indexes**:
- `{ organizationId: 1, skillCategory: 1, asOfDate: -1 }`
- `{ "skills.skillName": 1 }`

**Privacy**: Aggregated skills inventory ONLY (no individual profiles)

#### career_development (ANONYMIZED AGGREGATES)
```typescript
{
  _id: ObjectId,
  organizationId: string,
  reportingPeriod: {
    startDate: date,
    endDate: date
  },
  programType: "mentorship" | "leadership-development" | "HiPo" | "succession" | "tuition-reimbursement",
  programMetrics: {
    participantCount: number, // MINIMUM 5
    participationRate: number, // percentage of eligible employees
    completionRate: number, // percentage
    averageDuration: number, // months
    satisfactionRating: number, // 1-5 scale, aggregated
    totalInvestment: number
  },
  businessImpact: {
    promotionRate: number, // percentage promoted within 1 year
    retentionRate: number, // percentage retained
    performanceImprovement: number, // percentage, correlation
    internalMobilityRate: number // percentage filling roles internally
  },
  privacyMetadata: {
    individualParticipantsNotStored: true,
    mentorMenteePairsNotExposed: true,
    aggregatedDataOnly: true
  },
  metadata: {
    calculatedAt: timestamp,
    dataSource: "HRIS + LMS"
  }
}
```

**Indexes**:
- `{ organizationId: 1, programType: 1, reportingPeriod.startDate: -1 }`

**Privacy**: Aggregated program metrics ONLY (no individual participants)

#### training_effectiveness (ANONYMIZED)
```typescript
{
  _id: ObjectId,
  organizationId: string,
  courseId: string,
  reportingPeriod: {
    startDate: date,
    endDate: date
  },
  kirkpatrickLevel1: { // Reaction
    averageSatisfaction: number, // 1-5 scale
    nps: number, // Net Promoter Score
    responseCount: number, // MINIMUM 10
    responseRate: number // percentage
  },
  kirkpatrickLevel2: { // Learning
    averagePreScore: number, // percentage
    averagePostScore: number, // percentage
    averageImprovement: number, // percentage points
    statisticalSignificance: number, // p-value
    responseCount: number // MINIMUM 10
  },
  kirkpatrickLevel3: { // Behavior
    behaviorChangeRate: number, // percentage reporting behavior change
    managerSatisfaction: number, // 1-5 scale
    skillsApplicationRate: number, // percentage applying skills
    responseCount: number // MINIMUM 10
  },
  kirkpatrickLevel4: { // Results
    performanceImprovement: number, // percentage
    productivityGain: number, // percentage
    safetyIncidentReduction: number, // percentage
    retentionImprovement: number, // percentage
    correlation: number, // statistical correlation
    confidence: number // statistical confidence level
  },
  roi: {
    totalInvestment: number,
    businessImpact: number,
    roi: number // business impact / investment
  },
  privacyMetadata: {
    minimumResponsesRequired: 10,
    individualScoresNotStored: true,
    aggregatedDataOnly: true
  },
  metadata: {
    calculatedAt: timestamp,
    dataSource: "LMS + HRIS"
  }
}
```

**Indexes**:
- `{ organizationId: 1, courseId: 1, reportingPeriod.startDate: -1 }`

**Privacy**: Minimum 10 responses for effectiveness metrics

#### lms_sync_jobs
```typescript
{
  _id: ObjectId,
  organizationId: string,
  syncId: string (unique),
  syncConfig: {
    source: "cornerstone" | "successfactors-learning" | "workday-learning" | "moodle",
    syncType: "full" | "incremental",
    syncScope: "catalog" | "enrollments" | "completions" | "all",
    anonymize: boolean // ALWAYS true for ESG
  },
  status: "pending" | "in-progress" | "completed" | "failed",
  progress: {
    totalRecords: number,
    syncedRecords: number,
    anonymizedRecords: number,
    suppressedRecords: number, // due to k-anonymity
    errorRecords: number,
    percentComplete: number
  },
  errors: array<{
    recordId: string,
    errorType: string,
    errorMessage: string,
    timestamp: timestamp
  }>,
  privacyMetadata: {
    piiStripped: boolean,
    anonymizationPipelineExecuted: boolean,
    kAnonymityEnforced: boolean
  },
  metadata: {
    startTime: timestamp,
    endTime: timestamp,
    duration: number, // seconds
    triggeredBy: "scheduled" | "manual",
    correlationId: string
  }
}
```

**Indexes**:
- `{ organizationId: 1, status: 1, metadata.startTime: -1 }`
- `{ syncId: 1 }` (unique)

**Privacy**: Anonymization pipeline executed during sync

#### training_targets
```typescript
{
  _id: ObjectId,
  organizationId: string,
  targetId: string (unique),
  targetType: "training-hours" | "participation-rate" | "skills-coverage" | "compliance-rate",
  targetValue: number,
  targetYear: number,
  targetScope: {
    level: "organization" | "location" | "department" | "job-category",
    value: string (optional)
  },
  currentValue: number,
  progress: number, // percentage toward target
  status: "on-track" | "at-risk" | "off-track",
  milestones: array<{
    date: date,
    targetValue: number,
    actualValue: number,
    status: "achieved" | "missed"
  }>,
  metadata: {
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: string
  }
}
```

**Indexes**:
- `{ organizationId: 1, targetYear: 1 }`
- `{ status: 1 }`

**Privacy**: Targets are organizational goals (no PII)

#### training_reports (GRI, CSRD, SASB)
```typescript
{
  _id: ObjectId,
  organizationId: string,
  reportId: string (unique),
  reportingYear: number,
  framework: "GRI-404" | "CSRD-S1" | "SASB-HC" | "ISO-9001",
  reportData: {
    // Framework-specific structure
    // Example for GRI 404:
    disclosure404_1: {
      averageHoursPerEmployee: number,
      averageHoursByGender: object,
      averageHoursByJobCategory: object
    },
    disclosure404_2: {
      skillsDevelopmentPrograms: array<string>,
      participationRate: number,
      transitionAssistancePrograms: array<string>
    },
    disclosure404_3: {
      percentageReceivingReviews: number,
      percentageByGender: object,
      percentageByJobCategory: object
    }
  },
  assurance: {
    level: "limited" | "reasonable" | "none",
    provider: string,
    statement: string (URL to assurance statement)
  },
  privacyMetadata: {
    anonymizationApplied: true,
    minimumGroupSize: 5,
    individualRecordsNotUsed: true
  },
  metadata: {
    generatedAt: timestamp,
    publishedAt: timestamp,
    version: number
  }
}
```

**Indexes**:
- `{ organizationId: 1, reportingYear: -1 }`
- `{ framework: 1 }`

**Privacy**: Aggregated ESG reporting data ONLY

#### audit_logs (Training Service Access)
```typescript
{
  _id: ObjectId,
  organizationId: string,
  eventType: "data-access" | "data-export" | "report-generated" | "sync-executed",
  userId: string,
  userRole: string,
  action: string,
  resource: string,
  dataAccessed: {
    endpoint: string,
    queryParameters: object,
    recordsReturned: number,
    containsPII: boolean // SHOULD ALWAYS BE FALSE
  },
  ipAddress: string (anonymized),
  userAgent: string,
  timestamp: timestamp,
  correlationId: string
}
```

**Indexes**:
- `{ organizationId: 1, timestamp: -1 }`
- `{ eventType: 1, timestamp: -1 }`

**Privacy**: Audit trail for compliance (IP anonymized)

#### erasure_requests (GDPR Right to Erasure)
```typescript
{
  _id: ObjectId,
  organizationId: string,
  requestId: string (unique),
  employeeId: string, // HASHED (not plaintext)
  requestType: "right-to-erasure" | "right-to-portability",
  status: "pending" | "in-progress" | "completed" | "rejected",
  requestedAt: timestamp,
  completedAt: timestamp,
  actions: array<{
    action: "anonymize" | "delete" | "export",
    collection: string,
    recordsAffected: number,
    completedAt: timestamp
  }>,
  rejectionReason: string (if rejected),
  metadata: {
    requestedBy: string,
    processedBy: string,
    legalBasis: string
  }
}
```

**Indexes**:
- `{ organizationId: 1, status: 1 }`
- `{ requestId: 1 }` (unique)

**Privacy**: GDPR compliance (right to erasure)

### 2.2 InfluxDB Measurements (Time-Series)

#### training_hours_timeseries
```typescript
{
  measurement: "training_hours",
  tags: {
    organization_id: string,
    aggregation_level: "organization" | "location" | "department" | "job-category",
    aggregation_value: string,
    category: string (optional),
    delivery_method: string (optional)
  },
  fields: {
    total_hours: float,
    average_hours_per_employee: float,
    median_hours_per_employee: float,
    participation_rate: float, // percentage
    completion_rate: float, // percentage
    employee_count: int, // MINIMUM 5
    total_investment: float,
    investment_per_employee: float
  },
  time: timestamp
}
```

**Retention Policy**: 5 years (for historical trend analysis)

**Privacy**: k-anonymity enforced (minimum 5 employees)

#### compliance_timeseries
```typescript
{
  measurement: "compliance_training",
  tags: {
    organization_id: string,
    compliance_type: string,
    aggregation_level: string,
    aggregation_value: string
  },
  fields: {
    completion_rate: float, // percentage
    delinquency_rate: float, // percentage
    average_days_to_complete: float,
    expiring_within_30_days: int,
    expiring_within_90_days: int
  },
  time: timestamp
}
```

**Retention Policy**: 7 years (for compliance audit trail)

**Privacy**: Aggregated compliance rates ONLY

#### skills_coverage_timeseries
```typescript
{
  measurement: "skills_coverage",
  tags: {
    organization_id: string,
    skill_category: string,
    skill_name: string
  },
  fields: {
    coverage: float, // percentage of workforce
    average_proficiency: float, // 1-5 scale
    employee_count: int, // MINIMUM 5
    gap: float // percentage points
  },
  time: timestamp
}
```

**Retention Policy**: 5 years

**Privacy**: Aggregated skills coverage ONLY

### 2.3 Redis Cache

```typescript
// LMS catalog cache (15 minutes TTL)
Key: `training:catalog:{organizationId}`
Value: JSON (course catalog)
TTL: 900 seconds

// Training metrics cache (1 hour TTL)
Key: `training:metrics:{organizationId}:{period}`
Value: JSON (aggregated metrics)
TTL: 3600 seconds

// Compliance status cache (5 minutes TTL)
Key: `training:compliance:{organizationId}:{complianceType}`
Value: JSON (compliance rates)
TTL: 300 seconds

// Skills inventory cache (1 hour TTL)
Key: `training:skills:{organizationId}:{asOfDate}`
Value: JSON (skills inventory)
TTL: 3600 seconds

// LMS sync status (no TTL, deleted on completion)
Key: `training:sync:{syncId}`
Value: JSON (sync progress)
TTL: none
```

## 3. Non-Functional Requirements

### 3.1 Performance Requirements

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| API Response Time (p95) | <200ms | <500ms |
| API Response Time (p99) | <500ms | <1s |
| Training Metrics Dashboard Load | <3s | <5s |
| Compliance Report Generation | <5s | <10s |
| GRI 404 Report Generation | <10s | <20s |
| LMS Sync Throughput | >1,000 records/sec | >500 records/sec |
| Concurrent Users | 1,000 | 2,000 |
| Database Queries (p95) | <100ms | <200ms |
| Cache Hit Rate | >80% | >60% |
| Time-Series Query (1 year) | <2s | <5s |

### 3.2 Scalability Requirements

- **Horizontal Scaling**: Auto-scale 2-10 pods based on CPU (>70%)
- **Database Sharding**: Shard by organizationId for >100K organizations
- **Data Volume**: Support 100M+ aggregated training records
- **LMS Sync**: Handle 10M+ training events per day
- **Time-Series Data**: 5-year retention with 1-hour granularity
- **Concurrent Syncs**: Support 100+ concurrent LMS sync jobs
- **API Rate Limiting**: 1,000 requests/minute per organization

### 3.3 Availability Requirements

- **Service Uptime**: 99.9% (excluding maintenance windows)
- **Planned Maintenance**: Monthly, <4 hours, during low-traffic hours
- **RTO (Recovery Time Objective)**: <1 hour
- **RPO (Recovery Point Objective)**: <15 minutes
- **Health Check Interval**: 30 seconds
- **Circuit Breaker**: Open after 5 consecutive failures
- **Retry Policy**: 3 retries with exponential backoff

### 3.4 Security Requirements

- **Authentication**: JWT-based (RS256)
- **Authorization**: RBAC (HR Admin, ESG Manager, Auditor, Viewer)
- **Data Encryption**:
  - At rest: AES-256
  - In transit: TLS 1.3
- **API Rate Limiting**: 1,000 req/min per org (prevent DoS)
- **GDPR Compliance**:
  - Right to erasure (within 30 days)
  - Data minimization (no PII storage)
  - Anonymization by default
- **Audit Logging**: All data access logged (7-year retention)
- **Input Validation**: Zod schemas for all API inputs
- **SQL/NoSQL Injection**: Parameterized queries ONLY
- **OWASP Top 10**: Mitigations implemented

### 3.5 Data Privacy Requirements

- **k-Anonymity**: Minimum group size 5 for all aggregations
- **Differential Privacy**: Statistical noise for groups 5-10
- **PII Prohibition**: NO individual training records stored
- **Anonymization Pipeline**: Strip PII during LMS sync
- **Data Retention**:
  - Aggregated metrics: 7 years
  - Individual records: NOT STORED
  - Audit logs: 7 years
- **GDPR Rights**:
  - Right to erasure: <30 days
  - Right to portability: <30 days
  - Right to access: <7 days
- **CCPA Compliance**: "Do Not Sell" honored

### 3.6 Monitoring & Observability

- **Metrics Collection**: Prometheus + Grafana
- **Log Aggregation**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Distributed Tracing**: Jaeger (OpenTelemetry)
- **Alerting**:
  - Service downtime: Immediate PagerDuty
  - High error rate (>1%): 5-minute threshold
  - LMS sync failures: 15-minute threshold
  - Compliance delinquency >20%: Daily alert
- **Dashboards**:
  - Service health (uptime, response times, error rates)
  - Training metrics (hours, participation, compliance)
  - LMS sync status (jobs, throughput, errors)
  - Privacy compliance (k-anonymity violations, PII exposure)

## 4. Module Architecture

### 4.1 Directory Structure

```
training-service/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   │
│   ├── catalog/                     # Training catalog management
│   │   ├── catalog.module.ts
│   │   ├── catalog.controller.ts
│   │   ├── catalog.service.ts
│   │   ├── catalog.repository.ts
│   │   ├── entities/
│   │   │   └── course.entity.ts
│   │   └── dto/
│   │       ├── create-course.dto.ts
│   │       ├── update-course.dto.ts
│   │       └── course-query.dto.ts
│   │
│   ├── metrics/                     # Training metrics (ANONYMIZED)
│   │   ├── metrics.module.ts
│   │   ├── metrics.controller.ts
│   │   ├── metrics.service.ts
│   │   ├── metrics.repository.ts
│   │   ├── aggregation/
│   │   │   ├── aggregator.service.ts
│   │   │   ├── k-anonymity.service.ts
│   │   │   ├── suppression.service.ts
│   │   │   └── differential-privacy.service.ts
│   │   ├── entities/
│   │   │   └── training-metrics.entity.ts
│   │   └── dto/
│   │       ├── metrics-query.dto.ts
│   │       └── metrics-response.dto.ts
│   │
│   ├── compliance/                  # Compliance training (AGGREGATED)
│   │   ├── compliance.module.ts
│   │   ├── compliance.controller.ts
│   │   ├── compliance.service.ts
│   │   ├── compliance.repository.ts
│   │   ├── assignment/
│   │   │   ├── assignment.service.ts
│   │   │   └── rule-engine.service.ts
│   │   ├── delinquency/
│   │   │   ├── delinquency-tracker.service.ts
│   │   │   └── escalation.service.ts
│   │   ├── certification/
│   │   │   ├── certification-tracker.service.ts
│   │   │   └── expiration-alerter.service.ts
│   │   ├── entities/
│   │   │   ├── compliance-training.entity.ts
│   │   │   └── compliance-assignment.entity.ts
│   │   └── dto/
│   │       ├── compliance-summary.dto.ts
│   │       └── assignment.dto.ts
│   │
│   ├── skills/                      # Skills development (ANONYMIZED)
│   │   ├── skills.module.ts
│   │   ├── skills.controller.ts
│   │   ├── skills.service.ts
│   │   ├── skills.repository.ts
│   │   ├── taxonomy/
│   │   │   └── skills-taxonomy.service.ts
│   │   ├── assessment/
│   │   │   ├── assessment.service.ts
│   │   │   └── assessment-anonymizer.service.ts
│   │   ├── gap-analysis/
│   │   │   ├── gap-analyzer.service.ts
│   │   │   └── recommendation-engine.service.ts
│   │   ├── entities/
│   │   │   ├── skills-inventory.entity.ts
│   │   │   └── skills-gap.entity.ts
│   │   └── dto/
│   │       ├── skills-inventory.dto.ts
│   │       └── gap-analysis.dto.ts
│   │
│   ├── career-development/          # Career development (ANONYMIZED)
│   │   ├── career-development.module.ts
│   │   ├── career-development.controller.ts
│   │   ├── career-development.service.ts
│   │   ├── career-development.repository.ts
│   │   ├── mentorship/
│   │   │   └── mentorship-metrics.service.ts
│   │   ├── leadership/
│   │   │   └── leadership-programs.service.ts
│   │   ├── paths/
│   │   │   └── career-paths.service.ts
│   │   ├── entities/
│   │   │   └── career-development-metrics.entity.ts
│   │   └── dto/
│   │       ├── program-metrics.dto.ts
│   │       └── career-path.dto.ts
│   │
│   ├── lms-integration/             # LMS data sync (ANONYMIZATION LAYER)
│   │   ├── lms.module.ts
│   │   ├── lms.controller.ts
│   │   ├── lms.service.ts
│   │   ├── sync/
│   │   │   ├── sync-orchestrator.service.ts
│   │   │   ├── sync-scheduler.service.ts
│   │   │   └── incremental-sync.service.ts
│   │   ├── connectors/
│   │   │   ├── cornerstone-connector.service.ts
│   │   │   ├── successfactors-connector.service.ts
│   │   │   ├── workday-connector.service.ts
│   │   │   └── moodle-connector.service.ts
│   │   ├── anonymization-pipeline/
│   │   │   ├── pipeline-orchestrator.service.ts
│   │   │   ├── pii-stripper.service.ts
│   │   │   ├── field-anonymizer.service.ts
│   │   │   ├── k-anonymity-enforcer.service.ts
│   │   │   └── differential-privacy.service.ts
│   │   ├── webhooks/
│   │   │   ├── enrollment-webhook.controller.ts
│   │   │   └── completion-webhook.controller.ts
│   │   ├── validation/
│   │   │   ├── data-quality-validator.service.ts
│   │   │   └── completeness-checker.service.ts
│   │   ├── entities/
│   │   │   └── lms-sync-job.entity.ts
│   │   └── dto/
│   │       ├── lms-config.dto.ts
│   │       └── sync-status.dto.ts
│   │
│   ├── effectiveness/               # Training effectiveness (ANONYMIZED)
│   │   ├── effectiveness.module.ts
│   │   ├── effectiveness.controller.ts
│   │   ├── effectiveness.service.ts
│   │   ├── effectiveness.repository.ts
│   │   ├── kirkpatrick/
│   │   │   ├── level1-reaction.service.ts
│   │   │   ├── level2-learning.service.ts
│   │   │   ├── level3-behavior.service.ts
│   │   │   └── level4-results.service.ts
│   │   ├── roi/
│   │   │   ├── roi-calculator.service.ts
│   │   │   └── business-impact-analyzer.service.ts
│   │   ├── entities/
│   │   │   └── training-effectiveness.entity.ts
│   │   └── dto/
│   │       ├── kirkpatrick.dto.ts
│   │       └── roi.dto.ts
│   │
│   ├── esg-training/                # ESG-specific training (AGGREGATED)
│   │   ├── esg-training.module.ts
│   │   ├── esg-training.controller.ts
│   │   ├── esg-training.service.ts
│   │   ├── esg-training.repository.ts
│   │   ├── sustainability/
│   │   │   └── sustainability-training.service.ts
│   │   ├── green-skills/
│   │   │   └── green-skills-tracker.service.ts
│   │   ├── entities/
│   │   │   └── esg-training-metrics.entity.ts
│   │   └── dto/
│   │       └── esg-training.dto.ts
│   │
│   ├── targets/                     # Training targets
│   │   ├── targets.module.ts
│   │   ├── targets.controller.ts
│   │   ├── targets.service.ts
│   │   ├── targets.repository.ts
│   │   ├── progress/
│   │   │   └── progress-tracker.service.ts
│   │   └── entities/
│   │       └── training-target.entity.ts
│   │
│   ├── reporting/                   # ESG reporting (GRI, SASB, CSRD)
│   │   ├── reporting.module.ts
│   │   ├── reporting.controller.ts
│   │   ├── reporting.service.ts
│   │   ├── reporting.repository.ts
│   │   ├── gri/
│   │   │   └── gri-404.service.ts (Training and Education)
│   │   ├── csrd/
│   │   │   └── esrs-s1.service.ts (Own Workforce - Skills Development)
│   │   ├── sasb/
│   │   │   └── sasb-human-capital.service.ts
│   │   ├── iso/
│   │   │   ├── iso-9001.service.ts (Quality - Competence)
│   │   │   └── iso-45001.service.ts (Safety - Competence)
│   │   └── export/
│   │       ├── report-exporter.service.ts
│   │       └── evidence-aggregator.service.ts
│   │
│   ├── data-governance/             # GDPR compliance, audit trail
│   │   ├── data-governance.module.ts
│   │   ├── data-governance.controller.ts
│   │   ├── data-governance.service.ts
│   │   ├── audit/
│   │   │   ├── audit-logger.service.ts
│   │   │   └── access-monitor.service.ts
│   │   ├── gdpr/
│   │   │   ├── right-to-erasure.service.ts
│   │   │   ├── data-portability.service.ts
│   │   │   └── consent-manager.service.ts
│   │   ├── entities/
│   │   │   ├── audit-log.entity.ts
│   │   │   └── erasure-request.entity.ts
│   │   └── dto/
│   │       └── erasure-request.dto.ts
│   │
│   ├── timeseries/                  # InfluxDB time-series data
│   │   ├── timeseries.module.ts
│   │   ├── influx.service.ts
│   │   ├── training-hours-timeseries.service.ts
│   │   ├── compliance-timeseries.service.ts
│   │   └── skills-coverage-timeseries.service.ts
│   │
│   ├── events/                      # Event publishing
│   │   ├── events.module.ts
│   │   ├── event-publisher.service.ts
│   │   ├── event-consumer.service.ts
│   │   └── schemas/
│   │       ├── certification-completed.schema.ts
│   │       ├── certification-expired.schema.ts
│   │       ├── compliance-training-overdue.schema.ts
│   │       ├── skills-gap-identified.schema.ts
│   │       └── training-target-achieved.schema.ts
│   │
│   ├── common/                      # Shared utilities
│   │   ├── decorators/
│   │   │   ├── privacy-filter.decorator.ts
│   │   │   └── org-access.decorator.ts
│   │   ├── filters/
│   │   │   └── training-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── anonymization.interceptor.ts
│   │   │   └── audit-logging.interceptor.ts
│   │   ├── validators/
│   │   │   ├── k-anonymity.validator.ts
│   │   │   ├── minimum-group-size.validator.ts
│   │   │   └── data-quality.validator.ts
│   │   └── utils/
│   │       ├── statistical-utils.ts
│   │       ├── anonymization-utils.ts
│   │       ├── privacy-utils.ts
│   │       └── date-utils.ts
│   │
│   └── config/                      # Configuration
│       ├── configuration.ts
│       ├── database.config.ts
│       ├── influxdb.config.ts
│       ├── redis.config.ts
│       ├── lms.config.ts
│       └── privacy.config.ts
│
├── test/
│   ├── unit/
│   │   ├── catalog.spec.ts
│   │   ├── metrics.spec.ts
│   │   ├── compliance.spec.ts
│   │   ├── anonymization.spec.ts
│   │   └── effectiveness.spec.ts
│   ├── integration/
│   │   ├── lms-sync.spec.ts
│   │   ├── reporting.spec.ts
│   │   └── privacy-compliance.spec.ts
│   └── e2e/
│       ├── training-metrics.e2e.spec.ts
│       ├── compliance-tracking.e2e.spec.ts
│       └── gdpr-compliance.e2e.spec.ts
│
├── .env.example
├── Dockerfile
├── package.json
└── tsconfig.json
```

### 4.2 Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/mongoose": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "@aws-sdk/client-eventbridge": "^3.0.0",
    "@aws-sdk/client-secrets-manager": "^3.0.0",
    "@influxdata/influxdb-client": "^1.33.0",
    "mongoose": "^8.0.0",
    "ioredis": "^5.0.0",
    "axios": "^1.6.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "node-cron": "^3.0.0",
    "uuid": "^9.0.0",
    "bcrypt": "^5.1.0",
    "crypto": "^1.0.1",
    "mathjs": "^12.0.0",
    "simple-statistics": "^7.8.0",
    "natural": "^6.0.0",
    "compromise": "^14.0.0",
    "xlsx": "^0.18.0",
    "pdf-lib": "^1.17.0",
    "handlebars": "^4.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/jest": "^29.0.0",
    "@types/bcrypt": "^5.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "ts-jest": "^29.0.0"
  }
}
```

### 4.3 Module Interaction

```mermaid
graph TB
    A[API Gateway] --> B[Training Controller]

    B --> C[Catalog Service]
    B --> D[Metrics Service]
    B --> E[Compliance Service]
    B --> F[Skills Service]
    B --> G[Career Development Service]
    B --> H[Effectiveness Service]
    B --> I[ESG Training Service]
    B --> J[Reporting Service]

    D --> K[k-Anonymity Service]
    E --> K
    F --> K
    G --> K
    H --> K
    I --> K

    K --> L[Suppression Service]
    K --> M[Differential Privacy Service]

    N[LMS Integration] --> O[Anonymization Pipeline]
    O --> P[PII Stripper]
    O --> Q[k-Anonymity Enforcer]
    O --> R[Data Quality Validator]

    N --> S[Cornerstone Connector]
    N --> T[SuccessFactors Connector]
    N --> U[Workday Connector]
    N --> V[Moodle Connector]

    O --> W[Training Repository]
    D --> W
    E --> W
    F --> W
    G --> W
    H --> W

    W --> X[(MongoDB)]

    D --> Y[InfluxDB Service]
    E --> Y
    F --> Y
    Y --> Z[(InfluxDB)]

    J --> AA[GRI Service]
    J --> AB[CSRD Service]
    J --> AC[SASB Service]

    B --> AD[Data Governance]
    AD --> AE[Audit Logger]
    AD --> AF[Right to Erasure]
    AE --> AG[(Audit DB)]

    D --> AH[Event Publisher]
    E --> AH
    F --> AH
    AH --> AI[EventBridge]

    W --> AJ[Redis Cache]
```

## 5. Event Contracts

### 5.1 Published Events

#### TrainingCertificationCompleted
```json
{
  "eventType": "training.certification.completed.v1",
  "version": "v1",
  "timestamp": "2024-11-20T10:30:00Z",
  "correlationId": "uuid",
  "payload": {
    "organizationId": "string",
    "courseId": "string",
    "certificationName": "string",
    "completionDate": "2024-11-20",
    "expirationDate": "2025-11-20",
    "aggregatedMetrics": {
      "totalCompletions": 150,
      "completionRate": 95.5,
      "averageDaysToComplete": 12,
      "jobCategories": ["manager", "executive"],
      "locations": ["US", "UK"]
    },
    "privacyMetadata": {
      "individualNamesNotExposed": true,
      "aggregatedDataOnly": true
    }
  }
}
```

#### TrainingCertificationExpired
```json
{
  "eventType": "training.certification.expired.v1",
  "version": "v1",
  "timestamp": "2024-11-20T10:30:00Z",
  "correlationId": "uuid",
  "payload": {
    "organizationId": "string",
    "courseId": "string",
    "certificationName": "string",
    "expirationDate": "2024-11-20",
    "affectedCount": 25,
    "jobCategories": ["manager"],
    "locations": ["US"],
    "urgency": "high",
    "privacyMetadata": {
      "individualNamesNotExposed": true,
      "aggregatedCountOnly": true
    }
  }
}
```

#### TrainingComplianceOverdue
```json
{
  "eventType": "training.compliance-training.overdue.v1",
  "version": "v1",
  "timestamp": "2024-11-20T10:30:00Z",
  "correlationId": "uuid",
  "payload": {
    "organizationId": "string",
    "complianceType": "safety" | "ethics" | "DEI" | "cybersecurity",
    "delinquencyRate": 15.5,
    "delinquentCount": 75,
    "averageDaysOverdue": 22,
    "affectedSegments": [
      {
        "segmentType": "job-category",
        "segmentValue": "manager",
        "delinquencyRate": 18.2,
        "delinquentCount": 45
      }
    ],
    "escalationLevel": "medium",
    "privacyMetadata": {
      "individualNamesNotExposed": true,
      "aggregatedDataOnly": true,
      "minimumGroupSize": 5
    }
  }
}
```

#### TrainingSkillsGapIdentified
```json
{
  "eventType": "training.skills-gap.identified.v1",
  "version": "v1",
  "timestamp": "2024-11-20T10:30:00Z",
  "correlationId": "uuid",
  "payload": {
    "organizationId": "string",
    "skillName": "AI/Machine Learning",
    "skillCategory": "digital",
    "currentCoverage": 15.0,
    "requiredCoverage": 40.0,
    "gap": 25.0,
    "priority": "critical",
    "affectedRoles": ["data-scientist", "engineer"],
    "trainingRecommendations": ["ML-101", "AI-Fundamentals"],
    "estimatedCost": 50000,
    "estimatedTimeToClose": 6,
    "privacyMetadata": {
      "individualProfilesNotUsed": true,
      "aggregatedGapAnalysis": true
    }
  }
}
```

#### TrainingTargetAchieved
```json
{
  "eventType": "training.target.achieved.v1",
  "version": "v1",
  "timestamp": "2024-11-20T10:30:00Z",
  "correlationId": "uuid",
  "payload": {
    "organizationId": "string",
    "targetId": "string",
    "targetType": "training-hours" | "participation-rate" | "skills-coverage",
    "targetValue": 40,
    "actualValue": 42,
    "targetYear": 2024,
    "achievedDate": "2024-11-20",
    "daysEarly": 42
  }
}
```

### 5.2 Consumed Events

#### EmployeeHired (from Workforce Service)
```json
{
  "eventType": "workforce.employee.hired.v1",
  "version": "v1",
  "timestamp": "2024-11-20T10:30:00Z",
  "correlationId": "uuid",
  "payload": {
    "organizationId": "string",
    "employeeId": "string",
    "jobCategory": "manager",
    "location": "US-NY",
    "department": "Engineering",
    "startDate": "2024-11-25"
  }
}
```

**Action**: Assign mandatory onboarding training (safety, ethics, compliance)

#### EmployeeTerminated (from Workforce Service)
```json
{
  "eventType": "workforce.employee.terminated.v1",
  "version": "v1",
  "timestamp": "2024-11-20T10:30:00Z",
  "correlationId": "uuid",
  "payload": {
    "organizationId": "string",
    "employeeId": "string",
    "jobCategory": "manager",
    "location": "US-NY",
    "terminationDate": "2024-11-30"
  }
}
```

**Action**: Remove from training metrics denominator, archive records

#### EmployeeRoleChanged (from Workforce Service)
```json
{
  "eventType": "workforce.employee.role-changed.v1",
  "version": "v1",
  "timestamp": "2024-11-20T10:30:00Z",
  "correlationId": "uuid",
  "payload": {
    "organizationId": "string",
    "employeeId": "string",
    "previousRole": "individual-contributor",
    "newRole": "manager",
    "changeDate": "2024-12-01"
  }
}
```

**Action**: Assign role-specific training (e.g., leadership training for new managers)

#### SafetyTrainingOverdue (from Safety Service)
```json
{
  "eventType": "safety.training.overdue.v1",
  "version": "v1",
  "timestamp": "2024-11-20T10:30:00Z",
  "correlationId": "uuid",
  "payload": {
    "organizationId": "string",
    "trainingType": "safety-certification",
    "employeeCount": 50,
    "jobCategories": ["operator", "technician"],
    "locations": ["US-TX"],
    "overdueBy": 30
  }
}
```

**Action**: Escalate to HR, update compliance delinquency metrics

#### DiscriminationComplaintFiled (from Diversity Service)
```json
{
  "eventType": "diversity.discrimination-complaint.filed.v1",
  "version": "v1",
  "timestamp": "2024-11-20T10:30:00Z",
  "correlationId": "uuid",
  "payload": {
    "organizationId": "string",
    "complaintType": "discrimination",
    "affectedDepartments": ["Engineering"],
    "complaintDate": "2024-11-20"
  }
}
```

**Action**: Trigger mandatory DEI training for affected departments

#### OrganizationHierarchyUpdated (from Organization Service)
```json
{
  "eventType": "organization.hierarchy.updated.v1",
  "version": "v1",
  "timestamp": "2024-11-20T10:30:00Z",
  "correlationId": "uuid",
  "payload": {
    "organizationId": "string",
    "hierarchyType": "department",
    "updateType": "created",
    "hierarchyId": "dept-123",
    "hierarchyName": "Sustainability"
  }
}
```

**Action**: Update training assignment rules, recalculate metrics by department

## 6. Integration Points

### 6.1 Upstream Dependencies

#### Workforce Service (3021)
- **Purpose**: Employee demographics (anonymized), hiring/termination events
- **Protocol**: HTTP/REST + EventBridge
- **Endpoints**:
  - `GET /v1/workforce/demographics/headcount` (for training metrics denominator)
  - Event subscription: `workforce.employee.hired.v1`, `workforce.employee.terminated.v1`
- **SLA**: <200ms response time
- **Fallback**: Use cached demographics (1-hour TTL)

#### Safety Service (3022)
- **Purpose**: Safety training requirements, certification expirations
- **Protocol**: HTTP/REST + EventBridge
- **Endpoints**:
  - Event subscription: `safety.training.overdue.v1`
- **SLA**: <200ms response time

#### Diversity Service (3028)
- **Purpose**: DEI training triggers (discrimination complaints)
- **Protocol**: HTTP/REST + EventBridge
- **Endpoints**:
  - Event subscription: `diversity.discrimination-complaint.filed.v1`
- **SLA**: <200ms response time

#### Human Rights Service (3027)
- **Purpose**: Human rights training requirements
- **Protocol**: HTTP/REST
- **Endpoints**:
  - `GET /v1/human-rights/training-requirements` (for supply chain roles)
- **SLA**: <200ms response time

#### Wellbeing Service (3029)
- **Purpose**: Mental health training, stress management
- **Protocol**: HTTP/REST
- **Endpoints**:
  - `GET /v1/wellbeing/training-recommendations`
- **SLA**: <200ms response time

#### Organization Service (3002)
- **Purpose**: Organizational hierarchy (for training assignment rules)
- **Protocol**: HTTP/REST + EventBridge
- **Endpoints**:
  - `GET /v1/organizations/:id/hierarchy`
  - Event subscription: `organization.hierarchy.updated.v1`
- **SLA**: <200ms response time

### 6.2 Downstream Consumers

#### Reporting Service (3044)
- **Purpose**: ESG reporting (GRI 404, CSRD S1)
- **Protocol**: HTTP/REST
- **Endpoints Provided**:
  - `GET /v1/training/reports/gri-404`
  - `GET /v1/training/reports/csrd-s1`
- **SLA**: <10s response time (report generation)

#### Notification Service (3008)
- **Purpose**: Alerts (certification expirations, compliance delinquency)
- **Protocol**: EventBridge
- **Events Published**:
  - `training.certification.expired.v1`
  - `training.compliance-training.overdue.v1`
- **SLA**: <5s event delivery

#### Strategy Service (3042)
- **Purpose**: Skills gap analysis for strategic planning
- **Protocol**: HTTP/REST
- **Endpoints Provided**:
  - `GET /v1/training/skills/gap-analysis`
- **SLA**: <5s response time

### 6.3 External Integrations

#### LMS (Cornerstone, SuccessFactors, Workday, Moodle)
- **Purpose**: Training data sync (catalog, enrollments, completions)
- **Protocol**: REST API + Webhooks
- **Authentication**: OAuth 2.0 or API Key
- **Sync Frequency**:
  - Catalog: Daily (full sync weekly)
  - Enrollments/Completions: Real-time (webhooks) + Hourly (incremental sync)
- **Data Flow**: LMS → Training Service (one-way sync)
- **Anonymization**: PII stripped during sync
- **Error Handling**: Retry 3 times with exponential backoff
- **Fallback**: If sync fails, use cached data (max 24 hours old)

#### Certification Providers (LinkedIn Learning, Coursera, Udemy)
- **Purpose**: External training completions
- **Protocol**: REST API + Webhooks
- **Authentication**: OAuth 2.0
- **Sync Frequency**: Real-time (webhooks)
- **Data Flow**: Provider → LMS → Training Service
- **Anonymization**: PII stripped at LMS layer

#### Skills Platforms (Degreed, EdCast)
- **Purpose**: Skills inventory, learning paths
- **Protocol**: REST API
- **Authentication**: OAuth 2.0
- **Sync Frequency**: Daily
- **Data Flow**: Bidirectional (skills taxonomy sync)

#### HRIS (Workday, SuccessFactors, BambooHR)
- **Purpose**: Employee demographics (for training metrics denominator)
- **Protocol**: REST API (via Workforce Service)
- **Authentication**: OAuth 2.0
- **Sync Frequency**: Daily (via Workforce Service)
- **Data Flow**: HRIS → Workforce Service → Training Service (anonymized)

## 7. Testing Requirements

### 7.1 Unit Tests (Target: 90% Coverage)

```typescript
// Anonymization Tests
describe('k-Anonymity Service', () => {
  it('should suppress groups with <5 employees', async () => {
    const metrics = [
      { segment: 'Engineering', employeeCount: 3, averageHours: 40 },
      { segment: 'Sales', employeeCount: 10, averageHours: 35 }
    ];
    const anonymized = await kAnonymityService.enforce(metrics, 5);
    expect(anonymized).toHaveLength(1);
    expect(anonymized[0].segment).toBe('Sales');
  });

  it('should apply differential privacy for groups 5-10', async () => {
    const metrics = { segment: 'Marketing', employeeCount: 7, averageHours: 38 };
    const anonymized = await kAnonymityService.enforce([metrics], 5);
    expect(anonymized[0].averageHours).not.toBe(38); // noise added
    expect(Math.abs(anonymized[0].averageHours - 38)).toBeLessThan(5); // within 5 hours
  });

  it('should never expose individual employee data', async () => {
    const individualRecord = { employeeId: '123', trainingHours: 40 };
    expect(() => kAnonymityService.enforce([individualRecord], 5)).toThrow('PII detected');
  });
});

// Training Metrics Tests
describe('Training Metrics Service', () => {
  it('should calculate average hours per employee', async () => {
    const metrics = await metricsService.getSummary('org-123', '2024-01-01', '2024-12-31');
    expect(metrics.averageHoursPerEmployee).toBeGreaterThan(0);
    expect(metrics.employeeCount).toBeGreaterThanOrEqual(5); // k-anonymity
  });

  it('should cache metrics for 1 hour', async () => {
    await metricsService.getSummary('org-123', '2024-01-01', '2024-12-31');
    const cached = await redis.get('training:metrics:org-123:2024');
    expect(cached).not.toBeNull();
    const ttl = await redis.ttl('training:metrics:org-123:2024');
    expect(ttl).toBeLessThanOrEqual(3600);
  });
});

// Compliance Tests
describe('Compliance Service', () => {
  it('should calculate delinquency rate as percentage', async () => {
    const compliance = await complianceService.getSummary('org-123', 'safety');
    expect(compliance.delinquencyRate).toBeGreaterThanOrEqual(0);
    expect(compliance.delinquencyRate).toBeLessThanOrEqual(100);
    expect(compliance).not.toHaveProperty('delinquentEmployeeNames'); // privacy check
  });

  it('should alert on high delinquency (>20%)', async () => {
    const mockEventPublisher = jest.spyOn(eventPublisher, 'publish');
    await complianceService.checkDelinquency('org-123', 'ethics');
    expect(mockEventPublisher).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'training.compliance-training.overdue.v1' })
    );
  });
});

// LMS Sync Tests
describe('LMS Sync Service', () => {
  it('should strip PII during sync', async () => {
    const lmsData = [
      { employeeId: '123', name: 'John Doe', courseId: 'C-101', completionDate: '2024-11-20' }
    ];
    const anonymized = await lmsService.anonymize(lmsData);
    expect(anonymized[0]).not.toHaveProperty('employeeId');
    expect(anonymized[0]).not.toHaveProperty('name');
    expect(anonymized[0]).toHaveProperty('courseId');
  });

  it('should handle sync errors gracefully', async () => {
    const mockConnector = jest.spyOn(cornerstoneConnector, 'sync').mockRejectedValue(new Error('API error'));
    const result = await lmsService.sync('org-123', 'cornerstone', 'full');
    expect(result.status).toBe('failed');
    expect(result.errors).toHaveLength(1);
  });
});

// Skills Gap Analysis Tests
describe('Skills Gap Analyzer', () => {
  it('should identify critical skills gaps', async () => {
    const gaps = await skillsService.analyzeGaps('org-123');
    const criticalGaps = gaps.filter(g => g.priority === 'critical');
    expect(criticalGaps.length).toBeGreaterThan(0);
    expect(criticalGaps[0]).toHaveProperty('trainingRecommendations');
  });

  it('should not expose individual skills profiles', async () => {
    const gaps = await skillsService.analyzeGaps('org-123');
    gaps.forEach(gap => {
      expect(gap).not.toHaveProperty('employeeId');
      expect(gap).not.toHaveProperty('individualProfiles');
    });
  });
});
```

### 7.2 Integration Tests

```typescript
// LMS Integration Tests
describe('LMS Integration (E2E)', () => {
  it('should sync course catalog from Cornerstone', async () => {
    const syncResult = await request(app.getHttpServer())
      .post('/v1/training/lms/sync')
      .send({
        source: 'cornerstone',
        syncType: 'full',
        syncScope: 'catalog'
      })
      .expect(200);

    expect(syncResult.body.status).toBe('completed');
    expect(syncResult.body.recordsSynced).toBeGreaterThan(0);

    // Verify catalog in database
    const courses = await courseRepository.find({ organizationId: 'org-123' });
    expect(courses.length).toBeGreaterThan(0);
  });

  it('should receive and process completion webhook', async () => {
    await request(app.getHttpServer())
      .post('/v1/training/lms/webhooks/completion')
      .send({
        eventType: 'training.completed',
        courseId: 'C-101',
        completionDate: '2024-11-20',
        jobCategory: 'manager',
        location: 'US'
      })
      .expect(200);

    // Verify aggregated metrics updated
    const metrics = await metricsRepository.findOne({
      organizationId: 'org-123',
      'reportingPeriod.startDate': { $lte: new Date('2024-11-20') }
    });
    expect(metrics.metrics.totalTrainingHours).toBeGreaterThan(0);
  });
});

// Privacy Compliance Tests
describe('Privacy Compliance (E2E)', () => {
  it('should never return individual training records', async () => {
    const metrics = await request(app.getHttpServer())
      .get('/v1/training/metrics/summary')
      .query({ organizationId: 'org-123', startDate: '2024-01-01', endDate: '2024-12-31' })
      .expect(200);

    expect(metrics.body).not.toHaveProperty('individualRecords');
    expect(metrics.body.privacyMetadata.anonymizationApplied).toBe(true);
  });

  it('should enforce k-anonymity (minimum group size 5)', async () => {
    const metrics = await request(app.getHttpServer())
      .get('/v1/training/metrics/participation')
      .query({ organizationId: 'org-123', segmentBy: 'job-category' })
      .expect(200);

    metrics.body.participationBySegment.forEach(segment => {
      expect(segment.participantCount).toBeGreaterThanOrEqual(5);
    });
    expect(metrics.body.metadata.suppressedSegments).toBeGreaterThanOrEqual(0);
  });

  it('should handle GDPR right to erasure', async () => {
    const erasureRequest = await request(app.getHttpServer())
      .post('/v1/training/data-governance/erasure')
      .send({ employeeId: 'hashed-employee-id' })
      .expect(200);

    expect(erasureRequest.body.status).toBe('completed');
    expect(erasureRequest.body.actions).toContainEqual(
      expect.objectContaining({ action: 'anonymize', collection: 'training_metrics' })
    );
  });
});

// Reporting Integration Tests
describe('ESG Reporting (E2E)', () => {
  it('should generate GRI 404 report', async () => {
    const report = await request(app.getHttpServer())
      .get('/v1/training/reports/gri-404')
      .query({ organizationId: 'org-123', reportingYear: 2024 })
      .expect(200);

    expect(report.body.disclosure404_1).toBeDefined();
    expect(report.body.disclosure404_1.averageHoursPerEmployee).toBeGreaterThan(0);
    expect(report.body.metadata.frameworkVersion).toBe('GRI 404:2016');
    expect(report.body.metadata.anonymizationApplied).toBe(true);
  });

  it('should generate CSRD S1 report', async () => {
    const report = await request(app.getHttpServer())
      .get('/v1/training/reports/csrd-s1')
      .query({ organizationId: 'org-123', reportingYear: 2024 })
      .expect(200);

    expect(report.body.skillsDevelopment).toBeDefined();
    expect(report.body.careerDevelopment).toBeDefined();
    expect(report.body.metadata.doubleMateriality).toBeDefined();
  });
});
```

### 7.3 Performance Tests

```typescript
// Load Testing (K6)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'], // 95% <200ms, 99% <500ms
    http_req_failed: ['rate<0.01']                  // Error rate <1%
  }
};

export default function () {
  const res = http.get('http://training-service:3030/v1/training/metrics/summary?organizationId=org-123&startDate=2024-01-01&endDate=2024-12-31');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time <200ms': (r) => r.timings.duration < 200,
    'has anonymization metadata': (r) => JSON.parse(r.body).privacyMetadata.anonymizationApplied === true
  });

  sleep(1);
}
```

### 7.4 Security Tests

```typescript
// OWASP ZAP Security Scan
describe('Security Scan', () => {
  it('should pass OWASP ZAP baseline scan', async () => {
    // Run ZAP baseline scan
    const zapResult = await exec('zap-baseline.py -t http://training-service:3030 -J zap-report.json');
    expect(zapResult.highRiskAlerts).toBe(0);
    expect(zapResult.mediumRiskAlerts).toBe(0);
  });

  it('should prevent SQL/NoSQL injection', async () => {
    const maliciousQuery = "'; DROP TABLE training_metrics; --";
    const response = await request(app.getHttpServer())
      .get('/v1/training/metrics/summary')
      .query({ organizationId: maliciousQuery })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should enforce rate limiting', async () => {
    const requests = Array(1001).fill(null).map(() =>
      request(app.getHttpServer())
        .get('/v1/training/metrics/summary')
        .query({ organizationId: 'org-123' })
    );

    const results = await Promise.all(requests);
    const rateLimitedRequests = results.filter(r => r.status === 429);
    expect(rateLimitedRequests.length).toBeGreaterThan(0);
  });
});
```

## 8. Deployment Configuration

### 8.1 Environment Variables

```bash
# Service Configuration
SERVICE_NAME=training-service
SERVICE_PORT=3030
NODE_ENV=production
LOG_LEVEL=info

# Database Configuration
MONGODB_URI=mongodb://admin:password@mongodb-cluster:27017/clenergize_training?authSource=admin
MONGODB_DATABASE=clenergize_training
MONGODB_POOL_SIZE=10
MONGODB_TIMEOUT=5000

# InfluxDB Configuration
INFLUXDB_URL=http://influxdb:8086
INFLUXDB_TOKEN=your-influxdb-token
INFLUXDB_ORG=clenergize
INFLUXDB_BUCKET=training_timeseries
INFLUXDB_RETENTION=5y

# Redis Configuration
REDIS_URL=redis://redis-cluster:6379
REDIS_CACHE_DB=0
REDIS_PUBSUB_DB=1
REDIS_PASSWORD=your-redis-password
REDIS_TLS_ENABLED=true

# AWS Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=clenergize-training-evidence
AWS_EVENTBRIDGE_BUS=clenergize-event-bus
AWS_SECRETS_MANAGER_PREFIX=/clenergize/training

# LMS Integration
LMS_CORNERSTONE_API_URL=https://api.csod.com
LMS_CORNERSTONE_CLIENT_ID=your-client-id
LMS_CORNERSTONE_CLIENT_SECRET=/clenergize/training/cornerstone-secret
LMS_SUCCESSFACTORS_API_URL=https://api.successfactors.com
LMS_SUCCESSFACTORS_CLIENT_ID=your-client-id
LMS_SUCCESSFACTORS_CLIENT_SECRET=/clenergize/training/sf-secret
LMS_WORKDAY_API_URL=https://api.workday.com
LMS_WORKDAY_CLIENT_ID=your-client-id
LMS_WORKDAY_CLIENT_SECRET=/clenergize/training/workday-secret
LMS_MOODLE_API_URL=https://moodle.yourcompany.com
LMS_MOODLE_API_TOKEN=/clenergize/training/moodle-token

# Privacy Configuration
PRIVACY_MINIMUM_GROUP_SIZE=5
PRIVACY_DIFFERENTIAL_PRIVACY_ENABLED=true
PRIVACY_EPSILON=1.0
PRIVACY_PII_DETECTION_ENABLED=true

# Sync Configuration
SYNC_CATALOG_CRON=0 2 * * * # Daily at 2am
SYNC_INCREMENTAL_CRON=0 * * * * # Hourly
SYNC_RETRY_ATTEMPTS=3
SYNC_RETRY_DELAY=5000

# Security
JWT_PUBLIC_KEY_URL=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxx/.well-known/jwks.json
JWT_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxx
JWT_AUDIENCE=clenergize-api
CORS_ORIGINS=https://app.clenergize.com,https://admin.clenergize.com

# Rate Limiting
RATE_LIMIT_WINDOW=60000 # 1 minute
RATE_LIMIT_MAX_REQUESTS=1000

# Monitoring
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENVIRONMENT=production

# Feature Flags
FEATURE_DIFFERENTIAL_PRIVACY=true
FEATURE_REAL_TIME_SYNC=true
FEATURE_GREEN_SKILLS_TRACKING=true
```

### 8.2 Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: training-service
  namespace: clenergize-social
  labels:
    app: training-service
    domain: social
    phase: "4"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: training-service
  template:
    metadata:
      labels:
        app: training-service
        domain: social
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: training-service
      containers:
      - name: training-service
        image: clenergize/training-service:1.0.0
        ports:
        - containerPort: 3030
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: NODE_ENV
          value: "production"
        - name: SERVICE_PORT
          value: "3030"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: training-service-secrets
              key: mongodb-uri
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: training-service-secrets
              key: redis-url
        - name: INFLUXDB_TOKEN
          valueFrom:
            secretKeyRef:
              name: training-service-secrets
              key: influxdb-token
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3030
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3030
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: training-service
  namespace: clenergize-social
spec:
  selector:
    app: training-service
  ports:
  - name: http
    port: 80
    targetPort: 3030
  - name: metrics
    port: 9090
    targetPort: 9090
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: training-service-hpa
  namespace: clenergize-social
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: training-service
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

### 8.3 Docker Compose (Local Development)

```yaml
version: '3.8'

services:
  training-service:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: training-service
    ports:
      - "3030:3030"
      - "9090:9090"
    environment:
      - NODE_ENV=development
      - SERVICE_PORT=3030
      - MONGODB_URI=mongodb://admin:localdev123@mongodb:27017/clenergize_training?authSource=admin
      - REDIS_URL=redis://redis:6379
      - INFLUXDB_URL=http://influxdb:8086
      - LOG_LEVEL=debug
    depends_on:
      - mongodb
      - redis
      - influxdb
    volumes:
      - ./src:/app/src
      - ./test:/app/test
    networks:
      - clenergize-network

  mongodb:
    image: mongo:7.0
    container_name: training-mongodb
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=localdev123
      - MONGO_INITDB_DATABASE=clenergize_training
    volumes:
      - mongodb-data:/data/db
    networks:
      - clenergize-network

  redis:
    image: redis:7-alpine
    container_name: training-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - clenergize-network

  influxdb:
    image: influxdb:2.7
    container_name: training-influxdb
    ports:
      - "8086:8086"
    environment:
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=admin
      - DOCKER_INFLUXDB_INIT_PASSWORD=localdev123
      - DOCKER_INFLUXDB_INIT_ORG=clenergize
      - DOCKER_INFLUXDB_INIT_BUCKET=training_timeseries
      - DOCKER_INFLUXDB_INIT_RETENTION=5y
    volumes:
      - influxdb-data:/var/lib/influxdb2
    networks:
      - clenergize-network

volumes:
  mongodb-data:
  redis-data:
  influxdb-data:

networks:
  clenergize-network:
    driver: bridge
```

## 9. Migration Considerations

### 9.1 Data Migration from LMS

**Challenge**: Migrate historical training data from LMS to Training Service while maintaining privacy.

**Approach**:
1. **Phase 1: Catalog Sync** (Week 1)
   - Sync course catalog from LMS (no privacy concerns)
   - Validate catalog completeness (all active courses)

2. **Phase 2: Historical Aggregation** (Week 2-3)
   - Extract historical training data from LMS (individual records)
   - Run anonymization pipeline (strip PII, enforce k-anonymity)
   - Generate aggregated metrics by period (monthly, quarterly, annually)
   - Load aggregated metrics into MongoDB and InfluxDB

3. **Phase 3: Incremental Sync Setup** (Week 4)
   - Configure real-time webhooks (enrollment, completion)
   - Setup incremental sync jobs (hourly for completions)
   - Validate data consistency (LMS vs. Training Service)

4. **Phase 4: Cutover** (Week 5)
   - Switch ESG reporting to Training Service
   - Monitor for discrepancies (compare LMS reports vs. Training Service reports)
   - Retire legacy reporting queries from LMS

**Privacy Controls**:
- Historical data anonymized before loading
- Individual training records NEVER stored in Training Service
- Only aggregated metrics migrated

### 9.2 Skills Taxonomy Migration

**Challenge**: Migrate from legacy skills taxonomy to new standardized taxonomy.

**Approach**:
1. **Skills Mapping** (Week 1)
   - Create mapping: legacy skill name → new skill name
   - Handle synonyms (e.g., "Machine Learning" = "ML" = "AI/ML")
   - Consolidate duplicates

2. **Historical Data Transformation** (Week 2)
   - Apply mapping to historical skills data
   - Recalculate skills coverage with new taxonomy
   - Validate: sum of old coverage = sum of new coverage

3. **Go-Live** (Week 3)
   - Switch to new taxonomy
   - Provide legacy-to-new mapping in API responses (transition period)
   - Update dashboards and reports

### 9.3 Compliance Training Cutover

**Challenge**: Migrate compliance training tracking from HRIS to Training Service.

**Approach**:
1. **Parallel Run** (Month 1)
   - Both HRIS and Training Service track compliance
   - Daily reconciliation (compare completion rates)

2. **Discrepancy Resolution** (Month 2)
   - Investigate and fix discrepancies
   - Ensure Training Service is source of truth

3. **Cutover** (Month 3)
   - Switch compliance reporting to Training Service
   - HRIS continues to store individual compliance records (privacy)
   - Training Service consumes aggregated compliance data from HRIS

## 10. Future Enhancements

### 10.1 Phase 5 Enhancements (Roadmap)

#### AI-Powered Training Recommendations
- **Feature**: Personalized training recommendations based on role, skills gaps, career goals
- **ML Model**: Collaborative filtering (similar employees took these courses)
- **Privacy**: Recommendations based on aggregated patterns (not individual tracking)
- **Timeline**: Q2 2025

#### Predictive Compliance Risk
- **Feature**: Predict which employees are at risk of missing compliance deadlines
- **ML Model**: Logistic regression (features: past completion time, role, location)
- **Privacy**: Risk scores at department level (not individual level)
- **Timeline**: Q3 2025

#### Training ROI Prediction
- **Feature**: Predict ROI before launching training program
- **ML Model**: Linear regression (historical ROI, course characteristics, target audience)
- **Privacy**: ROI prediction at organizational level
- **Timeline**: Q4 2025

### 10.2 Advanced Analytics

#### Skills Gap Forecasting
- **Feature**: Forecast future skills gaps based on strategic initiatives
- **Input**: Strategic plan (e.g., "net-zero by 2030" → need for green skills)
- **Output**: Year-by-year skills gap projections
- **Timeline**: Q1 2026

#### Training Effectiveness Benchmarking
- **Feature**: Compare training effectiveness to industry benchmarks
- **Data Source**: Anonymous industry data (via ESG platforms)
- **Privacy**: Organization-level benchmarks ONLY
- **Timeline**: Q2 2026

### 10.3 Integrations

#### Learning Experience Platforms (LXPs)
- **Platforms**: Degreed, EdCast, 360Learning
- **Purpose**: Personalized learning journeys, content curation
- **Timeline**: Q3 2025

#### Performance Management Systems
- **Purpose**: Link training to performance reviews (aggregated correlation)
- **Privacy**: Correlation analysis at group level (not individual level)
- **Timeline**: Q4 2025

#### Talent Marketplaces
- **Purpose**: Internal mobility (training for new roles)
- **Privacy**: Skills inventory at role level (not individual profiles)
- **Timeline**: Q1 2026

---

**Document Version**: 1.0.0
**Last Updated**: November 20, 2024
**Next Review**: Sprint 21 Retrospective
**Owner**: Social Domain Team
**Approvers**: ESG Platform Architect, Privacy Officer, Social Domain Lead
