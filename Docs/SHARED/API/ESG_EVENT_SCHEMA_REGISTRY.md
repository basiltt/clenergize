# ESG Platform Event Schema Registry

> **Version**: 2.0.0
> **Last Updated**: November 2024
> **Total Events**: 200+ across all ESG domains

## 📋 Event Naming Convention

```
Format: <domain>.<aggregate>.<action>.v<version>
Example: environmental.carbon.emission-calculated.v1
```

### Domain Prefixes
- `platform` - Core platform events
- `environmental` - Environmental domain events
- `social` - Social domain events
- `governance` - Governance domain events
- `strategic` - Strategic ESG events
- `reporting` - Reporting and disclosure events
- `analytics` - Analytics and ML events

## 🔧 Core Platform Events

### Identity & Authentication Events
```typescript
// User lifecycle events
platform.user.created.v1
platform.user.updated.v1
platform.user.deactivated.v1
platform.user.reactivated.v1
platform.user.deleted.v1

// Authentication events
platform.auth.login-attempted.v1
platform.auth.login-succeeded.v1
platform.auth.login-failed.v1
platform.auth.logout.v1
platform.auth.session-expired.v1
platform.auth.mfa-enabled.v1
platform.auth.password-reset.v1

// Authorization events
platform.role.assigned.v1
platform.role.revoked.v1
platform.permission.granted.v1
platform.permission.revoked.v1
```

### Organization Events
```typescript
// Organization management
platform.organization.created.v1
platform.organization.updated.v1
platform.organization.activated.v1
platform.organization.suspended.v1
platform.organization.deleted.v1

// Project/facility events
platform.facility.added.v1
platform.facility.updated.v1
platform.facility.removed.v1
platform.project.created.v1
platform.project.completed.v1
```

### Workflow Events
```typescript
// Workflow execution
platform.workflow.started.v1
platform.workflow.step-completed.v1
platform.workflow.paused.v1
platform.workflow.resumed.v1
platform.workflow.completed.v1
platform.workflow.failed.v1

// Approval events
platform.approval.requested.v1
platform.approval.granted.v1
platform.approval.rejected.v1
platform.approval.escalated.v1
platform.approval.delegated.v1
```

### Audit Events
```typescript
// Audit logging
platform.audit.data-accessed.v1
platform.audit.data-modified.v1
platform.audit.data-deleted.v1
platform.audit.configuration-changed.v1
platform.audit.security-event.v1
platform.audit.compliance-check.v1
```

### Integration Events
```typescript
// External system integration
platform.integration.connected.v1
platform.integration.disconnected.v1
platform.integration.data-synced.v1
platform.integration.sync-failed.v1
platform.integration.webhook-received.v1
```

## 🌍 Environmental Domain Events

### Carbon Management Events
```typescript
// Emission calculations
environmental.carbon.emission-calculated.v1
environmental.carbon.scope1-calculated.v1
environmental.carbon.scope2-calculated.v1
environmental.carbon.scope3-calculated.v1
environmental.carbon.calculation-verified.v1

// Carbon targets
environmental.carbon.target-set.v1
environmental.carbon.target-updated.v1
environmental.carbon.target-achieved.v1
environmental.carbon.sbti-validated.v1

// Carbon offsets
environmental.carbon.offset-purchased.v1
environmental.carbon.offset-retired.v1
environmental.carbon.offset-verified.v1
```

### Water Management Events
```typescript
// Water tracking
environmental.water.consumption-recorded.v1
environmental.water.withdrawal-tracked.v1
environmental.water.discharge-measured.v1
environmental.water.quality-tested.v1

// Water risk
environmental.water.stress-assessed.v1
environmental.water.risk-identified.v1
environmental.water.target-set.v1
```

### Waste Management Events
```typescript
// Waste tracking
environmental.waste.generated.v1
environmental.waste.diverted.v1
environmental.waste.disposed.v1
environmental.waste.recycled.v1

// Hazardous waste
environmental.waste.hazardous-identified.v1
environmental.waste.hazardous-disposed.v1
environmental.waste.manifest-created.v1
```

### Energy Events
```typescript
// Energy consumption
environmental.energy.consumed.v1
environmental.energy.renewable-generated.v1
environmental.energy.efficiency-improved.v1
environmental.energy.peak-demand-reduced.v1

// Renewable energy
environmental.energy.rec-purchased.v1
environmental.energy.ppa-signed.v1
environmental.energy.solar-installed.v1
```

### Biodiversity Events
```typescript
// Biodiversity impact
environmental.biodiversity.habitat-assessed.v1
environmental.biodiversity.species-monitored.v1
environmental.biodiversity.impact-mitigated.v1
environmental.biodiversity.restoration-completed.v1

// Nature-based solutions
environmental.nature.project-initiated.v1
environmental.nature.carbon-sequestered.v1
environmental.nature.ecosystem-restored.v1
```

### Climate Risk Events
```typescript
// Physical risks
environmental.climate.physical-risk-assessed.v1
environmental.climate.hazard-identified.v1
environmental.climate.vulnerability-scored.v1
environmental.climate.adaptation-implemented.v1

// Transition risks
environmental.climate.transition-risk-assessed.v1
environmental.climate.policy-impact-analyzed.v1
environmental.climate.technology-risk-identified.v1
environmental.climate.scenario-modeled.v1
```

## 👥 Social Domain Events

### Human Capital Events
```typescript
// Employee lifecycle
social.employee.hired.v1
social.employee.onboarded.v1
social.employee.promoted.v1
social.employee.transferred.v1
social.employee.terminated.v1

// Performance & development
social.talent.performance-reviewed.v1
social.talent.goal-set.v1
social.talent.skill-assessed.v1
social.talent.training-completed.v1
social.talent.certification-earned.v1

// Engagement
social.engagement.survey-completed.v1
social.engagement.feedback-received.v1
social.engagement.action-planned.v1
social.engagement.improvement-measured.v1
```

### Health & Safety Events
```typescript
// Incident management
social.safety.incident-reported.v1
social.safety.incident-investigated.v1
social.safety.near-miss-recorded.v1
social.safety.corrective-action-taken.v1

// Risk management
social.safety.hazard-identified.v1
social.safety.risk-assessed.v1
social.safety.control-implemented.v1
social.safety.audit-conducted.v1

// Training & compliance
social.safety.training-completed.v1
social.safety.certification-renewed.v1
social.safety.inspection-passed.v1
```

### Diversity & Inclusion Events
```typescript
// DEI tracking
social.diversity.demographics-updated.v1
social.diversity.representation-measured.v1
social.diversity.pay-equity-analyzed.v1
social.diversity.bias-incident-reported.v1

// Inclusion initiatives
social.inclusion.program-launched.v1
social.inclusion.erg-formed.v1
social.inclusion.accessibility-improved.v1
social.inclusion.belonging-measured.v1
```

### Labor Rights Events
```typescript
// Labor practices
social.labor.wage-reviewed.v1
social.labor.overtime-monitored.v1
social.labor.contract-negotiated.v1
social.labor.grievance-filed.v1
social.labor.grievance-resolved.v1

// Rights violations
social.labor.violation-identified.v1
social.labor.child-labor-risk-assessed.v1
social.labor.forced-labor-investigated.v1
social.labor.remediation-completed.v1
```

### Community Events
```typescript
// Community engagement
social.community.investment-made.v1
social.community.project-initiated.v1
social.community.stakeholder-consulted.v1
social.community.impact-measured.v1

// Indigenous rights
social.community.fpic-obtained.v1
social.community.cultural-site-protected.v1
social.community.benefit-shared.v1
```

### Supply Chain Social Events
```typescript
// Supplier assessment
social.supplier.assessed.v1
social.supplier.audit-conducted.v1
social.supplier.risk-scored.v1
social.supplier.corrective-action-requested.v1

// Modern slavery
social.supplier.modern-slavery-assessed.v1
social.supplier.human-rights-violation-found.v1
social.supplier.remediation-tracked.v1
social.supplier.capacity-built.v1
```

## 🏛️ Governance Domain Events

### Board Governance Events
```typescript
// Board composition
governance.board.member-appointed.v1
governance.board.member-retired.v1
governance.board.independence-assessed.v1
governance.board.skills-evaluated.v1

// Board activities
governance.board.meeting-held.v1
governance.board.resolution-passed.v1
governance.board.committee-formed.v1
governance.board.esg-training-completed.v1
```

### Ethics & Compliance Events
```typescript
// Code of conduct
governance.ethics.code-updated.v1
governance.ethics.attestation-completed.v1
governance.ethics.violation-reported.v1
governance.ethics.investigation-opened.v1
governance.ethics.disciplinary-action-taken.v1

// Anti-corruption
governance.compliance.bribery-risk-assessed.v1
governance.compliance.gift-registered.v1
governance.compliance.third-party-screened.v1
governance.compliance.training-completed.v1

// Whistleblower
governance.whistleblower.report-filed.v1
governance.whistleblower.case-opened.v1
governance.whistleblower.investigation-completed.v1
governance.whistleblower.retaliation-prevented.v1
```

### Risk Management Events
```typescript
// Risk identification
governance.risk.identified.v1
governance.risk.assessed.v1
governance.risk.registered.v1
governance.risk.updated.v1
governance.risk.closed.v1

// Control management
governance.control.implemented.v1
governance.control.tested.v1
governance.control.failed.v1
governance.control.remediated.v1

// Incident management
governance.incident.occurred.v1
governance.incident.escalated.v1
governance.incident.contained.v1
governance.incident.resolved.v1
```

### Data Privacy Events
```typescript
// Privacy management
governance.privacy.consent-obtained.v1
governance.privacy.consent-withdrawn.v1
governance.privacy.data-request-received.v1
governance.privacy.data-deleted.v1

// Data breach
governance.privacy.breach-detected.v1
governance.privacy.breach-contained.v1
governance.privacy.breach-notified.v1
governance.privacy.breach-resolved.v1

// Privacy compliance
governance.privacy.assessment-completed.v1
governance.privacy.dpia-conducted.v1
governance.privacy.audit-performed.v1
```

### Cybersecurity Events
```typescript
// Security incidents
governance.security.threat-detected.v1
governance.security.vulnerability-found.v1
governance.security.attack-blocked.v1
governance.security.incident-responded.v1

// Security management
governance.security.patch-applied.v1
governance.security.access-reviewed.v1
governance.security.training-completed.v1
governance.security.audit-conducted.v1
```

## 📊 Strategic ESG Events

### Materiality Events
```typescript
// Materiality assessment
strategic.materiality.assessment-initiated.v1
strategic.materiality.stakeholder-surveyed.v1
strategic.materiality.issue-prioritized.v1
strategic.materiality.matrix-updated.v1
strategic.materiality.threshold-changed.v1
```

### Target & Strategy Events
```typescript
// Target management
strategic.target.set.v1
strategic.target.updated.v1
strategic.target.progress-measured.v1
strategic.target.achieved.v1
strategic.target.missed.v1

// Strategy execution
strategic.strategy.initiative-launched.v1
strategic.strategy.milestone-reached.v1
strategic.strategy.budget-allocated.v1
strategic.strategy.roi-calculated.v1
```

### Benchmarking Events
```typescript
// Performance comparison
strategic.benchmark.peer-identified.v1
strategic.benchmark.data-collected.v1
strategic.benchmark.gap-analyzed.v1
strategic.benchmark.improvement-planned.v1
```

### ESG Rating Events
```typescript
// Rating management
strategic.rating.score-received.v1
strategic.rating.score-improved.v1
strategic.rating.questionnaire-submitted.v1
strategic.rating.verification-completed.v1
```

## 📈 Reporting & Analytics Events

### Report Generation Events
```typescript
// Report lifecycle
reporting.report.generation-started.v1
reporting.report.data-collected.v1
reporting.report.validation-completed.v1
reporting.report.generated.v1
reporting.report.published.v1

// Framework reporting
reporting.gri.report-created.v1
reporting.sasb.metrics-calculated.v1
reporting.tcfd.disclosure-completed.v1
reporting.cdp.response-submitted.v1
reporting.csrd.compliance-checked.v1
```

### Analytics Events
```typescript
// Data analysis
analytics.analysis.started.v1
analytics.insight.generated.v1
analytics.anomaly.detected.v1
analytics.trend.identified.v1
analytics.prediction.made.v1

// ML model events
analytics.model.trained.v1
analytics.model.deployed.v1
analytics.model.prediction-made.v1
analytics.model.drift-detected.v1
analytics.model.retrained.v1
```

## 📝 Event Schema Structure

### Base Event Schema
```typescript
interface BaseEvent {
  // Event metadata
  id: string;                    // Unique event ID (UUID)
  type: string;                   // Event type (domain.aggregate.action.v1)
  version: string;                // Schema version
  timestamp: string;              // ISO 8601 timestamp

  // Context
  correlationId: string;          // Request correlation ID
  causationId: string;            // ID of event that caused this
  organizationId: string;         // Organization context
  userId: string;                 // User who triggered event

  // Source
  source: {
    service: string;              // Service that emitted event
    instance: string;             // Instance ID
    version: string;              // Service version
  };

  // Payload
  data: object;                   // Event-specific data

  // Metadata
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    [key: string]: any;
  };
}
```

### Environmental Event Example
```typescript
interface EmissionCalculatedEvent extends BaseEvent {
  type: 'environmental.carbon.emission-calculated.v1';
  data: {
    calculationId: string;
    facilityId: string;
    scope: 'scope1' | 'scope2' | 'scope3';
    category?: string;              // For Scope 3
    activityData: {
      value: number;
      unit: string;
      period: {
        start: string;
        end: string;
      };
    };
    emissionFactor: {
      id: string;
      value: number;
      unit: string;
      source: string;
    };
    result: {
      emissions: number;
      unit: 'kgCO2e' | 'tCO2e';
      uncertainty?: {
        min: number;
        max: number;
        confidence: number;
      };
    };
    methodology: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
  };
}
```

### Social Event Example
```typescript
interface SafetyIncidentReportedEvent extends BaseEvent {
  type: 'social.safety.incident-reported.v1';
  data: {
    incidentId: string;
    facilityId: string;
    reportedBy: string;
    dateOccurred: string;
    type: 'injury' | 'near-miss' | 'property-damage' | 'environmental';
    severity: 'minor' | 'moderate' | 'serious' | 'fatal';
    description: string;
    involvedPersonnel: Array<{
      id: string;
      role: string;
      injury?: string;
    }>;
    immediatActions: string[];
    investigationRequired: boolean;
    regulatoryReportable: boolean;
    location: {
      area: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };
}
```

### Governance Event Example
```typescript
interface RiskIdentifiedEvent extends BaseEvent {
  type: 'governance.risk.identified.v1';
  data: {
    riskId: string;
    title: string;
    description: string;
    category: 'strategic' | 'operational' | 'financial' | 'compliance' | 'esg';
    identifiedBy: string;
    likelihood: 1 | 2 | 3 | 4 | 5;
    impact: 1 | 2 | 3 | 4 | 5;
    riskScore: number;
    velocity: 'slow' | 'medium' | 'fast';
    affectedAreas: string[];
    potentialLoss?: {
      min: number;
      max: number;
      currency: string;
    };
    proposedControls: string[];
    owner: string;
    reviewDate: string;
  };
}
```

## 🔄 Event Processing

### Event Flow Architecture
```yaml
1. Service emits event → Event Bus (Kafka/EventBridge)
2. Event Router → Topic/Queue distribution
3. Event Consumers → Process events
4. Event Store → Persistent storage
5. Event Projections → Read models
6. Event Analytics → Insights generation
```

### Event Consumer Patterns

#### Command Handler Pattern
```typescript
@EventHandler('environmental.carbon.target-set.v1')
class CarbonTargetSetHandler {
  async handle(event: TargetSetEvent): Promise<void> {
    // Update read models
    await this.projectionStore.updateTargets(event.data);

    // Trigger workflows
    await this.workflowEngine.startTargetTracking(event.data.targetId);

    // Send notifications
    await this.notificationService.notifyStakeholders(event);
  }
}
```

#### Saga Pattern
```typescript
class EmissionReportingSaga {
  @SagaEventHandler('environmental.carbon.emission-calculated.v1')
  async onEmissionCalculated(event: EmissionCalculatedEvent) {
    // Check if all emissions for period are calculated
    const complete = await this.checkPeriodComplete(event);

    if (complete) {
      // Trigger report generation
      await this.commandBus.send(new GenerateEmissionReportCommand({
        period: event.data.activityData.period,
        organizationId: event.organizationId
      }));
    }
  }

  @SagaEventHandler('reporting.report.generated.v1')
  async onReportGenerated(event: ReportGeneratedEvent) {
    // Notify stakeholders
    await this.publishEvent({
      type: 'reporting.report.published.v1',
      data: event.data
    });
  }
}
```

## 🔐 Event Security

### Event Signing
```typescript
// All events are signed with HMAC-SHA256
interface SignedEvent extends BaseEvent {
  signature: string;
  signedAt: string;
}

// Verification
function verifyEventSignature(event: SignedEvent, secret: string): boolean {
  const payload = JSON.stringify({
    id: event.id,
    type: event.type,
    timestamp: event.timestamp,
    data: event.data
  });

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return event.signature === expectedSignature;
}
```

### Event Encryption
```typescript
// Sensitive data fields are encrypted
interface EncryptedEvent extends BaseEvent {
  data: {
    encrypted: boolean;
    algorithm: 'AES-256-GCM';
    payload: string;        // Base64 encoded encrypted data
    iv: string;             // Initialization vector
    authTag: string;        // Authentication tag
  };
}
```

## 📊 Event Monitoring

### Key Metrics
```yaml
Event Volume:
  - Events/second by type
  - Peak event rates
  - Event size distribution

Processing Performance:
  - Processing latency (p50, p95, p99)
  - Consumer lag
  - Dead letter queue size

Reliability:
  - Event delivery success rate
  - Retry rates
  - Failed event counts

Business Metrics:
  - Critical events processed
  - SLA compliance
  - Event-driven automation rate
```

### Alerting Rules
```yaml
Critical Alerts:
  - Consumer lag > 1000 events
  - Processing failure rate > 1%
  - Event signature validation failures
  - Dead letter queue growth

Warning Alerts:
  - Processing latency p95 > 1 second
  - Event size > 1MB
  - Retry rate > 5%
  - Schema version mismatches
```

## 🔄 Event Versioning

### Version Strategy
```yaml
Backward Compatible Changes (Minor Version):
  - Adding optional fields
  - Adding new event types
  - Adding metadata fields

Breaking Changes (Major Version):
  - Removing required fields
  - Changing field types
  - Renaming fields
  - Changing event semantics
```

### Version Migration
```typescript
// Event version converter
class EventVersionConverter {
  convert(event: BaseEvent): BaseEvent {
    switch(event.version) {
      case 'v1':
        return this.convertV1ToV2(event);
      case 'v2':
        return event; // Current version
      default:
        throw new Error(`Unsupported event version: ${event.version}`);
    }
  }

  private convertV1ToV2(event: BaseEvent): BaseEvent {
    // Apply transformation logic
    return {
      ...event,
      version: 'v2',
      // Add new required fields with defaults
      // Transform existing fields as needed
    };
  }
}
```

## 📚 Event Store Configuration

### Retention Policies
```yaml
Event Categories:
  Audit Events:        7 years
  Compliance Events:   7 years
  Financial Events:    7 years
  Operational Events:  3 years
  Analytics Events:    1 year
  System Events:       90 days
```

### Partitioning Strategy
```yaml
Partition Keys:
  - By organization_id (primary)
  - By event_type (secondary)
  - By timestamp (time-based partitioning)

Partition Rotation:
  - Daily partitions for hot data
  - Monthly partitions after 30 days
  - Yearly partitions after 1 year
```

---

**This Event Schema Registry provides the foundation for event-driven architecture across the entire ESG platform, ensuring consistent communication and data flow between all microservices.**