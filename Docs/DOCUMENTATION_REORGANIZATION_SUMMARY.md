# Documentation Reorganization Summary

**Date**: November 23, 2025
**Reason**: Clearly separate Current Scope (rebuild OLD) vs Future Roadmap (complete ESG platform)

## Problem

Documentation was mixing:
- Current scope (7 services, 12 weeks) - WHAT WE'RE BUILDING NOW
- Future roadmap (43+ services, 15+ months) - WHAT WE MIGHT BUILD LATER

This caused confusion about what's actually in scope.

## Solution

Clear folder structure separating current vs future:

```
Docs/
├── README.md                          # Master navigation
├──
├── 01-Current-Scope-Phase1/           # WHAT WE'RE BUILDING NOW
│   ├── 01-Overview/                   # Current scope overview
│   ├── 02-Service-Specifications/     # 7 core services only
│   ├── 03-Architecture/               # Current architecture
│   └── 04-Sprint-Documentation/       # Sprint 0.1 to 1.4
│
├── 02-Future-Roadmap/                 # WHAT WE MIGHT BUILD LATER
│   ├── 01-Overview/                   # Future vision (NOT current scope)
│   ├── 02-Service-Specifications/     # 43+ future services
│   │   ├── Phase2-Extended/
│   │   ├── Phase3-Environmental/
│   │   ├── Phase4-Social/
│   │   ├── Phase5-Governance/
│   │   └── Phase6-Analytics/
│   └── 03-Architecture/               # Complete platform architecture
│
├── 03-Development/                    # Applies to all development
├── 04-Testing/                        # Applies to all testing
├── 05-Deployment/                     # Applies to all deployment
├── 06-Security/                       # Applies to all security
├── 07-Operations/                     # Applies to all operations
├── 08-Data/                           # Data models (current + future)
├── 09-API/                            # API standards
├── 10-Governance/                     # Project governance
└── 11-Archive/                        # Historical/deprecated docs
```

## Key Changes

### 1. Current Scope Folder (01-Current-Scope-Phase1/)

**What's Here**:
- Rebuilding OLD application
- 7 core microservices
- 12 weeks (6 sprints)
- Service specs for Phase 1 ONLY

**Clear Messaging**:
- "This is what we're building NOW"
- "This IS our current commitment"
- "Timeline: 12 weeks"

### 2. Future Roadmap Folder (02-Future-Roadmap/)

**What's Here**:
- Complete ESG platform vision
- 43+ additional services
- Phases 2-6 planning
- Service specs for future phases

**Clear Messaging**:
- "This is NOT current scope"
- "This is planning documentation only"
- "Decision point AFTER Phase 1"
- "No commitment to build this yet"

### 3. Shared Documentation (03-11/)

Applies to both current and future:
- Development guides
- Testing strategies
- Deployment procedures
- Security policies
- Operational runbooks

## Navigation Changes

### Before (Confusing):
"Check service specifications" → Which services? All 50? Just 7?

### After (Clear):
- Current scope → Check 01-Current-Scope-Phase1/02-Service-Specifications/
- Future planning → Check 02-Future-Roadmap/02-Service-Specifications/

## Key Documents Updated

1. **Docs/README.md**
   - Clear current vs future separation
   - Navigation by role (developer, PM, architect)

2. **01-Current-Scope-Phase1/01-Overview/01_Current_Scope_Overview.md**
   - CRYSTAL CLEAR: Only 7 services
   - Lists what's in scope
   - Lists what's OUT of scope (future)
   - FAQs addressing common confusions

3. **02-Future-Roadmap/01-Overview/01_Future_Vision.md**
   - BIG WARNING: NOT current scope
   - Decision point after Phase 1
   - No commitment yet
   - Planning documentation only

## Loose Files Cleanup

All loose .md files in Docs/ root will be moved to:
- 11-Archive/ - Historical documents
- Appropriate numbered folders - Active documents

## Benefits

1. **Clear Scope**: Everyone knows we're rebuilding OLD (7 services)
2. **Manage Expectations**: Future roadmap clearly marked as "not committed"
3. **Prevent Scope Creep**: "Is X in scope?" → Check 01-Current-Scope-Phase1/
4. **Better Planning**: Future roadmap separate, doesn't clutter current work
5. **Easier Onboarding**: New team members see "start here" vs "future planning"

## Migration Checklist

- [x] Create clear Docs/README.md
- [x] Update Current Scope Overview (crystal clear messaging)
- [x] Create Future Vision Overview (NOT current scope warning)
- [ ] Move Phase 2-6 service specs to 02-Future-Roadmap/
- [ ] Move loose .md files to appropriate folders or Archive
- [ ] Update .claude/CLAUDE.md to reference new structure
- [ ] Update team wiki links
- [ ] Announce reorganization in #clenergize-rebuild Slack

## Communication

**Message to Team**:
"Documentation reorganized to clearly separate:
- Current Scope (7 services, 12 weeks) → 01-Current-Scope-Phase1/
- Future Roadmap (43+ services, TBD) → 02-Future-Roadmap/

No change to what we're building, just clearer organization.
Start with Docs/README.md for navigation."

---

**Owner**: Documentation Team
**Approved By**: Tech Lead
**Effective Date**: November 23, 2025
