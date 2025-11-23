# Service Specification: Community Service

## Service Overview

**Service Name**: Community Service
**Port**: 3024
**Purpose**: Manages community engagement, local economic impact, social investment programs, and indigenous peoples' rights
**Domain**: Social - Community Impact & Relations
**Team Ownership**: Social Domain Team
**Phase**: 4 (Social Domain)
**Story Points**: 40
**Compliance Focus**: GRI 413, CSRD ESRS S3, IFC PS5/PS7, UNDRIP, FPIC

## 1. Functional Requirements

### 1.1 Core Features

#### Community Stakeholder Management
- Community stakeholder identification and profiling
- Community mapping (geographic, demographic, cultural)
- Stakeholder categorization (indigenous, local, vulnerable groups)
- Community organization registry (CBOs, NGOs, local government)
- Stakeholder influence and interest analysis
- Community representative tracking
- Historical community relationships
- Community demographic data

#### Community Engagement
- Engagement activity planning and scheduling
- Consultation tracking (town halls, meetings, surveys)
- Free Prior and Informed Consent (FPIC) processes
- Community perception surveys and monitoring
- Feedback collection and analysis
- Engagement effectiveness metrics
- Communication channel management
- Engagement calendar and reminders
- Multi-language support for communications
- Cultural sensitivity protocols

#### Community Grievance Mechanism
- Multi-channel grievance submission (hotline, in-person, online, anonymous)
- Grievance case management and tracking
- Severity and risk assessment
- Investigation workflows
- Resolution tracking and remedy provision
- Response time monitoring and SLA management
- Retaliation prevention protocols
- Grievance analytics and trend identification
- Root cause analysis
- Escalation management
- Grievance closure and follow-up

#### Local Economic Impact
- Local procurement tracking (supplier identification, spend analysis)
- Local employment tracking (% of workforce from local community)
- Payroll contribution to local economy
- Local tax contribution tracking
- Infrastructure investments (roads, utilities, facilities)
- Indirect economic impact (multiplier effects)
- Supply chain local content analysis
- Economic footprint reporting
- Local business development support
- Skills development and training programs

#### Community Investment Programs
- Social investment portfolio management
- Program categories (education, health, infrastructure, livelihoods)
- Charitable contributions and donations
- Sponsorships and partnerships
- Employee volunteerism tracking (hours, activities, impact)
- NGO and CBO partnerships
- Impact measurement (beneficiaries, outcomes, SDG alignment)
- LBG (London Benchmarking Group) methodology implementation
- Investment ROI and SROI (Social Return on Investment)
- Program monitoring and evaluation
- Budget tracking and allocation

#### Indigenous Peoples' Rights
- Indigenous community identification
- Traditional lands and territories mapping
- Free Prior and Informed Consent (FPIC) process management
- Cultural heritage impact assessments
- Sacred sites protection
- Traditional knowledge protection and IP rights
- Benefit-sharing agreement management
- Indigenous employment and procurement tracking
- Cultural competency training
- UNDRIP (UN Declaration on Rights of Indigenous Peoples) compliance
- Indigenous liaison and relationship management

#### Community Health & Safety
- Community health impact assessments
- Environmental health monitoring (noise, dust, odor, air quality)
- Water quality impacts on communities
- Traffic safety near operations
- Emergency preparedness (community alerts, evacuation plans)
- Community health and safety training
- Health facility support
- Disease surveillance and prevention
- Community safety complaints and resolution

#### Resettlement & Land Acquisition
- Resettlement Action Plans (RAPs)
- Livelihood Restoration Programs (LRPs)
- Compensation tracking and payment
- Household surveys and socioeconomic baselines
- Replacement housing and infrastructure
- Resettlement site selection and development
- Transitional support programs
- Post-resettlement monitoring
- Grievance mechanisms for resettlement
- IFC Performance Standard 5 compliance
- Land acquisition documentation

#### Community Perception & Social License
- Social License to Operate (SLO) assessment
- Community perception tracking
- Trust and reputation monitoring
- Community satisfaction surveys
- Media monitoring (local news, social media)
- Stakeholder sentiment analysis
- SLO risk indicators and early warning
- Relationship quality scoring
- Community relations dashboard

### 1.2 API Endpoints

#### Community Stakeholder Endpoints
```yaml
POST /v1/communities/stakeholders
  Request:
    - organizationId: string (required)
    - facilityId: string (optional)
    - name: string (required)
    - type: indigenous|local-government|ngo|cbo|vulnerable-group|general
    - classification:
        influence: high|medium|low
        interest: high|medium|low
        vulnerability: high|medium|low
    - demographics:
        population: number
        households: number
        averageIncome: number
        primaryLanguage: string
        culturalGroup: string
    - location:
        coordinates: { lat: number, lng: number }
        proximity: number (km from facility)
        region: string
    - representatives: array of
        - name: string
          role: string
          contact: object
    - indigenousStatus:
        isIndigenous: boolean
        tribe: string
        traditionalLands: boolean
        fpicRequired: boolean
    - metadata: object
  Response:
    - stakeholderId: string
    - stakeholder: CommunityStakeholder

GET /v1/communities/stakeholders/:stakeholderId
  Response:
    - stakeholder: CommunityStakeholder

PUT /v1/communities/stakeholders/:stakeholderId
  Request:
    - name: string
    - classification: object
    - demographics: object
    - representatives: array
  Response:
    - stakeholder: CommunityStakeholder

GET /v1/communities/stakeholders
  Query:
    - organizationId: string
    - facilityId: string
    - type: string
    - isIndigenous: boolean
    - proximityRadius: number (km)
    - influenceLevel: high|medium|low
    - search: string
    - page: number
    - limit: number
  Response:
    - stakeholders: CommunityStakeholder[]
    - total: number

DELETE /v1/communities/stakeholders/:stakeholderId
  Response:
    - success: boolean
    - archivedAt: ISO8601
```

#### Community Engagement Endpoints
```yaml
POST /v1/communities/engagements
  Request:
    - stakeholderId: string (required)
    - facilityId: string (required)
    - type: consultation|town-hall|survey|fpic|meeting|workshop|focus-group
    - purpose: string (required)
    - date: ISO8601 (required)
    - location: string
    - participants:
        expected: number
        actual: number
        demographics: object
    - topics: array of string
    - materials:
        - type: presentation|document|video
          url: string (S3)
          language: string
    - isFPIC: boolean
    - fpicDetails:
        stage: information|consultation|agreement|implementation
        consensusReached: boolean
        concerns: array
        agreements: array
    - outcomes:
        feedback: array
        actionItems: array
        followUpRequired: boolean
    - culturalConsiderations:
        translation: boolean
        culturalProtocols: array
        sensitiveTopics: array
    - metadata: object
  Response:
    - engagementId: string
    - engagement: CommunityEngagement

GET /v1/communities/engagements/:engagementId
  Response:
    - engagement: CommunityEngagement

PUT /v1/communities/engagements/:engagementId
  Request:
    - participants: object
    - outcomes: object
    - fpicDetails: object
  Response:
    - engagement: CommunityEngagement

GET /v1/communities/engagements
  Query:
    - stakeholderId: string
    - facilityId: string
    - type: string
    - isFPIC: boolean
    - dateFrom: ISO8601
    - dateTo: ISO8601
    - status: planned|completed|cancelled
    - search: string
    - page: number
    - limit: number
  Response:
    - engagements: CommunityEngagement[]
    - total: number

POST /v1/communities/engagements/:engagementId/feedback
  Request:
    - feedbackType: concern|suggestion|complaint|question|praise
    - content: string (required)
    - severity: critical|high|medium|low
    - theme: string
    - respondent:
        name: string
        anonymous: boolean
        demographics: object
  Response:
    - feedbackId: string
    - feedback: EngagementFeedback

GET /v1/communities/engagements/:engagementId/effectiveness
  Response:
    - effectiveness:
        participationRate: number (percentage)
        representativeness: number
        satisfactionScore: number
        actionItemCompletion: number (percentage)
        followUpRate: number (percentage)
        culturalAppropriateness: number
```

#### Community Grievance Endpoints
```yaml
POST /v1/communities/grievances
  Request:
    - stakeholderId: string (optional, can be anonymous)
    - facilityId: string (required)
    - submissionChannel: hotline|email|in-person|online|mail|third-party
    - isAnonymous: boolean
    - complainant:
        name: string (if not anonymous)
        contact: object
        demographics: object
        vulnerabilityStatus: string
    - grievanceType: environmental|social|economic|cultural|safety|resettlement|other
    - category: noise|dust|traffic|employment|land|water|health|safety|cultural
    - description: string (required)
    - severity: critical|high|medium|low
    - locationDetails: string
    - dateOfIncident: ISO8601
    - evidence:
        - type: photo|document|video|audio
          url: string (S3)
          description: string
    - desiredOutcome: string
    - languagePreference: string
    - metadata: object
  Response:
    - grievanceId: string
    - grievanceNumber: string (user-friendly ID)
    - grievance: CommunityGrievance

GET /v1/communities/grievances/:grievanceId
  Response:
    - grievance: CommunityGrievance

PUT /v1/communities/grievances/:grievanceId/acknowledge
  Request:
    - acknowledgedBy: string (userId)
    - estimatedResolutionDate: ISO8601
    - assignedTo: string (userId or team)
  Response:
    - grievance: CommunityGrievance

PUT /v1/communities/grievances/:grievanceId/investigate
  Request:
    - investigator: string
    - findings: string
    - rootCause: string
    - evidence: array
    - recommendations: array
    - investigationCompletedAt: ISO8601
  Response:
    - grievance: CommunityGrievance

PUT /v1/communities/grievances/:grievanceId/resolve
  Request:
    - resolutionType: corrective-action|compensation|mediation|explanation|escalation
    - resolutionDetails: string (required)
    - remedyProvided:
        type: financial|in-kind|policy-change|service|apology
        value: number
        description: string
    - complainantSatisfied: boolean
    - resolvedBy: string
    - resolvedAt: ISO8601
  Response:
    - grievance: CommunityGrievance

PUT /v1/communities/grievances/:grievanceId/close
  Request:
    - closureReason: resolved|withdrawn|duplicate|out-of-scope
    - closureNotes: string
    - followUpRequired: boolean
    - followUpDate: ISO8601
  Response:
    - grievance: CommunityGrievance

GET /v1/communities/grievances
  Query:
    - facilityId: string
    - stakeholderId: string
    - status: submitted|acknowledged|investigating|resolved|closed|escalated
    - severity: critical|high|medium|low
    - grievanceType: string
    - dateFrom: ISO8601
    - dateTo: ISO8601
    - overdue: boolean
    - page: number
    - limit: number
  Response:
    - grievances: CommunityGrievance[]
    - total: number
    - metrics:
        averageResolutionTime: number (days)
        overdueCount: number
        satisfactionRate: number (percentage)

GET /v1/communities/grievances/analytics
  Query:
    - facilityId: string
    - dateFrom: ISO8601
    - dateTo: ISO8601
  Response:
    - analytics:
        totalGrievances: number
        byType: object
        byCategory: object
        bySeverity: object
        byStatus: object
        trends: array
        topIssues: array
        resolutionMetrics:
            averageDays: number
            withinSLA: number (percentage)
            satisfactionRate: number
```

#### Local Economic Impact Endpoints
```yaml
POST /v1/communities/economic-impact/local-procurement
  Request:
    - facilityId: string (required)
    - reportingPeriod:
        year: number
        quarter: number (optional)
    - totalProcurement: number (required)
    - localProcurement:
        amount: number (required)
        percentage: number (calculated)
        numberOfSuppliers: number
    - suppliers: array of
        - supplierId: string
          name: string
          location: string
          isLocal: boolean
          spendAmount: number
          category: string
    - localDefinition:
        radiusKm: number
        jurisdictionLevel: regional|provincial|national
    - metadata: object
  Response:
    - recordId: string
    - localProcurement: LocalProcurementRecord

POST /v1/communities/economic-impact/local-employment
  Request:
    - facilityId: string (required)
    - reportingPeriod:
        year: number
        quarter: number (optional)
    - totalEmployees: number (required)
    - localEmployees:
        count: number (required)
        percentage: number (calculated)
        byLevel:
            seniorManagement: number
            middleManagement: number
            supervisors: number
            workers: number
    - localDefinition:
        radiusKm: number
        communityMembers: boolean
    - payrollContribution:
        totalPayroll: number
        localPayroll: number
        estimatedLocalSpend: number (multiplier effect)
    - metadata: object
  Response:
    - recordId: string
    - localEmployment: LocalEmploymentRecord

POST /v1/communities/economic-impact/tax-contribution
  Request:
    - facilityId: string (required)
    - reportingPeriod:
        year: number
    - localTaxes:
        propertyTax: number
        businessTax: number
        employmentTax: number
        salesTax: number
        otherTaxes: array
        total: number
    - taxRecipients: array of
        - jurisdiction: string
          level: municipal|regional|provincial
          amount: number
    - metadata: object
  Response:
    - recordId: string
    - taxContribution: TaxContributionRecord

POST /v1/communities/economic-impact/infrastructure-investment
  Request:
    - facilityId: string (required)
    - investmentYear: number (required)
    - projectName: string (required)
    - category: roads|water|electricity|telecommunications|education|health|other
    - description: string
    - investment:
        amount: number (required)
        currency: string
        fundingSource: company|joint|government
    - beneficiaries:
        communityMembers: number
        households: number
        businesses: number
    - status: planned|in-progress|completed
    - completionDate: ISO8601
    - impact:
        description: string
        benefitType: array
        sdgAlignment: array
    - metadata: object
  Response:
    - investmentId: string
    - investment: InfrastructureInvestment

GET /v1/communities/economic-impact/summary
  Query:
    - facilityId: string (required)
    - year: number (required)
  Response:
    - summary:
        localProcurement:
            amount: number
            percentage: number
            trend: number
        localEmployment:
            count: number
            percentage: number
            payrollContribution: number
        taxContribution:
            total: number
            byJurisdiction: array
        infrastructureInvestment:
            total: number
            projectCount: number
        economicFootprint:
            directImpact: number
            indirectImpact: number (multiplier)
            totalImpact: number
        multiplierEffect: number
```

#### Community Investment Endpoints
```yaml
POST /v1/communities/investments
  Request:
    - organizationId: string (required)
    - facilityId: string (optional)
    - programName: string (required)
    - category: education|health|infrastructure|livelihoods|environment|culture|sports
    - investmentType: cash|in-kind|volunteer-time|management-costs
    - lbgCategory: charitable-donation|community-investment|commercial-initiative
    - amount:
        value: number (required)
        currency: string
        calculationMethod: string (for in-kind/volunteer)
    - period:
        startDate: ISO8601
        endDate: ISO8601
    - partners: array of
        - type: ngo|cbo|government|academic|business
          name: string
          role: string
          contribution: number
    - targetBeneficiaries:
        communityGroups: array
        estimatedCount: number
        demographics: object
    - objectives: array of string
    - sdgAlignment: array of number (SDG goals 1-17)
    - status: planned|active|completed|suspended
    - metadata: object
  Response:
    - investmentId: string
    - investment: CommunityInvestment

POST /v1/communities/investments/:investmentId/impact
  Request:
    - reportingPeriod: ISO8601
    - actualBeneficiaries:
        count: number (required)
        demographics: object
        satisfaction: number (1-5)
    - outcomes: array of
        - indicator: string
          baseline: number
          target: number
          actual: number
          unit: string
    - outputs: array of
        - description: string
          quantity: number
          unit: string
    - stories:
        - title: string
          content: string
          media: array (photos/videos)
    - challenges: array
    - lessonsLearned: array
    - sdgProgress: array of
        - goal: number
          contribution: string
    - sroi:
        totalInvestment: number
        socialValue: number
        ratio: number
  Response:
    - impactId: string
    - impact: InvestmentImpact

POST /v1/communities/volunteerism
  Request:
    - organizationId: string (required)
    - facilityId: string (optional)
    - activityName: string (required)
    - activityDate: ISO8601 (required)
    - category: skills-based|hands-on|board-service|pro-bono
    - cause: education|health|environment|community-development|disaster-relief
    - volunteers: array of
        - employeeId: string
          name: string
          hours: number (required)
          role: string
    - totalHours: number (calculated)
    - beneficiaryOrganization:
        name: string
        type: ngo|cbo|school|health-facility
        contact: object
    - impact:
        description: string
        beneficiariesReached: number
        volunteersSkillsUsed: array
    - estimatedValue:
        hourlyRate: number
        totalValue: number (calculated)
    - metadata: object
  Response:
    - activityId: string
    - activity: VolunteerActivity

GET /v1/communities/investments/portfolio
  Query:
    - organizationId: string
    - facilityId: string
    - year: number
    - category: string
    - lbgCategory: string
    - status: string
  Response:
    - portfolio:
        totalInvestment: number
        byCategory: object
        byLBGCategory: object
        projectCount: number
        totalBeneficiaries: number
        sdgCoverage: array
        volunteerHours: number
        volunteerValue: number
```

#### Indigenous Peoples' Rights Endpoints
```yaml
POST /v1/communities/indigenous/communities
  Request:
    - organizationId: string (required)
    - facilityId: string (required)
    - communityName: string (required)
    - tribe: string
    - population: number
    - traditionalTerritory:
        boundaries: GeoJSON
        areaHectares: number
        overlapsWithOperations: boolean
    - culturalSignificance:
        sacredSites: array of
            - name: string
              location: { lat: number, lng: number }
              type: burial|ceremonial|historical|natural
              accessRestrictions: string
        culturalPractices: array
        traditionalKnowledge: array
    - representatives:
        - name: string
          role: chief|elder|liaison|spokesperson
          contact: object
    - fpicStatus:
        required: boolean
        initiated: boolean
        consensusReached: boolean
    - vulnerabilities: array
    - relationshipQuality: strong|developing|strained|adversarial
    - metadata: object
  Response:
    - indigenousCommunityId: string
    - community: IndigenousCommunity

POST /v1/communities/indigenous/fpic-processes
  Request:
    - indigenousCommunityId: string (required)
    - facilityId: string (required)
    - projectName: string (required)
    - projectDescription: string (required)
    - potentialImpacts: array of
        - category: land|water|culture|economy|health|rights
          description: string
          severity: major|moderate|minor
          mitigation: string
    - fpicStages:
        - stage: information
          status: not-started|in-progress|completed
          activities: array
          completedDate: ISO8601
        - stage: consultation
          status: not-started|in-progress|completed
          meetingsHeld: number
          participantsCount: number
          feedbackReceived: array
          completedDate: ISO8601
        - stage: negotiation
          status: not-started|in-progress|completed
          agreementsReached: array
          conditionsSet: array
          completedDate: ISO8601
        - stage: consent
          status: pending|granted|withheld|conditional
          consentDate: ISO8601
          consentEvidence: string (S3 URL)
          conditions: array
    - culturalProtocols:
        languageUsed: array
        culturalAdvisors: array
        ceremonyRespected: boolean
        protocolsFollowed: array
    - documentation:
        - type: minutes|agreement|evidence|photo|video
          url: string (S3)
          date: ISO8601
    - metadata: object
  Response:
    - fpicProcessId: string
    - fpicProcess: FPICProcess

POST /v1/communities/indigenous/benefit-sharing
  Request:
    - indigenousCommunityId: string (required)
    - agreementName: string (required)
    - agreementType: revenue-sharing|employment|business-opportunity|infrastructure|capacity-building
    - agreementDate: ISO8601 (required)
    - duration:
        startDate: ISO8601
        endDate: ISO8601
        reviewFrequency: annual|biannual|as-needed
    - benefits: array of
        - type: financial|employment|business|infrastructure|services|cultural
          description: string
          value: number
          deliverySchedule: string
          conditions: array
    - performanceMetrics: array of
        - indicator: string
          target: number
          unit: string
    - governanceStructure:
        jointCommittee: boolean
        communityRepresentatives: array
        companyRepresentatives: array
        decisionMakingProcess: string
    - disputeResolution:
        mechanism: string
        escalationPath: array
    - documentation:
        agreementUrl: string (S3)
        annexes: array
    - status: draft|active|under-review|completed|terminated
    - metadata: object
  Response:
    - agreementId: string
    - agreement: BenefitSharingAgreement

POST /v1/communities/indigenous/cultural-heritage
  Request:
    - indigenousCommunityId: string (required)
    - facilityId: string (required)
    - assessmentType: impact-assessment|monitoring|protection-plan
    - assessmentDate: ISO8601 (required)
    - culturalAssets: array of
        - type: sacred-site|artifact|practice|knowledge|language
          name: string
          location: GeoJSON (optional)
          significance: critical|high|moderate
          vulnerabilityToOperations: high|medium|low|none
    - impacts:
        - assetId: string
          impactType: physical|visual|auditory|access|spiritual
          severity: major|moderate|minor|negligible
          likelihood: certain|likely|possible|unlikely
          riskRating: string (calculated)
    - mitigationMeasures: array of
        - impactId: string
          measure: avoidance|minimization|restoration|compensation|offset
          description: string
          responsibility: string
          timeline: string
          status: planned|implementing|completed
    - monitoringPlan:
        frequency: string
        indicators: array
        responsibleParty: string
    - consultationRecord:
        communityConsulted: boolean
        consentObtained: boolean
        concerns: array
        agreements: array
    - metadata: object
  Response:
    - assessmentId: string
    - assessment: CulturalHeritageAssessment

GET /v1/communities/indigenous/compliance
  Query:
    - facilityId: string (required)
    - year: number
  Response:
    - compliance:
        undrip:
            articlesApplicable: array
            complianceStatus: compliant|partial|non-compliant
            gaps: array
        iloConvention169:
            applicable: boolean
            ratifiedByCountry: boolean
            complianceStatus: string
        fpic:
            processesRequired: number
            processesCompleted: number
            consensusRate: number (percentage)
            outstandingIssues: array
        benefitSharing:
            agreementsActive: number
            benefitsDelivered: number
            beneficiaryCount: number
        culturalHeritage:
            sitesIdentified: number
            sitesProtected: number
            incidentsReported: number
        indigenousEmployment:
            count: number
            percentage: number
        indigenousProcurement:
            amount: number
            percentage: number
        relationshipQuality:
            score: number
            trend: improving|stable|declining
```

#### Resettlement Endpoints
```yaml
POST /v1/communities/resettlement/action-plans
  Request:
    - organizationId: string (required)
    - facilityId: string (required)
    - projectName: string (required)
    - resettlementType: physical|economic|both
    - affectedHouseholds: number (required)
    - affectedPersons: number (required)
    - vulnerableGroups: array of
        - groupType: indigenous|elderly|disabled|female-headed|landless
          count: number
    - landAcquisition:
        totalAreaHa: number
        acquisitionType: voluntary|involuntary
        compensationBasis: replacement-cost|market-value
    - socioeconomicBaseline:
        surveyDate: ISO8601
        householdsSurveyed: number
        demographics: object
        livelihoodProfiles: array
        incomeLevels: object
        assetInventory: array
    - entitlementMatrix:
        - impactType: land|structure|crops|business|employment
          eligibility: owner|tenant|squatter|employee
          compensation: string
          assistanceMeasures: array
    - resettlementSite:
        location: string
        coordinates: { lat: number, lng: number }
        areaHa: number
        housingUnits: number
        infrastructure: array
        servicesAvailable: array
    - implementationSchedule:
        stages: array of
            - name: string
              startDate: ISO8601
              endDate: ISO8601
              activities: array
    - budget:
        totalCost: number
        byCategory: object
        contingency: number (percentage)
    - status: planning|consultation|implementation|monitoring|completed
    - metadata: object
  Response:
    - rapId: string
    - rap: ResettlementActionPlan

POST /v1/communities/resettlement/compensation
  Request:
    - rapId: string (required)
    - householdId: string (required)
    - compensationPackage:
        - category: land|structure|crops|trees|business|relocation
          description: string
          quantity: number
          unit: string
          unitValue: number
          totalValue: number
    - cashCompensation: number
    - inKindCompensation:
        replacementLand: number (ha)
        replacementHouse: boolean
        otherAssets: array
    - additionalAssistance:
        movingAllowance: number
        transitionalSupport: number
        livelihoodSupport: number
        vulnerableSupport: number
    - paymentSchedule: array of
        - installment: number
          amount: number
          dueDate: ISO8601
          paidDate: ISO8601
          status: pending|paid
    - grievanceOption: string
    - metadata: object
  Response:
    - compensationId: string
    - compensation: CompensationRecord

POST /v1/communities/resettlement/livelihood-restoration
  Request:
    - rapId: string (required)
    - householdId: string (required)
    - baselineLivelihood:
        primarySource: string
        monthlyIncome: number
        assets: array
    - restorationStrategy:
        type: land-based|wage-employment|self-employment|combination
        description: string
    - supportProvided: array of
        - type: land|training|job-placement|microfinance|equipment|extension-services
          description: string
          value: number
          deliveryDate: ISO8601
    - outcomes:
        newLivelihood: string
        monthlyIncome: number
        incomeRestored: boolean
        incomeImproved: boolean
        assetsRestored: array
    - monitoringSchedule:
        - period: number (months post-resettlement)
          surveyDate: ISO8601
          findings: string
    - metadata: object
  Response:
    - lrpId: string
    - lrp: LivelihoodRestorationProgram

GET /v1/communities/resettlement/monitoring
  Query:
    - rapId: string (required)
  Response:
    - monitoring:
        implementationProgress:
            householdsRelocated: number
            percentComplete: number
            onSchedule: boolean
        compensationStatus:
            householdsPaid: number
            amountDisbursed: number
            percentDisbursed: number
        livelihoodRestoration:
            householdsRestored: number
            averageIncomeChange: number (percentage)
            householdsImproved: number
        grievances:
            total: number
            resolved: number
            pending: number
        compliance:
            ifcPS5: compliant|partial|non-compliant
            gaps: array
```

#### Community Health & Safety Endpoints
```yaml
POST /v1/communities/health-safety/impact-assessments
  Request:
    - facilityId: string (required)
    - assessmentType: chia|esia|hia (Community Health IA, Environmental & Social IA)
    - assessmentDate: ISO8601 (required)
    - affectedCommunities: array of stakeholderId
    - healthIssues: array of
        - category: air-quality|water-quality|noise|vibration|dust|odor|disease|traffic|hazmat
          description: string
          baseline: object
          potentialImpact: major|moderate|minor|negligible
          affectedPopulation: number
    - vulnerableGroups: array of
        - group: children|elderly|pregnant-women|chronically-ill|disabled
          count: number
          specificConcerns: array
    - mitigationMeasures: array of
        - healthIssue: string
          measure: string
          responsibility: string
          timeline: string
          effectiveness: string
    - monitoringPlan:
        parameters: array
        frequency: string
        reportingSchedule: string
    - consultationRecord:
        communitiesConsulted: array
        concerns: array
        agreements: array
    - metadata: object
  Response:
    - assessmentId: string
    - assessment: HealthSafetyAssessment

POST /v1/communities/health-safety/monitoring
  Request:
    - facilityId: string (required)
    - monitoringDate: ISO8601 (required)
    - parameter: noise|dust|air-quality|water-quality|vibration|odor
    - location:
        name: string
        coordinates: { lat: number, lng: number }
        proximity: number (km from facility)
    - measurement:
        value: number (required)
        unit: string (required)
        standard: string (e.g., WHO guideline)
        limit: number
        exceedance: boolean
    - conditions:
        weather: string
        operations: string
        time: string
    - action:
        exceedanceResponse: string
        notificationSent: boolean
        remedialMeasures: array
    - metadata: object
  Response:
    - recordId: string
    - record: EnvironmentalMonitoringRecord

POST /v1/communities/health-safety/complaints
  Request:
    - facilityId: string (required)
    - complaintDate: ISO8601 (required)
    - complaintType: noise|dust|odor|traffic|health-concern|safety-concern
    - complainant:
        name: string
        anonymous: boolean
        location: string
        contact: object
    - description: string (required)
    - severity: critical|high|medium|low
    - investigation:
        investigatedBy: string
          findings: string
          rootCause: string
    - corrective Action:
        actions: array
        completedDate: ISO8601
    - followUp:
        complainantSatisfied: boolean
        closureDate: ISO8601
    - metadata: object
  Response:
    - complaintId: string
    - complaint: HealthSafetyComplaint

GET /v1/communities/health-safety/dashboard
  Query:
    - facilityId: string (required)
    - dateFrom: ISO8601
    - dateTo: ISO8601
  Response:
    - dashboard:
        monitoringCompliance:
            parametersMonitored: number
            exceedances: number
            complianceRate: number (percentage)
        complaints:
            total: number
            byType: object
            resolved: number
            averageResolutionDays: number
        impactAssessments:
            completed: number
            mitigationImplementation: number (percentage)
        communityHealthIncidents: number
```

#### Social License & Perception Endpoints
```yaml
POST /v1/communities/social-license/assessments
  Request:
    - facilityId: string (required)
    - assessmentDate: ISO8601 (required)
    - methodology: stakeholder-survey|expert-panel|media-analysis|composite
    - stakeholderSegments: array of
        - segmentId: string (stakeholder group)
          sampleSize: number
          responseRate: number (percentage)
    - dimensions: array of
        - dimension: legitimacy|trust|credibility
          score: number (1-5)
          indicators: array
          trend: improving|stable|declining
    - overallSLOLevel: withdrawal|acceptance|approval|co-ownership
    - riskIndicators: array of
        - indicator: protest|media-criticism|legal-action|political-pressure
          severity: high|medium|low
          trend: increasing|stable|decreasing
    - strengths: array
    - weaknesses: array
    - recommendations: array
    - metadata: object
  Response:
    - assessmentId: string
    - sloAssessment: SocialLicenseAssessment

POST /v1/communities/perception/surveys
  Request:
    - stakeholderId: string (required)
    - facilityId: string (required)
    - surveyDate: ISO8601 (required)
    - methodology: in-person|phone|online|focus-group
    - sampleSize: number (required)
    - responseRate: number (percentage)
    - topics: array of
        - topic: environment|employment|community-investment|communication|safety|trust
          questions: array of
              - question: string
                responses: object (distribution)
                averageScore: number (1-5)
    - overallSatisfaction: number (1-5)
    - netPromoterScore: number (-100 to 100)
    - keyFindings:
        positives: array
        concerns: array
        suggestions: array
    - demographics:
        age: object
        gender: object
        proximity: object
    - trend:
        previousScore: number
        change: number
    - metadata: object
  Response:
    - surveyId: string
    - survey: PerceptionSurvey

POST /v1/communities/perception/media-monitoring
  Request:
    - facilityId: string (required)
    - monitoringPeriod:
        startDate: ISO8601
        endDate: ISO8601
    - sources: array of
        - type: newspaper|tv|radio|social-media|blog
          name: string
          reach: number (audience)
    - mentions: array of
        - date: ISO8601
          source: string
          headline: string
          sentiment: positive|neutral|negative
          topics: array
          excerpt: string
          url: string
          reach: number
    - analytics:
        totalMentions: number
        sentimentDistribution:
            positive: number (percentage)
            neutral: number
            negative: number
        topTopics: array
        trendingIssues: array
        influencers: array
    - risks:
        - issue: string
          severity: high|medium|low
          responseRequired: boolean
    - metadata: object
  Response:
    - reportId: string
    - report: MediaMonitoringReport

GET /v1/communities/social-license/dashboard
  Query:
    - facilityId: string (required)
  Response:
    - dashboard:
        currentSLOLevel: string
        sloScore: number (1-5)
        trend: improving|stable|declining
        riskLevel: high|medium|low
        keyIndicators:
            stakeholderSatisfaction: number
            trustScore: number
            grievanceRate: number
            mediasentiment: number
            communitySupportLevel: number
        recentIncidents: array
        actionItems: array
```

### 1.3 Business Rules

#### Community Stakeholder Rules
1. Indigenous communities must be flagged with `indigenousStatus.isIndigenous = true`
2. FPIC required automatically if operations on/near traditional lands
3. Stakeholder influence/interest classification required for prioritization
4. Proximity calculated automatically from facility location
5. Representatives must have valid contact information
6. Vulnerable groups require additional safeguards in all interactions

#### Community Engagement Rules
1. FPIC processes must follow all four stages: information → consultation → negotiation → consent
2. Engagement with indigenous communities requires cultural protocols
3. Translation services mandatory if primary language differs from company language
4. Minimum 30-day notice for major consultations
5. Engagement effectiveness tracked with participation, satisfaction, action completion
6. Materials must be culturally appropriate and accessible
7. Feedback must be categorized and tracked for response

#### Grievance Mechanism Rules
1. All grievances must be acknowledged within 3 business days
2. Critical grievances require immediate escalation
3. Anonymous grievances allowed but may limit investigation
4. Grievance resolution must track complainant satisfaction
5. SLA for resolution: Critical (7 days), High (14 days), Medium (30 days), Low (60 days)
6. Retaliation strictly prohibited - whistleblower protections mandatory
7. Multi-channel submission required (minimum 3 channels)
8. Grievances auto-escalate if overdue
9. Root cause analysis required for recurring issues
10. Remedy provision required for valid grievances

#### Local Economic Impact Rules
1. Local procurement percentage calculated as (local spend / total spend) × 100
2. "Local" definition must be documented (radius or jurisdiction)
3. Local employment calculated at facility level, not organizational
4. Tax contribution tracked by jurisdiction and tax type
5. Infrastructure investments must track beneficiaries
6. Economic multiplier effects use standard industry multipliers
7. Reporting period aligns with fiscal year

#### Community Investment Rules
1. All investments categorized using LBG Framework
2. In-kind contributions valued at fair market value
3. Volunteer time valued at average hourly wage or skills-based rate
4. SDG alignment required for all programs
5. Impact measurement required for investments > threshold
6. Partners' contributions tracked separately
7. Programs must have defined objectives and metrics
8. SROI (Social Return on Investment) calculated for major programs
9. Investment portfolio reviewed quarterly
10. Community needs assessment required before new programs

#### Indigenous Rights Rules
1. FPIC required for any activity affecting indigenous lands, resources, or rights
2. Cultural heritage impact assessments mandatory before operations
3. Sacred sites receive highest protection level
4. Benefit-sharing agreements required for resource extraction on traditional lands
5. Indigenous consent can be withdrawn - monitoring required
6. Traditional knowledge IP rights respected
7. Cultural protocols documented and followed
8. Indigenous representatives chosen by community (not company)
9. UNDRIP compliance required for all indigenous interactions
10. Annual compliance reporting to indigenous communities

#### Resettlement Rules
1. Involuntary resettlement is last resort - avoidance preferred
2. Replacement cost for assets (not depreciated value)
3. Vulnerable groups receive additional assistance
4. Livelihood restoration to at least baseline levels
5. Resettlement sites must meet or exceed previous living standards
6. Community infrastructure provided (water, sanitation, schools, health)
7. Cultural sites and practices preserved in resettlement
8. Post-resettlement monitoring minimum 5 years
9. Grievance mechanism specific to resettlement
10. IFC PS5 compliance mandatory

#### Health & Safety Rules
1. Community health impact assessments required before operations
2. Monitoring frequency based on risk level
3. Exceedances trigger immediate notification and corrective action
4. Health complaints investigated within 48 hours
5. Vulnerable groups (children, elderly, sick) receive priority protection
6. Emergency preparedness plans must include community
7. Community health facilities supported if operations increase burden
8. Baseline health data collected before operations

#### Social License Rules
1. SLO assessments conducted annually minimum
2. Multiple methodologies required for credibility
3. SLO level: withdrawal < acceptance < approval < co-ownership
4. Risk indicators monitored continuously
5. Media sentiment tracked weekly
6. Stakeholder perception surveys biannually
7. SLO decline triggers immediate engagement plan
8. Board-level reporting for SLO at "withdrawal" or "acceptance" levels

### 1.4 Error Handling

```yaml
Error Responses:
  400 Bad Request:
    - INVALID_STAKEHOLDER_CLASSIFICATION
    - INVALID_GRIEVANCE_SEVERITY
    - MISSING_FPIC_DOCUMENTATION
    - INVALID_BENEFIT_SHARING_TERMS
    - INVALID_RESETTLEMENT_ENTITLEMENT
    - INCOMPLETE_CULTURAL_HERITAGE_ASSESSMENT

  403 Forbidden:
    - INSUFFICIENT_COMMUNITY_PERMISSIONS
    - FPIC_NOT_OBTAINED
    - CULTURAL_PROTOCOL_VIOLATION
    - RETALIATION_RISK_DETECTED

  404 Not Found:
    - COMMUNITY_STAKEHOLDER_NOT_FOUND
    - ENGAGEMENT_NOT_FOUND
    - GRIEVANCE_NOT_FOUND
    - INDIGENOUS_COMMUNITY_NOT_FOUND
    - RESETTLEMENT_PLAN_NOT_FOUND

  409 Conflict:
    - DUPLICATE_GRIEVANCE_SUBMISSION
    - FPIC_ALREADY_IN_PROGRESS
    - CONFLICTING_BENEFIT_AGREEMENT
    - OVERLAPPING_RESETTLEMENT_AREA

  422 Unprocessable Entity:
    - FPIC_STAGE_SEQUENCE_VIOLATION
    - INCOMPLETE_GRIEVANCE_INVESTIGATION
    - INVALID_COMPENSATION_CALCULATION
    - UNRESOLVED_CULTURAL_HERITAGE_IMPACT
    - LIVELIHOOD_NOT_RESTORED
    - SLO_THRESHOLD_BREACH

  451 Unavailable For Legal Reasons:
    - INDIGENOUS_CONSENT_WITHHELD
    - COURT_INJUNCTION_ACTIVE
    - REGULATORY_STOP_ORDER
```

## 2. Data Model

### 2.1 MongoDB Collections

#### community_stakeholders Collection
```javascript
{
  _id: ObjectId,
  stakeholderId: String (UUID, indexed),
  organizationId: String (indexed, ref),
  facilityId: String (indexed, ref, optional),

  name: String (indexed),
  type: String (indigenous|local-government|ngo|cbo|vulnerable-group|general),

  classification: {
    influence: String (high|medium|low),
    interest: String (high|medium|low),
    vulnerability: String (high|medium|low),
    priority: String (calculated: high-interest + high-influence)
  },

  demographics: {
    population: Number,
    households: Number,
    averageIncome: Number,
    primaryLanguage: String,
    culturalGroup: String,
    indigenousPercentage: Number,
    ageDistribution: Object,
    genderDistribution: Object
  },

  location: {
    coordinates: {
      lat: Number,
      lng: Number
    },
    proximity: Number (km from facility),
    region: String,
    jurisdiction: String
  },

  representatives: [{
    name: String,
    role: String (chief|elder|liaison|spokesperson|elected-representative),
    contact: {
      phone: String,
      email: String,
      address: String
    },
    validFrom: Date,
    validTo: Date
  }],

  indigenousStatus: {
    isIndigenous: Boolean (indexed),
    tribe: String,
    language: String,
    traditionalLands: Boolean,
    fpicRequired: Boolean,
    culturalPractices: [String],
    vulnerabilities: [String]
  },

  relationshipHistory: {
    firstEngagement: Date,
    engagementCount: Number,
    lastEngagement: Date,
    relationshipQuality: String (strong|developing|strained|adversarial),
    keyIssues: [String],
    agreements: [String]
  },

  contactPreferences: {
    preferredChannel: String (in-person|phone|email|mail|community-meeting),
    languagePreference: String,
    culturalConsiderations: [String],
    bestContactTime: String
  },

  status: String (active|inactive|archived),

  metadata: {
    createdAt: Date (indexed),
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    deletedAt: Date,
    source: String
  }
}

// Indexes
- stakeholderId: unique
- organizationId: 1, facilityId: 1
- type: 1
- indigenousStatus.isIndigenous: 1
- location.coordinates: 2dsphere (geospatial)
- classification.priority: 1
- name: text
```

#### community_engagements Collection
```javascript
{
  _id: ObjectId,
  engagementId: String (UUID, indexed),
  stakeholderId: String (indexed, ref),
  facilityId: String (indexed, ref),
  organizationId: String (indexed, ref),

  type: String (consultation|town-hall|survey|fpic|meeting|workshop|focus-group),
  purpose: String,
  date: Date (indexed),
  location: String,

  participants: {
    expected: Number,
    actual: Number,
    demographics: {
      gender: Object,
      age: Object,
      vulnerableGroups: Number
    },
    representativePresent: Boolean,
    quorumMet: Boolean
  },

  agenda: {
    topics: [String],
    duration: Number (minutes),
    facilitator: String
  },

  materials: [{
    type: String (presentation|document|video|brochure),
    title: String,
    url: String (S3),
    language: String,
    distributed: Boolean,
    distributionCount: Number
  }],

  isFPIC: Boolean (indexed),
  fpicDetails: {
    stage: String (information|consultation|agreement|implementation),
    fpicProcessId: String (ref),
    consensusReached: Boolean,
    concerns: [{
      category: String,
      description: String,
      severity: String,
      responsePlan: String
    }],
    agreements: [{
      item: String,
      responsibleParty: String,
      timeline: String,
      status: String
    }],
    attendance: {
      elders: Number,
      women: Number,
      youth: Number,
      total: Number
    }
  },

  outcomes: {
    feedback: [{
      feedbackId: String,
      type: String (concern|suggestion|complaint|question|praise),
      content: String,
      severity: String,
      theme: String,
      respondent: Object
    }],
    actionItems: [{
      description: String,
      owner: String,
      dueDate: Date,
      status: String (pending|in-progress|completed),
      completedDate: Date
    }],
    followUpRequired: Boolean,
    followUpDate: Date,
    minutesUrl: String (S3),
    recordingUrl: String (S3, if consented)
  },

  culturalConsiderations: {
    translation: Boolean,
    languages: [String],
    culturalProtocols: [String],
    ceremonyPerformed: Boolean,
    sensitiveTopics: [String],
    photographyAllowed: Boolean
  },

  effectiveness: {
    participationRate: Number (actual/expected %),
    representativeness: Number (1-5 score),
    satisfactionScore: Number (1-5),
    actionItemCompletion: Number (%),
    culturalAppropriateness: Number (1-5)
  },

  status: String (planned|completed|cancelled|postponed),

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    facilitators: [String],
    observers: [String],
    cost: Number
  }
}

// Indexes
- engagementId: unique
- stakeholderId: 1, date: -1
- facilityId: 1, date: -1
- isFPIC: 1
- type: 1
- date: 1
- status: 1
```

#### community_grievances Collection
```javascript
{
  _id: ObjectId,
  grievanceId: String (UUID, indexed),
  grievanceNumber: String (user-friendly, indexed, unique),
  stakeholderId: String (indexed, ref, nullable for anonymous),
  facilityId: String (indexed, ref),

  isAnonymous: Boolean (indexed),
  complainant: {
    name: String,
    contact: {
      phone: String,
      email: String,
      address: String,
      preferredMethod: String
    },
    demographics: {
      gender: String,
      age: Number,
      vulnerableGroup: Boolean,
      vulnerabilityType: String
    },
    safeContactVerified: Boolean
  },

  submission: {
    channel: String (hotline|email|in-person|online|mail|third-party),
    submittedDate: Date (indexed),
    submittedBy: String,
    receivedBy: String,
    acknowledgedDate: Date,
    acknowledgedBy: String
  },

  grievanceType: String (environmental|social|economic|cultural|safety|resettlement|other),
  category: String (noise|dust|traffic|employment|land|water|health|safety|cultural|compensation),
  description: String (full-text indexed),
  severity: String (critical|high|medium|low),

  incidentDetails: {
    locationDetails: String,
    dateOfIncident: Date,
    timeOfIncident: String,
    witnesses: [{
      name: String,
      contact: String
    }],
    previousOccurrences: Boolean,
    ongoingIssue: Boolean
  },

  evidence: [{
    type: String (photo|document|video|audio),
    url: String (S3),
    description: String,
    uploadedDate: Date
  }],

  desiredOutcome: String,
  languagePreference: String,

  investigation: {
    assignedTo: String (userId or team),
    assignedDate: Date,
    investigator: String,
    investigationStarted: Date,
    investigationCompleted: Date,
    findings: String,
    rootCause: String,
    contributingFactors: [String],
    evidence: [{
      type: String,
      url: String,
      description: String
    }],
    recommendations: [String]
  },

  resolution: {
    resolutionType: String (corrective-action|compensation|mediation|explanation|escalation|dismissed),
    resolutionDetails: String,
    remedyProvided: {
      type: String (financial|in-kind|policy-change|service|apology),
      value: Number,
      description: String,
      deliveryDate: Date,
      delivered: Boolean
    },
    correctiveActions: [{
      action: String,
      responsible: String,
      dueDate: Date,
      completedDate: Date,
      status: String
    }],
    resolvedBy: String,
    resolvedDate: Date
  },

  closure: {
    closureReason: String (resolved|withdrawn|duplicate|out-of-scope),
    closureNotes: String,
    closedBy: String,
    closedDate: Date,
    complainantSatisfied: Boolean,
    satisfactionScore: Number (1-5),
    followUpRequired: Boolean,
    followUpDate: Date,
    followUpCompleted: Boolean
  },

  sla: {
    acknowledgementDue: Date,
    acknowledgementMet: Boolean,
    resolutionDue: Date,
    resolutionMet: Boolean,
    overdueDays: Number,
    escalationTriggered: Boolean,
    escalationDate: Date,
    escalatedTo: String
  },

  retaliationProtection: {
    riskAssessed: Boolean,
    riskLevel: String,
    protectionMeasures: [String],
    monitoringRequired: Boolean,
    incidentReported: Boolean
  },

  status: String (submitted|acknowledged|investigating|resolved|closed|escalated|withdrawn),

  relatedGrievances: [String] (grievanceIds),
  linkedToIncident: String (incident ID if related to safety/environmental incident),

  metadata: {
    createdAt: Date (indexed),
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    cost: Number (investigation + resolution),
    internalCommunications: [{
      date: Date,
      from: String,
      to: String,
      subject: String,
      notes: String
    }]
  }
}

// Indexes
- grievanceId: unique
- grievanceNumber: unique
- facilityId: 1, submittedDate: -1
- stakeholderId: 1
- status: 1
- severity: 1
- sla.resolutionDue: 1
- isAnonymous: 1
- description: text (full-text search)
```

#### local_economic_impact Collection
```javascript
{
  _id: ObjectId,
  recordId: String (UUID, indexed),
  facilityId: String (indexed, ref),
  organizationId: String (indexed, ref),

  reportingPeriod: {
    year: Number (indexed),
    quarter: Number,
    startDate: Date,
    endDate: Date
  },

  localProcurement: {
    totalProcurement: Number,
    localProcurement: Number,
    percentage: Number,
    numberOfSuppliers: Number,
    suppliers: [{
      supplierId: String,
      name: String,
      location: String,
      isLocal: Boolean,
      spendAmount: Number,
      category: String
    }],
    localDefinition: {
      radiusKm: Number,
      jurisdictionLevel: String
    }
  },

  localEmployment: {
    totalEmployees: Number,
    localEmployees: Number,
    percentage: Number,
    byLevel: {
      seniorManagement: Number,
      middleManagement: Number,
      supervisors: Number,
      workers: Number
    },
    byGender: Object,
    localDefinition: String,
    turnoverRate: Number
  },

  payrollContribution: {
    totalPayroll: Number,
    localPayroll: Number,
    averageLocalWage: Number,
    estimatedLocalSpend: Number (multiplier effect),
    multiplier: Number
  },

  taxContribution: {
    propertyTax: Number,
    businessTax: Number,
    employmentTax: Number,
    salesTax: Number,
    otherTaxes: [{
      type: String,
      amount: Number
    }],
    total: Number,
    byJurisdiction: [{
      jurisdiction: String,
      level: String (municipal|regional|provincial|national),
      amount: Number
    }]
  },

  infrastructureInvestments: [{
    projectName: String,
    category: String,
    amount: Number,
    beneficiaries: Number,
    completionDate: Date
  }],

  economicFootprint: {
    directImpact: Number,
    indirectImpact: Number,
    inducedImpact: Number,
    totalImpact: Number,
    multiplier: Number,
    methodology: String
  },

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    verifiedBy: String,
    verificationDate: Date,
    dataSource: String,
    notes: String
  }
}

// Indexes
- recordId: unique
- facilityId: 1, reportingPeriod.year: -1
- organizationId: 1, reportingPeriod.year: -1
```

#### community_investments Collection
```javascript
{
  _id: ObjectId,
  investmentId: String (UUID, indexed),
  organizationId: String (indexed, ref),
  facilityId: String (indexed, ref, optional),

  programName: String (indexed),
  category: String (education|health|infrastructure|livelihoods|environment|culture|sports),
  investmentType: String (cash|in-kind|volunteer-time|management-costs),
  lbgCategory: String (charitable-donation|community-investment|commercial-initiative),

  amount: {
    value: Number,
    currency: String,
    calculationMethod: String (for in-kind/volunteer)
  },

  period: {
    startDate: Date (indexed),
    endDate: Date,
    duration: Number (months)
  },

  partners: [{
    type: String (ngo|cbo|government|academic|business),
    name: String,
    role: String,
    contribution: Number
  }],

  targetBeneficiaries: {
    communityGroups: [String],
    estimatedCount: Number,
    demographics: {
      children: Number,
      youth: Number,
      women: Number,
      elderly: Number,
      vulnerable: Number
    }
  },

  objectives: [String],
  activities: [String],
  sdgAlignment: [Number] (1-17),

  impactMeasurement: [{
    reportingPeriod: Date,
    actualBeneficiaries: {
      count: Number,
      demographics: Object,
      satisfaction: Number (1-5)
    },
    outcomes: [{
      indicator: String,
      baseline: Number,
      target: Number,
      actual: Number,
      unit: String,
      percentAchieved: Number
    }],
    outputs: [{
      description: String,
      quantity: Number,
      unit: String
    }],
    stories: [{
      title: String,
      content: String,
      media: [String] (S3 URLs)
    }],
    challenges: [String],
    lessonsLearned: [String],
    sdgProgress: [{
      goal: Number,
      contribution: String
    }],
    sroi: {
      totalInvestment: Number,
      socialValue: Number,
      ratio: Number,
      methodology: String
    }
  }],

  status: String (planned|active|completed|suspended|cancelled),

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    completedDate: Date,
    totalInvested: Number,
    totalBeneficiaries: Number
  }
}

// Indexes
- investmentId: unique
- organizationId: 1, facilityId: 1
- category: 1
- lbgCategory: 1
- period.startDate: 1
- sdgAlignment: 1
- status: 1
```

#### volunteer_activities Collection
```javascript
{
  _id: ObjectId,
  activityId: String (UUID, indexed),
  organizationId: String (indexed, ref),
  facilityId: String (indexed, ref, optional),

  activityName: String,
  activityDate: Date (indexed),
  category: String (skills-based|hands-on|board-service|pro-bono),
  cause: String (education|health|environment|community-development|disaster-relief),

  volunteers: [{
    employeeId: String,
    name: String,
    hours: Number,
    role: String,
    skillsUsed: [String]
  }],

  totalHours: Number,
  totalVolunteers: Number,

  beneficiaryOrganization: {
    name: String,
    type: String (ngo|cbo|school|health-facility),
    contact: Object
  },

  impact: {
    description: String,
    beneficiariesReached: Number,
    measurableOutcome: String
  },

  estimatedValue: {
    hourlyRate: Number,
    totalValue: Number
  },

  metadata: {
    createdAt: Date,
    createdBy: String,
    organizer: String,
    photos: [String] (S3 URLs)
  }
}

// Indexes
- activityId: unique
- organizationId: 1, activityDate: -1
- facilityId: 1, activityDate: -1
- category: 1
- volunteers.employeeId: 1
```

#### indigenous_communities Collection
```javascript
{
  _id: ObjectId,
  indigenousCommunityId: String (UUID, indexed),
  organizationId: String (indexed, ref),
  facilityId: String (indexed, ref),

  communityName: String (indexed),
  tribe: String,
  language: String,
  population: Number,

  traditionalTerritory: {
    boundaries: Object (GeoJSON),
    areaHectares: Number,
    overlapsWithOperations: Boolean,
    overlapAreaHectares: Number,
    significantSites: [{
      name: String,
      type: String,
      coordinates: Object,
      restrictions: String
    }]
  },

  culturalSignificance: {
    sacredSites: [{
      name: String,
      location: { lat: Number, lng: Number },
      type: String (burial|ceremonial|historical|natural|hunting|gathering),
      accessRestrictions: String,
      bufferZone: Number (meters),
      protectionStatus: String
    }],
    culturalPractices: [String],
    traditionalKnowledge: [{
      category: String,
      description: String,
      ipProtection: String,
      sharingRestrictions: String
    }],
    culturalCalendar: [{
      event: String,
      period: String,
      operationalRestrictions: String
    }]
  },

  representatives: [{
    name: String,
    role: String (chief|elder|liaison|spokesperson|council-member),
    contact: Object,
    appointedDate: Date,
    term: String
  }],

  governanceStructure: {
    type: String (traditional|elected|hybrid),
    decisionMakingProcess: String,
    consensusRequired: Boolean,
    quorum: Number
  },

  fpicStatus: {
    required: Boolean,
    processesCompleted: Number,
    activeProcesses: Number,
    consensusReached: Boolean,
    outstandingIssues: [String]
  },

  benefitSharing: [{
    agreementId: String,
    type: String,
    startDate: Date,
    status: String
  }],

  vulnerabilities: [String],
  historicalImpacts: [String],

  relationshipQuality: String (strong|developing|strained|adversarial),
  relationshipHistory: {
    firstContact: Date,
    keyMilestones: [{
      date: Date,
      event: String,
      impact: String
    }],
    grievances: Number,
    agreements: Number
  },

  economicParticipation: {
    employment: Number,
    procurementSpend: Number,
    businessPartnerships: Number
  },

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    updatedBy: String,
    dataSource: String,
    verifiedBy: String,
    lastConsultation: Date
  }
}

// Indexes
- indigenousCommunityId: unique
- organizationId: 1, facilityId: 1
- communityName: text
- traditionalTerritory.boundaries: 2dsphere (geospatial)
- fpicStatus.required: 1
```

#### fpic_processes Collection
```javascript
{
  _id: ObjectId,
  fpicProcessId: String (UUID, indexed),
  indigenousCommunityId: String (indexed, ref),
  facilityId: String (indexed, ref),

  projectName: String,
  projectDescription: String,
  projectType: String (exploration|development|operations|expansion|closure),

  potentialImpacts: [{
    category: String (land|water|air|culture|economy|health|rights|social),
    description: String,
    severity: String (major|moderate|minor),
    duration: String (permanent|long-term|temporary),
    mitigation: String,
    residualImpact: String
  }],

  fpicStages: {
    information: {
      status: String (not-started|in-progress|completed),
      activities: [{
        activity: String,
        date: Date,
        participants: Number,
        materialsProvided: [String]
      }],
      completedDate: Date,
      communityUnderstanding: Boolean
    },
    consultation: {
      status: String,
      meetingsHeld: Number,
      participantsCount: Number,
      consultationDates: [Date],
      feedbackReceived: [{
        theme: String,
        concern: String,
        companyResponse: String
      }],
      completedDate: Date
    },
    negotiation: {
      status: String,
      negotiationRounds: Number,
      agreementsReached: [{
        item: String,
        terms: String,
        documentUrl: String
      }],
      conditionsSet: [{
        condition: String,
        responsible: String,
        timeline: String
      }],
      disputesResolved: [{
        issue: String,
        resolution: String
      }],
      completedDate: Date
    },
    consent: {
      status: String (pending|granted|withheld|conditional),
      consentDate: Date,
      consentEvidence: String (S3 URL - signed document/minutes),
      consentType: String (full|conditional|phased),
      conditions: [{
        condition: String,
        dueDate: Date,
        status: String,
        verificationMethod: String
      }],
      withdrawalProvisions: String,
      reviewFrequency: String
    }
  },

  culturalProtocols: {
    languageUsed: [String],
    translationProvided: Boolean,
    culturalAdvisors: [{
      name: String,
      role: String,
      affiliation: String
    }],
    ceremonyRespected: Boolean,
    ceremonies: [String],
    protocolsFollowed: [String],
    culturalSensitivity: String
  },

  stakeholderParticipation: {
    elders: Number,
    women: Number,
    youth: Number,
    totalParticipants: Number,
    representativeness: Number (percentage of community),
    vulnerableGroupsIncluded: Boolean
  },

  documentation: [{
    type: String (minutes|agreement|evidence|photo|video|signed-consent),
    title: String,
    url: String (S3),
    date: Date,
    language: String
  }],

  monitoring: {
    monitoringRequired: Boolean,
    frequency: String,
    indicators: [String],
    nextReview: Date,
    consentStatus: String (active|suspended|withdrawn)
  },

  overallStatus: String (in-progress|consent-granted|consent-withheld|suspended),

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    facilitator: String,
    cost: Number,
    duration: Number (days)
  }
}

// Indexes
- fpicProcessId: unique
- indigenousCommunityId: 1
- facilityId: 1
- fpicStages.consent.status: 1
- overallStatus: 1
```

#### benefit_sharing_agreements Collection
```javascript
{
  _id: ObjectId,
  agreementId: String (UUID, indexed),
  indigenousCommunityId: String (indexed, ref),
  organizationId: String (indexed, ref),
  facilityId: String (indexed, ref),

  agreementName: String,
  agreementType: String (revenue-sharing|employment|business-opportunity|infrastructure|capacity-building|hybrid),
  agreementDate: Date,

  duration: {
    startDate: Date,
    endDate: Date,
    renewalOption: Boolean,
    reviewFrequency: String (annual|biannual|as-needed)
  },

  benefits: [{
    benefitId: String,
    type: String (financial|employment|business|infrastructure|services|cultural|environmental),
    description: String,
    value: Number,
    unit: String,
    deliverySchedule: String,
    conditions: [String],
    deliveryRecords: [{
      date: Date,
      amount: Number,
      delivered: Boolean,
      evidence: String
    }]
  }],

  financialTerms: {
    revenueSharePercentage: Number,
    royaltyRate: Number,
    fixedPayments: [{
      description: String,
      amount: Number,
      frequency: String
    }],
    totalCommitted: Number,
    totalDisbursed: Number
  },

  employmentCommitments: {
    targetPercentage: Number,
    targetCount: Number,
    actualCount: Number,
    byLevel: Object,
    trainingProvided: Boolean
  },

  businessOpportunities: {
    procurementTargets: Number,
    contractsAwarded: Number,
    capacityBuildingProvided: Boolean
  },

  performanceMetrics: [{
    indicator: String,
    target: Number,
    actual: Number,
    unit: String,
    status: String (on-track|at-risk|off-track)
  }],

  governanceStructure: {
    jointCommittee: Boolean,
    committeeName: String,
    communityRepresentatives: [{
      name: String,
      role: String
    }],
    companyRepresentatives: [{
      name: String,
      role: String
    }],
    meetingFrequency: String,
    decisionMakingProcess: String,
    quorum: String
  },

  disputeResolution: {
    mechanism: String,
    escalationPath: [String],
    mediatorApproved: Boolean,
    grievanceProcedure: String
  },

  monitoring: {
    reportingFrequency: String,
    lastReport: Date,
    nextReport: Date,
    auditRequired: Boolean,
    lastAudit: Date
  },

  documentation: {
    agreementUrl: String (S3),
    signedCopy: String (S3),
    annexes: [{
      title: String,
      url: String
    }],
    amendments: [{
      date: Date,
      description: String,
      url: String
    }]
  },

  status: String (draft|active|under-review|amended|completed|terminated),
  terminationClause: String,

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    signedBy: Object,
    witnesses: [String],
    externalAdvisors: [String]
  }
}

// Indexes
- agreementId: unique
- indigenousCommunityId: 1
- facilityId: 1
- status: 1
- duration.endDate: 1
```

#### cultural_heritage_assessments Collection
```javascript
{
  _id: ObjectId,
  assessmentId: String (UUID, indexed),
  indigenousCommunityId: String (indexed, ref),
  facilityId: String (indexed, ref),

  assessmentType: String (impact-assessment|monitoring|protection-plan|emergency-response),
  assessmentDate: Date (indexed),
  assessor: String,

  culturalAssets: [{
    assetId: String,
    type: String (sacred-site|artifact|practice|knowledge|language|landscape|structure),
    name: String,
    location: Object (GeoJSON),
    description: String,
    significance: String (critical|high|moderate),
    culturalValue: String,
    vulnerabilityToOperations: String (high|medium|low|none),
    currentCondition: String,
    owners: [String] (community members/groups)
  }],

  impacts: [{
    impactId: String,
    assetId: String,
    impactType: String (physical|visual|auditory|access|spiritual|social),
    description: String,
    severity: String (major|moderate|minor|negligible),
    likelihood: String (certain|likely|possible|unlikely),
    riskRating: String (calculated),
    duration: String (permanent|long-term|temporary),
    reversibility: String
  }],

  mitigationMeasures: [{
    measureId: String,
    impactId: String,
    measure: String (avoidance|minimization|restoration|compensation|offset),
    description: String,
    responsibility: String,
    timeline: String,
    cost: Number,
    status: String (planned|implementing|completed),
    effectiveness: String
  }],

  protectionMeasures: [{
    assetId: String,
    measure: String,
    bufferZone: Number (meters),
    accessRestrictions: String,
    monitoringProtocol: String,
    emergencyProcedures: String
  }],

  monitoringPlan: {
    frequency: String,
    indicators: [String],
    responsibleParty: String,
    reportingSchedule: String,
    communityInvolvement: String
  },

  consultationRecord: {
    communityConsulted: Boolean,
    consultationDate: Date,
    participantsCount: Number,
    fpicObtained: Boolean,
    consentEvidence: String,
    concerns: [String],
    agreements: [String],
    conditions: [String]
  },

  traditionalKnowledgeUsed: {
    knowledgeProvided: Boolean,
    knowledgeHolders: [String],
    ipProtection: String,
    sharingAgreement: String,
    acknowledgement: String
  },

  recommendations: [String],
  managementPlan: String (URL to detailed plan),

  status: String (draft|under-review|approved|implementing|completed),

  metadata: {
    createdAt: Date,
    createdBy: String,
    reviewedBy: String,
    approvedBy: String,
    approvalDate: Date,
    cost: Number,
    externalExperts: [String]
  }
}

// Indexes
- assessmentId: unique
- indigenousCommunityId: 1
- facilityId: 1
- assessmentDate: -1
- culturalAssets.location: 2dsphere
```

#### resettlement_action_plans Collection
```javascript
{
  _id: ObjectId,
  rapId: String (UUID, indexed),
  organizationId: String (indexed, ref),
  facilityId: String (indexed, ref),

  projectName: String,
  resettlementType: String (physical|economic|both),

  affectedPopulation: {
    households: Number,
    persons: Number,
    vulnerableGroups: [{
      groupType: String (indigenous|elderly|disabled|female-headed|landless|tenant),
      count: Number,
      specificNeeds: [String]
    }],
    indigenousHouseholds: Number
  },

  landAcquisition: {
    totalAreaHa: Number,
    acquisitionType: String (voluntary|involuntary|combination),
    compensationBasis: String (replacement-cost|market-value|negotiated),
    landUse: Object,
    currentOwnership: Object
  },

  socioeconomicBaseline: {
    surveyDate: Date,
    householdsSurveyed: Number,
    demographics: Object,
    livelihoodProfiles: [{
      type: String,
      households: Number,
      averageIncome: Number
    }],
    incomeLevels: Object,
    assetInventory: Object,
    vulnerabilityAnalysis: String
  },

  entitlementMatrix: [{
    impactType: String (land|structure|crops|business|employment),
    eligibility: String (owner|tenant|squatter|employee|sharecropper),
    compensation: String,
    assistanceMeasures: [String]
  }],

  resettlementSite: {
    location: String,
    coordinates: { lat: Number, lng: Number },
    areaHa: Number,
    housingUnits: Number,
    housingType: String,
    infrastructure: [String],
    servicesAvailable: [String],
    distanceFromOriginal: Number (km),
    accessibility: String,
    environmentalSuitability: String
  },

  implementationSchedule: [{
    stage: String,
    startDate: Date,
    endDate: Date,
    activities: [String],
    milestones: [String],
    status: String
  }],

  budget: {
    totalCost: Number,
    byCategory: {
      compensation: Number,
      resettlementSite: Number,
      livelihoodRestoration: Number,
      monitoring: Number,
      management: Number,
      contingency: Number
    },
    fundingSource: String,
    disbursementSchedule: [{
      item: String,
      amount: Number,
      date: Date,
      disbursed: Boolean
    }]
  },

  consultationRecord: {
    meetingsHeld: Number,
    participantsTotal: Number,
    issuesRaised: [String],
    agreementsReached: [String],
    grievances: Number
  },

  grievanceMechanism: {
    channels: [String],
    process: String,
    responsibleOfficer: String,
    sla: String
  },

  monitoringPlan: {
    frequency: String,
    indicators: [String],
    durationYears: Number,
    internalMonitoring: Boolean,
    externalMonitoring: Boolean,
    participatoryMonitoring: Boolean
  },

  status: String (planning|consultation|approval|implementation|monitoring|completed),
  ifcPS5Compliance: Boolean,

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    approvedBy: String,
    approvalDate: Date,
    externalConsultant: String,
    documentUrl: String (S3)
  }
}

// Indexes
- rapId: unique
- facilityId: 1
- status: 1
```

#### resettlement_compensation Collection
```javascript
{
  _id: ObjectId,
  compensationId: String (UUID, indexed),
  rapId: String (indexed, ref),
  householdId: String (indexed),

  householdHead: {
    name: String,
    contact: Object,
    nationalId: String,
    vulnerableStatus: String
  },

  compensationPackage: [{
    category: String (land|structure|crops|trees|business|relocation),
    description: String,
    quantity: Number,
    unit: String,
    unitValue: Number,
    totalValue: Number,
    basis: String
  }],

  totalCashCompensation: Number,

  inKindCompensation: {
    replacementLand: {
      areaHa: Number,
      location: String,
      quality: String,
      titleProvided: Boolean
    },
    replacementHouse: {
      provided: Boolean,
      type: String,
      sizeSqm: Number,
      rooms: Number,
      value: Number
    },
    otherAssets: [{
      asset: String,
      quantity: Number,
      value: Number
    }]
  },

  additionalAssistance: {
    movingAllowance: Number,
    transitionalSupport: {
      amount: Number,
      durationMonths: Number
    },
    livelihoodSupport: Number,
    vulnerableSupport: Number,
    childrenEducation: Number
  },

  paymentSchedule: [{
    installment: Number,
    description: String,
    amount: Number,
    dueDate: Date,
    paidDate: Date,
    paymentMethod: String,
    receiptNumber: String,
    status: String (pending|paid|overdue)
  }],

  totalPackageValue: Number,
  totalDisbursed: Number,
  outstandingBalance: Number,

  agreementSigned: Boolean,
  agreementDate: Date,
  agreementUrl: String (S3),

  grievances: [{
    grievanceId: String,
    issue: String,
    status: String
  }],

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    verifiedBy: String
  }
}

// Indexes
- compensationId: unique
- rapId: 1, householdId: 1
- paymentSchedule.status: 1
```

#### livelihood_restoration_programs Collection
```javascript
{
  _id: ObjectId,
  lrpId: String (UUID, indexed),
  rapId: String (indexed, ref),
  householdId: String (indexed),

  baselineLivelihood: {
    primarySource: String,
    secondarySources: [String],
    monthlyIncome: Number,
    assets: Object,
    skills: [String],
    dependencies: [String]
  },

  restorationStrategy: {
    type: String (land-based|wage-employment|self-employment|combination),
    description: String,
    rationale: String,
    householdChoice: Boolean
  },

  supportProvided: [{
    type: String (land|training|job-placement|microfinance|equipment|extension-services),
    description: String,
    value: Number,
    provider: String,
    deliveryDate: Date,
    delivered: Boolean
  }],

  training: [{
    program: String,
    duration: Number (hours),
    completionDate: Date,
    certification: Boolean,
    provider: String
  }],

  monitoring: [{
    period: Number (months post-resettlement),
    surveyDate: Date,
    currentLivelihood: String,
    monthlyIncome: Number,
    incomeChange: Number (percentage),
    assetsAcquired: [String],
    challenges: [String],
    additionalSupportNeeded: String
  }],

  outcomes: {
    newLivelihood: String,
    currentMonthlyIncome: Number,
    incomeRestored: Boolean,
    incomeImproved: Boolean,
    livelihoodSustainable: Boolean,
    householdSatisfaction: Number (1-5)
  },

  status: String (planning|implementing|monitoring|successful|at-risk),

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    caseworker: String
  }
}

// Indexes
- lrpId: unique
- rapId: 1
- householdId: 1
- status: 1
```

#### community_health_safety_assessments Collection
```javascript
{
  _id: ObjectId,
  assessmentId: String (UUID, indexed),
  facilityId: String (indexed, ref),

  assessmentType: String (chia|esia|hia|baseline),
  assessmentDate: Date (indexed),

  affectedCommunities: [String] (stakeholder IDs),
  studyArea: Object (GeoJSON),

  healthIssues: [{
    issueId: String,
    category: String (air-quality|water-quality|noise|vibration|dust|odor|disease|traffic|hazmat|vector),
    description: String,
    baseline: {
      data: Object,
      source: String,
      date: Date
    },
    potentialImpact: String (major|moderate|minor|negligible),
    pathway: String,
    affectedPopulation: Number,
    duration: String
  }],

  vulnerableGroups: [{
    group: String (children|elderly|pregnant-women|chronically-ill|disabled),
    population: Number,
    specificConcerns: [String],
    additionalMitigation: [String]
  }],

  diseaseRisks: [{
    disease: String,
    baselinePrevalence: Number,
    riskFactors: [String],
    preventionMeasures: [String]
  }],

  mitigationMeasures: [{
    healthIssue: String,
    measure: String,
    responsibility: String,
    timeline: String,
    cost: Number,
    effectiveness: String,
    status: String
  }],

  monitoringPlan: {
    parameters: [String],
    locations: [{
      name: String,
      coordinates: Object,
      proximity: Number
    }],
    frequency: String,
    duration: String,
    reportingSchedule: String,
    responsibleParty: String
  },

  emergencyPreparedness: {
    scenarios: [String],
    responsePlans: [String],
    communityAlertSystem: String,
    evacuationPlan: String
  },

  consultationRecord: {
    communitiesConsulted: [String],
    consultationDate: Date,
    concerns: [String],
    agreements: [String]
  },

  recommendations: [String],

  metadata: {
    createdAt: Date,
    createdBy: String,
    assessor: String,
    reviewedBy: String,
    approvalDate: Date
  }
}

// Indexes
- assessmentId: unique
- facilityId: 1, assessmentDate: -1
- assessmentType: 1
```

#### environmental_monitoring_records Collection
```javascript
{
  _id: ObjectId,
  recordId: String (UUID, indexed),
  facilityId: String (indexed, ref),

  monitoringDate: Date (indexed),
  parameter: String (noise|dust|air-quality|water-quality|vibration|odor),

  location: {
    name: String,
    type: String (community-boundary|sensitive-receptor|residential|school|hospital),
    coordinates: { lat: Number, lng: Number },
    proximity: Number (km from facility)
  },

  measurement: {
    value: Number,
    unit: String,
    standard: String (WHO|national|local),
    limit: Number,
    exceedance: Boolean,
    percentOfLimit: Number
  },

  conditions: {
    weather: String,
    temperature: Number,
    windSpeed: Number,
    windDirection: String,
    operationsLevel: String,
    timeOfDay: String
  },

  equipment: {
    type: String,
    model: String,
    serialNumber: String,
    calibrationDate: Date,
    operator: String
  },

  exceedanceResponse: {
    notificationSent: Boolean,
    notifiedParties: [String],
    immediateActions: [String],
    investigationRequired: Boolean,
    rootCause: String
  },

  metadata: {
    createdAt: Date,
    createdBy: String,
    verifiedBy: String,
    reportUrl: String
  }
}

// Indexes
- recordId: unique
- facilityId: 1, monitoringDate: -1
- parameter: 1
- measurement.exceedance: 1
- location.coordinates: 2dsphere
```

#### health_safety_complaints Collection
```javascript
{
  _id: ObjectId,
  complaintId: String (UUID, indexed),
  facilityId: String (indexed, ref),

  complaintDate: Date (indexed),
  complaintType: String (noise|dust|odor|traffic|health-concern|safety-concern|water|air|other),

  complainant: {
    name: String,
    anonymous: Boolean,
    location: String,
    proximity: Number,
    contact: Object
  },

  description: String,
  severity: String (critical|high|medium|low),
  frequency: String (one-time|intermittent|ongoing),

  investigation: {
    investigatedBy: String,
    investigationDate: Date,
    findings: String,
    rootCause: String,
    monitoringData: [String] (recordIds),
    operationsReview: String
  },

  correctiveAction: {
    actions: [{
      action: String,
      responsible: String,
      dueDate: Date,
      completedDate: Date,
      status: String
    }],
    preventiveMeasures: [String]
  },

  followUp: {
    followUpDate: Date,
    complainantContacted: Boolean,
    complainantSatisfied: Boolean,
    issueRecurred: Boolean,
    closureDate: Date
  },

  status: String (submitted|investigating|action-taken|resolved|closed),

  metadata: {
    createdAt: Date,
    createdBy: String,
    updatedAt: Date,
    responseTime: Number (hours)
  }
}

// Indexes
- complaintId: unique
- facilityId: 1, complaintDate: -1
- complaintType: 1
- status: 1
```

#### social_license_assessments Collection
```javascript
{
  _id: ObjectId,
  assessmentId: String (UUID, indexed),
  facilityId: String (indexed, ref),

  assessmentDate: Date (indexed),
  methodology: String (stakeholder-survey|expert-panel|media-analysis|composite),

  stakeholderSegments: [{
    segmentId: String (ref),
    segmentName: String,
    sampleSize: Number,
    responseRate: Number
  }],

  dimensions: [{
    dimension: String (legitimacy|trust|credibility),
    score: Number (1-5),
    indicators: [{
      indicator: String,
      score: Number,
      weight: Number
    }],
    trend: String (improving|stable|declining),
    strengths: [String],
    concerns: [String]
  }],

  overallSLOLevel: String (withdrawal|acceptance|approval|co-ownership),
  overallScore: Number (1-5),

  riskIndicators: [{
    indicator: String (protest|media-criticism|legal-action|political-pressure|petition|boycott),
    severity: String (high|medium|low),
    trend: String (increasing|stable|decreasing),
    evidence: String,
    mitigationPlan: String
  }],

  strengths: [String],
  weaknesses: [String],
  opportunities: [String],
  threats: [String],

  recommendations: [{
    priority: String (high|medium|low),
    recommendation: String,
    responsible: String,
    timeline: String
  }],

  trend: {
    previousScore: Number,
    change: Number,
    changeDirection: String
  },

  metadata: {
    createdAt: Date,
    createdBy: String,
    assessor: String,
    reviewedBy: String,
    cost: Number,
    reportUrl: String
  }
}

// Indexes
- assessmentId: unique
- facilityId: 1, assessmentDate: -1
- overallSLOLevel: 1
```

#### perception_surveys Collection
```javascript
{
  _id: ObjectId,
  surveyId: String (UUID, indexed),
  stakeholderId: String (indexed, ref),
  facilityId: String (indexed, ref),

  surveyDate: Date (indexed),
  methodology: String (in-person|phone|online|focus-group),
  sampleSize: Number,
  responseRate: Number,

  topics: [{
    topic: String (environment|employment|community-investment|communication|safety|trust|reputation),
    questions: [{
      questionId: String,
      question: String,
      type: String (likert|multiple-choice|open-ended),
      responses: Object (response distribution),
      averageScore: Number (1-5)
    }]
  }],

  overallSatisfaction: Number (1-5),
  netPromoterScore: Number (-100 to 100),

  keyFindings: {
    topPositives: [String],
    topConcerns: [String],
    suggestions: [String],
    themes: [String]
  },

  demographics: {
    age: Object (distribution),
    gender: Object,
    proximity: Object (distance from facility),
    lengthOfResidence: Object,
    employmentStatus: Object
  },

  trend: {
    previousScore: Number,
    change: Number,
    significantChanges: [String]
  },

  actionPlan: [{
    issue: String,
    action: String,
    responsible: String,
    dueDate: Date
  }],

  metadata: {
    createdAt: Date,
    createdBy: String,
    surveyFirm: String,
    cost: Number,
    reportUrl: String
  }
}

// Indexes
- surveyId: unique
- stakeholderId: 1, surveyDate: -1
- facilityId: 1, surveyDate: -1
```

#### media_monitoring_reports Collection
```javascript
{
  _id: ObjectId,
  reportId: String (UUID, indexed),
  facilityId: String (indexed, ref),

  monitoringPeriod: {
    startDate: Date (indexed),
    endDate: Date
  },

  sources: [{
    type: String (newspaper|tv|radio|social-media|blog|online-news),
    name: String,
    reach: Number (audience size)
  }],

  mentions: [{
    mentionId: String,
    date: Date,
    source: String,
    sourceType: String,
    headline: String,
    sentiment: String (positive|neutral|negative),
    sentimentScore: Number (-1 to 1),
    topics: [String],
    excerpt: String,
    url: String,
    reach: Number,
    engagement: Number (likes, shares, comments)
  }],

  analytics: {
    totalMentions: Number,
    sentimentDistribution: {
      positive: Number (percentage),
      neutral: Number,
      negative: Number
    },
    topTopics: [{
      topic: String,
      count: Number,
      sentiment: String
    }],
    trendingIssues: [String],
    influencers: [{
      name: String,
      platform: String,
      followers: Number,
      mentions: Number
    }],
    shareOfVoice: Number (vs competitors/industry)
  },

  risks: [{
    issue: String,
    severity: String (high|medium|low),
    reach: Number,
    trend: String,
    responseRequired: Boolean,
    responseStatus: String
  }],

  responseActions: [{
    issue: String,
    action: String,
    responsible: String,
    completedDate: Date
  }],

  metadata: {
    createdAt: Date,
    createdBy: String,
    monitoringTool: String,
    reportUrl: String
  }
}

// Indexes
- reportId: unique
- facilityId: 1, monitoringPeriod.startDate: -1
- mentions.sentiment: 1
- mentions.date: 1
```

### 2.2 Event Publishing

The Community Service publishes events to AWS EventBridge for:
- Community engagement activities and FPIC processes
- Grievance submissions, resolutions, and trends
- Local economic impact milestones
- Community investment program outcomes
- Indigenous rights compliance status
- Resettlement progress and livelihood restoration
- Social License to Operate (SLO) changes
- Community perception shifts

## 3. Non-Functional Requirements

### 3.1 Performance
- **Grievance submission**: < 2s including acknowledgement email
- **Community stakeholder search**: < 300ms with geospatial filtering
- **Economic impact calculation**: < 10s for annual summary
- **SLO assessment report generation**: < 30s
- **FPIC process dashboard**: < 500ms load time
- **Bulk engagement import**: 500 engagements/minute
- **Real-time grievance alerts**: < 5s latency

### 3.2 Scalability
- **Community stakeholders**: 50K global
- **Grievances**: 100K/year across all facilities
- **Engagements**: 500K events/year
- **Community investments**: 10K active programs
- **Indigenous communities**: 5K globally
- **Monitoring records**: 1M/year (environmental, health, safety)
- **Concurrent users**: 2K (peak during consultation periods)

### 3.3 Availability
- **Uptime SLA**: 99.9%
- **Grievance system uptime**: 99.95% (critical for reputation)
- **RTO**: 2 hours
- **RPO**: 5 minutes (grievances cannot be lost)
- **Graceful degradation**: Read-only mode for stakeholder data, grievance submission always available

### 3.4 Security
- **Grievance confidentiality**: End-to-end encryption for anonymous grievances
- **Indigenous knowledge protection**: IP rights tracking, access controls
- **Community data privacy**: GDPR-like protections (consent, right to erasure)
- **Cultural heritage data**: Restricted access (sacred sites, traditional knowledge)
- **Resettlement data**: PII protection (household income, assets)
- **Whistleblower protection**: Anti-retaliation monitoring

### 3.5 Data Privacy & Ethics
- **Community consent**: Required for data collection and usage
- **Indigenous data sovereignty**: Communities control their data
- **Sensitive location data**: Encryption for sacred sites, burial grounds
- **Anonymization**: Aggregated reporting to prevent individual identification
- **Right to be forgotten**: Community members can request data deletion
- **Cultural protocols**: Data usage respects cultural norms and restrictions

### 3.6 Observability
- **Metrics**:
  - Grievances submitted/resolved per facility
  - Grievance resolution time (average, p95)
  - SLO score trends
  - Community perception trends
  - FPIC processes (active, completed, consent rate)
  - Local procurement and employment percentages
  - Environmental monitoring exceedances
  - Engagement effectiveness scores

- **Logs**:
  - All grievance lifecycle events
  - FPIC stage transitions
  - Benefit-sharing agreement milestones
  - Community consultation activities
  - SLO assessment results
  - Media monitoring alerts

- **Alerts**:
  - Grievance SLA breaches
  - Critical grievances submitted
  - SLO level drop to "withdrawal" or "acceptance"
  - Environmental monitoring exceedances near communities
  - FPIC consent withheld or withdrawn
  - Media sentiment turning negative
  - Community perception score drop > 10%
  - Resettlement compensation overdue
  - Indigenous rights compliance gaps

### 3.7 Compliance & Audit
- **Audit trail**: Immutable log of all community interactions
- **Evidence management**: S3 storage for FPIC documents, agreements, photos
- **Regulatory reporting**: GRI 413, CSRD ESRS S3, IFC PS5/PS7, LBG
- **Data retention**: 10+ years for resettlement, FPIC, grievances
- **Archival**: Long-term storage for legal defensibility

## 4. Module Architecture

### 4.1 Internal Structure
```
community-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── stakeholders/
│   │   ├── stakeholders.module.ts
│   │   ├── stakeholders.controller.ts
│   │   ├── stakeholders.service.ts
│   │   ├── stakeholders.repository.ts
│   │   └── dto/
│   │
│   ├── engagements/
│   │   ├── engagements.module.ts
│   │   ├── engagements.controller.ts
│   │   ├── engagements.service.ts
│   │   ├── engagement-effectiveness.service.ts
│   │   └── dto/
│   │
│   ├── grievances/
│   │   ├── grievances.module.ts
│   │   ├── grievances.controller.ts
│   │   ├── grievances.service.ts
│   │   ├── grievance-workflow.service.ts
│   │   ├── sla-management.service.ts
│   │   ├── grievance-analytics.service.ts
│   │   └── dto/
│   │
│   ├── economic-impact/
│   │   ├── economic-impact.module.ts
│   │   ├── local-procurement.controller.ts
│   │   ├── local-employment.controller.ts
│   │   ├── economic-footprint.service.ts
│   │   ├── multiplier-calculation.service.ts
│   │   └── dto/
│   │
│   ├── investments/
│   │   ├── investments.module.ts
│   │   ├── investments.controller.ts
│   │   ├── investments.service.ts
│   │   ├── volunteerism.controller.ts
│   │   ├── impact-measurement.service.ts
│   │   ├── lbg-reporting.service.ts
│   │   ├── sroi-calculation.service.ts
│   │   └── dto/
│   │
│   ├── indigenous/
│   │   ├── indigenous.module.ts
│   │   ├── indigenous-communities.controller.ts
│   │   ├── fpic-processes.controller.ts
│   │   ├── fpic-workflow.service.ts
│   │   ├── benefit-sharing.controller.ts
│   │   ├── cultural-heritage.controller.ts
│   │   ├── undrip-compliance.service.ts
│   │   └── dto/
│   │
│   ├── resettlement/
│   │   ├── resettlement.module.ts
│   │   ├── action-plans.controller.ts
│   │   ├── compensation.controller.ts
│   │   ├── livelihood-restoration.controller.ts
│   │   ├── ifc-ps5-compliance.service.ts
│   │   ├── monitoring.service.ts
│   │   └── dto/
│   │
│   ├── health-safety/
│   │   ├── health-safety.module.ts
│   │   ├── impact-assessments.controller.ts
│   │   ├── monitoring.controller.ts
│   │   ├── complaints.controller.ts
│   │   ├── exceedance-management.service.ts
│   │   └── dto/
│   │
│   ├── social-license/
│   │   ├── social-license.module.ts
│   │   ├── slo-assessments.controller.ts
│   │   ├── perception-surveys.controller.ts
│   │   ├── media-monitoring.controller.ts
│   │   ├── slo-scoring.service.ts
│   │   ├── sentiment-analysis.service.ts
│   │   └── dto/
│   │
│   ├── geospatial/
│   │   ├── geospatial.module.ts
│   │   ├── geospatial.service.ts
│   │   ├── proximity-calculator.ts
│   │   └── indigenous-lands-mapper.ts
│   │
│   ├── events/
│   │   ├── events.module.ts
│   │   ├── event-publisher.service.ts
│   │   ├── event-consumer.service.ts
│   │   └── schemas/
│   │
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── grievance-alerts.service.ts
│   │   ├── slo-alerts.service.ts
│   │   └── multi-language.service.ts
│   │
│   └── common/
│       ├── guards/
│       ├── interceptors/
│       ├── validators/
│       └── utils/
│
├── test/
├── Dockerfile
└── package.json
```

### 4.2 Key Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/mongoose": "^10.0.0",
    "@turf/turf": "^6.5.0",
    "@aws-sdk/client-eventbridge": "^3.0.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "mongoose": "^8.0.0",
    "ioredis": "^5.0.0",
    "@nestjs/schedule": "^4.0.0",
    "pdf-lib": "^1.17.1",
    "xlsx": "^0.18.0",
    "natural": "^6.0.0",
    "sentiment": "^5.0.2",
    "nodemailer": "^6.9.0",
    "twilio": "^4.0.0"
  }
}
```

## 5. Event Contracts

### 5.1 Published Events

#### CommunityEngagementConducted
```json
{
  "eventType": "social.community.engagement-conducted.v1",
  "version": "v1",
  "payload": {
    "engagementId": "string",
    "stakeholderId": "string",
    "facilityId": "string",
    "type": "consultation|town-hall|fpic|survey",
    "date": "ISO8601",
    "participantsCount": "number",
    "isFPIC": "boolean",
    "consensusReached": "boolean",
    "effectivenessScore": "number",
    "timestamp": "ISO8601"
  }
}
```

#### CommunityGrievanceSubmitted
```json
{
  "eventType": "social.community.grievance-submitted.v1",
  "version": "v1",
  "payload": {
    "grievanceId": "string",
    "grievanceNumber": "string",
    "facilityId": "string",
    "grievanceType": "environmental|social|economic|cultural",
    "severity": "critical|high|medium|low",
    "isAnonymous": "boolean",
    "submissionChannel": "string",
    "acknowledgedDate": "ISO8601",
    "resolutionDue": "ISO8601",
    "timestamp": "ISO8601"
  }
}
```

#### FPICCompleted
```json
{
  "eventType": "social.community.fpic-completed.v1",
  "version": "v1",
  "payload": {
    "fpicProcessId": "string",
    "indigenousCommunityId": "string",
    "facilityId": "string",
    "projectName": "string",
    "consentStatus": "granted|withheld|conditional",
    "consentDate": "ISO8601",
    "conditions": "array",
    "timestamp": "ISO8601"
  }
}
```

#### CommunityInvestmentDisbursed
```json
{
  "eventType": "social.community.investment-disbursed.v1",
  "version": "v1",
  "payload": {
    "investmentId": "string",
    "programName": "string",
    "category": "education|health|infrastructure|livelihoods",
    "amount": "number",
    "currency": "string",
    "beneficiariesReached": "number",
    "sdgAlignment": "array",
    "timestamp": "ISO8601"
  }
}
```

#### CommunityImpactAssessed
```json
{
  "eventType": "social.community.impact-assessed.v1",
  "version": "v1",
  "payload": {
    "assessmentId": "string",
    "facilityId": "string",
    "assessmentType": "health|cultural-heritage|resettlement|slo",
    "affectedCommunities": "array",
    "impactSeverity": "major|moderate|minor",
    "mitigationRequired": "boolean",
    "timestamp": "ISO8601"
  }
}
```

#### SocialLicenseThresholdCrossed
```json
{
  "eventType": "social.community.slo-threshold-crossed.v1",
  "version": "v1",
  "payload": {
    "facilityId": "string",
    "previousLevel": "co-ownership|approval|acceptance|withdrawal",
    "currentLevel": "co-ownership|approval|acceptance|withdrawal",
    "score": "number",
    "direction": "improving|declining",
    "riskLevel": "high|medium|low",
    "triggerIndicators": "array",
    "actionRequired": "boolean",
    "timestamp": "ISO8601"
  }
}
```

### 5.2 Consumed Events

#### FacilityCreated (from Organization Service 3002)
```json
{
  "eventType": "platform.facility.added.v1",
  "action": "Initialize community stakeholder mapping for new facility"
}
```

#### StakeholderFeedbackSubmitted (from Stakeholder Service 3038)
```json
{
  "eventType": "governance.stakeholder.feedback-submitted.v1",
  "action": "Link stakeholder feedback to community engagement records if applicable"
}
```

#### SupplierOnboarded (from Environmental Supply Chain Service 3020)
```json
{
  "eventType": "environmental.supply-chain.supplier-onboarded.v1",
  "action": "Update local procurement tracking if supplier is local"
}
```

## 6. Integration Points

### 6.1 Organization Service (3002)
- Facility locations for proximity calculations (sync)
- Organizational hierarchies for local employment tracking
- Project timelines for community engagement planning

### 6.2 Workforce Service (3021)
- Employee demographics for local employment percentage (sync)
- Payroll data for local economic impact
- Volunteerism hours and activities

### 6.3 Environmental Supply Chain Service (3020)
- Supplier locations for local procurement analysis (sync)
- Procurement spend data

### 6.4 Stakeholder Service (3038)
- Stakeholder engagement coordination
- Feedback consolidation

### 6.5 Reporting Service (3044)
- GRI 413 (Local Communities) reporting
- CSRD ESRS S3 (Affected Communities) disclosure
- IFC Performance Standard 5 and 7 compliance
- LBG Framework reporting

### 6.6 Integration Service (3010)
- ERP systems (procurement, tax data)
- HRIS (local employment, demographics)
- Volunteerism platforms (Benevity, YourCause)
- Survey platforms (Qualtrics, SurveyMonkey)

### 6.7 AWS EventBridge
- Publish community engagement events
- Subscribe to facility and stakeholder events

### 6.8 Redis Cache
- Stakeholder profiles and proximity data
- Grievance SLA countdowns
- SLO assessment results
- Economic impact summaries

### 6.9 AWS S3
- FPIC documentation (consent forms, meeting minutes, photos)
- Cultural heritage assessments and maps
- Resettlement Action Plans (RAPs)
- Benefit-sharing agreements
- Community investment impact reports
- Environmental monitoring reports
- Media monitoring archives

### 6.10 GIS Systems (PostGIS)
- Indigenous lands mapping
- Community proximity calculations
- Sacred sites and cultural heritage locations
- Resettlement site selection

### 6.11 External APIs
- Geocoding services (Google Maps, Mapbox)
- Translation services (Google Translate, DeepL)
- Sentiment analysis (AWS Comprehend, Azure Text Analytics)
- SMS/Voice (Twilio for grievance hotline)

## 7. Migration Considerations

### From Current System
1. **Legacy community data**: Migrate stakeholder profiles, historical engagement records
2. **Grievance history**: Preserve all grievance records with full audit trail
3. **FPIC processes**: Migrate in-progress FPIC documentation
4. **Resettlement plans**: Transfer active RAPs and compensation records
5. **Community investments**: Migrate program portfolios and impact data
6. **Local economic impact**: Historical procurement and employment data

### Migration Steps
1. Extract community stakeholder data from legacy CRM/spreadsheets
2. Geocode community locations for proximity analysis
3. Import grievance history with original timestamps
4. Migrate FPIC documentation to S3 with metadata
5. Transfer resettlement household data (encrypted PII)
6. Import community investment programs with impact metrics
7. Validate indigenous community records and cultural heritage data
8. Create historical social license assessments
9. Migrate local procurement and employment baselines

### Data Quality Requirements
- **Stakeholder location accuracy**: Geocoded to at least settlement level
- **Grievance completeness**: All fields populated, status accurate
- **FPIC documentation**: All stages documented with evidence
- **Resettlement compensation**: Payment records verified
- **Indigenous community boundaries**: GIS polygons accurate
- **Economic impact baselines**: Verified against ERP/HRIS

## 8. Testing Requirements

### 8.1 Unit Tests (80% coverage)
- Grievance SLA calculation and escalation
- FPIC stage validation and sequencing
- Local economic impact percentage calculations
- SLO scoring algorithm
- Proximity calculations for community stakeholders
- Compensation package calculations

### 8.2 Integration Tests
- End-to-end grievance submission to resolution
- FPIC process workflow (all four stages)
- Community investment impact measurement
- Resettlement compensation disbursement
- Environmental monitoring exceedance alerts
- SLO assessment report generation

### 8.3 Performance Tests
- Geospatial stakeholder search (10K communities, <300ms)
- Grievance analytics for large datasets (100K grievances)
- Economic impact aggregation (multi-year, multi-facility)
- Bulk engagement import (500 records)

### 8.4 Security Tests
- Anonymous grievance confidentiality
- Indigenous knowledge access controls
- Community PII encryption
- Cultural heritage data restrictions

### 8.5 Accessibility Tests
- Multi-language grievance submission
- Low-literacy grievance forms
- Offline grievance submission (phone, mail)

## 9. Compliance & Standards

### 9.1 Reporting Frameworks
- **GRI 413**: Local Communities (413-1, 413-2)
- **CSRD ESRS S3**: Affected Communities
- **IFC Performance Standard 5**: Land Acquisition and Involuntary Resettlement
- **IFC Performance Standard 7**: Indigenous Peoples
- **LBG Framework**: London Benchmarking Group methodology

### 9.2 Indigenous Rights
- **UNDRIP**: UN Declaration on the Rights of Indigenous Peoples
- **FPIC**: Free Prior and Informed Consent
- **ILO Convention 169**: Indigenous and Tribal Peoples Convention
- **Equator Principles**: Financial sector framework for indigenous rights

### 9.3 Grievance Mechanisms
- **UN Guiding Principles on Business and Human Rights**: Effectiveness Criteria for Grievance Mechanisms
- **IFC Grievance Mechanism Standards**
- **OECD Guidelines for Multinational Enterprises**: Complaint mechanisms

### 9.4 Social License to Operate
- **SLO Research**: Thomson & Boutilier framework
- **Stakeholder Engagement Standards**: AA1000 Stakeholder Engagement Standard
- **ISO 26000**: Social Responsibility - Community Involvement

### 9.5 Resettlement Standards
- **World Bank ESS5**: Land Acquisition, Restrictions on Land Use and Involuntary Resettlement
- **ADB Safeguard Policy Statement**: Involuntary Resettlement
- **IFC Handbook on Preparing a Resettlement Action Plan**

## 10. Future Enhancements

### Phase 2 (6 months)
- AI-powered grievance categorization and routing
- Real-time sentiment analysis of community feedback
- Predictive SLO risk modeling
- Mobile app for community engagement (offline-capable)
- Blockchain for benefit-sharing payment tracking

### Phase 3 (12 months)
- Virtual town halls with translation and captioning
- Digital consent management for FPIC
- Augmented reality for cultural heritage site visualization
- Community self-service portal (grievances, feedback, investment updates)
- Integrated economic modeling for local content optimization

### Phase 4 (18 months)
- Machine learning for grievance trend prediction
- Natural language processing for multi-language grievances
- Satellite imagery for resettlement site monitoring
- Social media listening integration
- Community digital twins for impact modeling

---

**Document Version**: 1.0.0
**Last Updated**: November 20, 2024
**Next Review**: Sprint Planning for Phase 4
**Owner**: Social Domain Team
