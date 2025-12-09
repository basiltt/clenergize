# Jira Structure Update - Clenergize V3 ESG Platform

**Purpose**: Organize Jira board with phase markers and dependencies
**Last Updated**: November 22, 2025

## Phase Organization

### Phase 1: Foundation (ACTIVE - Sprint 0.1 to 1.4)
**Label**: PHASE-1-FOUNDATION
**Epics**: 7 epics (CLNZ-100 to CLNZ-160)
**Services**: 7 core microservices (Ports 3001-3007)
**Story Points**: ~350 SP

### Phase 2: Extended Modules (FUTURE - Sprint 2.1 to 3.4)
**Label**: PHASE-2-EXTENDED, FUTURE-BACKLOG
**Epics**: 6 epics (CLNZ-200 to CLNZ-260)
**Modules**: 6 extended modules (Ports 3008-3010)
**Story Points**: ~240 SP

### Phase 3: Environmental Services (FUTURE - Sprint 4.1 to 6.3)
**Label**: PHASE-3-ENVIRONMENTAL, FUTURE-BACKLOG
**Epics**: 9 epics (CLNZ-300 to CLNZ-319)
**Services**: 9 environmental services (Ports 3011-3019)
**Story Points**: ~270 SP

### Phase 4: Social Services (FUTURE - Sprint 7.1 to 9.2)
**Label**: PHASE-4-SOCIAL, FUTURE-BACKLOG
**Epics**: 10 epics (CLNZ-400 to CLNZ-430)
**Services**: 10 social services (Ports 3021-3030)
**Story Points**: ~300 SP

### Phase 5: Governance Services (FUTURE - Sprint 10.1 to 11.4)
**Label**: PHASE-5-GOVERNANCE, FUTURE-BACKLOG
**Epics**: 8 epics (CLNZ-500 to CLNZ-538)
**Services**: 8 governance services (Ports 3031-3038)
**Story Points**: ~240 SP

### Phase 6: Analytics & ML (FUTURE - Sprint 12.1 to 15.0)
**Label**: PHASE-6-ANALYTICS, FUTURE-BACKLOG
**Epics**: 6 epics (CLNZ-600 to CLNZ-646)
**Services**: 6 analytics/ML services (Ports 3041-3046)
**Story Points**: ~270 SP

## Critical Path Dependencies

1. Identity Service (CLNZ-130) → Must be first
2. Reference Service (CLNZ-140) → Depends on Identity
3. Activity Service (CLNZ-150) → Depends on Reference
4. Calculation Service (CLNZ-160) → Depends on Activity
5. Reporting Service (CLNZ-170) → Depends on Calculation

## Jira Configuration Steps

### 1. Create Custom Labels
- PHASE-1-FOUNDATION
- PHASE-2-EXTENDED
- PHASE-3-ENVIRONMENTAL
- PHASE-4-SOCIAL
- PHASE-5-GOVERNANCE
- PHASE-6-ANALYTICS
- FUTURE-BACKLOG
- CRITICAL-PATH

### 2. Update Epic Labels
Add phase labels to each epic (46 total epics)

### 3. Create Board Filters
- Phase 1 Board: labels = PHASE-1-FOUNDATION
- Future Backlog: labels = FUTURE-BACKLOG
- All ESG Services: labels IN (PHASE-3, PHASE-4, PHASE-5)

### 4. Set Up Roadmap
- Phase 1: 6 sprints (12 weeks)
- Phase 2: 8 sprints (16 weeks)
- Phase 3: 9 sprints (18 weeks)
- Phase 4: 7 sprints (14 weeks)
- Phase 5: 6 sprints (12 weeks)
- Phase 6: 9 sprints (18 weeks)

**Total**: 45 sprints (90 weeks / 21 months)

## Summary

- **Total Epics**: 46 across 6 phases
- **Total Services**: 50 microservices
- **Total Sprints**: 45 sprints
- **Story Points**: ~1,850 SP
- **Current Focus**: Phase 1 (350 SP, 6 sprints)

This structure keeps the team focused on Phase 1 delivery while maintaining visibility into the complete ESG platform scope.
