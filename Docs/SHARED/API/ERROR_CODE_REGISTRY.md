# Error Code Registry - Clenergize V3

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: ACTIVE
**Owner**: Architecture Team
**Applies To**: All Clenergize V3 Microservices

---

## Table of Contents

1. [Purpose](#purpose)
2. [Error Code Structure](#error-code-structure)
3. [Error Categories](#error-categories)
4. [Identity Service Error Codes](#identity-service-error-codes)
5. [Organization Service Error Codes](#organization-service-error-codes)
6. [Reference Service Error Codes](#reference-service-error-codes)
7. [Activity Service Error Codes](#activity-service-error-codes)
8. [Calculation Service Error Codes](#calculation-service-error-codes)
9. [Reporting Service Error Codes](#reporting-service-error-codes)
10. [Audit Service Error Codes](#audit-service-error-codes)
11. [Common Error Codes](#common-error-codes)
12. [Error Response Format](#error-response-format)
13. [Usage Guidelines](#usage-guidelines)
14. [Migration from OLD System](#migration-from-old-system)

---

## Purpose

This document provides a centralized registry of all error codes used across Clenergize V3 microservices. Standardized error codes enable:

- **Consistent Error Handling**: Predictable error responses across all services
- **Better Debugging**: Unique identifiers for each error scenario
- **Client Integration**: Programmatic error handling in frontend/API clients
- **Monitoring & Alerting**: Track error patterns and trends
- **Documentation**: Clear error messages for developers and users

### OLD System Issues (Fixed in NEW)

| Issue in OLD | Solution in NEW | Impact |
|--------------|-----------------|--------|
| Generic "Error" messages | Specific error codes | Better debugging |
| No error categorization | Category-based codes | Easier pattern recognition |
| Inconsistent HTTP status codes | Standard status mapping | RFC 7807 compliance |
| No error tracking | Unique error codes | Better monitoring |
| Mixed error formats | Unified RFC 7807 format | Consistent client handling |

---

## Error Code Structure

### Format

```
<SERVICE>_<CATEGORY>_<NUMBER>
```

**Components**:
- **SERVICE**: Three-letter service identifier (IDT, ORG, REF, ACT, CAL, REP, AUD, CMN)
- **CATEGORY**: Error category (AUTH, VAL, BIZ, INT, EXT, SEC, DATA)
- **NUMBER**: Three-digit unique identifier (001-999)

### Examples

```
IDT_AUTH_001  → Identity Service, Authentication Error #001
ORG_VAL_042   → Organization Service, Validation Error #042
CAL_BIZ_015   → Calculation Service, Business Logic Error #015
CMN_INT_500   → Common, Internal Server Error #500
```

### HTTP Status Code Mapping

| Category | HTTP Status | Usage |
|----------|-------------|-------|
| AUTH | 401 | Authentication failures |
| SEC | 403 | Authorization/security violations |
| VAL | 422 | Validation errors |
| BIZ | 400, 409 | Business logic violations |
| INT | 500, 502, 504 | Internal service errors |
| EXT | 502, 503 | External service failures |
| DATA | 404, 410 | Data not found or gone |

---

## Error Categories

### AUTH - Authentication Errors
Authentication failures, invalid credentials, expired tokens

### VAL - Validation Errors
Input validation failures, schema violations, constraint errors

### BIZ - Business Logic Errors
Business rule violations, workflow errors, state conflicts

### INT - Internal Errors
Server errors, unexpected failures, resource exhaustion

### EXT - External Service Errors
Third-party service failures, timeout errors, integration issues

### SEC - Security Errors
Authorization failures, permission denied, security violations

### DATA - Data Errors
Resource not found, data corruption, integrity violations

---

## Identity Service Error Codes

**Service Prefix**: `IDT`

### Authentication Errors (AUTH)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `IDT_AUTH_001` | 401 | Invalid credentials | Email or password incorrect | Verify credentials and retry |
| `IDT_AUTH_002` | 401 | Account locked | Account locked due to failed login attempts | Contact administrator |
| `IDT_AUTH_003` | 401 | Account suspended | Account has been suspended | Contact support |
| `IDT_AUTH_004` | 401 | Email not verified | Email verification required before login | Check email for verification link |
| `IDT_AUTH_005` | 401 | JWT token expired | Access token has expired | Refresh token or login again |
| `IDT_AUTH_006` | 401 | JWT signature invalid | Token signature verification failed | Login again |
| `IDT_AUTH_007` | 401 | JWT token malformed | Token format is invalid | Login again |
| `IDT_AUTH_008` | 401 | Refresh token expired | Refresh token has expired | Login again |
| `IDT_AUTH_009` | 401 | Refresh token invalid | Refresh token is invalid or revoked | Login again |
| `IDT_AUTH_010` | 401 | MFA required | Multi-factor authentication required | Provide MFA code |
| `IDT_AUTH_011` | 401 | MFA code invalid | MFA verification code is incorrect | Verify code and retry |
| `IDT_AUTH_012` | 401 | MFA code expired | MFA code has expired | Request new code |
| `IDT_AUTH_013` | 401 | Session expired | User session has expired | Login again |
| `IDT_AUTH_014` | 401 | Session invalid | Session ID is invalid or revoked | Login again |
| `IDT_AUTH_015` | 401 | Password reset token invalid | Password reset token is invalid or used | Request new reset link |
| `IDT_AUTH_016` | 401 | Password reset token expired | Password reset token has expired | Request new reset link |

### Validation Errors (VAL)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `IDT_VAL_001` | 422 | Email required | Email address is required | Provide email address |
| `IDT_VAL_002` | 422 | Email invalid | Email format is invalid | Provide valid email |
| `IDT_VAL_003` | 422 | Password required | Password is required | Provide password |
| `IDT_VAL_004` | 422 | Password too short | Password must be at least 12 characters | Use longer password |
| `IDT_VAL_005` | 422 | Password too weak | Password doesn't meet complexity requirements | Use stronger password (uppercase, lowercase, numbers, symbols) |
| `IDT_VAL_006` | 422 | First name required | First name is required | Provide first name |
| `IDT_VAL_007` | 422 | Last name required | Last name is required | Provide last name |
| `IDT_VAL_008` | 422 | Role invalid | Invalid role specified | Use valid role (VIEWER, CONTRIBUTOR, MANAGER, ADMIN) |
| `IDT_VAL_009` | 422 | Organization ID required | Organization ID is required | Provide organization ID |
| `IDT_VAL_010` | 422 | Organization ID invalid | Organization ID format is invalid | Provide valid UUID |

### Business Logic Errors (BIZ)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `IDT_BIZ_001` | 409 | Email already exists | User with this email already exists | Use different email or login |
| `IDT_BIZ_002` | 400 | Cannot delete own account | Users cannot delete their own account | Ask another admin to delete |
| `IDT_BIZ_003` | 400 | Cannot remove last admin | Organization must have at least one admin | Assign another admin first |
| `IDT_BIZ_004` | 400 | MFA already enabled | MFA is already enabled for this user | Disable first before re-enabling |
| `IDT_BIZ_005` | 400 | MFA not enabled | MFA is not enabled for this user | Enable MFA first |
| `IDT_BIZ_006` | 400 | Password recently used | New password was recently used | Choose different password |
| `IDT_BIZ_007` | 400 | Too many password reset attempts | Too many reset attempts in short period | Wait before retrying |
| `IDT_BIZ_008` | 409 | Role already assigned | User already has this role | No action needed |
| `IDT_BIZ_009` | 400 | Cannot revoke last role | User must have at least one role | Assign another role first |
| `IDT_BIZ_010` | 429 | Rate limit exceeded | Too many requests in time window | Wait and retry |

### Security Errors (SEC)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `IDT_SEC_001` | 403 | Insufficient permissions | User lacks required permissions | Contact administrator for access |
| `IDT_SEC_002` | 403 | Organization access denied | User not member of this organization | Request organization access |
| `IDT_SEC_003` | 403 | Admin role required | This action requires admin role | Contact administrator |
| `IDT_SEC_004` | 403 | Super admin role required | This action requires super admin role | Contact super administrator |
| `IDT_SEC_005` | 403 | Cannot modify other organization users | Can only modify users in own organization | Access users in your organization |
| `IDT_SEC_006` | 403 | IP address blocked | IP address is blocked | Contact support |
| `IDT_SEC_007` | 403 | Suspicious activity detected | Suspicious activity on account | Verify account security |

### Data Errors (DATA)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `IDT_DATA_001` | 404 | User not found | User with specified ID does not exist | Verify user ID |
| `IDT_DATA_002` | 404 | Role not found | Role with specified ID does not exist | Verify role ID |
| `IDT_DATA_003` | 404 | Session not found | Session with specified ID does not exist | Login again |
| `IDT_DATA_004` | 404 | Organization not found | Organization with specified ID does not exist | Verify organization ID |
| `IDT_DATA_005` | 410 | User deleted | User account has been deleted | Contact administrator |

---

## Organization Service Error Codes

**Service Prefix**: `ORG`

### Validation Errors (VAL)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `ORG_VAL_001` | 422 | Organization name required | Organization name is required | Provide organization name |
| `ORG_VAL_002` | 422 | Organization name too long | Name exceeds 255 characters | Use shorter name |
| `ORG_VAL_003` | 422 | Project name required | Project name is required | Provide project name |
| `ORG_VAL_004` | 422 | Project ID invalid | Project ID format is invalid | Provide valid UUID |
| `ORG_VAL_005` | 422 | Hierarchy name required | Hierarchy name is required | Provide hierarchy name |
| `ORG_VAL_006` | 422 | Node type invalid | Invalid node type specified | Use valid node type |
| `ORG_VAL_007` | 422 | Reporting year invalid | Reporting year must be between 2000-2100 | Provide valid year |
| `ORG_VAL_008` | 422 | Invalid fiscal year dates | Fiscal year end date must be after start date | Correct date range |
| `ORG_VAL_009` | 422 | Team name required | Team name is required | Provide team name |
| `ORG_VAL_010` | 422 | Permission type invalid | Invalid permission type | Use valid permission type |

### Business Logic Errors (BIZ)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `ORG_BIZ_001` | 409 | Organization already exists | Organization with this name exists | Use different name |
| `ORG_BIZ_002` | 409 | Project already exists | Project with this name exists in organization | Use different name |
| `ORG_BIZ_003` | 400 | Cannot delete organization with projects | Organization has active projects | Delete projects first |
| `ORG_BIZ_004` | 400 | Cannot delete active project | Project is currently active | Archive project first |
| `ORG_BIZ_005` | 400 | Hierarchy already assigned | Project already has a hierarchy assigned | Remove existing hierarchy first |
| `ORG_BIZ_006` | 409 | Circular hierarchy reference | Hierarchy contains circular reference | Fix hierarchy structure |
| `ORG_BIZ_007` | 400 | Reporting year locked | Reporting year is locked for editing | Unlock year first |
| `ORG_BIZ_008` | 400 | Cannot modify archived project | Project is archived | Restore project first |
| `ORG_BIZ_009` | 409 | Team member already exists | User is already a team member | No action needed |
| `ORG_BIZ_010` | 400 | Cannot remove last project admin | Project must have at least one admin | Assign another admin first |
| `ORG_BIZ_011` | 400 | Hierarchy node has children | Cannot delete node with children | Delete children first |
| `ORG_BIZ_012` | 400 | Invalid hierarchy depth | Hierarchy exceeds maximum depth (10 levels) | Flatten hierarchy structure |
| `ORG_BIZ_013` | 409 | Entity already exists | Entity with this name exists | Use different name |
| `ORG_BIZ_014` | 400 | Module not available | Module not available in current plan | Upgrade plan |
| `ORG_BIZ_015` | 400 | License limit exceeded | Organization has reached license limit | Purchase more licenses |

### Security Errors (SEC)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `ORG_SEC_001` | 403 | Project access denied | User doesn't have access to this project | Request project access |
| `ORG_SEC_002` | 403 | Hierarchy modification denied | User cannot modify hierarchy | Request hierarchy permissions |
| `ORG_SEC_003` | 403 | Organization admin required | This action requires organization admin | Contact organization admin |
| `ORG_SEC_004` | 403 | Project manager required | This action requires project manager role | Contact project manager |
| `ORG_SEC_005` | 403 | Cannot modify other organizations | Can only modify own organization | Access your organization |

### Data Errors (DATA)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `ORG_DATA_001` | 404 | Organization not found | Organization does not exist | Verify organization ID |
| `ORG_DATA_002` | 404 | Project not found | Project does not exist | Verify project ID |
| `ORG_DATA_003` | 404 | Hierarchy not found | Hierarchy does not exist | Verify hierarchy ID |
| `ORG_DATA_004` | 404 | Hierarchy node not found | Hierarchy node does not exist | Verify node ID |
| `ORG_DATA_005` | 404 | Team not found | Team does not exist | Verify team ID |
| `ORG_DATA_006` | 404 | Entity not found | Entity does not exist | Verify entity ID |
| `ORG_DATA_007` | 410 | Project deleted | Project has been deleted | Contact administrator |
| `ORG_DATA_008` | 410 | Organization deleted | Organization has been deleted | Contact support |

---

## Reference Service Error Codes

**Service Prefix**: `REF`

### Validation Errors (VAL)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `REF_VAL_001` | 422 | Emission factor name required | Emission factor name is required | Provide name |
| `REF_VAL_002` | 422 | Emission factor value invalid | Value must be positive number | Provide valid value |
| `REF_VAL_003` | 422 | Unit name required | Unit name is required | Provide unit name |
| `REF_VAL_004` | 422 | Unit symbol required | Unit symbol is required | Provide unit symbol |
| `REF_VAL_005` | 422 | Conversion factor invalid | Conversion factor must be positive | Provide valid factor |
| `REF_VAL_006` | 422 | Category name required | Category name is required | Provide category |
| `REF_VAL_007` | 422 | Database source invalid | Invalid database source | Use EPA, DEFRA, IPCC, or Custom |
| `REF_VAL_008` | 422 | Version invalid | Version format is invalid | Use semver format (e.g., 1.0.0) |
| `REF_VAL_009` | 422 | Region code invalid | Invalid ISO region code | Use valid ISO 3166-1 code |
| `REF_VAL_010` | 422 | Date range invalid | End date must be after start date | Correct date range |

### Business Logic Errors (BIZ)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `REF_BIZ_001` | 409 | Emission factor already exists | Emission factor with this name exists | Use different name or update existing |
| `REF_BIZ_002` | 409 | Unit already exists | Unit with this symbol exists | Use different symbol |
| `REF_BIZ_003` | 400 | Cannot delete emission factor in use | Emission factor is used in calculations | Remove references first |
| `REF_BIZ_004` | 400 | Cannot delete unit in use | Unit is used by emission factors | Remove references first |
| `REF_BIZ_005` | 400 | Emission factor deprecated | Emission factor is deprecated | Use alternative factor |
| `REF_BIZ_006` | 409 | Version already exists | Version already published | Increment version number |
| `REF_BIZ_007` | 400 | Cannot modify published data | Published reference data is immutable | Create new version |
| `REF_BIZ_008` | 409 | Conversion rule conflict | Conflicting conversion rule exists | Remove conflicting rule |
| `REF_BIZ_009` | 400 | Circular conversion detected | Conversion rules create circular dependency | Fix conversion chain |
| `REF_BIZ_010` | 400 | Import already in progress | Reference data import is already running | Wait for completion |

### Data Errors (DATA)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `REF_DATA_001` | 404 | Emission factor not found | Emission factor does not exist | Verify ID |
| `REF_DATA_002` | 404 | Unit not found | Unit does not exist | Verify unit ID |
| `REF_DATA_003` | 404 | Category not found | Category does not exist | Verify category ID |
| `REF_DATA_004` | 404 | Conversion rule not found | Conversion rule does not exist | Verify rule ID |
| `REF_DATA_005` | 404 | Parameter not found | Parameter does not exist | Verify parameter ID |
| `REF_DATA_006` | 410 | Emission factor deprecated | Emission factor has been deprecated | Use alternative |

---

## Activity Service Error Codes

**Service Prefix**: `ACT`

### Validation Errors (VAL)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `ACT_VAL_001` | 422 | Activity name required | Activity name is required | Provide activity name |
| `ACT_VAL_002` | 422 | Activity value invalid | Activity value must be positive number | Provide valid value |
| `ACT_VAL_003` | 422 | Activity date required | Activity date is required | Provide date |
| `ACT_VAL_004` | 422 | Activity date invalid | Date is in invalid format | Use ISO 8601 format |
| `ACT_VAL_005` | 422 | Unit required | Unit is required | Specify unit |
| `ACT_VAL_006` | 422 | Project ID required | Project ID is required | Provide project ID |
| `ACT_VAL_007` | 422 | Scope invalid | Invalid carbon scope | Use Scope 1, 2, or 3 |
| `ACT_VAL_008` | 422 | Category required | Activity category is required | Select category |
| `ACT_VAL_009` | 422 | File format unsupported | File format not supported | Use CSV, XLSX, or JSON |
| `ACT_VAL_010` | 422 | File size exceeds limit | File exceeds 50MB limit | Use smaller file |

### Business Logic Errors (BIZ)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `ACT_BIZ_001` | 400 | Activity outside reporting period | Activity date outside reporting year | Use date within reporting period |
| `ACT_BIZ_002` | 400 | Duplicate activity detected | Similar activity already exists | Review existing activities |
| `ACT_BIZ_003` | 400 | Bulk import failed | Bulk import encountered errors | Review error details |
| `ACT_BIZ_004` | 400 | Activity already verified | Activity has been verified and locked | Unverify to make changes |
| `ACT_BIZ_005` | 400 | Cannot delete verified activity | Verified activities cannot be deleted | Unverify first |
| `ACT_BIZ_006` | 400 | Import already in progress | Bulk import is already running | Wait for completion |
| `ACT_BIZ_007` | 400 | Data quality threshold not met | Activity data quality below threshold | Improve data quality |
| `ACT_BIZ_008` | 400 | Missing required attachment | Activity requires supporting documentation | Attach required files |
| `ACT_BIZ_009` | 409 | Activity locked for calculation | Activity locked during calculation | Wait for calculation completion |
| `ACT_BIZ_010` | 400 | Reporting year locked | Cannot modify data in locked year | Unlock reporting year |

### Data Errors (DATA)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `ACT_DATA_001` | 404 | Activity not found | Activity does not exist | Verify activity ID |
| `ACT_DATA_002` | 404 | Bulk import not found | Import job does not exist | Verify import ID |
| `ACT_DATA_003` | 404 | Carbon scope not found | Scope configuration does not exist | Verify scope ID |
| `ACT_DATA_004` | 404 | File attachment not found | Attachment does not exist | Verify file ID |
| `ACT_DATA_005` | 410 | Activity deleted | Activity has been deleted | Restore from backup |

---

## Calculation Service Error Codes

**Service Prefix**: `CAL`

### Validation Errors (VAL)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `CAL_VAL_001` | 422 | Calculation ID required | Calculation ID is required | Provide calculation ID |
| `CAL_VAL_002` | 422 | Activity data required | Activity data is required for calculation | Provide activity data |
| `CAL_VAL_003` | 422 | Emission factor required | Emission factor is required | Select emission factor |
| `CAL_VAL_004` | 422 | Calculation method invalid | Invalid calculation method | Use valid method |
| `CAL_VAL_005` | 422 | Allocation percentage invalid | Percentage must be 0-100 | Provide valid percentage |
| `CAL_VAL_006` | 422 | Rollup level invalid | Invalid aggregation level | Use valid level |

### Business Logic Errors (BIZ)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `CAL_BIZ_001` | 400 | Calculation already in progress | Calculation is currently running | Wait for completion |
| `CAL_BIZ_002` | 400 | Missing emission factor | No emission factor available for activity | Add emission factor mapping |
| `CAL_BIZ_003` | 400 | Unit conversion failed | Cannot convert between units | Check unit compatibility |
| `CAL_BIZ_004` | 400 | Calculation timeout | Calculation exceeded time limit | Reduce scope or contact support |
| `CAL_BIZ_005` | 400 | Allocation sum invalid | Allocation percentages don't sum to 100% | Correct allocations |
| `CAL_BIZ_006` | 409 | Calculation locked | Calculation is locked | Unlock to make changes |
| `CAL_BIZ_007` | 400 | Missing activity data | Activity has no data for calculation | Add activity data |
| `CAL_BIZ_008` | 400 | Rollup already completed | Rollup for this period already exists | Use existing rollup |
| `CAL_BIZ_009` | 400 | Cannot recalculate verified data | Verified calculations cannot be recalculated | Unverify first |
| `CAL_BIZ_010` | 500 | Calculation engine error | Calculation engine encountered error | Contact support |

### Data Errors (DATA)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `CAL_DATA_001` | 404 | Calculation not found | Calculation does not exist | Verify calculation ID |
| `CAL_DATA_002` | 404 | Rollup not found | Rollup does not exist | Verify rollup ID |
| `CAL_DATA_003` | 404 | Allocation not found | Allocation does not exist | Verify allocation ID |
| `CAL_DATA_004` | 410 | Calculation deleted | Calculation has been deleted | Recalculate |

---

## Reporting Service Error Codes

**Service Prefix**: `REP`

### Validation Errors (VAL)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `REP_VAL_001` | 422 | Report name required | Report name is required | Provide report name |
| `REP_VAL_002` | 422 | Report type invalid | Invalid report type | Use valid report type |
| `REP_VAL_003` | 422 | Date range required | Date range is required | Provide start and end dates |
| `REP_VAL_004` | 422 | Export format invalid | Invalid export format | Use PDF, XLSX, or CSV |
| `REP_VAL_005` | 422 | Schedule cron invalid | Invalid cron expression | Provide valid cron expression |
| `REP_VAL_006` | 422 | Template ID required | Report template ID is required | Select template |

### Business Logic Errors (BIZ)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `REP_BIZ_001` | 400 | Report generation in progress | Report is currently being generated | Wait for completion |
| `REP_BIZ_002` | 400 | No data for report | No data available for selected period | Select different period |
| `REP_BIZ_003` | 400 | Report generation failed | Report generation encountered error | Review error details |
| `REP_BIZ_004` | 400 | Template not applicable | Template not applicable to data | Select different template |
| `REP_BIZ_005` | 400 | Export timeout | Export exceeded time limit | Reduce data scope |
| `REP_BIZ_006` | 409 | Schedule conflict | Report schedule conflicts with existing | Use different schedule |
| `REP_BIZ_007` | 400 | Report too large | Report exceeds size limit | Reduce scope or use filters |
| `REP_BIZ_008` | 400 | Cannot delete scheduled report | Report has active schedule | Disable schedule first |

### Data Errors (DATA)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `REP_DATA_001` | 404 | Report not found | Report does not exist | Verify report ID |
| `REP_DATA_002` | 404 | Template not found | Template does not exist | Verify template ID |
| `REP_DATA_003` | 404 | Export not found | Export does not exist | Verify export ID |
| `REP_DATA_004` | 404 | Schedule not found | Schedule does not exist | Verify schedule ID |
| `REP_DATA_005` | 410 | Report expired | Report has expired | Regenerate report |

---

## Audit Service Error Codes

**Service Prefix**: `AUD`

### Validation Errors (VAL)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `AUD_VAL_001` | 422 | Event type required | Audit event type is required | Specify event type |
| `AUD_VAL_002` | 422 | User ID required | User ID is required | Provide user ID |
| `AUD_VAL_003` | 422 | Resource type required | Resource type is required | Specify resource type |
| `AUD_VAL_004` | 422 | Date range invalid | Invalid date range for query | Correct date range |
| `AUD_VAL_005` | 422 | Query too broad | Query scope too large | Add more filters |

### Business Logic Errors (BIZ)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `AUD_BIZ_001` | 400 | Audit log immutable | Audit logs cannot be modified | Logs are read-only |
| `AUD_BIZ_002` | 400 | Compliance check in progress | Compliance check is running | Wait for completion |
| `AUD_BIZ_003` | 400 | GDPR request already submitted | Data request already in progress | Wait for processing |
| `AUD_BIZ_004` | 400 | Retention period not met | Data cannot be deleted yet | Wait for retention period |
| `AUD_BIZ_005` | 500 | Hash chain broken | Audit log integrity compromised | Contact security team immediately |

### Data Errors (DATA)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `AUD_DATA_001` | 404 | Audit log not found | Audit log does not exist | Verify log ID |
| `AUD_DATA_002` | 404 | Compliance check not found | Compliance check does not exist | Verify check ID |
| `AUD_DATA_003` | 404 | GDPR request not found | Data request does not exist | Verify request ID |
| `AUD_DATA_004` | 410 | Audit log archived | Log has been archived | Access archive storage |

---

## Common Error Codes

**Service Prefix**: `CMN`

### Internal Errors (INT)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `CMN_INT_500` | 500 | Internal server error | Unexpected server error occurred | Contact support if persists |
| `CMN_INT_501` | 501 | Not implemented | Feature not yet implemented | Wait for future release |
| `CMN_INT_503` | 503 | Service unavailable | Service is temporarily unavailable | Retry after a few minutes |
| `CMN_INT_504` | 504 | Gateway timeout | Request timed out | Retry request |
| `CMN_INT_507` | 507 | Insufficient storage | Server storage full | Contact support |
| `CMN_INT_510` | 500 | Database connection error | Cannot connect to database | Contact support |
| `CMN_INT_511` | 500 | Cache connection error | Cannot connect to cache | Contact support |
| `CMN_INT_512` | 500 | Message queue error | Cannot connect to message queue | Contact support |

### External Service Errors (EXT)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `CMN_EXT_502` | 502 | Upstream service error | Dependent service failed | Retry or contact support |
| `CMN_EXT_504` | 504 | Upstream timeout | Dependent service timed out | Retry request |
| `CMN_EXT_511` | 503 | AWS service unavailable | AWS service is unavailable | Retry after a few minutes |
| `CMN_EXT_512` | 503 | Email service unavailable | Cannot send emails | Retry or contact support |
| `CMN_EXT_513` | 503 | Storage service unavailable | File storage unavailable | Retry or contact support |

### Validation Errors (VAL)

| Error Code | HTTP Status | Message | Description | User Action |
|------------|-------------|---------|-------------|-------------|
| `CMN_VAL_400` | 400 | Bad request | Request is malformed | Check request format |
| `CMN_VAL_415` | 415 | Unsupported media type | Content-Type not supported | Use application/json |
| `CMN_VAL_413` | 413 | Request too large | Request body too large | Reduce request size |
| `CMN_VAL_422` | 422 | Validation failed | Request validation failed | Review validation errors |

---

## Error Response Format

All errors follow RFC 7807 Problem Details format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    // Error identification
    code: string;                    // Error code from this registry
    type: string;                    // URI for error documentation
    title: string;                   // Human-readable summary
    status: number;                  // HTTP status code

    // Error details
    detail: string;                  // Detailed explanation
    instance: string;                // URI where error occurred

    // Metadata
    timestamp: string;               // ISO 8601 timestamp
    requestId: string;               // Correlation ID

    // Additional information (optional)
    errors?: FieldError[];           // Field-level validation errors
    metadata?: Record<string, any>;  // Extra context
    stack?: string;                  // Stack trace (dev only)
  };
}

interface FieldError {
  field: string;                     // Field name
  message: string;                   // Error message
  code: string;                      // Error code
  value?: any;                       // Invalid value
}
```

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "IDT_AUTH_001",
    "type": "https://api.clenergize.com/errors/IDT_AUTH_001",
    "title": "Invalid Credentials",
    "status": 401,
    "detail": "The email or password you provided is incorrect. Please verify your credentials and try again.",
    "instance": "/api/v1/auth/login",
    "timestamp": "2025-11-18T10:30:00.000Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "metadata": {
      "attemptNumber": 3,
      "lockoutThreshold": 5,
      "email": "user@example.com"
    }
  }
}
```

### Example Validation Error

```json
{
  "success": false,
  "error": {
    "code": "IDT_VAL_005",
    "type": "https://api.clenergize.com/errors/IDT_VAL_005",
    "title": "Password Too Weak",
    "status": 422,
    "detail": "Password doesn't meet complexity requirements. Must include uppercase, lowercase, numbers, and symbols.",
    "instance": "/api/v1/users",
    "timestamp": "2025-11-18T10:30:00.000Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "errors": [
      {
        "field": "password",
        "message": "Password must contain at least one uppercase letter",
        "code": "PASSWORD_UPPERCASE_REQUIRED",
        "value": "password123"
      },
      {
        "field": "password",
        "message": "Password must contain at least one symbol",
        "code": "PASSWORD_SYMBOL_REQUIRED",
        "value": "password123"
      }
    ]
  }
}
```

---

## Usage Guidelines

### Throwing Errors in Code

```typescript
// NestJS Exception with Error Code
import { HttpException, HttpStatus } from '@nestjs/common';

throw new HttpException(
  {
    success: false,
    error: {
      code: 'IDT_AUTH_001',
      type: 'https://api.clenergize.com/errors/IDT_AUTH_001',
      title: 'Invalid Credentials',
      status: 401,
      detail: 'The email or password provided is incorrect',
      instance: req.url,
      timestamp: new Date().toISOString(),
      requestId: req.id
    }
  },
  HttpStatus.UNAUTHORIZED
);
```

### Custom Error Classes

```typescript
// Base Error Class
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    public readonly title: string,
    message: string,
    public readonly metadata?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Service-Specific Errors
export class AuthenticationError extends AppError {
  constructor(code: string, message: string, metadata?: Record<string, any>) {
    super(code, 401, 'Authentication Failed', message, metadata);
  }
}

export class ValidationError extends AppError {
  constructor(code: string, message: string, errors?: FieldError[]) {
    super(code, 422, 'Validation Failed', message, { errors });
  }
}

// Usage
throw new AuthenticationError(
  'IDT_AUTH_001',
  'Invalid credentials provided',
  { attemptNumber: 3 }
);
```

### Error Handler Middleware

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    const errorResponse = {
      success: false,
      error: {
        code: exception.code || 'CMN_INT_500',
        type: `https://api.clenergize.com/errors/${exception.code}`,
        title: exception.title || 'Internal Server Error',
        status,
        detail: exception.message,
        instance: request.url,
        timestamp: new Date().toISOString(),
        requestId: request.id,
        ...(exception.metadata && { metadata: exception.metadata }),
        ...(process.env.NODE_ENV === 'development' && { stack: exception.stack })
      }
    };

    response.status(status).json(errorResponse);
  }
}
```

### Client-Side Error Handling

```typescript
// TypeScript Client
async function loginUser(email: string, password: string) {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    const errorCode = error.response?.data?.error?.code;

    switch (errorCode) {
      case 'IDT_AUTH_001':
        showError('Invalid email or password');
        break;
      case 'IDT_AUTH_002':
        showError('Your account has been locked. Please contact support.');
        break;
      case 'IDT_AUTH_004':
        showError('Please verify your email before logging in');
        break;
      default:
        showError('Login failed. Please try again.');
    }

    throw error;
  }
}
```

### Monitoring & Alerting

```typescript
// CloudWatch Metrics
await cloudwatch.putMetricData({
  Namespace: 'Clenergize/Errors',
  MetricData: [{
    MetricName: 'ErrorCount',
    Value: 1,
    Unit: 'Count',
    Dimensions: [
      { Name: 'ErrorCode', Value: error.code },
      { Name: 'Service', Value: 'identity-service' },
      { Name: 'Environment', Value: process.env.NODE_ENV }
    ]
  }]
});

// Alert on Critical Errors
const criticalErrors = [
  'IDT_AUTH_002',  // Account locked
  'AUD_BIZ_005',   // Hash chain broken
  'CMN_INT_500'    // Internal server error
];

if (criticalErrors.includes(error.code)) {
  await sns.publish({
    TopicArn: process.env.ALERT_TOPIC_ARN,
    Message: JSON.stringify({
      severity: 'CRITICAL',
      errorCode: error.code,
      service: 'identity-service',
      message: error.message,
      requestId: error.requestId
    })
  });
}
```

---

## Migration from OLD System

### OLD Error Patterns (Problematic)

```typescript
// ❌ OLD: Generic errors
throw new Error('Invalid user');

// ❌ OLD: String-based codes
throw { code: 'ERR_001', message: 'Something failed' };

// ❌ OLD: Inconsistent status codes
res.status(400).json({ error: 'Invalid' });

// ❌ OLD: No error codes
res.status(500).json({ success: false, message: 'Error' });
```

### NEW Error Patterns (Correct)

```typescript
// ✅ NEW: Specific error codes
throw new AuthenticationError('IDT_AUTH_001', 'Invalid credentials');

// ✅ NEW: RFC 7807 format
throw new HttpException({
  success: false,
  error: {
    code: 'IDT_VAL_005',
    title: 'Validation Failed',
    status: 422,
    detail: 'Password too weak'
  }
}, 422);

// ✅ NEW: Consistent error handling
app.useGlobalFilters(new GlobalExceptionFilter());
```

### Migration Checklist

- [ ] Replace all generic `Error` throws with specific error codes
- [ ] Update error responses to RFC 7807 format
- [ ] Add error codes to all API endpoints
- [ ] Implement global exception filter
- [ ] Add error monitoring for all services
- [ ] Update API documentation with error codes
- [ ] Update client error handling
- [ ] Add error code tests

---

## Error Code Allocation

### Current Allocation

| Service | Range | Used | Available |
|---------|-------|------|-----------|
| Identity (IDT) | 001-999 | 47 | 952 |
| Organization (ORG) | 001-999 | 38 | 961 |
| Reference (REF) | 001-999 | 26 | 973 |
| Activity (ACT) | 001-999 | 25 | 974 |
| Calculation (CAL) | 001-999 | 20 | 979 |
| Reporting (REP) | 001-999 | 19 | 980 |
| Audit (AUD) | 001-999 | 14 | 985 |
| Common (CMN) | 001-999 | 15 | 984 |

### Adding New Error Codes

1. Identify the service and category
2. Choose next available number in category
3. Update this registry
4. Add to service code
5. Update API documentation
6. Add monitoring alert if critical

---

**Document Status**: ACTIVE
**Last Review**: November 18, 2025
**Next Review**: December 18, 2025
**Owner**: Architecture Team

---

*This error code registry is the single source of truth for all Clenergize V3 error codes. All services MUST use these codes for consistent error handling.*
