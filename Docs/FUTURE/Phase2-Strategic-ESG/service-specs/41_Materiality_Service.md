# Service Specification: Materiality Service

## Service Overview

**Service Name**: Materiality Service
**Port**: 3041
**Purpose**: Manages double materiality assessment, stakeholder engagement, issue prioritization, and continuous materiality monitoring for CSRD compliance
**Domain**: Strategic ESG Management
**Team Ownership**: Strategic ESG Team
**Phase**: 2 (Months 9-12)
**Story Points**: 55
**Agent**: Materiality Agent

## 1. Functional Requirements

### 1.1 Core Features

#### Double Materiality Assessment
- **Financial Materiality**: Impact of ESG issues on company value
  - Revenue/cost implications
  - Risk exposure assessment
  - Capital allocation impacts
  - Investor perception analysis
- **Impact Materiality**: Company's impact on people and environment
  - Positive/negative impact assessment
  - Severity and scope measurement
  - Likelihood and irremediability evaluation
  - Stakeholder affected analysis
- **Threshold Setting**: Define materiality thresholds
- **Dynamic Materiality**: Continuous reassessment based on triggers
- **Multi-Perspective Analysis**: Combine internal and external views

#### Stakeholder Engagement Platform
- **Stakeholder Mapping**: Identify and categorize stakeholders
  - Employees, investors, customers, suppliers
  - Local communities, NGOs, regulators
  - Influence and interest mapping
  - Priority stakeholder identification
- **Survey Management**: Design and distribute materiality surveys
  - Multi-language support
  - Rating scales (1-5, Likert, matrix)
  - Anonymous/authenticated responses
  - Progress tracking and reminders
- **Interview Management**: Schedule and document stakeholder interviews
  - Structured interview guides
  - Note-taking and recording
  - Thematic analysis
- **Consultation Tracking**: Document engagement activities
  - Meeting minutes
  - Feedback synthesis
  - Follow-up action tracking

#### Issue Prioritization Matrix
- **Issue Library**: Comprehensive ESG topic taxonomy
  - GRI, SASB, ESRS topic mapping
  - Sector-specific issues
  - Custom issue creation
  - Issue descriptions and impacts
- **Scoring Methodology**: Multi-criteria assessment
  - Financial impact scoring (1-5)
  - Environmental/social impact scoring (1-5)
  - Likelihood/probability assessment
  - Time horizon (short/medium/long-term)
- **Heat Mapping**: Visual materiality matrix
  - 2D visualization (financial vs impact)
  - Quadrant analysis
  - Threshold lines
  - Peer comparison overlay
- **Prioritization Rules**: Automated categorization
  - Material vs non-material
  - High/medium/low priority
  - Mandatory disclosure requirements
  - Voluntary disclosure considerations

#### Materiality Reporting
- **Matrix Visualization**: Interactive materiality matrix
  - Bubble charts with issue sizing
  - Drill-down to issue details
  - Filtering by dimension/category
  - Export to PNG/PDF
- **Narrative Generation**: AI-assisted narrative builder
  - Key findings summarization
  - Material issue descriptions
  - Stakeholder perspective synthesis
  - Trend analysis over time
- **Stakeholder Report**: Engagement summary
  - Participation statistics
  - Key themes and concerns
  - Response to stakeholder feedback
  - Next steps and commitments
- **Compliance Reporting**: CSRD materiality disclosure
  - ESRS 2 (General Disclosures) compliance
  - Double materiality statement
  - Assessment methodology description
  - Material issue justification

#### Continuous Materiality Monitoring
- **Trigger Events**: Monitor for reassessment triggers
  - Regulatory changes (new ESG laws)
  - Industry incidents (safety, environmental)
  - Market shifts (technology disruption)
  - Stakeholder concerns (media, activism)
- **Trend Analysis**: Track materiality evolution
  - Score changes over time
  - Emerging issues identification
  - Declining issue detection
  - Peer materiality comparison
- **Alert System**: Notify stakeholders of changes
  - Material issue additions/removals
  - Significant score changes
  - Stakeholder concern escalations
  - Regulatory update notifications
- **Reassessment Workflow**: Trigger periodic reviews
  - Annual full reassessment
  - Quarterly light-touch reviews
  - Event-driven reassessments
  - Stakeholder feedback loops

#### Sector-Specific Analysis (SASB)
- **Industry Classification**: SICS sector mapping
  - 77 industry standards
  - Sector-specific materiality factors
  - Industry comparison groups
- **SASB Materiality Map**: Pre-populated material topics
  - Industry-specific disclosure topics
  - Evidence of materiality from SASB research
  - Customization for company context
- **Peer Benchmarking**: Compare with industry peers
  - Peer materiality matrices
  - Disclosure gap analysis
  - Best practice identification
- **Framework Integration**: Link SASB to GRI/ESRS
  - Cross-framework mapping
  - Harmonized disclosure planning
  - Materiality alignment across standards

### 1.2 API Endpoints

#### Materiality Assessment Endpoints
```yaml
POST /v1/materiality/assessments
  Request:
    - name: string (required)
    - description: string
    - assessmentYear: number (required)
    - framework: string ("CSRD" | "GRI" | "SASB" | "Integrated")
    - scope: string ("Group" | "Entity" | "Division")
    - organizationId: string (required)
  Response:
    - assessmentId: string
    - status: "draft"
    - createdAt: timestamp
    - createdBy: string

GET /v1/materiality/assessments
  Query:
    - organizationId: string (required)
    - year: number (optional)
    - status: string (optional)
    - page: number
    - limit: number
  Response:
    - assessments: MaterialityAssessment[]
    - total: number
    - page: number

GET /v1/materiality/assessments/:assessmentId
  Response:
    - assessment: MaterialityAssessment
    - issues: MaterialityIssue[]
    - stakeholders: StakeholderGroup[]
    - matrix: MaterialityMatrix

PUT /v1/materiality/assessments/:assessmentId
  Request:
    - name: string
    - description: string
    - status: string ("draft" | "in_progress" | "review" | "approved")
  Response:
    - assessment: MaterialityAssessment

DELETE /v1/materiality/assessments/:assessmentId
  Response:
    - success: boolean
    - message: string

POST /v1/materiality/assessments/:assessmentId/publish
  Response:
    - assessment: MaterialityAssessment
    - publishedAt: timestamp
```

#### Issue Management Endpoints
```yaml
GET /v1/materiality/issues
  Query:
    - framework: string ("GRI" | "SASB" | "ESRS")
    - sector: string (SASB sector)
    - category: string ("E" | "S" | "G")
    - search: string
  Response:
    - issues: IssueTemplate[]
    - total: number

POST /v1/materiality/assessments/:assessmentId/issues
  Request:
    - issueTemplateId: string (optional)
    - customIssue: {
        name: string,
        description: string,
        category: string,
        subcategory: string
      }
    - financialMateriality: {
        score: number (1-5),
        impact: string ("revenue" | "cost" | "risk" | "opportunity"),
        likelihood: number (1-5),
        magnitude: number (1-5),
        timeHorizon: string ("short" | "medium" | "long"),
        rationale: string
      }
    - impactMateriality: {
        score: number (1-5),
        severity: number (1-5),
        scope: number (1-5),
        irremediability: number (1-5),
        likelihood: number (1-5),
        affectedStakeholders: string[],
        rationale: string
      }
  Response:
    - issue: MaterialityIssue

GET /v1/materiality/assessments/:assessmentId/issues/:issueId
  Response:
    - issue: MaterialityIssue
    - stakeholderFeedback: StakeholderResponse[]
    - evidenceLinks: Evidence[]

PUT /v1/materiality/assessments/:assessmentId/issues/:issueId
  Request:
    - financialMateriality: object
    - impactMateriality: object
    - status: string ("identified" | "assessed" | "material" | "non_material")
  Response:
    - issue: MaterialityIssue

DELETE /v1/materiality/assessments/:assessmentId/issues/:issueId
  Response:
    - success: boolean

POST /v1/materiality/assessments/:assessmentId/issues/:issueId/evidence
  Request:
    - type: string ("document" | "data" | "stakeholder_input")
    - url: string
    - description: string
  Response:
    - evidence: Evidence
```

#### Stakeholder Engagement Endpoints
```yaml
POST /v1/materiality/assessments/:assessmentId/stakeholders
  Request:
    - groupName: string (required)
    - groupType: string ("employees" | "investors" | "customers" | "suppliers" | "community" | "ngos" | "regulators" | "other")
    - description: string
    - contacts: [{
        name: string,
        email: string,
        role: string,
        organization: string
      }]
    - influence: number (1-5)
    - interest: number (1-5)
    - engagementMethod: string ("survey" | "interview" | "workshop" | "focus_group")
  Response:
    - stakeholderGroup: StakeholderGroup

GET /v1/materiality/assessments/:assessmentId/stakeholders
  Response:
    - stakeholderGroups: StakeholderGroup[]
    - totalStakeholders: number
    - engagementStats: {
        invited: number,
        responded: number,
        responseRate: number
      }

PUT /v1/materiality/assessments/:assessmentId/stakeholders/:stakeholderId
  Request:
    - groupName: string
    - contacts: Contact[]
    - influence: number
    - interest: number
  Response:
    - stakeholderGroup: StakeholderGroup

DELETE /v1/materiality/assessments/:assessmentId/stakeholders/:stakeholderId
  Response:
    - success: boolean
```

#### Survey Management Endpoints
```yaml
POST /v1/materiality/assessments/:assessmentId/surveys
  Request:
    - title: string (required)
    - description: string
    - language: string (default: "en")
    - targetStakeholders: string[] (stakeholder group IDs)
    - questions: [{
        questionId: string,
        questionText: string,
        questionType: string ("rating" | "ranking" | "text" | "multiselect"),
        issueId: string (optional),
        options: string[] (for multiselect),
        required: boolean
      }]
    - openDate: timestamp
    - closeDate: timestamp
  Response:
    - survey: Survey
    - surveyUrl: string
    - invitationTokens: string[]

GET /v1/materiality/assessments/:assessmentId/surveys
  Response:
    - surveys: Survey[]

GET /v1/materiality/surveys/:surveyId
  Response:
    - survey: Survey
    - responses: number
    - responseRate: number

POST /v1/materiality/surveys/:surveyId/responses
  Request:
    - stakeholderToken: string (required)
    - responses: [{
        questionId: string,
        answer: any (number, string, string[])
      }]
    - additionalComments: string
  Response:
    - success: boolean
    - responseId: string

GET /v1/materiality/surveys/:surveyId/results
  Response:
    - survey: Survey
    - aggregatedResults: {
        questionId: string,
        questionText: string,
        averageScore: number,
        distribution: {[key: string]: number},
        responseCount: number
      }[]
    - stakeholderFeedback: string[]

POST /v1/materiality/surveys/:surveyId/send-invitations
  Request:
    - stakeholderGroupIds: string[]
    - reminderSchedule: timestamp[]
  Response:
    - invitationsSent: number
    - invitationTokens: string[]
```

#### Interview Management Endpoints
```yaml
POST /v1/materiality/assessments/:assessmentId/interviews
  Request:
    - stakeholderId: string (required)
    - interviewType: string ("individual" | "group")
    - scheduledDate: timestamp
    - interviewer: string
    - location: string ("in_person" | "virtual" | "phone")
    - meetingLink: string (optional)
    - interviewGuide: string (template or custom)
  Response:
    - interview: Interview
    - calendarInvite: string (ICS)

GET /v1/materiality/assessments/:assessmentId/interviews
  Query:
    - status: string ("scheduled" | "completed" | "cancelled")
    - stakeholderId: string
  Response:
    - interviews: Interview[]

PUT /v1/materiality/interviews/:interviewId
  Request:
    - status: string
    - notes: string
    - keyThemes: string[]
    - materiality Insights: string
    - recordingUrl: string (optional)
  Response:
    - interview: Interview

DELETE /v1/materiality/interviews/:interviewId
  Response:
    - success: boolean
```

#### Materiality Matrix Endpoints
```yaml
GET /v1/materiality/assessments/:assessmentId/matrix
  Query:
    - includeNonMaterial: boolean (default: false)
    - compareWith: string (assessmentId for comparison)
  Response:
    - matrix: {
        issues: [{
          issueId: string,
          issueName: string,
          category: string,
          financialScore: number,
          impactScore: number,
          isMaterial: boolean,
          quadrant: string ("high_high" | "high_low" | "low_high" | "low_low")
        }],
        thresholds: {
          financialThreshold: number,
          impactThreshold: number
        },
        materialIssuesCount: number,
        nonMaterialIssuesCount: number
      }

POST /v1/materiality/assessments/:assessmentId/matrix/export
  Request:
    - format: string ("png" | "pdf" | "svg" | "excel")
    - includeLabels: boolean
    - includeMetadata: boolean
  Response:
    - downloadUrl: string
    - expiresAt: timestamp

PUT /v1/materiality/assessments/:assessmentId/thresholds
  Request:
    - financialThreshold: number (1-5)
    - impactThreshold: number (1-5)
    - rationale: string
  Response:
    - thresholds: Thresholds
    - materialIssuesCount: number
    - reclassifiedIssues: string[]
```

#### Reporting & Analytics Endpoints
```yaml
GET /v1/materiality/assessments/:assessmentId/report
  Query:
    - format: string ("html" | "pdf" | "word")
    - sections: string[] (optional, filter sections)
  Response:
    - report: {
        executiveSummary: string,
        methodology: string,
        stakeholderEngagement: object,
        materialityMatrix: object,
        materialIssues: MaterialityIssue[],
        nextsteps: string
      }

GET /v1/materiality/assessments/:assessmentId/stakeholder-report
  Response:
    - report: {
        participationStats: object,
        keyThemes: string[],
        stakeholderConcerns: string[],
        companyResponse: string,
        nextSteps: string
      }

GET /v1/materiality/assessments/:assessmentId/compliance-report
  Query:
    - framework: string ("CSRD_ESRS2" | "GRI_3" | "SASB")
  Response:
    - report: {
        disclosureRequirements: object,
        materialityStatement: string,
        assessmentProcess: string,
        materialIssues: MaterialityIssue[],
        complianceGaps: string[]
      }

GET /v1/materiality/analytics/trends
  Query:
    - organizationId: string (required)
    - years: number[] (optional)
    - issueCategory: string (optional)
  Response:
    - trends: {
        issueTrends: [{
          issueId: string,
          issueName: string,
          scoreHistory: [{year: number, financialScore: number, impactScore: number}],
          trendDirection: string ("increasing" | "stable" | "decreasing")
        }],
        materialityChanges: [{
          year: number,
          issuesAdded: string[],
          issuesRemoved: string[],
          issuesReclassified: string[]
        }]
      }

GET /v1/materiality/analytics/peer-comparison
  Query:
    - organizationId: string (required)
    - sector: string (SASB sector)
    - region: string (optional)
  Response:
    - comparison: {
        peerMaterialIssues: {[issue: string]: number}, // % of peers with this material
        uniqueIssues: string[], // Material for company but not peers
        missedIssues: string[], // Material for peers but not company
        alignmentScore: number (0-100)
      }
```

#### Continuous Monitoring Endpoints
```yaml
POST /v1/materiality/monitoring/triggers
  Request:
    - assessmentId: string (required)
    - triggerType: string ("regulatory" | "incident" | "market" | "stakeholder")
    - triggerName: string
    - description: string
    - monitoringFrequency: string ("daily" | "weekly" | "monthly")
    - thresholds: {
        severity: string ("low" | "medium" | "high"),
        autoReassess: boolean
      }
  Response:
    - trigger: MonitoringTrigger

GET /v1/materiality/monitoring/triggers
  Query:
    - assessmentId: string
    - triggerType: string
  Response:
    - triggers: MonitoringTrigger[]

POST /v1/materiality/monitoring/events
  Request:
    - triggerId: string (required)
    - eventDate: timestamp
    - eventDescription: string
    - severity: string ("low" | "medium" | "high")
    - affectedIssues: string[] (issueIds)
    - recommendedAction: string ("monitor" | "reassess" | "escalate")
  Response:
    - event: MonitoringEvent
    - alertsSent: number

GET /v1/materiality/monitoring/events
  Query:
    - assessmentId: string
    - startDate: timestamp
    - endDate: timestamp
    - severity: string
  Response:
    - events: MonitoringEvent[]
    - unresolvedEvents: number

PUT /v1/materiality/monitoring/events/:eventId
  Request:
    - status: string ("open" | "under_review" | "resolved" | "dismissed")
    - resolutionNotes: string
  Response:
    - event: MonitoringEvent
```

### 1.3 Business Rules

#### Double Materiality Rules
1. **CSRD Requirement**: All EU organizations must conduct double materiality assessment annually
2. **Threshold Logic**: Issue is material if it exceeds threshold on EITHER financial OR impact dimension
3. **IRO Classification**: Material issues must be classified as impacts, risks, or opportunities (IRO)
4. **Time Horizon**: Assess materiality across short (0-1 year), medium (1-3 years), long (3+ years) term
5. **Value Chain**: Consider materiality across upstream, own operations, and downstream activities
6. **Dynamic Assessment**: Reassess whenever significant organizational or external changes occur

#### Stakeholder Engagement Rules
1. **Minimum Coverage**: Engage representatives from ALL major stakeholder groups (employees, investors, customers, suppliers, communities, civil society)
2. **Response Threshold**: Minimum 30% response rate for survey data to be considered representative
3. **Anonymity**: Survey responses must be anonymized unless stakeholder consents to identification
4. **Follow-up Requirement**: Communicate back to stakeholders on how their input influenced materiality determination
5. **Diversity**: Ensure stakeholder sample represents diversity of perspectives (geography, seniority, demographics)

#### Prioritization Rules
1. **Material Classification**: Issue is material if financial score >= threshold OR impact score >= threshold
2. **Default Thresholds**: Financial >= 3/5 OR Impact >= 3/5 (customizable per organization)
3. **Mandatory Disclosure**: ESRS material issues automatically trigger disclosure requirements
4. **Precautionary Principle**: If uncertainty exists, classify as material pending further assessment
5. **Stakeholder Voice**: If >50% of stakeholders rate an issue as high priority, review threshold logic

#### Monitoring Rules
1. **Annual Review**: Full materiality assessment must be conducted at least annually
2. **Trigger Events**: Automatic reassessment triggered by:
   - Major regulatory changes affecting ESG disclosure
   - Significant incidents (safety, environmental, social)
   - Major organizational changes (M&A, restructuring, new markets)
   - Sustained stakeholder pressure on specific issue
3. **Escalation**: High-severity monitoring events automatically notify ESG leadership
4. **Audit Trail**: All materiality decisions must be documented with rationale and evidence

### 1.4 Error Handling

```yaml
Error Responses:
  400 Bad Request:
    - INVALID_ASSESSMENT_YEAR
    - INVALID_SCORE_RANGE
    - MISSING_STAKEHOLDER_GROUP
    - SURVEY_ALREADY_CLOSED
    - INVALID_THRESHOLD_VALUE

  401 Unauthorized:
    - INVALID_SURVEY_TOKEN
    - SESSION_EXPIRED

  403 Forbidden:
    - INSUFFICIENT_PERMISSIONS
    - ASSESSMENT_LOCKED
    - SURVEY_ACCESS_DENIED

  404 Not Found:
    - ASSESSMENT_NOT_FOUND
    - ISSUE_NOT_FOUND
    - STAKEHOLDER_NOT_FOUND
    - SURVEY_NOT_FOUND

  409 Conflict:
    - ASSESSMENT_ALREADY_PUBLISHED
    - ISSUE_ALREADY_EXISTS
    - STAKEHOLDER_ALREADY_INVITED

  422 Unprocessable Entity:
    - INCOMPLETE_DOUBLE_MATERIALITY
    - INSUFFICIENT_STAKEHOLDER_ENGAGEMENT
    - MISSING_ISSUE_RATIONALE
    - THRESHOLD_BELOW_MINIMUM

  500 Internal Server Error:
    - MATRIX_GENERATION_FAILED
    - REPORT_GENERATION_FAILED
    - SURVEY_SEND_FAILED
```

## 2. Data Model

### 2.1 MongoDB Collections

#### materiality_assessments Collection
```javascript
{
  _id: ObjectId,
  assessmentId: String (UUID, unique, indexed),
  name: String,
  description: String,
  assessmentYear: Number (indexed),

  organization: {
    organizationId: ObjectId,
    organizationName: String
  },

  scope: {
    type: String, // "Group" | "Entity" | "Division"
    entities: [String], // Entity IDs in scope
    valueChain: {
      upstream: Boolean,
      ownOperations: Boolean,
      downstream: Boolean
    }
  },

  framework: {
    primary: String, // "CSRD" | "GRI" | "SASB" | "Integrated"
    secondary: [String] // Additional frameworks
  },

  methodology: {
    approachDescription: String,
    assessmentCriteria: {
      financialMateriality: {
        dimensions: [String], // ["revenue", "cost", "risk", "opportunity"]
        scoringScale: String, // "1-5" | "1-10"
        thresholdLogic: String
      },
      impactMateriality: {
        dimensions: [String], // ["severity", "scope", "irremediability", "likelihood"]
        scoringScale: String,
        thresholdLogic: String
      }
    },
    stakeholderEngagementApproach: String,
    informationSources: [String]
  },

  thresholds: {
    financialThreshold: Number (1-5),
    impactThreshold: Number (1-5),
    rationale: String,
    approvedBy: ObjectId,
    approvedAt: Date
  },

  status: String, // "draft" | "in_progress" | "stakeholder_review" | "management_review" | "approved" | "published"

  workflow: {
    currentStage: String, // "issue_identification" | "stakeholder_engagement" | "scoring" | "review" | "approval"
    completedStages: [String],
    nextSteps: String
  },

  statistics: {
    totalIssues: Number,
    materialIssues: Number,
    nonMaterialIssues: Number,
    stakeholderGroups: Number,
    totalStakeholders: Number,
    responseRate: Number,
    lastCalculated: Date
  },

  publishedData: {
    publishedAt: Date,
    publishedBy: ObjectId,
    publishedVersion: Number,
    downloadUrl: String,
    changelog: String
  },

  metadata: {
    createdAt: Date (indexed),
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId,
    version: Number,
    correlationId: String
  }
}

// Indexes
- assessmentId: unique
- organization.organizationId + assessmentYear: unique (one per year per org)
- status: 1
- metadata.createdAt: -1
```

#### materiality_issues Collection
```javascript
{
  _id: ObjectId,
  issueId: String (UUID, unique, indexed),
  assessmentId: String (indexed),

  issue: {
    name: String,
    description: String,
    category: String, // "E" | "S" | "G"
    subcategory: String, // e.g., "Climate", "Labor", "Ethics"
    isCustom: Boolean, // True if custom, false if from template
    templateId: String // Reference to issue_templates
  },

  frameworks: [{
    framework: String, // "GRI" | "SASB" | "ESRS"
    topicCode: String, // e.g., "ESRS E1", "GRI 305", "SASB EM-MM-110a.1"
    topicName: String,
    disclosureRequirement: String
  }],

  financialMateriality: {
    overallScore: Number (1-5, indexed),

    dimensions: {
      revenueImpact: {
        score: Number (1-5),
        likelihood: Number (1-5),
        magnitude: Number (1-5),
        rationale: String
      },
      costImpact: {
        score: Number (1-5),
        likelihood: Number (1-5),
        magnitude: Number (1-5),
        rationale: String
      },
      riskExposure: {
        score: Number (1-5),
        likelihood: Number (1-5),
        magnitude: Number (1-5),
        rationale: String
      },
      opportunityPotential: {
        score: Number (1-5),
        likelihood: Number (1-5),
        magnitude: Number (1-5),
        rationale: String
      }
    },

    timeHorizon: String, // "short" (0-1 yr) | "medium" (1-3 yr) | "long" (3+ yr)
    confidenceLevel: String, // "high" | "medium" | "low"
    evidence: [ObjectId], // Links to evidence documents
    assessedBy: ObjectId,
    assessedAt: Date,
    reviewedBy: ObjectId,
    reviewedAt: Date
  },

  impactMateriality: {
    overallScore: Number (1-5, indexed),

    dimensions: {
      severity: {
        score: Number (1-5),
        rationale: String
      },
      scope: {
        score: Number (1-5),
        scaleOfAffected: String, // "Individual" | "Community" | "Regional" | "Global"
        rationale: String
      },
      irremediability: {
        score: Number (1-5),
        rationale: String
      },
      likelihood: {
        score: Number (1-5),
        rationale: String
      }
    },

    impactType: String, // "positive" | "negative" | "both"
    affectedStakeholders: [String], // Stakeholder group IDs
    valueChainStage: [String], // "upstream" | "own_operations" | "downstream"

    timeHorizon: String,
    confidenceLevel: String,
    evidence: [ObjectId],
    assessedBy: ObjectId,
    assessedAt: Date,
    reviewedBy: ObjectId,
    reviewedAt: Date
  },

  isMaterial: Boolean (indexed),
  materialityRationale: String,
  iroClassification: {
    impact: Boolean,
    risk: Boolean,
    opportunity: Boolean
  },

  stakeholderPerspective: {
    averageRating: Number,
    responseCount: Number,
    keyComments: [String],
    topConcerns: [String]
  },

  status: String, // "identified" | "assessed" | "under_review" | "material" | "non_material"

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId,
    version: Number
  }
}

// Indexes
- issueId: unique
- assessmentId: 1
- isMaterial: 1
- financialMateriality.overallScore: -1
- impactMateriality.overallScore: -1
- issue.category: 1
- status: 1
```

#### stakeholder_groups Collection
```javascript
{
  _id: ObjectId,
  stakeholderId: String (UUID, unique, indexed),
  assessmentId: String (indexed),

  group: {
    name: String,
    type: String, // "employees" | "investors" | "customers" | "suppliers" | "community" | "ngos" | "regulators" | "other"
    description: String,
    size: Number // Estimated number of stakeholders in group
  },

  contacts: [{
    contactId: String (UUID),
    name: String,
    email: String,
    phone: String,
    role: String,
    organization: String,
    isPrimary: Boolean
  }],

  mapping: {
    influence: Number (1-5), // Ability to affect company
    interest: Number (1-5), // Level of concern in ESG issues
    dependence: Number (1-5), // Dependence on company
    representation: String // "high" | "medium" | "low"
  },

  engagement: {
    methods: [String], // ["survey", "interview", "workshop", "focus_group", "ongoing_dialogue"]
    frequency: String, // "one_time" | "annual" | "quarterly" | "ongoing"
    preferredLanguage: String,
    accessibilityNeeds: String
  },

  participation: {
    invited: Number,
    responded: Number,
    responseRate: Number,
    surveyResponses: [ObjectId],
    interviewRecords: [ObjectId]
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId
  }
}

// Indexes
- stakeholderId: unique
- assessmentId: 1
- group.type: 1
```

#### materiality_surveys Collection
```javascript
{
  _id: ObjectId,
  surveyId: String (UUID, unique, indexed),
  assessmentId: String (indexed),

  survey: {
    title: String,
    description: String,
    language: String,
    welcomeMessage: String,
    closingMessage: String
  },

  questions: [{
    questionId: String (UUID),
    questionText: String,
    questionType: String, // "rating" | "ranking" | "text" | "multiselect" | "matrix"
    issueId: String (optional), // Link to specific materiality issue
    options: [String], // For multiselect
    scale: {
      min: Number,
      max: Number,
      minLabel: String,
      maxLabel: String
    },
    required: Boolean,
    order: Number
  }],

  targeting: {
    stakeholderGroups: [String], // Stakeholder group IDs
    totalInvited: Number,
    invitationsSent: Number
  },

  schedule: {
    openDate: Date,
    closeDate: Date,
    reminderSchedule: [Date]
  },

  status: String, // "draft" | "scheduled" | "open" | "closed" | "archived"

  responses: {
    total: Number,
    responseRate: Number,
    lastResponseAt: Date
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId
  }
}

// Indexes
- surveyId: unique
- assessmentId: 1
- status: 1
- schedule.openDate: 1
- schedule.closeDate: 1
```

#### survey_responses Collection
```javascript
{
  _id: ObjectId,
  responseId: String (UUID, unique, indexed),
  surveyId: String (indexed),
  assessmentId: String (indexed),

  respondent: {
    stakeholderToken: String (indexed), // Anonymized token
    stakeholderGroupId: String,
    stakeholderGroupType: String,
    isAnonymous: Boolean
  },

  answers: [{
    questionId: String,
    questionText: String,
    answer: Mixed, // Number (rating), String (text), [String] (multiselect)
    answeredAt: Date
  }],

  additionalComments: String,

  submission: {
    submittedAt: Date,
    completionTime: Number, // Seconds
    ipAddress: String (hashed),
    userAgent: String
  },

  analysis: {
    sentimentScore: Number (-1 to 1), // For text analysis
    keyThemes: [String],
    flaggedForReview: Boolean,
    reviewNotes: String
  }
}

// Indexes
- responseId: unique
- surveyId: 1
- assessmentId: 1
- respondent.stakeholderToken: unique (per survey)
- submission.submittedAt: -1
```

#### stakeholder_interviews Collection
```javascript
{
  _id: ObjectId,
  interviewId: String (UUID, unique, indexed),
  assessmentId: String (indexed),

  interview: {
    type: String, // "individual" | "group"
    stakeholderGroupId: String,
    participants: [{
      name: String,
      role: String,
      organization: String
    }],
    interviewer: String,
    interviewerRole: String
  },

  scheduling: {
    scheduledDate: Date (indexed),
    duration: Number, // Minutes
    location: String, // "in_person" | "virtual" | "phone"
    meetingLink: String,
    calendarEventId: String
  },

  content: {
    interviewGuide: String, // Template used
    questions: [String],
    notes: String,
    recording: {
      url: String,
      duration: Number,
      transcriptUrl: String
    }
  },

  insights: {
    keyThemes: [String],
    materialityInsights: String,
    quotableComments: [String],
    followUpActions: [String]
  },

  status: String, // "scheduled" | "in_progress" | "completed" | "cancelled"

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId,
    completedAt: Date
  }
}

// Indexes
- interviewId: unique
- assessmentId: 1
- status: 1
- scheduling.scheduledDate: 1
```

#### issue_templates Collection (Reference Data)
```javascript
{
  _id: ObjectId,
  templateId: String (UUID, unique, indexed),

  issue: {
    name: String,
    description: String,
    category: String, // "E" | "S" | "G"
    subcategory: String
  },

  frameworks: [{
    framework: String, // "GRI" | "SASB" | "ESRS" | "TCFD" | "SDG"
    code: String,
    name: String,
    disclosureRequirement: String
  }],

  sector: {
    applicable: String, // "all" | specific SASB sector
    sasbIndustry: [String]
  },

  guidance: {
    assessmentGuidance: String,
    typicalStakeholders: [String],
    commonEvidence: [String],
    relatedIssues: [String] // Other template IDs
  },

  metadata: {
    createdAt: Date,
    updatedAt: Date,
    version: String,
    isActive: Boolean
  }
}

// Indexes
- templateId: unique
- issue.category: 1
- frameworks.framework: 1
- sector.sasbIndustry: 1
```

#### monitoring_triggers Collection
```javascript
{
  _id: ObjectId,
  triggerId: String (UUID, unique, indexed),
  assessmentId: String (indexed),

  trigger: {
    name: String,
    type: String, // "regulatory" | "incident" | "market" | "stakeholder" | "organizational"
    description: String,
    monitoringFrequency: String, // "daily" | "weekly" | "monthly"
    dataSource: String // Where to check for trigger
  },

  thresholds: {
    severity: String, // "low" | "medium" | "high"
    autoReassess: Boolean,
    notificationRecipients: [String] // User IDs or email addresses
  },

  affectedIssues: [String], // Issue IDs that this trigger relates to

  status: String, // "active" | "paused" | "archived"

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId
  }
}

// Indexes
- triggerId: unique
- assessmentId: 1
- status: 1
- trigger.type: 1
```

#### monitoring_events Collection
```javascript
{
  _id: ObjectId,
  eventId: String (UUID, unique, indexed),
  triggerId: String (indexed),
  assessmentId: String (indexed),

  event: {
    date: Date (indexed),
    description: String,
    severity: String, // "low" | "medium" | "high"
    type: String, // Same as trigger type
    source: String,
    url: String // Link to news article, regulation, etc.
  },

  impact: {
    affectedIssues: [String], // Issue IDs
    potentialMaterialityChange: String, // "increase" | "decrease" | "no_change"
    recommendedAction: String // "monitor" | "reassess" | "escalate"
  },

  response: {
    status: String, // "open" | "under_review" | "resolved" | "dismissed"
    assignedTo: ObjectId,
    resolutionNotes: String,
    resolvedAt: Date
  },

  notifications: {
    sent: Boolean,
    sentAt: Date,
    recipients: [String]
  },

  metadata: {
    createdAt: Date,
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId
  }
}

// Indexes
- eventId: unique
- triggerId: 1
- assessmentId: 1
- event.date: -1
- event.severity: 1
- response.status: 1
```

### 2.2 Redis Data Structures

#### Survey Invitation Tokens
```
Key: survey_token:{surveyId}:{token}
Value: {
  stakeholderGroupId: string,
  stakeholderEmail: string,
  expiresAt: timestamp,
  hasResponded: boolean
}
TTL: Survey close date + 30 days
```

#### Survey Response Rate Cache
```
Key: survey_stats:{surveyId}
Value: {
  totalInvited: number,
  totalResponded: number,
  responseRate: number,
  lastUpdated: timestamp
}
TTL: 1 hour (refresh on survey activity)
```

#### Materiality Matrix Cache
```
Key: materiality_matrix:{assessmentId}
Value: {
  issues: Array<{issueId, name, financialScore, impactScore, isMaterial}>,
  thresholds: {financial: number, impact: number},
  generatedAt: timestamp
}
TTL: 1 hour (invalidate on issue update)
```

#### Stakeholder Engagement Cache
```
Key: engagement_stats:{assessmentId}
Value: {
  totalStakeholders: number,
  totalResponses: number,
  responseRate: number,
  groupBreakdown: {[groupType: string]: number},
  lastUpdated: timestamp
}
TTL: 1 hour
```

## 3. Non-Functional Requirements

### 3.1 Performance
- **Assessment Creation**: < 1s
- **Issue Scoring Calculation**: < 500ms
- **Materiality Matrix Generation**: < 2s for 100 issues
- **Survey Response Submission**: < 300ms
- **Report Generation**: < 10s for full materiality report
- **Stakeholder Analytics**: < 1s for engagement stats
- **Concurrent Users**: Support 500 concurrent survey respondents
- **Bulk Issue Import**: 100 issues/second

### 3.2 Scalability
- **Horizontal Scaling**: Stateless service, scale to N instances
- **Database**: MongoDB replica set with 1 primary, 2 secondaries
- **Cache**: Redis cluster with 3 nodes
- **Assessment Capacity**: 1,000 active assessments
- **Survey Capacity**: 10,000 active survey respondents
- **Issue Capacity**: 10,000 issues per assessment
- **Response Storage**: 1M survey responses

### 3.3 Availability
- **Uptime SLA**: 99.9% (43 min/month downtime)
- **RTO**: 2 hours
- **RPO**: 15 minutes
- **Graceful Degradation**: Cache failures don't block assessment viewing
- **Circuit Breakers**: For external framework APIs (SASB, GRI)

### 3.4 Security
- **Encryption at Rest**: AES-256 for stakeholder PII
- **Encryption in Transit**: TLS 1.3
- **Survey Anonymization**: Anonymize responses by default
- **Data Privacy**: GDPR compliance for stakeholder data
- **Access Control**: RBAC for assessment viewing/editing
- **Audit Trail**: All materiality decisions logged

### 3.5 Compliance
- **CSRD Compliance**: Full ESRS 2 materiality requirements
- **GRI Standards**: GRI 3 (Material Topics) compliance
- **SASB Standards**: Sector-specific materiality mapping
- **Data Protection**: GDPR, CCPA for stakeholder data
- **Audit Readiness**: Complete evidence trail for assurance

## 4. Events

### 4.1 Events Published

#### Assessment Lifecycle Events
```typescript
// materiality.assessment.initiated.v1
{
  eventId: string,
  eventType: "materiality.assessment.initiated.v1",
  timestamp: string (ISO 8601),
  assessmentId: string,
  organizationId: string,
  assessmentYear: number,
  framework: string,
  createdBy: string,
  correlationId: string
}

// materiality.assessment.published.v1
{
  eventId: string,
  eventType: "materiality.assessment.published.v1",
  timestamp: string,
  assessmentId: string,
  organizationId: string,
  materialIssuesCount: number,
  publishedBy: string,
  reportUrl: string,
  correlationId: string
}

// materiality.assessment.approved.v1
{
  eventId: string,
  eventType: "materiality.assessment.approved.v1",
  timestamp: string,
  assessmentId: string,
  approvedBy: string,
  approvalDate: string,
  materialIssues: string[], // Issue IDs
  correlationId: string
}
```

#### Issue Management Events
```typescript
// materiality.issue.prioritized.v1
{
  eventId: string,
  eventType: "materiality.issue.prioritized.v1",
  timestamp: string,
  assessmentId: string,
  issueId: string,
  issueName: string,
  category: string,
  financialScore: number,
  impactScore: number,
  isMaterial: boolean,
  iroClassification: {impact: boolean, risk: boolean, opportunity: boolean},
  correlationId: string
}

// materiality.issue.reclassified.v1
{
  eventId: string,
  eventType: "materiality.issue.reclassified.v1",
  timestamp: string,
  assessmentId: string,
  issueId: string,
  issueName: string,
  previousStatus: string,
  newStatus: string,
  reason: string,
  reclassifiedBy: string,
  correlationId: string
}

// materiality.issue.updated.v1
{
  eventId: string,
  eventType: "materiality.issue.updated.v1",
  timestamp: string,
  assessmentId: string,
  issueId: string,
  issueName: string,
  updatedFields: string[],
  previousValues: object,
  newValues: object,
  updatedBy: string,
  correlationId: string
}
```

#### Stakeholder Engagement Events
```typescript
// materiality.stakeholder.invited.v1
{
  eventId: string,
  eventType: "materiality.stakeholder.invited.v1",
  timestamp: string,
  assessmentId: string,
  stakeholderGroupId: string,
  stakeholderGroupType: string,
  invitationCount: number,
  surveyId: string,
  dueDate: string,
  correlationId: string
}

// materiality.survey.completed.v1
{
  eventId: string,
  eventType: "materiality.survey.completed.v1",
  timestamp: string,
  assessmentId: string,
  surveyId: string,
  responseId: string,
  stakeholderGroupType: string,
  completionTime: number, // Seconds
  correlationId: string
}

// materiality.interview.conducted.v1
{
  eventId: string,
  eventType: "materiality.interview.conducted.v1",
  timestamp: string,
  assessmentId: string,
  interviewId: string,
  stakeholderGroupId: string,
  interviewType: string,
  keyThemes: string[],
  conductedBy: string,
  correlationId: string
}
```

#### Monitoring Events
```typescript
// materiality.trigger.activated.v1
{
  eventId: string,
  eventType: "materiality.trigger.activated.v1",
  timestamp: string,
  assessmentId: string,
  triggerId: string,
  triggerType: string,
  eventDescription: string,
  severity: string,
  affectedIssues: string[],
  recommendedAction: string,
  correlationId: string
}

// materiality.reassessment.triggered.v1
{
  eventId: string,
  eventType: "materiality.reassessment.triggered.v1",
  timestamp: string,
  assessmentId: string,
  triggerId: string,
  triggerReason: string,
  severity: string,
  newAssessmentId: string,
  correlationId: string
}
```

### 4.2 Events Consumed

```typescript
// organization.entity.created.v1
// Trigger: Create default materiality assessment for new entities

// strategy.target.set.v1
// Trigger: Link material issues to strategic targets

// reporting.framework.selected.v1
// Trigger: Map material issues to reporting framework disclosures

// governance.policy.updated.v1
// Trigger: Check if policy changes affect materiality

// risk.incident.reported.v1
// Trigger: Activate monitoring trigger for high-severity incidents

// stakeholder.feedback.received.v1
// Trigger: Capture stakeholder input for materiality consideration

// regulatory.update.published.v1
// Trigger: Evaluate if new regulation changes materiality landscape
```

## 5. Service Dependencies

### 5.1 Upstream Dependencies (Services We Call)

#### Identity Service (3001)
- **Purpose**: User authentication, role-based access
- **Endpoints Used**:
  - `GET /v1/users/:userId` - Get user details for assessment ownership
  - `GET /v1/users/:userId/effective-permissions` - Check permissions for assessment editing
- **Circuit Breaker**: Yes (60s timeout)
- **Fallback**: Use cached user data

#### Organization Service (3002)
- **Purpose**: Organization hierarchy, entity management
- **Endpoints Used**:
  - `GET /v1/organizations/:orgId` - Get organization details
  - `GET /v1/organizations/:orgId/entities` - Get entities for scoping
  - `GET /v1/organizations/:orgId/sector` - Get SASB sector for industry-specific materiality
- **Circuit Breaker**: Yes (30s timeout)
- **Fallback**: Use cached organization data

#### Reference Service (3003)
- **Purpose**: ESG frameworks, standards, taxonomies
- **Endpoints Used**:
  - `GET /v1/frameworks/GRI/topics` - Get GRI topic list
  - `GET /v1/frameworks/SASB/industries/:industry/topics` - Get SASB materiality map
  - `GET /v1/frameworks/ESRS/topics` - Get ESRS disclosure topics
- **Circuit Breaker**: Yes (30s timeout)
- **Fallback**: Use local framework cache

#### Reporting Service (3006)
- **Purpose**: Link material issues to reporting disclosures
- **Endpoints Used**:
  - `POST /v1/disclosures/materiality-link` - Link material issues to disclosure requirements
  - `GET /v1/disclosures/gaps` - Identify disclosure gaps based on materiality
- **Circuit Breaker**: Yes (60s timeout)
- **Fallback**: Log link creation for later sync

#### Notification Service (3008)
- **Purpose**: Send survey invitations, alerts, reminders
- **Endpoints Used**:
  - `POST /v1/notifications/email` - Send survey invitations
  - `POST /v1/notifications/reminder` - Send survey reminders
  - `POST /v1/notifications/alert` - Send monitoring alerts
- **Circuit Breaker**: Yes (30s timeout)
- **Fallback**: Queue notifications for retry

### 5.2 Downstream Consumers (Services That Call Us)

#### Strategy Service (3042)
- **Consumes**: Material issue data for strategic planning
- **Events Subscribed**: `materiality.assessment.published.v1`, `materiality.issue.prioritized.v1`

#### Reporting Service (3006)
- **Consumes**: Materiality matrix for determining disclosure scope
- **Events Subscribed**: `materiality.assessment.approved.v1`

#### Risk Service (3033)
- **Consumes**: Material risks for enterprise risk register
- **Events Subscribed**: `materiality.issue.prioritized.v1` (where IRO includes risk)

#### Target Service (within Strategy 3042)
- **Consumes**: Material issues for target setting
- **Events Subscribed**: `materiality.assessment.published.v1`

### 5.3 External Integrations

#### SASB Standards API
- **Purpose**: Fetch industry-specific material topics
- **API**: https://api.sasb.org/v1/materiality-map
- **Caching**: Cache for 90 days (infrequent updates)

#### GRI Standards Database
- **Purpose**: GRI topic definitions and requirements
- **API**: https://api.globalreporting.org/v1/standards
- **Caching**: Cache for 180 days

#### Survey Platform (Optional: Qualtrics/SurveyMonkey Integration)
- **Purpose**: Enterprise survey distribution (alternative to built-in surveys)
- **API**: Qualtrics API v3
- **Fallback**: Use built-in survey system

#### NLP Service (ML Service 3046)
- **Purpose**: Analyze open-text stakeholder feedback
- **Endpoints Used**: `POST /v1/ml/sentiment-analysis`, `POST /v1/ml/theme-extraction`
- **Fallback**: Manual thematic analysis

## 6. Implementation Phases

### 6.1 MVP (Phase 2.1 - Month 9)
**Story Points**: 21 (CLNZ-2501, CLNZ-2502, CLNZ-2503)

**Features**:
- ✅ Create materiality assessments
- ✅ Double materiality framework (financial + impact scoring)
- ✅ Issue library (GRI, SASB, ESRS mapping)
- ✅ Basic stakeholder mapping
- ✅ Survey creation and distribution
- ✅ Issue prioritization matrix
- ✅ Simple materiality matrix visualization
- ✅ Threshold setting

**Deliverables**:
- Assessment CRUD APIs
- Issue scoring APIs
- Stakeholder management APIs
- Survey APIs (create, send, collect responses)
- Matrix generation API
- MongoDB collections and indexes
- Basic frontend for materiality matrix

### 6.2 Phase 2 Enhancements (Phase 2.2 - Month 10)
**Story Points**: 16 (CLNZ-2504, CLNZ-2505)

**Features**:
- ✅ Interview management
- ✅ Stakeholder engagement analytics
- ✅ Materiality reporting (PDF/HTML export)
- ✅ Stakeholder report generation
- ✅ CSRD compliance reporting (ESRS 2)
- ✅ Continuous monitoring triggers
- ✅ Monitoring event management
- ✅ Trend analysis (year-over-year)

**Deliverables**:
- Interview APIs
- Reporting APIs
- Monitoring APIs
- Trend analytics APIs
- PDF report generator
- Dashboard for monitoring events

### 6.3 Phase 3 Advanced Features (Phase 2.3 - Month 11)
**Story Points**: 13 (CLNZ-2506)

**Features**:
- ✅ SASB sector-specific materiality maps
- ✅ Peer comparison and benchmarking
- ✅ Multi-language survey support
- ✅ Advanced analytics (sentiment analysis, theme extraction)
- ✅ AI-assisted narrative generation
- ✅ Integration with external survey platforms (Qualtrics)
- ✅ Evidence library management

**Deliverables**:
- SASB integration APIs
- Benchmarking APIs
- Multi-language support
- NLP integration
- Evidence management APIs

### 6.4 Future Roadmap (Phase 3+)
**Story Points**: 5

**Features**:
- 🔮 Automated materiality assessment using AI (analyze news, reports, social media)
- 🔮 Real-time stakeholder feedback portal
- 🔮 Integration with ESG data providers (MSCI, Sustainalytics)
- 🔮 Blockchain-based stakeholder verification
- 🔮 Predictive materiality modeling (predict future material issues)
- 🔮 Virtual stakeholder engagement (VR/AR workshops)

## 7. Testing Strategy

### 7.1 Unit Tests (Target: 90% Coverage)

**Core Business Logic**:
- Double materiality calculation algorithms
  - Test financial score aggregation
  - Test impact score aggregation
  - Test threshold logic
  - Test materiality classification
- Stakeholder response aggregation
  - Test average calculation
  - Test distribution analysis
  - Test weighting by stakeholder group
- Issue prioritization logic
  - Test sorting algorithms
  - Test quadrant assignment
  - Test tie-breaking rules

**Data Validation**:
- Input validation for all API endpoints
- Score range validation (1-5)
- Date validation (assessment year, survey dates)
- Email format validation for stakeholder contacts

### 7.2 Integration Tests (Target: 80% Coverage)

**API Endpoint Tests**:
- Assessment lifecycle (create → add issues → engage stakeholders → publish)
- Survey workflow (create → invite → collect responses → analyze)
- Interview workflow (schedule → conduct → document insights)
- Monitoring workflow (create trigger → detect event → escalate)

**Database Integration**:
- MongoDB read/write operations
- Complex aggregation queries for analytics
- Indexing performance tests
- Transaction rollback on errors

**Service Integration**:
- Identity Service: User authentication and permissions
- Organization Service: Entity hierarchy retrieval
- Reference Service: Framework topic mapping
- Notification Service: Survey invitation delivery

### 7.3 Contract Tests (Pact)

**Consumer Contracts** (Materiality Service as Consumer):
```typescript
// Contract with Reference Service
describe('Reference Service Contract', () => {
  it('provides GRI topics', async () => {
    await provider.addInteraction({
      state: 'GRI topics exist',
      uponReceiving: 'a request for GRI topics',
      withRequest: {
        method: 'GET',
        path: '/v1/frameworks/GRI/topics'
      },
      willRespondWith: {
        status: 200,
        body: {
          topics: eachLike({
            topicCode: string,
            topicName: string,
            description: string
          })
        }
      }
    });
  });
});
```

**Provider Contracts** (Materiality Service as Provider):
```typescript
// Contract for Reporting Service consuming materiality data
describe('Materiality Service Contract', () => {
  it('provides materiality matrix', async () => {
    await provider.addInteraction({
      state: 'assessment exists and is published',
      uponReceiving: 'a request for materiality matrix',
      withRequest: {
        method: 'GET',
        path: '/v1/materiality/assessments/:assessmentId/matrix',
        headers: { Authorization: 'Bearer token' }
      },
      willRespondWith: {
        status: 200,
        body: {
          matrix: {
            issues: eachLike({
              issueId: string,
              issueName: string,
              financialScore: number,
              impactScore: number,
              isMaterial: boolean
            }),
            thresholds: object
          }
        }
      }
    });
  });
});
```

### 7.4 E2E Test Flows

**Flow 1: Complete Materiality Assessment**
1. Create new assessment for organization
2. Import issues from GRI/SASB/ESRS templates
3. Score issues (financial + impact)
4. Create stakeholder groups
5. Create and send survey
6. Submit survey responses (simulate stakeholders)
7. Calculate aggregated scores
8. Set thresholds
9. Generate materiality matrix
10. Approve assessment
11. Publish assessment
12. Generate PDF report
13. Verify event publishing

**Flow 2: Stakeholder Engagement Workflow**
1. Create assessment
2. Add stakeholder groups
3. Create survey with custom questions
4. Send survey invitations
5. Receive survey responses
6. Schedule stakeholder interviews
7. Document interview insights
8. Aggregate stakeholder feedback
9. Generate stakeholder report
10. Verify engagement statistics

**Flow 3: Continuous Monitoring**
1. Create published assessment
2. Set up monitoring triggers
3. Simulate trigger event (e.g., regulatory change)
4. Verify alert sent
5. Review monitoring event
6. Trigger reassessment
7. Create new assessment version
8. Link to previous assessment
9. Verify trend analysis

### 7.5 Performance Tests

**Load Testing** (Apache JMeter / K6):
- 500 concurrent survey respondents submitting responses
- 100 concurrent users generating materiality matrices
- 1000 assessments in database, query performance < 500ms
- Bulk issue import: 100 issues in < 10s

**Stress Testing**:
- 10,000 survey responses in 1 hour
- 1000 monitoring events triggered simultaneously
- Database connection pool exhaustion scenarios
- Redis cache failure scenarios

### 7.6 Security Tests

**Authentication & Authorization**:
- Unauthenticated access to protected endpoints (expect 401)
- Insufficient permissions (expect 403)
- JWT token expiration handling
- Survey token validation and expiration

**Data Privacy**:
- Verify stakeholder PII encryption at rest
- Verify anonymous survey responses cannot be de-anonymized
- Test GDPR data export for stakeholder
- Test GDPR data deletion (right to be forgotten)

**Input Validation**:
- SQL injection attempts (should fail)
- XSS attempts in survey questions (should be sanitized)
- Malicious file uploads for evidence (should be rejected)
- Excessively large survey responses (should be truncated)

## 8. Migration Strategy

### 8.1 Data Migration

**No Legacy Migration** (New Service):
- Materiality Service is a NEW capability for Clenergize V3
- No data migration from V2 required
- Fresh start with CSRD-compliant double materiality framework

**Initial Data Seeding**:
```yaml
Seed Data:
  - Issue Templates:
      - GRI Universal Standards (200+ topics)
      - SASB 77 Industries (700+ topics)
      - ESRS Topical Standards (100+ topics)
  - Sector Classifications:
      - SASB SICS taxonomy (77 industries)
      - Industry-specific materiality maps
  - Survey Templates:
      - Standard materiality survey (15 questions)
      - Stakeholder-specific surveys (employees, investors, etc.)
  - Interview Guides:
      - Executive interview template
      - Stakeholder group templates
```

**Seeding Script** (`npm run seed:materiality`):
```typescript
async function seedMaterialityData() {
  // 1. Load issue templates from JSON files
  await loadIssueTemplates('./seeds/gri-topics.json');
  await loadIssueTemplates('./seeds/sasb-topics.json');
  await loadIssueTemplates('./seeds/esrs-topics.json');

  // 2. Create cross-framework mappings
  await createFrameworkMappings();

  // 3. Load survey templates
  await loadSurveyTemplates('./seeds/survey-templates.json');

  // 4. Load interview guides
  await loadInterviewGuides('./seeds/interview-guides.json');

  console.log('Materiality service seed data loaded successfully');
}
```

### 8.2 Integration with Existing Services

**Organization Service Integration**:
- On organization creation → trigger default materiality assessment creation
- On sector change → update SASB materiality map recommendations
- On entity addition → prompt to update assessment scope

**Reporting Service Integration**:
- After materiality assessment published → sync material issues to reporting requirements
- Map material ESRS topics → mandatory disclosure obligations
- Link material GRI topics → sustainability report content

**Strategy Service Integration**:
- Material issues → suggest strategic targets
- High-priority issues → flag for ESG strategy inclusion
- Issue trends → inform long-term strategy

### 8.3 Rollback Procedures

**Service Rollback**:
```bash
# Step 1: Stop new materiality service
kubectl scale deployment materiality-service --replicas=0

# Step 2: Restore previous version (if buggy deployment)
kubectl rollout undo deployment/materiality-service

# Step 3: Verify health
kubectl rollout status deployment/materiality-service

# Step 4: Data integrity check
npm run verify:materiality-data
```

**Data Rollback** (MongoDB Point-in-Time Recovery):
```bash
# Restore to timestamp before issue
mongorestore --uri="$MONGODB_URI" \
  --oplogReplay \
  --oplogLimit=1234567890:1 \
  --db=clenergize_materiality
```

## 9. Monitoring & Observability

### 9.1 Key Metrics

**Business Metrics**:
```yaml
materiality_assessments_total:
  type: counter
  description: Total materiality assessments created
  labels: [organizationId, framework, status]

materiality_issues_total:
  type: counter
  description: Total materiality issues assessed
  labels: [assessmentId, category, isMaterial]

stakeholder_engagement_rate:
  type: gauge
  description: Stakeholder survey response rate
  labels: [assessmentId, stakeholderGroupType]

survey_response_time_avg:
  type: gauge
  description: Average survey completion time (seconds)
  labels: [surveyId]

monitoring_events_triggered:
  type: counter
  description: Monitoring trigger events activated
  labels: [assessmentId, triggerType, severity]
```

**Performance Metrics**:
```yaml
materiality_matrix_generation_duration:
  type: histogram
  description: Time to generate materiality matrix (ms)
  labels: [assessmentId, issueCount]

survey_response_submission_duration:
  type: histogram
  description: Survey response submission latency (ms)

report_generation_duration:
  type: histogram
  description: Report generation time (ms)
  labels: [reportType, format]

database_query_duration:
  type: histogram
  description: Database query execution time (ms)
  labels: [collection, operation]
```

**Error Metrics**:
```yaml
materiality_api_errors_total:
  type: counter
  description: API errors by endpoint and status code
  labels: [endpoint, method, statusCode]

survey_send_failures:
  type: counter
  description: Failed survey invitation deliveries
  labels: [surveyId, failureReason]

monitoring_trigger_failures:
  type: counter
  description: Failed monitoring trigger executions
  labels: [triggerId, errorType]
```

### 9.2 Alerts

**Critical Alerts** (PagerDuty):
```yaml
MaterialityServiceDown:
  condition: up{job="materiality-service"} == 0
  duration: 5m
  severity: critical
  action: Page on-call engineer

HighErrorRate:
  condition: rate(materiality_api_errors_total[5m]) > 0.05
  duration: 10m
  severity: critical
  action: Page on-call engineer

DatabaseConnectionLoss:
  condition: mongodb_connections_available < 5
  duration: 2m
  severity: critical
  action: Page on-call and DBA
```

**Warning Alerts** (Slack):
```yaml
LowSurveyResponseRate:
  condition: stakeholder_engagement_rate < 0.3
  duration: 24h
  severity: warning
  action: Notify ESG team

SlowMatrixGeneration:
  condition: materiality_matrix_generation_duration{quantile="0.95"} > 5000
  duration: 15m
  severity: warning
  action: Notify performance team

HighMonitoringEventVolume:
  condition: rate(monitoring_events_triggered[1h]) > 50
  duration: 1h
  severity: warning
  action: Notify materiality team lead
```

### 9.3 Dashboards

**Executive Dashboard** (Grafana):
```yaml
Panels:
  - Total Materiality Assessments (by status)
  - Material Issues Distribution (E/S/G breakdown)
  - Stakeholder Engagement Trends (response rates over time)
  - Top Material Issues (ranked by frequency across assessments)
  - Assessment Completion Timeline
  - Framework Adoption (GRI vs SASB vs ESRS)
```

**Operations Dashboard** (Grafana):
```yaml
Panels:
  - API Request Rate (req/s)
  - API Latency (p50, p95, p99)
  - Error Rate (by endpoint)
  - Database Query Performance
  - Cache Hit Rate
  - Active Survey Respondents
  - Report Generation Queue Depth
```

**Stakeholder Engagement Dashboard**:
```yaml
Panels:
  - Survey Response Rate by Stakeholder Group
  - Average Survey Completion Time
  - Interview Completion Rate
  - Stakeholder Feedback Sentiment
  - Open Monitoring Events
  - Reassessment Triggers Activated
```

### 9.4 SLOs (Service Level Objectives)

```yaml
Availability SLO:
  target: 99.9%
  measurement_window: 30 days
  error_budget: 43 minutes/month

Latency SLO:
  target: 95% of requests < 500ms
  measurement_window: 7 days
  endpoints: [GET /assessments, POST /surveys/responses]

Error Rate SLO:
  target: < 1% of requests result in 5xx errors
  measurement_window: 7 days

Data Durability SLO:
  target: 99.999% (no data loss)
  measurement_window: 365 days
```

## 10. Compliance & Regulatory

### 10.1 CSRD Compliance (EU Corporate Sustainability Reporting Directive)

**ESRS 2 - General Disclosures**:
- ✅ **IRO-1**: Description of processes to identify material IROs
  - Materiality assessment methodology documentation
  - Stakeholder engagement process description
  - Information sources and evidence
- ✅ **IRO-2**: Disclosure requirements in ESRS covered by sustainability statement
  - Mapping of material issues to ESRS disclosure requirements
  - Justification for material vs non-material determination
  - List of material ESRS topics
- ✅ **SBM-3**: Material impacts, risks, and opportunities
  - Double materiality matrix visualization
  - Material issue descriptions (financial + impact)
  - Time horizon analysis (short/medium/long-term)

**Double Materiality Requirements**:
- ✅ Financial Materiality: Impact of ESG issues on enterprise value
- ✅ Impact Materiality: Company's impact on people and environment
- ✅ Threshold Setting: Clear criteria for materiality determination
- ✅ Stakeholder Engagement: Representative stakeholder perspectives
- ✅ Dynamic Assessment: Continuous monitoring and reassessment

### 10.2 GRI Standards Compliance

**GRI 3 - Material Topics 2021**:
- ✅ **Disclosure 3-1**: Process to determine material topics
  - Assessment methodology
  - Stakeholder identification and engagement
  - Prioritization approach
- ✅ **Disclosure 3-2**: List of material topics
  - Material topic names and descriptions
  - GRI topic code mapping
  - Reason for materiality
- ✅ **Disclosure 3-3**: Management of material topics (per topic)
  - Material issue context and boundaries
  - Management approach
  - Actions and commitments

### 10.3 SASB Standards Compliance

**Materiality Map**:
- ✅ Industry-Specific Materiality: Pre-populated SASB materiality factors by industry
- ✅ SICS Classification: Automatic industry classification using SICS taxonomy
- ✅ Disclosure Topics: Mapping of material issues to SASB disclosure topics
- ✅ Activity Metrics: Link material issues to industry activity metrics
- ✅ Accounting Metrics: Link material issues to accounting metrics

### 10.4 Data Privacy Compliance

**GDPR (General Data Protection Regulation)**:
- ✅ Consent Management: Stakeholder consent for data processing
- ✅ Right to Access: Export stakeholder data on request
- ✅ Right to Erasure: Delete stakeholder data on request
- ✅ Data Minimization: Collect only necessary stakeholder information
- ✅ Anonymization: Survey responses anonymized by default
- ✅ Data Retention: Auto-delete survey responses after 3 years (configurable)

**CCPA (California Consumer Privacy Act)**:
- ✅ Data Disclosure: Inform stakeholders of data collection purposes
- ✅ Opt-Out Rights: Allow stakeholders to opt out of data sharing
- ✅ Data Deletion: Delete stakeholder data on request

### 10.5 Audit Readiness

**Evidence Trail**:
- ✅ All materiality decisions logged with rationale
- ✅ Stakeholder engagement documented (surveys, interviews, workshops)
- ✅ Issue scoring evidence linked to external documents
- ✅ Version history for assessment changes
- ✅ Approval workflow audit trail

**Assurance Support**:
- ✅ Export materiality assessment documentation
- ✅ Evidence library for auditor review
- ✅ Stakeholder participation statistics
- ✅ Methodology description for auditors
- ✅ Correlation to sustainability report disclosures

## 11. Cost & Resource Estimates

### 11.1 Development Costs

**Team Allocation**:
```yaml
Phase 2.1 (Month 9) - MVP:
  Backend Developer: 1 FTE x 4 weeks = $20,000
  Frontend Developer: 0.5 FTE x 4 weeks = $10,000
  QA Engineer: 0.5 FTE x 4 weeks = $8,000
  Total: $38,000

Phase 2.2 (Month 10) - Enhancements:
  Backend Developer: 1 FTE x 4 weeks = $20,000
  Frontend Developer: 0.5 FTE x 4 weeks = $10,000
  QA Engineer: 0.5 FTE x 4 weeks = $8,000
  Total: $38,000

Phase 2.3 (Month 11) - Advanced Features:
  Backend Developer: 1 FTE x 4 weeks = $20,000
  ML Engineer: 0.5 FTE x 4 weeks = $12,000
  QA Engineer: 0.5 FTE x 4 weeks = $8,000
  Total: $40,000

Grand Total: $116,000
```

### 11.2 Infrastructure Costs (Annual)

**AWS Resources**:
```yaml
Compute (ECS Fargate):
  - Task Definition: 1 vCPU, 2 GB RAM
  - Running Tasks: 3 (HA)
  - Cost: 3 tasks x $0.04 x 730 hrs = $87.60/month

Database (MongoDB Atlas):
  - Tier: M10 (2 GB RAM)
  - Replica Set: 3 nodes
  - Cost: $0.08/hr x 3 x 730 = $175.20/month

Cache (ElastiCache Redis):
  - Node Type: cache.t3.medium
  - Nodes: 3 (cluster)
  - Cost: $0.068/hr x 3 x 730 = $149.04/month

Storage (S3):
  - Evidence Files: 100 GB
  - Report PDFs: 50 GB
  - Cost: 150 GB x $0.023 = $3.45/month

Data Transfer:
  - Outbound: 500 GB/month (reports, exports)
  - Cost: 500 GB x $0.09 = $45/month

EventBridge:
  - Custom Events: 1M/month
  - Cost: 1M x $1.00/million = $1.00/month

Total Monthly: $461.29
Total Annual: $5,535.48
```

### 11.3 Third-Party Costs

**Optional Integrations**:
```yaml
SASB Standards API:
  - Licensing: $5,000/year (enterprise tier)
  - API calls: Included in license

GRI Standards Database:
  - Licensing: Free (non-profit)
  - API calls: Unlimited

Qualtrics Survey Integration (Optional):
  - Licensing: $15,000/year (enterprise)
  - Alternative: Use built-in survey system (no cost)

NLP API (Google Cloud Natural Language):
  - Sentiment Analysis: 5,000 requests/month
  - Cost: 5,000 x $1.00/1000 = $5/month
  - Total Annual: $60/year

Total Third-Party (with Qualtrics): $20,060/year
Total Third-Party (without Qualtrics): $5,060/year
```

## 12. Related Documentation

### 12.1 Architecture Documentation
- [ESG Platform Overview](../../Docs/ESG_PLATFORM_OVERVIEW.md)
- [Phase 2 Architecture Diagram](../../Docs/FUTURE-ROADMAP/Phase2-Strategic-ESG/Phase2_Architecture.md) *(To be created)*
- [Service Dependency Diagram](../../Docs/SERVICE_DEPENDENCY_DIAGRAM.md)
- [Event Schema Registry](../../Docs/ESG_EVENT_SCHEMA_REGISTRY.md)

### 12.2 API Documentation
- [API Design Specification](../../Docs/API_DESIGN_SPECIFICATION.md) *(To be created)*
- [Materiality Service OpenAPI Spec](./api/materiality-openapi.yaml) *(To be created)*
- [Event Schema Definitions](../../Docs/ESG_EVENT_SCHEMA_REGISTRY.md)

### 12.3 Data Models
- [Phase 2 Data Models](../../Docs/FUTURE-ROADMAP/Phase2-Strategic-ESG/Phase2_Data_Models.md) *(To be created)*
- [MongoDB Schema Reference](../../Docs/DATABASE_SCHEMA_REFERENCE.md) *(To be created)*

### 12.4 Testing Documentation
- [Testing Strategy Guide](../../Docs/PHASE5_SDLC_Quality_Strategy.md)
- [Contract Testing with Pact](../../Docs/PHASE5_SDLC_Quality_Strategy.md#contract-testing-with-pact)
- [E2E Test Scenarios](./tests/e2e-scenarios.md) *(To be created)*

### 12.5 Compliance & Standards
- [CSRD/ESRS Compliance Guide](../../Docs/COMPLIANCE_CSRD_ESRS.md) *(To be created)*
- [GRI Standards Mapping](../../Docs/COMPLIANCE_GRI.md) *(To be created)*
- [SASB Implementation Guide](../../Docs/COMPLIANCE_SASB.md) *(To be created)*
- [Double Materiality Framework](../../Docs/DOUBLE_MATERIALITY_FRAMEWORK.md) *(To be created)*

### 12.6 Implementation Guides
- [Materiality Agent Handbook](../../.claude/agents/materiality-agent.md) *(To be created)*
- [Stakeholder Engagement Best Practices](../../Docs/STAKEHOLDER_ENGAGEMENT_GUIDE.md) *(To be created)*
- [Survey Design Guidelines](../../Docs/SURVEY_DESIGN_GUIDE.md) *(To be created)*

### 12.7 JIRA References
- **EPIC-025**: Materiality Assessment (55 points)
  - [CLNZ-2501](https://yourcompany.atlassian.net/browse/CLNZ-2501): Build double materiality framework (13 pts)
  - [CLNZ-2502](https://yourcompany.atlassian.net/browse/CLNZ-2502): Implement stakeholder engagement (13 pts)
  - [CLNZ-2503](https://yourcompany.atlassian.net/browse/CLNZ-2503): Create issue prioritization matrix (8 pts)
  - [CLNZ-2504](https://yourcompany.atlassian.net/browse/CLNZ-2504): Build materiality reporting (8 pts)
  - [CLNZ-2505](https://yourcompany.atlassian.net/browse/CLNZ-2505): Implement continuous materiality (8 pts)
  - [CLNZ-2506](https://yourcompany.atlassian.net/browse/CLNZ-2506): Add sector-specific analysis (5 pts)

---

**Document Version**: 1.0.0
**Last Updated**: November 20, 2024
**Author**: Materiality Agent
**Reviewers**: Architecture Agent, Master Coordinator
**Status**: Draft - Pending Review
