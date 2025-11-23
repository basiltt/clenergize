# Clenergize V3 - Documentation Structure Guide

> **Version**: 1.0.0
> **Last Updated**: November 20, 2024
> **Purpose**: Guide to documentation organization for phased ESG platform development

## 📁 Documentation Folder Structure

```
Docs/
├── 📂 CURRENT-SCOPE/                    # Phase 1: Carbon Footprint Management (ACTIVE DEVELOPMENT)
│   ├── PHASE1_OVERVIEW.md              # Current scope summary and objectives
│   ├── PHASE1_SERVICE_ARCHITECTURE.md  # 7 services for carbon footprint
│   ├── PHASE1_DELIVERY_PLAN.md         # Sprint planning for current scope
│   ├── PHASE1_DATA_MODELS.md           # Data schemas for carbon services
│   ├── PHASE1_API_SPECIFICATIONS.md    # API contracts for current services
│   ├── PHASE1_TESTING_STRATEGY.md      # Testing approach for Phase 1
│   └── service-specs/                   # Current scope service specifications
│       ├── 01_Identity_Service.md
│       ├── 02_Organization_Service.md
│       ├── 03_Reference_Service.md
│       ├── 04_Activity_Service.md
│       ├── 05_Calculation_Service.md
│       ├── 06_Reporting_Service.md
│       └── 07_Audit_Service.md
│
├── 📂 FUTURE-ROADMAP/                   # Phases 2-6: Full ESG Platform (PLANNED)
│   ├── PLATFORM_ROADMAP_OVERVIEW.md    # Complete phased delivery plan
│   ├── FUTURE_SCOPE_SUMMARY.md         # Summary of all future phases
│   │
│   ├── 📂 Phase2-Strategic-ESG/        # Modules 3-8 (Months 5-8)
│   │   ├── PHASE2_OVERVIEW.md
│   │   ├── PHASE2_SERVICE_ARCHITECTURE.md
│   │   ├── PHASE2_JIRA_EPICS.md
│   │   └── service-specs/
│   │       ├── 41_Materiality_Service.md
│   │       ├── 42_Strategy_Service.md
│   │       ├── 43_Benchmark_Service.md
│   │       ├── 37_Policy_Service.md
│   │       ├── 38_Stakeholder_Service.md
│   │       └── 44_Reporting_Enhancement.md
│   │
│   ├── 📂 Phase3-Environmental/        # Environmental domain (Months 9-10)
│   │   ├── PHASE3_OVERVIEW.md
│   │   ├── PHASE3_SERVICE_ARCHITECTURE.md
│   │   └── service-specs/
│   │       ├── 12_Water_Service.md
│   │       ├── 13_Waste_Service.md
│   │       ├── 14_Biodiversity_Service.md
│   │       ├── 15_Energy_Service.md
│   │       ├── 16_Pollution_Service.md
│   │       ├── 17_Resource_Service.md
│   │       ├── 18_ClimateRisk_Service.md
│   │       ├── 19_GreenFinance_Service.md
│   │       └── 20_EnvironmentalSupplyChain_Service.md
│   │
│   ├── 📂 Phase4-Social/               # Social domain (Months 11-12)
│   │   ├── PHASE4_OVERVIEW.md
│   │   ├── PHASE4_SERVICE_ARCHITECTURE.md
│   │   └── service-specs/
│   │       ├── 21_Workforce_Service.md
│   │       ├── 22_Safety_Service.md
│   │       ├── 23_Labor_Service.md
│   │       ├── 24_Community_Service.md
│   │       ├── 25_Product_Service.md
│   │       ├── 26_SocialSupplyChain_Service.md
│   │       ├── 27_HumanRights_Service.md
│   │       ├── 28_Diversity_Service.md
│   │       ├── 29_Wellbeing_Service.md
│   │       └── 30_Training_Service.md
│   │
│   ├── 📂 Phase5-Governance/           # Governance domain (Months 13-14)
│   │   ├── PHASE5_OVERVIEW.md
│   │   ├── PHASE5_SERVICE_ARCHITECTURE.md
│   │   └── service-specs/
│   │       ├── 31_Board_Service.md
│   │       ├── 32_Ethics_Service.md
│   │       ├── 33_Risk_Service.md
│   │       ├── 34_Privacy_Service.md
│   │       ├── 35_Cybersecurity_Service.md
│   │       ├── 36_BusinessConduct_Service.md
│   │       ├── 39_Transparency_Service.md
│   │       └── 40_Controls_Service.md
│   │
│   └── 📂 Phase6-Advanced-Analytics/   # AI/ML & Analytics (Month 15+)
│       ├── PHASE6_OVERVIEW.md
│       ├── PHASE6_ML_STRATEGY.md
│       └── service-specs/
│           ├── 45_Analytics_Service.md
│           ├── 46_ML_Service.md
│           ├── 47_Forecast_Service.md
│           ├── 48_Scenario_Service.md
│           ├── 49_Rating_Service.md
│           └── 50_Insights_Service.md
│
├── 📂 SHARED/                           # Cross-cutting documentation (ALL PHASES)
│   ├── ARCHITECTURE/
│   │   ├── COMPLETE_PLATFORM_ARCHITECTURE.md    # All 50 services architecture
│   │   ├── DOMAIN_DRIVEN_DESIGN.md              # DDD patterns and bounded contexts
│   │   ├── SERVICE_COMMUNICATION_PATTERNS.md    # Inter-service communication
│   │   ├── EVENT_DRIVEN_ARCHITECTURE.md         # Event sourcing and CQRS
│   │   └── SCALABILITY_STRATEGY.md              # Performance and scaling patterns
│   │
│   ├── SECURITY/
│   │   ├── SECURITY_ARCHITECTURE.md             # Zero-trust security
│   │   ├── JWT_JWKS_IMPLEMENTATION.md           # Already exists
│   │   ├── SECURITY_THREAT_MODEL_STRIDE.md      # Already exists
│   │   ├── SECRETS_MANAGEMENT_STRATEGY.md       # Already exists
│   │   └── SECURITY_TESTING_CHECKLIST.md        # Already exists
│   │
│   ├── DATA/
│   │   ├── DATABASE_STRATEGY.md                 # Multi-database approach
│   │   ├── DATA_MODELS_ALL_DOMAINS.md          # Complete data models
│   │   ├── EVENT_SCHEMA_REGISTRY.md             # Already exists (200+ events)
│   │   ├── MONGODB_QUERY_OPTIMIZATION.md        # Already exists
│   │   └── DATA_MIGRATION_STRATEGY.md           # Migration patterns
│   │
│   ├── API/
│   │   ├── API_DESIGN_SPECIFICATION.md          # Already exists
│   │   ├── API_VERSIONING_STRATEGY.md           # Already exists
│   │   ├── REST_API_SPECIFICATION.md            # Already exists
│   │   └── GRAPHQL_FEDERATION.md                # For Phase 2+
│   │
│   ├── DEVOPS/
│   │   ├── CICD_PIPELINE_TEMPLATES.md           # Already exists
│   │   ├── INFRASTRUCTURE_AS_CODE.md            # Already exists
│   │   ├── DOCKER_COMPOSE_SETUP.md
│   │   ├── KUBERNETES_DEPLOYMENT.md             # For production
│   │   └── MONITORING_OBSERVABILITY.md          # Already exists
│   │
│   ├── TESTING/
│   │   ├── TESTING_STRATEGY_OVERVIEW.md
│   │   ├── CONTRACT_TESTING_GUIDE.md            # Already exists
│   │   ├── ACCESSIBILITY_TESTING.md             # Already exists
│   │   ├── PERFORMANCE_TESTING.md
│   │   └── SECURITY_TESTING.md
│   │
│   ├── QUALITY/
│   │   ├── CODE_REVIEW_POLICY.md                # Already exists
│   │   ├── DEFINITION_OF_DONE.md
│   │   ├── CODING_STANDARDS.md
│   │   └── TECHNICAL_DEBT_MANAGEMENT.md
│   │
│   └── PROCESSES/
│       ├── GIT_WORKFLOW.md                      # Already exists
│       ├── AGENT_COORDINATION_GUIDE.md          # Already exists
│       ├── OPUS_USAGE_GUIDE.md                  # Already exists
│       └── INCIDENT_RESPONSE.md
│
├── 📂 REFERENCE/                        # Industry standards and compliance
│   ├── ESG_FRAMEWORKS/
│   │   ├── GRI_STANDARDS_MAPPING.md
│   │   ├── SASB_STANDARDS_MAPPING.md
│   │   ├── TCFD_REQUIREMENTS.md
│   │   ├── CSRD_ESRS_COMPLIANCE.md
│   │   ├── CDP_QUESTIONNAIRES.md
│   │   └── UN_SDG_ALIGNMENT.md
│   │
│   ├── TECHNICAL_STANDARDS/
│   │   ├── GHG_PROTOCOL_IMPLEMENTATION.md
│   │   ├── ISO_14064_COMPLIANCE.md
│   │   ├── ISO_50001_ENERGY_MANAGEMENT.md
│   │   ├── ISO_45001_SAFETY.md
│   │   └── ISO_27001_SECURITY.md
│   │
│   └── INDUSTRY_BENCHMARKS/
│       ├── COMPETITOR_ANALYSIS.md
│       ├── FEATURE_COMPARISON.md
│       └── BEST_PRACTICES.md
│
├── 📂 JIRA/                             # Project management documentation
│   ├── JIRA_STRUCTURE_COMPLETE.md               # Already exists
│   ├── PHASE1_SPRINT_PLANNING.md                # Current scope sprints
│   ├── FUTURE_PHASES_BACKLOG.md                 # Phases 2-6 backlog
│   └── STORY_POINT_ESTIMATION_GUIDE.md
│
└── 📂 ARCHIVE/                          # Legacy and deprecated docs
    └── (Moved from Docs/archive/)
```

---

## 🎯 Documentation Usage Guide

### For Current Development (Phase 1)
**Start Here**: `CURRENT-SCOPE/PHASE1_OVERVIEW.md`

**Key Documents**:
1. `CURRENT-SCOPE/PHASE1_SERVICE_ARCHITECTURE.md` - What we're building now
2. `CURRENT-SCOPE/PHASE1_DELIVERY_PLAN.md` - Sprint planning
3. `CURRENT-SCOPE/service-specs/` - Detailed service specifications
4. `SHARED/ARCHITECTURE/COMPLETE_PLATFORM_ARCHITECTURE.md` - Full platform context
5. `SHARED/SECURITY/` - Security implementation guides

**Workflow**:
```bash
# Before starting a new service
1. Read: CURRENT-SCOPE/service-specs/{service}.md
2. Reference: SHARED/ARCHITECTURE/SERVICE_COMMUNICATION_PATTERNS.md
3. Follow: SHARED/QUALITY/CODE_REVIEW_POLICY.md
4. Test: SHARED/TESTING/TESTING_STRATEGY_OVERVIEW.md
```

### For Future Planning
**Start Here**: `FUTURE-ROADMAP/PLATFORM_ROADMAP_OVERVIEW.md`

**Key Documents**:
1. `FUTURE-ROADMAP/FUTURE_SCOPE_SUMMARY.md` - All future phases summary
2. `FUTURE-ROADMAP/Phase{N}-{Name}/PHASE{N}_OVERVIEW.md` - Phase-specific plans
3. `SHARED/ARCHITECTURE/COMPLETE_PLATFORM_ARCHITECTURE.md` - Full platform vision

**Workflow**:
```bash
# When planning a future phase
1. Review: FUTURE-ROADMAP/Phase{N}-{Name}/PHASE{N}_OVERVIEW.md
2. Check dependencies: FUTURE-ROADMAP/PLATFORM_ROADMAP_OVERVIEW.md
3. Review service specs: FUTURE-ROADMAP/Phase{N}-{Name}/service-specs/
4. Update JIRA: JIRA/FUTURE_PHASES_BACKLOG.md
```

### For Architecture Decisions
**Start Here**: `SHARED/ARCHITECTURE/COMPLETE_PLATFORM_ARCHITECTURE.md`

**Key Documents**:
1. All files in `SHARED/ARCHITECTURE/`
2. `ESG_PLATFORM_OVERVIEW.md` - Platform vision
3. `ESG_PLATFORM_GAP_ANALYSIS_AND_RECOMMENDATIONS.md` - Gap analysis

### For New Team Members
**Onboarding Path**:
1. Read: `ESG_PLATFORM_OVERVIEW.md` - Understand the vision
2. Read: `DOCUMENTATION_STRUCTURE.md` - This file
3. Read: `CURRENT-SCOPE/PHASE1_OVERVIEW.md` - Current scope
4. Read: `FUTURE-ROADMAP/PLATFORM_ROADMAP_OVERVIEW.md` - Full roadmap
5. Review: `SHARED/ARCHITECTURE/COMPLETE_PLATFORM_ARCHITECTURE.md`
6. Setup: `SHARED/DEVOPS/DOCKER_COMPOSE_SETUP.md`

---

## 📝 Documentation Standards

### Document Naming Convention
```yaml
Format: {PHASE}_{CATEGORY}_{NAME}.md

Examples:
  ✓ PHASE1_SERVICE_ARCHITECTURE.md
  ✓ PHASE2_OVERVIEW.md
  ✓ COMPLETE_PLATFORM_ARCHITECTURE.md
  ✗ phase-1-architecture.md
  ✗ service_architecture.md
```

### Service Specification Template
```yaml
Location: {PHASE_FOLDER}/service-specs/{NN}_{ServiceName}_Service.md

Required Sections:
  1. Overview (Purpose, Domain, Port)
  2. Core Features
  3. API Endpoints
  4. Data Models
  5. Events (Published/Consumed)
  6. Dependencies
  7. Non-Functional Requirements
  8. Testing Strategy
  9. Migration Strategy (if applicable)
  10. Future Enhancements
```

### Phase Overview Template
```yaml
Location: {PHASE_FOLDER}/PHASE{N}_OVERVIEW.md

Required Sections:
  1. Phase Objectives
  2. User Modules Covered
  3. Services Included
  4. Key Features
  5. Dependencies on Previous Phases
  6. Timeline & Story Points
  7. Success Criteria
  8. Risks & Mitigation
  9. Future Phase Dependencies
```

---

## 🔄 Document Lifecycle

### Creating New Documentation
```yaml
1. Identify Phase:
   - Current scope → CURRENT-SCOPE/
   - Future scope → FUTURE-ROADMAP/Phase{N}-{Name}/
   - Cross-cutting → SHARED/{Category}/

2. Use Template:
   - Copy from relevant template
   - Fill all required sections
   - Add to appropriate folder

3. Cross-Reference:
   - Link to related documents
   - Update index files
   - Update this DOCUMENTATION_STRUCTURE.md

4. Review:
   - Technical accuracy
   - Completeness
   - Consistency with other docs
```

### Updating Existing Documentation
```yaml
1. Version Control:
   - Update "Last Updated" date
   - Increment version if major change
   - Document changes in commit message

2. Impact Analysis:
   - Check for dependent documents
   - Update cross-references
   - Notify relevant agents/teams

3. Review Process:
   - Architecture review for ARCHITECTURE/ docs
   - Security review for SECURITY/ docs
   - All docs require peer review
```

### Archiving Documentation
```yaml
When to Archive:
  - Document superseded by newer version
  - Feature deprecated or removed
  - Technology replaced

Process:
  1. Move to ARCHIVE/ folder
  2. Add [DEPRECATED] prefix to filename
  3. Add deprecation notice at top of document
  4. Update references in other documents
  5. Keep for historical reference (don't delete)
```

---

## 📊 Documentation Metrics

### Completeness Tracking
```yaml
Current Scope (Phase 1):
  ☐ PHASE1_OVERVIEW.md
  ☐ PHASE1_SERVICE_ARCHITECTURE.md
  ☐ PHASE1_DELIVERY_PLAN.md
  ☐ Service specs: 7/7 completed
  ☐ API specifications complete
  ☐ Data models documented
  Target: 100% complete before development starts

Future Scope (Phases 2-6):
  ☐ All phase overviews created (5 phases)
  ☐ Service specs: 43/43 created
  ☐ Architecture diagrams for each domain
  ☐ Data models for all domains
  ☐ API contracts defined
  Target: 100% complete for planning purposes
```

### Quality Metrics
```yaml
Documentation Quality Checklist:
  ☐ Clear and concise writing
  ☐ All technical terms defined
  ☐ Diagrams and visuals included
  ☐ Code examples provided where relevant
  ☐ Cross-references accurate
  ☐ No broken links
  ☐ Follows naming conventions
  ☐ Version and date updated
```

---

## 🚀 Quick Reference

### Most Important Documents

**Starting Development**:
1. `CURRENT-SCOPE/PHASE1_OVERVIEW.md`
2. `CURRENT-SCOPE/service-specs/{service}.md`
3. `SHARED/SECURITY/JWT_JWKS_IMPLEMENTATION.md`
4. `.claude/CLAUDE.md` - Agent coordination

**Understanding Full Platform**:
1. `ESG_PLATFORM_OVERVIEW.md`
2. `SHARED/ARCHITECTURE/COMPLETE_PLATFORM_ARCHITECTURE.md`
3. `FUTURE-ROADMAP/PLATFORM_ROADMAP_OVERVIEW.md`

**Technical Implementation**:
1. `SHARED/ARCHITECTURE/SERVICE_COMMUNICATION_PATTERNS.md`
2. `SHARED/DATA/EVENT_SCHEMA_REGISTRY.md`
3. `SHARED/API/API_DESIGN_SPECIFICATION.md`
4. `SHARED/TESTING/TESTING_STRATEGY_OVERVIEW.md`

**Quality & Process**:
1. `SHARED/QUALITY/CODE_REVIEW_POLICY.md`
2. `SHARED/PROCESSES/GIT_WORKFLOW.md`
3. `SHARED/QUALITY/DEFINITION_OF_DONE.md`

---

## 📞 Documentation Support

### Questions About Documentation
- **Structure questions**: See this file
- **Current scope**: Check `CURRENT-SCOPE/`
- **Future planning**: Check `FUTURE-ROADMAP/`
- **Technical patterns**: Check `SHARED/ARCHITECTURE/`
- **Agent coordination**: Check `.claude/CLAUDE.md`

### Contributing to Documentation
1. Follow naming conventions
2. Use appropriate templates
3. Cross-reference related documents
4. Request review before merging
5. Update this structure guide if adding new categories

---

**Document Status**: ✅ ACTIVE
**Maintained By**: Architecture Agent + Master Coordinator
**Review Frequency**: Monthly or when structure changes
**Last Review**: November 20, 2024
