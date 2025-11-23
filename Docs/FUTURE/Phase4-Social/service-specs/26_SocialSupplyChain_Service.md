# Social Supply Chain Service Specification

## Service Overview

**Service Name**: Social Supply Chain Service
**Port**: 3026
**Phase**: 4 (Social Domain - Supply Chain Social Responsibility)
**Sprint**: 4.4-4.6 (65 story points - LARGEST in Phase 4)
**Dependencies**: Organization (3002), Labor (3023), Human Rights (3027), Workforce (3021), Integration (3010), Reporting (3044)

### Business Purpose

The Social Supply Chain Service is the central platform for managing supply chain social responsibility, ethical sourcing, human rights due diligence, and modern slavery prevention across multi-tier supply chains. This service enables organizations to:

- **Assess and Monitor**: Continuously evaluate social risks across all supplier tiers using multi-factor risk scoring
- **Audit and Verify**: Manage comprehensive social audit programs (SA8000, SMETA, BSCI, WRAP, FLA, RBA)
- **Detect and Prevent**: Identify forced labor, child labor, and human rights violations through advanced screening
- **Map and Trace**: Build complete visibility across Tier 1, 2, 3+ suppliers with full traceability to origin
- **Engage and Improve**: Drive supplier capacity building and continuous improvement programs
- **Report and Comply**: Automate Modern Slavery Statements and meet all regulatory requirements

### Key Business Capabilities

1. **Supplier Social Risk Management**: Multi-dimensional risk assessment across countries, industries, and practices
2. **Social Audit Management**: End-to-end audit lifecycle from scheduling through remediation
3. **Modern Slavery Prevention**: Comprehensive screening against ILO 11 indicators of forced labor
4. **Child Labor Detection**: Age verification, risk assessment, and remediation programs
5. **Human Rights Due Diligence**: UNGPs framework implementation with impact assessments
6. **Living Wage Analysis**: Track and close living wage gaps across supply chain
7. **Multi-Tier Visibility**: Complete supply chain mapping from raw materials to finished goods
8. **Supplier Development**: Capacity building, training, and collaborative improvement
9. **Regulatory Compliance**: Automated reporting for Modern Slavery Acts and CSDDD

## Technical Architecture

### Service Design Patterns

```typescript
// Domain-Driven Design Structure
src/
├── domain/                          # Core business logic
│   ├── aggregates/
│   │   ├── supplier-risk/          # Supplier risk assessment aggregate
│   │   ├── social-audit/           # Audit management aggregate
│   │   ├── modern-slavery/         # Modern slavery screening aggregate
│   │   ├── child-labor/            # Child labor prevention aggregate
│   │   ├── human-rights/           # Human rights due diligence aggregate
│   │   ├── living-wage/            # Living wage tracking aggregate
│   │   ├── supply-chain-map/       # Multi-tier mapping aggregate
│   │   └── grievance/              # Grievance mechanism aggregate
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
│   │   ├── mongodb/                # Document store
│   │   ├── neo4j/                  # Graph database for supply chain
│   │   ├── postgresql/             # Relational data and documents
│   │   └── influxdb/               # Time-series risk scores
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
  - MongoDB 7.x (primary data store)
  - Neo4j 5.x (supply chain graph - CRITICAL)
  - PostgreSQL 16 (audit documents, evidence)
  - InfluxDB 2.x (time-series risk trends)
- **Messaging**: Apache Kafka 3.6
- **Caching**: Redis 7.x with clustering
- **API**: RESTful + GraphQL Federation
- **Real-time**: Socket.io for critical alerts
- **Documentation**: OpenAPI 3.1 + AsyncAPI 2.6

## Data Architecture

### Core Data Models

#### 1. Supplier Risk Profile

```typescript
interface SupplierRiskProfile {
  id: string;
  supplierId: string;
  supplierName: string;
  tier: SupplierTier; // TIER_1, TIER_2, TIER_3_PLUS

  // Risk Dimensions
  overallRiskScore: number; // 0-100
  riskLevel: RiskLevel; // CRITICAL, HIGH, MEDIUM, LOW

  countryRisk: {
    country: string;
    region: string;
    cpiScore: number; // Corruption Perceptions Index
    tierRanking: TIPTier; // Trafficking in Persons Report
    freedomHouseScore: number;
    laborRightsIndex: number;
    assessmentDate: Date;
  };

  industryRisk: {
    industryCode: string; // ISIC Rev.4
    industryName: string;
    sectorRisk: RiskLevel;
    knownIssues: string[];
    highRiskFactors: string[];
  };

  laborRisk: {
    forcedLaborIndicators: ForcedLaborIndicator[];
    childLaborRisk: RiskLevel;
    livingWageGap: number;
    workingHoursCompliance: boolean;
    freedomOfAssociation: boolean;
    collectiveBargaining: boolean;
  };

  modernSlaveryRisk: {
    overallScore: number;
    recruitmentFees: boolean;
    passportRetention: boolean;
    debtBondage: boolean;
    restrictedMovement: boolean;
    isolatedLocation: boolean;
    migrantWorkers: number;
    vulnerablePopulations: string[];
  };

  // Audit & Certification Status
  auditStatus: {
    lastAuditDate: Date;
    lastAuditType: AuditType;
    lastAuditScore: number;
    nextAuditDue: Date;
    openFindings: number;
    criticalFindings: number;
  };

  certifications: Certification[];

  // Risk Trends
  riskHistory: RiskSnapshot[];
  riskTrend: TrendDirection; // IMPROVING, STABLE, DETERIORATING

  // Metadata
  assessmentDate: Date;
  nextAssessmentDue: Date;
  assessedBy: string;
  dataQuality: DataQuality;
  lastUpdated: Date;
  version: number;
}

interface ForcedLaborIndicator {
  indicator: ILOIndicator;
  present: boolean;
  severity: Severity;
  evidence: string;
  affectedWorkers: number;
  remediationStatus: RemediationStatus;
}

enum ILOIndicator {
  ABUSE_OF_VULNERABILITY = 'abuse_of_vulnerability',
  DECEPTION = 'deception',
  RESTRICTION_OF_MOVEMENT = 'restriction_of_movement',
  ISOLATION = 'isolation',
  PHYSICAL_AND_SEXUAL_VIOLENCE = 'physical_and_sexual_violence',
  INTIMIDATION_AND_THREATS = 'intimidation_and_threats',
  RETENTION_OF_IDENTITY_DOCUMENTS = 'retention_of_identity_documents',
  WITHHOLDING_OF_WAGES = 'withholding_of_wages',
  DEBT_BONDAGE = 'debt_bondage',
  ABUSIVE_WORKING_CONDITIONS = 'abusive_working_conditions',
  EXCESSIVE_OVERTIME = 'excessive_overtime'
}
```

#### 2. Social Audit Record

```typescript
interface SocialAudit {
  id: string;
  auditNumber: string;
  supplierId: string;
  supplierName: string;
  facilityId: string;
  facilityLocation: Address;

  // Audit Details
  auditType: AuditType; // SA8000, SMETA, BSCI, WRAP, FLA, RBA
  auditScope: AuditScope[]; // LABOR, HEALTH_SAFETY, ENVIRONMENT, ETHICS
  auditStandard: AuditStandard;
  auditProtocol: string;

  // Scheduling
  scheduledDate: Date;
  actualDate: Date;
  duration: number; // days
  auditTeamSize: number;
  announced: boolean;

  // Audit Team
  leadAuditor: {
    name: string;
    certification: string;
    organization: string;
    contact: string;
  };
  auditTeam: AuditTeamMember[];

  // Workers Interviewed
  workersInterviewed: {
    total: number;
    byGender: { male: number; female: number; other: number };
    byType: { permanent: number; contract: number; migrant: number };
    byDepartment: Record<string, number>;
  };

  // Findings
  findings: AuditFinding[];
  totalFindings: number;
  findingsByCategory: {
    zeroTolerance: number;
    critical: number;
    major: number;
    minor: number;
    observations: number;
  };

  // Scores
  overallScore: number;
  categoryScores: {
    childLabor: number;
    forcedLabor: number;
    healthSafety: number;
    freedomOfAssociation: number;
    discrimination: number;
    disciplinaryPractices: number;
    workingHours: number;
    compensation: number;
    managementSystems: number;
  };

  // Documents
  auditReport: Document;
  correctiveActionPlan: CorrectiveActionPlan;
  photos: Photo[];
  workerTestimonies: Testimony[];
  payrollSamples: Document[];

  // Follow-up
  reAuditRequired: boolean;
  reAuditDeadline?: Date;
  reAuditCompleted?: boolean;

  // Certification
  certificationGranted: boolean;
  certificateNumber?: string;
  certificateExpiry?: Date;

  // Status
  status: AuditStatus;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedDate?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

interface AuditFinding {
  id: string;
  findingNumber: string;
  category: FindingCategory;
  severity: FindingSeverity; // ZERO_TOLERANCE, CRITICAL, MAJOR, MINOR, OBSERVATION

  // Finding Details
  clause: string; // Standard clause reference
  requirement: string;
  finding: string;
  evidence: string[];
  rootCause: string;

  // Impact
  affectedWorkers: number;
  affectedDepartments: string[];
  riskToWorkers: RiskLevel;
  riskToBusiness: RiskLevel;

  // Zero Tolerance Specifics
  zeroToleranceType?: ZeroToleranceType;
  immediateAction?: string;
  workerRemediation?: string;

  // Corrective Action
  correctiveAction: {
    action: string;
    responsible: string;
    deadline: Date;
    status: ActionStatus;
    completedDate?: Date;
    verificationMethod: string;
    evidence?: string[];
  };

  // Verification
  verified: boolean;
  verifiedBy?: string;
  verifiedDate?: Date;
  verificationNotes?: string;
}

enum ZeroToleranceType {
  CHILD_LABOR = 'child_labor',
  FORCED_LABOR = 'forced_labor',
  HUMAN_TRAFFICKING = 'human_trafficking',
  SEVERE_HEALTH_SAFETY = 'severe_health_safety',
  PHYSICAL_ABUSE = 'physical_abuse',
  SEXUAL_HARASSMENT = 'sexual_harassment',
  BRIBERY_CORRUPTION = 'bribery_corruption'
}
```

#### 3. Modern Slavery Assessment

```typescript
interface ModernSlaveryAssessment {
  id: string;
  supplierId: string;
  assessmentDate: Date;
  assessmentType: AssessmentType; // INITIAL, PERIODIC, TRIGGERED

  // ILO Indicators Assessment
  forcedLaborIndicators: {
    abuseOfVulnerability: IndicatorAssessment;
    deception: IndicatorAssessment;
    restrictionOfMovement: IndicatorAssessment;
    isolation: IndicatorAssessment;
    physicalAndSexualViolence: IndicatorAssessment;
    intimidationAndThreats: IndicatorAssessment;
    retentionOfIdentityDocuments: IndicatorAssessment;
    withholdingOfWages: IndicatorAssessment;
    debtBondage: IndicatorAssessment;
    abusiveWorkingConditions: IndicatorAssessment;
    excessiveOvertime: IndicatorAssessment;
  };

  // Recruitment Practices
  recruitmentPractices: {
    recruitmentFees: {
      charged: boolean;
      amount?: number;
      paidBy?: string; // WORKER, EMPLOYER
      repaymentPlan?: string;
    };
    laborBrokers: {
      used: boolean;
      brokerNames?: string[];
      licensed?: boolean;
      audited?: boolean;
    };
    contractTransparency: {
      languagesProvided: string[];
      termsExplained: boolean;
      changesAfterArrival: boolean;
      substitutionOccurred: boolean;
    };
  };

  // Document Retention
  documentRetention: {
    passportsHeld: boolean;
    documentsHeld: string[];
    voluntarySubmission: boolean;
    accessOnDemand: boolean;
    storageLocation: string;
    returnProcess: string;
  };

  // Freedom of Movement
  freedomOfMovement: {
    canLeaveWorkplace: boolean;
    canChangeEmployer: boolean;
    canReturnHome: boolean;
    movementRestrictions: string[];
    curfews: boolean;
    securityMeasures: string[];
  };

  // Living Conditions (if accommodation provided)
  livingConditions?: {
    accommodationProvided: boolean;
    type: string; // DORMITORY, APARTMENT, HOUSE
    occupancy: number;
    personsPerRoom: number;
    facilities: {
      runningWater: boolean;
      electricity: boolean;
      heating: boolean;
      cooling: boolean;
      kitchen: boolean;
      bathrooms: number;
    };
    safety: {
      fireExtinguishers: boolean;
      emergencyExits: boolean;
      firstAid: boolean;
      security: string;
    };
    costs: {
      rent: number;
      utilities: number;
      deductedFromWages: boolean;
    };
  };

  // Vulnerable Populations
  vulnerablePopulations: {
    migrantWorkers: {
      present: boolean;
      count: number;
      countries: string[];
      legalStatus: string[];
    };
    youngWorkers: {
      present: boolean;
      count: number;
      ageRange: { min: number; max: number };
      workRestrictions: string[];
    };
    womenWorkers: {
      percentage: number;
      pregnantWorkers: number;
      maternityProvisions: boolean;
    };
    minorityGroups: {
      present: boolean;
      groups: string[];
      discrimination: boolean;
    };
  };

  // Risk Assessment
  riskAssessment: {
    overallRisk: RiskLevel;
    riskScore: number;
    criticalIssues: string[];
    immediateActions: string[];
    mediumTermActions: string[];
    monitoringRequired: boolean;
    nextAssessmentDate: Date;
  };

  // Remediation
  remediation?: {
    required: boolean;
    plan: RemediationPlan;
    workersAffected: number;
    compensationProvided: number;
    supportServices: string[];
    timeline: string;
    status: RemediationStatus;
  };

  // Documentation
  evidence: {
    documents: Document[];
    photos: Photo[];
    workerInterviews: Interview[];
    managementInterviews: Interview[];
  };

  // Metadata
  assessedBy: string;
  reviewedBy: string;
  approvedBy?: string;
  status: AssessmentStatus;
  lastUpdated: Date;
  version: number;
}

interface IndicatorAssessment {
  present: boolean;
  severity: Severity; // NONE, LOW, MEDIUM, HIGH, CRITICAL
  evidence: string[];
  affectedWorkers: number;
  details: string;
  remediation?: string;
}
```

#### 4. Child Labor Assessment

```typescript
interface ChildLaborAssessment {
  id: string;
  supplierId: string;
  facilityId: string;
  assessmentDate: Date;

  // Age Verification
  ageVerification: {
    processInPlace: boolean;
    documentsRequired: string[];
    verificationMethod: string;
    crossCheckPerformed: boolean;
    recordsKept: boolean;
  };

  // Child Labor Detection
  childLaborDetection: {
    childrenFound: boolean;
    numberOfChildren?: number;
    ageRange?: { min: number; max: number };
    departments?: string[];
    tasks?: string[];
    workingHours?: string;
    schoolAttendance?: boolean;
  };

  // Young Workers (15-18)
  youngWorkers: {
    present: boolean;
    count: number;
    registration: {
      registered: boolean;
      permitObtained: boolean;
      parentalConsent: boolean;
    };
    workConditions: {
      hoursPerDay: number;
      nightWork: boolean;
      hazardousWork: boolean;
      overtimeAllowed: boolean;
      schoolCompatible: boolean;
    };
    protections: {
      healthChecks: boolean;
      trainingProvided: boolean;
      supervision: boolean;
      separateRecords: boolean;
    };
  };

  // Risk Factors
  riskFactors: {
    countryRisk: {
      level: RiskLevel;
      childLaborPrevalence: number;
      schoolEnrollment: number;
      povertyRate: number;
    };
    industryRisk: {
      level: RiskLevel;
      knownIssues: string[];
      seasonalWork: boolean;
      informalSector: boolean;
    };
    communityFactors: {
      ruralArea: boolean;
      educationAccess: boolean;
      economicPressure: boolean;
      culturalNorms: string[];
    };
  };

  // Prevention Measures
  preventionMeasures: {
    policy: {
      exists: boolean;
      communicated: boolean;
      languages: string[];
      training: boolean;
    };
    recruitment: {
      ageChecks: boolean;
      documentation: string[];
      interviews: boolean;
      homeVisits: boolean;
    };
    monitoring: {
      regularChecks: boolean;
      frequency: string;
      unannounced: boolean;
      thirdParty: boolean;
    };
    supplierRequirements: {
      contractualClauses: boolean;
      audits: boolean;
      certifications: string[];
      training: boolean;
    };
  };

  // Remediation Program (if children found)
  remediation?: {
    childrenAffected: number;
    remediationPlan: {
      removalFromWork: Date;
      educationSupport: {
        provided: boolean;
        type: string;
        duration: string;
        cost: number;
      };
      familySupport: {
        provided: boolean;
        type: string;
        amount: number;
        duration: string;
      };
      medicalSupport: {
        provided: boolean;
        checkups: boolean;
        treatment: string[];
      };
      monitoring: {
        frequency: string;
        duration: string;
        responsible: string;
      };
    };
    partnerOrganizations: string[];
    progressReports: ProgressReport[];
    successRate: number;
  };

  // Compliance
  compliance: {
    iloC138: boolean; // Minimum Age Convention
    iloC182: boolean; // Worst Forms of Child Labour
    nationalLaws: boolean;
    clientRequirements: boolean;
  };

  // Documentation
  documentation: {
    ageRecords: Document[];
    schoolRecords: Document[];
    workPermits: Document[];
    remediationReports: Document[];
  };

  // Assessment Results
  results: {
    riskLevel: RiskLevel;
    score: number;
    findings: string[];
    recommendations: string[];
    followUpRequired: boolean;
    nextAssessmentDate: Date;
  };

  // Metadata
  assessedBy: string;
  approvedBy: string;
  status: AssessmentStatus;
  lastUpdated: Date;
  version: number;
}
```

#### 5. Human Rights Impact Assessment

```typescript
interface HumanRightsImpactAssessment {
  id: string;
  supplierId: string;
  assessmentType: HRIAType; // INITIAL, PERIODIC, PROJECT_SPECIFIC
  scope: HRIAScope[];

  // UN Guiding Principles Framework
  ungpAlignment: {
    policyCommitment: {
      exists: boolean;
      publiclyAvailable: boolean;
      boardApproved: boolean;
      scope: string[];
      lastUpdated: Date;
    };
    dueDiligence: {
      processEstablished: boolean;
      riskIdentification: boolean;
      impactAssessment: boolean;
      mitigation: boolean;
      tracking: boolean;
      communication: boolean;
    };
    remediation: {
      mechanismExists: boolean;
      accessible: boolean;
      effective: boolean;
      transparent: boolean;
    };
  };

  // Salient Human Rights Issues
  salientIssues: SalientIssue[];

  // Stakeholder Engagement
  stakeholderEngagement: {
    stakeholderMapping: {
      completed: boolean;
      groups: StakeholderGroup[];
      prioritization: string;
    };
    consultation: {
      conducted: boolean;
      methods: string[];
      participants: number;
      feedback: string[];
      incorporation: string;
    };
    ongoingEngagement: {
      frequency: string;
      channels: string[];
      documentation: boolean;
    };
  };

  // Rights Holder Groups
  rightsHolders: {
    workers: {
      total: number;
      directEmployees: number;
      contractWorkers: number;
      supplyChainWorkers: number;
    };
    communities: {
      affected: string[];
      indigenous: boolean;
      consultation: boolean;
      consent: boolean; // FPIC
    };
    consumers: {
      affected: boolean;
      safetyRisks: string[];
      privacyRisks: string[];
    };
  };

  // Actual Impacts
  actualImpacts: HumanRightsImpact[];

  // Potential Impacts
  potentialImpacts: HumanRightsImpact[];

  // Mitigation Measures
  mitigation: {
    preventionMeasures: MitigationMeasure[];
    mitigationMeasures: MitigationMeasure[];
    remediationMeasures: MitigationMeasure[];
    effectiveness: {
      tracking: boolean;
      indicators: KPI[];
      review: string;
    };
  };

  // Grievance Mechanism
  grievanceMechanism: {
    exists: boolean;
    channels: string[];
    languages: string[];
    anonymous: boolean;
    response: {
      acknowledgment: number; // days
      investigation: number; // days
      resolution: number; // days
    };
    cases: {
      received: number;
      resolved: number;
      pending: number;
      escalated: number;
    };
    effectiveness: {
      accessible: boolean;
      predictable: boolean;
      equitable: boolean;
      transparent: boolean;
      rightsCompatible: boolean;
      continuousLearning: boolean;
    };
  };

  // Remedy Provision
  remedy: {
    casesRequiringRemedy: number;
    remedyProvided: {
      apology: number;
      restitution: number;
      rehabilitation: number;
      financialCompensation: number;
      nonRepetition: number;
    };
    totalCompensation: number;
    beneficiaries: number;
    satisfaction: number; // percentage
  };

  // Reporting & Disclosure
  disclosure: {
    publicReporting: boolean;
    reportingFramework: string[]; // GRI, UNGP, OECD
    frequency: string;
    lastReport: Date;
    transparency: {
      impacts: boolean;
      actions: boolean;
      effectiveness: boolean;
      challenges: boolean;
    };
  };

  // Action Plan
  actionPlan: {
    priorities: ActionPriority[];
    timeline: string;
    resources: {
      budget: number;
      personnel: number;
      external: string[];
    };
    monitoring: {
      frequency: string;
      responsible: string;
      reporting: string;
    };
  };

  // Metadata
  assessmentDate: Date;
  assessedBy: string;
  reviewedBy: string;
  approvedBy: string;
  nextAssessment: Date;
  status: AssessmentStatus;
  version: number;
}

interface SalientIssue {
  issue: string;
  rightsAffected: string[]; // specific human rights
  severity: Severity;
  scale: number; // number of people
  scope: string; // geographic/operational
  irremediability: boolean;
  likelihood: Likelihood;
  priorityScore: number;
  linkedToOperations: string[];
}

interface HumanRightsImpact {
  id: string;
  type: ImpactType; // ACTUAL, POTENTIAL
  right: string; // specific human right
  description: string;
  cause: CauseType; // CAUSED, CONTRIBUTED, LINKED
  severity: Severity;
  likelihood: Likelihood;
  affectedGroups: string[];
  affectedNumber: number;
  duration: string;
  location: string;
  linkedOperations: string[];
  mitigation: string;
  status: ImpactStatus;
}
```

#### 6. Living Wage Analysis

```typescript
interface LivingWageAnalysis {
  id: string;
  supplierId: string;
  facilityId: string;
  location: {
    country: string;
    region: string;
    city: string;
    ruralUrban: string;
  };
  analysisDate: Date;

  // Wage Benchmarks
  benchmarks: {
    livingWage: {
      source: string; // MIT, Global Living Wage Coalition, WageIndicator
      amount: number;
      currency: string;
      frequency: string; // hourly, daily, monthly
      lastUpdated: Date;
      methodology: string;
    };
    minimumWage: {
      amount: number;
      currency: string;
      frequency: string;
      effectiveDate: Date;
      source: string;
    };
    prevailingWage: {
      amount: number;
      currency: string;
      frequency: string;
      source: string;
    };
    povertyLine: {
      amount: number;
      currency: string;
      frequency: string;
      source: string;
    };
  };

  // Current Wages
  currentWages: {
    lowestWage: {
      amount: number;
      currency: string;
      frequency: string;
      jobRole: string;
      workersAffected: number;
    };
    averageWage: {
      amount: number;
      byGender: { male: number; female: number };
      byType: { permanent: number; contract: number; temporary: number };
      byDepartment: Record<string, number>;
    };
    wageDistribution: {
      percentiles: {
        p10: number;
        p25: number;
        p50: number;
        p75: number;
        p90: number;
      };
      brackets: WageBracket[];
    };
  };

  // In-Kind Benefits
  inKindBenefits: {
    provided: boolean;
    types: InKindBenefit[];
    totalValue: number;
    includedInCalculation: boolean;
  };

  // Working Hours
  workingHours: {
    standardHours: number;
    actualAverage: number;
    overtime: {
      regular: boolean;
      average: number;
      premium: number; // multiplier
      voluntary: boolean;
    };
    wagePerHour: number;
    requiredHoursForLivingWage: number;
  };

  // Gap Analysis
  gapAnalysis: {
    livingWageGap: {
      absolute: number;
      percentage: number;
      workersBelow: number;
      percentageBelow: number;
    };
    minimumWageCompliance: {
      compliant: boolean;
      gap: number;
      workersBelow: number;
    };
    genderPayGap: {
      exists: boolean;
      percentage: number;
      adjustedGap: number; // controlling for role/experience
    };
  };

  // Cost Analysis
  costAnalysis: {
    totalPayrollIncrease: number;
    percentageIncrease: number;
    byDepartment: Record<string, number>;
    implementationCost: number;
    timeline: string;
    phases: ImplementationPhase[];
  };

  // Action Plan
  actionPlan: {
    commitment: boolean;
    target: {
      wage: number;
      date: Date;
      coverage: number; // percentage of workers
    };
    roadmap: {
      phases: RoadmapPhase[];
      milestones: Milestone[];
      monitoring: string;
    };
    collaboration: {
      industryInitiative: boolean;
      buyerEngagement: boolean;
      unionNegotiation: boolean;
    };
  };

  // Impact on Business
  businessImpact: {
    productivityGains: number;
    turnoverReduction: number;
    absenteeismReduction: number;
    qualityImprovement: number;
    reputationalBenefit: string;
    estimatedROI: number;
  };

  // Documentation
  documentation: {
    payrollRecords: Document[];
    costOfLivingStudy: Document;
    workerSurveys: Document[];
    actionPlan: Document;
  };

  // Metadata
  analyzedBy: string;
  approvedBy: string;
  status: AnalysisStatus;
  nextReview: Date;
  lastUpdated: Date;
  version: number;
}

interface InKindBenefit {
  type: string; // MEALS, TRANSPORT, HOUSING, HEALTHCARE
  description: string;
  value: number;
  frequency: string;
  beneficiaries: number;
}

interface WageBracket {
  min: number;
  max: number;
  workers: number;
  percentage: number;
}
```

#### 7. Supply Chain Mapping

```typescript
interface SupplyChainMap {
  id: string;
  organizationId: string;
  product: string;
  lastMapped: Date;

  // Multi-Tier Structure
  tiers: {
    tier1: Supplier[];
    tier2: Supplier[];
    tier3: Supplier[];
    tier4Plus: Supplier[];
    rawMaterial: RawMaterialSource[];
  };

  // Supply Chain Graph (Neo4j representation)
  graph: {
    nodes: SupplyChainNode[];
    relationships: SupplyChainRelationship[];
    depth: number;
    complexity: number; // number of paths
  };

  // Traceability
  traceability: {
    level: TraceabilityLevel; // FULL, PARTIAL, LIMITED
    coverage: number; // percentage
    gaps: TraceabilityGap[];
    verification: {
      method: string; // CERTIFICATION, AUDIT, BLOCKCHAIN
      lastVerified: Date;
      evidence: string[];
    };
  };

  // Risk Heat Map
  riskHeatMap: {
    criticalNodes: CriticalNode[];
    highRiskPaths: RiskPath[];
    geographicConcentration: GeographicRisk[];
    singlePoints: SinglePointOfFailure[];
  };

  // Subcontractor Management
  subcontractors: {
    authorized: Subcontractor[];
    unauthorized: UnauthorizedWork[];
    monitoring: {
      frequency: string;
      method: string;
      compliance: number;
    };
  };

  // Labor Broker Mapping
  laborBrokers: {
    identified: LaborBroker[];
    risk: RiskLevel;
    monitoring: string;
    audited: number; // percentage
  };

  // Critical Materials
  criticalMaterials: {
    materials: CriticalMaterial[];
    conflictMinerals: ConflictMineral[];
    restrictedSubstances: string[];
  };

  // Transparency Metrics
  transparency: {
    tier1Disclosed: number; // percentage
    tier2Disclosed: number;
    tier3Disclosed: number;
    publicDisclosure: boolean;
    supplierConsent: number; // percentage
  };

  // Social Risk by Tier
  socialRiskByTier: {
    tier1: {
      averageRisk: number;
      highRisk: number; // count
      critical: number;
    };
    tier2: {
      averageRisk: number;
      highRisk: number;
      critical: number;
    };
    tier3Plus: {
      averageRisk: number;
      highRisk: number;
      critical: number;
    };
  };

  // Metadata
  mappedBy: string;
  methodology: string;
  dataQuality: DataQuality;
  nextUpdate: Date;
  version: number;
}

interface SupplyChainNode {
  id: string;
  type: NodeType; // BUYER, SUPPLIER, FACILITY, RAW_MATERIAL
  tier: number;
  name: string;
  location: {
    country: string;
    coordinates: Coordinates;
  };
  riskScore: number;
  socialRisk: RiskLevel;
  certifications: string[];
  workers: number;
  criticalSupplier: boolean;
}

interface SupplyChainRelationship {
  source: string;
  target: string;
  type: RelationshipType; // SUPPLIES, SUBCONTRACTS, SOURCES_FROM
  volume: number;
  value: number;
  critical: boolean;
  verified: boolean;
}
```

#### 8. Supplier Training & Development

```typescript
interface SupplierDevelopmentProgram {
  id: string;
  supplierId: string;
  programType: ProgramType;

  // Training Programs
  trainingPrograms: {
    laborRights: {
      completed: TrainingModule[];
      inProgress: TrainingModule[];
      planned: TrainingModule[];
      attendance: number;
      effectiveness: number;
    };
    healthSafety: {
      modules: TrainingModule[];
      certifications: string[];
      incidents: number; // reduction
    };
    modernSlavery: {
      awareness: boolean;
      management: boolean;
      detection: boolean;
      remediation: boolean;
    };
    sustainablePractices: {
      topics: string[];
      implementation: number;
      improvements: string[];
    };
  };

  // Capacity Building
  capacityBuilding: {
    assessmentTools: {
      provided: string[];
      utilized: number;
      feedback: string;
    };
    technicalAssistance: {
      areas: string[];
      hours: number;
      outcomes: string[];
    };
    peerLearning: {
      networks: string[];
      events: number;
      bestPractices: string[];
    };
    mentorship: {
      assigned: boolean;
      mentor: string;
      duration: string;
      goals: string[];
    };
  };

  // Improvement Projects
  improvementProjects: {
    active: ImprovementProject[];
    completed: ImprovementProject[];
    investment: number;
    coFunding: number;
    roi: number;
  };

  // Performance Tracking
  performance: {
    baseline: PerformanceMetrics;
    current: PerformanceMetrics;
    improvement: number;
    targets: PerformanceTarget[];
    scorecards: Scorecard[];
  };

  // Recognition & Incentives
  recognition: {
    awards: Award[];
    preferredStatus: boolean;
    volumeIncrease: number;
    priceIncentive: number;
    longTermContract: boolean;
  };

  // Collaboration
  collaboration: {
    jointProjects: string[];
    innovation: string[];
    knowledgeSharing: string[];
    coInvestment: number;
  };

  // Impact Measurement
  impact: {
    workersImpacted: number;
    wageIncrease: number;
    conditionsImproved: string[];
    grievancesReduced: number;
    certificationAchieved: string[];
  };

  // Documentation
  documentation: {
    trainingMaterials: Document[];
    certificates: Document[];
    progressReports: Document[];
    successStories: Document[];
  };

  // Metadata
  startDate: Date;
  endDate?: Date;
  coordinator: string;
  budget: number;
  status: ProgramStatus;
  lastUpdated: Date;
  version: number;
}

interface TrainingModule {
  name: string;
  topics: string[];
  duration: number; // hours
  format: string; // ONLINE, IN_PERSON, HYBRID
  language: string;
  participants: number;
  completionRate: number;
  testScore: number;
  feedback: number; // rating
  certificateIssued: boolean;
}

interface ImprovementProject {
  name: string;
  objective: string;
  area: string; // LABOR, HEALTH_SAFETY, WAGES, etc.
  investment: number;
  timeline: string;
  milestones: Milestone[];
  outcomes: string[];
  metrics: KPI[];
  status: ProjectStatus;
}
```

#### 9. Modern Slavery Statement

```typescript
interface ModernSlaveryStatement {
  id: string;
  organizationId: string;
  year: number;
  jurisdiction: Jurisdiction[]; // UK, CALIFORNIA, AUSTRALIA

  // Organization Structure
  structure: {
    legalName: string;
    tradingNames: string[];
    structure: string; // description
    ownership: string;
    headquarters: Address;
    operations: Country[];
    employees: number;
    revenue: number;
  };

  // Supply Chain
  supplyChain: {
    description: string;
    tiers: number;
    suppliers: {
      total: number;
      tier1: number;
      tier2Plus: number;
      countries: number;
    };
    categories: string[];
    spend: number;
    complexity: string;
  };

  // Risk Assessment
  riskAssessment: {
    methodology: string;
    highRiskAreas: {
      geographic: string[];
      sectors: string[];
      products: string[];
      services: string[];
    };
    riskFactors: string[];
    assessment: {
      suppliersAssessed: number;
      highRisk: number;
      audited: number;
    };
  };

  // Due Diligence
  dueDiligence: {
    processes: string[];
    supplierOnboarding: string;
    contractualRequirements: string[];
    auditing: {
      program: string;
      frequency: string;
      standards: string[];
      findings: string;
    };
    remediation: string;
    monitoring: string;
  };

  // Policies
  policies: {
    modernSlaveryPolicy: {
      exists: boolean;
      lastUpdated: Date;
      coverage: string[];
      communication: string;
    };
    relatedPolicies: string[];
    codeOfConduct: boolean;
    supplierCode: boolean;
  };

  // Training
  training: {
    programs: {
      employees: TrainingProgram;
      suppliers: TrainingProgram;
      management: TrainingProgram;
    };
    coverage: {
      employeesCovered: number;
      suppliersCovered: number;
    };
    effectiveness: string;
  };

  // KPIs and Effectiveness
  effectiveness: {
    kpis: ModernSlaveryKPI[];
    progress: string[];
    improvements: string[];
    challenges: string[];
    futureActions: string[];
  };

  // Incidents & Remediation
  incidents: {
    reported: number;
    investigated: number;
    substantiated: number;
    remediated: number;
    examples: string[]; // anonymized
    learnings: string[];
  };

  // Collaboration
  collaboration: {
    initiatives: string[];
    partnerships: string[];
    industryGroups: string[];
    ngos: string[];
  };

  // Sign-off
  approval: {
    approvedBy: string;
    title: string;
    date: Date;
    boardApproval: boolean;
    signature: string; // digital signature
  };

  // Publication
  publication: {
    publishedDate: Date;
    url: string;
    registry: string[]; // UK Registry, etc.
    languages: string[];
    accessibility: boolean;
  };

  // Metadata
  preparedBy: string;
  reviewedBy: string;
  status: StatementStatus;
  lastUpdated: Date;
  version: number;
}

interface TrainingProgram {
  topics: string[];
  hours: number;
  frequency: string;
  participants: number;
  completion: number;
  testing: boolean;
  certification: boolean;
}

interface ModernSlaveryKPI {
  name: string;
  target: number;
  actual: number;
  trend: TrendDirection;
  description: string;
}
```

### MongoDB Collections

```typescript
// Collection Definitions
const collections = {
  // Core Collections
  suppliers: 'suppliers',
  supplier_risk_assessments: 'supplier_risk_assessments',
  social_audits: 'social_audits',
  audit_findings: 'audit_findings',

  // Specialized Assessments
  modern_slavery_assessments: 'modern_slavery_assessments',
  child_labor_assessments: 'child_labor_assessments',
  human_rights_assessments: 'human_rights_assessments',
  living_wage_analyses: 'living_wage_analyses',

  // Supply Chain
  supply_chain_maps: 'supply_chain_maps',
  multi_tier_mappings: 'multi_tier_mappings',
  labor_brokers: 'labor_brokers',
  subcontractors: 'subcontractors',

  // Development & Training
  supplier_training: 'supplier_training',
  development_programs: 'development_programs',
  capacity_building: 'capacity_building',

  // Compliance & Reporting
  certifications: 'certifications',
  modern_slavery_statements: 'modern_slavery_statements',
  grievances: 'grievances',
  remediation_plans: 'remediation_plans',

  // Targets & Performance
  supplier_targets: 'supplier_targets',
  performance_scorecards: 'performance_scorecards',
  improvement_projects: 'improvement_projects',

  // Reports
  social_supply_chain_reports: 'social_supply_chain_reports',
  regulatory_reports: 'regulatory_reports'
};

// Indexes for Performance
const indexes = {
  suppliers: [
    { supplierId: 1, tier: 1 },
    { 'riskScore': -1 },
    { 'countryRisk.country': 1 },
    { 'modernSlaveryRisk.overallScore': -1 },
    { 'auditStatus.nextAuditDue': 1 },
    { 'certifications.type': 1, 'certifications.expiry': 1 }
  ],

  social_audits: [
    { supplierId: 1, auditDate: -1 },
    { 'findings.severity': 1 },
    { 'findings.zeroToleranceType': 1 },
    { status: 1, 'reAuditDeadline': 1 }
  ],

  modern_slavery_assessments: [
    { supplierId: 1, assessmentDate: -1 },
    { 'riskAssessment.overallRisk': 1 },
    { 'forcedLaborIndicators.*.present': 1 }
  ]
};
```

## API Specifications

### RESTful Endpoints

```yaml
openapi: 3.1.0
info:
  title: Social Supply Chain Service API
  version: 1.0.0
  description: Comprehensive supply chain social responsibility management

paths:
  # Supplier Risk Assessment
  /api/v1/suppliers/{supplierId}/risk-assessment:
    get:
      summary: Get supplier risk assessment
      parameters:
        - name: supplierId
          in: path
          required: true
          schema:
            type: string
      responses:
        200:
          description: Risk assessment details

    post:
      summary: Trigger new risk assessment
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RiskAssessmentRequest'

  /api/v1/suppliers/risk-screening:
    post:
      summary: Bulk risk screening
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                suppliers:
                  type: array
                  items:
                    $ref: '#/components/schemas/SupplierScreening'

  # Social Audits
  /api/v1/audits:
    get:
      summary: List social audits
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [scheduled, in_progress, completed, follow_up]
        - name: severity
          in: query
          schema:
            type: string
            enum: [zero_tolerance, critical, major, minor]

    post:
      summary: Schedule new audit
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AuditSchedule'

  /api/v1/audits/{auditId}/findings:
    get:
      summary: Get audit findings

    post:
      summary: Add audit finding

  /api/v1/audits/{auditId}/cap:
    get:
      summary: Get corrective action plan

    put:
      summary: Update CAP status

  # Modern Slavery
  /api/v1/modern-slavery/assess:
    post:
      summary: Perform modern slavery assessment
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ModernSlaveryAssessment'

  /api/v1/modern-slavery/indicators:
    get:
      summary: Get ILO forced labor indicators

  /api/v1/modern-slavery/statement:
    post:
      summary: Generate modern slavery statement
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                year:
                  type: integer
                jurisdiction:
                  type: array
                  items:
                    type: string
                    enum: [UK, CALIFORNIA, AUSTRALIA]

  # Child Labor
  /api/v1/child-labor/assess:
    post:
      summary: Perform child labor assessment

  /api/v1/child-labor/remediation:
    post:
      summary: Create remediation plan

  # Human Rights
  /api/v1/human-rights/impact-assessment:
    post:
      summary: Conduct human rights impact assessment

  /api/v1/human-rights/salient-issues:
    get:
      summary: Get salient human rights issues

  /api/v1/human-rights/grievances:
    get:
      summary: List grievances

    post:
      summary: File new grievance

  # Living Wage
  /api/v1/living-wage/analyze:
    post:
      summary: Perform living wage analysis

  /api/v1/living-wage/benchmarks:
    get:
      summary: Get living wage benchmarks
      parameters:
        - name: country
          in: query
          required: true
        - name: region
          in: query
        - name: source
          in: query

  # Supply Chain Mapping
  /api/v1/supply-chain/map:
    get:
      summary: Get supply chain map

    post:
      summary: Update supply chain mapping

  /api/v1/supply-chain/tiers:
    get:
      summary: Get multi-tier supplier list
      parameters:
        - name: tier
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 4

  /api/v1/supply-chain/traceability:
    post:
      summary: Trace product/material origin

  # Training & Development
  /api/v1/training/programs:
    get:
      summary: List training programs

    post:
      summary: Create training program

  /api/v1/training/enrollment:
    post:
      summary: Enroll suppliers in training

  /api/v1/development/performance:
    get:
      summary: Get supplier performance metrics

  # Reporting
  /api/v1/reports/gri-414:
    post:
      summary: Generate GRI 414 report

  /api/v1/reports/csrd-s2:
    post:
      summary: Generate CSRD S2 report

  /api/v1/reports/modern-slavery:
    post:
      summary: Generate modern slavery report

components:
  schemas:
    RiskAssessmentRequest:
      type: object
      properties:
        supplierId:
          type: string
        assessmentType:
          type: string
          enum: [full, quick, triggered]
        scope:
          type: array
          items:
            type: string

    SupplierScreening:
      type: object
      properties:
        name:
          type: string
        country:
          type: string
        industry:
          type: string
        tier:
          type: integer

    AuditSchedule:
      type: object
      properties:
        supplierId:
          type: string
        auditType:
          type: string
          enum: [SA8000, SMETA, BSCI, WRAP, FLA, RBA]
        scheduledDate:
          type: string
          format: date
        announced:
          type: boolean
```

### GraphQL Schema

```graphql
type Query {
  # Supplier Risk
  supplierRisk(supplierId: ID!): SupplierRiskProfile
  supplierRisks(
    filter: RiskFilter
    sort: RiskSort
    pagination: Pagination
  ): SupplierRiskConnection!

  # Audits
  audit(auditId: ID!): SocialAudit
  audits(
    filter: AuditFilter
    sort: AuditSort
    pagination: Pagination
  ): SocialAuditConnection!

  auditFindings(
    auditId: ID!
    severity: FindingSeverity
  ): [AuditFinding!]!

  # Modern Slavery
  modernSlaveryAssessment(
    supplierId: ID!
  ): ModernSlaveryAssessment

  forcedLaborIndicators(
    supplierId: ID!
  ): [ForcedLaborIndicator!]!

  # Supply Chain
  supplyChainMap(
    product: String!
  ): SupplyChainMap

  suppliersByTier(
    tier: Int!
  ): [Supplier!]!

  traceability(
    productId: ID!
    materialId: ID
  ): TraceabilityPath

  # Living Wage
  livingWageAnalysis(
    supplierId: ID!
  ): LivingWageAnalysis

  livingWageBenchmark(
    country: String!
    region: String
    source: String
  ): LivingWageBenchmark

  # Reports
  modernSlaveryStatement(
    year: Int!
    draft: Boolean
  ): ModernSlaveryStatement
}

type Mutation {
  # Risk Assessment
  assessSupplierRisk(
    input: AssessRiskInput!
  ): SupplierRiskProfile!

  # Audits
  scheduleAudit(
    input: ScheduleAuditInput!
  ): SocialAudit!

  addAuditFinding(
    auditId: ID!
    input: AuditFindingInput!
  ): AuditFinding!

  updateCorrectiveAction(
    findingId: ID!
    input: CorrectiveActionInput!
  ): AuditFinding!

  # Modern Slavery
  assessModernSlavery(
    input: ModernSlaveryInput!
  ): ModernSlaveryAssessment!

  flagZeroTolerance(
    supplierId: ID!
    type: ZeroToleranceType!
    details: String!
  ): ZeroToleranceAlert!

  # Supply Chain
  updateSupplyChainMap(
    input: SupplyChainMapInput!
  ): SupplyChainMap!

  addSupplierTier(
    parentId: ID!
    input: SupplierInput!
  ): Supplier!

  # Training
  enrollInTraining(
    supplierId: ID!
    programId: ID!
  ): Enrollment!

  # Reporting
  generateModernSlaveryStatement(
    year: Int!
    jurisdiction: [Jurisdiction!]!
  ): ModernSlaveryStatement!
}

type Subscription {
  # Real-time Alerts
  zeroToleranceDetected(
    supplierId: ID
  ): ZeroToleranceAlert!

  auditFindingAdded(
    auditId: ID!
    severity: FindingSeverity
  ): AuditFinding!

  riskScoreChanged(
    supplierId: ID!
    threshold: Float
  ): RiskUpdate!

  grievanceEscalated(
    supplierId: ID
  ): Grievance!
}

type SupplierRiskProfile {
  id: ID!
  supplier: Supplier!
  overallRiskScore: Float!
  riskLevel: RiskLevel!
  countryRisk: CountryRisk!
  industryRisk: IndustryRisk!
  laborRisk: LaborRisk!
  modernSlaveryRisk: ModernSlaveryRisk!
  auditStatus: AuditStatus!
  certifications: [Certification!]!
  riskTrend: TrendDirection!
  assessmentDate: DateTime!
}

type SocialAudit {
  id: ID!
  auditNumber: String!
  supplier: Supplier!
  auditType: AuditType!
  scheduledDate: DateTime!
  actualDate: DateTime
  findings: [AuditFinding!]!
  overallScore: Float
  categoryScores: CategoryScores!
  correctiveActionPlan: CorrectiveActionPlan
  status: AuditStatus!
}

type AuditFinding {
  id: ID!
  category: FindingCategory!
  severity: FindingSeverity!
  description: String!
  affectedWorkers: Int
  correctiveAction: CorrectiveAction
  verified: Boolean!
  zeroToleranceType: ZeroToleranceType
}

enum RiskLevel {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum FindingSeverity {
  ZERO_TOLERANCE
  CRITICAL
  MAJOR
  MINOR
  OBSERVATION
}

enum ZeroToleranceType {
  CHILD_LABOR
  FORCED_LABOR
  HUMAN_TRAFFICKING
  SEVERE_HEALTH_SAFETY
  PHYSICAL_ABUSE
  SEXUAL_HARASSMENT
  BRIBERY_CORRUPTION
}
```

## Event-Driven Architecture

### Published Events

```typescript
// Domain Events
export const SOCIAL_SUPPLY_CHAIN_EVENTS = {
  // Risk Assessment Events
  RISK_ASSESSMENT_COMPLETED: 'social-supply-chain.risk-assessment.completed.v1',
  RISK_LEVEL_CHANGED: 'social-supply-chain.risk-level.changed.v1',
  HIGH_RISK_DETECTED: 'social-supply-chain.high-risk.detected.v1',

  // Audit Events
  AUDIT_SCHEDULED: 'social-supply-chain.audit.scheduled.v1',
  AUDIT_STARTED: 'social-supply-chain.audit.started.v1',
  AUDIT_COMPLETED: 'social-supply-chain.audit.completed.v1',
  FINDING_ADDED: 'social-supply-chain.finding.added.v1',
  CAP_UPDATED: 'social-supply-chain.cap.updated.v1',
  REAUDIT_REQUIRED: 'social-supply-chain.reaudit.required.v1',

  // Critical Alerts (Zero Tolerance)
  ZERO_TOLERANCE_DETECTED: 'social-supply-chain.zero-tolerance.detected.v1',
  CHILD_LABOR_DETECTED: 'social-supply-chain.child-labor.detected.v1',
  FORCED_LABOR_DETECTED: 'social-supply-chain.forced-labor.detected.v1',
  MODERN_SLAVERY_FLAGGED: 'social-supply-chain.modern-slavery.flagged.v1',

  // Human Rights Events
  HUMAN_RIGHTS_VIOLATION: 'social-supply-chain.human-rights.violation.v1',
  GRIEVANCE_FILED: 'social-supply-chain.grievance.filed.v1',
  GRIEVANCE_ESCALATED: 'social-supply-chain.grievance.escalated.v1',
  REMEDY_PROVIDED: 'social-supply-chain.remedy.provided.v1',

  // Living Wage Events
  LIVING_WAGE_GAP_IDENTIFIED: 'social-supply-chain.living-wage-gap.identified.v1',
  WAGE_INCREASE_COMMITTED: 'social-supply-chain.wage-increase.committed.v1',

  // Supply Chain Events
  SUPPLIER_MAPPED: 'social-supply-chain.supplier.mapped.v1',
  TIER_ADDED: 'social-supply-chain.tier.added.v1',
  SUBCONTRACTOR_UNAUTHORIZED: 'social-supply-chain.subcontractor.unauthorized.v1',

  // Training Events
  TRAINING_ENROLLED: 'social-supply-chain.training.enrolled.v1',
  TRAINING_COMPLETED: 'social-supply-chain.training.completed.v1',
  CERTIFICATION_ACHIEVED: 'social-supply-chain.certification.achieved.v1',

  // Reporting Events
  STATEMENT_GENERATED: 'social-supply-chain.statement.generated.v1',
  REPORT_PUBLISHED: 'social-supply-chain.report.published.v1'
};

// Event Schemas
interface RiskAssessmentCompletedEvent {
  eventId: string;
  eventType: 'social-supply-chain.risk-assessment.completed.v1';
  timestamp: Date;
  supplierId: string;
  supplierName: string;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  criticalIssues: string[];
  nextAssessmentDate: Date;
}

interface ZeroToleranceDetectedEvent {
  eventId: string;
  eventType: 'social-supply-chain.zero-tolerance.detected.v1';
  timestamp: Date;
  supplierId: string;
  supplierName: string;
  location: string;
  type: ZeroToleranceType;
  description: string;
  affectedWorkers: number;
  immediateAction: string;
  escalationRequired: boolean;
  notificationList: string[]; // stakeholders to notify
}

interface ModernSlaveryFlaggedEvent {
  eventId: string;
  eventType: 'social-supply-chain.modern-slavery.flagged.v1';
  timestamp: Date;
  supplierId: string;
  indicators: ILOIndicator[];
  riskScore: number;
  vulnerableWorkers: number;
  requiredActions: string[];
  reportingRequired: boolean;
}
```

### Consumed Events

```typescript
// Events from other services
export const CONSUMED_EVENTS = {
  // From Organization Service
  SUPPLIER_ONBOARDED: 'organization.supplier.onboarded.v1',
  SUPPLIER_UPDATED: 'organization.supplier.updated.v1',
  SUPPLIER_OFFBOARDED: 'organization.supplier.offboarded.v1',

  // From Labor Service
  LIVING_WAGE_GAP_IDENTIFIED: 'labor.living-wage-gap.identified.v1',
  LABOR_VIOLATION_REPORTED: 'labor.violation.reported.v1',
  UNION_FORMED: 'labor.union.formed.v1',

  // From Human Rights Service
  HUMAN_RIGHTS_VIOLATION_REPORTED: 'human-rights.violation.reported.v1',
  SALIENT_ISSUE_IDENTIFIED: 'human-rights.salient-issue.identified.v1',

  // From Workforce Service
  WORKFORCE_DEMOGRAPHICS_UPDATED: 'workforce.demographics.updated.v1',
  MIGRANT_WORKERS_IDENTIFIED: 'workforce.migrant-workers.identified.v1'
};

// Event Handlers
@EventsHandler(SupplierOnboardedEvent)
export class SupplierOnboardedHandler {
  async handle(event: SupplierOnboardedEvent) {
    // Trigger initial risk assessment
    // Create supplier profile
    // Schedule initial audit if high-risk
  }
}

@EventsHandler(LivingWageGapIdentifiedEvent)
export class LivingWageGapHandler {
  async handle(event: LivingWageGapIdentifiedEvent) {
    // Update supplier risk score
    // Add to living wage tracking
    // Notify procurement team
  }
}
```

## Security & Compliance

### Security Measures

```typescript
// Security Controls
export class SecurityControls {
  // Data Protection
  encryptSensitiveData = {
    workerIdentities: true,
    salaryInformation: true,
    auditFindings: true,
    grievanceDetails: true,
    algorithm: 'AES-256-GCM'
  };

  // Access Control
  accessControl = {
    supplierData: ['supplier_manager', 'auditor', 'compliance'],
    auditReports: ['auditor', 'compliance', 'executive'],
    grievances: ['grievance_handler', 'hr', 'legal'],
    modernSlaveryData: ['compliance', 'legal', 'executive']
  };

  // Audit Logging
  auditLogging = {
    dataAccess: true,
    dataModification: true,
    reportGeneration: true,
    alertsTriggered: true,
    retentionPeriod: '7 years'
  };

  // Data Anonymization
  anonymization = {
    workerData: true,
    grievanceReporting: true,
    publicReports: true,
    method: 'k-anonymity'
  };
}
```

### Compliance Requirements

```typescript
// Regulatory Compliance
export const COMPLIANCE_REQUIREMENTS = {
  // Modern Slavery Acts
  UK_MODERN_SLAVERY_ACT: {
    statementRequired: true,
    annualUpdate: true,
    boardApproval: true,
    publicRegistry: true,
    minimumContent: [
      'organization_structure',
      'supply_chains',
      'policies',
      'due_diligence',
      'risk_assessment',
      'effectiveness',
      'training'
    ]
  },

  // Supply Chain Due Diligence
  EU_CSDDD: {
    humanRightsDueDiligence: true,
    environmentalDueDiligence: true,
    grievanceMechanism: true,
    remediation: true,
    reporting: true,
    coverage: 'full_value_chain'
  },

  // Forced Labor Prevention
  UFLPA: {
    rebuttablePresumption: true,
    supplyChainTracing: true,
    dueDiligence: 'enhanced',
    documentation: 'comprehensive',
    cbpCompliance: true
  },

  // Reporting Standards
  GRI_414: {
    supplierAssessment: true,
    negativeImpacts: true,
    improvementMeasures: true,
    terminatedRelationships: true
  },

  CSRD_ESRS_S2: {
    workersInValueChain: true,
    workingConditions: true,
    equalTreatment: true,
    otherRights: true,
    doubleMateriarity: true
  }
};
```

## Integration Specifications

### External System Integrations

```typescript
// Audit Platform Integration (SEDEX/Amfori)
export class AuditPlatformIntegration {
  async syncAuditData(platform: 'SEDEX' | 'AMFORI') {
    const config = {
      SEDEX: {
        endpoint: process.env.SEDEX_API_URL,
        apiKey: process.env.SEDEX_API_KEY,
        syncFields: ['audits', 'findings', 'corrective_actions']
      },
      AMFORI: {
        endpoint: process.env.AMFORI_API_URL,
        credentials: {
          username: process.env.AMFORI_USERNAME,
          password: process.env.AMFORI_PASSWORD
        }
      }
    };

    // Sync implementation
  }
}

// Country Risk Data Integration
export class CountryRiskIntegration {
  sources = {
    transparencyInternational: {
      api: 'https://api.transparency.org/cpi',
      metrics: ['corruption_perception_index']
    },
    usStateDept: {
      api: 'https://api.state.gov/tip-report',
      metrics: ['trafficking_tier', 'child_labor_list']
    },
    freedomHouse: {
      api: 'https://api.freedomhouse.org',
      metrics: ['freedom_score', 'political_rights', 'civil_liberties']
    },
    ilo: {
      api: 'https://api.ilo.org',
      metrics: ['labor_rights_index', 'ratifications']
    }
  };

  async aggregateCountryRisk(country: string) {
    // Fetch and aggregate risk scores
  }
}

// Living Wage Database Integration
export class LivingWageIntegration {
  databases = {
    MIT: {
      endpoint: 'https://livingwage.mit.edu/api',
      coverage: ['US_states', 'US_counties']
    },
    GlobalLivingWage: {
      endpoint: 'https://globallivingwage.org/api',
      coverage: ['global_benchmarks']
    },
    WageIndicator: {
      endpoint: 'https://wageindicator.org/api',
      coverage: ['140_countries']
    }
  };

  async getBenchmark(location: Location) {
    // Fetch appropriate benchmark
  }
}

// Blockchain Traceability (Optional)
export class BlockchainIntegration {
  async recordTransaction(transaction: SupplyChainTransaction) {
    // Record on blockchain for immutable traceability
  }

  async verifyChainOfCustody(productId: string) {
    // Verify complete supply chain
  }
}
```

## Performance & Scalability

### Performance Targets

```typescript
export const PERFORMANCE_TARGETS = {
  // API Response Times (p95)
  apiResponseTime: {
    read: 300, // ms
    write: 500, // ms
    bulk: 2000 // ms
  },

  // Processing Times
  riskAssessment: {
    single: 5000, // ms
    bulk_100: 30000, // ms
    bulk_10000: 60000 // ms (1 minute)
  },

  // Multi-tier Mapping
  supplyChainMapping: {
    tier1: 5000, // ms
    tier2: 15000, // ms
    tier3Plus: 30000 // ms
  },

  // Report Generation
  reportGeneration: {
    auditReport: 10000, // ms
    modernSlaveryStatement: 30000, // ms
    gri414: 20000 // ms
  },

  // Real-time Requirements
  alertNotification: {
    zeroTolerance: 1000, // ms (critical)
    highRisk: 5000, // ms
    standard: 10000 // ms
  },

  // Scalability
  concurrentUsers: 1000,
  suppliersSupported: 100000,
  auditsPerMonth: 10000,
  eventsPerSecond: 1000
};
```

### Database Optimization

```typescript
// Neo4j Graph Optimization for Supply Chain
export const NEO4J_OPTIMIZATION = {
  // Indexes
  indexes: [
    'CREATE INDEX supplier_id IF NOT EXISTS FOR (s:Supplier) ON (s.id)',
    'CREATE INDEX supplier_risk IF NOT EXISTS FOR (s:Supplier) ON (s.riskScore)',
    'CREATE INDEX facility_location IF NOT EXISTS FOR (f:Facility) ON (f.country)',
    'CREATE INDEX relationship_type IF NOT EXISTS FOR ()-[r:SUPPLIES]-() ON (r.type)'
  ],

  // Efficient Queries
  queries: {
    // Find all tier 2 suppliers for a product
    tier2Suppliers: `
      MATCH (p:Product {id: $productId})-[:SUPPLIED_BY]->(t1:Supplier)
            -[:SOURCES_FROM]->(t2:Supplier)
      WHERE t2.tier = 2
      RETURN t2
    `,

    // Find critical path suppliers
    criticalPath: `
      MATCH path = (p:Product {id: $productId})-[:SUPPLIED_BY*1..4]->(s:Supplier)
      WHERE s.critical = true
      RETURN path
    `,

    // Risk propagation query
    riskPropagation: `
      MATCH (s:Supplier {id: $supplierId})<-[:SOURCES_FROM*1..3]-(affected:Supplier)
      WHERE s.riskScore > 80
      RETURN affected, length(path) as distance
      ORDER BY distance
    `
  },

  // Caching Strategy
  caching: {
    supplierRiskScores: 3600, // 1 hour
    supplyChainMap: 86400, // 24 hours
    certifications: 604800 // 1 week
  }
};
```

## Testing Strategy

### Test Coverage Requirements

```yaml
unit_tests:
  coverage: 85%
  focus_areas:
    - Risk scoring algorithms
    - ILO indicator detection
    - Audit finding classification
    - Living wage calculations
    - Supply chain traversal

integration_tests:
  coverage: 75%
  scenarios:
    - Full risk assessment workflow
    - Audit lifecycle management
    - Modern slavery screening
    - Multi-tier mapping
    - External API integrations

e2e_tests:
  critical_paths:
    - Supplier onboarding to risk assessment
    - Audit scheduling to CAP completion
    - Zero tolerance detection to escalation
    - Grievance filing to resolution
    - Modern slavery statement generation

performance_tests:
  scenarios:
    - Bulk risk assessment (10,000 suppliers)
    - Supply chain mapping (1,000 nodes, 5,000 edges)
    - Concurrent audit management (100 audits)
    - Report generation under load

security_tests:
  requirements:
    - PII data encryption verification
    - Access control validation
    - API authentication/authorization
    - Audit log integrity
    - Data anonymization testing
```

### Test Implementation Examples

```typescript
// Unit Test: Risk Scoring
describe('SupplierRiskCalculator', () => {
  it('should calculate correct risk score with all factors', () => {
    const factors = {
      countryRisk: { cpiScore: 30, tierRanking: 'TIER_3' },
      industryRisk: { sectorRisk: 'HIGH' },
      laborRisk: { forcedLaborIndicators: 3 },
      auditStatus: { openFindings: 5, criticalFindings: 2 }
    };

    const score = calculator.calculateRiskScore(factors);

    expect(score).toBe(87); // High risk
    expect(calculator.getRiskLevel(score)).toBe('CRITICAL');
  });

  it('should detect zero tolerance conditions', () => {
    const assessment = {
      childLaborFound: true,
      forcedLaborIndicators: ['PASSPORT_RETENTION', 'DEBT_BONDAGE']
    };

    const result = calculator.assessZeroTolerance(assessment);

    expect(result.isZeroTolerance).toBe(true);
    expect(result.types).toContain('CHILD_LABOR');
    expect(result.immediateAction).toBeDefined();
  });
});

// Integration Test: Audit Workflow
describe('Audit Workflow Integration', () => {
  it('should complete full audit lifecycle', async () => {
    // Schedule audit
    const audit = await auditService.scheduleAudit({
      supplierId: 'supplier-123',
      auditType: 'SMETA',
      scheduledDate: new Date('2025-12-01')
    });

    expect(audit.status).toBe('SCHEDULED');

    // Add findings
    const finding = await auditService.addFinding(audit.id, {
      severity: 'MAJOR',
      category: 'WORKING_HOURS',
      description: 'Excessive overtime detected'
    });

    // Create CAP
    const cap = await auditService.createCAP(audit.id, {
      findings: [finding.id],
      actions: [{ action: 'Implement overtime controls', deadline: '2025-12-31' }]
    });

    // Verify events published
    expect(eventBus.publishedEvents).toContainEqual(
      expect.objectContaining({
        eventType: 'social-supply-chain.audit.completed.v1'
      })
    );
  });
});

// E2E Test: Zero Tolerance Detection
describe('Zero Tolerance Detection E2E', () => {
  it('should detect and escalate child labor', async () => {
    // Create assessment with child labor
    const response = await request(app.getHttpServer())
      .post('/api/v1/child-labor/assess')
      .send({
        supplierId: 'supplier-456',
        childLaborDetection: {
          childrenFound: true,
          numberOfChildren: 5,
          ageRange: { min: 12, max: 14 }
        }
      });

    expect(response.status).toBe(201);

    // Verify zero tolerance alert
    const alerts = await getZeroToleranceAlerts();
    expect(alerts).toContainEqual(
      expect.objectContaining({
        type: 'CHILD_LABOR',
        supplierId: 'supplier-456',
        escalated: true
      })
    );

    // Verify remediation plan created
    const remediation = await getRemediationPlan('supplier-456');
    expect(remediation).toBeDefined();
    expect(remediation.educationSupport).toBe(true);
  });
});
```

## Monitoring & Observability

### Key Metrics

```typescript
export const MONITORING_METRICS = {
  // Business Metrics
  businessMetrics: {
    suppliersAtRisk: 'gauge',
    auditCompletionRate: 'gauge',
    zeroToleranceIncidents: 'counter',
    averageRiskScore: 'gauge',
    livingWageGap: 'gauge',
    supplierCoverage: 'gauge',
    certificationRate: 'gauge'
  },

  // Operational Metrics
  operationalMetrics: {
    riskAssessmentsPerHour: 'counter',
    auditsScheduled: 'counter',
    findingsDetected: 'counter',
    capsCompleted: 'counter',
    grievancesReceived: 'counter',
    trainingsCompleted: 'counter'
  },

  // Performance Metrics
  performanceMetrics: {
    apiResponseTime: 'histogram',
    riskCalculationTime: 'histogram',
    auditProcessingTime: 'histogram',
    reportGenerationTime: 'histogram',
    databaseQueryTime: 'histogram'
  },

  // Compliance Metrics
  complianceMetrics: {
    modernSlaveryStatements: 'counter',
    regulatoryReports: 'counter',
    dataPrivacyCompliance: 'gauge',
    auditTrailCompleteness: 'gauge'
  }
};

// Dashboards
export const DASHBOARDS = {
  executive: [
    'Total Suppliers by Risk Level',
    'Zero Tolerance Incidents Trend',
    'Audit Coverage by Region',
    'Living Wage Gap Progression',
    'Supply Chain Transparency %'
  ],

  operational: [
    'Active Audits Status',
    'Open CAPs by Severity',
    'Risk Score Distribution',
    'Supplier Training Progress',
    'Grievance Resolution Time'
  ],

  compliance: [
    'Modern Slavery Indicators',
    'Child Labor Risk Heat Map',
    'Human Rights Issues by Country',
    'Certification Expiry Calendar',
    'Regulatory Report Status'
  ]
};
```

### Alerts Configuration

```typescript
export const ALERT_RULES = {
  critical: {
    zeroToleranceDetected: {
      condition: 'any',
      notification: ['email', 'sms', 'slack'],
      escalation: 'immediate',
      recipients: ['compliance', 'legal', 'executive']
    },

    childLaborFound: {
      condition: 'any',
      notification: ['email', 'phone'],
      escalation: 'immediate',
      recipients: ['compliance', 'csr', 'executive']
    }
  },

  high: {
    highRiskSupplier: {
      condition: 'risk_score > 80',
      notification: ['email', 'slack'],
      escalation: '1_hour',
      recipients: ['procurement', 'compliance']
    },

    auditFailed: {
      condition: 'audit_score < 50',
      notification: ['email'],
      escalation: '4_hours',
      recipients: ['supplier_manager', 'compliance']
    }
  },

  medium: {
    certificationExpiring: {
      condition: 'days_until_expiry < 30',
      notification: ['email'],
      frequency: 'weekly',
      recipients: ['supplier_manager']
    },

    capOverdue: {
      condition: 'days_overdue > 0',
      notification: ['email'],
      frequency: 'daily',
      recipients: ['auditor', 'supplier']
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
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

# Build application
COPY . .
RUN yarn build

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

EXPOSE 3026

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["node", "dist/main.js"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: social-supply-chain-service
  namespace: clenergize-social
spec:
  replicas: 3
  selector:
    matchLabels:
      app: social-supply-chain-service
  template:
    metadata:
      labels:
        app: social-supply-chain-service
        version: v1.0.0
    spec:
      serviceAccountName: social-supply-chain-service
      containers:
      - name: social-supply-chain-service
        image: clenergize/social-supply-chain-service:1.0.0
        ports:
        - containerPort: 3026
        env:
        - name: NODE_ENV
          value: production
        - name: PORT
          value: "3026"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: uri
        - name: NEO4J_URI
          valueFrom:
            secretKeyRef:
              name: neo4j-secret
              key: uri
        - name: KAFKA_BROKERS
          value: kafka-cluster:9092
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3026
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3026
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: social-supply-chain-service
  namespace: clenergize-social
spec:
  selector:
    app: social-supply-chain-service
  ports:
  - port: 3026
    targetPort: 3026
    protocol: TCP
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: social-supply-chain-service-hpa
  namespace: clenergize-social
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: social-supply-chain-service
  minReplicas: 3
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

## Documentation & Support

### API Documentation

The service provides comprehensive API documentation:

- **OpenAPI/Swagger**: Available at `/api-docs`
- **GraphQL Playground**: Available at `/graphql`
- **AsyncAPI Docs**: Available at `/events-docs`
- **Postman Collection**: Available in `/docs/postman`

### Service Runbooks

Critical runbooks for operations:

1. **Zero Tolerance Detection Response**
   - Immediate notification procedure
   - Escalation matrix
   - Remediation steps
   - Reporting requirements

2. **Audit Failure Response**
   - CAP creation process
   - Supplier engagement
   - Re-audit scheduling
   - Relationship review

3. **Modern Slavery Incident Response**
   - Investigation protocol
   - Worker protection measures
   - Legal notification
   - Remediation planning

4. **Supply Chain Disruption Response**
   - Risk assessment update
   - Alternative supplier identification
   - Continuity planning
   - Stakeholder communication

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
- Aggregates: PascalCase singular (SupplierRisk)
- Events: past tense (RiskAssessed, AuditCompleted)
- Commands: imperative (AssessRisk, ScheduleAudit)
- Queries: descriptive (GetSupplierRisk, ListAudits)
```

## Service Team & Ownership

**Service Owner**: Social Domain Team
**Technical Lead**: Senior Backend Engineer
**Product Owner**: ESG Social Product Manager
**On-Call Rotation**: 24/7 coverage for critical alerts

**Stakeholders**:
- Procurement Team (primary users)
- Compliance Team (audit management)
- Legal Team (modern slavery compliance)
- CSR Team (supplier development)
- Executive Team (reporting)

**SLA Commitments**:
- Availability: 99.9% uptime
- Zero Tolerance Alert: <1 minute notification
- API Response: <300ms p95
- Audit Report Generation: <30 seconds
- Support Response: <1 hour for critical issues

---

*Last Updated: November 2024*
*Version: 1.0.0*
*Next Review: February 2025*
*Classification: Internal - Business Critical*