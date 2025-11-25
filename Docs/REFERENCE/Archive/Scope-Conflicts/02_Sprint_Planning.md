# Delivery & Phasing Plan - Clenergize V3 Rebuild

## Executive Summary

This document outlines a pragmatic 8-month delivery plan for rebuilding Clenergize V3 with a small team (3-5 developers). The plan prioritizes **risk mitigation first** (security and data model fixes), followed by **calculation correctness**, then user-facing features. We use the Strangler Fig pattern for incremental migration.

## Team Composition & Assumptions

### Team Structure (3-5 people)
- **1 Tech Lead/Architect** (full-time)
- **2-3 Full-Stack Developers** (full-time)
- **1 DevOps/Platform Engineer** (part-time, shared)
- **1 QA Engineer** (part-time, starts Phase 1)
- **Product Owner** (you, for clarifications and acceptance)

### Working Assumptions
- **Sprint Duration**: 2 weeks
- **Velocity**: 40-60 story points per sprint (team total)
- **Working Days**: ~20 days/month per developer
- **Ceremony Time**: 15% (planning, reviews, retros)
- **Buffer**: 20% for unknowns and technical debt

## Delivery Phases Overview

```
Phase 0: Foundation & Risk Mitigation (Months 1-2) - 4 sprints
  → Critical security fixes, infrastructure, shared libraries

Phase 1: Core Services MVP (Months 3-4) - 4 sprints
  → Identity, Organization, Reference services

Phase 2: Calculation Engine (Months 5-6) - 4 sprints
  → Activity, Calculation services with correctness focus

Phase 3: Reporting & Analytics (Month 7) - 2 sprints
  → Reporting service, dashboards, exports

Phase 4: Hardening & Migration (Month 8) - 2 sprints
  → Audit service, data migration, cutover prep

Total: 8 months, 16 sprints
```

---

## PHASE 0: Foundation & Risk Mitigation
**Duration**: Months 1-2 (4 sprints)
**Team Focus**: Entire team on foundation

### Goals
✓ Eliminate critical security vulnerabilities
✓ Establish secure infrastructure and CI/CD
✓ Create shared libraries with security-first design
✓ Set up development standards and tooling

### Scope

#### Sprint 0.1-0.2: Security & Infrastructure (Critical Risk Mitigation)
**Deliverables**:
- AWS infrastructure setup (VPC, ECS, RDS, EventBridge)
- Secure secrets management (AWS Secrets Manager)
- JWT implementation with JWKS verification (fix critical vulnerability)
- API Gateway with rate limiting and DDoS protection
- MongoDB Atlas cluster with encryption at rest
- Redis cluster for caching/sessions

**Key Stories**:
- Set up AWS infrastructure with IaC (Terraform/CDK)
- Implement JWT library with proper signature verification
- Create secure configuration management system
- Set up centralized logging (CloudWatch)
- Implement health check endpoints pattern

**Risks Mitigated**:
- ❗ JWT token forgery vulnerability
- ❗ Default secret fallbacks
- ❗ Missing rate limiting
- ❗ No infrastructure automation

#### Sprint 0.3-0.4: Shared Libraries & Standards
**Deliverables**:
- Event bus abstraction (EventBridge client)
- Database connection management with retry logic
- Error handling framework
- Validation framework with DTOs
- Audit logging interceptor
- Authentication/authorization guards

**Key Stories**:
- Create @clenergize/common package
- Implement event publishing with schema validation
- Build MongoDB repository base class
- Create standard error taxonomy
- Implement correlation ID propagation
- Set up API documentation (OpenAPI)

**Risks Mitigated**:
- ❗ No event schema validation
- ❗ Inconsistent error handling
- ❗ Missing transaction support
- ❗ Type safety issues (any everywhere)

### Dependencies
- AWS account and permissions
- MongoDB Atlas account
- Development tools and licenses

### Exit Criteria
✓ All critical security vulnerabilities fixed
✓ Infrastructure provisioned and tested
✓ Shared libraries published to private npm
✓ CI/CD pipeline operational
✓ Security scanning integrated

### Risk Management
| Risk | Impact | Mitigation |
|------|--------|------------|
| AWS service limits | Delays | Request limit increases early |
| Learning curve on EventBridge | Velocity | Spike during Sprint 0.1 |
| Scope creep on shared libraries | Delays | Strict MVP scope, iterate later |

---

## PHASE 1: Core Services MVP
**Duration**: Months 3-4 (4 sprints)
**Team Split**: 2 devs on Identity/Org, 1 on Reference

### Goals
✓ Establish identity and access management
✓ Implement organization structure (reference-based)
✓ Deploy reference data management
✓ Enable basic project creation flow

### Scope

#### Sprint 1.1-1.2: Identity Service
**Deliverables**:
- User registration/login with Cognito
- JWT token generation and validation
- Role-based access control (RBAC)
- Session management with Redis
- Password reset flow
- User profile management

**Key Stories**:
- Implement authentication endpoints
- Integrate AWS Cognito user pools
- Create RBAC with configurable permissions
- Build session management with Redis
- Implement password policies
- Add MFA support (TOTP)

**Risks Mitigated**:
- ❗ Broken authentication
- ❗ Missing authorization checks
- ❗ No session management

#### Sprint 1.3: Organization Service
**Deliverables**:
- Company management
- Project creation (no cloning!)
- Reference-based hierarchy (Entity/Subsidiary/Location)
- Team assignments
- Permission evaluation

**Key Stories**:
- Create company CRUD endpoints
- Implement project lifecycle management
- Build hierarchy with references (not clones!)
- Create assignment system
- Implement permission evaluation logic

**Risks Mitigated**:
- ❗ Hierarchy cloning anti-pattern
- ❗ Denormalized data
- ❗ Permission model issues

#### Sprint 1.4: Reference Service
**Deliverables**:
- Emission factor management
- Conversion factors
- Parameter storage
- QC workflow (Draft → Review → Approved)
- Factor import from templates

**Key Stories**:
- Create emission factor CRUD
- Implement QC approval workflow
- Build conversion calculator
- Import initial factors from current system
- Create factor search/recommendation engine

**Risks Mitigated**:
- ❗ Unvalidated calculation inputs
- ❗ No version control on factors
- ❗ Missing QC process

### Integration Points
- Identity ← → Organization (user verification)
- All services → EventBridge (event publishing)

### Exit Criteria
✓ Users can register and authenticate
✓ Projects can be created with proper hierarchy
✓ Reference data available for calculations
✓ All services deployable independently
✓ Integration tests passing

### Risk Management
| Risk | Impact | Mitigation |
|------|--------|------------|
| Cognito integration complexity | Delays | Use AWS SDK, not custom |
| Hierarchy migration complexity | Data issues | Build migration tools early |
| Permission model performance | Slow APIs | Cache evaluation results |

---

## PHASE 2: Calculation Engine
**Duration**: Months 5-6 (4 sprints)
**Team Focus**: 2 devs on Activity/Calc, 1 on integration

### Goals
✓ Enable activity data collection
✓ Implement accurate emission calculations
✓ Ensure full calculation traceability
✓ Support data imports and validation

### Scope

#### Sprint 2.1-2.2: Activity Service
**Deliverables**:
- Activity data CRUD operations
- Data validation framework
- Bulk import (CSV/Excel)
- File attachments (S3)
- Data quality scoring

**Key Stories**:
- Create activity record management
- Implement validation rules engine
- Build CSV/Excel import with mapping
- Add S3 integration for attachments
- Create data quality metrics
- Build activity search/filter APIs

**Focus on Correctness**:
- Schema validation on all inputs
- Unit validation (kg, kWh, etc.)
- Date range validation
- Duplicate detection

#### Sprint 2.3-2.4: Calculation Service
**Deliverables**:
- Emission calculation engine
- Multiple methodology support
- Allocation logic (shared emissions)
- Hierarchical aggregations
- Result caching
- Full traceability

**Key Stories**:
- Implement GHG Protocol calculations
- Build factor selection algorithm
- Create allocation distribution logic
- Implement hierarchy roll-ups
- Add calculation job queue (SQS)
- Build result caching layer

**Focus on Correctness**:
- Traceable calculations (activity → factor → result)
- Methodology documentation in results
- Uncertainty propagation
- Idempotent calculations
- Comprehensive calculation logs

### Integration Points
- Activity → Reference (factor lookup)
- Activity → Organization (hierarchy validation)
- Calculation → Activity (data fetch)
- Calculation → Reference (factors)

### Exit Criteria
✓ Complete activity data flow working
✓ Calculations match Excel validation sheets
✓ Full calculation traceability
✓ Import success rate > 95%
✓ Calculation performance < 5s per record

### Risk Management
| Risk | Impact | Mitigation |
|------|--------|------------|
| Calculation accuracy issues | Trust loss | Extensive testing against known results |
| Import mapping complexity | User frustration | Template library, smart mapping |
| Performance at scale | Slow calculations | Queue-based async processing |

---

## PHASE 3: Reporting & Analytics
**Duration**: Month 7 (2 sprints)
**Team Focus**: 2 devs on Reporting, 1 on frontend integration

### Goals
✓ Enable dashboards and visualizations
✓ Generate compliance reports
✓ Support data exports
✓ Provide trend analytics

### Scope

#### Sprint 3.1: Reporting Service Core
**Deliverables**:
- Report generation engine
- Dashboard API
- Analytics calculations
- Export functionality
- Report templates

**Key Stories**:
- Create report generation pipeline
- Build dashboard configuration API
- Implement analytics aggregations
- Add PDF/Excel generation
- Create standard report templates

#### Sprint 3.2: Real-time & Integration
**Deliverables**:
- WebSocket for real-time updates
- Frontend integration
- Chart components
- Target tracking
- Scheduled reports

**Key Stories**:
- Implement WebSocket server
- Build real-time dashboard updates
- Create target progress tracking
- Add report scheduling
- Integrate with frontend

### Exit Criteria
✓ Dashboards loading < 2s
✓ Reports generating correctly
✓ Exports working for all formats
✓ Real-time updates functional

### Risk Management
| Risk | Impact | Mitigation |
|------|--------|------------|
| Report performance | Slow generation | Pre-aggregate data |
| WebSocket stability | Connection drops | Implement reconnection |

---

## PHASE 4: Hardening & Migration
**Duration**: Month 8 (2 sprints)
**Team Focus**: Entire team on migration and quality

### Goals
✓ Complete audit trail implementation
✓ Migrate production data
✓ Performance optimization
✓ Production hardening

### Scope

#### Sprint 4.1: Audit Service & Observability
**Deliverables**:
- Audit service deployment
- Complete observability stack
- Performance optimization
- Security hardening

**Key Stories**:
- Deploy audit service
- Implement compliance reports
- Add distributed tracing
- Performance testing and tuning
- Security penetration testing
- Documentation completion

#### Sprint 4.2: Data Migration & Cutover
**Deliverables**:
- Data migration tools
- Parallel run validation
- Cutover plan execution
- Legacy system decommission

**Key Stories**:
- Run full data migration
- Validate calculation parity
- Execute cutover plan
- Monitor system stability
- Archive legacy system

### Exit Criteria
✓ All data migrated successfully
✓ Calculation results match within 0.1%
✓ All security tests passing
✓ Performance SLOs met
✓ Zero critical bugs

### Risk Management
| Risk | Impact | Mitigation |
|------|--------|------------|
| Data migration errors | Data loss | Multiple dry runs, validation |
| Cutover issues | Downtime | Rollback plan ready |
| Performance regression | User impact | Load testing, gradual rollout |

---

## Sprint Planning Details

### Sprint Capacity Planning

**Team Velocity Assumptions**:
- Tech Lead: 6 points/sprint (architecture, reviews, coordination)
- Senior Dev: 10 points/sprint
- Mid Dev: 8 points/sprint
- **Total**: ~35-40 points/sprint

### Story Point Guidelines
- **1 point**: < 4 hours (simple change)
- **2 points**: 4-8 hours (standard feature)
- **3 points**: 1-2 days (complex feature)
- **5 points**: 2-3 days (very complex)
- **8 points**: 3-5 days (epic-sized)

### Sprint Cadence
```
Week 1:
- Monday: Sprint planning (4 hours)
- Tuesday-Friday: Development

Week 2:
- Monday-Wednesday: Development
- Thursday: Code freeze, testing
- Friday: Sprint review (2 hours), Retro (1 hour)
```

---

## Migration Strategy (Strangler Fig Pattern)

### Approach
1. **Proxy Layer**: Route traffic through new API Gateway
2. **Service by Service**: Replace one service at a time
3. **Parallel Run**: New and old systems side-by-side
4. **Gradual Cutover**: Feature flags for traffic routing
5. **Rollback Ready**: Keep old system operational

### Migration Sequence

```
Month 1-2: Foundation
  ├── New infrastructure parallel to old
  └── Shared libraries (no user impact)

Month 3-4: Identity & Organization
  ├── New auth with fallback to old
  ├── Shadow writes to new Organization
  └── Read from old, validate against new

Month 5-6: Activity & Calculation
  ├── Dual writes for new activities
  ├── Parallel calculations for validation
  └── Compare results, alert on mismatch

Month 7: Reporting
  ├── New dashboards alongside old
  └── User choice of UI

Month 8: Cutover
  ├── Migrate remaining data
  ├── Switch primary traffic
  └── Decommission old services
```

### Rollback Strategy
- **Database**: Point-in-time restore capability
- **Services**: Blue-green deployment
- **Traffic**: API Gateway routing rules
- **Data**: Backup before each migration step

---

## Risk Register & Mitigation

### Critical Risks (Severity: High, Probability: Medium-High)

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| JWT implementation flaws | Security breach | Medium | Code review, security testing, use proven libraries | Tech Lead |
| Data migration corruption | Data loss | Medium | Multiple dry runs, checksums, validation | DevOps |
| Calculation inaccuracy | Business impact | Medium | Extensive testing, parallel run | QA |
| Team member leaves | Velocity loss | Low-Medium | Knowledge sharing, documentation | Tech Lead |
| AWS service outage | Downtime | Low | Multi-AZ deployment, DR plan | DevOps |

### Risk Mitigation Timeline
- **Immediate** (Phase 0): Security vulnerabilities, JWT implementation
- **Short-term** (Phase 1): Data model fixes, authentication
- **Medium-term** (Phase 2): Calculation accuracy, performance
- **Long-term** (Phase 3-4): Scalability, operational excellence

---

## Success Metrics & KPIs

### Phase 0 Success Metrics
- ✓ 0 critical security vulnerabilities
- ✓ 100% infrastructure as code
- ✓ JWT verification < 50ms

### Phase 1 Success Metrics
- ✓ Authentication success rate > 99.9%
- ✓ Hierarchy operations < 500ms
- ✓ 0 data duplication in hierarchies

### Phase 2 Success Metrics
- ✓ Calculation accuracy 100% match with test data
- ✓ Import success rate > 95%
- ✓ Full calculation traceability

### Phase 3 Success Metrics
- ✓ Dashboard load time < 2s
- ✓ Report generation < 30s
- ✓ User satisfaction score > 4/5

### Phase 4 Success Metrics
- ✓ 100% data migration success
- ✓ 0 critical bugs in production
- ✓ System uptime > 99.9%

---

## Communication Plan

### Stakeholder Updates
- **Weekly**: Team standups (15 min daily)
- **Bi-weekly**: Sprint reviews with Product Owner
- **Monthly**: Executive status report
- **Phase Gates**: Go/no-go decision meetings

### Documentation
- **Architecture Decision Records** (ADRs)
- **API Documentation** (OpenAPI/Swagger)
- **Runbooks** (operations)
- **Migration Guides** (for each phase)

### Channels
- **Slack**: #clenergize-rebuild (day-to-day)
- **Jira**: Epic/story tracking
- **Confluence**: Documentation
- **GitHub**: Code, PRs, issues

---

## Budget Considerations

### Infrastructure Costs (Monthly Estimate)
- **AWS ECS Fargate**: $500-800
- **MongoDB Atlas**: $300-500
- **Redis**: $100-200
- **API Gateway**: $50-100
- **S3/CloudWatch**: $100-200
- **Total**: ~$1,050-1,800/month

### Tool Costs (Annual)
- **Jira/Confluence**: Included
- **GitHub**: Included
- **Monitoring (Datadog/New Relic)**: $200/month
- **Security scanning**: $100/month

### Contingency
- **20% buffer** for unexpected costs
- **Performance optimization** may require larger instances
- **Data migration** might need temporary additional storage

---

## Quality Gates & Definition of Done

### Definition of Done (per Story)
1. Code complete and reviewed
2. Unit tests written (80% coverage)
3. Integration tests passing
4. API documentation updated
5. No critical security issues
6. Performance requirements met
7. Deployed to staging environment
8. Product Owner acceptance

### Phase Gate Criteria
Each phase must meet these criteria before proceeding:
1. All critical user stories complete
2. No critical bugs
3. Performance SLOs met
4. Security scan passed
5. Documentation complete
6. Stakeholder sign-off

---

## Conclusion

This phased delivery plan prioritizes **risk mitigation first**, focusing on fixing critical security vulnerabilities and data model issues before adding new features. The approach is realistic for a small team, with achievable sprint goals and clear exit criteria for each phase.

The Strangler Fig migration pattern allows us to incrementally replace the old system while maintaining operational stability. By Month 8, we'll have a secure, maintainable, and scalable platform ready for production use.

### Next Steps
1. Review and approve this delivery plan
2. Set up Jira project structure
3. Begin Sprint 0.1 planning
4. Establish team working agreements
5. Schedule phase gate reviews

### Critical Success Factors
- ✓ Strong technical leadership
- ✓ Clear communication
- ✓ Realistic expectations
- ✓ Continuous validation
- ✓ Focus on quality over speed