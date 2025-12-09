# Clenergize V3 Documentation

**Project**: Clenergize V3 Platform Rebuild
**Version**: 3.0.0
**Last Updated**: November 23, 2025

---

## Documentation Structure

This documentation uses a **4-folder structure** for maximum clarity:

```
Docs/
├── CURRENT/      ✅ Building NOW - Phase 1 (7 services, 12 weeks)
├── FUTURE/       📋 Planning ONLY - Phases 2-6 (43+ services, NOT building)
├── SHARED/       🔧 Applies to BOTH - Development guides, standards, testing
└── REFERENCE/    📚 Reference materials - Event schemas, governance, archive
```

---

## 📁 CURRENT/ - What We're Building NOW

**Scope**: Rebuilding the existing Clenergize carbon footprint app from OLD/ folder

**Contents**:
- **Overview/** - Current scope definition, timeline, deliverables
- **Services/** - 7 core microservice specifications (Ports 3001-3007)
- **Architecture/** - Current system architecture diagrams
- **Sprints/** - Sprint plans, task checklists, retrospectives  
- **Design/** - UI/UX designs for current scope

**Timeline**: 12 weeks (6 sprints × 2 weeks)

**Quick Links**:
- [Current Scope Overview](CURRENT/Overview/01_Current_Scope_Overview.md)
- [Service Specifications](CURRENT/Services/)
- [Sprint 0.1 Plan](CURRENT/Sprints/Sprint_0.1/)

---

## 📁 FUTURE/ - What We MIGHT Build Later

**Scope**: Complete ESG platform expansion (Environmental, Social, Governance)

**⚠️ IMPORTANT**: This is **PLANNING ONLY**. We are **NOT** building these services now.

**Contents**:
- **Overview/** - Future vision, roadmap, decision points
- **Services/** - 43+ additional microservice specifications (Phases 2-6)
- **Architecture/** - Complete platform architecture

**Timeline**: 15+ months AFTER Phase 1 completion (IF approved)

**Quick Links**:
- [Future Vision Overview](FUTURE/Overview/01_Future_Vision.md)
- [Future Service Specifications](FUTURE/Services/)

---

## 📁 SHARED/ - Applies to Both Current and Future

**Scope**: Development guides, standards, and best practices

**Contents**:
- **Getting-Started/** - Quick start, architecture summary, onboarding
- **Development/** - Setup, coding standards, POCs
- **Testing/** - Unit, integration, E2E testing guides
- **Deployment/** - Deployment procedures, CI/CD, infrastructure
- **Security/** - Security policies, compliance, authentication
- **Data/** - Data models, schemas, database patterns
- **API/** - API design, documentation standards
- **Operations/** - Monitoring, logging, incident response

**Quick Links**:
- [Quick Start Guide](SHARED/Getting-Started/02_Quick_Start_Guide.md)
- [Unit Testing Guide](SHARED/Testing/02_Unit_Testing_Guide.md)
- [Security Overview](SHARED/Security/01_Security_Overview.md)

---

## 📁 REFERENCE/ - Reference Materials

**Scope**: Supporting documentation and historical records

**Contents**:
- **Event-Schemas/** - Event schema registry, definitions
- **Governance/** - Code review policy, PR templates, CODEOWNERS
- **Archive/** - Historical documents, deprecated specs

---

## Quick Navigation

### For Developers (Current Sprint)
1. Start with [Quick Start Guide](SHARED/Getting-Started/02_Quick_Start_Guide.md)
2. Review [Current Scope Overview](CURRENT/Overview/01_Current_Scope_Overview.md)
3. Check [Sprint 0.1 Plan](CURRENT/Sprints/Sprint_0.1/)
4. Follow [Coding Standards](SHARED/Development/02-Standards/01_Coding_Standards.md)

### For Project Managers
1. Review [Current Scope Overview](CURRENT/Overview/01_Current_Scope_Overview.md)
2. Check [Delivery Timeline](CURRENT/Overview/03_Delivery_Timeline.md)
3. Browse [Future Vision](FUTURE/Overview/01_Future_Vision.md) (**planning only**)

### For Architects
1. Read [Architecture Summary](SHARED/Getting-Started/03_Architecture_Summary.md)
2. Review [Service Boundaries](CURRENT/Services/)
3. Check [Future Platform Architecture](FUTURE/Architecture/) (**planning only**)

### For Claude Agents
1. **ALWAYS** check [STRUCTURE_GUIDE.md](STRUCTURE_GUIDE.md) first
2. For current work → Use **CURRENT/** folder
3. For future planning → Use **FUTURE/** folder
4. For development guides → Use **SHARED/** folder

---

## Key Principles

### Current Scope (Phase 1)
✅ **Rebuild existing functionality** from OLD folder
✅ **Modern architecture** - Event-driven microservices
✅ **Security first** - Zero-trust, JWT/JWKS
✅ **Test coverage** - 80% minimum
✅ **Documentation** - Complete and up-to-date
✅ **Code review** - Mandatory human approval

### Future Roadmap (Phases 2-6)
📋 **Planned expansion** - Not in current scope
📋 **Complete ESG platform** - 50 total services
📋 **Advanced analytics** - ML/AI capabilities
📋 **Multi-framework reporting** - GRI, SASB, TCFD, CDP
📋 **Timeline** - 15+ months post-Phase 1
📋 **Status** - **PLANNING ONLY** - NOT building now

---

## Current Status

**Phase**: Phase 1 - Foundation & Core Security
**Sprint**: Sprint 0.1 (Week 1 of 12)
**Focus**: Local development environment setup
**Team**: 7 developers
**Story Points**: 55 SP this sprint, ~350 SP total Phase 1

---

## Support & Communication

- **Slack**: #clenergize-rebuild
- **Jira**: [CLNZ Project Board](https://yourcompany.atlassian.net/jira/software/projects/CLNZ)
- **GitHub**: [Repository](https://github.com/yourcompany/clenergize-v3-rebuild)
- **Questions**: Ask in #clenergize-rebuild or create Jira ticket

---

**Last Updated**: November 23, 2025
**Document Owner**: Tech Lead
**Next Review**: End of Sprint 0.1
