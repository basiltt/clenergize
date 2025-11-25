# Service Specifications - Phase 1 (7 Services)

> **Scope**: 340 SP | 12 weeks | 7 services | 7 developers
> **Reference**: [CURRENT_SCOPE.md](../00-Scope/CURRENT_SCOPE.md)

## ESG-Generic Architecture

All services MUST implement ESG-generic data models to support future expansion.

**Required Reading**: [ESG_GENERIC_DATA_MODELS.md](../../SHARED/Architecture/ESG_GENERIC_DATA_MODELS.md)

Phase 1 implements `domain='Environmental'`, `subdomain='Carbon'` only, but uses generic interfaces.

## Service List

| Service | Port | Spec Document |
|---------|------|---------------|
| Identity | 3001 | [01_Identity_Service.md](01_Identity_Service.md) |
| Organization | 3002 | [02_Organization_Service.md](02_Organization_Service.md) |
| Reference | 3003 | [03_Reference_Service.md](03_Reference_Service.md) |
| Activity | 3004 | [04_Activity_Service.md](04_Activity_Service.md) |
| Calculation | 3005 | [05_Calculation_Service.md](05_Calculation_Service.md) |
| Reporting | 3006 | [06_Reporting_Service.md](06_Reporting_Service.md) |
| Audit | 3007 | [07_Audit_Service.md](07_Audit_Service.md) |

## Quick Reference (Condensed Specs)

This section provides condensed specifications for services 4-7:

---

## 4. Activity Service Specification

### Overview
**Port**: 3004
**Purpose**: Collect, validate, and manage emission activity data
**Domain**: Activity Data Management

### Core Features
- Activity data CRUD operations
- Data validation against schemas
- Bulk import (CSV, Excel, API)
- File management (documents, evidence)
- Data quality scoring
- Template management

### Key API Endpoints
```yaml
POST /api/v1/activities
  - Create single activity record
GET /api/v1/activities
  - Query activities with filters
POST /api/v1/activities/import
  - Bulk import with validation
POST /api/v1/activities/validate
  - Validate without saving
GET /api/v1/templates
  - Get import templates
POST /api/v1/exports
  - Export activity data
```

### Data Model Highlights
```javascript
activities: {
  activityId, projectId, unitId,
  period: {startDate, endDate},
  category: {scope, type, subtype},
  data: {quantity, unit, description},
  validation: {status, errors, warnings},
  attachments: [{fileId, s3Url}],
  audit: {createdBy, createdAt, modifiedBy}
}

imports: {
  importId, projectId, status,
  file: {name, s3Key, format},
  results: {total, valid, invalid, errors[]},
  mapping: {columns, transformations}
}
```

### Events
- **Published**: ActivityDataCreated, ActivityDataUpdated, DataImported, ValidationCompleted
- **Consumed**: HierarchyUpdated (update location refs), EmissionFactorApproved (revalidate)

### Non-Functional Requirements
- Import speed: 5000 records/minute
- Validation: < 100ms per record
- File storage: S3 with 5GB limit per file
- Concurrent imports: 10 per project

---

## 5. Calculation Service Specification

### Overview
**Port**: 3005
**Purpose**: Calculate emissions, handle allocations, aggregations, and what-if scenarios
**Domain**: Emission Calculations

### Core Features
- Emission calculations (all scopes)
- Multiple methodologies (GHG Protocol, ISO)
- Data allocation logic (shared emissions)
- Hierarchical aggregations
- Result caching
- What-if scenario modeling (phased)
- Target tracking calculations

### Key API Endpoints
```yaml
POST /api/v1/calculations/request
  - Submit calculation job
GET /api/v1/calculations/:id/status
  - Check job status
GET /api/v1/calculations/:id/result
  - Get calculation results
POST /api/v1/aggregations/rollup
  - Trigger hierarchy rollup
POST /api/v1/allocations/calculate
  - Calculate shared allocations
POST /api/v1/scenarios/create
  - Create what-if scenario
POST /api/v1/scenarios/:id/compare
  - Compare scenario to baseline
```

### Data Model Highlights
```javascript
calculation_jobs: {
  jobId, projectId, status,
  scope: {units[], period, categories[]},
  methodology: {standard, version, options},
  progress: {current, total, startTime, endTime}
}

calculation_results: {
  resultId, jobId, activityId,
  emissions: {CO2, CH4, N2O, CO2e},
  factors: {factorId, value, source},
  methodology: {approach, equations[], assumptions[]},
  confidence: {level, notes}
}

allocations: {
  allocationId, sourceId, targets[],
  method: {type, basis, percentages[]},
  results: {allocated amounts by target}
}

scenarios: {
  scenarioId, projectId, baselineId,
  parameters: {changes, assumptions},
  results: {emissions, delta, percentage}
}
```

### Calculation Engine
- **Queue**: AWS SQS for job processing
- **Workers**: Auto-scaling based on queue depth
- **Cache**: Redis for factor lookup, result caching
- **Idempotency**: Calculation fingerprinting

### Events
- **Published**: CalculationCompleted, AggregationCompleted, RecalculationRequired
- **Consumed**: ActivityDataCreated, ActivityDataUpdated, EmissionFactorApproved

### Non-Functional Requirements
- Single calculation: < 5s
- Bulk calculation: 1000 records/minute
- Aggregation: < 10s for 10K nodes
- Cache hit ratio: > 80%
- Worker scaling: 1-20 instances

---

## 6. Reporting Service Specification

### Overview
**Port**: 3006
**Purpose**: Generate reports, dashboards, analytics, and exports
**Domain**: Reporting & Analytics

### Core Features
- Report generation (PDF, Excel, HTML)
- Real-time dashboards (WebSocket)
- Analytics and insights
- Data exports (various formats)
- Scheduled reports
- Report templates
- Target tracking visualization
- Trend analysis

### Key API Endpoints
```yaml
GET /api/v1/dashboards/:id
  - Get dashboard configuration
POST /api/v1/reports/generate
  - Generate report
GET /api/v1/analytics/summary
  - Get analytics summary
GET /api/v1/analytics/trends
  - Get trend analysis
GET /api/v1/targets/progress
  - Get target progress
WebSocket /ws/dashboards
  - Real-time dashboard updates
POST /api/v1/exports/request
  - Request data export
```

### Data Model Highlights
```javascript
reports: {
  reportId, projectId, templateId,
  parameters: {period, units[], filters},
  schedule: {frequency, nextRun, recipients[]},
  output: {format, s3Url, generatedAt},
  status: {state, progress}
}

dashboards: {
  dashboardId, projectId, name,
  layout: {grid[], theme},
  widgets: [{
    type: chart|table|metric|map,
    dataSource, configuration, refreshRate
  }],
  sharing: {isPublic, sharedWith[], permissions}
}

analytics: {
  analyticsId, projectId,
  metrics: [{name, value, change, target}],
  insights: [{type, message, severity}],
  trends: {period, data[], forecast}
}
```

### Visualization Components
- Chart.js for graphs
- Materialized views for performance
- Pre-aggregated metrics
- WebSocket for real-time updates

### Events
- **Published**: ReportGenerated, ExportCompleted
- **Consumed**: CalculationCompleted, AggregationCompleted

### Non-Functional Requirements
- Report generation: < 30s for standard reports
- Dashboard load: < 2s
- WebSocket connections: 1000 concurrent
- Export size: up to 100MB

---

## 7. Audit Service Specification

### Overview
**Port**: 3007
**Purpose**: Activity logging, compliance, data lineage
**Domain**: Audit & Compliance

### Core Features
- Comprehensive audit logging
- Compliance reporting
- Data lineage tracking
- User activity monitoring
- Change history
- Retention management
- Forensic analysis tools

### Key API Endpoints
```yaml
GET /api/v1/audit-logs
  - Query audit logs
GET /api/v1/audit-logs/search
  - Advanced search
GET /api/v1/compliance/reports
  - Generate compliance reports
GET /api/v1/lineage/:entityId
  - Get data lineage
GET /api/v1/audit-logs/export
  - Export audit logs
GET /api/v1/analytics/user-activity
  - User activity analytics
```

### Data Model Highlights
```javascript
audit_logs: {
  logId, timestamp, eventId,
  actor: {userId, name, ip, userAgent},
  action: {type, resource, resourceId, method},
  context: {projectId, companyId, sessionId},
  changes: {before, after, diff[]},
  result: {success, error, duration}
}

compliance_reports: {
  reportId, standard, period,
  findings: [{
    requirement, status, evidence[], notes
  }],
  attestation: {officer, date, signature}
}

data_lineage: {
  lineageId, entityType, entityId,
  transformations: [{
    step, operation, source, target, timestamp
  }],
  dependencies: [], impact: []
}
```

### Storage Strategy
- **MongoDB**: Primary storage with TTL indexes
- **Partitioning**: By month for performance
- **Archival**: S3 for long-term storage
- **Retention**: 90 days hot, 7 years cold

### Events
- **Consumed**: ALL events from all services for audit logging

### Non-Functional Requirements
- Write throughput: 10K events/second
- Query performance: < 500ms for 1M records
- Storage: 100GB/month growth
- Retention: Configurable by data type
- Immutability: Write-once, no updates

---

## Common Patterns Across Services

### Security
- JWT authentication via Identity Service
- Role-based authorization
- API rate limiting
- Input validation
- XSS/SQL injection protection

### Observability
- Health checks (/health/live, /health/ready)
- Structured logging (JSON)
- Metrics (CloudWatch)
- Distributed tracing (X-Ray)
- Correlation IDs

### Error Handling
- Consistent error codes
- Detailed error messages
- Retry logic for transient failures
- Circuit breakers for external calls
- Dead letter queues

### Testing
- Unit tests: 80% coverage
- Integration tests: API flows
- Performance tests: Load scenarios
- Security tests: OWASP compliance

### Deployment
- Docker containers
- AWS ECS Fargate
- Auto-scaling based on metrics
- Blue-green deployments
- Environment-specific configs

---

## Service Communication Matrix

| From ↓ / To → | Identity | Organization | Reference | Activity | Calculation | Reporting | Audit |
|---------------|----------|--------------|-----------|----------|-------------|-----------|-------|
| Identity      | -        | Events       | -         | -        | -           | -         | Events|
| Organization  | Sync     | -            | -         | Events   | -           | -         | Events|
| Reference     | -        | -            | -         | Events   | Events      | -         | Events|
| Activity      | -        | Sync         | Sync      | -        | Events      | -         | Events|
| Calculation   | -        | -            | Sync      | Sync     | -           | Events    | Events|
| Reporting     | -        | -            | -         | -        | Sync        | -         | Events|
| Audit         | -        | -            | -         | -        | -           | -         | -     |

**Legend**: Sync = Synchronous HTTP, Events = Async via EventBridge

---

## Migration Priority

1. **Phase 1**: Identity Service (authentication foundation)
2. **Phase 2**: Organization + Reference Services (core data)
3. **Phase 3**: Activity + Calculation Services (core functionality)
4. **Phase 4**: Reporting Service (user value)
5. **Phase 5**: Audit Service (compliance)

---

## Resource Allocation (Per Service)

| Service | Min Instances | Max Instances | CPU | Memory | Storage |
|---------|--------------|---------------|-----|--------|---------|
| Identity | 2 | 5 | 0.5-2 vCPU | 1GB | 10GB |
| Organization | 2 | 5 | 0.5-2 vCPU | 1GB | 20GB |
| Reference | 2 | 3 | 0.25-1 vCPU | 512MB | 10GB |
| Activity | 2 | 10 | 0.5-2 vCPU | 1GB | 50GB |
| Calculation | 2 | 20 | 1-4 vCPU | 2GB | 20GB |
| Reporting | 2 | 5 | 0.5-2 vCPU | 1GB | 30GB |
| Audit | 1 | 3 | 0.25-1 vCPU | 512MB | 100GB |

---

## Next Steps

With all 7 service specifications complete:
1. Review and approve service specifications
2. Proceed to Phase 4: Delivery & Phasing Plan
3. Setup Jira MCP integration
4. Create detailed Jira backlog
5. Define SDLC & Quality Strategy