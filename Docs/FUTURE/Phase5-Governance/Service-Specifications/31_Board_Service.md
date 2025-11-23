# Board Service Specification

## Service Overview

**Service Name**: Board Service (Board Governance & ESG Oversight)
**Port**: 3031
**Phase**: 5 (Governance Domain - Board Governance)
**Sprint**: 5.1-5.3 (Months 13-15)
**Story Points**: 40
**Dependencies**: Organization (3002), Diversity (3028), Risk (3033), Ethics (3032), Reporting (3044)

### Business Purpose

The Board Service is the central platform for managing board composition, diversity, ESG oversight, executive compensation, and shareholder engagement. This service enables organizations to:

- **Track Board Composition**: Manage director profiles, independence, tenure, skills matrix, and committee structure
- **Ensure Board Diversity**: Monitor and report on gender, racial, age, skills, and geographic diversity (Nasdaq, listing rules)
- **Oversee ESG Performance**: Track board ESG training, agenda items, climate/human rights oversight, and ESG committee activities
- **Manage Compensation**: Track CEO pay ratios, ESG metrics in executive compensation, say-on-pay results
- **Engage Shareholders**: Manage AGM, proxy voting, shareholder proposals, and institutional investor engagement
- **Report Governance**: Automate GRI 2-9 to 2-21, CSRD ESRS G1, and proxy disclosure generation

### Key Business Capabilities

1. **Board Composition Management**: Director registry, board structure, committee composition, independence classification
2. **Board Diversity Tracking**: Multi-dimensional diversity metrics (gender, race, age, skills, geography)
3. **ESG Oversight**: ESG committee management, board training, climate/human rights oversight, ESG performance scorecards
4. **Executive Compensation**: CEO pay ratio calculations, ESG metrics in compensation, clawback policies, say-on-pay tracking
5. **Shareholder Engagement**: AGM management, proxy voting, shareholder proposal tracking, activist investor monitoring
6. **Board Skills Matrix**: Skills assessment, ESG expertise tracking, continuing education, expert advisor engagement
7. **Board Evaluation**: Self-assessments, peer reviews, performance tracking, succession planning
8. **Governance Reporting**: Proxy statements, GRI 2, CSRD G1, board diversity disclosures, UK Corporate Governance Code

## Technical Architecture

### Service Design Patterns

```typescript
// Domain-Driven Design Structure
src/
├── domain/                          # Core business logic
│   ├── aggregates/
│   │   ├── board-composition/       # Board structure and composition
│   │   ├── board-member/            # Director profiles and tenure
│   │   ├── board-diversity/         # Diversity metrics and goals
│   │   ├── esg-oversight/           # ESG committee and oversight
│   │   ├── executive-compensation/  # CEO pay ratio and ESG comp
│   │   ├── shareholder-engagement/  # AGM and proxy voting
│   │   ├── board-evaluation/        # Self-assessment and reviews
│   │   └── governance-policy/       # Board charters and policies
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
│   │   ├── mongodb/                 # Document store (public data)
│   │   ├── postgresql/              # Confidential meeting minutes
│   │   └── redis/                   # Caching public disclosures
│   ├── messaging/
│   ├── integration/
│   └── monitoring/
└── interfaces/                      # API layer
    ├── rest/
    ├── graphql/
    └── websocket/
```

### Technology Stack

- **Runtime**: Node.js 20 LTS with TypeScript 5.3
- **Framework**: NestJS 10.x with CQRS module
- **Databases**:
  - MongoDB 7.x (primary data store - PUBLIC disclosure)
  - PostgreSQL 16 (confidential meeting minutes - ENCRYPTED)
  - Redis 7.x (caching public disclosures)
- **Messaging**: Apache Kafka 3.6 (EventBridge for AWS)
- **Caching**: Redis 7.x with clustering
- **API**: RESTful + GraphQL Federation
- **Real-time**: Socket.io for say-on-pay vote results
- **Documentation**: OpenAPI 3.1 + AsyncAPI 2.6

## Data Architecture

### Core Data Models

#### 1. Board Member Profile

```typescript
interface BoardMemberProfile {
  id: string;
  memberId: string;
  organizationId: string;

  // Personal Information
  personal: {
    firstName: string;
    lastName: string;
    preferredName: string;
    title: string; // Dr., Mr., Ms., etc.
    photo: string; // URL
    biography: string;
  };

  // Board Role
  boardRole: {
    position: string; // CHAIR, VICE_CHAIR, MEMBER, LEAD_INDEPENDENT, CHAIR_ESG_COMMITTEE
    appointmentDate: Date;
    initialAppointmentDate: Date; // First appointment to board
    currentTermExpiry: Date;
    tenureYears: number; // Calculated
    tenureMonths: number;
    reelectionYear: number;
    status: string; // ACTIVE, RESIGNED, RETIRED, DECEASED
    resignationDate?: Date;
    resignationReason?: string;
  };

  // Independence Classification
  independence: {
    classification: string; // INDEPENDENT, NON_INDEPENDENT, MANAGEMENT, AFFILIATED
    determinationDate: Date;
    determinationRationale: string;
    coolingOffPeriod: boolean;
    coolingOffExpiry?: Date;
    relationships: Relationship[]; // Conflicts requiring non-independent classification
    lastReviewDate: Date;
  };

  // Committee Memberships
  committees: [{
    committeeId: string;
    committeeName: string; // AUDIT, COMPENSATION, NOMINATING_GOVERNANCE, ESG_SUSTAINABILITY, RISK
    role: string; // CHAIR, MEMBER
    appointmentDate: Date;
    expertise: string[]; // Relevant skills for committee
  }];

  // Board Attendance
  attendance: {
    boardMeetingsAttended: number;
    boardMeetingsTotal: number;
    boardAttendanceRate: number; // Percentage
    committeeMeetingsAttended: number;
    committeeMeetingsTotal: number;
    committeeAttendanceRate: number;
    year: number;
  }[];

  // Diversity Attributes
  diversity: {
    gender: string; // MALE, FEMALE, NON_BINARY, PREFER_NOT_TO_SAY
    ethnicity: string; // As per Nasdaq: UNDERREPRESENTED_MINORITY, WHITE, ASIAN, BLACK, HISPANIC, TWO_OR_MORE
    ageGroup: string; // UNDER_30, 30_39, 40_49, 50_59, 60_69, 70_PLUS
    dateOfBirth: Date; // Encrypted
    lgbtq: boolean; // Self-identified (optional)
    disability: boolean; // Self-identified (optional)
    geography: string; // Country/region of primary residence
    underrepresentedGroup: boolean; // Nasdaq requirement
    selfDeclared: boolean; // Whether diversity attributes are self-declared
  };

  // Skills Matrix
  skills: {
    financialExpertise: boolean;
    esgExpertise: boolean;
    climateRiskExpertise: boolean;
    cybersecurityExpertise: boolean;
    humanRightsExpertise: boolean;
    legalExpertise: boolean;
    regulatoryExpertise: boolean;
    industryExpertise: boolean;
    internationalExperience: boolean;
    riskManagement: boolean;
    humanCapital: boolean;
    technology: boolean;
    marketing: boolean;
    operations: boolean;
    otherSkills: string[];
    skillsAssessmentDate: Date;
  };

  // ESG Training
  esgTraining: {
    climateRiskTraining: {
      completed: boolean;
      date: Date;
      hours: number;
      provider: string;
    };
    humanRightsTraining: {
      completed: boolean;
      date: Date;
      hours: number;
      provider: string;
    };
    cybersecurityTraining: {
      completed: boolean;
      date: Date;
      hours: number;
      provider: string;
    };
    totalEsgTrainingHours: number; // Annual
  };

  // Other Directorships (Overboarding Assessment)
  otherDirectorships: [{
    companyName: string;
    companyType: string; // PUBLIC, PRIVATE, NONPROFIT
    position: string;
    appointmentDate: Date;
    resignationDate?: Date;
    boardMeetingsPerYear: number;
    committeeMemberships: string[];
    estimatedTimeCommitment: number; // Hours per year
  }];

  // Overboarding Assessment
  overboardingAssessment: {
    totalPublicBoardSeats: number;
    totalPrivateBoardSeats: number;
    totalNonprofitBoardSeats: number;
    totalEstimatedHours: number;
    exceedsGuidelines: boolean; // ISS: 5 public boards for non-CEO, 2 for CEO
    guidelines: string;
    lastAssessmentDate: Date;
  };

  // Compensation
  compensation: {
    annualRetainer: number;
    meetingFees: number;
    committeeChairRetainer: number;
    equityAwards: {
      type: string; // RSU, STOCK_OPTIONS
      value: number;
      vestingSchedule: string;
    }[];
    totalCompensation: number;
    year: number;
  }[];

  // Share Ownership
  shareOwnership: {
    sharesOwned: number;
    sharesValue: number;
    ownershipRequirement: number; // Multiple of annual retainer
    meetsRequirement: boolean;
    asOfDate: Date;
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

interface Relationship {
  type: string; // FAMILY, BUSINESS, FINANCIAL, FORMER_EMPLOYEE, CONSULTANT
  description: string;
  startDate: Date;
  endDate?: Date;
  impactsIndependence: boolean;
}
```

#### 2. Board Composition

```typescript
interface BoardComposition {
  id: string;
  organizationId: string;
  year: number;

  // Board Structure
  structure: {
    totalSeats: number;
    occupiedSeats: number;
    vacantSeats: number;
    boardSize: string; // SMALL (3-5), MEDIUM (6-10), LARGE (11+)
    staggeredBoard: boolean; // Classified board with staggered terms
    termLength: number; // Years
    termLimits: boolean;
    termLimitYears?: number;
  };

  // Board Leadership
  leadership: {
    chairId: string;
    chairName: string;
    chairType: string; // EXECUTIVE, NON_EXECUTIVE, INDEPENDENT
    ceoChairSeparation: boolean; // CEO and Chair are different people
    leadIndependentDirectorId?: string;
    leadIndependentDirectorName?: string;
    ceoId?: string;
    ceoName?: string;
  };

  // Independence Breakdown
  independence: {
    independentDirectors: number;
    independentPercentage: number;
    nonIndependentDirectors: number;
    managementDirectors: number;
    meetsIndependenceRequirement: boolean; // NYSE: majority independent
    auditCommitteeIndependent: boolean; // 100% required
    compensationCommitteeIndependent: boolean; // 100% required
  };

  // Diversity Metrics
  diversity: {
    gender: {
      male: number;
      female: number;
      nonBinary: number;
      femalePercentage: number;
      nasdaqCompliant: boolean; // At least 1 female, 1 diverse director
    };
    ethnicity: {
      white: number;
      asian: number;
      black: number;
      hispanic: number;
      twoOrMore: number;
      underrepresentedMinority: number;
      underrepresentedPercentage: number;
    };
    age: {
      under30: number;
      age30_39: number;
      age40_49: number;
      age50_59: number;
      age60_69: number;
      age70Plus: number;
      averageAge: number;
      ageRange: string; // e.g., "45-72"
    };
    geography: {
      domestic: number;
      international: number;
      internationalPercentage: number;
      regions: { [region: string]: number };
    };
    skillsDiversity: number; // Shannon diversity index for skills
  };

  // Tenure Analysis
  tenure: {
    averageTenure: number; // Years
    medianTenure: number;
    tenureDistribution: {
      under3Years: number;
      years3_6: number;
      years6_9: number;
      years9Plus: number;
    };
    freshness: number; // Percentage of directors with <3 years tenure
    longestServingDirector: {
      memberId: string;
      name: string;
      tenure: number;
    };
  };

  // Committees
  committees: [{
    committeeId: string;
    committeeName: string;
    type: string; // AUDIT, COMPENSATION, NOMINATING_GOVERNANCE, ESG_SUSTAINABILITY, RISK
    chairId: string;
    chairName: string;
    members: number;
    independentMembers: number;
    independentPercentage: number;
    meetingsPerYear: number;
    charter: {
      url: string;
      lastUpdated: Date;
    };
  }];

  // Board Refreshment
  refreshment: {
    newDirectorsThisYear: number;
    departuresThisYear: number;
    refreshmentRate: number; // New directors / total seats
    upcomingReelections: number;
    successionPlanInPlace: boolean;
  };

  // Metadata
  metadata: {
    asOfDate: Date;
    lastUpdated: Date;
    updatedBy: string;
    version: number;
  };
}
```

#### 3. Board Skills Matrix

```typescript
interface BoardSkillsMatrix {
  id: string;
  organizationId: string;
  assessmentDate: Date;

  // Skills Inventory
  skills: [{
    skillName: string;
    skillCategory: string; // FINANCIAL, ESG, TECHNOLOGY, INDUSTRY, LEGAL, RISK
    description: string;
    strategicImportance: string; // CRITICAL, HIGH, MEDIUM, LOW
    directorsWithSkill: number;
    directorsWithSkillIds: string[];
    gapExists: boolean; // If skill is critical but <2 directors have it
  }];

  // ESG Skills Assessment
  esgSkills: {
    climateRiskExpertise: {
      directorsWithSkill: number;
      adequateCoverage: boolean; // At least 1 director
      namedExperts: string[];
    };
    humanRightsExpertise: {
      directorsWithSkill: number;
      adequateCoverage: boolean;
      namedExperts: string[];
    };
    cybersecurityExpertise: {
      directorsWithSkill: number;
      adequateCoverage: boolean;
      namedExperts: string[];
    };
    overallEsgExpertise: {
      directorsWithSkill: number;
      adequateCoverage: boolean; // At least 2 directors
      percentageWithEsgExpertise: number;
    };
  };

  // Skill Gaps
  skillGaps: [{
    skillName: string;
    currentCoverage: number; // Number of directors
    desiredCoverage: number; // Target number
    criticalGap: boolean;
    actionPlan: string; // Recruitment, training, expert advisor
    targetDate: Date;
  }];

  // Skills Heat Map
  heatMap: {
    skill: string;
    director1: number; // Proficiency 0-5
    director2: number;
    director3: number;
    // ... dynamic based on board size
  }[];

  // Continuing Education
  continuingEducation: {
    totalTrainingHours: number;
    averageHoursPerDirector: number;
    esgTrainingHours: number;
    cybersecurityTrainingHours: number;
    financialReportingTrainingHours: number;
    externalSpeakers: number;
    boardRetreats: number;
  };

  // Expert Advisors
  expertAdvisors: [{
    name: string;
    expertise: string;
    engagementType: string; // ONGOING, AD_HOC, SPECIFIC_PROJECT
    engagementStartDate: Date;
    engagementEndDate?: Date;
    sessionsPerYear: number;
  }];

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

#### 4. ESG Oversight

```typescript
interface ESGOversight {
  id: string;
  organizationId: string;
  year: number;

  // ESG Committee
  esgCommittee: {
    exists: boolean;
    committeeId: string;
    committeeName: string; // ESG Committee, Sustainability Committee, etc.
    establishedDate: Date;
    chairId: string;
    chairName: string;
    members: [{
      memberId: string;
      memberName: string;
      esgExpertise: boolean;
    }];
    meetingsPerYear: number;
    meetingsHeld: number;
    charter: {
      url: string;
      lastUpdated: Date;
      keyResponsibilities: string[];
    };
  };

  // Board ESG Training
  boardTraining: {
    totalHours: number;
    averageHoursPerDirector: number;
    trainingByTopic: {
      climateRisk: number;
      humanRights: number;
      cybersecurity: number;
      dei: number;
      sustainableFinance: number;
    };
    externalTrainers: string[];
    directorsTrainedPercentage: number;
  };

  // Board ESG Agenda Items
  agendaItems: [{
    meetingDate: Date;
    topic: string;
    category: string; // CLIMATE, HUMAN_RIGHTS, DEI, CYBERSECURITY, ESG_STRATEGY
    presentedBy: string;
    durationMinutes: number;
    actionTaken: string;
    followUpRequired: boolean;
    followUpDate?: Date;
  }];

  // ESG Performance Scorecard
  performanceScorecard: {
    climateRisk: {
      oversightFrequency: string; // QUARTERLY, SEMI_ANNUAL, ANNUAL
      scienceBasedTargetsApproved: boolean;
      climateRiskAssessmentReviewed: boolean;
      tcfdReportApproved: boolean;
      carbonNeutralityCommitmentApproved: boolean;
    };
    humanRights: {
      oversightFrequency: string;
      humanRightsPolicyApproved: boolean;
      modernSlaveryStatementApproved: boolean;
      humanRightsDueDiligenceReviewed: boolean;
      grievanceMechanismOversight: boolean;
    };
    cybersecurity: {
      oversightFrequency: string;
      cyberRiskReviewsPerYear: number;
      incidentResponsePlanApproved: boolean;
      cyberInsuranceCoverageApproved: boolean;
      securityAuditsReviewed: number;
    };
    dei: {
      oversightFrequency: string;
      deiTargetsApproved: boolean;
      payEquityAnalysisReviewed: boolean;
      diversityMetricsReviewed: boolean;
      inclusionProgramsOversight: boolean;
    };
  };

  // ESG Metrics in Board Materials
  esgMetricsInMaterials: {
    frequencyInBoardPacks: string; // EVERY_MEETING, QUARTERLY, SEMI_ANNUAL
    kpisTracked: string[];
    dashboardAvailable: boolean;
    thirdPartyRatingsReviewed: boolean; // MSCI, Sustainalytics, CDP
  };

  // External ESG Engagement
  externalEngagement: {
    investorEngagements: number; // Meetings with ESG-focused investors
    ratingAgencyEngagements: number;
    ngoEngagements: number;
    boardMembersSpeakingAtConferences: number;
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

#### 5. Executive Compensation

```typescript
interface ExecutiveCompensation {
  id: string;
  organizationId: string;
  year: number;

  // CEO Compensation
  ceoCompensation: {
    name: string;
    title: string;
    baseSalary: number;
    bonus: number;
    stockAwards: number;
    optionAwards: number;
    nonEquityIncentive: number;
    changeInPensionValue: number;
    allOtherCompensation: number;
    totalCompensation: number;
  };

  // CEO Pay Ratio (GRI 2-21)
  ceoPayRatio: {
    ceoTotalCompensation: number;
    medianEmployeeCompensation: number;
    ratio: number; // CEO pay / median employee pay
    calculationMethodology: string;
    medianEmployeeCountry: string;
    medianEmployeeJobTitle: string;
    yearOverYearChange: number; // Percentage
    peerComparison: {
      industryMedianRatio: number;
      companyRank: number; // Among peers
      totalPeers: number;
    };
  };

  // Named Executive Officers (NEOs)
  neos: [{
    name: string;
    title: string;
    baseSalary: number;
    totalCompensation: number;
    payVsCeoRatio: number;
  }];

  // ESG Metrics in Compensation
  esgMetricsInCompensation: {
    esgMetricsUsed: boolean;
    percentageOfVariableCompLinkedToEsg: number;
    esgMetrics: [{
      metric: string; // e.g., "Carbon emissions reduction", "Safety incident rate"
      category: string; // ENVIRONMENTAL, SOCIAL, GOVERNANCE
      weight: number; // Percentage of variable comp
      target: string;
      achievement: number; // Percentage of target achieved
      payoutImpact: number; // Dollar impact on compensation
    }];
    totalEsgPayoutImpact: number;
  };

  // Compensation Philosophy
  compensationPhilosophy: {
    description: string;
    payForPerformance: boolean;
    peerComparison: boolean;
    peerCompanies: string[];
    esgIntegration: string;
    shareholderAlignment: string;
  };

  // Clawback Policy
  clawbackPolicy: {
    exists: boolean;
    policyUrl: string;
    lastUpdated: Date;
    triggers: string[]; // FINANCIAL_RESTATEMENT, MISCONDUCT, etc.
    lookbackPeriod: number; // Years
    clawbacksActivatedThisYear: number;
    amountClawedBack: number;
  };

  // Say-on-Pay
  sayOnPay: {
    voteDate: Date;
    votesFor: number;
    votesAgainst: number;
    votesAbstain: number;
    approvalPercentage: number;
    passed: boolean; // Typically requires >50% approval
    shareholder Response: string; // If vote failed or low approval
    boardResponse: string;
  };

  // Equity Ownership Guidelines
  equityOwnershipGuidelines: {
    ceoRequirement: number; // Multiple of base salary
    neoRequirement: number;
    timeToComply: number; // Years
    ceoCompliance: boolean;
    neoComplianceRate: number; // Percentage
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

#### 6. Shareholder Engagement

```typescript
interface ShareholderEngagement {
  id: string;
  organizationId: string;
  year: number;

  // Annual General Meeting
  agm: {
    meetingDate: Date;
    meetingType: string; // IN_PERSON, VIRTUAL, HYBRID
    location: string;
    attendees: number;
    shareholdersRepresented: number;
    sharesRepresented: number;
    sharesRepresentedPercentage: number;
    recordDate: Date;
    proxyDeadline: Date;
    agendaItems: [{
      itemNumber: number;
      description: string;
      type: string; // ELECTION, RATIFICATION, SHAREHOLDER_PROPOSAL, MANAGEMENT_PROPOSAL
      boardRecommendation: string; // FOR, AGAINST, NO_RECOMMENDATION
      votesFor: number;
      votesAgainst: number;
      votesAbstain: number;
      votesBrokerNonVote: number;
      approvalPercentage: number;
      passed: boolean;
    }];
  };

  // Proxy Voting Results
  proxyVoting: {
    directorElections: [{
      directorName: string;
      memberId: string;
      votesFor: number;
      votesWithheld: number;
      approvalPercentage: number;
      elected: boolean;
    }];
    sayOnPayVote: {
      votesFor: number;
      votesAgainst: number;
      votesAbstain: number;
      approvalPercentage: number;
      passed: boolean;
    };
    auditorRatification: {
      auditorName: string;
      votesFor: number;
      votesAgainst: number;
      votesAbstain: number;
      approvalPercentage: number;
      ratified: boolean;
    };
  };

  // Shareholder Proposals
  shareholderProposals: [{
    proposalId: string;
    proposalNumber: number;
    proponent: string;
    proponentType: string; // INSTITUTIONAL_INVESTOR, INDIVIDUAL, NGO, ACTIVIST
    topic: string;
    category: string; // ESG, GOVERNANCE, COMPENSATION, STRATEGIC
    description: string;
    esgRelated: boolean;
    boardRecommendation: string; // FOR, AGAINST
    boardRationale: string;
    votesFor: number;
    votesAgainst: number;
    votesAbstain: number;
    approvalPercentage: number;
    passed: boolean;
    companyResponse: string; // If passed or high support
    implementationPlan?: string;
    implementationDeadline?: Date;
  }];

  // Institutional Investor Engagement
  institutionalInvestorEngagement: {
    meetingsHeld: number;
    investorsMet: [{
      investorName: string;
      investorType: string; // ASSET_MANAGER, PENSION_FUND, SOVEREIGN_WEALTH_FUND
      meetingDate: Date;
      attendees: string[]; // Board members/management
      topics: string[];
      esgFocused: boolean;
      followUpRequired: boolean;
    }];
    esgInvestorMeetings: number;
    percentageEsgFocused: number;
  };

  // Activist Shareholder Monitoring
  activistShareholders: [{
    activistName: string;
    activistType: string; // HEDGE_FUND, PROXY_ADVISOR, NGO
    shareholding: number; // Percentage
    engagementStartDate: Date;
    engagementStatus: string; // ACTIVE, SETTLED, WITHDRAWN
    demands: string[];
    boardResponse: string;
    settlementAgreement?: {
      date: Date;
      terms: string[];
      boardSeatsGranted: number;
      commitmentsMade: string[];
    };
  }];

  // Proxy Advisory Firm Recommendations
  proxyAdvisorRecommendations: {
    iss: {
      sayOnPayRecommendation: string; // FOR, AGAINST
      directorElectionRecommendations: { [directorName: string]: string };
      shareholderProposalRecommendations: { [proposalId: string]: string };
    };
    glassLewis: {
      sayOnPayRecommendation: string;
      directorElectionRecommendations: { [directorName: string]: string };
      shareholderProposalRecommendations: { [proposalId: string]: string };
    };
  };

  // Shareholder Communication
  shareholderCommunication: {
    proxyStatementPublishDate: Date;
    sustainabilityReportPublishDate: Date;
    investorPresentations: number;
    earningsCallsWithEsgDiscussion: number;
    shareholderLetterFromChair: boolean;
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

#### 7. Board Meetings

```typescript
interface BoardMeeting {
  id: string;
  meetingId: string;
  organizationId: string;

  // Meeting Details
  meeting: {
    meetingNumber: number;
    meetingDate: Date;
    meetingType: string; // REGULAR, SPECIAL, EMERGENCY
    location: string; // IN_PERSON, VIRTUAL, HYBRID
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
  };

  // Attendance
  attendance: [{
    memberId: string;
    memberName: string;
    present: boolean;
    attendanceType: string; // IN_PERSON, VIRTUAL, PHONE
    lateArrival: boolean;
    earlyDeparture: boolean;
    excused: boolean;
    excuseReason?: string;
  }];

  // Attendance Statistics
  attendanceStats: {
    totalMembers: number;
    membersPresent: number;
    attendanceRate: number; // Percentage
    quorumMet: boolean;
  };

  // Agenda
  agenda: [{
    itemNumber: number;
    topic: string;
    category: string; // STRATEGY, FINANCE, ESG, RISK, HR, GOVERNANCE
    presenter: string;
    durationMinutes: number;
    materialsProvided: boolean;
    materialsUrl: string;
  }];

  // ESG Agenda Items
  esgAgendaItems: [{
    itemNumber: number;
    topic: string;
    category: string; // CLIMATE, HUMAN_RIGHTS, DEI, CYBERSECURITY
    presenter: string;
    durationMinutes: number;
    voteTaken: boolean;
    voteResult?: string;
    actionItems: string[];
  }];

  // Decisions & Resolutions
  decisions: [{
    decisionNumber: number;
    description: string;
    type: string; // APPROVAL, AUTHORIZATION, RESOLUTION, INFORMATION
    voteTaken: boolean;
    votesFor: number;
    votesAgainst: number;
    votesAbstain: number;
    passed: boolean;
    effectiveDate: Date;
  }];

  // Executive Sessions
  executiveSessions: [{
    topic: string;
    attendees: string[]; // Independent directors only, or + CEO
    durationMinutes: number;
  }];

  // Meeting Minutes (PostgreSQL - Confidential)
  minutes: {
    documentId: string; // Link to encrypted PostgreSQL record
    minutesUrl: string;
    approvalDate: Date;
    approvedBy: string[];
    confidential: boolean;
  };

  // Follow-Up Actions
  actionItems: [{
    actionId: string;
    description: string;
    assignedTo: string;
    dueDate: Date;
    status: string; // OPEN, IN_PROGRESS, COMPLETED, OVERDUE
    completedDate?: Date;
  }];

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

#### 8. Board Evaluation

```typescript
interface BoardEvaluation {
  id: string;
  evaluationId: string;
  organizationId: string;
  year: number;

  // Evaluation Details
  evaluation: {
    evaluationType: string; // BOARD_SELF_ASSESSMENT, INDIVIDUAL_PEER_REVIEW, EXTERNAL_EVALUATION
    evaluationDate: Date;
    evaluationPeriod: {
      startDate: Date;
      endDate: Date;
    };
    facilitator: string; // INTERNAL, EXTERNAL_CONSULTANT
    facilitatorName?: string;
    methodology: string;
    participationRate: number; // Percentage of directors who participated
  };

  // Board Effectiveness Assessment
  boardEffectiveness: {
    overallRating: number; // 1-5 scale
    dimensions: {
      strategicOversight: {
        rating: number;
        strengths: string[];
        improvementAreas: string[];
      };
      riskOversight: {
        rating: number;
        strengths: string[];
        improvementAreas: string[];
      };
      esgOversight: {
        rating: number;
        strengths: string[];
        improvementAreas: string[];
      };
      boardComposition: {
        rating: number;
        strengths: string[];
        improvementAreas: string[];
      };
      boardDynamics: {
        rating: number;
        strengths: string[];
        improvementAreas: string[];
      };
      ceoPerformanceEvaluation: {
        rating: number;
        strengths: string[];
        improvementAreas: string[];
      };
      boardMeetingEffectiveness: {
        rating: number;
        strengths: string[];
        improvementAreas: string[];
      };
    };
  };

  // Committee Effectiveness
  committeeEffectiveness: [{
    committeeId: string;
    committeeName: string;
    overallRating: number;
    strengths: string[];
    improvementAreas: string[];
    recommendedChanges: string[];
  }];

  // Individual Director Assessments (Peer Review)
  individualAssessments: [{
    memberId: string;
    memberName: string;
    overallRating: number;
    dimensions: {
      boardContribution: number;
      preparedness: number;
      engagement: number;
      independence: number;
      expertise: number;
      collaboration: number;
    };
    strengths: string[];
    developmentAreas: string[];
    additionalTrainingRecommended: string[];
    continuedServiceRecommendation: string; // STRONG_YES, YES, CONCERNS, NO
  }];

  // Chair Evaluation
  chairEvaluation: {
    memberId: string;
    memberName: string;
    overallRating: number;
    dimensions: {
      leadership: number;
      meetingManagement: number;
      stakeholderEngagement: number;
      strategicGuidance: number;
      boardDynamics: number;
    };
    strengths: string[];
    developmentAreas: string[];
  };

  // Action Plan
  actionPlan: {
    priorities: string[];
    improvements: [{
      area: string;
      action: string;
      owner: string;
      targetDate: Date;
      status: string; // PLANNED, IN_PROGRESS, COMPLETED
    }];
    successionPlanningActions: string[];
    boardRefreshmentPlan: string;
    trainingPlan: string[];
  };

  // Comparison to Previous Evaluations
  trendAnalysis: {
    overallRatingChange: number;
    improvementsSinceLastEvaluation: string[];
    persistentChallenges: string[];
    newIssuesIdentified: string[];
  };

  // External Evaluation Report (if applicable)
  externalReport: {
    provided: boolean;
    consultantName?: string;
    reportUrl?: string;
    keyFindings?: string[];
    recommendations?: string[];
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

#### 9. Governance Policy

```typescript
interface GovernancePolicy {
  id: string;
  policyId: string;
  organizationId: string;

  // Policy Details
  policy: {
    name: string;
    type: string; // BOARD_CHARTER, COMMITTEE_CHARTER, CODE_OF_CONDUCT, CONFLICT_OF_INTEREST, DIRECTOR_COMPENSATION, SHARE_OWNERSHIP, SUCCESSION_PLANNING
    description: string;
    effectiveDate: Date;
    lastReviewDate: Date;
    nextReviewDate: Date;
    reviewFrequency: string; // ANNUAL, BIENNIAL, AS_NEEDED
    approvedBy: string; // BOARD, COMMITTEE
    approvalDate: Date;
  };

  // Policy Document
  document: {
    url: string;
    version: string;
    publiclyAvailable: boolean;
    publicationUrl?: string;
  };

  // Key Provisions
  keyProvisions: [{
    provision: string;
    category: string;
    description: string;
  }];

  // Compliance Tracking
  compliance: {
    lastComplianceReview: Date;
    compliant: boolean;
    nonComplianceIssues: string[];
    correctiveActions: [{
      issue: string;
      action: string;
      owner: string;
      dueDate: Date;
      status: string;
    }];
  };

  // Related Policies
  relatedPolicies: [{
    policyId: string;
    policyName: string;
    relationship: string; // SUPERSEDES, COMPLEMENTS, IMPLEMENTS
  }];

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

#### 10. Board Diversity Target

```typescript
interface BoardDiversityTarget {
  id: string;
  targetId: string;
  organizationId: string;

  // Target Details
  target: {
    targetName: string;
    targetType: string; // GENDER, ETHNICITY, AGE, SKILLS, GEOGRAPHY
    description: string;
    setDate: Date;
    targetDeadline: Date;
    status: string; // ON_TRACK, AT_RISK, ACHIEVED, MISSED
  };

  // Baseline & Target
  baseline: {
    baselineDate: Date;
    baselineValue: number; // Percentage or count
    baselineDescription: string;
  };

  target: {
    targetValue: number;
    targetUnit: string; // PERCENTAGE, COUNT
    targetDescription: string;
  };

  // Current Progress
  progress: {
    currentValue: number;
    currentPercentage: number;
    progressPercentage: number; // Progress towards target
    lastUpdated: Date;
  };

  // Nasdaq Diversity Targets (if applicable)
  nasdaqCompliance: {
    applicable: boolean;
    tier1Requirement: {
      requiredDiverseDirectors: number; // 2 for Nasdaq tier 1
      currentDiverseDirectors: number;
      requiredFemaleDirectors: number; // 1
      currentFemaleDirectors: number;
      compliant: boolean;
      deadlineDate: Date;
    };
    disclosureRequirement: {
      diversityMatrixRequired: boolean;
      diversityMatrixPublished: boolean;
      diversityMatrixUrl: string;
      lastUpdated: Date;
    };
  };

  // Action Plan
  actionPlan: {
    actions: [{
      action: string;
      owner: string;
      dueDate: Date;
      status: string;
    }];
    recruitmentStrategy: string;
    successorPipeline: string[];
    searchFirmEngaged: boolean;
    searchFirmName?: string;
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

#### 11. Board Report (GRI 2, CSRD G1, Proxy)

```typescript
interface BoardReport {
  id: string;
  reportId: string;
  organizationId: string;
  year: number;

  // Report Type
  reportType: string; // GRI_2, CSRD_G1, PROXY_STATEMENT, UK_CORPORATE_GOVERNANCE_CODE

  // GRI 2-9: Governance Structure
  gri_2_9: {
    boardStructure: string;
    committees: string[];
    chairType: string;
    ceoChairSeparation: boolean;
  };

  // GRI 2-10: Nomination and Selection
  gri_2_10: {
    nominationProcess: string;
    diversityCriteria: string[];
    independenceCriteria: string;
    stakeholderInvolvement: string;
  };

  // GRI 2-11: Chair of Highest Governance Body
  gri_2_11: {
    chairName: string;
    chairType: string; // EXECUTIVE, NON_EXECUTIVE, INDEPENDENT
    isExecutive: boolean;
    otherRoles: string[];
  };

  // GRI 2-12: Role in Overseeing Impact Management
  gri_2_12: {
    esgOversightRole: string;
    esgCommitteeExists: boolean;
    esgReviewFrequency: string;
    sustainabilityReportApproval: boolean;
  };

  // GRI 2-13: Delegation of Responsibility
  gri_2_13: {
    esgManagementDelegation: string;
    managementRoles: string[];
    boardMonitoring: string;
  };

  // GRI 2-14: Role in Sustainability Reporting
  gri_2_14: {
    boardReviewProcess: string;
    sustainabilityReportApprovedBy: string;
    approvalDate: Date;
  };

  // GRI 2-17: Collective Knowledge on Sustainability
  gri_2_17: {
    esgTrainingProvided: boolean;
    trainingHours: number;
    trainingTopics: string[];
    externalExperts: string[];
  };

  // GRI 2-18: Board Performance Evaluation
  gri_2_18: {
    evaluationFrequency: string;
    independentEvaluation: boolean;
    actionsTaken: string[];
  };

  // GRI 2-19/2-20: Remuneration Policies
  gri_2_19_2_20: {
    compensationPhilosophy: string;
    esgMetricsUsed: boolean;
    esgWeightInCompensation: number;
    shareholderVote: boolean;
  };

  // GRI 2-21: Annual Total Compensation Ratio (CEO Pay Ratio)
  gri_2_21: {
    ceoTotalCompensation: number;
    medianEmployeeCompensation: number;
    ratio: number;
    methodology: string;
  };

  // CSRD ESRS G1: Business Conduct (Governance)
  csrd_g1: {
    corporateCulture: string;
    whistleblowerProtection: boolean;
    antiCorruptionPolicies: string[];
    politicalInfluence: string;
    lobbyingActivities: string;
  };

  // Proxy Statement Content
  proxyStatement: {
    boardCompositionTable: object;
    directorBiographies: object[];
    committeeCompositionTable: object;
    boardDiversityMatrix: object; // Nasdaq requirement
    directorCompensationTable: object;
    executiveCompensationTable: object;
    ceoPayRatioDisclosure: object;
    sayOnPayProposal: object;
    shareholderProposals: object[];
  };

  // Generated Report
  generatedReport: {
    format: string; // PDF, HTML, DOCX
    url: string;
    generatedAt: Date;
    generatedBy: string;
    version: number;
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

### MongoDB Collections

```typescript
// Collection Definitions
const collections = {
  // Core Collections
  board_members: 'board_members',
  board_composition: 'board_composition',
  board_skills_matrix: 'board_skills_matrix',

  // ESG Oversight
  esg_oversight: 'esg_oversight',
  board_meetings: 'board_meetings',
  board_evaluations: 'board_evaluations',

  // Compensation
  executive_compensation: 'executive_compensation',

  // Shareholder Engagement
  shareholder_engagement: 'shareholder_engagement',
  shareholder_proposals: 'shareholder_proposals',
  proxy_voting_results: 'proxy_voting_results',

  // Governance
  governance_policies: 'governance_policies',
  board_diversity_targets: 'board_diversity_targets',
  board_reports: 'board_reports'
};

// Indexes for Performance
const indexes = {
  board_members: [
    { memberId: 1 },
    { organizationId: 1, 'boardRole.status': 1 },
    { 'independence.classification': 1 },
    { 'diversity.gender': 1, 'diversity.ethnicity': 1 },
    { 'boardRole.tenureYears': -1 }
  ],

  board_composition: [
    { organizationId: 1, year: -1 },
    { 'diversity.gender.nasdaqCompliant': 1 },
    { 'independence.meetsIndependenceRequirement': 1 }
  ],

  esg_oversight: [
    { organizationId: 1, year: -1 },
    { 'esgCommittee.exists': 1 },
    { 'boardTraining.directorsTrainedPercentage': -1 }
  ],

  executive_compensation: [
    { organizationId: 1, year: -1 },
    { 'ceoPayRatio.ratio': -1 },
    { 'esgMetricsInCompensation.esgMetricsUsed': 1 }
  ],

  shareholder_engagement: [
    { organizationId: 1, year: -1 },
    { 'agm.meetingDate': -1 },
    { 'sayOnPayVote.passed': 1 }
  ]
};
```

## API Specifications

### RESTful Endpoints

```yaml
openapi: 3.1.0
info:
  title: Board Service API
  version: 1.0.0
  description: Board governance, diversity, ESG oversight, and shareholder engagement

paths:
  # Board Member Management
  /api/v1/board/members:
    get:
      summary: List board members
      parameters:
        - name: organizationId
          in: query
          required: true
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
            enum: [ACTIVE, RESIGNED, RETIRED]
        - name: independence
          in: query
          schema:
            type: string
            enum: [INDEPENDENT, NON_INDEPENDENT, MANAGEMENT]
      responses:
        200:
          description: List of board members

    post:
      summary: Add board member
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BoardMemberCreate'

  /api/v1/board/members/{memberId}:
    get:
      summary: Get board member details

    put:
      summary: Update board member

    delete:
      summary: Remove board member (resignation)

  /api/v1/board/members/{memberId}/attendance:
    get:
      summary: Get member attendance history
      parameters:
        - name: year
          in: query
          schema:
            type: integer

  # Board Composition
  /api/v1/board/composition:
    get:
      summary: Get board composition
      parameters:
        - name: organizationId
          in: query
          required: true
        - name: year
          in: query
          schema:
            type: integer
      responses:
        200:
          description: Board composition details

  /api/v1/board/composition/diversity:
    get:
      summary: Get board diversity metrics
      responses:
        200:
          description: Diversity breakdown by gender, ethnicity, age, skills

  /api/v1/board/composition/independence:
    get:
      summary: Get board independence analysis
      responses:
        200:
          description: Independence breakdown and compliance

  # Board Skills Matrix
  /api/v1/board/skills-matrix:
    get:
      summary: Get board skills matrix
      parameters:
        - name: organizationId
          in: query
          required: true
      responses:
        200:
          description: Skills matrix with coverage analysis

    post:
      summary: Create/update skills matrix
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SkillsMatrixUpdate'

  /api/v1/board/skills-matrix/gaps:
    get:
      summary: Identify skill gaps
      responses:
        200:
          description: List of critical skill gaps

  # ESG Oversight
  /api/v1/board/esg-oversight:
    get:
      summary: Get ESG oversight metrics
      parameters:
        - name: organizationId
          in: query
          required: true
        - name: year
          in: query
          schema:
            type: integer
      responses:
        200:
          description: ESG oversight details

    put:
      summary: Update ESG oversight data
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ESGOversightUpdate'

  /api/v1/board/esg-oversight/training:
    get:
      summary: Get board ESG training summary

    post:
      summary: Log ESG training session
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                trainingDate:
                  type: string
                  format: date
                topic:
                  type: string
                hours:
                  type: number
                attendees:
                  type: array
                  items:
                    type: string
                provider:
                  type: string

  /api/v1/board/esg-oversight/agenda-items:
    get:
      summary: Get ESG agenda items from board meetings

    post:
      summary: Add ESG agenda item
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ESGAgendaItem'

  # Executive Compensation
  /api/v1/board/compensation:
    get:
      summary: Get executive compensation data
      parameters:
        - name: organizationId
          in: query
          required: true
        - name: year
          in: query
          schema:
            type: integer
      responses:
        200:
          description: Compensation details including CEO pay ratio

    post:
      summary: Record executive compensation
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ExecutiveCompensationCreate'

  /api/v1/board/compensation/ceo-pay-ratio:
    get:
      summary: Get CEO pay ratio (GRI 2-21)
      responses:
        200:
          description: CEO pay ratio and methodology

  /api/v1/board/compensation/esg-metrics:
    get:
      summary: Get ESG metrics in compensation
      responses:
        200:
          description: ESG metrics and their impact on compensation

  /api/v1/board/compensation/say-on-pay:
    get:
      summary: Get say-on-pay vote results

    post:
      summary: Record say-on-pay vote
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                voteDate:
                  type: string
                  format: date
                votesFor:
                  type: integer
                votesAgainst:
                  type: integer
                votesAbstain:
                  type: integer

  # Shareholder Engagement
  /api/v1/board/shareholder-engagement:
    get:
      summary: Get shareholder engagement summary
      parameters:
        - name: organizationId
          in: query
          required: true
        - name: year
          in: query
          schema:
            type: integer
      responses:
        200:
          description: Shareholder engagement details

  /api/v1/board/shareholder-engagement/agm:
    get:
      summary: Get AGM details and voting results

    post:
      summary: Create AGM
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AGMCreate'

  /api/v1/board/shareholder-engagement/proposals:
    get:
      summary: List shareholder proposals
      parameters:
        - name: year
          in: query
          schema:
            type: integer
        - name: category
          in: query
          schema:
            type: string
      responses:
        200:
          description: List of shareholder proposals

    post:
      summary: Add shareholder proposal
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ShareholderProposalCreate'

  /api/v1/board/shareholder-engagement/proxy-voting:
    post:
      summary: Record proxy voting results
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProxyVotingResults'

  # Board Meetings
  /api/v1/board/meetings:
    get:
      summary: List board meetings
      parameters:
        - name: organizationId
          in: query
          required: true
        - name: year
          in: query
          schema:
            type: integer
      responses:
        200:
          description: List of board meetings

    post:
      summary: Create board meeting
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BoardMeetingCreate'

  /api/v1/board/meetings/{meetingId}:
    get:
      summary: Get meeting details

    put:
      summary: Update meeting (attendance, decisions)

  /api/v1/board/meetings/{meetingId}/attendance:
    put:
      summary: Record attendance
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                attendance:
                  type: array
                  items:
                    type: object
                    properties:
                      memberId:
                        type: string
                      present:
                        type: boolean
                      attendanceType:
                        type: string

  # Board Evaluation
  /api/v1/board/evaluations:
    get:
      summary: List board evaluations
      parameters:
        - name: organizationId
          in: query
          required: true
      responses:
        200:
          description: List of evaluations

    post:
      summary: Create board evaluation
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BoardEvaluationCreate'

  /api/v1/board/evaluations/{evaluationId}:
    get:
      summary: Get evaluation details

    put:
      summary: Update evaluation results

  # Governance Policies
  /api/v1/board/policies:
    get:
      summary: List governance policies
      parameters:
        - name: organizationId
          in: query
          required: true
        - name: type
          in: query
          schema:
            type: string
      responses:
        200:
          description: List of policies

    post:
      summary: Create governance policy
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GovernancePolicyCreate'

  /api/v1/board/policies/{policyId}:
    get:
      summary: Get policy details

    put:
      summary: Update policy

  # Board Diversity Targets
  /api/v1/board/diversity-targets:
    get:
      summary: Get diversity targets
      parameters:
        - name: organizationId
          in: query
          required: true
      responses:
        200:
          description: List of diversity targets

    post:
      summary: Set diversity target
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DiversityTargetCreate'

  /api/v1/board/diversity-targets/{targetId}/progress:
    get:
      summary: Get target progress
      responses:
        200:
          description: Progress towards target

  /api/v1/board/diversity-targets/nasdaq-compliance:
    get:
      summary: Check Nasdaq diversity compliance
      responses:
        200:
          description: Nasdaq compliance status

  # Reporting
  /api/v1/board/reports/gri-2:
    post:
      summary: Generate GRI 2 governance report
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                year:
                  type: integer
                format:
                  type: string
                  enum: [HTML, PDF, JSON]
      responses:
        200:
          description: Generated report

  /api/v1/board/reports/proxy-statement:
    post:
      summary: Generate proxy statement
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                year:
                  type: integer
                format:
                  type: string
                  enum: [HTML, PDF]
      responses:
        200:
          description: Generated proxy statement

  /api/v1/board/reports/csrd-g1:
    post:
      summary: Generate CSRD ESRS G1 report
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                year:
                  type: integer
                format:
                  type: string
                  enum: [HTML, PDF, JSON]
      responses:
        200:
          description: Generated report

  /api/v1/board/reports/diversity-matrix:
    get:
      summary: Get board diversity matrix (Nasdaq requirement)
      parameters:
        - name: organizationId
          in: query
          required: true
      responses:
        200:
          description: Diversity matrix

components:
  schemas:
    BoardMemberCreate:
      type: object
      properties:
        firstName:
          type: string
        lastName:
          type: string
        position:
          type: string
        appointmentDate:
          type: string
          format: date
        independence:
          type: string
        diversity:
          type: object

    ESGOversightUpdate:
      type: object
      properties:
        esgCommittee:
          type: object
        boardTraining:
          type: object
        agendaItems:
          type: array

    ShareholderProposalCreate:
      type: object
      properties:
        proponent:
          type: string
        topic:
          type: string
        description:
          type: string
        category:
          type: string
        boardRecommendation:
          type: string
```

### GraphQL Schema

```graphql
type Query {
  # Board Composition
  boardComposition(
    organizationId: ID!
    year: Int
  ): BoardComposition

  boardMembers(
    organizationId: ID!
    status: BoardMemberStatus
    independence: IndependenceClassification
  ): [BoardMember!]!

  boardMember(memberId: ID!): BoardMember

  # Board Diversity
  boardDiversity(
    organizationId: ID!
    year: Int
  ): BoardDiversity

  nasdaqCompliance(
    organizationId: ID!
  ): NasdaqComplianceStatus

  # Skills Matrix
  boardSkillsMatrix(
    organizationId: ID!
  ): BoardSkillsMatrix

  skillGaps(
    organizationId: ID!
  ): [SkillGap!]!

  # ESG Oversight
  esgOversight(
    organizationId: ID!
    year: Int
  ): ESGOversight

  esgTraining(
    organizationId: ID!
    year: Int
  ): ESGTrainingSummary

  # Executive Compensation
  executiveCompensation(
    organizationId: ID!
    year: Int
  ): ExecutiveCompensation

  ceoPayRatio(
    organizationId: ID!
    year: Int
  ): CEOPayRatio

  # Shareholder Engagement
  shareholderEngagement(
    organizationId: ID!
    year: Int
  ): ShareholderEngagement

  shareholderProposals(
    organizationId: ID!
    year: Int
    category: String
  ): [ShareholderProposal!]!

  agm(
    organizationId: ID!
    year: Int
  ): AGM

  # Board Meetings
  boardMeetings(
    organizationId: ID!
    year: Int
  ): [BoardMeeting!]!

  boardMeeting(meetingId: ID!): BoardMeeting

  # Board Evaluation
  boardEvaluations(
    organizationId: ID!
  ): [BoardEvaluation!]!

  boardEvaluation(evaluationId: ID!): BoardEvaluation

  # Reports
  boardReport(
    organizationId: ID!
    year: Int!
    reportType: ReportType!
  ): BoardReport
}

type Mutation {
  # Board Member Management
  addBoardMember(
    input: BoardMemberInput!
  ): BoardMember!

  updateBoardMember(
    memberId: ID!
    input: BoardMemberUpdateInput!
  ): BoardMember!

  resignBoardMember(
    memberId: ID!
    resignationDate: Date!
    reason: String
  ): BoardMember!

  # Board Composition
  updateBoardComposition(
    organizationId: ID!
    input: BoardCompositionInput!
  ): BoardComposition!

  # Skills Matrix
  updateSkillsMatrix(
    organizationId: ID!
    input: SkillsMatrixInput!
  ): BoardSkillsMatrix!

  # ESG Oversight
  logESGTraining(
    organizationId: ID!
    input: ESGTrainingInput!
  ): ESGTraining!

  addESGAgendaItem(
    organizationId: ID!
    input: ESGAgendaItemInput!
  ): ESGAgendaItem!

  # Executive Compensation
  recordExecutiveCompensation(
    organizationId: ID!
    year: Int!
    input: ExecutiveCompensationInput!
  ): ExecutiveCompensation!

  recordSayOnPayVote(
    organizationId: ID!
    input: SayOnPayVoteInput!
  ): SayOnPayVote!

  # Shareholder Engagement
  createAGM(
    organizationId: ID!
    input: AGMInput!
  ): AGM!

  addShareholderProposal(
    organizationId: ID!
    input: ShareholderProposalInput!
  ): ShareholderProposal!

  recordProxyVoting(
    organizationId: ID!
    input: ProxyVotingInput!
  ): ProxyVotingResults!

  # Board Meetings
  createBoardMeeting(
    organizationId: ID!
    input: BoardMeetingInput!
  ): BoardMeeting!

  recordAttendance(
    meetingId: ID!
    attendance: [AttendanceInput!]!
  ): BoardMeeting!

  # Board Evaluation
  createBoardEvaluation(
    organizationId: ID!
    input: BoardEvaluationInput!
  ): BoardEvaluation!

  # Diversity Targets
  setDiversityTarget(
    organizationId: ID!
    input: DiversityTargetInput!
  ): DiversityTarget!

  updateDiversityTargetProgress(
    targetId: ID!
    currentValue: Float!
  ): DiversityTarget!

  # Reports
  generateBoardReport(
    organizationId: ID!
    year: Int!
    reportType: ReportType!
    format: ReportFormat!
  ): BoardReport!
}

type Subscription {
  # Real-time Updates
  boardMemberUpdated(
    organizationId: ID!
  ): BoardMember!

  sayOnPayVoteResult(
    organizationId: ID!
  ): SayOnPayVote!

  shareholderProposalVoted(
    organizationId: ID!
  ): ShareholderProposal!

  boardMeetingStarted(
    organizationId: ID!
  ): BoardMeeting!
}

type BoardComposition {
  id: ID!
  organizationId: ID!
  year: Int!
  structure: BoardStructure!
  leadership: BoardLeadership!
  independence: IndependenceBreakdown!
  diversity: BoardDiversity!
  tenure: TenureAnalysis!
  committees: [Committee!]!
  refreshment: BoardRefreshment!
  metadata: Metadata!
}

type BoardMember {
  id: ID!
  memberId: ID!
  personal: PersonalInfo!
  boardRole: BoardRole!
  independence: Independence!
  committees: [CommitteeMembership!]!
  attendance: [AttendanceRecord!]!
  diversity: DiversityAttributes!
  skills: SkillsProfile!
  esgTraining: ESGTrainingRecord!
  otherDirectorships: [Directorship!]!
  overboardingAssessment: OverboardingAssessment!
  compensation: [CompensationRecord!]!
  shareOwnership: ShareOwnership!
  metadata: Metadata!
}

type ESGOversight {
  id: ID!
  organizationId: ID!
  year: Int!
  esgCommittee: ESGCommittee!
  boardTraining: BoardTrainingSummary!
  agendaItems: [ESGAgendaItem!]!
  performanceScorecard: ESGPerformanceScorecard!
  esgMetricsInMaterials: ESGMetricsTracking!
  externalEngagement: ExternalESGEngagement!
  metadata: Metadata!
}

type ExecutiveCompensation {
  id: ID!
  organizationId: ID!
  year: Int!
  ceoCompensation: CEOCompensation!
  ceoPayRatio: CEOPayRatio!
  neos: [NEOCompensation!]!
  esgMetricsInCompensation: ESGCompensationMetrics!
  compensationPhilosophy: CompensationPhilosophy!
  clawbackPolicy: ClawbackPolicy!
  sayOnPay: SayOnPayVote!
  equityOwnershipGuidelines: EquityOwnershipGuidelines!
  metadata: Metadata!
}

type ShareholderEngagement {
  id: ID!
  organizationId: ID!
  year: Int!
  agm: AGM!
  proxyVoting: ProxyVotingResults!
  shareholderProposals: [ShareholderProposal!]!
  institutionalInvestorEngagement: InstitutionalEngagement!
  activistShareholders: [ActivistShareholder!]!
  proxyAdvisorRecommendations: ProxyAdvisorRecommendations!
  shareholderCommunication: ShareholderCommunication!
  metadata: Metadata!
}

enum BoardMemberStatus {
  ACTIVE
  RESIGNED
  RETIRED
  DECEASED
}

enum IndependenceClassification {
  INDEPENDENT
  NON_INDEPENDENT
  MANAGEMENT
  AFFILIATED
}

enum ReportType {
  GRI_2
  CSRD_G1
  PROXY_STATEMENT
  UK_CORPORATE_GOVERNANCE_CODE
}

enum ReportFormat {
  HTML
  PDF
  JSON
  DOCX
}
```

## Event-Driven Architecture

### Published Events

```typescript
// Domain Events
export const BOARD_EVENTS = {
  // Board Member Events
  BOARD_MEMBER_APPOINTED: 'board.member.appointed.v1',
  BOARD_MEMBER_RESIGNED: 'board.member.resigned.v1',
  BOARD_MEMBER_INDEPENDENCE_CLASSIFIED: 'board.member.independence-classified.v1',
  BOARD_MEMBER_COMMITTEE_ASSIGNED: 'board.member.committee-assigned.v1',

  // Board Diversity Events
  BOARD_DIVERSITY_TARGET_SET: 'board.diversity-target.set.v1',
  BOARD_DIVERSITY_TARGET_ACHIEVED: 'board.diversity-target.achieved.v1',
  NASDAQ_DIVERSITY_COMPLIANCE_ACHIEVED: 'board.nasdaq-compliance.achieved.v1',
  NASDAQ_DIVERSITY_COMPLIANCE_AT_RISK: 'board.nasdaq-compliance.at-risk.v1',

  // ESG Oversight Events
  ESG_COMMITTEE_ESTABLISHED: 'board.esg-committee.established.v1',
  ESG_TRAINING_COMPLETED: 'board.esg-training.completed.v1',
  ESG_AGENDA_ITEM_DISCUSSED: 'board.esg-agenda-item.discussed.v1',
  ESG_OVERSIGHT_UPDATED: 'board.esg-oversight.updated.v1',

  // Compensation Events
  CEO_PAY_RATIO_CALCULATED: 'board.ceo-pay-ratio.calculated.v1',
  SAY_ON_PAY_VOTE_COMPLETED: 'board.say-on-pay.voted.v1',
  SAY_ON_PAY_FAILED: 'board.say-on-pay.failed.v1',
  ESG_COMPENSATION_METRICS_ADDED: 'board.esg-comp-metrics.added.v1',

  // Shareholder Engagement Events
  AGM_COMPLETED: 'board.agm.completed.v1',
  SHAREHOLDER_PROPOSAL_SUBMITTED: 'board.shareholder-proposal.submitted.v1',
  SHAREHOLDER_PROPOSAL_VOTED: 'board.shareholder-proposal.voted.v1',
  SHAREHOLDER_PROPOSAL_PASSED: 'board.shareholder-proposal.passed.v1',
  PROXY_VOTING_COMPLETED: 'board.proxy-voting.completed.v1',

  // Board Meeting Events
  BOARD_MEETING_SCHEDULED: 'board.meeting.scheduled.v1',
  BOARD_MEETING_COMPLETED: 'board.meeting.completed.v1',
  BOARD_QUORUM_NOT_MET: 'board.meeting.quorum-not-met.v1',

  // Board Evaluation Events
  BOARD_EVALUATION_COMPLETED: 'board.evaluation.completed.v1',
  BOARD_SKILL_GAP_IDENTIFIED: 'board.skill-gap.identified.v1',

  // Governance Events
  GOVERNANCE_POLICY_UPDATED: 'board.governance-policy.updated.v1',
  BOARD_CHARTER_UPDATED: 'board.charter.updated.v1',

  // Reporting Events
  PROXY_STATEMENT_PUBLISHED: 'board.proxy-statement.published.v1',
  BOARD_REPORT_GENERATED: 'board.report.generated.v1'
};

// Event Schemas
interface BoardMemberAppointedEvent {
  eventId: string;
  eventType: 'board.member.appointed.v1';
  timestamp: Date;
  memberId: string;
  memberName: string;
  organizationId: string;
  position: string;
  appointmentDate: Date;
  independence: string;
  diversity: {
    gender: string;
    ethnicity: string;
    underrepresentedGroup: boolean;
  };
  correlationId: string;
}

interface BoardDiversityTargetAchievedEvent {
  eventId: string;
  eventType: 'board.diversity-target.achieved.v1';
  timestamp: Date;
  organizationId: string;
  targetId: string;
  targetName: string;
  targetType: string;
  targetValue: number;
  currentValue: number;
  achievementDate: Date;
  correlationId: string;
}

interface NasdaqComplianceAchievedEvent {
  eventId: string;
  eventType: 'board.nasdaq-compliance.achieved.v1';
  timestamp: Date;
  organizationId: string;
  diverseDirectors: number;
  femaleDirectors: number;
  complianceDate: Date;
  correlationId: string;
}

interface SayOnPayVoteCompletedEvent {
  eventId: string;
  eventType: 'board.say-on-pay.voted.v1';
  timestamp: Date;
  organizationId: string;
  year: number;
  voteDate: Date;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  approvalPercentage: number;
  passed: boolean;
  correlationId: string;
}

interface ShareholderProposalPassedEvent {
  eventId: string;
  eventType: 'board.shareholder-proposal.passed.v1';
  timestamp: Date;
  organizationId: string;
  proposalId: string;
  topic: string;
  category: string;
  proponent: string;
  votesFor: number;
  votesAgainst: number;
  approvalPercentage: number;
  implementationRequired: boolean;
  correlationId: string;
}
```

### Consumed Events

```typescript
// Events from other services
export const CONSUMED_EVENTS = {
  // From Organization Service
  ORGANIZATION_CREATED: 'organization.entity.created.v1',
  ORGANIZATION_SECTOR_UPDATED: 'organization.sector.updated.v1',

  // From Diversity Service
  DEI_TARGET_SET: 'diversity.target.set.v1',
  DEI_TARGET_ACHIEVED: 'diversity.target.achieved.v1',

  // From Risk Service
  MATERIAL_RISK_IDENTIFIED: 'risk.material-risk.identified.v1',
  CLIMATE_RISK_ASSESSED: 'risk.climate-risk.assessed.v1',

  // From Ethics Service
  CODE_OF_CONDUCT_UPDATED: 'ethics.code-of-conduct.updated.v1',
  ETHICS_VIOLATION_REPORTED: 'ethics.violation.reported.v1',

  // From Reporting Service
  SUSTAINABILITY_REPORT_PUBLISHED: 'reporting.sustainability-report.published.v1'
};

// Event Handlers
@EventsHandler(OrganizationCreatedEvent)
export class OrganizationCreatedHandler {
  async handle(event: OrganizationCreatedEvent) {
    // Create default board composition structure
    // Set up board diversity targets based on listing exchange
  }
}

@EventsHandler(MaterialRiskIdentifiedEvent)
export class MaterialRiskIdentifiedHandler {
  async handle(event: MaterialRiskIdentifiedEvent) {
    // Add to board risk oversight agenda
    // Update ESG oversight scorecard
  }
}
```

## Security & Compliance

### Security Measures

```typescript
// Security Controls
export class SecurityControls {
  // Data Classification
  dataClassification = {
    publicDisclosure: ['board_composition', 'board_diversity', 'executive_compensation', 'shareholder_engagement'],
    confidential: ['board_meetings', 'board_evaluations', 'governance_policies'],
    highlyConfidential: ['meeting_minutes', 'individual_assessments', 'executive_sessions']
  };

  // Encryption
  encryption = {
    atRest: {
      publicData: false, // MongoDB without encryption
      confidentialData: true, // PostgreSQL with field-level encryption
      highlyConfidentialData: true, // PostgreSQL with AES-256-GCM
      algorithm: 'AES-256-GCM'
    },
    inTransit: {
      protocol: 'TLS 1.3',
      enforced: true
    }
  };

  // Access Control
  accessControl = {
    boardMembers: ['board_governance_admin', 'board_member', 'executive'],
    boardMeetingMinutes: ['board_governance_admin', 'board_secretary', 'legal'],
    compensationData: ['compensation_committee', 'hr_director', 'ceo'],
    confidentialEvaluations: ['board_governance_admin', 'external_evaluator']
  };

  // Audit Logging
  auditLogging = {
    dataAccess: true,
    dataModification: true,
    exportOperations: true,
    shareholderProposalChanges: true,
    compensationDataAccess: true,
    retentionPeriod: '10 years' // Regulatory requirement
  };

  // Data Anonymization
  anonymization = {
    individualEvaluations: true, // Anonymize peer reviews
    shareholderProposals: false, // Proponent name required
    votingResults: false // Public disclosure
  };
}
```

### Compliance Requirements

```typescript
// Regulatory Compliance
export const COMPLIANCE_REQUIREMENTS = {
  // GRI Standards
  GRI_2: {
    gri_2_9_governance_structure: true,
    gri_2_10_nomination: true,
    gri_2_11_chair: true,
    gri_2_12_oversight_role: true,
    gri_2_13_delegation: true,
    gri_2_14_sustainability_reporting: true,
    gri_2_17_collective_knowledge: true,
    gri_2_18_performance_evaluation: true,
    gri_2_19_2_20_remuneration: true,
    gri_2_21_ceo_pay_ratio: true
  },

  // CSRD ESRS G1
  CSRD_ESRS_G1: {
    businessConduct: true,
    corporateCulture: true,
    whistleblowerProtection: true,
    antiCorruption: true,
    politicalInfluence: true,
    lobbyingActivities: true,
    boardOversight: true
  },

  // Nasdaq Board Diversity Rules
  NASDAQ_DIVERSITY: {
    applicableListing: 'NASDAQ', // or NYSE, LSE, etc.
    tier: 1, // Nasdaq tier 1 or tier 2
    requirements: {
      diverseDirectors: 2, // At least 2
      femaleDirectors: 1, // At least 1
      disclosureDeadline: '2023-08-08', // August 8, 2023
      complianceDeadline: '2025-08-08', // August 8, 2025
      diversityMatrixRequired: true,
      explainOrComply: true // Explain if not compliant
    }
  },

  // UK Corporate Governance Code
  UK_CORPORATE_GOVERNANCE: {
    applicable: false, // If UK-listed
    requirements: {
      chairIndependence: true,
      halfBoardIndependent: true,
      annualElection: true,
      boardEvaluation: true,
      successionPlanning: true
    }
  },

  // NYSE Listed Company Manual
  NYSE_LISTING: {
    applicable: false, // If NYSE-listed
    requirements: {
      majorityIndependent: true,
      fullyIndependentCommittees: true,
      codeOfConduct: true,
      shareholderApprovalForEquityPlans: true
    }
  },

  // SEC Proxy Rules
  SEC_PROXY: {
    schedule14A: true, // Proxy statement
    form8K: true, // Material events (director changes)
    form10K: true, // Annual report (governance)
    ceoPayRatioDisclosure: true, // Dodd-Frank requirement
    sayOnPayVote: true, // Every 1-3 years
    sayOnPayFrequencyVote: true // Every 6 years
  },

  // Dodd-Frank Act
  DODD_FRANK: {
    ceoPayRatio: true, // Section 953(b)
    clawbackPolicy: true, // Section 954
    hedgingDisclosure: true, // Section 955
    sayOnPay: true // Section 951
  }
};
```

## Integration Specifications

### External System Integrations

```typescript
// Proxy Advisory Firms
export class ProxyAdvisorIntegration {
  async fetchISSRecommendations(ticker: string, year: number) {
    // ISS (Institutional Shareholder Services) API integration
    const endpoint = process.env.ISS_API_URL;
    const apiKey = process.env.ISS_API_KEY;

    return fetch(`${endpoint}/recommendations/${ticker}/${year}`, {
      headers: { 'X-API-Key': apiKey }
    });
  }

  async fetchGlassLewisRecommendations(ticker: string, year: number) {
    // Glass Lewis API integration
    const endpoint = process.env.GLASS_LEWIS_API_URL;
    const apiKey = process.env.GLASS_LEWIS_API_KEY;

    return fetch(`${endpoint}/recommendations/${ticker}/${year}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
  }
}

// SEC EDGAR Integration
export class SECEdgarIntegration {
  async fetchProxyStatement(cik: string, year: number) {
    // Fetch DEF 14A (proxy statement) from SEC EDGAR
    const endpoint = 'https://data.sec.gov/submissions/';

    return fetch(`${endpoint}/CIK${cik}.json`, {
      headers: { 'User-Agent': 'Clenergize ESG Platform contact@clenergize.com' }
    });
  }

  async submitForm8K(data: Form8KData) {
    // Submit Form 8-K for material board events
    // Requires EDGAR filing credentials
  }
}

// Board Portal Integration
export class BoardPortalIntegration {
  platforms = {
    DiligentBoards: {
      endpoint: process.env.DILIGENT_API_URL,
      apiKey: process.env.DILIGENT_API_KEY
    },
    BoardEffect: {
      endpoint: process.env.BOARDEFFECT_API_URL,
      apiKey: process.env.BOARDEFFECT_API_KEY
    },
    NasdaqBoardvantage: {
      endpoint: process.env.BOARDVANTAGE_API_URL,
      apiKey: process.env.BOARDVANTAGE_API_KEY
    }
  };

  async syncMeetingMinutes(platform: string, meetingId: string) {
    // Sync meeting minutes from board portal
  }

  async syncBoardDocuments(platform: string, documentType: string) {
    // Sync board documents (charters, policies, etc.)
  }
}

// Stock Exchange Integration
export class StockExchangeIntegration {
  async reportBoardChanges(exchange: string, data: BoardChangeData) {
    // Report board composition changes to stock exchange
    // Required for compliance with listing rules
  }

  async fetchDiversityRequirements(exchange: string) {
    // Fetch diversity requirements from exchange
    // (Nasdaq, NYSE, LSE, etc.)
  }
}
```

## Performance & Scalability

### Performance Targets

```typescript
export const PERFORMANCE_TARGETS = {
  // API Response Times (p95)
  apiResponseTime: {
    read: 200, // ms
    write: 400, // ms
    bulk: 1500 // ms
  },

  // Report Generation
  reportGeneration: {
    boardCompositionReport: 3000, // ms
    proxyStatement: 15000, // ms
    gri2Report: 8000, // ms
    csrdG1Report: 10000 // ms
  },

  // Data Synchronization
  boardPortalSync: {
    meetingMinutes: 5000, // ms
    documents: 10000 // ms
  },

  // Real-time Requirements
  sayOnPayVoteResults: {
    notification: 1000 // ms (during AGM)
  },

  // Scalability
  concurrentUsers: 100, // Board members + staff
  boardMembersSupported: 1000, // Across all organizations
  meetingsPerMonth: 10000,
  eventsPerSecond: 100
};
```

### Database Optimization

```typescript
// MongoDB Optimization
export const MONGODB_OPTIMIZATION = {
  // Indexes
  indexes: [
    { collection: 'board_members', index: { memberId: 1 }, unique: true },
    { collection: 'board_members', index: { organizationId: 1, 'boardRole.status': 1 } },
    { collection: 'board_members', index: { 'independence.classification': 1 } },
    { collection: 'board_composition', index: { organizationId: 1, year: -1 }, unique: true },
    { collection: 'esg_oversight', index: { organizationId: 1, year: -1 }, unique: true },
    { collection: 'shareholder_engagement', index: { organizationId: 1, year: -1 }, unique: true }
  ],

  // Aggregation Pipelines (for complex queries)
  aggregations: {
    // Board diversity summary
    diversitySummary: [
      { $match: { organizationId: '$organizationId', 'boardRole.status': 'ACTIVE' } },
      { $group: {
          _id: null,
          totalMembers: { $sum: 1 },
          female: { $sum: { $cond: [{ $eq: ['$diversity.gender', 'FEMALE'] }, 1, 0] } },
          underrepresented: { $sum: { $cond: ['$diversity.underrepresentedGroup', 1, 0] } },
          avgTenure: { $avg: '$boardRole.tenureYears' }
        }
      }
    ],

    // Skills gap analysis
    skillsGapAnalysis: [
      { $match: { organizationId: '$organizationId' } },
      { $project: {
          skills: { $objectToArray: '$skills' }
        }
      },
      { $unwind: '$skills' },
      { $group: {
          _id: '$skills.k',
          count: { $sum: { $cond: ['$skills.v', 1, 0] } }
        }
      }
    ]
  },

  // Caching Strategy
  caching: {
    boardComposition: 3600, // 1 hour (changes infrequently)
    boardDiversity: 3600, // 1 hour
    esgOversight: 1800, // 30 minutes
    executiveCompensation: 86400, // 24 hours (annual data)
    shareholderEngagement: 3600 // 1 hour
  }
};

// PostgreSQL Optimization (Confidential Data)
export const POSTGRESQL_OPTIMIZATION = {
  // Encryption
  encryption: {
    columnLevel: ['meeting_minutes_content', 'individual_assessments', 'executive_session_notes'],
    algorithm: 'AES-256-GCM',
    keyRotation: 90 // days
  },

  // Indexes
  indexes: [
    { table: 'meeting_minutes', column: 'meeting_id', unique: true },
    { table: 'meeting_minutes', column: 'organization_id' },
    { table: 'meeting_minutes', column: 'meeting_date' }
  ],

  // Backup
  backup: {
    frequency: 'daily',
    retention: 3650 // days (10 years)
  }
};
```

## Testing Strategy

### Test Coverage Requirements

```yaml
unit_tests:
  coverage: 90%
  focus_areas:
    - CEO pay ratio calculations
    - Board diversity metrics
    - Independence classification logic
    - Overboarding assessment
    - Nasdaq compliance checking
    - Skills matrix gap analysis

integration_tests:
  coverage: 85%
  scenarios:
    - Board member lifecycle (appointment → resignation)
    - Say-on-pay vote workflow
    - Shareholder proposal submission and voting
    - AGM execution and proxy voting
    - Board evaluation workflow
    - Report generation (GRI, CSRD, proxy)

e2e_tests:
  critical_paths:
    - Annual proxy statement generation
    - Nasdaq diversity compliance reporting
    - CEO pay ratio disclosure
    - Say-on-pay vote execution
    - Shareholder proposal lifecycle
    - Board evaluation and action planning

performance_tests:
  scenarios:
    - Board composition report generation (target: <3s)
    - Proxy statement generation (target: <15s)
    - Concurrent say-on-pay vote submissions (100 votes/second)
    - Diversity matrix calculation (target: <1s)

security_tests:
  requirements:
    - Meeting minutes encryption verification
    - Access control for confidential data
    - Individual assessment anonymization
    - Audit log integrity
    - Data export redaction (confidential fields)
```

### Test Implementation Examples

```typescript
// Unit Test: CEO Pay Ratio Calculation
describe('CEOPayRatioCalculator', () => {
  it('should calculate correct CEO pay ratio', () => {
    const calculator = new CEOPayRatioCalculator();
    const ceoComp = 15000000; // $15M
    const medianEmpComp = 50000; // $50K

    const ratio = calculator.calculate(ceoComp, medianEmpComp);

    expect(ratio).toBe(300); // 300:1
  });

  it('should handle edge case: median employee is CEO', () => {
    const calculator = new CEOPayRatioCalculator();
    const ceoComp = 15000000;
    const medianEmpComp = 15000000;

    const ratio = calculator.calculate(ceoComp, medianEmpComp);

    expect(ratio).toBe(1); // 1:1
  });
});

// Integration Test: Board Diversity Target Achievement
describe('Board Diversity Target Integration', () => {
  it('should trigger achievement event when target met', async () => {
    // Set target: 30% female directors
    const target = await boardService.setDiversityTarget({
      organizationId: 'org-123',
      targetType: 'GENDER',
      targetValue: 30
    });

    // Add female director
    await boardService.addBoardMember({
      organizationId: 'org-123',
      firstName: 'Jane',
      lastName: 'Doe',
      position: 'MEMBER',
      diversity: { gender: 'FEMALE' }
    });

    // Check if achievement event published
    expect(eventBus.publishedEvents).toContainEqual(
      expect.objectContaining({
        eventType: 'board.diversity-target.achieved.v1',
        targetId: target.id
      })
    );
  });
});

// E2E Test: Proxy Statement Generation
describe('Proxy Statement Generation E2E', () => {
  it('should generate complete proxy statement', async () => {
    // Setup: Create board members, compensation data, etc.
    await seedBoardData('org-456', 2024);

    // Generate proxy statement
    const response = await request(app.getHttpServer())
      .post('/api/v1/board/reports/proxy-statement')
      .send({ organizationId: 'org-456', year: 2024, format: 'PDF' })
      .expect(200);

    expect(response.body).toHaveProperty('reportUrl');
    expect(response.body.reportUrl).toMatch(/\.pdf$/);

    // Verify proxy statement content
    const proxyStatement = await downloadAndParsePDF(response.body.reportUrl);
    expect(proxyStatement).toContain('PROXY STATEMENT');
    expect(proxyStatement).toContain('Board of Directors');
    expect(proxyStatement).toContain('Executive Compensation');
    expect(proxyStatement).toContain('CEO Pay Ratio');
  });
});
```

## Monitoring & Observability

### Key Metrics

```typescript
export const MONITORING_METRICS = {
  // Business Metrics
  businessMetrics: {
    totalBoardMembers: 'gauge',
    independentDirectorsPercentage: 'gauge',
    femaleDirectorsPercentage: 'gauge',
    underrepresentedMinorityPercentage: 'gauge',
    nasdaqComplianceStatus: 'gauge', // 0 = non-compliant, 1 = compliant
    averageBoardTenure: 'gauge',
    boardMeetingsPerYear: 'gauge',
    esgTrainingHoursTotal: 'gauge',
    ceoPayRatio: 'gauge',
    sayOnPayApprovalRate: 'gauge',
    shareholderProposalsTotal: 'counter',
    shareholderProposalsPassed: 'counter'
  },

  // Operational Metrics
  operationalMetrics: {
    boardMembersAddedPerMonth: 'counter',
    boardEvaluationsCompleted: 'counter',
    proxyStatementsGenerated: 'counter',
    boardReportsGenerated: 'counter',
    agmsCompleted: 'counter'
  },

  // Performance Metrics
  performanceMetrics: {
    apiResponseTime: 'histogram',
    reportGenerationTime: 'histogram',
    boardCompositionCalculationTime: 'histogram',
    databaseQueryTime: 'histogram'
  },

  // Compliance Metrics
  complianceMetrics: {
    nasdaqDiversityCompliance: 'gauge',
    independenceRequirementsMet: 'gauge',
    boardEvaluationCurrent: 'gauge', // 0 = overdue, 1 = current
    governancePoliciesUpToDate: 'gauge'
  }
};

// Dashboards
export const DASHBOARDS = {
  executive: [
    'Board Composition Overview',
    'Board Diversity Metrics',
    'Nasdaq Compliance Status',
    'ESG Oversight Scorecard',
    'CEO Pay Ratio Trend',
    'Say-on-Pay Vote Results'
  ],

  operational: [
    'Board Member Status',
    'Committee Composition',
    'Board Meeting Attendance',
    'ESG Training Progress',
    'Shareholder Proposal Status',
    'Governance Policy Review Calendar'
  ],

  compliance: [
    'Nasdaq Diversity Matrix',
    'Independence Requirements',
    'Board Evaluation Status',
    'Governance Policy Expiry',
    'Proxy Filing Deadlines',
    'SEC Disclosure Compliance'
  ]
};
```

### Alerts Configuration

```typescript
export const ALERT_RULES = {
  critical: {
    nasdaqNonCompliance: {
      condition: 'nasdaqComplianceStatus == 0 AND daysUntilDeadline < 180',
      notification: ['email', 'slack'],
      escalation: 'immediate',
      recipients: ['board_secretary', 'ceo', 'general_counsel']
    },

    sayOnPayFailed: {
      condition: 'sayOnPayApprovalRate < 0.5',
      notification: ['email', 'phone'],
      escalation: 'immediate',
      recipients: ['board_chair', 'compensation_committee_chair', 'ceo']
    },

    boardQuorumNotMet: {
      condition: 'boardMeetingQuorumMet == false',
      notification: ['email', 'sms'],
      escalation: 'immediate',
      recipients: ['board_secretary', 'board_chair']
    }
  },

  high: {
    boardIndependenceAtRisk: {
      condition: 'independentDirectorsPercentage < 0.5',
      notification: ['email', 'slack'],
      escalation: '1_day',
      recipients: ['board_secretary', 'nominating_committee_chair']
    },

    shareholderProposalPassed: {
      condition: 'shareholderProposalPassed == true',
      notification: ['email'],
      escalation: '2_hours',
      recipients: ['board_chair', 'ceo', 'general_counsel']
    },

    boardEvaluationOverdue: {
      condition: 'daysSinceLastEvaluation > 365',
      notification: ['email'],
      escalation: '1_week',
      recipients: ['board_secretary', 'board_chair']
    }
  },

  medium: {
    diversityTargetAtRisk: {
      condition: 'daysUntilTargetDeadline < 90 AND progressPercentage < 50',
      notification: ['email'],
      frequency: 'weekly',
      recipients: ['board_secretary', 'nominating_committee']
    },

    governancePolicyExpiring: {
      condition: 'daysUntilPolicyReview < 30',
      notification: ['email'],
      frequency: 'weekly',
      recipients: ['board_secretary', 'legal']
    }
  }
};
```

## Deployment & Infrastructure

### Container Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build application
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

USER nodejs

EXPOSE 3031

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["node", "dist/main.js"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: board-service
  namespace: clenergize-governance
spec:
  replicas: 2
  selector:
    matchLabels:
      app: board-service
  template:
    metadata:
      labels:
        app: board-service
        version: v1.0.0
    spec:
      serviceAccountName: board-service
      containers:
      - name: board-service
        image: clenergize/board-service:1.0.0
        ports:
        - containerPort: 3031
        env:
        - name: NODE_ENV
          value: production
        - name: PORT
          value: "3031"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: uri
        - name: POSTGRESQL_URI
          valueFrom:
            secretKeyRef:
              name: postgresql-secret
              key: uri
        - name: KAFKA_BROKERS
          value: kafka-cluster:9092
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3031
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3031
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: board-service
  namespace: clenergize-governance
spec:
  selector:
    app: board-service
  ports:
  - port: 3031
    targetPort: 3031
    protocol: TCP
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: board-service-hpa
  namespace: clenergize-governance
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: board-service
  minReplicas: 2
  maxReplicas: 5
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

## Documentation & Support

### API Documentation

The service provides comprehensive API documentation:

- **OpenAPI/Swagger**: Available at `/api-docs`
- **GraphQL Playground**: Available at `/graphql`
- **AsyncAPI Docs**: Available at `/events-docs`
- **Postman Collection**: Available in `/docs/postman`

### Service Runbooks

Critical runbooks for operations:

1. **Nasdaq Diversity Non-Compliance Response**
   - Immediate notification to board secretary and general counsel
   - Assess current board composition
   - Identify recruitment needs
   - Engage search firm if necessary
   - Update diversity matrix
   - File disclosure with exchange

2. **Say-on-Pay Vote Failure Response**
   - Immediate notification to board chair and compensation committee
   - Shareholder engagement plan
   - Compensation policy review
   - Proxy advisor engagement
   - Next steps disclosure

3. **Shareholder Proposal Passed Response**
   - Review proposal terms
   - Legal assessment
   - Implementation plan development
   - Timeline establishment
   - Stakeholder communication
   - Progress tracking

4. **Board Evaluation Overdue Response**
   - Schedule board evaluation
   - Engage external evaluator (if required)
   - Distribute evaluation materials
   - Collect responses
   - Analyze results
   - Present to board

### Development Guidelines

```typescript
// Code Structure
src/
├── domain/                 # Business logic (pure)
│   ├── aggregates/        # DDD aggregates
│   ├── services/          # Domain services
│   └── events/            # Domain events
├── application/           # Use cases
│   ├── commands/          # Command handlers
│   ├── queries/           # Query handlers
│   └── sagas/            # Multi-step workflows
├── infrastructure/        # External dependencies
│   ├── persistence/       # Database adapters
│   ├── messaging/         # Event bus
│   └── integration/       # External APIs
└── interfaces/           # API layer
    ├── rest/            # REST controllers
    ├── graphql/         # GraphQL resolvers
    └── websocket/       # Real-time handlers

// Naming Conventions
- Aggregates: PascalCase singular (BoardMember, BoardComposition)
- Events: past tense (BoardMemberAppointed, SayOnPayVoted)
- Commands: imperative (AppointBoardMember, RecordSayOnPayVote)
- Queries: descriptive (GetBoardComposition, ListBoardMembers)
```

## Service Team & Ownership

**Service Owner**: Governance Domain Team
**Technical Lead**: Senior Backend Engineer
**Product Owner**: ESG Governance Product Manager
**On-Call Rotation**: Business hours coverage (board governance not 24/7 critical)

**Stakeholders**:
- Board of Directors (primary users)
- Board Secretary (administrator)
- Legal/General Counsel (compliance)
- Investor Relations (shareholder engagement)
- HR/Compensation (executive compensation)
- ESG Team (ESG oversight)

**SLA Commitments**:
- Availability: 99.5% uptime (business hours critical)
- API Response: <200ms p95
- Report Generation: <15s for proxy statement
- Support Response: <4 hours for critical issues (board meeting disruption)

---

*Last Updated: November 2024*
*Version: 1.0.0*
*Next Review: February 2025*
*Classification: Internal - Highly Confidential*
