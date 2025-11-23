# Getting Started - Clenergize V3 ESG Platform

Welcome to the Clenergize V3 ESG Platform documentation!

## Quick Links

- [Platform Overview](01_Platform_Overview.md) - High-level system architecture
- [Quick Start Guide](02_Quick_Start_Guide.md) - Get up and running in 30 minutes
- [Architecture Summary](03_Architecture_Summary.md) - Detailed architecture documentation

## What is Clenergize V3?

Clenergize V3 is a comprehensive **Enterprise ESG Management Platform** that enables organizations to measure, manage, and report on their complete sustainability performance across Environmental, Social, and Governance dimensions.

### Key Features

- **Environmental**: Carbon, water, waste, biodiversity, energy, climate risk
- **Social**: Human capital, health & safety, labor rights, diversity, community impact
- **Governance**: Board governance, ethics, risk management, privacy, cybersecurity
- **Analytics**: ML/AI-powered insights, predictive modeling, benchmarking
- **Reporting**: Multi-framework reporting (GRI, SASB, TCFD, CDP, CSRD)

## Platform Architecture

- **50 Microservices** across 6 development phases
- **Multi-database** strategy (MongoDB, Redis, InfluxDB, Neo4j, ClickHouse)
- **Event-driven** architecture with Apache Kafka
- **Cloud-native** deployment on AWS (ECS Fargate + EKS)
- **Zero-trust** security with JWT/JWKS authentication

## Getting Started

### For Developers

1. Read the [Quick Start Guide](02_Quick_Start_Guide.md)
2. Set up your [Local Development Environment](../04-Development/01-Setup/04_Local_Development.md)
3. Review [Coding Standards](../04-Development/02-Standards/01_Coding_Standards.md)
4. Join the team Slack channel: #clenergize-rebuild

### For Project Managers

1. Review [Platform Overview](01_Platform_Overview.md)
2. Check [Delivery Timeline](../01-Current-Scope-Phase1/01-Overview/03_Delivery_Timeline.md)
3. Access [Jira Board](https://yourcompany.atlassian.net/jira/software/projects/CLNZ)

### For Security Reviewers

1. Read [Security Overview](../07-Security/01_Security_Overview.md)
2. Review [Compliance Requirements](../07-Security/08_Compliance_Requirements.md)
3. Check [Code Review Policy](../CODE_REVIEW_POLICY.md)

### For Operations Team

1. Review [Operational Overview](../10-Operations/01_Operational_Overview.md)
2. Check [Deployment Overview](../06-Deployment/01_Deployment_Overview.md)
3. Review [Disaster Recovery Plan](../06-Deployment/07_Disaster_Recovery.md)

## Documentation Structure

```
Docs/
├── 00-Getting-Started/          # Start here
├── 01-Current-Scope-Phase1/     # Phase 1 details
├── 02-Future-Phases/            # Phases 2-6 planning
├── 03-Architecture/             # Architecture diagrams
├── 04-Development/              # Development guides
├── 05-Testing/                  # Testing strategies
├── 06-Deployment/               # Deployment procedures
├── 07-Security/                 # Security & compliance
├── 08-Data/                     # Data models & schemas
├── 09-API/                      # API documentation
├── 10-Operations/               # Operations runbooks
└── 11-Governance/               # Project governance
```

## Current Project Status

**Phase**: Phase 1 - Foundation & Core Security
**Sprint**: Sprint 0.1 (of 6 sprints in Phase 1)
**Services**: 7 core microservices
**Timeline**: 12 weeks (6 × 2-week sprints)
**Team**: 7 developers + 30+ specialized Claude agents

## Support & Communication

- **Slack**: #clenergize-rebuild
- **Jira**: [CLNZ Project Board](https://yourcompany.atlassian.net/jira/software/projects/CLNZ)
- **GitHub**: [Repository](https://github.com/yourcompany/clenergize-v3-rebuild)
- **Confluence**: [Wiki](https://yourcompany.atlassian.net/wiki/spaces/CLNZ)

## Contributing

All code changes require:
1. Feature branch from `develop`
2. Pull request with completed template
3. Passing CI/CD tests (80% coverage minimum)
4. Human code review and approval
5. Merge by human reviewer (not self-merge)

See [Code Review Policy](../CODE_REVIEW_POLICY.md) for complete details.

---

**Last Updated**: November 22, 2025
**Version**: 2.0.0
**Next Review**: End of Sprint 0.1
