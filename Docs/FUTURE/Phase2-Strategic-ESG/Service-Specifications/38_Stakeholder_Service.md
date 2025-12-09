# Service Specification: Stakeholder Service

## Service Overview

**Service Name**: Stakeholder Service
**Port**: 3038
**Purpose**: Manages stakeholder identification, engagement, communication, feedback tracking, and relationship management for ESG materiality assessments and reporting
**Domain**: Strategic ESG Management
**Team Ownership**: Strategic ESG Team
**Phase**: 2 (Months 9-12)
**Story Points**: 45
**Agent**: Stakeholder Agent

## 1. Functional Requirements

### 1.1 Core Features

#### Stakeholder Registry & Mapping
- **Stakeholder Identification**: Comprehensive stakeholder database
  - Stakeholder profile creation (individuals and organizations)
  - Contact information management (email, phone, address)
  - Organizational affiliation tracking
  - Multi-dimensional categorization (type, influence, interest, dependence)
  - Stakeholder segmentation and tagging
  - Custom attribute support
  - Duplicate detection and merging
  - Data quality validation
- **Stakeholder Categorization**: Multi-level grouping
  - Primary categories (investors, employees, customers, suppliers, communities, regulators, NGOs, media)
  - Subcategories (institutional investors, retail investors, fund managers)
  - Custom category creation
  - Multiple category assignments
  - Category hierarchies
- **Influence-Interest Matrix**: Strategic stakeholder mapping
  - Influence level assessment (1-5 scale)
  - Interest level assessment (1-5 scale)
  - Dependence level assessment (1-5 scale)
  - Quadrant classification (high influence/high interest, etc.)
  - Visual matrix representation
  - Dynamic matrix updates
  - Historical matrix tracking
- **Relationship Mapping**: Stakeholder network visualization
  - Stakeholder-to-stakeholder relationships
  - Hierarchical relationships (parent organizations, subsidiaries)
  - Stakeholder groups and coalitions
  - Relationship strength scoring
  - Network graph visualization (Neo4j)
  - Key relationship identification
- **Hierarchical Stakeholder Groups**: Nested group management
  - Group creation and management
  - Sub-group hierarchies
  - Group member assignment
  - Group-level attributes
  - Group representatives and spokespeople
  - Group communication preferences

#### Engagement Planning & Strategy
- **Engagement Strategy Development**: Strategic engagement planning
  - Engagement strategy templates (by stakeholder type)
  - Engagement objective setting
  - Strategy document creation
  - Stakeholder engagement plan (who, what, when, how)
  - Multi-year engagement roadmap
  - Strategy review and approval workflow
  - Integration with Strategy Service (3042)
- **Multi-Channel Engagement Planning**: Comprehensive engagement methods
  - Survey campaigns (online, offline, hybrid)
  - One-on-one interviews (in-person, virtual, phone)
  - Focus groups and workshops
  - Town halls and public meetings
  - Advisory panels and working groups
  - Ongoing dialogue programs
  - Social media engagement
  - Annual general meetings (AGMs)
  - Investor roadshows
  - Community forums
- **Frequency & Timing Management**: Engagement scheduling
  - One-time engagement events
  - Annual engagement cycles
  - Quarterly check-ins
  - Ongoing dialogue schedules
  - Event calendar management
  - Reminder and notification automation
  - Time zone management
  - Conflict detection
- **Materiality Assessment Integration**: Materiality-driven engagement
  - Stakeholder input collection for double materiality
  - Issue prioritization with stakeholder weighting
  - Stakeholder perspective on financial and impact materiality
  - Integration with Materiality Service (3041)
  - Materiality survey distribution
  - Interview scheduling for materiality assessment
- **Campaign Management**: Engagement campaign orchestration
  - Campaign creation and naming
  - Target audience definition
  - Multi-channel campaign planning
  - Campaign timeline and milestones
  - Campaign budget tracking
  - Campaign performance measurement
  - Campaign templates and best practices

#### Communication Hub
- **Multi-Channel Communication**: Unified communication platform
  - Email communication (transactional, bulk, personalized)
  - In-app messaging (stakeholder portal)
  - SMS notifications (time-sensitive alerts)
  - Newsletter distribution (regular updates)
  - Press releases (media stakeholders)
  - Social media integration (Twitter, LinkedIn)
  - Webinar invitations and hosting
  - Integration with Notification Service (3008)
- **Stakeholder Portal**: Personalized stakeholder access
  - Secure login and authentication
  - Personalized dashboard (relevant content)
  - Document repository (ESG reports, policies)
  - Self-service data updates
  - Feedback submission interface
  - Survey participation
  - Event registration
  - Notification preferences management
  - Multi-language support
- **Document Sharing & Transparency**: Content management
  - ESG report publishing
  - Sustainability policy sharing
  - Board meeting minutes (investor stakeholders)
  - Community impact reports
  - Regulatory disclosure documents
  - Document versioning
  - Access control by stakeholder group
  - Download tracking and analytics
  - Document commenting and feedback
- **Announcement Management**: News and update distribution
  - Announcement creation and scheduling
  - Target audience selection
  - Multi-channel distribution
  - Urgency and priority tagging
  - Announcement templates
  - Draft and approval workflow
  - Announcement archive
  - Read receipt tracking
- **Feedback Collection**: Structured and unstructured feedback
  - Feedback submission forms
  - Comment collection
  - Suggestion box
  - Complaint management
  - Feedback categorization (topic, sentiment)
  - Feedback assignment to owners
  - Response tracking
  - Feedback analytics

#### Survey & Feedback System
- **Survey Builder**: Flexible survey creation
  - Drag-and-drop survey builder
  - Pre-built question templates (Likert, rating, ranking, multiple choice, open-text)
  - Question branching logic
  - Survey sections and pages
  - Progress indicators
  - Multi-language survey support
  - Survey preview and testing
  - Survey templates (materiality, engagement, satisfaction)
  - Question bank and reuse
- **Distribution Management**: Targeted survey distribution
  - Distribution list creation (manual, filter-based)
  - Anonymous vs. identified responses
  - Unique survey links (token-based)
  - Multi-channel distribution (email, SMS, portal, QR code)
  - Distribution scheduling
  - Invitation reminders (configurable schedule)
  - Survey quotas and limits
  - A/B testing support
- **Response Tracking & Analytics**: Real-time survey monitoring
  - Response rate tracking (by stakeholder group, channel)
  - Real-time response dashboards
  - Partial response tracking
  - Completion time analytics
  - Drop-off point identification
  - Response quality scoring
  - Duplicate response detection
  - IP-based fraud detection
- **Sentiment Analysis**: AI-powered text analysis
  - Sentiment scoring (-1 to +1 scale)
  - Emotion detection (positive, neutral, negative)
  - Topic extraction from open text
  - Keyword frequency analysis
  - Sentiment trends over time
  - Integration with ML Service (3046)
  - Sentiment heatmaps by stakeholder group
  - Comparative sentiment analysis
- **Issue Tracking & Resolution**: Feedback issue management
  - Issue extraction from feedback
  - Issue categorization and tagging
  - Issue severity assessment
  - Issue assignment to owners
  - Issue status tracking (open, in progress, resolved, closed)
  - Resolution time tracking
  - Root cause analysis
  - Issue escalation workflows
  - Issue reporting and dashboards

#### Materiality Assessment Integration
- **Stakeholder Input Collection**: Materiality survey support
  - Materiality-specific survey templates
  - Double materiality question sets (financial + impact)
  - Stakeholder weighting for analysis
  - Issue prioritization voting
  - Stakeholder perspective collection
  - Integration with Materiality Service (3041) APIs
  - Real-time data sync to materiality assessments
- **Issue Prioritization & Voting**: Collaborative prioritization
  - Issue ranking exercises
  - Dot voting (allocate points across issues)
  - Pairwise comparison (forced ranking)
  - Weighting by stakeholder influence
  - Aggregated prioritization results
  - Prioritization dashboard
  - Export to Materiality Service
- **Stakeholder Weighting**: Influence-based weighting
  - Automatic weighting based on influence scores
  - Custom weighting rules
  - Weighting preview and adjustment
  - Weighted average calculations
  - Sensitivity analysis (impact of weighting changes)
  - Documentation of weighting methodology

#### Reporting & Analytics
- **Engagement Metrics Dashboard**: Real-time engagement monitoring
  - Total stakeholders by category
  - Engagement events conducted (YTD, MTD)
  - Survey response rates (overall, by group)
  - Feedback volume trends
  - Communication reach and engagement
  - Portal active users (DAU, MAU)
  - Document download statistics
  - Top engaged stakeholders
  - Low engagement alerts
- **Stakeholder Sentiment Trends**: Sentiment tracking over time
  - Sentiment score trends (line charts)
  - Sentiment by stakeholder group (bar charts)
  - Sentiment by ESG topic (heatmaps)
  - Sentiment drivers (positive/negative themes)
  - Sentiment alerts (sudden drops)
  - Sentiment comparison (year-over-year)
  - Predictive sentiment modeling
- **Response Rate Analytics**: Survey performance analysis
  - Response rate by survey
  - Response rate by stakeholder group
  - Response rate by distribution channel
  - Time-to-respond analysis
  - Completion rate (full vs. partial)
  - Reminder effectiveness analysis
  - Benchmark against industry standards
- **Issue Heat Maps**: Visual issue prioritization
  - Issue frequency heatmaps
  - Issue severity heatmaps
  - Issue by stakeholder group matrix
  - Geographic issue heatmaps
  - Issue trend heatmaps (emerging vs. declining)
  - Interactive drill-down
  - Export to PowerPoint/PDF
- **Stakeholder Value Creation**: Impact measurement
  - Stakeholder satisfaction scores
  - Net Promoter Score (NPS) tracking
  - Stakeholder lifetime value (for customers/suppliers)
  - Stakeholder retention rates
  - Stakeholder advocacy metrics
  - Economic value created (jobs, local procurement)
  - Social value created (community investment)
  - Environmental value created (shared sustainability projects)

### 1.2 API Endpoints

#### Stakeholder Registry Endpoints
```yaml
POST /v1/stakeholders
  Description: Create new stakeholder record
  Request:
    - firstName: string (required for individuals)
    - lastName: string (required for individuals)
    - organizationName: string (required for organizations)
    - stakeholderType: string ("individual" | "organization")
    - category: string (required, "investor" | "employee" | "customer" | "supplier" | "community" | "regulator" | "ngo" | "media" | "other")
    - subcategory: string
    - contactInfo: {
        email: string (required),
        phone: string,
        address: {
          street: string,
          city: string,
          state: string,
          postalCode: string,
          country: string
        }
      }
    - mapping: {
        influence: number (1-5, required),
        interest: number (1-5, required),
        dependence: number (1-5, required),
        representation: string ("high" | "medium" | "low")
      }
    - affiliations: [{
        organizationId: string,
        role: string,
        startDate: date
      }]
    - tags: string[]
    - customAttributes: object
  Response:
    - stakeholderId: string
    - stakeholder: Stakeholder
  Events Published:
    - stakeholder.stakeholder.registered.v1

GET /v1/stakeholders
  Description: List stakeholders with filters
  Query:
    - organizationId: string (required)
    - category: string
    - subcategory: string
    - influenceMin: number (1-5)
    - influenceMax: number (1-5)
    - interestMin: number (1-5)
    - interestMax: number (1-5)
    - tags: string[]
    - search: string (name, email)
    - page: number
    - limit: number
    - sort: string (default: "influence:desc")
  Response:
    - stakeholders: Stakeholder[]
    - total: number
    - page: number
    - filters: {
        categories: {[key: string]: number},
        influenceDistribution: {[level: number]: number},
        interestDistribution: {[level: number]: number}
      }

GET /v1/stakeholders/:stakeholderId
  Response:
    - stakeholder: Stakeholder
    - engagementHistory: EngagementEvent[]
    - communicationHistory: Communication[]
    - feedbackHistory: Feedback[]
    - surveyResponses: SurveyResponse[]
    - relationshipMap: StakeholderRelationship[]

PUT /v1/stakeholders/:stakeholderId
  Request:
    - (same as POST, all fields optional)
  Response:
    - stakeholder: Stakeholder
  Events Published:
    - stakeholder.stakeholder.updated.v1

DELETE /v1/stakeholders/:stakeholderId
  Response:
    - success: boolean
  Events Published:
    - stakeholder.stakeholder.deleted.v1

POST /v1/stakeholders/:stakeholderId/mapping
  Description: Update influence-interest mapping
  Request:
    - influence: number (1-5, required)
    - interest: number (1-5, required)
    - dependence: number (1-5)
    - rationale: string
    - assessedBy: string (userId)
  Response:
    - mapping: StakeholderMapping
    - quadrant: string ("high_influence_high_interest" | "high_influence_low_interest" | "low_influence_high_interest" | "low_influence_low_interest")
  Events Published:
    - stakeholder.stakeholder.mapping-updated.v1

GET /v1/stakeholders/matrix
  Description: Get influence-interest matrix visualization data
  Query:
    - organizationId: string (required)
    - category: string (optional filter)
  Response:
    - matrix: {
        stakeholders: [{
          stakeholderId: string,
          name: string,
          category: string,
          influence: number,
          interest: number,
          dependence: number,
          quadrant: string
        }],
        quadrantCounts: {
          high_influence_high_interest: number,
          high_influence_low_interest: number,
          low_influence_high_interest: number,
          low_influence_low_interest: number
        }
      }
```

#### Stakeholder Groups Endpoints
```yaml
POST /v1/stakeholder-groups
  Description: Create stakeholder group
  Request:
    - groupName: string (required)
    - description: string
    - category: string
    - parentGroupId: string (for sub-groups)
    - memberIds: string[] (stakeholderIds)
    - groupAttributes: {
        representativeId: string,
        contactEmail: string,
        meetingFrequency: string,
        engagementMethod: string
      }
  Response:
    - groupId: string
    - group: StakeholderGroup
  Events Published:
    - stakeholder.group.created.v1

GET /v1/stakeholder-groups
  Query:
    - organizationId: string (required)
    - category: string
    - parentGroupId: string
    - search: string
  Response:
    - groups: StakeholderGroup[]
    - total: number

PUT /v1/stakeholder-groups/:groupId/members
  Description: Add/remove group members
  Request:
    - action: string ("add" | "remove")
    - memberIds: string[]
  Response:
    - group: StakeholderGroup
    - memberCount: number
```

#### Engagement Planning Endpoints
```yaml
POST /v1/engagements
  Description: Create engagement event
  Request:
    - engagementName: string (required)
    - engagementType: string (required, "survey" | "interview" | "focus_group" | "town_hall" | "workshop" | "advisory_panel" | "ongoing_dialogue" | "other")
    - targetStakeholders: {
        stakeholderIds: string[],
        groupIds: string[],
        filterCriteria: {
          categories: string[],
          influenceMin: number,
          interestMin: number
        }
      }
    - scheduledDate: date
    - endDate: date (optional, for multi-day events)
    - location: string ("in_person" | "virtual" | "hybrid")
    - meetingLink: string (for virtual)
    - venue: string (for in-person)
    - objectives: string[]
    - agenda: string
    - facilitators: string[] (userIds)
    - materials: File[]
    - registrationRequired: boolean
    - registrationDeadline: date
  Response:
    - engagementId: string
    - engagement: Engagement
    - invitationsSent: number
  Events Published:
    - stakeholder.engagement.created.v1

GET /v1/engagements
  Query:
    - organizationId: string (required)
    - engagementType: string
    - status: string ("planned" | "in_progress" | "completed" | "cancelled")
    - dateFrom: date
    - dateTo: date
    - stakeholderId: string
  Response:
    - engagements: Engagement[]
    - total: number
    - upcomingCount: number

POST /v1/engagements/:engagementId/register
  Description: Register stakeholder for event
  Request:
    - stakeholderId: string (required)
    - attendeeCount: number (default: 1)
    - specialRequirements: string
  Response:
    - registration: Registration
    - confirmationEmail: boolean
  Events Published:
    - stakeholder.engagement.registration-confirmed.v1

POST /v1/engagements/:engagementId/complete
  Description: Mark engagement as completed and capture outcomes
  Request:
    - actualDate: date
    - attendance: [{
        stakeholderId: string,
        attended: boolean,
        participationLevel: string ("active" | "passive" | "absent")
      }]
    - outcomes: {
        keyThemes: string[],
        actionItems: string[],
        feedbackSummary: string,
        nextSteps: string
      }
    - materials: File[] (presentations, recordings)
  Response:
    - engagement: Engagement (status: "completed")
    - outcomesSummary: object
  Events Published:
    - stakeholder.engagement.completed.v1

POST /v1/engagement-strategies
  Description: Create engagement strategy document
  Request:
    - strategyName: string (required)
    - strategyPeriod: {
        startYear: number,
        endYear: number
      }
    - objectives: string[]
    - targetStakeholderGroups: string[]
    - engagementApproach: string
    - keyActivities: [{
        activity: string,
        frequency: string,
        owner: string
      }]
    - successMetrics: string[]
    - budget: number
  Response:
    - strategyId: string
    - strategy: EngagementStrategy
  Events Published:
    - stakeholder.strategy.created.v1

GET /v1/engagement-strategies
  Response:
    - strategies: EngagementStrategy[]
```

#### Communication Hub Endpoints
```yaml
POST /v1/communications/send
  Description: Send communication to stakeholders
  Request:
    - subject: string (required)
    - content: string (required, HTML/Markdown)
    - communicationType: string (required, "email" | "sms" | "in_app" | "newsletter" | "announcement")
    - recipients: {
        stakeholderIds: string[],
        groupIds: string[],
        filterCriteria: object
      }
    - scheduledSendTime: date (optional, default: immediate)
    - attachments: File[]
    - priority: string ("low" | "normal" | "high" | "urgent")
    - trackOpens: boolean (default: true)
    - trackClicks: boolean (default: true)
  Response:
    - communicationId: string
    - recipientCount: number
    - status: string ("draft" | "scheduled" | "sending" | "sent")
  Events Published:
    - stakeholder.communication.sent.v1

GET /v1/communications/:communicationId/analytics
  Response:
    - communication: Communication
    - analytics: {
        sent: number,
        delivered: number,
        opened: number,
        clicked: number,
        bounced: number,
        unsubscribed: number,
        openRate: number,
        clickRate: number,
        deliveryRate: number
      }
    - recipientDetails: [{
        stakeholderId: string,
        delivered: boolean,
        opened: boolean,
        openedAt: date,
        clicked: boolean,
        clickedLinks: string[]
      }]

POST /v1/communications/newsletters
  Description: Create newsletter
  Request:
    - newsletterName: string (required)
    - subject: string (required)
    - content: string (required)
    - sections: [{
        sectionTitle: string,
        sectionContent: string,
        sectionOrder: number
      }]
    - publishDate: date
    - recipientGroups: string[]
    - templateId: string (optional)
  Response:
    - newsletterId: string
    - newsletter: Newsletter
  Events Published:
    - stakeholder.newsletter.published.v1

POST /v1/announcements
  Description: Create stakeholder announcement
  Request:
    - title: string (required)
    - content: string (required)
    - announcementType: string ("news" | "event" | "policy_update" | "achievement" | "alert")
    - targetAudience: {
        stakeholderCategories: string[],
        stakeholderIds: string[]
      }
    - priority: string ("low" | "normal" | "high" | "critical")
    - publishDate: date
    - expirationDate: date (optional)
    - attachments: File[]
  Response:
    - announcementId: string
    - announcement: Announcement
  Events Published:
    - stakeholder.announcement.published.v1

GET /v1/announcements
  Query:
    - organizationId: string (required)
    - announcementType: string
    - stakeholderId: string (filter by relevance)
    - dateFrom: date
    - dateTo: date
    - active: boolean (not expired)
  Response:
    - announcements: Announcement[]
    - total: number
```

#### Stakeholder Portal Endpoints
```yaml
POST /v1/portal/users/:stakeholderId/invite
  Description: Invite stakeholder to portal
  Request:
    - email: string (required)
    - firstName: string
    - lastName: string
    - customMessage: string
    - portalRole: string ("viewer" | "contributor" | "admin")
  Response:
    - invitationId: string
    - invitationUrl: string
    - expiresAt: date
  Events Published:
    - stakeholder.portal.invitation-sent.v1

GET /v1/portal/dashboard
  Description: Get stakeholder portal dashboard data (authenticated stakeholder)
  Response:
    - stakeholder: Stakeholder (profile)
    - recentDocuments: Document[]
    - recentAnnouncements: Announcement[]
    - pendingSurveys: Survey[]
    - upcomingEvents: Engagement[]
    - feedbackSubmitted: number
    - engagementScore: number

POST /v1/portal/documents/publish
  Description: Publish document to portal
  Request:
    - documentTitle: string (required)
    - documentDescription: string
    - documentFile: File (required)
    - documentCategory: string ("esg_report" | "policy" | "meeting_minutes" | "community_report" | "other")
    - targetAudience: {
        stakeholderCategories: string[],
        stakeholderIds: string[]
      }
    - accessControl: string ("public" | "restricted")
    - publishDate: date
  Response:
    - documentId: string
    - document: Document
    - accessibleStakeholders: number
  Events Published:
    - stakeholder.document.published.v1

GET /v1/portal/documents
  Query:
    - stakeholderId: string (for access control)
    - category: string
    - search: string
    - dateFrom: date
  Response:
    - documents: Document[]
    - total: number

POST /v1/portal/feedback/submit
  Description: Submit feedback via portal
  Request:
    - stakeholderId: string (authenticated)
    - feedbackType: string ("comment" | "suggestion" | "complaint" | "question")
    - feedbackTopic: string
    - feedbackContent: string (required)
    - attachments: File[]
    - isAnonymous: boolean (default: false)
  Response:
    - feedbackId: string
    - feedback: Feedback
    - confirmationMessage: string
  Events Published:
    - stakeholder.feedback.submitted.v1
```

#### Survey System Endpoints
```yaml
POST /v1/surveys
  Description: Create new survey
  Request:
    - surveyTitle: string (required)
    - surveyDescription: string
    - surveyType: string ("materiality" | "engagement" | "satisfaction" | "feedback" | "custom")
    - questions: [{
        questionId: string,
        questionText: string (required),
        questionType: string (required, "rating" | "likert" | "ranking" | "multiple_choice" | "single_choice" | "text" | "matrix"),
        options: string[] (for choice questions),
        scaleMin: number (for rating),
        scaleMax: number (for rating),
        minLabel: string (for rating),
        maxLabel: string (for rating),
        required: boolean,
        branchingLogic: {
          conditionAnswer: any,
          nextQuestionId: string
        }
      }]
    - language: string (default: "en")
    - allowAnonymous: boolean (default: false)
    - oneResponsePerStakeholder: boolean (default: true)
  Response:
    - surveyId: string
    - survey: Survey
  Events Published:
    - stakeholder.survey.created.v1

POST /v1/surveys/:surveyId/distribute
  Description: Distribute survey to stakeholders
  Request:
    - distributionName: string
    - targetStakeholders: {
        stakeholderIds: string[],
        groupIds: string[],
        filterCriteria: object
      }
    - distributionChannel: string[] ("email" | "sms" | "portal" | "qr_code")
    - openDate: date
    - closeDate: date
    - reminderSchedule: {
        firstReminder: number (days after distribution),
        recurringReminder: number (every N days),
        finalReminder: number (days before close)
      }
    - anonymousLinks: boolean (default: false)
    - quota: number (max responses)
  Response:
    - distributionId: string
    - distribution: SurveyDistribution
    - invitationsSent: number
    - uniqueSurveyLinks: string[] (if anonymousLinks: true)
  Events Published:
    - stakeholder.survey.distributed.v1

POST /v1/surveys/:surveyId/responses
  Description: Submit survey response
  Request:
    - stakeholderId: string (omit if anonymous)
    - surveyToken: string (unique token from invitation)
    - responses: [{
        questionId: string,
        answer: any (depends on question type)
      }]
    - completionTime: number (seconds)
    - isComplete: boolean
  Response:
    - responseId: string
    - response: SurveyResponse
  Events Published:
    - stakeholder.survey.completed.v1

GET /v1/surveys/:surveyId/results
  Description: Get survey results and analytics
  Response:
    - survey: Survey
    - statistics: {
        totalInvited: number,
        totalResponded: number,
        totalPartial: number,
        responseRate: number,
        averageCompletionTime: number,
        responsesByChannel: {[channel: string]: number}
      }
    - questionResults: [{
        questionId: string,
        questionText: string,
        questionType: string,
        aggregatedResults: {
          averageRating: number,
          distribution: {[answer: string]: number},
          topAnswers: [{answer: string, count: number, percentage: number}],
          sentimentScore: number (for text questions)
        }
      }]
    - responseTimeTrend: [{date: date, responseCount: number}]
  Events Published:
    - stakeholder.survey.results-generated.v1

POST /v1/surveys/:surveyId/analyze
  Description: Run advanced analytics on survey results
  Request:
    - analysisType: string ("sentiment" | "topic_extraction" | "correlation" | "segmentation")
    - parameters: object
  Response:
    - analysis: {
        sentimentAnalysis: {
          overallSentiment: number,
          sentimentByQuestion: [{questionId: string, sentiment: number}],
          sentimentByStakeholderGroup: [{group: string, sentiment: number}],
          topPositiveThemes: string[],
          topNegativeThemes: string[]
        },
        topicExtraction: {
          topics: [{topic: string, frequency: number, stakeholderGroups: string[]}],
          topicClusters: object
        },
        correlationAnalysis: {
          significantCorrelations: [{question1: string, question2: string, correlation: number}]
        }
      }
```

#### Feedback & Issue Management Endpoints
```yaml
POST /v1/feedback
  Description: Record stakeholder feedback
  Request:
    - stakeholderId: string (required, unless anonymous)
    - feedbackType: string (required, "comment" | "suggestion" | "complaint" | "question" | "compliment")
    - feedbackTopic: string
    - feedbackContent: string (required)
    - feedbackChannel: string ("portal" | "email" | "phone" | "in_person" | "social_media")
    - attachments: File[]
    - isAnonymous: boolean (default: false)
    - priority: string ("low" | "medium" | "high")
  Response:
    - feedbackId: string
    - feedback: Feedback
  Events Published:
    - stakeholder.feedback.submitted.v1

GET /v1/feedback
  Query:
    - organizationId: string (required)
    - feedbackType: string
    - stakeholderId: string
    - dateFrom: date
    - dateTo: date
    - status: string ("open" | "assigned" | "in_progress" | "resolved" | "closed")
    - sentiment: string ("positive" | "neutral" | "negative")
  Response:
    - feedback: Feedback[]
    - total: number
    - statistics: {
        totalFeedback: number,
        byType: {[type: string]: number},
        bySentiment: {[sentiment: string]: number},
        averageResolutionTime: number
      }

POST /v1/feedback/:feedbackId/respond
  Description: Respond to stakeholder feedback
  Request:
    - responseContent: string (required)
    - respondedBy: string (userId)
    - internalNotes: string
    - status: string ("in_progress" | "resolved" | "closed")
  Response:
    - feedback: Feedback
    - responseNotificationSent: boolean
  Events Published:
    - stakeholder.feedback.responded.v1

POST /v1/issues
  Description: Create issue from stakeholder feedback
  Request:
    - issueTitle: string (required)
    - issueDescription: string (required)
    - issueSeverity: string (required, "low" | "medium" | "high" | "critical")
    - issueCategory: string
    - affectedStakeholders: string[]
    - relatedFeedbackIds: string[]
    - assignedTo: string (userId)
    - dueDate: date
  Response:
    - issueId: string
    - issue: Issue
  Events Published:
    - stakeholder.issue.raised.v1

GET /v1/issues
  Query:
    - organizationId: string (required)
    - severity: string
    - status: string ("open" | "in_progress" | "resolved" | "closed")
    - assignedTo: string (userId)
    - category: string
  Response:
    - issues: Issue[]
    - total: number

PUT /v1/issues/:issueId
  Description: Update issue status and resolution
  Request:
    - status: string
    - resolutionNotes: string
    - actionsTaken: string[]
    - resolvedBy: string (userId)
    - resolvedAt: date
  Response:
    - issue: Issue
  Events Published:
    - stakeholder.issue.resolved.v1
```

#### Analytics & Reporting Endpoints
```yaml
GET /v1/analytics/engagement-metrics
  Description: Get engagement metrics dashboard
  Query:
    - organizationId: string (required)
    - dateFrom: date
    - dateTo: date
    - stakeholderCategory: string
  Response:
    - metrics: {
        totalStakeholders: number,
        stakeholdersByCategory: {[category: string]: number},
        engagementEvents: {
          total: number,
          byType: {[type: string]: number},
          attendanceRate: number
        },
        surveys: {
          total: number,
          averageResponseRate: number,
          averageSentiment: number
        },
        communications: {
          sent: number,
          openRate: number,
          clickRate: number
        },
        feedback: {
          total: number,
          averageSentiment: number,
          responseRate: number
        },
        portalActivity: {
          activeUsers: number,
          documentsDownloaded: number,
          averageSessionDuration: number
        }
      }

GET /v1/analytics/sentiment-trends
  Description: Get stakeholder sentiment trends
  Query:
    - organizationId: string (required)
    - dateFrom: date
    - dateTo: date
    - groupBy: string ("month" | "quarter" | "year")
    - stakeholderCategory: string
  Response:
    - trends: [{
        period: string,
        overallSentiment: number,
        sentimentByCategory: {[category: string]: number},
        positiveFeedbackCount: number,
        negativeFeedbackCount: number,
        neutralFeedbackCount: number,
        topPositiveThemes: string[],
        topNegativeThemes: string[]
      }]
    - sentimentChange: number (percentage change)
    - alerts: [{
        alert: string,
        severity: string,
        affectedStakeholderGroup: string
      }]

GET /v1/analytics/response-rates
  Description: Get survey response rate analytics
  Query:
    - organizationId: string (required)
    - dateFrom: date
    - dateTo: date
  Response:
    - overallResponseRate: number
    - responseRateBySurvey: [{
        surveyId: string,
        surveyTitle: string,
        totalInvited: number,
        totalResponded: number,
        responseRate: number
      }]
    - responseRateByStakeholderGroup: [{
        group: string,
        responseRate: number
      }]
    - responseRateByChannel: [{
        channel: string,
        responseRate: number
      }]
    - averageTimeToRespond: number (days)
    - dropOffPoints: [{
        questionId: string,
        dropOffRate: number
      }]

GET /v1/analytics/issue-heatmap
  Description: Get issue heatmap visualization data
  Query:
    - organizationId: string (required)
    - dateFrom: date
    - dateTo: date
    - groupBy: string ("category" | "stakeholder_group" | "severity")
  Response:
    - heatmap: [{
        dimension1: string,
        dimension2: string,
        issueCount: number,
        severityScore: number (weighted)
      }]
    - topIssues: [{
        issueTitle: string,
        frequency: number,
        severity: string,
        affectedStakeholders: number
      }]
    - emergingIssues: [{
        issueTitle: string,
        trendDirection: string,
        growthRate: number
      }]

GET /v1/analytics/value-creation
  Description: Get stakeholder value creation metrics
  Query:
    - organizationId: string (required)
    - year: number
  Response:
    - valueCreation: {
        economicValue: {
          jobsCreated: number,
          localProcurement: number,
          taxesPaid: number,
          dividendsPaid: number
        },
        socialValue: {
          communityInvestment: number,
          volunteerHours: number,
          skillsDevelopment: number,
          socialImpactProjects: number
        },
        environmentalValue: {
          emissionsReduced: number,
          wasteReduced: number,
          waterSaved: number,
          renewableEnergyGenerated: number
        },
        stakeholderSatisfaction: {
          nps: number,
          satisfactionScore: number,
          retentionRate: number,
          advocacyScore: number
        }
      }
```

## 2. Data Models

### 2.1 MongoDB Collections

#### stakeholders
```typescript
{
  _id: ObjectId,
  stakeholderId: string (UUID, unique, indexed),
  organizationId: string (indexed),

  // Basic information
  stakeholderType: string, // "individual" | "organization"
  firstName: string,
  lastName: string,
  organizationName: string,
  title: string,
  department: string,

  // Categorization
  category: string, // "investor" | "employee" | "customer" | "supplier" | "community" | "regulator" | "ngo" | "media" | "other"
  subcategory: string,
  tags: [string],

  // Contact information
  contactInfo: {
    email: string,
    phone: string,
    alternateEmail: string,
    alternatePhone: string,
    address: {
      street: string,
      city: string,
      state: string,
      postalCode: string,
      country: string
    },
    preferredChannel: string // "email" | "phone" | "sms" | "portal"
  },

  // Stakeholder mapping
  mapping: {
    influence: number (1-5),
    interest: number (1-5),
    dependence: number (1-5),
    representation: string, // "high" | "medium" | "low"
    quadrant: string, // "high_influence_high_interest" | etc.
    lastAssessed: Date,
    assessedBy: string (userId),
    assessmentNotes: string
  },

  // Affiliations
  affiliations: [{
    organizationId: string,
    organizationName: string,
    role: string,
    startDate: Date,
    endDate: Date,
    isPrimary: boolean
  }],

  // Portal access
  portalAccess: {
    hasAccess: boolean,
    portalUserId: string,
    invitedAt: Date,
    activatedAt: Date,
    lastLogin: Date,
    portalRole: string // "viewer" | "contributor" | "admin"
  },

  // Engagement preferences
  preferences: {
    communicationFrequency: string, // "daily" | "weekly" | "monthly" | "as_needed"
    topicsOfInterest: [string],
    languagePreference: string,
    optInNewsletter: boolean,
    optInSurveys: boolean,
    optInEvents: boolean
  },

  // Custom attributes
  customAttributes: object,

  // Status
  status: string, // "active" | "inactive" | "archived"

  // Metadata
  metadata: {
    createdAt: Date,
    createdBy: string (userId),
    updatedAt: Date,
    updatedBy: string (userId),
    source: string // "manual" | "import" | "integration"
  }
}

// Indexes
- { stakeholderId: 1 } (unique)
- { organizationId: 1, category: 1 }
- { organizationId: 1, "mapping.influence": 1, "mapping.interest": 1 }
- { "contactInfo.email": 1 }
- { status: 1 }
- { tags: 1 }
```

#### stakeholder_groups
```typescript
{
  _id: ObjectId,
  groupId: string (UUID, unique, indexed),
  organizationId: string (indexed),

  // Group information
  groupName: string,
  description: string,
  category: string,
  parentGroupId: string, // For nested groups
  groupType: string, // "static" | "dynamic"

  // Members
  members: [{
    stakeholderId: string,
    addedAt: Date,
    addedBy: string (userId),
    role: string // "member" | "representative" | "spokesperson"
  }],
  memberCount: number,

  // Dynamic group criteria (if groupType: "dynamic")
  filterCriteria: {
    categories: [string],
    influenceMin: number,
    influenceMax: number,
    interestMin: number,
    interestMax: number,
    tags: [string]
  },

  // Group attributes
  groupAttributes: {
    representativeId: string,
    contactEmail: string,
    meetingFrequency: string,
    engagementMethod: string,
    lastEngagement: Date
  },

  // Metadata
  metadata: {
    createdAt: Date,
    createdBy: string (userId),
    updatedAt: Date,
    updatedBy: string (userId)
  }
}

// Indexes
- { groupId: 1 } (unique)
- { organizationId: 1 }
- { parentGroupId: 1 }
- { "members.stakeholderId": 1 }
```

#### engagements
```typescript
{
  _id: ObjectId,
  engagementId: string (UUID, unique, indexed),
  organizationId: string (indexed),

  // Engagement details
  engagementName: string,
  engagementType: string, // "survey" | "interview" | "focus_group" | "town_hall" | "workshop" | "advisory_panel" | "ongoing_dialogue" | "other"
  description: string,

  // Scheduling
  scheduledDate: Date (indexed),
  endDate: Date,
  location: string, // "in_person" | "virtual" | "hybrid"
  meetingLink: string,
  venue: string,
  timeZone: string,

  // Target stakeholders
  targetStakeholders: {
    stakeholderIds: [string],
    groupIds: [string],
    filterCriteria: object,
    totalTargeted: number
  },

  // Engagement content
  objectives: [string],
  agenda: string,
  facilitators: [string], // userIds
  materials: [{
    fileId: string,
    fileName: string,
    fileUrl: string,
    uploadedAt: Date
  }],

  // Registration
  registrationRequired: boolean,
  registrationDeadline: Date,
  registrations: [{
    stakeholderId: string,
    registeredAt: Date,
    attendeeCount: number,
    specialRequirements: string
  }],
  registrationCount: number,

  // Attendance
  attendance: [{
    stakeholderId: string,
    attended: boolean,
    participationLevel: string, // "active" | "passive" | "absent"
    feedbackProvided: boolean
  }],
  attendanceRate: number,

  // Outcomes
  outcomes: {
    actualDate: Date,
    keyThemes: [string],
    actionItems: [string],
    feedbackSummary: string,
    nextSteps: string,
    recordings: [{
      recordingUrl: string,
      recordingDuration: number
    }]
  },

  // Status
  status: string, // "planned" | "in_progress" | "completed" | "cancelled"
  cancellationReason: string,

  // Metadata
  metadata: {
    createdAt: Date,
    createdBy: string (userId),
    updatedAt: Date,
    updatedBy: string (userId),
    completedAt: Date
  }
}

// Indexes
- { engagementId: 1 } (unique)
- { organizationId: 1, scheduledDate: -1 }
- { engagementType: 1, status: 1 }
- { "targetStakeholders.stakeholderIds": 1 }
```

#### engagement_strategies
```typescript
{
  _id: ObjectId,
  strategyId: string (UUID, unique, indexed),
  organizationId: string (indexed),

  // Strategy details
  strategyName: string,
  description: string,
  strategyPeriod: {
    startYear: number,
    endYear: number
  },

  // Objectives
  objectives: [string],
  targetStakeholderGroups: [string], // groupIds

  // Approach
  engagementApproach: string,
  keyActivities: [{
    activityName: string,
    frequency: string,
    owner: string (userId),
    resources: string
  }],

  // Metrics
  successMetrics: [string],
  kpis: [{
    kpiName: string,
    targetValue: number,
    currentValue: number,
    unit: string
  }],

  // Budget
  budget: number,
  actualSpend: number,

  // Approval
  status: string, // "draft" | "approved" | "active" | "completed"
  approvedBy: string (userId),
  approvedAt: Date,

  // Metadata
  metadata: {
    createdAt: Date,
    createdBy: string (userId),
    updatedAt: Date,
    updatedBy: string (userId)
  }
}

// Indexes
- { strategyId: 1 } (unique)
- { organizationId: 1, status: 1 }
```

#### communications
```typescript
{
  _id: ObjectId,
  communicationId: string (UUID, unique, indexed),
  organizationId: string (indexed),

  // Communication details
  subject: string,
  content: string, // HTML/Markdown
  communicationType: string, // "email" | "sms" | "in_app" | "newsletter" | "announcement"

  // Recipients
  recipients: {
    stakeholderIds: [string],
    groupIds: [string],
    filterCriteria: object,
    totalRecipients: number
  },

  // Sending
  scheduledSendTime: Date,
  actualSentTime: Date,
  status: string, // "draft" | "scheduled" | "sending" | "sent" | "failed"

  // Content
  attachments: [{
    fileId: string,
    fileName: string,
    fileUrl: string
  }],
  priority: string, // "low" | "normal" | "high" | "urgent"

  // Tracking
  trackOpens: boolean,
  trackClicks: boolean,
  analytics: {
    sent: number,
    delivered: number,
    opened: number,
    clicked: number,
    bounced: number,
    unsubscribed: number,
    openRate: number,
    clickRate: number,
    deliveryRate: number
  },

  // Individual tracking
  recipientActivity: [{
    stakeholderId: string,
    delivered: boolean,
    deliveredAt: Date,
    opened: boolean,
    openedAt: Date,
    clicked: boolean,
    clickedAt: Date,
    clickedLinks: [string],
    bounced: boolean,
    bounceReason: string,
    unsubscribed: boolean
  }],

  // Metadata
  metadata: {
    createdAt: Date,
    createdBy: string (userId),
    updatedAt: Date
  }
}

// Indexes
- { communicationId: 1 } (unique)
- { organizationId: 1, actualSentTime: -1 }
- { communicationType: 1 }
- { status: 1 }
```

#### newsletters
```typescript
{
  _id: ObjectId,
  newsletterId: string (UUID, unique, indexed),
  organizationId: string (indexed),

  // Newsletter details
  newsletterName: string,
  subject: string,
  content: string,
  sections: [{
    sectionId: string,
    sectionTitle: string,
    sectionContent: string,
    sectionOrder: number
  }],

  // Publishing
  publishDate: Date (indexed),
  status: string, // "draft" | "scheduled" | "published"

  // Recipients
  recipientGroups: [string], // groupIds
  totalRecipients: number,

  // Template
  templateId: string,

  // Analytics
  analytics: {
    sent: number,
    openRate: number,
    clickRate: number,
    topLinks: [{
      url: string,
      clicks: number
    }]
  },

  // Metadata
  metadata: {
    createdAt: Date,
    createdBy: string (userId),
    publishedAt: Date
  }
}

// Indexes
- { newsletterId: 1 } (unique)
- { organizationId: 1, publishDate: -1 }
```

#### announcements
```typescript
{
  _id: ObjectId,
  announcementId: string (UUID, unique, indexed),
  organizationId: string (indexed),

  // Announcement details
  title: string,
  content: string,
  announcementType: string, // "news" | "event" | "policy_update" | "achievement" | "alert"

  // Targeting
  targetAudience: {
    stakeholderCategories: [string],
    stakeholderIds: [string],
    isPublic: boolean
  },

  // Priority
  priority: string, // "low" | "normal" | "high" | "critical"

  // Publishing
  publishDate: Date (indexed),
  expirationDate: Date,
  status: string, // "draft" | "published" | "expired"

  // Content
  attachments: [{
    fileId: string,
    fileName: string,
    fileUrl: string
  }],

  // Analytics
  views: number,
  uniqueViewers: [string], // stakeholderIds

  // Metadata
  metadata: {
    createdAt: Date,
    createdBy: string (userId),
    publishedAt: Date
  }
}

// Indexes
- { announcementId: 1 } (unique)
- { organizationId: 1, publishDate: -1 }
- { announcementType: 1, status: 1 }
- { expirationDate: 1 }
```

#### surveys
```typescript
{
  _id: ObjectId,
  surveyId: string (UUID, unique, indexed),
  organizationId: string (indexed),

  // Survey details
  surveyTitle: string,
  surveyDescription: string,
  surveyType: string, // "materiality" | "engagement" | "satisfaction" | "feedback" | "custom"

  // Questions
  questions: [{
    questionId: string (UUID),
    questionText: string,
    questionType: string, // "rating" | "likert" | "ranking" | "multiple_choice" | "single_choice" | "text" | "matrix"
    options: [string],
    scaleMin: number,
    scaleMax: number,
    minLabel: string,
    maxLabel: string,
    required: boolean,
    branchingLogic: {
      conditionAnswer: any,
      nextQuestionId: string
    },
    order: number
  }],

  // Settings
  language: string,
  allowAnonymous: boolean,
  oneResponsePerStakeholder: boolean,
  randomizeQuestions: boolean,
  progressBar: boolean,

  // Status
  status: string, // "draft" | "active" | "closed" | "archived"

  // Metadata
  metadata: {
    createdAt: Date,
    createdBy: string (userId),
    updatedAt: Date,
    updatedBy: string (userId)
  }
}

// Indexes
- { surveyId: 1 } (unique)
- { organizationId: 1, surveyType: 1 }
- { status: 1 }
```

#### survey_distributions
```typescript
{
  _id: ObjectId,
  distributionId: string (UUID, unique, indexed),
  surveyId: string (indexed),
  organizationId: string (indexed),

  // Distribution details
  distributionName: string,
  distributionChannel: [string], // ["email" | "sms" | "portal" | "qr_code"]

  // Target stakeholders
  targetStakeholders: {
    stakeholderIds: [string],
    groupIds: [string],
    filterCriteria: object,
    totalTargeted: number
  },

  // Schedule
  openDate: Date,
  closeDate: Date,
  reminderSchedule: {
    firstReminder: number,
    recurringReminder: number,
    finalReminder: number
  },
  remindersSent: number,
  lastReminderDate: Date,

  // Settings
  anonymousLinks: boolean,
  quota: number,

  // Statistics
  statistics: {
    totalInvited: number,
    totalResponded: number,
    totalPartial: number,
    responseRate: number,
    averageCompletionTime: number,
    responsesByChannel: {[channel: string]: number}
  },

  // Metadata
  metadata: {
    createdAt: Date,
    createdBy: string (userId),
    closedAt: Date
  }
}

// Indexes
- { distributionId: 1 } (unique)
- { surveyId: 1 }
- { organizationId: 1, closeDate: 1 }
```

#### survey_responses
```typescript
{
  _id: ObjectId,
  responseId: string (UUID, unique, indexed),
  surveyId: string (indexed),
  distributionId: string (indexed),
  organizationId: string (indexed),

  // Respondent
  stakeholderId: string, // Null if anonymous
  surveyToken: string (indexed),
  isAnonymous: boolean,

  // Responses
  responses: [{
    questionId: string,
    questionText: string,
    questionType: string,
    answer: any // Depends on question type
  }],

  // Completion
  isComplete: boolean,
  completionTime: number, // seconds
  startedAt: Date,
  submittedAt: Date (indexed),

  // Context
  responseChannel: string, // "email" | "sms" | "portal" | "qr_code"
  ipAddress: string (hashed),
  userAgent: string,
  deviceType: string, // "desktop" | "mobile" | "tablet"

  // Analysis
  sentimentScore: number (-1 to 1),
  keyThemes: [string],
  flaggedForReview: boolean,
  reviewNotes: string,

  // Metadata
  metadata: {
    createdAt: Date
  }
}

// Indexes
- { responseId: 1 } (unique)
- { surveyId: 1, submittedAt: -1 }
- { stakeholderId: 1 }
- { surveyToken: 1 }
- { distributionId: 1 }
```

#### feedback
```typescript
{
  _id: ObjectId,
  feedbackId: string (UUID, unique, indexed),
  organizationId: string (indexed),

  // Source
  stakeholderId: string (indexed),
  isAnonymous: boolean,

  // Feedback details
  feedbackType: string, // "comment" | "suggestion" | "complaint" | "question" | "compliment"
  feedbackTopic: string,
  feedbackContent: string,
  feedbackChannel: string, // "portal" | "email" | "phone" | "in_person" | "social_media"

  // Attachments
  attachments: [{
    fileId: string,
    fileName: string,
    fileUrl: string
  }],

  // Priority
  priority: string, // "low" | "medium" | "high"

  // Analysis
  sentimentScore: number (-1 to 1),
  sentimentLabel: string, // "positive" | "neutral" | "negative"
  keyTopics: [string],
  relatedIssues: [string], // issueIds

  // Response
  status: string, // "open" | "assigned" | "in_progress" | "resolved" | "closed"
  assignedTo: string (userId),
  assignedAt: Date,
  response: {
    responseContent: string,
    respondedBy: string (userId),
    respondedAt: Date,
    internalNotes: string
  },
  responseNotificationSent: boolean,

  // Resolution
  resolutionTime: number, // hours
  resolvedAt: Date,

  // Metadata
  metadata: {
    createdAt: Date (indexed),
    updatedAt: Date
  }
}

// Indexes
- { feedbackId: 1 } (unique)
- { organizationId: 1, metadata.createdAt: -1 }
- { stakeholderId: 1 }
- { feedbackType: 1, status: 1 }
- { sentimentLabel: 1 }
- { assignedTo: 1 }
```

#### issues
```typescript
{
  _id: ObjectId,
  issueId: string (UUID, unique, indexed),
  organizationId: string (indexed),

  // Issue details
  issueTitle: string,
  issueDescription: string,
  issueSeverity: string, // "low" | "medium" | "high" | "critical"
  issueCategory: string,

  // Affected stakeholders
  affectedStakeholders: [string], // stakeholderIds
  affectedStakeholderCount: number,

  // Related feedback
  relatedFeedbackIds: [string],
  feedbackCount: number,

  // Assignment
  assignedTo: string (userId),
  assignedAt: Date,
  dueDate: Date,

  // Status
  status: string, // "open" | "in_progress" | "resolved" | "closed"

  // Resolution
  resolution: {
    resolutionNotes: string,
    actionsTaken: [string],
    resolvedBy: string (userId),
    resolvedAt: Date,
    preventativeActions: [string]
  },
  resolutionTime: number, // days

  // Metadata
  metadata: {
    createdAt: Date (indexed),
    createdBy: string (userId),
    updatedAt: Date
  }
}

// Indexes
- { issueId: 1 } (unique)
- { organizationId: 1, status: 1 }
- { issueSeverity: 1 }
- { assignedTo: 1 }
- { issueCategory: 1 }
```

#### portal_documents
```typescript
{
  _id: ObjectId,
  documentId: string (UUID, unique, indexed),
  organizationId: string (indexed),

  // Document details
  documentTitle: string,
  documentDescription: string,
  documentCategory: string, // "esg_report" | "policy" | "meeting_minutes" | "community_report" | "other"

  // File
  documentFile: {
    fileId: string,
    fileName: string,
    fileUrl: string,
    fileSize: number,
    fileType: string,
    uploadedAt: Date
  },

  // Publishing
  publishDate: Date (indexed),
  expirationDate: Date,
  status: string, // "draft" | "published" | "archived"

  // Access control
  accessControl: string, // "public" | "restricted"
  targetAudience: {
    stakeholderCategories: [string],
    stakeholderIds: [string]
  },
  accessibleStakeholders: number,

  // Analytics
  downloads: number,
  views: number,
  downloadHistory: [{
    stakeholderId: string,
    downloadedAt: Date
  }],
  viewHistory: [{
    stakeholderId: string,
    viewedAt: Date
  }],

  // Metadata
  metadata: {
    createdAt: Date,
    createdBy: string (userId),
    publishedAt: Date
  }
}

// Indexes
- { documentId: 1 } (unique)
- { organizationId: 1, publishDate: -1 }
- { documentCategory: 1, status: 1 }
```

### 2.2 Relationships

```
Organization
  └─ has many → Stakeholders
      ├─ belongs to many → StakeholderGroups
      ├─ participates in many → Engagements
      ├─ receives many → Communications
      ├─ submits many → SurveyResponses
      ├─ submits many → Feedback
      └─ accesses many → PortalDocuments

StakeholderGroup
  ├─ contains many → Stakeholders (members)
  ├─ targeted by many → SurveyDistributions
  └─ targeted by many → Engagements

Survey
  ├─ has many → SurveyDistributions
  └─ has many → SurveyResponses

Engagement
  ├─ targets many → Stakeholders
  └─ has many → EngagementRegistrations

Feedback
  ├─ submitted by → Stakeholder
  ├─ assigned to → User
  └─ generates many → Issues

Issue
  ├─ affects many → Stakeholders
  └─ related to many → Feedback
```

## 3. Events

### 3.1 Events Published

```typescript
// Stakeholder registry events
stakeholder.stakeholder.registered.v1
{
  eventId: string,
  eventType: "stakeholder.stakeholder.registered.v1",
  timestamp: Date,
  organizationId: string,
  correlationId: string,
  causationId: string,
  payload: {
    stakeholderId: string,
    stakeholderType: string,
    category: string,
    name: string,
    email: string,
    influence: number,
    interest: number,
    createdBy: string
  }
}

stakeholder.stakeholder.updated.v1
stakeholder.stakeholder.deleted.v1
stakeholder.stakeholder.mapping-updated.v1

// Stakeholder group events
stakeholder.group.created.v1
stakeholder.group.member-added.v1
stakeholder.group.member-removed.v1

// Engagement events
stakeholder.engagement.created.v1
{
  eventId: string,
  eventType: "stakeholder.engagement.created.v1",
  timestamp: Date,
  organizationId: string,
  correlationId: string,
  causationId: string,
  payload: {
    engagementId: string,
    engagementName: string,
    engagementType: string,
    scheduledDate: Date,
    targetStakeholders: number,
    createdBy: string
  }
}

stakeholder.engagement.registration-confirmed.v1
stakeholder.engagement.completed.v1
stakeholder.engagement.cancelled.v1

// Engagement strategy events
stakeholder.strategy.created.v1
stakeholder.strategy.approved.v1
stakeholder.strategy.updated.v1

// Communication events
stakeholder.communication.sent.v1
{
  eventId: string,
  eventType: "stakeholder.communication.sent.v1",
  timestamp: Date,
  organizationId: string,
  correlationId: string,
  causationId: string,
  payload: {
    communicationId: string,
    communicationType: string,
    subject: string,
    recipientCount: number,
    channel: string,
    sentBy: string
  }
}

stakeholder.newsletter.published.v1
stakeholder.announcement.published.v1

// Portal events
stakeholder.portal.invitation-sent.v1
stakeholder.portal.user-activated.v1
stakeholder.document.published.v1
stakeholder.document.downloaded.v1

// Survey events
stakeholder.survey.created.v1
stakeholder.survey.distributed.v1
{
  eventId: string,
  eventType: "stakeholder.survey.distributed.v1",
  timestamp: Date,
  organizationId: string,
  correlationId: string,
  causationId: string,
  payload: {
    surveyId: string,
    distributionId: string,
    surveyTitle: string,
    totalInvited: number,
    closeDate: Date,
    distributedBy: string
  }
}

stakeholder.survey.completed.v1
{
  eventId: string,
  eventType: "stakeholder.survey.completed.v1",
  timestamp: Date,
  organizationId: string,
  correlationId: string,
  causationId: string,
  payload: {
    surveyId: string,
    responseId: string,
    stakeholderId: string,
    isAnonymous: boolean,
    completionTime: number,
    submittedAt: Date
  }
}

stakeholder.survey.closed.v1
stakeholder.survey.results-generated.v1

// Feedback events
stakeholder.feedback.submitted.v1
{
  eventId: string,
  eventType: "stakeholder.feedback.submitted.v1",
  timestamp: Date,
  organizationId: string,
  correlationId: string,
  causationId: string,
  payload: {
    feedbackId: string,
    stakeholderId: string,
    feedbackType: string,
    feedbackTopic: string,
    sentiment: string,
    priority: string,
    isAnonymous: boolean
  }
}

stakeholder.feedback.responded.v1
stakeholder.feedback.resolved.v1

// Issue events
stakeholder.issue.raised.v1
{
  eventId: string,
  eventType: "stakeholder.issue.raised.v1",
  timestamp: Date,
  organizationId: string,
  correlationId: string,
  causationId: string,
  payload: {
    issueId: string,
    issueTitle: string,
    issueSeverity: string,
    issueCategory: string,
    affectedStakeholders: number,
    relatedFeedbackCount: number,
    assignedTo: string,
    createdBy: string
  }
}

stakeholder.issue.escalated.v1
stakeholder.issue.resolved.v1
stakeholder.issue.closed.v1
```

### 3.2 Events Consumed

```typescript
// From Identity Service (3001)
identity.user.created.v1
// Use: Auto-register employee stakeholders

identity.user.deactivated.v1
// Use: Update employee stakeholder status

// From Organization Service (3002)
organization.project.created.v1
// Use: Engage project-specific stakeholders

organization.facility.added.v1
// Use: Engage local community stakeholders

// From Materiality Service (3041)
materiality.assessment.created.v1
// Use: Initiate stakeholder engagement for materiality input

materiality.assessment.published.v1
// Use: Share materiality results with stakeholders

// From Strategy Service (3042)
strategic.strategy.created.v1
// Use: Align engagement strategy with ESG strategy

strategic.target.set.v1
// Use: Communicate targets to stakeholders

// From Reporting Service (3044)
reporting.report.published.v1
// Use: Distribute ESG report to stakeholders

// From Notification Service (3008)
notification.delivery.failed.v1
// Use: Retry stakeholder communication

notification.delivered.v1
// Use: Track communication success

// From Policy Service (3037)
governance.policy.published.v1
// Use: Distribute policy to relevant stakeholders

// From Workflow Service (3009)
workflow.approval.granted.v1
// Use: Publish approved engagement strategy
```

## 4. Service Dependencies

### 4.1 Upstream Dependencies (Services this service depends on)

```yaml
Identity Service (3001):
  - User authentication and authorization
  - User profile data
  - Role-based permissions
  Endpoints:
    - GET /v1/users/:userId
    - GET /v1/users/:userId/effective-permissions

Organization Service (3002):
  - Organization hierarchy
  - Facility and project information
  - Department structure
  Endpoints:
    - GET /v1/organizations/:orgId
    - GET /v1/organizations/:orgId/facilities
    - GET /v1/organizations/:orgId/departments

Notification Service (3008):
  - Email delivery (survey invitations, newsletters)
  - SMS notifications (urgent alerts)
  - In-app notifications (portal)
  Endpoints:
    - POST /v1/notifications/email
    - POST /v1/notifications/sms
    - POST /v1/notifications/in-app
  Circuit Breaker: Yes (30s timeout)

Materiality Service (3041):
  - Materiality assessment data
  - Stakeholder input collection
  Endpoints:
    - GET /v1/materiality/assessments/:assessmentId
    - POST /v1/materiality/assessments/:assessmentId/stakeholders
    - POST /v1/materiality/surveys/:surveyId/responses
  Circuit Breaker: Yes (60s timeout)

ML Service (3046):
  - Sentiment analysis (text feedback)
  - Topic extraction (open-text responses)
  - Predictive analytics (engagement forecasting)
  Endpoints:
    - POST /v1/ml/sentiment-analysis
    - POST /v1/ml/topic-extraction
    - POST /v1/ml/text-clustering
  Circuit Breaker: Yes (120s timeout)
  Fallback: Manual analysis

Integration Service (3010):
  - CRM integration (Salesforce, HubSpot)
  - Email service providers (SendGrid, Mailchimp)
  - Survey platforms (Qualtrics, SurveyMonkey)
  Endpoints:
    - POST /v1/integrations/crm/contacts/sync
    - POST /v1/integrations/email-provider/send
  Circuit Breaker: Yes (60s timeout)

Workflow Service (3009):
  - Engagement strategy approval workflow
  - Issue escalation workflow
  Endpoints:
    - POST /v1/workflows/initiate
    - GET /v1/workflows/:workflowId/status
```

### 4.2 Downstream Consumers (Services that depend on this service)

```yaml
Materiality Service (3041):
  - Stakeholder data for materiality assessment
  - Stakeholder input collection
  - Stakeholder weighting for analysis
  Events Subscribed:
    - stakeholder.survey.completed.v1
    - stakeholder.feedback.submitted.v1

Strategy Service (3042):
  - Stakeholder engagement metrics
  - Stakeholder feedback on strategy
  Events Subscribed:
    - stakeholder.feedback.submitted.v1
    - stakeholder.engagement.completed.v1

Reporting Service (3044):
  - Stakeholder engagement data for ESG reports
  - Stakeholder satisfaction metrics
  Events Subscribed:
    - stakeholder.engagement.completed.v1
    - stakeholder.survey.results-generated.v1

Policy Service (3037):
  - Stakeholder communication for policy distribution
  - Stakeholder feedback on policies
  Events Subscribed:
    - stakeholder.feedback.submitted.v1

Risk Service (3033):
  - Stakeholder-related risks
  - Stakeholder issue escalation
  Events Subscribed:
    - stakeholder.issue.raised.v1
    - stakeholder.issue.escalated.v1

Board Service (3031):
  - Investor stakeholder engagement
  - Shareholder feedback and concerns
  Events Subscribed:
    - stakeholder.feedback.submitted.v1 (investor category)
    - stakeholder.engagement.completed.v1 (investor category)
```

### 4.3 External Integrations

```yaml
CRM Systems:
  - Salesforce
  - HubSpot
  - Microsoft Dynamics 365
  Purpose: Bidirectional stakeholder contact sync
  Frequency: Real-time (webhook-based) or scheduled (daily)

Email Service Providers:
  - SendGrid
  - Mailchimp
  - AWS SES
  Purpose: Bulk email delivery, newsletter distribution
  Rate Limits: Respect provider limits (e.g., SendGrid 10,000/hour)

Survey Platforms (Optional):
  - Qualtrics
  - SurveyMonkey
  - Typeform
  Purpose: Advanced survey distribution (alternative to built-in)
  Fallback: Use built-in survey system

Social Media APIs:
  - Twitter API
  - LinkedIn API
  - Facebook Graph API
  Purpose: Social media engagement tracking, sentiment analysis
  Rate Limits: Twitter 300 requests/15 min, LinkedIn 500 requests/day

Webinar Platforms:
  - Zoom
  - Microsoft Teams
  - Webex
  Purpose: Virtual engagement event hosting, attendance tracking
  Integration: Calendar invites, attendance data sync

Translation Services:
  - Google Cloud Translation
  - DeepL API
  - AWS Translate
  Purpose: Multi-language survey and communication support
  Fallback: Manual translation workflow
```

## 5. Non-Functional Requirements

### 5.1 Performance Targets

```yaml
API Response Times:
  - Stakeholder list retrieval: <200ms (p95)
  - Stakeholder detail retrieval: <300ms (p95)
  - Survey creation: <500ms (p95)
  - Survey response submission: <400ms (p95)
  - Feedback submission: <300ms (p95)
  - Analytics dashboard: <2s (p95)

Throughput:
  - Concurrent users: 1,000+
  - Survey distributions per day: 50,000+
  - Survey responses per hour: 10,000+
  - Email communications per hour: 100,000+

Bulk Operations:
  - Import 10,000 stakeholder records: <5 minutes
  - Send survey to 50,000 stakeholders: <10 minutes
  - Generate survey results for 10,000 responses: <30 seconds
  - Export stakeholder data (10,000 records): <1 minute
```

### 5.2 Scalability Requirements

```yaml
Data Volume:
  - Total stakeholders: 100,000+ per organization
  - Active stakeholders: 50,000+ per organization
  - Survey responses: 10M+ records
  - Feedback records: 1M+ records
  - Communication history: 100M+ records

User Scale:
  - Organizations: 1,000+
  - Stakeholders per organization: 100,000+
  - Portal active users (MAU): 10,000+
  - Concurrent survey respondents: 5,000+

Geographic Distribution:
  - Multi-region deployment (US, EU, APAC)
  - CDN for portal assets
  - <100ms latency within region
```

### 5.3 Security Requirements

```yaml
Authentication & Authorization:
  - JWT-based authentication for portal users
  - API key authentication for service-to-service calls
  - OAuth 2.0 for stakeholder portal login
  - Role-based access control (RBAC)
    - Stakeholder Portal Admin
    - Engagement Manager
    - Survey Creator
    - Viewer (read-only)

Data Protection:
  - Encryption at rest (AES-256) for stakeholder PII
  - Encryption in transit (TLS 1.3)
  - Field-level encryption for sensitive contact data
  - Tokenization for survey links
  - IP address hashing for privacy

Privacy Compliance:
  - GDPR compliance (right to access, erasure, portability)
  - CCPA compliance
  - Stakeholder consent management
  - Data retention policies (7 years for engagement data)
  - Anonymization for survey responses

Access Control:
  - Row-level security (multi-tenant isolation)
  - Stakeholder data access logging
  - Portal access control by stakeholder category
  - Document access restrictions
```

### 5.4 Compliance Requirements

```yaml
ESG Reporting Standards:
  - GRI 2-29 (Stakeholder engagement)
  - AA1000 Stakeholder Engagement Standard
  - ISO 26000 (Social Responsibility)
  - CSRD ESRS requirements for stakeholder consultation
  - TCFD stakeholder disclosure requirements

Data Privacy Regulations:
  - GDPR (General Data Protection Regulation)
  - CCPA (California Consumer Privacy Act)
  - PIPEDA (Canada)
  - LGPD (Brazil)

Industry Standards:
  - CAN-SPAM Act (email compliance)
  - TCPA (Telephone Consumer Protection Act)
  - Anti-spam regulations by country
```

### 5.5 Availability & Reliability

```yaml
Uptime:
  - SLA: 99.9% uptime (8.76 hours downtime per year)
  - Portal availability: 99.95% during business hours
  - Planned maintenance: <2 hours per month

Disaster Recovery:
  - RPO (Recovery Point Objective): <1 hour
  - RTO (Recovery Time Objective): <2 hours
  - Multi-region failover
  - Automated backups (hourly incremental, daily full)
  - Backup retention: 90 days

Data Integrity:
  - Transactional consistency (MongoDB transactions)
  - Survey response immutability (append-only)
  - Audit trail for all stakeholder data changes
  - Data validation at ingestion
  - Deduplication for stakeholder records
```

## 6. Testing Strategy

### 6.1 Unit Test Coverage

**Target Coverage**: 90%

**Key Test Scenarios**:
```yaml
Stakeholder Registry:
  - Stakeholder creation and validation
  - Influence-interest mapping calculations
  - Quadrant classification logic
  - Duplicate detection algorithms
  - Contact information validation

Survey System:
  - Survey question branching logic
  - Response validation by question type
  - Sentiment scoring algorithms
  - Response rate calculations
  - Survey token generation and validation

Engagement Management:
  - Engagement scheduling and conflict detection
  - Attendance tracking calculations
  - Outcome summarization
  - Registration management

Communication:
  - Email template rendering
  - Recipient list generation from filters
  - Open/click tracking logic
  - Unsubscribe handling

Analytics:
  - Engagement metrics calculations
  - Sentiment trend analysis
  - Response rate aggregations
  - Issue heat map generation
```

### 6.2 Integration Test Scenarios

```yaml
Stakeholder Lifecycle:
  - Create stakeholder → Add to group → Invite to portal → Stakeholder accepts → Portal access granted
  - Verify: All steps complete, events published, portal access functional

Survey Distribution Flow:
  - Create survey → Distribute to stakeholder group → Stakeholders respond → Results aggregated
  - Verify: All invitations sent, responses recorded, analytics calculated

Engagement Event Flow:
  - Create engagement → Send invitations → Stakeholders register → Event completed → Outcomes captured
  - Verify: Registrations tracked, attendance recorded, feedback collected

Feedback Processing:
  - Stakeholder submits feedback → Sentiment analyzed → Issue created → Issue assigned → Issue resolved
  - Verify: Sentiment score calculated, issue created, notifications sent

Materiality Integration:
  - Materiality assessment created → Stakeholders invited → Survey responses collected → Results synced to Materiality Service
  - Verify: Data synced correctly, materiality service receives stakeholder input
```

### 6.3 Contract Tests (Pact)

**Consumer Contracts** (Stakeholder Service as Consumer):
```typescript
// Contract with Notification Service
pactWith({ consumer: 'StakeholderService', provider: 'NotificationService' }, (provider) => {
  describe('POST /v1/notifications/email', () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: 'notification service available',
        uponReceiving: 'a request to send survey invitation email',
        withRequest: {
          method: 'POST',
          path: '/v1/notifications/email',
          headers: { 'Content-Type': 'application/json' },
          body: {
            to: Matchers.string,
            subject: Matchers.string,
            content: Matchers.string,
            templateId: Matchers.string
          }
        },
        willRespondWith: {
          status: 200,
          body: {
            notificationId: Matchers.uuid,
            status: 'sent'
          }
        }
      });
    });

    it('sends survey invitation email', async () => {
      const result = await notificationClient.sendEmail({ ... });
      expect(result.status).toBe('sent');
    });
  });
});
```

**Provider Contracts** (Stakeholder Service as Provider):
```typescript
// Contract for Materiality Service consuming stakeholder data
{
  state: 'stakeholder exists',
  uponReceiving: 'a request for stakeholder details',
  withRequest: {
    method: 'GET',
    path: '/v1/stakeholders/:stakeholderId',
    headers: { Authorization: 'Bearer token' }
  },
  willRespondWith: {
    status: 200,
    body: {
      stakeholderId: Matchers.uuid,
      name: Matchers.string,
      category: Matchers.string,
      mapping: {
        influence: Matchers.number,
        interest: Matchers.number
      }
    }
  }
}
```

### 6.4 E2E Test Flows

**Critical User Journeys**:

1. **Stakeholder Engagement Manager - Materiality Survey Campaign**
   - Login → Create materiality survey → Import stakeholder list → Distribute survey
   - Monitor responses → Analyze results → Export to Materiality Service
   - **Duration**: <5 minutes
   - **Success Criteria**: 100% data sync, sentiment analysis accurate

2. **Stakeholder - Portal Feedback Submission**
   - Login to portal → View recent documents → Submit feedback → Receive confirmation
   - **Duration**: <2 minutes
   - **Success Criteria**: Feedback recorded, notification sent to owner

3. **ESG Manager - Annual Engagement Report**
   - Login → View engagement dashboard → Filter by year → Generate report → Export PDF
   - **Duration**: <3 minutes
   - **Success Criteria**: Report includes all engagements, accurate metrics

### 6.5 Performance Tests

**Load Tests**:
```yaml
Survey Response Load:
  - 5,000 concurrent survey respondents
  - 10,000 responses submitted in 1 hour
  - Target: <400ms response time (p95)

Email Distribution:
  - Send survey to 50,000 stakeholders
  - Target: Complete in <10 minutes
  - Target: 99% delivery rate

Portal Concurrent Users:
  - 1,000 concurrent portal users
  - Target: <2s page load time
  - Target: <500ms API response time
```

**Stress Tests**:
```yaml
Peak Load During Materiality Campaign:
  - 100,000 survey invitations in 1 hour
  - 20,000 concurrent responses
  - 10,000 concurrent portal users
  - Target: No failures, graceful degradation

Large Stakeholder Import:
  - Import 100,000 stakeholder records
  - Target: <30 minutes
  - Target: <1% data validation errors
```

## 7. Implementation Phases

### 7.1 MVP Features (Sprint 1-2, 4 weeks)

**Sprint 1-2: Core Stakeholder Management**
```yaml
Week 1-2:
  - Stakeholder CRUD operations
  - Stakeholder categorization
  - Influence-interest mapping
  - Basic stakeholder groups
  - Stakeholder search and filters

Week 3-4:
  - Basic survey creation (rating, multiple choice, text)
  - Survey distribution (manual email)
  - Survey response collection
  - Simple survey results dashboard
  - Basic feedback submission

Deliverables:
  - Stakeholder registry with 1,000+ records
  - Basic survey functionality (create → distribute → collect)
  - Simple analytics dashboard
  - API documentation
```

**MVP Success Criteria**:
```yaml
Functional:
  - Create 1,000 stakeholder records
  - Conduct 5 surveys with 100+ responses each
  - Track 50+ feedback submissions
  - Generate engagement metrics report

Performance:
  - <500ms API response times
  - 50% survey response rate

Quality:
  - 80% unit test coverage
  - 0 critical bugs
```

### 7.2 Phase 2 Enhancements (Sprint 3-5, 6 weeks)

**Advanced Features**:
```yaml
Month 2:
  - Stakeholder portal (login, dashboard, document access)
  - Advanced survey features (branching, matrix questions)
  - Multi-channel communication (email, SMS, in-app)
  - Sentiment analysis (ML Service integration)
  - Issue tracking and resolution

Month 3:
  - Engagement planning and scheduling
  - Event registration and attendance tracking
  - Stakeholder relationship mapping (Neo4j)
  - Newsletter and announcement system
  - Advanced analytics dashboards

Deliverables:
  - Functional stakeholder portal (1,000+ users)
  - Multi-channel engagement campaigns
  - Sentiment analysis on all text feedback
  - Advanced analytics and reporting
```

### 7.3 Phase 3 Advanced Features (Sprint 6-8, 6 weeks)

```yaml
Month 4:
  - Materiality Service integration
  - Stakeholder weighting for materiality
  - Double materiality survey templates
  - Automated stakeholder engagement strategies
  - Predictive analytics (engagement forecasting)

Deliverables:
  - Full materiality assessment stakeholder workflow
  - Automated engagement strategy recommendations
  - Predictive engagement models
  - Integration with external survey platforms
```

### 7.4 Future Roadmap (Post-Phase 3)

**AI/ML Enhancements**:
```yaml
AI-Powered Features:
  - AI-generated survey questions based on materiality topics
  - Automated sentiment analysis with emotion detection
  - Predictive stakeholder engagement models
  - Chatbot for stakeholder portal support
  - Natural language feedback categorization
  - Automated issue extraction from unstructured text

ML Models:
  - Stakeholder churn prediction (disengagement risk)
  - Optimal engagement timing recommendations
  - Survey response quality scoring
  - Stakeholder influence prediction
```

**Advanced Integrations**:
```yaml
Enterprise Systems:
  - CRM bidirectional sync (Salesforce, HubSpot, Dynamics)
  - Survey platform integration (Qualtrics, SurveyMonkey)
  - Email service provider integration (SendGrid, Mailchimp)
  - Webinar platform integration (Zoom, Teams, Webex)
  - Social media listening tools (Brandwatch, Sprinklr)

Blockchain:
  - Immutable stakeholder engagement records
  - Transparent feedback tracking
  - Verifiable survey responses
```

## 8. Migration Strategy

### 8.1 Data Migration

**No Legacy System**: This is a greenfield service for stakeholder management.

**Initial Data Seeding**:
```yaml
Stakeholder Categories:
  - Pre-defined stakeholder categories (investor, employee, customer, etc.)
  - Subcategory templates
  - Influence-interest matrix guidelines

Survey Templates:
  - Materiality survey template (GRI, SASB, ESRS)
  - Engagement satisfaction survey
  - Customer feedback survey
  - Employee engagement survey
  - Investor sentiment survey

Communication Templates:
  - Survey invitation email template
  - Newsletter template
  - Announcement template
  - Feedback confirmation email
```

**Data Import Tools**:
```yaml
CSV Import:
  - Bulk stakeholder import (name, email, category, influence, interest)
  - Stakeholder group import
  - Historical engagement data import

API-Based Import:
  - CRM contact sync (Salesforce, HubSpot)
  - HR system employee sync (Workday, SuccessFactors)
  - Email list import (Mailchimp, Constant Contact)
```

### 8.2 Rollout Approach

**Phase 1: Pilot (1 organization, 100 stakeholders)**
```yaml
Week 1-2:
  - Import 100 key stakeholders
  - Create 2 stakeholder groups
  - Conduct 1 test survey (10 respondents)
  - Gather feedback from pilot users

Success Criteria:
  - 90% stakeholder data accuracy
  - 80% survey response rate
  - 0 critical bugs
  - Positive user feedback
```

**Phase 2: Limited Release (10 organizations, 10,000 stakeholders)**
```yaml
Month 2:
  - Onboard 10 early adopter organizations
  - Import stakeholder data from CRM systems
  - Conduct 10 engagement events
  - Monitor performance and stability

Success Criteria:
  - <500ms API response times
  - 99% email delivery rate
  - 70% survey response rate
  - 95% user satisfaction
```

**Phase 3: General Availability**
```yaml
Month 3+:
  - Open to all organizations
  - Self-service stakeholder import
  - Automated onboarding
  - 24/7 support
```

### 8.3 Rollback Procedures

**Rollback Triggers**:
```yaml
Data Integrity Issues:
  - Stakeholder data corruption
  - Survey response data loss
  - Communication delivery failures >10%

Performance Issues:
  - API latency >2s (p95)
  - Survey submission failures >5%
  - Portal downtime >5 minutes

Security Issues:
  - Data breach or unauthorized access
  - Authentication failures
```

**Rollback Process**:
```yaml
Step 1: Stop Deployment
  - Halt deployment pipeline
  - Notify all users of service degradation

Step 2: Revert to Previous Version
  - Blue-green deployment: Switch traffic to blue (stable) environment
  - Database: Restore from latest backup snapshot

Step 3: Data Recovery
  - Verify data integrity
  - Re-sync stakeholder data from source systems
  - Validate survey responses

Step 4: Communication
  - Notify stakeholders of service restoration
  - Provide timeline for full resolution

Step 5: Post-Mortem
  - Root cause analysis within 24 hours
  - Document lessons learned
  - Update rollback procedures
```

## 9. Monitoring & Observability

### 9.1 Key Metrics

**Business Metrics**:
```yaml
Stakeholder Engagement:
  - Total stakeholders (by category)
  - Active stakeholders (engaged in last 90 days)
  - Engagement events conducted (monthly)
  - Survey response rate (overall, by stakeholder group)
  - Feedback volume (daily, weekly, monthly)
  - Portal active users (DAU, WAU, MAU)

Communication:
  - Emails sent (daily, monthly)
  - Email open rate (%)
  - Email click rate (%)
  - Email bounce rate (%)
  - Unsubscribe rate (%)

Sentiment:
  - Overall sentiment score (-1 to +1)
  - Sentiment by stakeholder category
  - Sentiment trend (improving/declining)
  - Top positive themes
  - Top negative themes

Issues:
  - Issues raised (monthly)
  - Issues resolved (monthly)
  - Average resolution time (days)
  - Issue severity distribution
```

**Technical Metrics**:
```yaml
API Performance:
  - Request rate (req/s)
  - Response time (p50, p95, p99)
  - Error rate (%)
  - Timeout rate (%)

Database:
  - Query execution time (ms)
  - Connection pool utilization (%)
  - Database size (GB)
  - Index hit rate (%)

Background Jobs:
  - Survey distribution job queue length
  - Email send job execution time (ms)
  - Sentiment analysis job success rate
  - Failed job count

Integration Health:
  - Notification Service call success rate
  - ML Service call success rate
  - Materiality Service sync success rate
  - External integration (CRM, email provider) health
```

### 9.2 Alerts

**Critical Alerts (PagerDuty)**:
```yaml
Service Health:
  - Service downtime >1 minute
  - API error rate >5% (5 min window)
  - Database connection failures
  - Portal unavailable >2 minutes

Data Integrity:
  - Survey response data corruption
  - Stakeholder data sync failures >10%
  - Email delivery failures >20%

Security:
  - Unauthorized portal access attempts
  - Suspicious stakeholder data exports
  - Authentication failures spike
```

**Warning Alerts (Email/Slack)**:
```yaml
Performance:
  - API latency p95 >1s (10 min window)
  - Database query slow (>500ms)
  - Background job queue backlog >1000

Business:
  - Survey response rate <30%
  - Sentiment score drop >20% (week-over-week)
  - Feedback resolution time >7 days
  - Portal user churn >10% (monthly)
```

### 9.3 Dashboards

**Operations Dashboard (Grafana)**:
```yaml
Panels:
  - Service health (uptime, latency, errors)
  - API endpoint performance (heatmap)
  - Database metrics (connections, query time)
  - Background job queue status
  - Integration health (Notification, ML, Materiality)
  - Error logs (real-time stream)

Audience: DevOps, SRE
Refresh: 30 seconds
```

**Engagement Dashboard (Internal App)**:
```yaml
Panels:
  - Total stakeholders (by category)
  - Engagement events (last 30 days)
  - Survey response rates (current campaigns)
  - Sentiment trend (last 6 months)
  - Feedback volume and sentiment
  - Top issues (by frequency and severity)
  - Portal active users (DAU/WAU/MAU)

Audience: ESG Managers, Engagement Managers
Refresh: 5 minutes
```

**Executive Dashboard (Internal App)**:
```yaml
Panels:
  - Stakeholder satisfaction score (NPS)
  - Engagement health score (composite)
  - Sentiment trend (quarterly)
  - Top stakeholder concerns (last quarter)
  - Materiality input status (for active assessments)
  - Regulatory disclosure readiness (stakeholder engagement)

Audience: C-Suite, Board Members
Refresh: Daily
```

### 9.4 SLOs (Service Level Objectives)

```yaml
Availability:
  - Target: 99.9% uptime
  - Measurement: Uptime monitoring (1 min intervals)
  - Error Budget: 43 minutes downtime per month

Latency:
  - Target: 95% of requests <300ms
  - Measurement: API response time (p95)
  - Error Budget: 5% of requests can exceed 300ms

Survey Response Submission:
  - Target: 99% of survey submissions succeed
  - Measurement: (Successful submissions / Total attempts) * 100
  - Error Budget: 1% failures acceptable

Email Delivery:
  - Target: 98% of emails delivered
  - Measurement: (Delivered / Sent) * 100
  - Error Budget: 2% delivery failures

Data Durability:
  - Target: 99.999% durability
  - Measurement: Data integrity checks (daily)
  - Error Budget: 0.001% data loss
```

## 10. Related Documentation

### 10.1 Architecture Documentation
- [ESG Platform Overview](../../ESG_PLATFORM_OVERVIEW.md)
- [Phase 2 Strategic ESG Architecture](../Phase2_Strategic_ESG_Overview.md)
- [Service Dependency Diagram](../../SERVICE_DEPENDENCY_DIAGRAM.md)
- [Event Schema Registry](../../ESG_EVENT_SCHEMA_REGISTRY.md)

### 10.2 Related Service Specifications
- [Materiality Service (3041)](./41_Materiality_Service.md) - Double materiality assessment
- [Strategy Service (3042)](./42_Strategy_Service.md) - ESG strategy management
- [Reporting Service (3044)](./44_Reporting_Service.md) - Multi-framework reporting
- [Notification Service (3008)](../../Phase1-Core/08_Notification_Service.md) - Communication delivery
- [ML Service (3046)](../../Phase4-Advanced/46_ML_Service.md) - Sentiment analysis

### 10.3 API Documentation
- [Stakeholder API Specification](./api/stakeholder-api-spec.yaml) - OpenAPI 3.0 spec
- [Survey API Specification](./api/survey-api-spec.yaml) - OpenAPI 3.0 spec
- [Portal API Specification](./api/portal-api-spec.yaml) - OpenAPI 3.0 spec

### 10.4 Data Models
- [Phase 2 Data Models](../Phase2_Data_Models.md) - Complete data model documentation
- [MongoDB Schema Migrations](./migrations/README.md) - Migration scripts
- [Neo4j Graph Schema](./neo4j/stakeholder-relationship-schema.md) - Graph data model

### 10.5 Testing Documentation
- [Testing Strategy](../../PHASE5_SDLC_Quality_Strategy.md) - Overall testing approach
- [Contract Tests](./tests/contracts/README.md) - Pact contract definitions
- [E2E Test Scenarios](./tests/e2e/README.md) - Playwright test suites

### 10.6 User Guides
- [Stakeholder Management Guide](./user-guides/stakeholder-management-guide.md)
- [Survey Creation Guide](./user-guides/survey-creation-guide.md)
- [Engagement Planning Guide](./user-guides/engagement-planning-guide.md)
- [Portal User Guide](./user-guides/stakeholder-portal-guide.md)

### 10.7 Compliance Guides
- [GRI 2-29 Implementation Guide](../../compliance/GRI_2-29_Stakeholder_Engagement.md)
- [AA1000 Stakeholder Engagement Standard](../../compliance/AA1000_Implementation.md)
- [CSRD Stakeholder Consultation Requirements](../../compliance/CSRD_Stakeholder_Requirements.md)

### 10.8 JIRA References
- [EPIC-028: Stakeholder Engagement](https://clenergize.atlassian.net/browse/EPIC-028)
- [CLNZ-2801: Build stakeholder registry](https://clenergize.atlassian.net/browse/CLNZ-2801)
- [CLNZ-2802: Implement survey system](https://clenergize.atlassian.net/browse/CLNZ-2802)
- [CLNZ-2803: Build stakeholder portal](https://clenergize.atlassian.net/browse/CLNZ-2803)
- [CLNZ-2804: Implement feedback tracking](https://clenergize.atlassian.net/browse/CLNZ-2804)

---

**Document Status**: COMPLETE
**Last Updated**: November 20, 2024
**Version**: 1.0.0
**Author**: Stakeholder Agent
**Reviewers**: Architecture Agent, Master Coordinator
**Next Review**: Start of Phase 2 Implementation
