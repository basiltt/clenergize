# Service Specification: Integration Service

## Service Overview

**Service Name**: Integration Service
**Port**: 3010
**Purpose**: Manages external system integrations, data synchronization, connector management, and real-time data exchange with ERP, HR, facilities management, and supply chain systems
**Domain**: Platform Infrastructure & Data Exchange
**Team Ownership**: Integration & Architecture Team
**Phase**: 2 (Months 9-12)
**Story Points**: 25
**Agent**: Integration Agent

## 1. Functional Requirements

### 1.1 Core Features

#### Integration Connector Framework
- **Plugin Architecture**: Extensible connector system
  - Dynamic connector loading and registration
  - Connector lifecycle management (install, enable, disable, uninstall)
  - Version management and upgrades
  - Dependency resolution
  - Hot-reload support for connector updates
- **Connector SDK**: Developer toolkit for custom integrations
  - TypeScript/JavaScript SDK with type definitions
  - Python SDK for ML/data science integrations
  - Connector template generator (CLI tool)
  - Testing utilities and mocks
  - Documentation generator
  - Local development environment
- **Connector Registry**: Centralized connector catalog
  - Available connectors (pre-built and custom)
  - Connector metadata (name, version, vendor, category)
  - Capability description (supported operations)
  - Configuration schema
  - Installation status and health
- **Authentication Management**: Multi-protocol support
  - OAuth 2.0 / OAuth 1.0a
  - API Key authentication
  - Basic authentication (username/password)
  - SAML 2.0 / OpenID Connect
  - Certificate-based authentication (mTLS)
  - Custom authentication handlers
- **Connection Testing**: Validate connectivity before activation
  - Credential verification
  - Endpoint reachability
  - Permission/scope validation
  - Data access testing
  - Health check endpoints

#### Pre-Built Connectors

##### ERP Systems
- **SAP ERP / S/4HANA**
  - OData API integration
  - Master data sync (cost centers, GL accounts, vendors)
  - Transaction data (procurement, invoices, expenses)
  - Organizational hierarchy
  - Financial data extraction
- **Oracle ERP Cloud / E-Business Suite**
  - REST API integration
  - Financial transactions
  - Procurement and supply chain data
  - Asset management data
  - Expense reports
- **Microsoft Dynamics 365**
  - Web API integration
  - Financial modules
  - Operations and supply chain
  - Project accounting
  - Customer and vendor data

##### HR Systems
- **Workday HCM**
  - Workday REST API / SOAP API
  - Employee demographics
  - Organizational structure
  - Compensation and benefits
  - Time tracking and attendance
  - Learning and development records
- **SAP SuccessFactors**
  - OData API integration
  - Employee central data
  - Recruitment and onboarding
  - Performance and goals
  - Training records
  - Diversity and inclusion metrics
- **ADP Workforce Now**
  - ADP API integration
  - Payroll data
  - Employee demographics
  - Time and attendance
  - Benefits administration
- **BambooHR**
  - REST API integration
  - Employee directory
  - Time-off tracking
  - Performance reviews
  - Training records

##### Facilities Management
- **IBM TRIRIGA**
  - REST API integration
  - Building and space data
  - Energy consumption
  - Occupancy tracking
  - Lease and contract management
  - Maintenance records
- **Planon Universe**
  - Web services integration
  - Real estate portfolio
  - Space management
  - Sustainability metrics
  - Work order management
  - Asset tracking

##### Supply Chain & Procurement
- **SAP Ariba**
  - Ariba Network API
  - Supplier data
  - Purchase orders
  - Invoices
  - Supplier risk scores
  - Sustainability questionnaires
- **Coupa Procurement**
  - Coupa API integration
  - Supplier master data
  - Purchase requisitions and orders
  - Spend analytics
  - Supplier diversity data
  - Contract management

##### Other Integrations
- **Microsoft 365 / SharePoint**
  - Graph API integration
  - Document synchronization
  - User directory (Azure AD)
  - Calendar and meetings
  - Team collaboration data
- **Google Workspace**
  - Google API integration
  - User management
  - Drive document sync
  - Calendar data
  - Gmail integration
- **Salesforce**
  - Salesforce REST/Bulk API
  - Customer data
  - Opportunity and revenue data
  - Case management
  - Custom objects

#### Data Synchronization Engine
- **Sync Job Scheduler**: Automated data synchronization
  - Cron-based scheduling (hourly, daily, weekly, monthly)
  - Event-driven sync triggers
  - Manual sync on-demand
  - Sync job prioritization
  - Parallel sync execution
  - Resource throttling and rate limiting
- **Incremental Sync**: Efficient delta synchronization
  - Timestamp-based incremental updates
  - Change tracking (CDC - Change Data Capture)
  - Watermark management
  - Conflict resolution strategies
  - Deduplication logic
- **Full Sync**: Complete data refresh
  - Initial data load
  - Periodic full refresh
  - Data validation and reconciliation
  - Backup before sync
  - Rollback on failure
- **Batch Processing**: High-volume data handling
  - Chunked data processing
  - Parallel batch execution
  - Progress tracking
  - Resumable sync (checkpoint/restart)
  - Memory optimization
- **Real-Time Sync**: Event-driven data push
  - Webhook-based updates
  - Message queue integration (Kafka, SQS)
  - Low-latency data propagation
  - Event deduplication
  - Guaranteed delivery (at-least-once semantics)

#### Data Transformation & Mapping
- **Schema Mapping**: Field-level data mapping
  - Visual mapping designer
  - Source-to-target field mapping
  - Data type conversion rules
  - Default value assignment
  - Conditional mapping (if-then logic)
  - Multi-source aggregation
- **Data Transformation**: ETL operations
  - String transformations (trim, uppercase, concatenate)
  - Date/time formatting and timezone conversion
  - Numeric calculations and aggregations
  - Lookup and reference data joins
  - Data validation and cleansing
  - Custom JavaScript/Python transformation scripts
- **Mapping Templates**: Reusable mapping configurations
  - Pre-built templates for common integrations
  - Template versioning
  - Template inheritance
  - Template testing and validation
  - Export/import mapping configurations
- **Data Quality Rules**: Validation and cleansing
  - Required field validation
  - Format validation (email, phone, date)
  - Range and boundary checks
  - Referential integrity validation
  - Custom validation rules
  - Data quality scoring

#### Webhook System
- **Webhook Endpoints**: Inbound data push
  - REST endpoint generation for each connector
  - Unique webhook URLs per integration
  - Support for JSON, XML, form-encoded payloads
  - Custom header support
  - IP whitelist/blacklist
- **Signature Verification**: Security validation
  - HMAC signature validation
  - API key verification
  - OAuth token validation
  - Timestamp validation (replay attack prevention)
  - Request origin verification
- **Event Processing**: Real-time event handling
  - Event parsing and normalization
  - Event deduplication
  - Event enrichment with context data
  - Event routing to target services
  - Event retry logic
- **Webhook Management**: Configuration and monitoring
  - Webhook registration and deregistration
  - Payload schema validation
  - Event filtering rules
  - Webhook health monitoring
  - Delivery confirmation
- **Retry Logic**: Guaranteed delivery
  - Exponential backoff retry strategy
  - Max retry attempts configuration
  - Dead letter queue for failed events
  - Manual retry of failed events
  - Webhook pause/resume

#### Error Handling & Resilience
- **Error Detection**: Comprehensive error tracking
  - Connection errors (timeout, unreachable)
  - Authentication failures
  - Authorization errors (insufficient permissions)
  - Data validation errors
  - API rate limit errors
  - Server errors (500-level HTTP codes)
- **Retry Strategies**: Intelligent retry mechanisms
  - Immediate retry (for transient errors)
  - Delayed retry with backoff
  - Exponential backoff (2^n seconds)
  - Jitter addition (avoid thundering herd)
  - Max retry attempts per error type
  - Circuit breaker pattern
- **Error Notifications**: Alert stakeholders
  - Email notifications for critical errors
  - Slack/Teams notifications
  - In-app notifications
  - PagerDuty integration for on-call
  - Configurable notification thresholds
- **Fallback Mechanisms**: Graceful degradation
  - Use cached data when source unavailable
  - Switch to alternate data source
  - Partial sync completion
  - Manual intervention workflow
  - Data queuing for later processing
- **Error Recovery**: Automated and manual recovery
  - Auto-resume after transient failures
  - Manual reprocessing of failed records
  - Data reconciliation tools
  - Rollback to last successful state
  - Error log export for analysis

#### Integration Monitoring & Alerting
- **Sync Status Tracking**: Real-time visibility
  - Active sync jobs dashboard
  - Sync success/failure rate
  - Data volume processed
  - Sync duration and performance
  - Historical sync trends
- **Data Quality Metrics**: Validation and accuracy
  - Record success/failure counts
  - Validation error distribution
  - Data completeness scores
  - Data freshness indicators
  - Data drift detection
- **Performance Monitoring**: System health
  - API response times
  - Throughput (records/second)
  - Error rates by connector
  - Queue depth and lag
  - Resource utilization (CPU, memory, network)
- **Alerting Rules**: Proactive notifications
  - Sync failure alerts
  - Data quality threshold alerts
  - Performance degradation alerts
  - Rate limit warnings
  - Authentication expiration alerts
- **Audit Logging**: Compliance and traceability
  - All integration activity logging
  - User actions (create, update, delete)
  - Data access logs
  - Configuration changes
  - Security events (failed auth, suspicious activity)

### 1.2 User Modules

#### Module 1: Connector Management
- **Available Connectors**: Browse and install connectors
- **My Connectors**: Manage active integrations
- **Connector Configuration**: Set up authentication and settings
- **Connection Testing**: Validate connectivity
- **Connector Logs**: View connector activity

#### Module 2: Sync Job Management
- **Sync Schedules**: Configure sync frequency
- **Manual Sync**: Trigger on-demand synchronization
- **Sync History**: View past sync executions
- **Sync Monitoring**: Track active sync jobs
- **Sync Troubleshooting**: Diagnose and fix issues

#### Module 3: Data Mapping
- **Mapping Designer**: Visual field mapping
- **Mapping Templates**: Pre-built and custom templates
- **Transformation Rules**: Data transformation logic
- **Mapping Testing**: Validate mappings with sample data
- **Mapping Versioning**: Track mapping changes

#### Module 4: Webhook Management
- **Webhook Endpoints**: View and manage webhooks
- **Webhook Events**: Monitor incoming events
- **Webhook Configuration**: Set up signature verification
- **Event History**: View processed events
- **Webhook Testing**: Send test events

#### Module 5: Integration Monitoring
- **Integration Dashboard**: Overall system health
- **Connector Health**: Per-connector status
- **Data Quality Dashboard**: Validation metrics
- **Performance Metrics**: Throughput and latency
- **Alert Configuration**: Set up notifications

#### Module 6: Custom Connector Development
- **Connector SDK**: Development toolkit
- **Connector Templates**: Starter code
- **Testing Tools**: Local testing environment
- **Documentation**: API reference and guides
- **Connector Publishing**: Submit to registry

## 2. API Endpoints

### 2.1 Connector Management

#### List Available Connectors
```http
GET /v1/connectors
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "connectors": [
      {
        "id": "connector-sap-erp",
        "name": "SAP ERP",
        "vendor": "SAP",
        "category": "ERP",
        "version": "2.1.0",
        "description": "SAP ERP / S/4HANA integration",
        "capabilities": ["data_sync", "webhook", "real_time"],
        "authTypes": ["oauth2", "api_key"],
        "status": "available",
        "documentation": "https://docs.clenergize.com/connectors/sap-erp",
        "isInstalled": false,
        "pricing": "enterprise"
      },
      {
        "id": "connector-workday-hcm",
        "name": "Workday HCM",
        "vendor": "Workday",
        "category": "HR",
        "version": "1.5.2",
        "description": "Workday Human Capital Management",
        "capabilities": ["data_sync", "webhook"],
        "authTypes": ["oauth2"],
        "status": "available",
        "documentation": "https://docs.clenergize.com/connectors/workday",
        "isInstalled": true,
        "pricing": "free"
      }
    ],
    "categories": ["ERP", "HR", "Facilities", "Supply Chain", "CRM"],
    "total": 25
  }
}
```

#### Install Connector
```http
POST /v1/connectors/{connectorId}/install
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "version": "2.1.0",
  "autoEnable": false
}

Response 201:
{
  "success": true,
  "data": {
    "installationId": "inst-123456",
    "connectorId": "connector-sap-erp",
    "version": "2.1.0",
    "status": "installed",
    "installedAt": "2025-11-20T10:30:00Z",
    "installedBy": "user-123"
  }
}
```

#### Configure Connector
```http
POST /v1/integrations
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "connectorId": "connector-sap-erp",
  "name": "SAP Production System",
  "description": "Production SAP ERP integration",
  "authentication": {
    "type": "oauth2",
    "credentials": {
      "clientId": "sap-client-id",
      "clientSecret": "encrypted-secret",
      "tokenUrl": "https://sap.company.com/oauth/token",
      "scopes": ["read:master_data", "read:transactions"]
    }
  },
  "configuration": {
    "baseUrl": "https://sap.company.com/api",
    "systemId": "PRD",
    "companyCode": "1000",
    "timezone": "America/New_York"
  },
  "enabled": false
}

Response 201:
{
  "success": true,
  "data": {
    "integrationId": "integration-sap-001",
    "connectorId": "connector-sap-erp",
    "name": "SAP Production System",
    "status": "configured",
    "enabled": false,
    "createdAt": "2025-11-20T10:35:00Z",
    "createdBy": "user-123"
  }
}
```

#### Test Connection
```http
POST /v1/integrations/{integrationId}/test
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "connectionStatus": "success",
    "tests": [
      {
        "name": "Authentication",
        "status": "passed",
        "message": "OAuth token acquired successfully"
      },
      {
        "name": "API Connectivity",
        "status": "passed",
        "message": "Connected to https://sap.company.com/api",
        "responseTime": 245
      },
      {
        "name": "Permissions",
        "status": "passed",
        "message": "All required scopes granted"
      },
      {
        "name": "Data Access",
        "status": "passed",
        "message": "Successfully retrieved test data (5 records)"
      }
    ],
    "testedAt": "2025-11-20T10:40:00Z"
  }
}
```

### 2.2 Sync Job Management

#### Create Sync Job
```http
POST /v1/sync-jobs
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "integrationId": "integration-sap-001",
  "name": "Daily Cost Center Sync",
  "description": "Sync cost centers from SAP ERP",
  "dataEntity": "cost_centers",
  "syncType": "incremental",
  "schedule": {
    "type": "cron",
    "expression": "0 2 * * *",
    "timezone": "America/New_York"
  },
  "mappingId": "mapping-sap-costcenter-001",
  "options": {
    "batchSize": 1000,
    "parallelBatches": 5,
    "retryAttempts": 3,
    "notifyOnFailure": true
  },
  "enabled": true
}

Response 201:
{
  "success": true,
  "data": {
    "syncJobId": "sync-job-001",
    "integrationId": "integration-sap-001",
    "name": "Daily Cost Center Sync",
    "status": "scheduled",
    "nextRun": "2025-11-21T02:00:00Z",
    "createdAt": "2025-11-20T10:45:00Z"
  }
}
```

#### Trigger Manual Sync
```http
POST /v1/sync-jobs/{syncJobId}/execute
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "syncType": "full", // or "incremental"
  "options": {
    "validateOnly": false,
    "dryRun": false
  }
}

Response 202:
{
  "success": true,
  "data": {
    "executionId": "exec-123456",
    "syncJobId": "sync-job-001",
    "status": "running",
    "startedAt": "2025-11-20T10:50:00Z",
    "estimatedDuration": 300
  }
}
```

#### Get Sync Execution Status
```http
GET /v1/sync-executions/{executionId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "executionId": "exec-123456",
    "syncJobId": "sync-job-001",
    "status": "completed",
    "syncType": "incremental",
    "startedAt": "2025-11-20T10:50:00Z",
    "completedAt": "2025-11-20T10:55:23Z",
    "duration": 323,
    "statistics": {
      "recordsProcessed": 1247,
      "recordsCreated": 23,
      "recordsUpdated": 1218,
      "recordsDeleted": 6,
      "recordsFailed": 0,
      "dataVolume": "2.5 MB"
    },
    "errors": [],
    "logs": [
      {
        "timestamp": "2025-11-20T10:50:05Z",
        "level": "info",
        "message": "Starting incremental sync from watermark: 2025-11-19T02:00:00Z"
      },
      {
        "timestamp": "2025-11-20T10:55:23Z",
        "level": "info",
        "message": "Sync completed successfully. Updated watermark: 2025-11-20T10:50:00Z"
      }
    ]
  }
}
```

#### List Sync History
```http
GET /v1/sync-jobs/{syncJobId}/executions?limit=20&offset=0
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "executions": [
      {
        "executionId": "exec-123456",
        "status": "completed",
        "startedAt": "2025-11-20T10:50:00Z",
        "duration": 323,
        "recordsProcessed": 1247,
        "recordsFailed": 0
      },
      {
        "executionId": "exec-123455",
        "status": "completed",
        "startedAt": "2025-11-19T02:00:00Z",
        "duration": 298,
        "recordsProcessed": 1189,
        "recordsFailed": 2
      }
    ],
    "total": 47,
    "limit": 20,
    "offset": 0
  }
}
```

### 2.3 Data Mapping

#### Create Data Mapping
```http
POST /v1/mappings
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "integrationId": "integration-sap-001",
  "name": "SAP Cost Center to Clenergize",
  "description": "Map SAP cost centers to organization hierarchy",
  "sourceEntity": "cost_centers",
  "targetEntity": "organization_units",
  "fieldMappings": [
    {
      "sourceField": "KOSTL",
      "targetField": "externalId",
      "transformation": "trim"
    },
    {
      "sourceField": "KTEXT",
      "targetField": "name",
      "transformation": "trim"
    },
    {
      "sourceField": "VERAK",
      "targetField": "responsibleUser",
      "transformation": "lookup",
      "lookupConfig": {
        "entity": "users",
        "sourceKey": "employeeId",
        "targetKey": "userId"
      }
    },
    {
      "sourceField": "BUKRS",
      "targetField": "companyCode",
      "transformation": "default",
      "defaultValue": "1000"
    }
  ],
  "filters": [
    {
      "field": "KOKRS",
      "operator": "equals",
      "value": "1000"
    }
  ],
  "validationRules": [
    {
      "field": "externalId",
      "rule": "required"
    },
    {
      "field": "name",
      "rule": "max_length",
      "value": 100
    }
  ]
}

Response 201:
{
  "success": true,
  "data": {
    "mappingId": "mapping-sap-costcenter-001",
    "integrationId": "integration-sap-001",
    "name": "SAP Cost Center to Clenergize",
    "version": 1,
    "status": "draft",
    "createdAt": "2025-11-20T11:00:00Z"
  }
}
```

#### Test Mapping
```http
POST /v1/mappings/{mappingId}/test
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "sampleData": [
    {
      "KOSTL": "  1000  ",
      "KTEXT": "Headquarters Administration",
      "VERAK": "EMP-12345",
      "BUKRS": "1000",
      "KOKRS": "1000"
    }
  ]
}

Response 200:
{
  "success": true,
  "data": {
    "transformedData": [
      {
        "externalId": "1000",
        "name": "Headquarters Administration",
        "responsibleUser": "user-123",
        "companyCode": "1000"
      }
    ],
    "validationResults": [
      {
        "recordIndex": 0,
        "isValid": true,
        "errors": []
      }
    ]
  }
}
```

### 2.4 Webhook Management

#### Create Webhook Endpoint
```http
POST /v1/webhooks
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "integrationId": "integration-workday-001",
  "name": "Workday Employee Changes",
  "description": "Receive employee update notifications from Workday",
  "eventTypes": ["employee.created", "employee.updated", "employee.terminated"],
  "security": {
    "type": "hmac_sha256",
    "secret": "webhook-secret-key"
  },
  "filters": {
    "departments": ["Engineering", "Operations", "Sustainability"]
  },
  "retryPolicy": {
    "maxAttempts": 3,
    "backoffMultiplier": 2
  },
  "enabled": true
}

Response 201:
{
  "success": true,
  "data": {
    "webhookId": "webhook-001",
    "integrationId": "integration-workday-001",
    "name": "Workday Employee Changes",
    "webhookUrl": "https://api.clenergize.com/webhooks/webhook-001/events",
    "secret": "encrypted-secret-key",
    "status": "active",
    "createdAt": "2025-11-20T11:10:00Z"
  }
}
```

#### Receive Webhook Event (External System POSTs to this endpoint)
```http
POST /webhooks/{webhookId}/events
Content-Type: application/json
X-Webhook-Signature: sha256=abc123...
X-Webhook-Timestamp: 2025-11-20T11:15:00Z

Request Body:
{
  "eventType": "employee.updated",
  "eventId": "evt-workday-123456",
  "timestamp": "2025-11-20T11:14:55Z",
  "data": {
    "employeeId": "EMP-98765",
    "firstName": "Jane",
    "lastName": "Smith",
    "department": "Sustainability",
    "jobTitle": "ESG Manager",
    "email": "jane.smith@company.com",
    "hireDate": "2020-03-15",
    "status": "active"
  }
}

Response 200:
{
  "success": true,
  "data": {
    "eventId": "evt-workday-123456",
    "received": true,
    "processedAt": "2025-11-20T11:15:01Z"
  }
}
```

#### List Webhook Events
```http
GET /v1/webhooks/{webhookId}/events?limit=50&status=processed
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "events": [
      {
        "eventId": "evt-workday-123456",
        "eventType": "employee.updated",
        "receivedAt": "2025-11-20T11:15:00Z",
        "processedAt": "2025-11-20T11:15:01Z",
        "status": "processed",
        "retryCount": 0
      },
      {
        "eventId": "evt-workday-123455",
        "eventType": "employee.created",
        "receivedAt": "2025-11-20T09:30:00Z",
        "processedAt": "2025-11-20T09:30:02Z",
        "status": "processed",
        "retryCount": 0
      }
    ],
    "total": 127,
    "limit": 50
  }
}
```

### 2.5 Monitoring & Alerting

#### Get Integration Dashboard
```http
GET /v1/integrations/dashboard
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "summary": {
      "totalIntegrations": 8,
      "activeIntegrations": 7,
      "healthyIntegrations": 6,
      "failedIntegrations": 1,
      "totalSyncJobs": 23,
      "activeSyncJobs": 18,
      "syncExecutionsToday": 45,
      "successRate": 0.978,
      "dataVolume24h": "156 MB"
    },
    "integrations": [
      {
        "integrationId": "integration-sap-001",
        "name": "SAP Production System",
        "connector": "SAP ERP",
        "status": "healthy",
        "lastSync": "2025-11-20T10:55:23Z",
        "nextSync": "2025-11-21T02:00:00Z",
        "syncJobs": 5,
        "errorCount24h": 0,
        "dataQualityScore": 0.99
      },
      {
        "integrationId": "integration-workday-001",
        "name": "Workday HCM",
        "connector": "Workday HCM",
        "status": "degraded",
        "lastSync": "2025-11-20T08:00:00Z",
        "nextSync": "2025-11-20T12:00:00Z",
        "syncJobs": 3,
        "errorCount24h": 12,
        "dataQualityScore": 0.95,
        "alerts": [
          {
            "severity": "warning",
            "message": "High validation error rate (3%)"
          }
        ]
      }
    ],
    "recentErrors": [
      {
        "integrationId": "integration-tririga-001",
        "syncJobId": "sync-job-015",
        "error": "Connection timeout",
        "timestamp": "2025-11-20T10:30:00Z",
        "severity": "error"
      }
    ]
  }
}
```

#### Get Data Quality Metrics
```http
GET /v1/integrations/{integrationId}/data-quality?period=7d
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "integrationId": "integration-sap-001",
    "period": "7d",
    "overall": {
      "dataQualityScore": 0.987,
      "recordsProcessed": 42318,
      "validRecords": 41789,
      "invalidRecords": 529,
      "validationErrorRate": 0.013
    },
    "validationErrors": [
      {
        "rule": "required_field",
        "field": "responsibleUser",
        "count": 234,
        "percentage": 0.0055
      },
      {
        "rule": "invalid_format",
        "field": "email",
        "count": 156,
        "percentage": 0.0037
      },
      {
        "rule": "max_length",
        "field": "description",
        "count": 89,
        "percentage": 0.0021
      }
    ],
    "trend": [
      {
        "date": "2025-11-20",
        "score": 0.992,
        "recordsProcessed": 6247
      },
      {
        "date": "2025-11-19",
        "score": 0.988,
        "recordsProcessed": 6189
      }
    ]
  }
}
```

#### Configure Alert Rule
```http
POST /v1/alert-rules
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "SAP Sync Failure Alert",
  "description": "Alert when SAP sync job fails",
  "integrationId": "integration-sap-001",
  "conditions": [
    {
      "metric": "sync_failure_count",
      "operator": "greater_than",
      "threshold": 0,
      "window": "5m"
    }
  ],
  "severity": "critical",
  "notifications": [
    {
      "type": "email",
      "recipients": ["esg-team@company.com"]
    },
    {
      "type": "slack",
      "channel": "#esg-alerts"
    }
  ],
  "enabled": true
}

Response 201:
{
  "success": true,
  "data": {
    "alertRuleId": "alert-rule-001",
    "name": "SAP Sync Failure Alert",
    "status": "active",
    "createdAt": "2025-11-20T11:30:00Z"
  }
}
```

## 3. Data Models

### 3.1 MongoDB Collections

#### connectors
```typescript
{
  _id: ObjectId,
  connectorId: string,              // "connector-sap-erp"
  name: string,                     // "SAP ERP"
  vendor: string,                   // "SAP"
  category: string,                 // "ERP", "HR", "Facilities", etc.
  version: string,                  // "2.1.0"
  description: string,
  capabilities: string[],           // ["data_sync", "webhook", "real_time"]
  authTypes: string[],              // ["oauth2", "api_key", "saml"]
  configurationSchema: object,      // JSON schema for connector config
  status: string,                   // "available", "deprecated", "beta"
  documentation: string,            // URL
  pricing: string,                  // "free", "enterprise"
  icon: string,                     // URL to connector icon
  createdAt: Date,
  updatedAt: Date
}
```

#### integrations
```typescript
{
  _id: ObjectId,
  integrationId: string,            // "integration-sap-001"
  organizationId: string,
  connectorId: string,              // Reference to connector
  name: string,                     // "SAP Production System"
  description: string,
  authentication: {
    type: string,                   // "oauth2", "api_key", "saml", etc.
    credentials: object,            // Encrypted credentials
    expiresAt: Date,                // Token expiration (if applicable)
    lastRefreshed: Date
  },
  configuration: object,            // Connector-specific config (baseUrl, etc.)
  status: string,                   // "configured", "active", "inactive", "error"
  health: {
    status: string,                 // "healthy", "degraded", "down"
    lastCheck: Date,
    lastSuccessfulSync: Date,
    errorCount24h: number,
    dataQualityScore: number        // 0-1
  },
  enabled: boolean,
  createdBy: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### syncJobs
```typescript
{
  _id: ObjectId,
  syncJobId: string,                // "sync-job-001"
  integrationId: string,
  organizationId: string,
  name: string,                     // "Daily Cost Center Sync"
  description: string,
  dataEntity: string,               // "cost_centers", "employees", etc.
  syncType: string,                 // "incremental", "full"
  schedule: {
    type: string,                   // "cron", "interval", "manual"
    expression: string,             // Cron expression: "0 2 * * *"
    timezone: string,               // "America/New_York"
    nextRun: Date
  },
  mappingId: string,                // Reference to data mapping
  options: {
    batchSize: number,              // Records per batch
    parallelBatches: number,        // Parallel execution
    retryAttempts: number,
    timeout: number,                // Seconds
    notifyOnSuccess: boolean,
    notifyOnFailure: boolean
  },
  watermark: {
    field: string,                  // "updated_at"
    value: any,                     // Last processed value (for incremental)
    updatedAt: Date
  },
  statistics: {
    totalExecutions: number,
    successfulExecutions: number,
    failedExecutions: number,
    lastExecutionDuration: number,  // Seconds
    avgExecutionDuration: number,
    totalRecordsProcessed: number
  },
  enabled: boolean,
  createdBy: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### syncExecutions
```typescript
{
  _id: ObjectId,
  executionId: string,              // "exec-123456"
  syncJobId: string,
  integrationId: string,
  organizationId: string,
  status: string,                   // "running", "completed", "failed", "cancelled"
  syncType: string,                 // "incremental", "full"
  startedAt: Date,
  completedAt: Date,
  duration: number,                 // Seconds
  statistics: {
    recordsProcessed: number,
    recordsCreated: number,
    recordsUpdated: number,
    recordsDeleted: number,
    recordsFailed: number,
    batchesProcessed: number,
    dataVolume: number              // Bytes
  },
  watermark: {
    before: any,                    // Watermark before sync
    after: any                      // Watermark after sync
  },
  errors: [
    {
      recordId: string,
      error: string,
      details: object,
      timestamp: Date
    }
  ],
  logs: [
    {
      timestamp: Date,
      level: string,                // "debug", "info", "warn", "error"
      message: string,
      context: object
    }
  ],
  triggeredBy: string,              // "schedule", "manual", "webhook"
  triggeredByUser: string,          // If manual
  createdAt: Date
}
```

#### mappings
```typescript
{
  _id: ObjectId,
  mappingId: string,                // "mapping-sap-costcenter-001"
  integrationId: string,
  organizationId: string,
  name: string,                     // "SAP Cost Center to Clenergize"
  description: string,
  version: number,                  // Incremented on updates
  sourceEntity: string,             // "cost_centers"
  targetEntity: string,             // "organization_units"
  fieldMappings: [
    {
      sourceField: string,          // "KOSTL"
      targetField: string,          // "externalId"
      transformation: string,       // "trim", "uppercase", "lookup", "custom"
      transformationConfig: object, // Config for transformation
      defaultValue: any,            // Default if source is null
      required: boolean
    }
  ],
  filters: [
    {
      field: string,                // "KOKRS"
      operator: string,             // "equals", "contains", "greater_than"
      value: any                    // "1000"
    }
  ],
  validationRules: [
    {
      field: string,                // "externalId"
      rule: string,                 // "required", "max_length", "format"
      value: any,                   // Rule parameter (e.g., 100 for max_length)
      errorMessage: string
    }
  ],
  status: string,                   // "draft", "active", "archived"
  createdBy: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### webhooks
```typescript
{
  _id: ObjectId,
  webhookId: string,                // "webhook-001"
  integrationId: string,
  organizationId: string,
  name: string,                     // "Workday Employee Changes"
  description: string,
  webhookUrl: string,               // "https://api.clenergize.com/webhooks/webhook-001/events"
  eventTypes: string[],             // ["employee.created", "employee.updated"]
  security: {
    type: string,                   // "hmac_sha256", "api_key", "oauth2"
    secret: string,                 // Encrypted secret
    algorithm: string,              // "sha256"
    headerName: string              // "X-Webhook-Signature"
  },
  filters: object,                  // Event filtering rules
  retryPolicy: {
    maxAttempts: number,            // 3
    backoffMultiplier: number,      // 2 (exponential backoff)
    initialDelay: number            // Seconds
  },
  statistics: {
    totalEvents: number,
    successfulEvents: number,
    failedEvents: number,
    lastEventAt: Date,
    avgProcessingTime: number       // Milliseconds
  },
  enabled: boolean,
  createdBy: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### webhookEvents
```typescript
{
  _id: ObjectId,
  eventId: string,                  // "evt-workday-123456"
  webhookId: string,
  integrationId: string,
  organizationId: string,
  eventType: string,                // "employee.updated"
  payload: object,                  // Raw webhook payload
  signature: string,                // Received signature
  signatureValid: boolean,
  receivedAt: Date,
  processedAt: Date,
  status: string,                   // "received", "processing", "processed", "failed"
  retryCount: number,
  error: {
    message: string,
    details: object,
    timestamp: Date
  },
  createdAt: Date
}
```

#### alertRules
```typescript
{
  _id: ObjectId,
  alertRuleId: string,              // "alert-rule-001"
  organizationId: string,
  integrationId: string,            // Optional: null for global rules
  name: string,                     // "SAP Sync Failure Alert"
  description: string,
  conditions: [
    {
      metric: string,               // "sync_failure_count", "data_quality_score"
      operator: string,             // "greater_than", "less_than", "equals"
      threshold: any,               // Threshold value
      window: string                // "5m", "1h", "1d"
    }
  ],
  severity: string,                 // "critical", "warning", "info"
  notifications: [
    {
      type: string,                 // "email", "slack", "pagerduty"
      recipients: string[],         // Email addresses
      channel: string,              // Slack channel
      config: object                // Notification-specific config
    }
  ],
  cooldown: number,                 // Seconds between alerts
  enabled: boolean,
  createdBy: string,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.2 Indexes

```typescript
// connectors
db.connectors.createIndex({ connectorId: 1 }, { unique: true });
db.connectors.createIndex({ category: 1, status: 1 });
db.connectors.createIndex({ vendor: 1 });

// integrations
db.integrations.createIndex({ integrationId: 1 }, { unique: true });
db.integrations.createIndex({ organizationId: 1, status: 1 });
db.integrations.createIndex({ connectorId: 1 });
db.integrations.createIndex({ "health.status": 1 });

// syncJobs
db.syncJobs.createIndex({ syncJobId: 1 }, { unique: true });
db.syncJobs.createIndex({ integrationId: 1, enabled: 1 });
db.syncJobs.createIndex({ organizationId: 1 });
db.syncJobs.createIndex({ "schedule.nextRun": 1, enabled: 1 });

// syncExecutions
db.syncExecutions.createIndex({ executionId: 1 }, { unique: true });
db.syncExecutions.createIndex({ syncJobId: 1, startedAt: -1 });
db.syncExecutions.createIndex({ integrationId: 1, status: 1 });
db.syncExecutions.createIndex({ organizationId: 1, startedAt: -1 });
db.syncExecutions.createIndex({ status: 1, startedAt: -1 });

// mappings
db.mappings.createIndex({ mappingId: 1 }, { unique: true });
db.mappings.createIndex({ integrationId: 1, status: 1 });
db.mappings.createIndex({ organizationId: 1 });

// webhooks
db.webhooks.createIndex({ webhookId: 1 }, { unique: true });
db.webhooks.createIndex({ integrationId: 1, enabled: 1 });
db.webhooks.createIndex({ organizationId: 1 });

// webhookEvents
db.webhookEvents.createIndex({ eventId: 1 }, { unique: true });
db.webhookEvents.createIndex({ webhookId: 1, receivedAt: -1 });
db.webhookEvents.createIndex({ integrationId: 1, status: 1 });
db.webhookEvents.createIndex({ status: 1, retryCount: 1 });

// alertRules
db.alertRules.createIndex({ alertRuleId: 1 }, { unique: true });
db.alertRules.createIndex({ organizationId: 1, enabled: 1 });
db.alertRules.createIndex({ integrationId: 1 });
```

## 4. Events

### 4.1 Events Published

#### integration.connected.v1
```typescript
{
  eventId: "evt-123456",
  eventType: "integration.connected.v1",
  timestamp: "2025-11-20T10:35:00Z",
  source: "integration-service",
  correlationId: "req-abc123",
  data: {
    integrationId: "integration-sap-001",
    organizationId: "org-123",
    connectorId: "connector-sap-erp",
    name: "SAP Production System",
    authentication: {
      type: "oauth2"
    },
    connectionTest: {
      status: "success",
      testedAt: "2025-11-20T10:35:00Z"
    }
  }
}
```

#### integration.disconnected.v1
```typescript
{
  eventId: "evt-123457",
  eventType: "integration.disconnected.v1",
  timestamp: "2025-11-20T14:00:00Z",
  source: "integration-service",
  correlationId: "req-abc124",
  data: {
    integrationId: "integration-sap-001",
    organizationId: "org-123",
    reason: "user_action", // or "auth_failure", "connection_error"
    disconnectedBy: "user-123"
  }
}
```

#### integration.data-synced.v1
```typescript
{
  eventId: "evt-123458",
  eventType: "integration.data-synced.v1",
  timestamp: "2025-11-20T10:55:23Z",
  source: "integration-service",
  correlationId: "exec-123456",
  data: {
    executionId: "exec-123456",
    syncJobId: "sync-job-001",
    integrationId: "integration-sap-001",
    organizationId: "org-123",
    dataEntity: "cost_centers",
    syncType: "incremental",
    statistics: {
      recordsProcessed: 1247,
      recordsCreated: 23,
      recordsUpdated: 1218,
      recordsDeleted: 6,
      recordsFailed: 0
    },
    duration: 323,
    watermark: {
      before: "2025-11-19T02:00:00Z",
      after: "2025-11-20T10:50:00Z"
    }
  }
}
```

#### integration.sync-failed.v1
```typescript
{
  eventId: "evt-123459",
  eventType: "integration.sync-failed.v1",
  timestamp: "2025-11-20T10:30:15Z",
  source: "integration-service",
  correlationId: "exec-123457",
  data: {
    executionId: "exec-123457",
    syncJobId: "sync-job-015",
    integrationId: "integration-tririga-001",
    organizationId: "org-123",
    dataEntity: "buildings",
    error: {
      code: "CONNECTION_TIMEOUT",
      message: "Connection to TRIRIGA API timed out after 30 seconds",
      retryable: true
    },
    retryCount: 2,
    nextRetry: "2025-11-20T10:32:00Z"
  }
}
```

#### integration.webhook-received.v1
```typescript
{
  eventId: "evt-123460",
  eventType: "integration.webhook-received.v1",
  timestamp: "2025-11-20T11:15:00Z",
  source: "integration-service",
  correlationId: "evt-workday-123456",
  data: {
    webhookId: "webhook-001",
    integrationId: "integration-workday-001",
    organizationId: "org-123",
    externalEventId: "evt-workday-123456",
    eventType: "employee.updated",
    payload: {
      employeeId: "EMP-98765",
      firstName: "Jane",
      lastName: "Smith",
      department: "Sustainability",
      email: "jane.smith@company.com"
    },
    signatureValid: true,
    receivedAt: "2025-11-20T11:15:00Z"
  }
}
```

#### integration.mapping-created.v1
```typescript
{
  eventId: "evt-123461",
  eventType: "integration.mapping-created.v1",
  timestamp: "2025-11-20T11:00:00Z",
  source: "integration-service",
  correlationId: "req-abc125",
  data: {
    mappingId: "mapping-sap-costcenter-001",
    integrationId: "integration-sap-001",
    organizationId: "org-123",
    name: "SAP Cost Center to Clenergize",
    sourceEntity: "cost_centers",
    targetEntity: "organization_units",
    fieldCount: 8,
    validationRuleCount: 3,
    createdBy: "user-123"
  }
}
```

#### integration.alert-triggered.v1
```typescript
{
  eventId: "evt-123462",
  eventType: "integration.alert-triggered.v1",
  timestamp: "2025-11-20T10:30:20Z",
  source: "integration-service",
  correlationId: "alert-rule-001",
  data: {
    alertRuleId: "alert-rule-001",
    alertName: "SAP Sync Failure Alert",
    organizationId: "org-123",
    integrationId: "integration-sap-001",
    severity: "critical",
    conditions: [
      {
        metric: "sync_failure_count",
        operator: "greater_than",
        threshold: 0,
        actualValue: 1
      }
    ],
    triggeredAt: "2025-11-20T10:30:20Z",
    notificationsSent: ["email", "slack"]
  }
}
```

### 4.2 Events Consumed

#### activity.data-ingestion-requested.v1
- **Trigger**: Activity service requests data ingestion
- **Action**: Trigger sync job for specified data entity
- **Response**: Publish `integration.data-synced.v1` on completion

#### organization.hierarchy-updated.v1
- **Trigger**: Organization hierarchy changes
- **Action**: Update mapping configurations for affected integrations
- **Response**: Log mapping adjustments

#### identity.user-created.v1
- **Trigger**: New user created
- **Action**: Grant access to integrations based on role
- **Response**: Update integration permissions

#### identity.authentication-failed.v1
- **Trigger**: Authentication failure detected
- **Action**: Check if integration authentication needs refresh
- **Response**: Trigger token refresh if applicable

## 5. Service Dependencies

### 5.1 Upstream Dependencies

#### Identity Service (Port 3001)
- **Purpose**: Authentication and authorization
- **Usage**:
  - Validate user permissions for integration management
  - Service-to-service authentication for API calls
  - OAuth token management for user-initiated integrations

#### Organization Service (Port 3002)
- **Purpose**: Organization context
- **Usage**:
  - Validate organization existence before integration creation
  - Map external organization structures to internal hierarchy
  - Multi-tenant isolation

#### Reference Service (Port 3003)
- **Purpose**: Master data lookups
- **Usage**:
  - Lookup emission factors during data transformation
  - Validate reference data (currencies, units, locations)
  - Map external codes to internal reference IDs

#### Activity Service (Port 3004)
- **Purpose**: Data ingestion
- **Usage**:
  - Send synchronized data to activity service for processing
  - Validate activity data schema before ingestion
  - Trigger activity calculations after data sync

#### Audit Service (Port 3007)
- **Purpose**: Audit logging
- **Usage**:
  - Log all integration configuration changes
  - Log data sync activities
  - Log webhook events
  - Log authentication failures

### 5.2 Downstream Consumers

#### Activity Service (Port 3004)
- **Consumes**: `integration.data-synced.v1`
- **Purpose**: Ingest synchronized data

#### Reporting Service (Port 3006)
- **Consumes**: `integration.sync-failed.v1`, `integration.alert-triggered.v1`
- **Purpose**: Include integration health in system reports

#### Notification Service (Port 3008)
- **Consumes**: `integration.sync-failed.v1`, `integration.alert-triggered.v1`
- **Purpose**: Send notifications to users

#### Audit Service (Port 3007)
- **Consumes**: All integration events
- **Purpose**: Comprehensive audit trail

### 5.3 External Integrations

#### AWS Secrets Manager
- **Purpose**: Store encrypted connector credentials
- **Usage**: OAuth tokens, API keys, certificates

#### AWS SQS / Kafka
- **Purpose**: Message queue for async data processing
- **Usage**: Queue sync jobs, webhook events

#### AWS S3
- **Purpose**: Store large data files
- **Usage**: Export sync execution logs, data quality reports

#### External Systems (via Connectors)
- SAP ERP / S/4HANA
- Oracle ERP Cloud
- Microsoft Dynamics 365
- Workday HCM
- SAP SuccessFactors
- ADP Workforce Now
- BambooHR
- IBM TRIRIGA
- Planon Universe
- SAP Ariba
- Coupa Procurement

## 6. Non-Functional Requirements

### 6.1 Performance Targets

#### API Response Times
- **GET /v1/connectors**: < 200ms (p95)
- **POST /v1/integrations**: < 500ms (p95)
- **POST /v1/sync-jobs/{id}/execute**: < 100ms (async trigger, p95)
- **GET /v1/sync-executions/{id}**: < 150ms (p95)
- **POST /webhooks/{id}/events**: < 50ms (p95, critical for external systems)

#### Sync Performance
- **Batch Processing**: ≥ 1,000 records/second
- **Webhook Processing**: ≥ 100 events/second
- **Concurrent Sync Jobs**: Support 50+ simultaneous jobs
- **Large File Processing**: Handle files up to 1 GB

#### Database Performance
- **Query Response**: < 100ms for 95% of queries
- **Index Coverage**: 100% for common query patterns
- **Connection Pool**: 20-50 connections per service instance

### 6.2 Scalability Requirements

#### Horizontal Scaling
- **Service Instances**: Auto-scale 2-10 instances based on load
- **Trigger**: CPU > 70% or queue depth > 1000 jobs
- **Stateless Design**: All state in database, no in-memory session data

#### Data Volume
- **Integrations**: Support 100+ active integrations per organization
- **Sync Jobs**: Support 1,000+ scheduled sync jobs
- **Webhook Events**: Process 10,000+ events/hour
- **Sync History**: Retain 90 days of execution logs

#### Concurrent Users
- **API Users**: Support 500+ concurrent API users
- **Webhook Sources**: Handle 100+ simultaneous webhook sources

### 6.3 Availability & Reliability

#### Uptime
- **Target SLA**: 99.9% uptime (< 43 minutes downtime/month)
- **Scheduled Maintenance**: < 2 hours/month during off-peak hours
- **Disaster Recovery**: RTO < 4 hours, RPO < 1 hour

#### Data Durability
- **Database Backups**: Daily full backups, hourly incremental
- **Backup Retention**: 30 days
- **Cross-Region Replication**: Replicate to secondary region

#### Fault Tolerance
- **Retry Logic**: Automatic retry for transient failures (3 attempts with exponential backoff)
- **Circuit Breaker**: Prevent cascading failures
- **Dead Letter Queue**: Capture unprocessable messages for manual review
- **Graceful Degradation**: Continue operating with limited functionality if upstream dependencies fail

### 6.4 Security Requirements

#### Authentication
- **Service-to-Service**: mTLS or JWT-based authentication
- **User Authentication**: OAuth 2.0 via Identity Service
- **External Systems**: Support OAuth 2.0, API keys, SAML, certificates

#### Authorization
- **RBAC**: Role-based access control for integration management
- **Permissions**: `integration:read`, `integration:write`, `integration:admin`
- **Multi-Tenancy**: Strict organization-level isolation

#### Data Protection
- **Credentials**: Encrypt all credentials at rest (AES-256) and in transit (TLS 1.3)
- **Secrets Management**: Store credentials in AWS Secrets Manager
- **PII Data**: Encrypt sensitive fields (emails, employee IDs)
- **Data Masking**: Mask credentials in logs and UI

#### Webhook Security
- **Signature Verification**: HMAC SHA-256 signature validation
- **Timestamp Validation**: Reject events older than 5 minutes (prevent replay attacks)
- **IP Whitelisting**: Optional IP-based access control
- **Rate Limiting**: 1000 requests/minute per webhook

#### Audit Logging
- **All Actions**: Log integration creation, updates, deletions
- **Data Access**: Log all sync job executions
- **Authentication**: Log all auth failures and token refreshes
- **Retention**: 1 year audit log retention

### 6.5 Compliance Requirements

#### Data Residency
- **Compliance**: Support data residency requirements (GDPR, data localization laws)
- **Regional Deployment**: Deploy in customer-specified AWS regions

#### Standards Compliance
- **SOC 2**: Type II compliance for security and availability
- **ISO 27001**: Information security management
- **GDPR**: Data protection and privacy

#### Data Retention
- **Sync Executions**: Retain 90 days by default, configurable
- **Webhook Events**: Retain 30 days by default, configurable
- **Audit Logs**: Retain 1 year minimum

## 7. Testing Strategy

### 7.1 Unit Tests

#### Coverage Target
- **Minimum**: 90% code coverage
- **Focus Areas**:
  - Connector lifecycle management
  - Data mapping and transformation logic
  - Webhook signature verification
  - Retry logic and circuit breakers
  - Error handling

#### Key Test Scenarios
```typescript
describe('ConnectorService', () => {
  describe('installConnector', () => {
    it('should install connector successfully', async () => {
      // Test successful installation
    });

    it('should prevent duplicate connector installation', async () => {
      // Test duplicate prevention
    });

    it('should validate connector version compatibility', async () => {
      // Test version validation
    });
  });

  describe('testConnection', () => {
    it('should validate OAuth 2.0 authentication', async () => {
      // Test OAuth flow
    });

    it('should handle authentication failures gracefully', async () => {
      // Test auth failure handling
    });

    it('should test API connectivity', async () => {
      // Test endpoint reachability
    });
  });
});

describe('SyncJobService', () => {
  describe('executeSyncJob', () => {
    it('should execute incremental sync successfully', async () => {
      // Test incremental sync
    });

    it('should update watermark after successful sync', async () => {
      // Test watermark update
    });

    it('should handle sync failures with retry', async () => {
      // Test retry logic
    });

    it('should process data in batches', async () => {
      // Test batch processing
    });
  });
});

describe('MappingService', () => {
  describe('applyMapping', () => {
    it('should transform data according to field mappings', async () => {
      // Test field transformations
    });

    it('should apply validation rules', async () => {
      // Test validation
    });

    it('should handle lookup transformations', async () => {
      // Test lookup logic
    });

    it('should use default values for null fields', async () => {
      // Test default values
    });
  });
});

describe('WebhookService', () => {
  describe('verifySignature', () => {
    it('should verify HMAC SHA-256 signature', async () => {
      // Test signature verification
    });

    it('should reject invalid signatures', async () => {
      // Test invalid signature
    });

    it('should reject expired timestamps', async () => {
      // Test timestamp validation
    });
  });

  describe('processWebhookEvent', () => {
    it('should process valid webhook event', async () => {
      // Test event processing
    });

    it('should retry failed events with exponential backoff', async () => {
      // Test retry logic
    });

    it('should send events to dead letter queue after max retries', async () => {
      // Test DLQ
    });
  });
});
```

### 7.2 Integration Tests

#### Coverage Target
- **Minimum**: 80% of API endpoints
- **Focus Areas**:
  - End-to-end connector workflows
  - Sync job execution
  - Webhook event processing
  - External API mocking

#### Key Test Scenarios
```typescript
describe('Integration API', () => {
  describe('Connector Lifecycle', () => {
    it('should install, configure, and enable connector', async () => {
      // 1. Install connector
      // 2. Configure authentication
      // 3. Test connection
      // 4. Enable connector
      // 5. Verify status
    });

    it('should disable and uninstall connector', async () => {
      // Test full deactivation
    });
  });

  describe('Sync Job Execution', () => {
    it('should execute full sync job end-to-end', async () => {
      // 1. Mock external API
      // 2. Trigger sync job
      // 3. Wait for completion
      // 4. Verify data transformation
      // 5. Check published events
    });

    it('should handle sync failures and retry', async () => {
      // Test failure scenarios
    });
  });

  describe('Webhook Processing', () => {
    it('should receive and process webhook event', async () => {
      // 1. Send webhook event
      // 2. Verify signature validation
      // 3. Check event processing
      // 4. Verify downstream event publishing
    });
  });

  describe('Database Operations', () => {
    it('should create integration with encrypted credentials', async () => {
      // Test credential encryption
    });

    it('should update sync job watermark atomically', async () => {
      // Test atomic updates
    });

    it('should query sync history with pagination', async () => {
      // Test pagination
    });
  });
});
```

### 7.3 Contract Tests

#### Pact Consumer Tests
```typescript
// Integration Service as Consumer (calls Activity Service)
describe('Integration -> Activity Service', () => {
  const provider = pactWith({ consumer: 'IntegrationService', provider: 'ActivityService' });

  provider.addInteraction({
    state: 'organization exists',
    uponReceiving: 'a request to ingest activity data',
    withRequest: {
      method: 'POST',
      path: '/v1/activities/ingest',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
      body: {
        organizationId: 'org-123',
        dataSource: 'SAP ERP',
        activities: [{ type: 'electricity', amount: 1000, unit: 'kWh' }]
      }
    },
    willRespondWith: {
      status: 201,
      body: {
        success: true,
        data: { ingestId: 'ingest-123', recordsProcessed: 1 }
      }
    }
  });

  it('ingests activity data', async () => {
    const result = await integrationService.ingestActivityData({
      organizationId: 'org-123',
      dataSource: 'SAP ERP',
      activities: [{ type: 'electricity', amount: 1000, unit: 'kWh' }]
    });
    expect(result.ingestId).toBeDefined();
  });
});
```

#### Pact Provider Tests
```typescript
// Integration Service as Provider (provides webhook endpoints to external systems)
describe('External Systems -> Integration Service', () => {
  it('verifies webhook endpoint contract', async () => {
    // Verify that Integration Service webhook endpoints satisfy external system expectations
    await pact.verifyProvider({
      provider: 'IntegrationService',
      providerBaseUrl: 'http://localhost:3010',
      pactUrls: ['./pacts/workday-integrationservice.json']
    });
  });
});
```

### 7.4 End-to-End Tests

#### Critical User Flows
```typescript
describe('E2E: SAP ERP Integration', () => {
  it('should complete full SAP integration setup and sync', async () => {
    // 1. Login as admin
    // 2. Navigate to Integrations page
    // 3. Browse available connectors
    // 4. Install SAP ERP connector
    // 5. Configure OAuth credentials
    // 6. Test connection (success)
    // 7. Create data mapping for cost centers
    // 8. Test mapping with sample data
    // 9. Create scheduled sync job (daily at 2 AM)
    // 10. Trigger manual sync
    // 11. Monitor sync progress
    // 12. Verify sync completion
    // 13. Check data quality metrics
    // 14. Verify Activity Service received data
  });

  it('should handle sync failure and retry', async () => {
    // 1. Configure integration with invalid credentials
    // 2. Trigger sync job
    // 3. Verify failure notification
    // 4. Update credentials
    // 5. Retry sync
    // 6. Verify success
  });
});

describe('E2E: Workday Webhook', () => {
  it('should receive and process employee update webhook', async () => {
    // 1. Configure Workday integration
    // 2. Create webhook endpoint
    // 3. Simulate Workday sending webhook event
    // 4. Verify signature validation
    // 5. Check event processing
    // 6. Verify employee data updated in system
    // 7. Verify downstream services notified
  });
});
```

### 7.5 Performance Tests

#### Load Testing (using k6)
```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  // Test sync job execution
  let payload = JSON.stringify({
    syncType: 'incremental',
    options: { validateOnly: false }
  });

  let params = {
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
  };

  let res = http.post('http://localhost:3010/v1/sync-jobs/sync-job-001/execute', payload, params);

  check(res, {
    'status is 202': (r) => r.status === 202,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

#### Stress Testing
```javascript
// Test webhook processing under high load
export let options = {
  stages: [
    { duration: '1m', target: 500 },  // Ramp to 500 events/sec
    { duration: '3m', target: 1000 }, // Ramp to 1000 events/sec
    { duration: '1m', target: 0 },    // Ramp down
  ],
};

export default function () {
  let payload = JSON.stringify({
    eventType: 'employee.updated',
    eventId: `evt-${__VU}-${__ITER}`,
    timestamp: new Date().toISOString(),
    data: { employeeId: 'EMP-123', firstName: 'Test', lastName: 'User' }
  });

  let signature = generateHmacSignature(payload, 'webhook-secret');

  let params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Timestamp': new Date().toISOString()
    },
  };

  http.post('http://localhost:3010/webhooks/webhook-001/events', payload, params);
}
```

## 8. Implementation Phases

### 8.1 Phase 1: MVP (Months 9-10)

#### Sprint 1 (2 weeks)
- **Connector Framework**
  - Connector registry and lifecycle management
  - Plugin architecture for dynamic loading
  - Connector SDK (basic TypeScript SDK)
  - Authentication management (OAuth 2.0, API key)
- **Database Setup**
  - MongoDB collections for connectors, integrations
  - Indexes for performance
- **API Endpoints**
  - Connector management APIs (list, install, configure)
  - Connection testing

#### Sprint 2 (2 weeks)
- **Pre-Built Connectors (MVP)**
  - SAP ERP connector (basic data sync)
  - Workday HCM connector (employee data)
  - Microsoft Dynamics connector (financial data)
- **Connector Testing**
  - Unit tests for each connector
  - Integration tests with mock APIs
- **Documentation**
  - Connector user guides
  - API documentation

#### Sprint 3 (2 weeks)
- **Sync Job Engine**
  - Sync job scheduler (cron-based)
  - Incremental sync (timestamp-based)
  - Full sync
  - Batch processing
  - Watermark management
- **Database**
  - syncJobs, syncExecutions collections
- **API Endpoints**
  - Sync job CRUD
  - Manual sync trigger
  - Sync status monitoring

#### Sprint 4 (2 weeks)
- **Data Mapping**
  - Visual mapping designer (basic UI)
  - Field-level mapping
  - Data type transformations (trim, uppercase, etc.)
  - Validation rules
- **Database**
  - mappings collection
- **API Endpoints**
  - Mapping CRUD
  - Mapping testing with sample data

### 8.2 Phase 2: Enhancements (Month 11)

#### Sprint 5 (2 weeks)
- **Webhook System**
  - Webhook endpoint generation
  - HMAC signature verification
  - Event processing
  - Retry logic with exponential backoff
- **Database**
  - webhooks, webhookEvents collections
- **API Endpoints**
  - Webhook management
  - Webhook event history

#### Sprint 6 (2 weeks)
- **Advanced Transformations**
  - Lookup transformations (reference data joins)
  - Custom JavaScript transformation scripts
  - Multi-source aggregation
  - Data quality rules
- **Pre-Built Connectors (Extended)**
  - IBM TRIRIGA (facilities data)
  - SAP Ariba (supplier data)
  - BambooHR (HR data)

### 8.3 Phase 3: Advanced Features (Month 12)

#### Sprint 7 (2 weeks)
- **Monitoring & Alerting**
  - Integration dashboard
  - Data quality metrics
  - Performance metrics
  - Alert rules and notifications
- **Database**
  - alertRules collection
- **API Endpoints**
  - Dashboard APIs
  - Alert rule management

#### Sprint 8 (2 weeks)
- **Error Handling & Resilience**
  - Circuit breaker pattern
  - Dead letter queue
  - Manual error recovery
  - Data reconciliation tools
- **Connector SDK (Advanced)**
  - Python SDK
  - Connector template generator (CLI)
  - Testing utilities
  - Documentation generator

### 8.4 Future Roadmap (Post-MVP)

#### Quarter 1 (Months 13-15)
- **AI-Powered Mapping**
  - Auto-suggest field mappings using ML
  - Data pattern recognition
  - Anomaly detection in sync data
- **Advanced Connectors**
  - Oracle ERP Cloud
  - Coupa Procurement
  - Planon Universe
  - Google Workspace
  - Salesforce
- **Real-Time Sync**
  - Event-driven sync with Kafka
  - Low-latency data propagation
  - Change Data Capture (CDC)

#### Quarter 2 (Months 16-18)
- **Connector Marketplace**
  - Public connector registry
  - Community-contributed connectors
  - Connector ratings and reviews
  - Paid connector support
- **Advanced Security**
  - Certificate-based authentication (mTLS)
  - SAML 2.0 / OpenID Connect
  - IP whitelisting for webhooks
  - Audit log export

#### Quarter 3 (Months 19-21)
- **Data Quality Enhancements**
  - ML-based data quality scoring
  - Data profiling and lineage
  - Data drift detection
  - Automated data cleansing
- **Governance**
  - Data access controls (field-level)
  - Connector usage policies
  - Data retention policies
  - Compliance reporting

## 9. Migration Strategy

### 9.1 Data Migration

#### Legacy Integration Points
- **Current State**: Manual data imports via CSV/Excel
- **Target State**: Automated integrations with external systems

#### Migration Approach
1. **Phase 1**: Parallel operation (6 months)
   - Deploy Integration Service alongside manual processes
   - Configure integrations for non-critical data entities
   - Validate data accuracy (95% accuracy target)
   - Train users on new integration workflows
2. **Phase 2**: Gradual migration (3 months)
   - Migrate critical data entities (cost centers, employees, buildings)
   - Decommission manual import processes
   - Monitor data quality and sync performance
3. **Phase 3**: Full cutover (1 month)
   - Disable manual import features
   - 100% automated data synchronization
   - Rollback plan: Re-enable manual imports if critical issues

#### Data Validation
- **Pre-Migration**: Baseline data quality assessment
- **During Migration**: Side-by-side comparison (manual vs automated)
- **Post-Migration**: Continuous data quality monitoring

#### Rollback Procedures
- **Trigger**: Data accuracy < 90% or sync failures > 10%
- **Action**:
  1. Pause all sync jobs
  2. Re-enable manual import workflows
  3. Investigate and fix integration issues
  4. Re-validate before re-enabling

### 9.2 Legacy System Integration

#### Manual CSV Imports
- **Current Process**: Users upload CSV files via UI
- **Migration**: Configure connectors to pull data from source systems
- **Benefit**: Eliminate manual effort, reduce errors

#### Existing API Integrations
- **Current State**: Some services have hardcoded API calls to SAP, Workday
- **Migration**: Replace hardcoded calls with Integration Service connectors
- **Benefit**: Centralized integration management, better error handling

## 10. Monitoring & Observability

### 10.1 Key Metrics

#### Business Metrics
- **Active Integrations**: Number of enabled integrations
- **Sync Success Rate**: Percentage of successful sync executions (target: > 98%)
- **Data Volume**: Total data synchronized per day (MB/day)
- **Data Quality Score**: Average validation pass rate (target: > 95%)
- **Webhook Delivery Rate**: Percentage of successfully delivered webhooks (target: > 99%)

#### Technical Metrics
- **API Response Time**: p50, p95, p99 for all endpoints
- **Sync Job Duration**: Average and max sync execution time
- **Queue Depth**: Number of pending sync jobs
- **Error Rate**: Percentage of failed API requests (target: < 1%)
- **Retry Rate**: Percentage of operations requiring retry

#### Resource Metrics
- **CPU Utilization**: Per service instance (target: 50-70% average)
- **Memory Usage**: Heap usage and GC frequency
- **Database Connections**: Active connection pool usage
- **Network I/O**: Bandwidth usage for external API calls

### 10.2 Alerts

#### Critical Alerts (PagerDuty)
- **Integration Down**: No successful sync in 24 hours
- **Authentication Failure**: Connector auth fails (token expired, invalid credentials)
- **Data Loss Risk**: Sync job fails 3+ consecutive times
- **Webhook Failures**: > 5% webhook delivery failures in 1 hour

#### Warning Alerts (Slack/Email)
- **Data Quality Degradation**: Quality score < 90%
- **Sync Performance**: Sync duration > 2x average
- **High Error Rate**: Error rate > 5% for 15 minutes
- **Token Expiration**: OAuth token expires in < 7 days

#### Info Alerts (Email)
- **New Integration**: Integration created/enabled
- **Connector Upgrade**: Connector version updated
- **Sync Schedule Change**: Sync job schedule modified

### 10.3 Dashboards

#### Integration Health Dashboard
- **Widgets**:
  - Overall sync success rate (gauge)
  - Active integrations (count)
  - Recent sync executions (timeline)
  - Top errors (bar chart)
  - Data quality trend (line chart)

#### Connector Performance Dashboard
- **Widgets**:
  - Sync duration by connector (bar chart)
  - Data volume by connector (pie chart)
  - Error rate by connector (table)
  - Webhook event throughput (line chart)

#### Operational Dashboard
- **Widgets**:
  - API response times (line chart)
  - Queue depth (gauge)
  - Resource utilization (CPU, memory)
  - Active sync jobs (list)

### 10.4 SLOs (Service Level Objectives)

#### Availability SLO
- **Objective**: 99.9% uptime per month
- **Measurement**: Successful health check responses / Total health checks
- **Error Budget**: 43 minutes downtime per month

#### Latency SLO
- **Objective**: 95% of API requests < 500ms
- **Measurement**: p95 response time across all endpoints
- **Error Budget**: 5% of requests may exceed 500ms

#### Data Accuracy SLO
- **Objective**: 98% sync success rate
- **Measurement**: Successful sync executions / Total sync executions
- **Error Budget**: 2% of syncs may fail

#### Webhook Delivery SLO
- **Objective**: 99% of webhooks delivered within 1 minute
- **Measurement**: Webhooks processed within SLA / Total webhooks
- **Error Budget**: 1% of webhooks may be delayed or lost

### 10.5 Logging

#### Structured Logging Format
```json
{
  "timestamp": "2025-11-20T10:50:00Z",
  "level": "info",
  "service": "integration-service",
  "correlationId": "req-abc123",
  "userId": "user-123",
  "organizationId": "org-123",
  "component": "SyncJobService",
  "action": "executeSyncJob",
  "syncJobId": "sync-job-001",
  "integrationId": "integration-sap-001",
  "message": "Sync job started",
  "metadata": {
    "syncType": "incremental",
    "dataEntity": "cost_centers",
    "batchSize": 1000
  }
}
```

#### Log Retention
- **Application Logs**: 30 days in CloudWatch
- **Audit Logs**: 1 year in S3 (encrypted)
- **Sync Execution Logs**: 90 days in MongoDB
- **Webhook Event Logs**: 30 days in MongoDB

#### Log Levels
- **DEBUG**: Detailed execution flow (disabled in production)
- **INFO**: Sync job start/completion, webhook events
- **WARN**: Retries, validation failures, performance degradation
- **ERROR**: Sync failures, authentication errors, API errors
- **FATAL**: Service crash, unrecoverable errors

## 11. Related Documentation

### 11.1 Architecture Documents
- [ESG Platform Overview](../ESG_PLATFORM_OVERVIEW.md)
- [Phase 2 Strategic ESG Overview](../Phase2_Overview.md)
- [Service Dependency Diagram](../../SERVICE_DEPENDENCY_DIAGRAM.md)
- [Event Schema Registry](../../ESG_EVENT_SCHEMA_REGISTRY.md)

### 11.2 API Specifications
- [Integration Service API Reference](../api-specs/Integration_Service_API.md)
- [Connector SDK Documentation](../connector-sdk/README.md)
- [Webhook Security Guide](../guides/Webhook_Security.md)

### 11.3 Data Models
- [Phase 2 Data Models](../data-models/PHASE2_DATA_MODELS.md)
- [Integration Service Database Schema](../data-models/Integration_Service_Schema.md)

### 11.4 Testing Guides
- [SDLC Quality Strategy](../../PHASE5_SDLC_Quality_Strategy.md)
- [Contract Testing with Pact](../../testing/Contract_Testing_Guide.md)
- [Performance Testing Guide](../../testing/Performance_Testing_Guide.md)

### 11.5 Deployment Guides
- [Local Development Setup](../../LOCAL_DEV_ENVIRONMENT_Updates.md)
- [Docker Compose Configuration](../../docker/Integration_Service_Compose.md)
- [Kubernetes Deployment](../../k8s/Integration_Service_Deployment.md)

### 11.6 Security Documents
- [Authentication & Authorization](../../security/Authentication_Guide.md)
- [Secrets Management](../../security/Secrets_Management.md)
- [Webhook Security Best Practices](../../security/Webhook_Security.md)

### 11.7 Connector Documentation
- [SAP ERP Connector Guide](../connectors/SAP_ERP_Connector.md)
- [Workday HCM Connector Guide](../connectors/Workday_Connector.md)
- [Custom Connector Development Guide](../connector-sdk/Development_Guide.md)

### 11.8 Runbooks
- [Integration Failure Troubleshooting](../runbooks/Integration_Failure.md)
- [Connector Authentication Refresh](../runbooks/Auth_Refresh.md)
- [Data Quality Issue Resolution](../runbooks/Data_Quality.md)
- [Webhook Debugging](../runbooks/Webhook_Debug.md)

---

## Document Metadata

**Version**: 1.0.0
**Last Updated**: November 20, 2025
**Author**: Integration Agent
**Reviewed By**: Architecture Agent, Master Coordinator
**Status**: Draft
**Next Review**: December 1, 2025

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-20 | Integration Agent | Initial comprehensive specification |

---

**End of Document**
