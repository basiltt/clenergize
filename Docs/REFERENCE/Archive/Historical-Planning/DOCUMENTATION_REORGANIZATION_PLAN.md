# Clenergize V3 Documentation Reorganization Plan

> **Version**: 1.0.0
> **Date**: November 22, 2025
> **Total Files**: 130 markdown files
> **Objective**: Reorganize documentation following industry-standard best practices from Microsoft, AWS, Google Cloud, and Stripe

## Executive Summary

This plan reorganizes 130+ documentation files into a clear, navigable structure that separates current development (Phase 1: Carbon Footprint) from future roadmap (Phases 2-6: Full ESG Platform). The new structure follows industry best practices with numbered folders for ordering, descriptive naming conventions, and comprehensive navigation.

## New Folder Structure

```
Docs/
├── README.md                                  # Master navigation and documentation index
├── 00-Getting-Started/                        # Entry point for new developers
│   ├── README.md                             # Quick navigation guide
│   ├── 01_Platform_Overview.md              # High-level system overview
│   ├── 02_Quick_Start_Guide.md              # Setup and run in 5 minutes
│   ├── 03_Architecture_Summary.md           # Key architectural decisions
│   ├── 04_Development_Environment.md        # Local setup guide
│   └── 05_Project_Structure.md              # Codebase organization
│
├── 01-Current-Scope-Phase1/                  # ACTIVE DEVELOPMENT (Months 1-8)
│   ├── README.md                            # Phase 1 navigation
│   ├── 01-Overview/
│   │   ├── 01_Phase1_Scope.md              # Carbon footprint platform scope
│   │   ├── 02_Sprint_Planning.md           # Sprint 0.1-1.5 schedule
│   │   └── 03_Delivery_Timeline.md         # Milestones and deliverables
│   │
│   ├── 02-Service-Specifications/           # Core services for Phase 1
│   │   ├── README.md                        # Service catalog
│   │   ├── 01_Identity_Service.md          # Authentication & authorization
│   │   ├── 02_Organization_Service.md      # Company & project management
│   │   ├── 03_Reference_Service.md         # Master data & emission factors
│   │   ├── 04_Activity_Service.md          # Data collection & ingestion
│   │   ├── 05_Calculation_Service.md       # Emission calculations
│   │   ├── 06_Reporting_Service.md         # Reports & dashboards
│   │   ├── 07_Audit_Service.md             # Compliance & logging
│   │   └── 08_Gateway_Service.md           # API gateway specification
│   │
│   ├── 03-Implementation-Guides/            # How-to guides for development
│   │   ├── 01_Service_Template_Guide.md    # NestJS service template
│   │   ├── 02_Frontend_Implementation.md   # Next.js frontend guide
│   │   ├── 03_API_Integration_Guide.md     # Service-to-service communication
│   │   ├── 04_Database_Migration.md        # Data migration strategies
│   │   ├── 05_Event_Implementation.md      # Event-driven patterns
│   │   └── 06_Testing_Strategy.md          # Test implementation
│   │
│   ├── 04-Sprint-Documentation/             # Active sprint tracking
│   │   ├── Sprint_0.1/
│   │   │   ├── 01_Task_Checklist.md
│   │   │   ├── 02_Progress_Day1.md
│   │   │   └── 03_Review_Summary.md
│   │   └── Sprint_0.2/
│   │
│   └── 05-Technical-Decisions/              # ADRs and design decisions
│       ├── 01_Microservice_Boundaries.md
│       ├── 02_Event_Sourcing_Patterns.md
│       └── 03_Security_Architecture.md
│
├── 02-Future-Roadmap/                        # PLANNED (Months 9-19)
│   ├── README.md                            # Roadmap overview and timeline
│   ├── 00_ESG_Platform_Vision.md           # Full ESG platform vision
│   │
│   ├── Phase2-Strategic-ESG/                # Months 9-11
│   │   ├── README.md
│   │   ├── 01_Phase2_Overview.md
│   │   └── Service-Specifications/
│   │       ├── 08_Notification_Service.md
│   │       ├── 09_Workflow_Service.md
│   │       ├── 10_Integration_Service.md
│   │       ├── 37_Policy_Service.md
│   │       ├── 38_Stakeholder_Service.md
│   │       ├── 41_Materiality_Service.md
│   │       └── 42_Strategy_Service.md
│   │
│   ├── Phase3-Environmental/                # Months 12-14
│   │   ├── README.md
│   │   ├── 01_Phase3_Overview.md
│   │   └── Service-Specifications/
│   │       ├── 12_Water_Service.md
│   │       ├── 14_Biodiversity_Service.md
│   │       ├── 15_Energy_Service.md
│   │       ├── 18_ClimateRisk_Service.md
│   │       └── 20_Environmental_SupplyChain.md
│   │
│   ├── Phase4-Social/                       # Months 15-16
│   │   ├── README.md
│   │   ├── 01_Phase4_Overview.md
│   │   └── Service-Specifications/
│   │       ├── 21_Workforce_Service.md
│   │       ├── 23_Labor_Service.md
│   │       ├── 24_Community_Service.md
│   │       ├── 25_Product_Service.md
│   │       ├── 26_Social_SupplyChain.md
│   │       └── 30_Training_Service.md
│   │
│   ├── Phase5-Governance/                   # Months 17-18
│   │   ├── README.md
│   │   ├── 01_Phase5_Overview.md
│   │   └── Service-Specifications/
│   │       ├── 31_Board_Service.md
│   │       ├── 33_Risk_Service.md
│   │       ├── 34_Privacy_Service.md
│   │       ├── 35_Cybersecurity_Service.md
│   │       ├── 36_BusinessConduct_Service.md
│   │       ├── 39_Transparency_Service.md
│   │       └── 40_Controls_Service.md
│   │
│   └── Phase6-Analytics/                    # Month 19
│       ├── README.md
│       ├── 01_Phase6_Overview.md
│       └── Service-Specifications/
│           ├── 45_Analytics_Service.md
│           ├── 46_ML_Service.md
│           ├── 47_Forecast_Service.md
│           ├── 48_Scenario_Service.md
│           ├── 49_Rating_Service.md
│           └── 50_Insights_Service.md
│
├── 03-Architecture/                          # System-wide architecture
│   ├── README.md
│   ├── 01_System_Architecture_Overview.md
│   ├── 02_Microservice_Architecture.md
│   ├── 03_Event_Driven_Architecture.md
│   ├── 04_Database_Architecture.md
│   ├── 05_API_Gateway_Design.md
│   ├── 06_Service_Dependencies.md
│   └── 07_Infrastructure_as_Code.md
│
├── 04-Development/                           # Development guides and standards
│   ├── README.md
│   ├── 01-Setup/
│   │   ├── 01_Environment_Configuration.md
│   │   ├── 02_Docker_Setup.md
│   │   ├── 03_MCP_Executor_Guide.md
│   │   └── 04_Local_Development.md
│   │
│   ├── 02-Standards/
│   │   ├── 01_Coding_Standards.md
│   │   ├── 02_Git_Workflow.md
│   │   ├── 03_Code_Review_Policy.md
│   │   ├── 04_Development_Checklist.md
│   │   └── 05_Agent_Coordination.md
│   │
│   ├── 03-Templates/
│   │   ├── 01_NestJS_Service_Template.md
│   │   ├── 02_NextJS_Frontend_Template.md
│   │   ├── 03_Shared_Packages_Design.md
│   │   └── 04_CICD_Pipeline_Templates.md
│   │
│   └── 04-Guides/
│       ├── 01_Migration_Guide.md
│       ├── 02_Frontend_Backend_Integration.md
│       ├── 03_BaseAPI_Client_Guide.md
│       └── 04_Opus_Usage_Guide.md
│
├── 05-Testing/                               # Testing strategies and guides
│   ├── README.md
│   ├── 01_Testing_Strategy.md
│   ├── 02_Unit_Testing_Guide.md
│   ├── 03_Integration_Testing_Guide.md
│   ├── 04_Contract_Testing_Guide.md
│   ├── 05_E2E_Testing_Guide.md
│   ├── 06_Performance_Testing.md
│   ├── 07_Security_Testing_Checklist.md
│   ├── 08_Accessibility_Testing.md
│   ├── 09_Chaos_Engineering.md
│   ├── 10_Test_Data_Management.md
│   └── 11_Rollback_Testing_Framework.md
│
├── 06-Deployment/                            # Deployment and operations
│   ├── README.md
│   ├── 01_Deployment_Overview.md
│   ├── 02_Infrastructure_Setup.md
│   ├── 03_CICD_Pipeline.md
│   ├── 04_Service_Discovery.md
│   ├── 05_Monitoring_and_Alerting.md
│   ├── 06_Performance_Monitoring.md
│   └── 07_Disaster_Recovery.md
│
├── 07-Security/                              # Security documentation
│   ├── README.md
│   ├── 01_Security_Overview.md
│   ├── 02_JWT_JWKS_Architecture.md
│   ├── 03_Service_Authentication.md
│   ├── 04_API_Gateway_Security.md
│   ├── 05_Secrets_Management.md
│   ├── 06_Threat_Model_STRIDE.md
│   ├── 07_Security_Audit_Report.md
│   └── 08_Compliance_Requirements.md
│
├── 08-Data/                                  # Data architecture and schemas
│   ├── README.md
│   ├── 01-Schemas/
│   │   ├── 01_Database_Schema_Design.md
│   │   ├── 02_MongoDB_Schemas.md
│   │   └── 03_Data_Models.md
│   │
│   ├── 02-Events/
│   │   ├── README.md
│   │   ├── 01_Event_Schema_Registry.md
│   │   ├── 02_Base_Event_Schema.md
│   │   ├── 03_Identity_Events.md
│   │   ├── 04_Organization_Events.md
│   │   ├── 05_Reference_Events.md
│   │   ├── 06_Activity_Events.md
│   │   ├── 07_Calculation_Events.md
│   │   ├── 08_Reporting_Events.md
│   │   ├── 09_Audit_Events.md
│   │   └── 10_Implementation_Guide.md
│   │
│   ├── 03-Migration/
│   │   ├── 01_Data_Migration_Strategy.md
│   │   ├── 02_Migration_Scripts.md
│   │   ├── 03_Rollback_Plan.md
│   │   └── 04_Hierarchy_Migration.md
│   │
│   └── 04-Optimization/
│       ├── 01_MongoDB_Query_Optimization.md
│       ├── 02_Redis_Caching_Strategy.md
│       └── 03_Performance_Targets.md
│
├── 09-API/                                   # API documentation
│   ├── README.md
│   ├── 01_API_Design_Specification.md
│   ├── 02_REST_API_Specification.md
│   ├── 03_API_Versioning_Strategy.md
│   ├── 04_API_Gateway_Specification.md
│   ├── 05_Error_Code_Registry.md
│   └── 06_API_Documentation_Guide.md
│
├── 10-Operations/                            # Operational procedures
│   ├── README.md
│   ├── 01_Operational_Overview.md
│   ├── 02_Circuit_Breaker_Patterns.md
│   ├── 03_Saga_Pattern_Implementation.md
│   ├── 04_Transaction_Boundaries.md
│   ├── 05_Service_Health_Checks.md
│   └── 06_Incident_Response.md
│
├── 11-Governance/                            # Project governance
│   ├── README.md
│   ├── 01_Project_Governance.md
│   ├── 02_Multi_Agent_Strategy.md
│   ├── 03_JIRA_Structure.md
│   ├── 04_Review_Process.md
│   └── 05_Documentation_Standards.md
│
└── 12-Archive/                               # Archived and reference docs
    ├── README.md
    ├── Reviews/
    │   ├── Review_2025-11-18.md
    │   └── Review_2025-11-20.md
    ├── Legacy/
    │   ├── Current_Architecture.md
    │   └── Company_Details_Migration.md
    └── Completed/
        ├── JIRA_MCP_Configuration.md
        ├── JIRA_Backlog_Complete.md
        └── Local_Dev_Environment.md
```

## File Mapping Table

| Current File | New Location | New Filename | Rationale |
|--------------|--------------|--------------|-----------|
| ESG_PLATFORM_OVERVIEW.md | 00-Getting-Started/ | 01_Platform_Overview.md | Primary entry point for platform understanding |
| QUICKSTART_GUIDE.md | 00-Getting-Started/ | 02_Quick_Start_Guide.md | Essential for new developers |
| PHASE2_Target_Architecture_Overview.md | 00-Getting-Started/ | 03_Architecture_Summary.md | High-level architecture overview |
| PROJECT_STRUCTURE_GUIDE.md | 00-Getting-Started/ | 05_Project_Structure.md | Codebase organization guide |
| CURRENT-SCOPE/PHASE1_OVERVIEW.md | 01-Current-Scope-Phase1/01-Overview/ | 01_Phase1_Scope.md | Current development scope |
| SPRINT_0.1_Task_Checklist.md | 01-Current-Scope-Phase1/04-Sprint-Documentation/Sprint_0.1/ | 01_Task_Checklist.md | Active sprint tracking |
| SPRINT_0.1_PROGRESS_DAY1.md | 01-Current-Scope-Phase1/04-Sprint-Documentation/Sprint_0.1/ | 02_Progress_Day1.md | Sprint progress |
| PHASE3_Service_Spec_01_Identity.md | 01-Current-Scope-Phase1/02-Service-Specifications/ | 01_Identity_Service.md | Core service spec |
| PHASE3_Service_Spec_02_Organization.md | 01-Current-Scope-Phase1/02-Service-Specifications/ | 02_Organization_Service.md | Core service spec |
| PHASE3_Service_Spec_03_Reference.md | 01-Current-Scope-Phase1/02-Service-Specifications/ | 03_Reference_Service.md | Core service spec |
| PHASE3_Service_Spec_04_Activity.md | 01-Current-Scope-Phase1/02-Service-Specifications/ | 04_Activity_Service.md | Core service spec |
| PHASE3_Service_Spec_05_Calculation.md | 01-Current-Scope-Phase1/02-Service-Specifications/ | 05_Calculation_Service.md | Core service spec |
| PHASE3_Service_Spec_06_Reporting.md | 01-Current-Scope-Phase1/02-Service-Specifications/ | 06_Reporting_Service.md | Core service spec |
| PHASE3_Service_Spec_07_Audit.md | 01-Current-Scope-Phase1/02-Service-Specifications/ | 07_Audit_Service.md | Core service spec |
| API_GATEWAY_SPECIFICATION.md | 01-Current-Scope-Phase1/02-Service-Specifications/ | 08_Gateway_Service.md | Gateway is a core service |
| PHASE3_Service_Specs_Summary.md | 01-Current-Scope-Phase1/02-Service-Specifications/ | README.md | Service catalog index |
| NESTJS_SERVICE_TEMPLATE_DESIGN.md | 01-Current-Scope-Phase1/03-Implementation-Guides/ | 01_Service_Template_Guide.md | Implementation guide |
| PHASE9_Frontend_Adaptation_Plan.md | 01-Current-Scope-Phase1/03-Implementation-Guides/ | 02_Frontend_Implementation.md | Frontend guide |
| FRONTEND_BACKEND_INTEGRATION_GUIDE.md | 01-Current-Scope-Phase1/03-Implementation-Guides/ | 03_API_Integration_Guide.md | Integration patterns |
| OLD_TO_NEW_MIGRATION_GUIDE.md | 01-Current-Scope-Phase1/03-Implementation-Guides/ | 04_Database_Migration.md | Migration strategy |
| PHASE5_SDLC_Quality_Strategy.md | 01-Current-Scope-Phase1/03-Implementation-Guides/ | 06_Testing_Strategy.md | Testing approach |
| PHASE2_Microservice_Decomposition_Bounded_Contexts.md | 01-Current-Scope-Phase1/05-Technical-Decisions/ | 01_Microservice_Boundaries.md | Architecture decision |
| DESIGN/Event_Sourcing_Patterns.md | 01-Current-Scope-Phase1/05-Technical-Decisions/ | 02_Event_Sourcing_Patterns.md | Pattern decision |
| JWT_JWKS_ARCHITECTURE.md | 01-Current-Scope-Phase1/05-Technical-Decisions/ | 03_Security_Architecture.md | Security decision |
| FUTURE-ROADMAP/PLATFORM_ROADMAP_OVERVIEW.md | 02-Future-Roadmap/ | README.md | Roadmap index |
| ESG_PLATFORM_GAP_ANALYSIS_AND_RECOMMENDATIONS.md | 02-Future-Roadmap/ | 00_ESG_Platform_Vision.md | Future vision |
| FUTURE-ROADMAP/Phase2-Strategic-ESG/service-specs/*.md | 02-Future-Roadmap/Phase2-Strategic-ESG/Service-Specifications/ | [Same names] | Future services |
| FUTURE-ROADMAP/Phase3-Environmental/service-specs/*.md | 02-Future-Roadmap/Phase3-Environmental/Service-Specifications/ | [Same names] | Future services |
| FUTURE-ROADMAP/Phase4-Social/service-specs/*.md | 02-Future-Roadmap/Phase4-Social/Service-Specifications/ | [Same names] | Future services |
| FUTURE-ROADMAP/Phase5-Governance/service-specs/*.md | 02-Future-Roadmap/Phase5-Governance/Service-Specifications/ | [Same names] | Future services |
| FUTURE-ROADMAP/Phase6-Analytics/service-specs/*.md | 02-Future-Roadmap/Phase6-Analytics/Service-Specifications/ | [Same names] | Future services |
| PHASE2_Target_Architecture_Overview.md | 03-Architecture/ | 01_System_Architecture_Overview.md | Main architecture doc |
| PHASE2_Microservice_Decomposition_Bounded_Contexts.md | 03-Architecture/ | 02_Microservice_Architecture.md | Service architecture |
| EVENT_SCHEMA_REGISTRY.md | 03-Architecture/ | 03_Event_Driven_Architecture.md | Event architecture |
| DATABASE_SCHEMA_DESIGN.md | 03-Architecture/ | 04_Database_Architecture.md | Data architecture |
| API_GATEWAY_SPECIFICATION.md | 03-Architecture/ | 05_API_Gateway_Design.md | Gateway architecture |
| SERVICE_DEPENDENCY_DIAGRAM.md | 03-Architecture/ | 06_Service_Dependencies.md | Dependency map |
| INFRASTRUCTURE_AS_CODE_COMPLETE.md | 03-Architecture/ | 07_Infrastructure_as_Code.md | IaC architecture |
| ENVIRONMENT_CONFIGURATION_GUIDE.md | 04-Development/01-Setup/ | 01_Environment_Configuration.md | Setup guide |
| LOCAL_DEV_ENVIRONMENT_Updates.md | 04-Development/01-Setup/ | 02_Docker_Setup.md | Docker environment |
| MCP_EXECUTOR_GUIDE.md | 04-Development/01-Setup/ | 03_MCP_Executor_Guide.md | MCP setup |
| archive/LOCAL_DEV_ENVIRONMENT_Updates.md | 04-Development/01-Setup/ | 04_Local_Development.md | Local dev guide |
| DEVELOPMENT_CHECKLIST.md | 04-Development/02-Standards/ | 01_Coding_Standards.md | Dev standards |
| GIT_WORKFLOW.md | 04-Development/02-Standards/ | 02_Git_Workflow.md | Git practices |
| CODE_REVIEW_POLICY.md | 04-Development/02-Standards/ | 03_Code_Review_Policy.md | Review policy |
| DEVELOPMENT_CHECKLIST.md | 04-Development/02-Standards/ | 04_Development_Checklist.md | Dev checklist |
| AGENT_COORDINATION_GUIDE.md | 04-Development/02-Standards/ | 05_Agent_Coordination.md | Multi-agent guide |
| NESTJS_SERVICE_TEMPLATE_DESIGN.md | 04-Development/03-Templates/ | 01_NestJS_Service_Template.md | Service template |
| NEXTJS_FRONTEND_TEMPLATE_DESIGN.md | 04-Development/03-Templates/ | 02_NextJS_Frontend_Template.md | Frontend template |
| SHARED_PACKAGES_DESIGN.md | 04-Development/03-Templates/ | 03_Shared_Packages_Design.md | Shared code |
| CICD_PIPELINE_TEMPLATES_DESIGN.md | 04-Development/03-Templates/ | 04_CICD_Pipeline_Templates.md | CI/CD templates |
| OLD_TO_NEW_MIGRATION_GUIDE.md | 04-Development/04-Guides/ | 01_Migration_Guide.md | Migration guide |
| FRONTEND_BACKEND_INTEGRATION_GUIDE.md | 04-Development/04-Guides/ | 02_Frontend_Backend_Integration.md | Integration guide |
| PHASE10_BaseAPIClient_Implementation_Guide.md | 04-Development/04-Guides/ | 03_BaseAPI_Client_Guide.md | API client guide |
| OPUS_USAGE_GUIDE.md | 04-Development/04-Guides/ | 04_Opus_Usage_Guide.md | Claude Opus guide |
| PHASE5_SDLC_Quality_Strategy.md | 05-Testing/ | 01_Testing_Strategy.md | Overall testing strategy |
| CONTRACT_TESTING_IMPLEMENTATION_GUIDE.md | 05-Testing/ | 04_Contract_Testing_Guide.md | Contract testing |
| PERFORMANCE_TARGETS.md | 05-Testing/ | 06_Performance_Testing.md | Performance benchmarks |
| SECURITY_TESTING_CHECKLIST.md | 05-Testing/ | 07_Security_Testing_Checklist.md | Security testing |
| ACCESSIBILITY_TESTING_IMPLEMENTATION.md | 05-Testing/ | 08_Accessibility_Testing.md | A11y testing |
| CHAOS_ENGINEERING_IMPLEMENTATION.md | 05-Testing/ | 09_Chaos_Engineering.md | Chaos testing |
| TEST_DATA_MANAGEMENT_IMPLEMENTATION.md | 05-Testing/ | 10_Test_Data_Management.md | Test data |
| ROLLBACK_TESTING_FRAMEWORK.md | 05-Testing/ | 11_Rollback_Testing_Framework.md | Rollback testing |
| INFRASTRUCTURE_AS_CODE_COMPLETE.md | 06-Deployment/ | 02_Infrastructure_Setup.md | Infrastructure guide |
| CICD_PIPELINE_TEMPLATES_DESIGN.md | 06-Deployment/ | 03_CICD_Pipeline.md | CI/CD setup |
| SERVICE_DISCOVERY_IMPLEMENTATION.md | 06-Deployment/ | 04_Service_Discovery.md | Service discovery |
| MONITORING_AND_ALERTING_SPEC.md | 06-Deployment/ | 05_Monitoring_and_Alerting.md | Monitoring setup |
| PERFORMANCE_SLOS_MONITORING_STRATEGY.md | 06-Deployment/ | 06_Performance_Monitoring.md | Performance monitoring |
| JWT_JWKS_ARCHITECTURE.md | 07-Security/ | 02_JWT_JWKS_Architecture.md | JWT implementation |
| SERVICE_TO_SERVICE_AUTH_IMPLEMENTATION.md | 07-Security/ | 03_Service_Authentication.md | Service auth |
| API_GATEWAY_SECURITY_IMPLEMENTATION.md | 07-Security/ | 04_API_Gateway_Security.md | Gateway security |
| SECRETS_MANAGEMENT_STRATEGY.md | 07-Security/ | 05_Secrets_Management.md | Secrets handling |
| SECURITY_THREAT_MODEL_STRIDE.md | 07-Security/ | 06_Threat_Model_STRIDE.md | Threat modeling |
| MCP_SECURITY_AUDIT.md | 07-Security/ | 07_Security_Audit_Report.md | Security audit |
| DATABASE_SCHEMA_DESIGN.md | 08-Data/01-Schemas/ | 01_Database_Schema_Design.md | Schema design |
| event-schemas/README.md | 08-Data/02-Events/ | README.md | Event schema index |
| EVENT_SCHEMA_REGISTRY.md | 08-Data/02-Events/ | 01_Event_Schema_Registry.md | Registry overview |
| event-schemas/00-BASE.md | 08-Data/02-Events/ | 02_Base_Event_Schema.md | Base events |
| event-schemas/01-IDENTITY.md | 08-Data/02-Events/ | 03_Identity_Events.md | Identity events |
| event-schemas/02-ORGANIZATION.md | 08-Data/02-Events/ | 04_Organization_Events.md | Org events |
| event-schemas/03-REFERENCE.md | 08-Data/02-Events/ | 05_Reference_Events.md | Reference events |
| event-schemas/04-ACTIVITY.md | 08-Data/02-Events/ | 06_Activity_Events.md | Activity events |
| event-schemas/05-CALCULATION.md | 08-Data/02-Events/ | 07_Calculation_Events.md | Calc events |
| event-schemas/06-REPORTING.md | 08-Data/02-Events/ | 08_Reporting_Events.md | Report events |
| event-schemas/07-AUDIT.md | 08-Data/02-Events/ | 09_Audit_Events.md | Audit events |
| event-schemas/99-IMPLEMENTATION-GUIDE.md | 08-Data/02-Events/ | 10_Implementation_Guide.md | Implementation guide |
| DATA_MIGRATION_ROLLBACK_PLAN.md | 08-Data/03-Migration/ | 01_Data_Migration_Strategy.md | Migration strategy |
| DATA_MIGRATION_SCRIPTS_IMPLEMENTATION.md | 08-Data/03-Migration/ | 02_Migration_Scripts.md | Migration scripts |
| DATA_MIGRATION_ROLLBACK_PLAN.md | 08-Data/03-Migration/ | 03_Rollback_Plan.md | Rollback procedures |
| HIERARCHY_MIGRATION_ALGORITHM.md | 08-Data/03-Migration/ | 04_Hierarchy_Migration.md | Hierarchy migration |
| MONGODB_QUERY_OPTIMIZATION_STRATEGY.md | 08-Data/04-Optimization/ | 01_MongoDB_Query_Optimization.md | Query optimization |
| REDIS_CACHING_STRATEGY.md | 08-Data/04-Optimization/ | 02_Redis_Caching_Strategy.md | Caching strategy |
| PERFORMANCE_TARGETS.md | 08-Data/04-Optimization/ | 03_Performance_Targets.md | Performance goals |
| API_DESIGN_SPECIFICATION.md | 09-API/ | 01_API_Design_Specification.md | API design |
| REST_API_SPECIFICATION.md | 09-API/ | 02_REST_API_Specification.md | REST spec |
| API_VERSIONING_STRATEGY.md | 09-API/ | 03_API_Versioning_Strategy.md | Versioning |
| API_GATEWAY_SPECIFICATION.md | 09-API/ | 04_API_Gateway_Specification.md | Gateway spec |
| ERROR_CODE_REGISTRY.md | 09-API/ | 05_Error_Code_Registry.md | Error codes |
| CIRCUIT_BREAKER_AND_RESILIENCE.md | 10-Operations/ | 02_Circuit_Breaker_Patterns.md | Resilience patterns |
| SAGA_PATTERN_IMPLEMENTATION.md | 10-Operations/ | 03_Saga_Pattern_Implementation.md | Saga patterns |
| TRANSACTION_BOUNDARY_SPEC.md | 10-Operations/ | 04_Transaction_Boundaries.md | Transaction management |
| CLAUDE_MULTI_AGENT_STRATEGY.md | 11-Governance/ | 02_Multi_Agent_Strategy.md | Agent strategy |
| JIRA_ESG_STRUCTURE.md | 11-Governance/ | 03_JIRA_Structure.md | JIRA organization |
| DOCUMENTATION_STRUCTURE.md | 11-Governance/ | 05_Documentation_Standards.md | Doc standards |
| REVIEW_SUMMARY_2025-11-18.md | 12-Archive/Reviews/ | Review_2025-11-18.md | Historical review |
| REVIEW_SUMMARY_2025-11-20.md | 12-Archive/Reviews/ | Review_2025-11-20.md | Historical review |
| PHASE1_Current_Architecture_Overview.md | 12-Archive/Legacy/ | Current_Architecture.md | Legacy architecture |
| COMPANYDETAILS_MIGRATION.md | 12-Archive/Legacy/ | Company_Details_Migration.md | Legacy migration |
| archive/completed-setup/PHASE6_Jira_MCP_Configuration.md | 12-Archive/Completed/ | JIRA_MCP_Configuration.md | Completed setup |
| archive/completed-setup/PHASE7_Complete_Jira_Backlog.md | 12-Archive/Completed/ | JIRA_Backlog_Complete.md | Completed backlog |
| archive/LOCAL_DEV_ENVIRONMENT_Updates.md | 12-Archive/Completed/ | Local_Dev_Environment.md | Completed env setup |

## Implementation Commands

### Step 1: Create New Folder Structure
```bash
#!/bin/bash

# Create main directories
mkdir -p Docs_New/00-Getting-Started
mkdir -p Docs_New/01-Current-Scope-Phase1/{01-Overview,02-Service-Specifications,03-Implementation-Guides,04-Sprint-Documentation,05-Technical-Decisions}
mkdir -p Docs_New/01-Current-Scope-Phase1/04-Sprint-Documentation/{Sprint_0.1,Sprint_0.2}
mkdir -p Docs_New/02-Future-Roadmap/{Phase2-Strategic-ESG,Phase3-Environmental,Phase4-Social,Phase5-Governance,Phase6-Analytics}
mkdir -p Docs_New/02-Future-Roadmap/Phase2-Strategic-ESG/Service-Specifications
mkdir -p Docs_New/02-Future-Roadmap/Phase3-Environmental/Service-Specifications
mkdir -p Docs_New/02-Future-Roadmap/Phase4-Social/Service-Specifications
mkdir -p Docs_New/02-Future-Roadmap/Phase5-Governance/Service-Specifications
mkdir -p Docs_New/02-Future-Roadmap/Phase6-Analytics/Service-Specifications
mkdir -p Docs_New/03-Architecture
mkdir -p Docs_New/04-Development/{01-Setup,02-Standards,03-Templates,04-Guides}
mkdir -p Docs_New/05-Testing
mkdir -p Docs_New/06-Deployment
mkdir -p Docs_New/07-Security
mkdir -p Docs_New/08-Data/{01-Schemas,02-Events,03-Migration,04-Optimization}
mkdir -p Docs_New/09-API
mkdir -p Docs_New/10-Operations
mkdir -p Docs_New/11-Governance
mkdir -p Docs_New/12-Archive/{Reviews,Legacy,Completed}
```

### Step 2: Copy and Rename Files (Sample - Full script in reorganize_docs.sh)
```bash
# 00-Getting-Started
cp ESG_PLATFORM_OVERVIEW.md Docs_New/00-Getting-Started/01_Platform_Overview.md
cp QUICKSTART_GUIDE.md Docs_New/00-Getting-Started/02_Quick_Start_Guide.md
cp PHASE2_Target_Architecture_Overview.md Docs_New/00-Getting-Started/03_Architecture_Summary.md
cp PROJECT_STRUCTURE_GUIDE.md Docs_New/00-Getting-Started/05_Project_Structure.md

# 01-Current-Scope-Phase1
cp CURRENT-SCOPE/PHASE1_OVERVIEW.md Docs_New/01-Current-Scope-Phase1/01-Overview/01_Phase1_Scope.md
cp PHASE3_Service_Spec_01_Identity.md Docs_New/01-Current-Scope-Phase1/02-Service-Specifications/01_Identity_Service.md
# ... (continue for all files)
```

### Step 3: Create README Files
```bash
# Create master README
cat > Docs_New/README.md << 'EOF'
# Clenergize V3 ESG Platform Documentation

Welcome to the comprehensive documentation for the Clenergize V3 ESG Platform. This documentation is organized to support both current development (Phase 1: Carbon Footprint) and future roadmap (Phases 2-6: Full ESG Platform).

## Quick Navigation

### 🚀 Getting Started
- [Platform Overview](00-Getting-Started/01_Platform_Overview.md)
- [Quick Start Guide](00-Getting-Started/02_Quick_Start_Guide.md)
- [Architecture Summary](00-Getting-Started/03_Architecture_Summary.md)

### 📂 Documentation Structure

#### Active Development (Phase 1: Carbon Footprint)
- **[01-Current-Scope-Phase1](01-Current-Scope-Phase1/)** - Everything needed for current sprint work
  - Service Specifications
  - Implementation Guides
  - Sprint Documentation
  - Technical Decisions

#### Future Roadmap (Phases 2-6: Full ESG)
- **[02-Future-Roadmap](02-Future-Roadmap/)** - Planned ESG platform expansion
  - Phase 2: Strategic ESG Services
  - Phase 3: Environmental Services
  - Phase 4: Social Services
  - Phase 5: Governance Services
  - Phase 6: Analytics & ML Services

#### Technical Documentation
- **[03-Architecture](03-Architecture/)** - System architecture and design
- **[04-Development](04-Development/)** - Development guides and standards
- **[05-Testing](05-Testing/)** - Testing strategies and guides
- **[06-Deployment](06-Deployment/)** - Deployment and infrastructure
- **[07-Security](07-Security/)** - Security documentation
- **[08-Data](08-Data/)** - Data schemas and migration
- **[09-API](09-API/)** - API specifications
- **[10-Operations](10-Operations/)** - Operational procedures
- **[11-Governance](11-Governance/)** - Project governance

## For New Developers

1. Start with [Platform Overview](00-Getting-Started/01_Platform_Overview.md)
2. Follow [Quick Start Guide](00-Getting-Started/02_Quick_Start_Guide.md)
3. Review [Current Sprint Tasks](01-Current-Scope-Phase1/04-Sprint-Documentation/Sprint_0.1/)
4. Read relevant [Service Specifications](01-Current-Scope-Phase1/02-Service-Specifications/)

## Document Naming Convention

- **Folders**: 2-digit prefix (00, 01, 02...) for ordering
- **Files**: 2-digit prefix + descriptive name with underscores
- **Example**: `01_Identity_Service.md`

## Version Control

- **Current Version**: 1.0.0
- **Last Updated**: November 22, 2025
- **Total Documents**: 130+ markdown files
- **Active Sprint**: Sprint 0.1

## Support

For questions about documentation:
- Slack: #clenergize-docs
- Email: docs@clenergize.com
EOF
```

### Step 4: Archive Old Structure
```bash
# Create archive of old structure
tar -czf Docs_Archive_$(date +%Y%m%d).tar.gz Docs/
# Move new structure into place
mv Docs Docs_Old_Backup
mv Docs_New Docs
```

## Benefits of New Structure

### 1. Clear Separation of Concerns
- **Current vs Future**: Developers can focus on Phase 1 without confusion
- **Technical Domains**: Easy to find security, testing, or deployment docs
- **Service Documentation**: All service specs in logical locations

### 2. Industry-Standard Organization
- Follows Microsoft, AWS, Google Cloud patterns
- Numbered folders for clear hierarchy
- Descriptive names for better searchability
- Comprehensive README files for navigation

### 3. Improved Developer Experience
- New developers start at 00-Getting-Started
- Active developers work in 01-Current-Scope-Phase1
- Architects reference 03-Architecture
- DevOps uses 06-Deployment

### 4. Scalability
- Structure supports 50+ future services
- Easy to add new phases
- Clear archival process for completed work

### 5. Better Discoverability
- Consistent naming convention
- Logical grouping of related documents
- Master README with complete navigation
- Category-specific README files

## Migration Checklist

- [ ] Review and approve reorganization plan
- [ ] Create backup of current documentation
- [ ] Run reorganization script
- [ ] Verify all files moved correctly
- [ ] Update references in code and CI/CD
- [ ] Update bookmarks and links
- [ ] Notify development team
- [ ] Update .claude/CLAUDE.md references
- [ ] Update GitHub wiki if applicable
- [ ] Archive old structure

## Post-Migration Tasks

1. **Update Code References**: Search and replace old documentation paths
2. **Update CI/CD**: Update any build scripts referencing docs
3. **Update Links**: Update any external links to documentation
4. **Team Training**: Brief team on new structure
5. **Create Shortcuts**: Add common shortcuts for frequently accessed docs

## Success Metrics

- **Time to Find Document**: Reduced from avg 5 min to < 1 min
- **New Developer Onboarding**: Reduced from 2 days to 4 hours
- **Documentation Updates**: More frequent due to clear ownership
- **Team Satisfaction**: Improved organization and discoverability

## Maintenance Plan

### Weekly
- Review and organize new sprint documentation
- Archive completed sprint docs

### Monthly
- Review and update navigation README
- Archive completed work
- Update version numbers

### Quarterly
- Review structure effectiveness
- Gather team feedback
- Plan adjustments if needed

---

**Approval**: _________________
**Date**: _________________
**Executed By**: _________________