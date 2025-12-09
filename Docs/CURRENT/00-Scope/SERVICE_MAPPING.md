# Clenergize V3 - OLD to NEW Service Mapping

> **Version**: 1.0.0
> **Last Updated**: November 25, 2024
> **Reference**: See [CURRENT_SCOPE.md](./CURRENT_SCOPE.md) for authoritative scope

---

## 1. Service Transformation Matrix

| OLD Service | OLD Port | NEW Service | NEW Port | Key Changes |
|-------------|----------|-------------|----------|-------------|
| user-management-ms | 3001 | identity-service | 3001 | JWT/JWKS verification, proper RBAC |
| project-management-ms | 3002 | organization-service | 3002 | Reference-based hierarchy (no cloning) |
| master-data-ms | 3003 | reference-service | 3003 | ESG-generic, one-time seeding |
| carbon-footprint-ms | 3005 | activity-service | 3004 | ESG-generic activity model |
| carbon-footprint-ms | 3005 | calculation-service | 3005 | Pluggable calculation engine |
| backend-ms | 3000 | reporting-service | 3006 | Framework-agnostic design |
| backend-ms | 3000 | (gateway via NGINX) | 80/443 | Pure gateway, no domain logic |
| companyDetails-ms | - | (merged into organization) | - | Eliminated redundant service |
| NEW | - | audit-service | 3007 | Compliance logging (new requirement) |

---

## 2. Database Mapping

| OLD Database | NEW Database | Migration Notes |
|--------------|--------------|-----------------|
| clenergize (shared) | clenergize_identity | User data only |
| clenergize (shared) | clenergize_organization | Companies, projects, hierarchy |
| clenergize (shared) | clenergize_reference | Emission factors, parameters |
| clenergize (shared) | clenergize_activity | Activity records |
| clenergize (shared) | clenergize_calculation | Calculation results |
| clenergize (shared) | clenergize_reporting | Reports, dashboards |
| NEW | clenergize_audit | Audit trail (new) |

**Key Change**: OLD used shared database. NEW uses database-per-service pattern.

---

## 3. Module-to-Service Mapping

### Module 1: Company Details
| OLD Implementation | NEW Implementation |
|-------------------|-------------------|
| companyDetails-ms + project-management-ms | organization-service |

### Module 2: Carbon Footprint
| OLD Implementation | NEW Implementation |
|-------------------|-------------------|
| master-data-ms (emission factors) | reference-service |
| carbon-footprint-ms (activity data) | activity-service |
| carbon-footprint-ms (calculations) | calculation-service |
| backend-ms (reports) | reporting-service |

---

## 4. Feature Mapping

### User Management
| OLD Feature | OLD Location | NEW Location |
|-------------|--------------|--------------|
| User registration | user-management-ms | identity-service |
| Login/logout | user-management-ms | identity-service |
| Password reset | user-management-ms | identity-service |
| JWT tokens | user-management-ms | identity-service (with JWKS) |
| Role management | user-management-ms | identity-service |

### Project & Hierarchy
| OLD Feature | OLD Location | NEW Location |
|-------------|--------------|--------------|
| Company CRUD | project-management-ms | organization-service |
| Project CRUD | project-management-ms | organization-service |
| Entity management | project-management-ms | organization-service |
| Subsidiary management | project-management-ms | organization-service |
| Location management | project-management-ms | organization-service |
| Hierarchy cloning | project-management-ms | REMOVED (use references) |

### Reference Data
| OLD Feature | OLD Location | NEW Location |
|-------------|--------------|--------------|
| Emission factors | master-data-ms | reference-service |
| Parameters | master-data-ms | reference-service |
| Conversions | master-data-ms | reference-service |
| QC workflow | master-data-ms | reference-service |
| Database seeding | master-data-ms (every startup) | reference-service (one-time) |

### Activity Data
| OLD Feature | OLD Location | NEW Location |
|-------------|--------------|--------------|
| Electricity data | carbon-footprint-ms | activity-service |
| Fugitive emissions | carbon-footprint-ms | activity-service |
| Mobile combustion | carbon-footprint-ms | activity-service |
| Process emissions | carbon-footprint-ms | activity-service |
| Bulk import | carbon-footprint-ms | activity-service |
| Data validation | carbon-footprint-ms | activity-service |

### Calculations
| OLD Feature | OLD Location | NEW Location |
|-------------|--------------|--------------|
| GHG calculations | carbon-footprint-ms | calculation-service |
| Scope 1/2/3 | carbon-footprint-ms | calculation-service |
| Aggregations | carbon-footprint-ms | calculation-service |
| Result caching | carbon-footprint-ms | calculation-service |

### Reporting
| OLD Feature | OLD Location | NEW Location |
|-------------|--------------|--------------|
| Dashboards | backend-ms | reporting-service |
| Reports | backend-ms | reporting-service |
| Exports | backend-ms | reporting-service |
| SQS polling | backend-ms | REMOVED (event-driven) |

---

## 5. Infrastructure Mapping

| Component | OLD | NEW |
|-----------|-----|-----|
| API Gateway | backend-ms (mixed concerns) | NGINX/Kong (pure gateway) |
| Message Queue | AWS SQS (polling) | AWS EventBridge (event-driven) |
| Cache | Redis (basic) | Redis (structured by purpose) |
| Database | MongoDB (shared) | MongoDB (per-service) |
| File Storage | S3 | S3 (unchanged) |
| Email | Brevo | Brevo (unchanged) |
| Auth Provider | AWS Cognito | AWS Cognito (unchanged) |

---

## 6. Critical Fixes by Service

### identity-service (was user-management-ms)
- [x] JWT signature verification with JWKS (was: decode only)
- [x] Remove hardcoded secret fallbacks
- [x] Add auth guards to all endpoints
- [x] Implement proper session management

### organization-service (was project-management-ms)
- [x] Reference-based hierarchy (was: data cloning)
- [x] Fix field name mismatches (yearId vs year_id)
- [x] Add MongoDB transactions
- [x] Remove denormalized data that goes stale

### reference-service (was master-data-ms)
- [x] One-time seeding (was: every startup)
- [x] Fix QC state machine (accept/reject both set isVerified=true)
- [x] Add pagination to all list endpoints
- [x] Fix N+1 query patterns

### activity-service (was carbon-footprint-ms)
- [x] ESG-generic data model
- [x] Add MongoDB transactions
- [x] Fix duplicate module files
- [x] Add proper validation framework

### calculation-service (was carbon-footprint-ms)
- [x] Pluggable calculation engine
- [x] Add cycle detection in rollups
- [x] Fix race conditions in aggregations
- [x] Implement idempotent calculations

### reporting-service (was backend-ms)
- [x] Framework-agnostic design
- [x] Remove infinite SQS polling loops
- [x] Add circuit breakers
- [x] Implement proper health checks

### audit-service (NEW)
- [x] Immutable audit trail
- [x] Compliance event logging
- [x] 7-year retention support
- [x] Data lineage tracking

---

## 7. API Path Changes

### External APIs (through Gateway)
| OLD Path | NEW Path |
|----------|----------|
| /api/users/* | /api/v1/identity/users/* |
| /api/projects/* | /api/v1/organization/projects/* |
| /api/companies/* | /api/v1/organization/companies/* |
| /api/emission-factors/* | /api/v1/reference/emission-factors/* |
| /api/activities/* | /api/v1/environmental/carbon/activities/* |
| /api/calculations/* | /api/v1/environmental/carbon/calculations/* |
| /api/reports/* | /api/v1/reporting/reports/* |

### Internal APIs (service-to-service)
| OLD Path | NEW Path |
|----------|----------|
| Direct HTTP calls | /v1/{service}/{resource} |
| No versioning | Versioned with /v1/ prefix |
| No correlation IDs | Correlation IDs required |

---

## 8. Event Mapping

### OLD Events (SQS)
- user-created
- user-deleted
- year-created
- emission-calculated

### NEW Events (EventBridge)
- identity.user.created.v1
- identity.user.deleted.v1
- reference.year.created.v1
- calculation.emission.calculated.v1
- organization.project.created.v1
- activity.data.ingested.v1
- reporting.report.generated.v1
- audit.action.logged.v1

**Pattern**: `{domain}.{aggregate}.{action}.v{version}`
