# Documentation Structure Guide for Claude Agents

**Purpose**: Guide for ALL Claude agents to understand which documentation folder to use
**Version**: 1.0.0
**Last Updated**: November 23, 2025

---

## Quick Decision Tree

**Question: What am I working on?**

- ✅ Current sprint tasks (Phase 1, 7 services)? → Use **CURRENT/** folder
- 📋 Future planning (Phases 2-6, 43+ services)? → Use **FUTURE/** folder
- 🔧 Development guides, testing, deployment? → Use **SHARED/** folder
- 📚 Event schemas, governance, historical docs? → Use **REFERENCE/** folder

---

## Folder Definitions

### CURRENT/ - Building NOW (Phase 1)

**Use this folder when**:
- Working on Sprint 0.1 through Sprint 1.4 tasks
- Implementing the 7 core services (Ports 3001-3007)
- Rebuilding functionality from OLD/ folder

**Examples**:
- ✅ Implement JWT authentication → CURRENT/Services/
- ✅ Sprint 0.1 task checklist → CURRENT/Sprints/

---

### FUTURE/ - Planning ONLY (Phases 2-6)

**⚠️ CRITICAL**: We are **NOT building** anything in FUTURE/ folder.

**Use this folder when**:
- Planning future ESG modules
- Designing 43+ additional microservices

**Examples**:
- ✅ Document water service spec → FUTURE/Services/
- ❌ Implement water service → WRONG! Not in scope

---

### SHARED/ - Applies to BOTH

**Use this folder when**:
- Writing development guides
- Creating testing documentation
- Documenting deployment procedures

**Examples**:
- ✅ Unit testing guide → SHARED/Testing/
- ✅ API naming conventions → SHARED/API/

---

### REFERENCE/ - Reference Materials

**Use this folder when**:
- Documenting event schemas
- Creating governance policies
- Archiving historical documents

---

## Common Mistakes

### Mistake 1: Future Services in CURRENT/
- ❌ WRONG: CURRENT/Services/water-service.md
- ✅ RIGHT: FUTURE/Services/water-service.md

### Mistake 2: Testing Guides in CURRENT/
- ❌ WRONG: CURRENT/Testing/unit-testing.md
- ✅ RIGHT: SHARED/Testing/02_Unit_Testing_Guide.md

---

**Last Updated**: November 23, 2025
