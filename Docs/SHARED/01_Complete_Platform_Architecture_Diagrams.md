# Complete Platform Architecture Diagrams - All 50 Services

> **Document Type**: Architecture Diagrams (Mermaid)
> **Version**: 1.0.0
> **Last Updated**: November 22, 2025
> **Platform Scope**: Complete ESG Platform (50 microservices)

---

## 📋 Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Service Dependency Map](#service-dependency-map)
3. [Phase 1: Carbon Footprint Services](#phase-1-carbon-footprint-services)
4. [Phase 2: Strategic ESG Services](#phase-2-strategic-esg-services)
5. [Phase 3: Environmental Services](#phase-3-environmental-services)
6. [Phase 4: Social Services](#phase-4-social-services)
7. [Phase 5: Governance Services](#phase-5-governance-services)
8. [Phase 6: Analytics & ML Services](#phase-6-analytics-ml-services)
9. [Data Flow Architecture](#data-flow-architecture)
10. [Deployment Architecture](#deployment-architecture)

---

## System Architecture Overview

### High-Level Platform Architecture (All 50 Services)

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Application<br/>Next.js 14]
        MOBILE[Mobile App<br/>React Native]
        API_DOCS[API Documentation<br/>Swagger UI]
    end

    subgraph "API Gateway Layer - Port 3000"
        GATEWAY[API Gateway<br/>Kong/NGINX<br/>JWT Verification]
    end

    subgraph "Phase 1: Carbon Footprint Services - Ports 3001-3007"
        IDENTITY[Identity Service<br/>3001<br/>Auth, Users, Roles]
        ORG[Organization Service<br/>3002<br/>Projects, Hierarchy]
        REF[Reference Service<br/>3003<br/>Emission Factors]
        ACTIVITY[Activity Service<br/>3004<br/>Activity Data]
        CALC[Calculation Service<br/>3005<br/>Emissions Calc]
        REPORT[Reporting Service<br/>3006<br/>Reports, Export]
        AUDIT[Audit Service<br/>3007<br/>Audit Trail]
    end

    subgraph "Phase 2: Strategic ESG Services - Ports 3008-3010, 3037-3044"
        NOTIF[Notification Service<br/>3008<br/>Email, SMS, Push]
        WORKFLOW[Workflow Service<br/>3009<br/>Temporal, Approvals]
        INTEG[Integration Service<br/>3010<br/>SAP, Workday, etc.]
        POLICY[Policy Service<br/>3037<br/>Policies, Attestation]
        STAKE[Stakeholder Service<br/>3038<br/>Engagement]
        MATER[Materiality Service<br/>3041<br/>Double Materiality]
        STRAT[Strategy Service<br/>3042<br/>Targets, Initiatives]
        REPORT2[Reporting Enhanced<br/>3044<br/>Multi-framework]
    end

    subgraph "Phase 3: Environmental Services - Ports 3012-3020"
        WATER[Water Service<br/>3012<br/>Consumption, Stress]
        WASTE[Waste Service<br/>3013<br/>Waste, Circular Economy]
        BIO[Biodiversity Service<br/>3014<br/>TNFD, SBTN]
        ENERGY[Energy Service<br/>3015<br/>Energy, RE100]
        POLL[Pollution Service<br/>3016<br/>Air, Water, Soil]
        RES[Resource Service<br/>3017<br/>Materials, Minerals]
        CLIMATE[Climate Risk Service<br/>3018<br/>TCFD, Scenarios]
        GREEN[Green Finance Service<br/>3019<br/>Green Bonds]
        ENV_SC[Env Supply Chain<br/>3020<br/>Scope 3 Upstream]
    end

    subgraph "Phase 4: Social Services - Ports 3021-3030"
        WORK[Workforce Service<br/>3021<br/>Demographics, Talent]
        SAFETY[Safety Service<br/>3022<br/>OSHA, Incidents]
        LABOR[Labor Service<br/>3023<br/>Living Wage, ILO]
        COMM[Community Service<br/>3024<br/>FPIC, Indigenous]
        PROD[Product Service<br/>3025<br/>Safety, Privacy]
        SOC_SC[Social Supply Chain<br/>3026<br/>Modern Slavery]
        HR[Human Rights Service<br/>3027<br/>UNGPs, HRIA]
        DIV[Diversity Service<br/>3028<br/>DEI, Pay Equity]
        WELL[Wellbeing Service<br/>3029<br/>Mental Health]
        TRAIN[Training Service<br/>3030<br/>Skills Development]
    end

    subgraph "Phase 5: Governance Services - Ports 3031-3036, 3039-3040"
        BOARD[Board Service<br/>3031<br/>Governance, Diversity]
        ETHICS[Ethics Service<br/>3032<br/>Hotline, Corruption]
        RISK[Risk Service<br/>3033<br/>ERM, COSO]
        PRIV[Privacy Service<br/>3034<br/>GDPR, DSR]
        CYBER[Cybersecurity Service<br/>3035<br/>NIST CSF, Incidents]
        CONDUCT[Business Conduct<br/>3036<br/>Lobbying, Tax]
        TRANS[Transparency Service<br/>3039<br/>Assurance, Lineage]
        CONTROL[Controls Service<br/>3040<br/>SOX 404, COSO]
    end

    subgraph "Phase 6: Analytics & ML Services - Ports 3045-3050"
        ANALYTICS[Analytics Service<br/>3045<br/>Dashboards, OLAP]
        ML[ML Service<br/>3046<br/>Python, TensorFlow]
        FORECAST[Forecast Service<br/>3047<br/>Time Series, SBTi]
        SCENARIO[Scenario Service<br/>3048<br/>Monte Carlo]
        RATING[Rating Service<br/>3049<br/>ESG Scores]
        INSIGHTS[Insights Service<br/>3050<br/>AI, NLG]
    end

    subgraph "Infrastructure Layer"
        MONGO[(MongoDB<br/>Document Store)]
        REDIS[(Redis<br/>Cache & PubSub)]
        INFLUX[(InfluxDB<br/>Time Series)]
        NEO4J[(Neo4j<br/>Graph DB)]
        CLICK[(ClickHouse<br/>OLAP)]
        KAFKA[Apache Kafka<br/>Event Streaming]
        TEMPORAL[Temporal<br/>Workflows]
        S3[(AWS S3<br/>Object Storage)]
    end

    subgraph "External Integrations"
        ERP[ERP Systems<br/>SAP, Oracle]
        HRIS[HRIS<br/>Workday, SF]
        ESG_DATA[ESG Data Providers<br/>MSCI, CDP]
        LLM[LLM APIs<br/>GPT-4, Claude]
        IOT[IoT Platforms<br/>CEMS, Meters]
    end

    %% Client connections
    WEB --> GATEWAY
    MOBILE --> GATEWAY
    API_DOCS --> GATEWAY

    %% Gateway to services
    GATEWAY --> IDENTITY
    GATEWAY --> ORG
    GATEWAY --> ACTIVITY
    GATEWAY --> REPORT

    %% Phase 1 internal connections
    IDENTITY -.-> MONGO
    ORG -.-> MONGO
    REF -.-> MONGO
    ACTIVITY -.-> MONGO
    CALC -.-> MONGO
    REPORT -.-> MONGO
    AUDIT -.-> MONGO

    ACTIVITY --> KAFKA
    CALC --> KAFKA
    KAFKA --> REPORT

    %% Phase 2 connections
    WORKFLOW -.-> TEMPORAL
    INTEG --> ERP
    INTEG --> HRIS

    %% Phase 3 connections
    CLIMATE -.-> NEO4J
    ENV_SC -.-> NEO4J

    %% Phase 4 connections
    SOC_SC -.-> NEO4J
    WORK --> HRIS
    SAFETY -.-> MONGO

    %% Phase 5 connections
    RISK -.-> MONGO
    PRIV -.-> MONGO
    TRANS -.-> NEO4J

    %% Phase 6 connections
    ANALYTICS -.-> CLICK
    ML -.-> S3
    INSIGHTS --> LLM
    FORECAST --> ML

    %% External integrations
    WATER --> IOT
    ENERGY --> IOT
    POLL --> IOT

    %% Shared infrastructure
    NOTIF -.-> REDIS
    CALC -.-> REDIS
    ANALYTICS --> KAFKA

    style GATEWAY fill:#ff6b6b
    style IDENTITY fill:#4ecdc4
    style ORG fill:#4ecdc4
    style REF fill:#4ecdc4
    style ACTIVITY fill:#4ecdc4
    style CALC fill:#4ecdc4
    style REPORT fill:#4ecdc4
    style AUDIT fill:#4ecdc4
    style ML fill:#95e1d3
    style INSIGHTS fill:#95e1d3
    style ANALYTICS fill:#95e1d3
```

---

## Service Dependency Map

### Inter-Service Dependencies (50 Services)

```mermaid
graph LR
    subgraph "Core Dependencies"
        IDENTITY[Identity Service<br/>3001]
        ORG[Organization Service<br/>3002]
        REF[Reference Service<br/>3003]
        AUDIT[Audit Service<br/>3007]
    end

    subgraph "Phase 1: Carbon"
        ACTIVITY[Activity Service<br/>3004]
        CALC[Calculation Service<br/>3005]
        REPORT[Reporting Service<br/>3006]
    end

    subgraph "Phase 2: Strategic"
        WORKFLOW[Workflow Service<br/>3009]
        MATER[Materiality Service<br/>3041]
        STRAT[Strategy Service<br/>3042]
        REPORT2[Reporting Enhanced<br/>3044]
    end

    subgraph "Phase 3: Environmental"
        WATER[Water<br/>3012]
        WASTE[Waste<br/>3013]
        CLIMATE[Climate Risk<br/>3018]
    end

    subgraph "Phase 4: Social"
        WORK[Workforce<br/>3021]
        SAFETY[Safety<br/>3022]
        DIV[Diversity<br/>3028]
    end

    subgraph "Phase 5: Governance"
        RISK[Risk<br/>3033]
        PRIV[Privacy<br/>3034]
        CONTROL[Controls<br/>3040]
    end

    subgraph "Phase 6: Analytics"
        ANALYTICS[Analytics<br/>3045]
        ML[ML<br/>3046]
        INSIGHTS[Insights<br/>3050]
    end

    %% Critical dependencies (ALL services depend on these)
    ACTIVITY --> IDENTITY
    ACTIVITY --> ORG
    ACTIVITY --> REF
    CALC --> IDENTITY
    CALC --> ORG
    CALC --> REF

    %% Phase 1 internal
    ACTIVITY --> CALC
    CALC --> REPORT
    REPORT --> AUDIT

    %% Phase 2 dependencies
    MATER --> STRAT
    STRAT --> REPORT2
    WORKFLOW --> AUDIT

    %% Phase 3 dependencies
    WATER --> REF
    WASTE --> REF
    CLIMATE --> CALC

    %% Phase 4 dependencies
    WORK --> ORG
    SAFETY --> WORKFLOW
    DIV --> WORK

    %% Phase 5 dependencies
    RISK --> AUDIT
    PRIV --> IDENTITY
    CONTROL --> AUDIT

    %% Phase 6 dependencies (depends on ALL)
    ANALYTICS --> CALC
    ANALYTICS --> WATER
    ANALYTICS --> WORK
    ML --> ANALYTICS
    INSIGHTS --> ML
    INSIGHTS --> ANALYTICS

    style IDENTITY fill:#ff6b6b,stroke:#333,stroke-width:3px
    style ORG fill:#ff6b6b,stroke:#333,stroke-width:3px
    style REF fill:#ff6b6b,stroke:#333,stroke-width:3px
    style AUDIT fill:#ff6b6b,stroke:#333,stroke-width:3px
```

---

## Phase 1: Carbon Footprint Services

### Phase 1 Detailed Architecture (Ports 3000-3007)

```mermaid
graph TB
    subgraph "External Clients"
        USER[User Browser<br/>Next.js App]
        MOBILE[Mobile App]
        API_CLIENT[API Client<br/>Third-party]
    end

    subgraph "API Gateway - Port 3000"
        GATEWAY[Kong API Gateway<br/>- JWT Verification<br/>- Rate Limiting<br/>- CORS<br/>- Logging]
    end

    subgraph "Phase 1 Services"
        IDENTITY[Identity Service - 3001<br/>━━━━━━━━━━━━━━━━<br/>• User Management<br/>• Authentication JWT/JWKS<br/>• Role-Based Access Control<br/>• SSO Integration]

        ORG[Organization Service - 3002<br/>━━━━━━━━━━━━━━━━<br/>• Organization Hierarchy<br/>• Projects & Facilities<br/>• Hierarchy References<br/>• Access Control]

        REF[Reference Service - 3003<br/>━━━━━━━━━━━━━━━━<br/>• Emission Factors<br/>• Units & Conversions<br/>• Methodologies<br/>• Data Versioning]

        ACTIVITY[Activity Service - 3004<br/>━━━━━━━━━━━━━━━━<br/>• Activity Data Collection<br/>• Bulk Import CSV/Excel<br/>• Data Validation<br/>• IoT Integration]

        CALC[Calculation Service - 3005<br/>━━━━━━━━━━━━━━━━<br/>• Emission Calculations<br/>• GHG Protocol Scopes 1-3<br/>• Aggregations<br/>• Uncertainty Analysis]

        REPORT[Reporting Service - 3006<br/>━━━━━━━━━━━━━━━━<br/>• Report Generation<br/>• PDF/Excel Export<br/>• Visualizations<br/>• Scheduled Reports]

        AUDIT[Audit Service - 3007<br/>━━━━━━━━━━━━━━━━<br/>• Audit Trail<br/>• Compliance Logging<br/>• Event Sourcing<br/>• Tamper-Proof Logs]
    end

    subgraph "Event Bus"
        KAFKA[Apache Kafka<br/>- Event Streaming<br/>- Pub/Sub<br/>- Event Replay]
    end

    subgraph "Databases - Phase 1"
        MONGO_ID[(MongoDB<br/>clenergize_identity)]
        MONGO_ORG[(MongoDB<br/>clenergize_organization)]
        MONGO_REF[(MongoDB<br/>clenergize_reference)]
        MONGO_ACT[(MongoDB<br/>clenergize_activity)]
        MONGO_CALC[(MongoDB<br/>clenergize_calculation)]
        MONGO_REP[(MongoDB<br/>clenergize_reporting)]
        MONGO_AUD[(MongoDB<br/>clenergize_audit)]
    end

    subgraph "Caching & Sessions"
        REDIS[(Redis<br/>- Session Store<br/>- Cache<br/>- Rate Limiting)]
    end

    %% User flow
    USER --> GATEWAY
    MOBILE --> GATEWAY
    API_CLIENT --> GATEWAY

    %% Gateway routing
    GATEWAY -->|/api/v1/auth| IDENTITY
    GATEWAY -->|/api/v1/organizations| ORG
    GATEWAY -->|/api/v1/activity| ACTIVITY
    GATEWAY -->|/api/v1/reports| REPORT

    %% Service to service (internal /v1/*)
    ACTIVITY -->|Activity Data| CALC
    CALC -->|Emissions Calculated| REPORT
    ORG -->|Hierarchy Data| CALC
    REF -->|Emission Factors| CALC

    %% Event publishing
    IDENTITY -->|UserCreated| KAFKA
    ORG -->|ProjectCreated| KAFKA
    ACTIVITY -->|DataIngested| KAFKA
    CALC -->|EmissionCalculated| KAFKA
    REPORT -->|ReportGenerated| KAFKA

    %% Event subscriptions
    KAFKA -->|UserEvents| AUDIT
    KAFKA -->|OrgEvents| AUDIT
    KAFKA -->|ActivityEvents| AUDIT
    KAFKA -->|CalcEvents| REPORT
    KAFKA -->|AllEvents| AUDIT

    %% Database connections
    IDENTITY -.-> MONGO_ID
    ORG -.-> MONGO_ORG
    REF -.-> MONGO_REF
    ACTIVITY -.-> MONGO_ACT
    CALC -.-> MONGO_CALC
    REPORT -.-> MONGO_REP
    AUDIT -.-> MONGO_AUD

    %% Redis connections
    IDENTITY -.-> REDIS
    GATEWAY -.-> REDIS
    CALC -.-> REDIS

    style GATEWAY fill:#ff6b6b,stroke:#333,stroke-width:4px
    style KAFKA fill:#ffd93d,stroke:#333,stroke-width:3px
    style IDENTITY fill:#4ecdc4
    style ORG fill:#4ecdc4
    style REF fill:#4ecdc4
    style ACTIVITY fill:#4ecdc4
    style CALC fill:#4ecdc4
    style REPORT fill:#4ecdc4
    style AUDIT fill:#4ecdc4
```

---

## Phase 2: Strategic ESG Services

### Phase 2 Architecture (Ports 3008-3010, 3037-3044)

```mermaid
graph TB
    subgraph "Phase 2 Services - Strategic ESG"
        NOTIF[Notification Service - 3008<br/>━━━━━━━━━━━━━━━━<br/>• Multi-channel<br/>Email, SMS, Push<br/>• Template Management<br/>• Delivery Tracking]

        WORKFLOW[Workflow Service - 3009<br/>━━━━━━━━━━━━━━━━<br/>• Temporal Integration<br/>• Approval Workflows<br/>• Data Collection<br/>• Business Processes]

        INTEG[Integration Service - 3010<br/>━━━━━━━━━━━━━━━━<br/>• ERP Connectors SAP, Oracle<br/>• HRIS Workday, SF<br/>• Data Sync Engine<br/>• Custom Connectors]

        POLICY[Policy Service - 3037<br/>━━━━━━━━━━━━━━━━<br/>• Policy Lifecycle<br/>• Attestation<br/>• Compliance Tracking<br/>• Version Control]

        STAKE[Stakeholder Service - 3038<br/>━━━━━━━━━━━━━━━━<br/>• Stakeholder Registry<br/>• Engagement Platform<br/>• Surveys & Interviews<br/>• AA1000 Standard]

        MATER[Materiality Service - 3041<br/>━━━━━━━━━━━━━━━━<br/>• Double Materiality<br/>• SASB Topics<br/>• Stakeholder Input<br/>• CSRD ESRS Compliance]

        STRAT[Strategy Service - 3042<br/>━━━━━━━━━━━━━━━━<br/>• ESG Strategy<br/>• SBTi Targets<br/>• KPI Library 500+<br/>• Initiative Tracking]

        REPORT2[Reporting Enhanced - 3044<br/>━━━━━━━━━━━━━━━━<br/>• 15+ Frameworks<br/>GRI, SASB, TCFD, CDP<br/>• XBRL Export<br/>• Assurance Readiness]
    end

    subgraph "Supporting Infrastructure"
        TEMPORAL[Temporal<br/>Workflow Engine<br/>PostgreSQL Backend]
        SENDGRID[SendGrid<br/>Email Provider]
        TWILIO[Twilio<br/>SMS Provider]
        SURVEY[Survey Platform<br/>Qualtrics]
    end

    subgraph "External Systems"
        SAP[SAP S/4HANA]
        ORACLE[Oracle ERP Cloud]
        WORKDAY[Workday HCM]
        SF[SuccessFactors]
    end

    subgraph "Databases - Phase 2"
        MONGO_NOT[(MongoDB<br/>notifications)]
        MONGO_POL[(MongoDB<br/>policies)]
        MONGO_STK[(MongoDB<br/>stakeholders)]
        MONGO_MAT[(MongoDB<br/>materiality)]
        MONGO_STR[(MongoDB<br/>strategy)]
        PG_TEMP[(PostgreSQL<br/>Temporal workflows)]
    end

    %% Workflow engine connection
    WORKFLOW -.-> TEMPORAL
    TEMPORAL -.-> PG_TEMP

    %% Notification providers
    NOTIF --> SENDGRID
    NOTIF --> TWILIO

    %% Integration connectors
    INTEG --> SAP
    INTEG --> ORACLE
    INTEG --> WORKDAY
    INTEG --> SF

    %% Stakeholder engagement
    STAKE --> SURVEY

    %% Service dependencies
    POLICY --> WORKFLOW
    STAKE --> NOTIF
    MATER --> STAKE
    STRAT --> MATER
    STRAT --> REPORT2

    %% Database connections
    NOTIF -.-> MONGO_NOT
    POLICY -.-> MONGO_POL
    STAKE -.-> MONGO_STK
    MATER -.-> MONGO_MAT
    STRAT -.-> MONGO_STR

    style WORKFLOW fill:#f9ca24,stroke:#333,stroke-width:3px
    style TEMPORAL fill:#6c5ce7,stroke:#333,stroke-width:3px
    style REPORT2 fill:#00b894,stroke:#333,stroke-width:3px
```

---

## Phase 3: Environmental Services

### Phase 3 Architecture (Ports 3012-3020)

```mermaid
graph TB
    subgraph "Phase 3 Services - Environmental"
        WATER[Water Service - 3012<br/>━━━━━━━━━━━━━━━━<br/>• Multi-source Tracking<br/>• WRI Aqueduct<br/>• CDP Water<br/>• 1M+ IoT Readings/day]

        WASTE[Waste Service - 3013<br/>━━━━━━━━━━━━━━━━<br/>• Waste Streams<br/>• Circular Economy<br/>• MCI Calculation<br/>• Zero Waste Cert]

        BIO[Biodiversity Service - 3014<br/>━━━━━━━━━━━━━━━━<br/>• TNFD LEAP<br/>• SBTN Targets<br/>• IBAT Integration<br/>• Species Tracking]

        ENERGY[Energy Service - 3015<br/>━━━━━━━━━━━━━━━━<br/>• Energy Consumption<br/>• RE100 Tracking<br/>• ISO 50001<br/>• Renewable %]

        POLL[Pollution Service - 3016<br/>━━━━━━━━━━━━━━━━<br/>• Air Quality NOx, SOx<br/>• Water Pollutants<br/>• CEMS Integration<br/>• EPA TRI]

        RES[Resource Service - 3017<br/>━━━━━━━━━━━━━━━━<br/>• Critical Minerals<br/>• Conflict Minerals<br/>• Material Circularity<br/>• Responsible Sourcing]

        CLIMATE[Climate Risk - 3018<br/>━━━━━━━━━━━━━━━━<br/>• TCFD Framework<br/>• Physical + Transition<br/>• NGFS Scenarios<br/>• Financial Impact]

        GREEN[Green Finance - 3019<br/>━━━━━━━━━━━━━━━━<br/>• Green Bonds GBP<br/>• SLL Tracking<br/>• EU Taxonomy<br/>• Impact Reporting]

        ENV_SC[Env Supply Chain - 3020<br/>━━━━━━━━━━━━━━━━<br/>• Scope 3 Upstream<br/>• Supplier Performance<br/>• Green Procurement<br/>• Multi-tier Mapping]
    end

    subgraph "External Environmental Data"
        WRI[WRI Aqueduct<br/>Water Stress API]
        IBAT[IBAT<br/>Biodiversity Data]
        IUCN[IUCN Red List<br/>Species Status]
        NGFS[NGFS<br/>Climate Scenarios]
        SENTINEL[Sentinel Hub<br/>Satellite Imagery]
    end

    subgraph "IoT & Real-time Data"
        WATER_METERS[Smart Water Meters]
        ENERGY_METERS[Smart Energy Meters]
        CEMS[CEMS<br/>Continuous Emission<br/>Monitoring Systems]
        SCADA[SCADA Systems<br/>Industrial Control]
    end

    subgraph "Specialized Databases"
        INFLUX[(InfluxDB<br/>Time-series Data<br/>IoT Readings)]
        NEO4J_ENV[(Neo4j<br/>Supply Chain Graph<br/>Multi-tier Suppliers)]
        MONGO_ENV[(MongoDB<br/>Environmental Data)]
    end

    %% External API connections
    WATER --> WRI
    BIO --> IBAT
    BIO --> IUCN
    CLIMATE --> NGFS
    BIO --> SENTINEL

    %% IoT connections
    WATER --> WATER_METERS
    ENERGY --> ENERGY_METERS
    POLL --> CEMS
    ENERGY --> SCADA

    %% Time-series data
    WATER -.-> INFLUX
    ENERGY -.-> INFLUX
    POLL -.-> INFLUX

    %% Graph database
    ENV_SC -.-> NEO4J_ENV
    CLIMATE -.-> NEO4J_ENV

    %% Document database
    WASTE -.-> MONGO_ENV
    RES -.-> MONGO_ENV
    GREEN -.-> MONGO_ENV

    %% Service dependencies
    CLIMATE --> WATER
    CLIMATE --> ENERGY
    GREEN --> CLIMATE

    style INFLUX fill:#e74c3c,stroke:#333,stroke-width:3px
    style NEO4J_ENV fill:#9b59b6,stroke:#333,stroke-width:3px
    style CLIMATE fill:#e67e22,stroke:#333,stroke-width:3px
```

---

## Phase 4: Social Services

### Phase 4 Architecture (Ports 3021-3030)

```mermaid
graph TB
    subgraph "Phase 4 Services - Social"
        WORK[Workforce Service - 3021<br/>━━━━━━━━━━━━━━━━<br/>• Demographics ANON<br/>• Talent Management<br/>• Engagement Surveys<br/>• ZERO PII Storage]

        SAFETY[Safety Service - 3022<br/>━━━━━━━━━━━━━━━━<br/>• OSHA 300 Log<br/>• TRIR Calculation<br/>• Incident Management<br/>• ISO 45001]

        LABOR[Labor Service - 3023<br/>━━━━━━━━━━━━━━━━<br/>• Living Wage<br/>• ILO Conventions<br/>• Freedom of Association<br/>• Grievance Mechanisms]

        COMM[Community Service - 3024<br/>━━━━━━━━━━━━━━━━<br/>• FPIC Process<br/>• Indigenous Rights<br/>• Local Impact<br/>• IFC PS7]

        PROD[Product Service - 3025<br/>━━━━━━━━━━━━━━━━<br/>• Product Safety<br/>• Customer Privacy<br/>• Greenwashing Detection<br/>• RoHS, REACH]

        SOC_SC[Social Supply Chain - 3026<br/>━━━━━━━━━━━━━━━━<br/>• Modern Slavery<br/>• Social Audits<br/>• Multi-tier Mapping<br/>• UK MSA Statement]

        HR[Human Rights - 3027<br/>━━━━━━━━━━━━━━━━<br/>• UNGPs Framework<br/>• Salient Issues<br/>• HRIA<br/>• Remedy Mechanisms]

        DIV[Diversity Service - 3028<br/>━━━━━━━━━━━━━━━━<br/>• DEI Metrics<br/>• Pay Equity k=10<br/>• Board Diversity<br/>• Intersectionality]

        WELL[Wellbeing Service - 3029<br/>━━━━━━━━━━━━━━━━<br/>• Mental Health<br/>• EAP Integration<br/>• Burnout Screening<br/>• HIPAA Compliance]

        TRAIN[Training Service - 3030<br/>━━━━━━━━━━━━━━━━<br/>• Training Catalog<br/>• Skills Development<br/>• ISO 9001/45001<br/>• Aggregated Data Only]
    end

    subgraph "HRIS Integration"
        WORKDAY_HCM[Workday HCM]
        SAP_SF[SAP SuccessFactors]
        BAMBOO[BambooHR]
    end

    subgraph "External Social Data"
        MIT_WAGE[MIT Living Wage<br/>Calculator]
        WAGE_IND[WageIndicator]
        SEDEX[Sedex<br/>Social Audits]
        ECOVADIS[EcoVadis<br/>Supplier CSR]
        WALK_FREE[Walk Free<br/>Slavery Index]
    end

    subgraph "Privacy-First Architecture"
        ANON[Anonymization Layer<br/>k-anonymity Enforcement<br/>ZERO PII Storage]
        ENCRYPT[Field-Level Encryption<br/>AES-256<br/>Compensation, Health Data]
    end

    subgraph "Databases - Phase 4"
        MONGO_SOC[(MongoDB<br/>Social Data<br/>Encrypted, Anonymized)]
        NEO4J_SOC[(Neo4j<br/>Supply Chain Graph<br/>Modern Slavery Risk)]
    end

    %% HRIS connections (ANONYMIZED data only)
    WORK --> ANON
    ANON --> WORKDAY_HCM
    ANON --> SAP_SF
    ANON --> BAMBOO

    %% Pay equity (encrypted)
    DIV --> ENCRYPT
    ENCRYPT --> WORKDAY_HCM

    %% External data sources
    LABOR --> MIT_WAGE
    LABOR --> WAGE_IND
    SOC_SC --> SEDEX
    SOC_SC --> ECOVADIS
    SOC_SC --> WALK_FREE

    %% Graph database (multi-tier suppliers)
    SOC_SC -.-> NEO4J_SOC
    HR -.-> NEO4J_SOC

    %% Document database
    WORK -.-> MONGO_SOC
    SAFETY -.-> MONGO_SOC
    DIV -.-> MONGO_SOC

    %% Service dependencies
    DIV --> WORK
    WELL --> WORK
    SOC_SC --> HR

    style ANON fill:#e74c3c,stroke:#333,stroke-width:4px
    style ENCRYPT fill:#c0392b,stroke:#333,stroke-width:4px
    style SOC_SC fill:#e67e22,stroke:#333,stroke-width:3px
```

---

## Phase 5: Governance Services

### Phase 5 Architecture (Ports 3031-3036, 3039-3040)

```mermaid
graph TB
    subgraph "Phase 5 Services - Governance"
        BOARD[Board Service - 3031<br/>━━━━━━━━━━━━━━━━<br/>• Board Composition<br/>• ESG Oversight<br/>• Nasdaq Diversity<br/>• CEO Pay Ratio]

        ETHICS[Ethics Service - 3032<br/>━━━━━━━━━━━━━━━━<br/>• Code of Conduct<br/>• Ethics Hotline<br/>• Anti-corruption<br/>• ISO 37001]

        RISK[Risk Service - 3033<br/>━━━━━━━━━━━━━━━━<br/>• COSO ERM<br/>• Risk Register 30+<br/>• Monte Carlo 100K<br/>• Three Lines of Defense]

        PRIV[Privacy Service - 3034<br/>━━━━━━━━━━━━━━━━<br/>• GDPR Art. 30 ROPA<br/>• DSR Management<br/>• Breach <72hr<br/>• ISO 27701]

        CYBER[Cybersecurity - 3035<br/>━━━━━━━━━━━━━━━━<br/>• NIST CSF<br/>• Incident Response<br/>• SEC Disclosure<br/>• CVSS 3.1]

        CONDUCT[Business Conduct - 3036<br/>━━━━━━━━━━━━━━━━<br/>• Anti-competitive<br/>• Lobbying, Tax<br/>• CbCR OECD BEPS<br/>• Sanctions OFAC]

        TRANS[Transparency - 3039<br/>━━━━━━━━━━━━━━━━<br/>• Disclosure Management<br/>• Assurance ISAE 3000<br/>• Data Lineage Neo4j<br/>• Transparency Index]

        CONTROL[Controls Service - 3040<br/>━━━━━━━━━━━━━━━━<br/>• COSO 2013<br/>• SOX 404<br/>• Continuous Monitoring<br/>• Material Weakness]
    end

    subgraph "Security Infrastructure"
        SIEM[SIEM<br/>Splunk/QRadar<br/>Security Monitoring]
        VULN[Vulnerability Scanner<br/>Nessus/Qualys]
        EDR[EDR Platform<br/>CrowdStrike]
    end

    subgraph "Compliance Tools"
        HOTLINE[Ethics Hotline<br/>Navex/EthicsPoint<br/>Anonymous, Encrypted]
        DPO[Data Protection Officer<br/>Legal Counsel]
        ASSURANCE[Assurance Providers<br/>Big 4<br/>ISAE 3000/3410]
    end

    subgraph "External Compliance Data"
        OFAC_API[OFAC Sanctions<br/>Real-time API]
        UN_SANCTIONS[UN Sanctions List]
        EU_SANCTIONS[EU Sanctions List]
    end

    subgraph "Databases - Phase 5"
        MONGO_GOV[(MongoDB<br/>Governance Data)]
        NEO4J_GOV[(Neo4j<br/>Data Lineage Graph<br/>Disclosure → Evidence)]
        PG_CONTROL[(PostgreSQL<br/>SOX Controls<br/>Audit Trails)]
    end

    %% Cybersecurity integrations
    CYBER --> SIEM
    CYBER --> VULN
    CYBER --> EDR

    %% Ethics hotline
    ETHICS --> HOTLINE

    %% Privacy compliance
    PRIV --> DPO

    %% Transparency assurance
    TRANS --> ASSURANCE

    %% Sanctions screening
    CONDUCT --> OFAC_API
    CONDUCT --> UN_SANCTIONS
    CONDUCT --> EU_SANCTIONS

    %% Graph database (data lineage)
    TRANS -.-> NEO4J_GOV

    %% Document database
    BOARD -.-> MONGO_GOV
    ETHICS -.-> MONGO_GOV
    RISK -.-> MONGO_GOV
    PRIV -.-> MONGO_GOV

    %% Relational database (SOX controls)
    CONTROL -.-> PG_CONTROL

    %% Service dependencies
    RISK --> CONTROL
    PRIV --> ETHICS
    TRANS --> CONTROL

    style SIEM fill:#e74c3c,stroke:#333,stroke-width:3px
    style HOTLINE fill:#c0392b,stroke:#333,stroke-width:3px
    style NEO4J_GOV fill:#9b59b6,stroke:#333,stroke-width:3px
```

---

## Phase 6: Analytics & ML Services

### Phase 6 Architecture (Ports 3045-3050)

```mermaid
graph TB
    subgraph "Phase 6 Services - Analytics & ML"
        ANALYTICS[Analytics Service - 3045<br/>━━━━━━━━━━━━━━━━<br/>• 500+ ESG KPIs<br/>• Interactive Dashboards<br/>• ClickHouse OLAP<br/>• Custom Report Builder]

        ML[ML Service - 3046<br/>━━━━━━━━━━━━━━━━<br/>• Python/FastAPI<br/>• TensorFlow, PyTorch<br/>• NLP Greenwashing<br/>• Computer Vision]

        FORECAST[Forecast Service - 3047<br/>━━━━━━━━━━━━━━━━<br/>• Time Series ARIMA<br/>• SBTi Validation<br/>• Carbon Budget<br/>• MAPE <15%]

        SCENARIO[Scenario Service - 3048<br/>━━━━━━━━━━━━━━━━<br/>• Monte Carlo 10K<br/>• Climate Scenarios<br/>• What-If Analysis<br/>• Decarbonization Pathways]

        RATING[Rating Service - 3049<br/>━━━━━━━━━━━━━━━━<br/>• ESG Score 0-100<br/>• MSCI, CDP Methods<br/>• Peer Benchmarking<br/>• Controversy Tracking]

        INSIGHTS[Insights Service - 3050<br/>━━━━━━━━━━━━━━━━<br/>• Root Cause Analysis<br/>• GPT-4, Claude 2.1<br/>• NLG Automation<br/>• Recommendations]
    end

    subgraph "ML Infrastructure"
        MLFLOW[MLflow<br/>Model Registry<br/>Experiment Tracking]
        MINIO[MinIO/S3<br/>Model Storage<br/>Artifacts]
        GPU[GPU Cluster<br/>NVIDIA T4/A100<br/>Training]
        FEAST[Feast<br/>Feature Store<br/>Feature Serving]
    end

    subgraph "OLAP & Analytics"
        CLICK[(ClickHouse<br/>Columnar OLAP<br/><2s Queries<br/>Billions of Rows)]
        KAFKA_STREAM[Kafka Streams<br/>Real-time Analytics]
    end

    subgraph "External AI/ML Services"
        OPENAI[OpenAI API<br/>GPT-4 Turbo<br/>Natural Language]
        ANTHROPIC[Anthropic API<br/>Claude 2.1<br/>200K Context]
        SAGEMAKER[AWS SageMaker<br/>Model Training<br/>Deployment]
        VERTEX[Google Vertex AI<br/>AutoML<br/>Pipelines]
    end

    subgraph "ESG Data Sources"
        MSCI_API[MSCI ESG Ratings<br/>API]
        CDP_DATA[CDP Scores<br/>Public Data]
        SUSTAIN[Sustainalytics<br/>ESG Risk Ratings]
        BLOOMBERG[Bloomberg<br/>ESG Data]
    end

    %% ML infrastructure
    ML -.-> MLFLOW
    ML -.-> MINIO
    ML -.-> GPU
    ML -.-> FEAST

    %% OLAP analytics
    ANALYTICS -.-> CLICK
    ANALYTICS --> KAFKA_STREAM

    %% LLM APIs
    INSIGHTS --> OPENAI
    INSIGHTS --> ANTHROPIC

    %% Cloud ML platforms
    ML --> SAGEMAKER
    ML --> VERTEX

    %% ESG data providers
    RATING --> MSCI_API
    RATING --> CDP_DATA
    RATING --> SUSTAIN
    RATING --> BLOOMBERG

    %% Service dependencies
    FORECAST --> ML
    SCENARIO --> FORECAST
    INSIGHTS --> ANALYTICS
    INSIGHTS --> RATING

    %% Data aggregation (ALL services)
    ANALYTICS -.->|Aggregate Data| CLICK

    style CLICK fill:#e74c3c,stroke:#333,stroke-width:4px
    style ML fill:#2ecc71,stroke:#333,stroke-width:4px
    style INSIGHTS fill:#f39c12,stroke:#333,stroke-width:4px
    style OPENAI fill:#9b59b6,stroke:#333,stroke-width:3px
```

---

## Data Flow Architecture

### End-to-End Data Flow (User → Report)

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Gateway
    participant Identity
    participant Activity
    participant Calculation
    participant Kafka
    participant Reporting
    participant Analytics
    participant Insights

    User->>Gateway: POST /api/v1/activity/data<br/>(CSV upload)
    Gateway->>Identity: Verify JWT
    Identity-->>Gateway: Token valid
    Gateway->>Activity: Forward request
    Activity->>Activity: Validate data
    Activity->>Activity: Store activity data
    Activity->>Kafka: Publish DataIngested event
    Activity-->>User: Data uploaded (202 Accepted)

    Kafka->>Calculation: DataIngested event
    Calculation->>Reference: Get emission factors
    Reference-->>Calculation: Emission factors
    Calculation->>Calculation: Calculate emissions
    Calculation->>Calculation: Store emissions
    Calculation->>Kafka: Publish EmissionCalculated event

    Kafka->>Reporting: EmissionCalculated event
    Reporting->>Calculation: Get emissions data
    Calculation-->>Reporting: Emissions data
    Reporting->>Reporting: Generate report
    Reporting->>Kafka: Publish ReportGenerated event

    Kafka->>Analytics: EmissionCalculated event
    Analytics->>ClickHouse: Insert for OLAP
    ClickHouse-->>Analytics: Inserted

    User->>Gateway: GET /api/v1/reports/{id}
    Gateway->>Reporting: Get report
    Reporting-->>User: PDF/Excel report

    User->>Gateway: GET /api/v1/insights/recommendations
    Gateway->>Insights: Get AI insights
    Insights->>Analytics: Get historical data
    Analytics-->>Insights: Data trends
    Insights->>GPT-4: Generate recommendations
    GPT-4-->>Insights: AI recommendations
    Insights-->>User: Actionable insights
```

---

## Deployment Architecture

### AWS Cloud Deployment (Production)

```mermaid
graph TB
    subgraph "AWS Cloud - Production Environment"
        subgraph "Edge Layer"
            CF[CloudFront CDN<br/>Static Assets<br/>Next.js Frontend]
            R53[Route 53<br/>DNS<br/>Geo-routing]
        end

        subgraph "Load Balancing"
            ALB[Application Load Balancer<br/>HTTPS/TLS 1.3<br/>WAF Enabled]
        end

        subgraph "Compute Layer - ECS Fargate"
            ECS_CLUSTER[ECS Cluster<br/>Auto-scaling Groups]

            subgraph "Phase 1 Services (7)"
                ECS_P1[ECS Tasks<br/>Identity, Org, Ref<br/>Activity, Calc, Report, Audit]
            end

            subgraph "Phase 2 Services (8)"
                ECS_P2[ECS Tasks<br/>Notification, Workflow<br/>Integration, Policy, etc.]
            end

            subgraph "Phase 3 Services (9)"
                ECS_P3[ECS Tasks<br/>Water, Waste, Bio<br/>Energy, Poll, etc.]
            end

            subgraph "Phase 4 Services (10)"
                ECS_P4[ECS Tasks<br/>Workforce, Safety<br/>Labor, Community, etc.]
            end

            subgraph "Phase 5 Services (8)"
                ECS_P5[ECS Tasks<br/>Board, Ethics, Risk<br/>Privacy, Cyber, etc.]
            end

            subgraph "Phase 6 Services (6)"
                ECS_P6[ECS Tasks<br/>Analytics, ML<br/>Forecast, Insights, etc.]
            end
        end

        subgraph "Data Layer"
            DOCDB[(Amazon DocumentDB<br/>MongoDB-compatible<br/>Multi-AZ)]

            ELASTICACHE[(Amazon ElastiCache<br/>Redis-compatible<br/>Cluster Mode)]

            TIMESTREAM[(Amazon Timestream<br/>Time-series Data<br/>IoT Readings)]

            NEPTUNE[(Amazon Neptune<br/>Graph Database<br/>Supply Chain, Lineage)]

            RDS_PG[(Amazon RDS PostgreSQL<br/>Temporal Workflows<br/>SOX Controls)]
        end

        subgraph "Event Streaming"
            MSK[Amazon MSK<br/>Managed Kafka<br/>3+ Brokers]
        end

        subgraph "Object Storage"
            S3_DATA[(S3 Buckets<br/>• ML Models<br/>• Reports<br/>• Backups)]
        end

        subgraph "ML Infrastructure"
            SAGEMAKER_TRAIN[SageMaker Training<br/>GPU Instances<br/>Spot Instances]

            SAGEMAKER_DEPLOY[SageMaker Endpoints<br/>Real-time Inference<br/>Auto-scaling]
        end

        subgraph "Monitoring & Logging"
            CW[CloudWatch<br/>Metrics, Logs, Alarms]

            XRAY[X-Ray<br/>Distributed Tracing]

            CLOUDTRAIL[CloudTrail<br/>Audit Logs<br/>Compliance]
        end

        subgraph "Security"
            SECRETS[Secrets Manager<br/>Credentials<br/>API Keys]

            KMS[KMS<br/>Encryption Keys<br/>Field-level Encryption]

            WAF_SHIELD[WAF + Shield<br/>DDoS Protection<br/>Bot Detection]
        end
    end

    %% External connections
    Internet[Internet Users] --> R53
    R53 --> CF
    R53 --> ALB
    CF --> S3_DATA
    ALB --> ECS_CLUSTER

    %% ECS to databases
    ECS_P1 --> DOCDB
    ECS_P1 --> ELASTICACHE
    ECS_P2 --> RDS_PG
    ECS_P3 --> TIMESTREAM
    ECS_P3 --> NEPTUNE
    ECS_P4 --> NEPTUNE
    ECS_P5 --> NEPTUNE
    ECS_P6 --> S3_DATA

    %% Event streaming
    ECS_P1 --> MSK
    ECS_P2 --> MSK
    ECS_P6 --> MSK

    %% ML infrastructure
    ECS_P6 --> SAGEMAKER_TRAIN
    ECS_P6 --> SAGEMAKER_DEPLOY
    SAGEMAKER_TRAIN --> S3_DATA

    %% Monitoring
    ECS_CLUSTER --> CW
    ECS_CLUSTER --> XRAY
    ALB --> CW

    %% Security
    ECS_CLUSTER --> SECRETS
    DOCDB --> KMS
    S3_DATA --> KMS
    ALB --> WAF_SHIELD
    CloudTrail --> S3_DATA

    style CF fill:#ff6b6b,stroke:#333,stroke-width:3px
    style ALB fill:#f39c12,stroke:#333,stroke-width:3px
    style ECS_CLUSTER fill:#3498db,stroke:#333,stroke-width:3px
    style DOCDB fill:#27ae60,stroke:#333,stroke-width:3px
    style MSK fill:#e74c3c,stroke:#333,stroke-width:3px
```

---

## Database Architecture

### Multi-Database Strategy (5 Database Types)

```mermaid
graph TB
    subgraph "50 Microservices"
        SERVICES[All 50 Services<br/>Identity, Org, Activity<br/>Water, Safety, Risk<br/>Analytics, ML, etc.]
    end

    subgraph "MongoDB (Document Store)"
        MONGO_CLUSTER[(MongoDB Cluster<br/>Replica Set: 3 nodes<br/>━━━━━━━━━━━━━━━━)]

        subgraph "Databases (50 databases, 1 per service)"
            DB_IDENTITY[(clenergize_identity)]
            DB_ORG[(clenergize_organization)]
            DB_ACTIVITY[(clenergize_activity)]
            DB_CALC[(clenergize_calculation)]
            DB_WATER[(clenergize_water)]
            DB_WASTE[(clenergize_waste)]
            DB_SAFETY[(clenergize_safety)]
            DB_RISK[(clenergize_risk)]
            DB_MORE[(... 42 more databases ...)]
        end
    end

    subgraph "Redis (Cache & PubSub)"
        REDIS_CLUSTER[(Redis Cluster<br/>6 nodes 3 masters, 3 replicas<br/>━━━━━━━━━━━━━━━━)]

        subgraph "Redis Databases"
            REDIS_CACHE[(DB 0: Cache<br/>Session Store<br/>API Response Cache)]
            REDIS_PUBSUB[(DB 1: PubSub<br/>Real-time Notifications<br/>WebSocket Broadcast)]
            REDIS_QUEUE[(DB 2: Queue<br/>Background Jobs<br/>Rate Limiting)]
        end
    end

    subgraph "InfluxDB (Time-Series)"
        INFLUX[(InfluxDB 2.x<br/>━━━━━━━━━━━━━━━━)]

        subgraph "Measurements"
            INFLUX_WATER[Water IoT Readings<br/>1M+ points/day]
            INFLUX_ENERGY[Energy Meter Data<br/>500K+ points/day]
            INFLUX_POLL[CEMS Pollution Data<br/>100K+ points/day]
            INFLUX_METRICS[Service Metrics<br/>Prometheus-style]
        end
    end

    subgraph "Neo4j (Graph Database)"
        NEO4J[(Neo4j 5.x<br/>━━━━━━━━━━━━━━━━)]

        subgraph "Graph Models"
            GRAPH_SUPPLY[Supply Chain Graph<br/>Multi-tier Suppliers<br/>Modern Slavery Risk]
            GRAPH_LINEAGE[Data Lineage Graph<br/>Disclosure → Evidence<br/>Transparency]
            GRAPH_RISK[Risk Relationships<br/>Climate → Financial<br/>Cascading Risks]
        end
    end

    subgraph "ClickHouse (OLAP Analytics)"
        CLICKHOUSE[(ClickHouse Cluster<br/>4 shards, 2 replicas<br/>━━━━━━━━━━━━━━━━)]

        subgraph "Tables"
            CLICK_EMISSIONS[Emissions Fact Table<br/>Billions of rows<br/>Sub-second queries]
            CLICK_SOCIAL[Social Metrics<br/>Aggregated, Anonymized<br/>k-anonymity enforced]
            CLICK_GOVERNANCE[Governance Metrics<br/>Risk, Controls, Incidents]
        end
    end

    subgraph "PostgreSQL (Relational)"
        POSTGRES[(PostgreSQL 15<br/>━━━━━━━━━━━━━━━━)]

        subgraph "Schemas"
            PG_TEMPORAL[Temporal Workflows<br/>State Management<br/>Event History]
            PG_CONTROLS[SOX 404 Controls<br/>Control Matrix<br/>Test Results]
        end
    end

    %% MongoDB connections (each service has own database)
    SERVICES --> MONGO_CLUSTER
    MONGO_CLUSTER --> DB_IDENTITY
    MONGO_CLUSTER --> DB_ORG
    MONGO_CLUSTER --> DB_ACTIVITY
    MONGO_CLUSTER --> DB_MORE

    %% Redis connections (shared, separated by DB number)
    SERVICES --> REDIS_CLUSTER
    REDIS_CLUSTER --> REDIS_CACHE
    REDIS_CLUSTER --> REDIS_PUBSUB
    REDIS_CLUSTER --> REDIS_QUEUE

    %% InfluxDB connections (time-series services)
    SERVICES --> INFLUX
    INFLUX --> INFLUX_WATER
    INFLUX --> INFLUX_ENERGY
    INFLUX --> INFLUX_POLL

    %% Neo4j connections (graph services)
    SERVICES --> NEO4J
    NEO4J --> GRAPH_SUPPLY
    NEO4J --> GRAPH_LINEAGE

    %% ClickHouse connections (analytics)
    SERVICES --> CLICKHOUSE
    CLICKHOUSE --> CLICK_EMISSIONS
    CLICKHOUSE --> CLICK_SOCIAL

    %% PostgreSQL connections (specific services)
    SERVICES --> POSTGRES
    POSTGRES --> PG_TEMPORAL
    POSTGRES --> PG_CONTROLS

    style MONGO_CLUSTER fill:#4ecdc4,stroke:#333,stroke-width:3px
    style REDIS_CLUSTER fill:#e74c3c,stroke:#333,stroke-width:3px
    style INFLUX fill:#f39c12,stroke:#333,stroke-width:3px
    style NEO4J fill:#9b59b6,stroke:#333,stroke-width:3px
    style CLICKHOUSE fill:#e67e22,stroke:#333,stroke-width:3px
    style POSTGRES fill:#3498db,stroke:#333,stroke-width:3px
```

---

## Service Port Allocation

### Complete Port Mapping (Ports 3000-3050)

```mermaid
graph LR
    subgraph "API Gateway & Core - 3000-3007"
        P3000[3000: API Gateway<br/>Kong/NGINX]
        P3001[3001: Identity]
        P3002[3002: Organization]
        P3003[3003: Reference]
        P3004[3004: Activity]
        P3005[3005: Calculation]
        P3006[3006: Reporting]
        P3007[3007: Audit]
    end

    subgraph "Strategic ESG - 3008-3010, 3037-3044"
        P3008[3008: Notification]
        P3009[3009: Workflow]
        P3010[3010: Integration]
        P3037[3037: Policy]
        P3038[3038: Stakeholder]
        P3041[3041: Materiality]
        P3042[3042: Strategy]
        P3044[3044: Reporting Enhanced]
    end

    subgraph "Environmental - 3012-3020"
        P3012[3012: Water]
        P3013[3013: Waste]
        P3014[3014: Biodiversity]
        P3015[3015: Energy]
        P3016[3016: Pollution]
        P3017[3017: Resource]
        P3018[3018: Climate Risk]
        P3019[3019: Green Finance]
        P3020[3020: Env Supply Chain]
    end

    subgraph "Social - 3021-3030"
        P3021[3021: Workforce]
        P3022[3022: Safety]
        P3023[3023: Labor]
        P3024[3024: Community]
        P3025[3025: Product]
        P3026[3026: Social Supply Chain]
        P3027[3027: Human Rights]
        P3028[3028: Diversity]
        P3029[3029: Wellbeing]
        P3030[3030: Training]
    end

    subgraph "Governance - 3031-3036, 3039-3040"
        P3031[3031: Board]
        P3032[3032: Ethics]
        P3033[3033: Risk]
        P3034[3034: Privacy]
        P3035[3035: Cybersecurity]
        P3036[3036: Business Conduct]
        P3039[3039: Transparency]
        P3040[3040: Controls]
    end

    subgraph "Analytics & ML - 3045-3050"
        P3045[3045: Analytics]
        P3046[3046: ML Service]
        P3047[3047: Forecast]
        P3048[3048: Scenario]
        P3049[3049: Rating]
        P3050[3050: Insights FINAL!]
    end

    style P3000 fill:#ff6b6b,stroke:#333,stroke-width:4px
    style P3001 fill:#4ecdc4
    style P3005 fill:#4ecdc4
    style P3009 fill:#f9ca24
    style P3018 fill:#e67e22
    style P3026 fill:#e67e22
    style P3033 fill:#c0392b
    style P3046 fill:#2ecc71
    style P3050 fill:#f39c12,stroke:#333,stroke-width:4px
```

---

## Technology Stack Summary

### Complete Technology Matrix

| Layer | Technology | Purpose | Services Using |
|-------|------------|---------|----------------|
| **Frontend** | Next.js 14, React 18 | Web Application | All (API consumers) |
| **API Gateway** | Kong/NGINX | Routing, Auth, Rate Limiting | Port 3000 |
| **Backend Framework** | NestJS (TypeScript) | Microservices | 44 services |
| **ML Framework** | Python 3.11, FastAPI | Machine Learning | ML Service (3046) |
| **Document DB** | MongoDB 7.x | Primary data store | All 50 services (separate DBs) |
| **Cache** | Redis 7.x | Caching, PubSub, Sessions | All services |
| **Time-Series DB** | InfluxDB 2.x | IoT sensor data | Water, Energy, Pollution (3012, 3015, 3016) |
| **Graph DB** | Neo4j 5.x | Supply chain, Data lineage | Env SC (3020), Social SC (3026), Transparency (3039) |
| **OLAP DB** | ClickHouse | Analytics, OLAP queries | Analytics Service (3045) |
| **Relational DB** | PostgreSQL 15 | Temporal, SOX controls | Workflow (3009), Controls (3040) |
| **Event Streaming** | Apache Kafka / AWS MSK | Event-driven architecture | All services (pub/sub) |
| **Workflow Engine** | Temporal | Business process automation | Workflow Service (3009) |
| **ML Platform** | TensorFlow 2.14, PyTorch 2.1 | Deep learning models | ML Service (3046) |
| **ML Lifecycle** | MLflow | Model registry, tracking | ML Service (3046) |
| **LLM APIs** | OpenAI GPT-4, Anthropic Claude 2.1 | Natural language generation | Insights Service (3050) |
| **Object Storage** | AWS S3 / MinIO | ML models, reports, backups | All services |
| **Container** | Docker | Service packaging | All 50 services |
| **Orchestration** | Kubernetes / AWS ECS Fargate | Container orchestration | Production deployment |
| **IaC** | Terraform | Infrastructure as Code | All infrastructure |
| **CI/CD** | GitHub Actions, ArgoCD | Continuous deployment | All services |
| **Monitoring** | Prometheus, Grafana | Metrics, dashboards | All services |
| **Logging** | ELK Stack / AWS CloudWatch | Centralized logging | All services |
| **Tracing** | OpenTelemetry, Jaeger | Distributed tracing | All services |

---

## Performance Targets

### Service-Level Performance Requirements

| Service | Response Time (p95) | Throughput | Notes |
|---------|---------------------|------------|-------|
| API Gateway | <50ms | 10,000 req/s | Routing overhead only |
| Identity Service | <100ms | 5,000 req/s | JWT verification cached |
| Calculation Service | <200ms | 1,000 calc/s | Complex emission calculations |
| Reporting Service | <10s | 100 reports/s | Full sustainability report generation |
| Analytics Service | <2s | 500 dashboards/s | ClickHouse OLAP, 50+ widgets |
| ML Service (inference) | <100ms | 10,000 predictions/s | Batch: 1,000+ records/sec |
| Climate Risk Service | <30s | 10 simulations/s | Monte Carlo 100K iterations |
| Scenario Service | <30s | 10 scenarios/s | Monte Carlo 10K iterations |
| Insights Service (NLG) | <10s | 100 insights/s | GPT-4/Claude API latency |
| Notification Service | N/A | 100,000 notif/hr | Email, SMS, push delivery |
| Workflow Service | <500ms | 1,000 workflows/s | Temporal overhead |
| All Services (avg) | <200ms | Varies | 99.9% uptime SLA |

---

**Document Version**: 1.0.0
**Last Updated**: November 22, 2025
**Total Services Documented**: 50 microservices
**Total Diagrams**: 13 Mermaid diagrams
**Coverage**: Complete ESG Platform (Environmental, Social, Governance, Analytics/ML)

---

**Next Steps**:
1. Review diagrams with architecture team
2. Validate service dependencies (no circular dependencies)
3. Update deployment scripts with port allocations
4. Generate high-resolution images from Mermaid diagrams (PDF, PNG)
5. Include diagrams in technical presentations and documentation
