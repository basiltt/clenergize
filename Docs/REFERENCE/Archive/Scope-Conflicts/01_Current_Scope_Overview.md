# Current Scope Overview - Phase 1: Clenergize Rebuild

**Version**: 2.0.0
**Last Updated**: November 23, 2025
**Status**: Active Development
**Timeline**: 12 weeks (6 sprints)

## What We're Building

**Goal**: Rebuild the existing Clenergize carbon footprint application (from OLD/ folder) with modern architecture.

**This IS**:
- Rebuilding existing carbon footprint functionality
- 7 core microservices with clean architecture
- Event-driven design
- Modern tech stack (NestJS, Next.js, MongoDB, Redis)
- Zero-trust security
- Comprehensive test coverage (80%+)

**This is NOT**:
- The complete ESG platform (50 services)
- New ESG modules (water, waste, biodiversity, etc.)
- Social or Governance services
- Advanced ML/AI analytics

## Services in Scope (7 Total)

### 1. Identity Service (Port 3001)
**Replaces**: OLD/clenergizeV3-user-management-ms-dev

Functionality: User authentication, JWT tokens, RBAC, password reset

Critical Fixes:
- JWT signature verification with JWKS (not just decode)
- AWS Secrets Manager (no hardcoded secrets)

### 2. Organization Service (Port 3002)
**Replaces**: OLD/clenergizeV3-project-management-ms-dev + companyDetails-ms-dev

Functionality: Organizations, projects, hierarchies, user associations

Critical Fixes:
- Reference-based hierarchy (no cloning)
- Proper normalization with event sourcing

### 3. Reference Service (Port 3003)
**Replaces**: OLD/clenergizeV3-master-data-ms-dev

Functionality: Emission factors, units, categories, data versioning

Critical Fixes:
- One-time seeding (not on every startup)
- Version-controlled reference data

### 4. Activity Service (Port 3004)
**Replaces**: Part of OLD/clenergizeV3-carbon-footprint-ms-dev

Functionality: Activity data ingestion, validation, bulk upload

Critical Fixes:
- Zod schema validation
- Separated from calculation logic

### 5. Calculation Service (Port 3005)
**Replaces**: Part of OLD/clenergizeV3-carbon-footprint-ms-dev

Functionality: GHG calculations (Scopes 1,2,3), aggregation, rollups

Critical Fixes:
- Separated calculation service
- MongoDB transactions for consistency

### 6. Reporting Service (Port 3006)
**Replaces**: Part of OLD/clenergizeV3-backend-ms-dev

Functionality: Report generation (PDF, CSV), templates, scheduling

Critical Fixes:
- Proper queue processing (no infinite loops)
- Clean reporting service

### 7. Audit Service (Port 3007)
**NEW** (didn't exist in OLD)

Functionality: Audit trail, compliance logging, immutable storage

Why New: Required for SOC 2 and GDPR compliance

## Scope Metrics

- **Services**: 7 microservices
- **Story Points**: ~350 SP
- **Timeline**: 12 weeks (6 sprints × 2 weeks)
- **Team Size**: 7 developers

**Test Coverage Targets**:
- Unit tests: 80%
- Integration tests: 70%
- E2E tests: Critical user paths

## Success Criteria

**Functional**:
- All OLD functionality replicated
- Users can register, login, create organizations
- Activity data uploaded and validated
- GHG emissions calculated (Scopes 1,2,3)
- Reports generated (PDF, CSV)
- Complete audit trail

**Technical**:
- Zero-trust security with JWT/JWKS
- No hardcoded secrets
- Event-driven architecture
- 80% test coverage
- <200ms p95 latency
- Zero high/critical security vulnerabilities

## Out of Scope (Future Roadmap)

The following are NOT in Phase 1:

**Environmental**: Water, waste, biodiversity, energy, pollution, climate risk
**Social**: Workforce, health & safety, diversity, community, supply chain
**Governance**: Board governance, ethics, risk, privacy, cybersecurity
**Advanced**: ML/AI, benchmarking, multi-framework reporting, materiality

These are in Phases 2-6 (15+ months timeline)

## Sprint Breakdown

- Sprint 0.1 (Weeks 1-2): Local Dev Environment
- Sprint 0.2 (Weeks 3-4): Security Hardening
- Sprint 1.1 (Weeks 5-6): Identity & Organization
- Sprint 1.2 (Weeks 7-8): Reference & Activity
- Sprint 1.3 (Weeks 9-10): Calculation & Reporting
- Sprint 1.4 (Weeks 11-12): Audit & Integration

## FAQs

**Q: Why only 7 services?**
A: We're rebuilding the existing OLD carbon footprint app, not the entire ESG platform.

**Q: When do we build the other 43 services?**
A: Phases 2-6, after Phase 1 is complete. Timeline: 15+ months.

**Q: Can we add features?**
A: No. Scope is locked. Feature requests go to Future Roadmap.

---

**Document Owner**: Tech Lead
**Next Review**: Weekly during Sprint Planning
