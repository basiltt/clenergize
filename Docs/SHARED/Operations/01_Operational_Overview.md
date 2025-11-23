# Operational Overview - Clenergize V3 ESG Platform

**Version**: 1.0.0
**Last Updated**: November 22, 2025
**On-Call**: 24/7 coverage
**SLA**: 99.9% uptime

## Service Ownership

Each microservice has a designated owner:
- identity-service: Backend Team Lead
- organization-service: Backend Team Lead
- reference-service: Backend Developer 1
- activity-service: Backend Developer 2
- calculation-service: Backend Developer 3
- reporting-service: Backend Developer 4
- audit-service: Security Engineer

## Monitoring Stack

- **Metrics**: CloudWatch + Datadog
- **Logs**: CloudWatch Logs + ELK
- **Traces**: AWS X-Ray
- **Uptime**: Pingdom
- **APM**: Datadog APM

## Alerting Rules

### P0 Critical (15 min response)
- Service down (health check failing)
- Error rate > 5% for 5 minutes
- Database connection failure
- Security breach

### P1 High (1 hour response)
- Error rate > 1% for 10 minutes
- Response time p95 > 500ms
- CPU > 80% for 15 minutes
- Memory > 85% for 15 minutes

### P2 Medium (4 hour response)
- Response time p95 > 300ms
- Disk space > 70%
- Failed backup
- Certificate expiring in 30 days

### P3 Low (next business day)
- Non-critical updates
- Documentation updates
- Performance optimization opportunities

## On-Call Rotation

**Schedule**: 1-week shifts, 24/7 coverage

Week 1: Backend Developer 1
Week 2: Backend Developer 2
Week 3: Backend Developer 3
Week 4: Backend Developer 4
Week 5: Backend Team Lead
Week 6: DevOps Engineer
Week 7: Security Engineer

**Responsibilities**:
- Respond to alerts within SLA
- Triage and resolve incidents
- Document incidents
- Participate in postmortems

## Incident Management

### Severity Levels
- P0: Critical - Service down (15 min)
- P1: High - Degraded service (1 hour)
- P2: Medium - Minor impact (4 hours)
- P3: Low - Informational (next business day)

### Response Workflow
1. Detection
2. Triage
3. Communication
4. Investigation
5. Mitigation
6. Resolution
7. Postmortem

## Deployment Process

### Windows
- Production: Tue-Thu, 10am-2pm EST
- Staging: Anytime
- Emergency: With approval

### Steps
1. Run tests (unit, integration, E2E)
2. Security scan
3. Deploy to staging
4. Smoke tests
5. Deploy to production
6. Monitor for 30 minutes
7. Verify health checks

### Rollback
- Assess impact (within 15 minutes)
- Revert to previous version
- Verify rollback
- Document root cause

## Service Level Objectives

- **Availability**: 99.9% uptime
- **Latency**: p95 < 200ms, p99 < 500ms
- **Error Rate**: < 0.1%
- **Data Durability**: 99.999999999%

## Monthly Costs

### AWS (~5,000 USD/month)
- ECS Fargate: 1,500
- MongoDB Atlas: 1,200
- Redis: 800
- S3 + CloudFront: 500
- Load Balancers: 400
- CloudWatch: 300
- Other: 300

### Third-Party (~1,500 USD/month)
- Datadog: 800
- Auth/Cognito: 300
- SendGrid: 200
- Other: 200

**Total**: ~6,500 USD/month

## Operational Metrics

**Daily Review**:
- Service health
- Error rates
- Latency
- Database performance

**Weekly Review**:
- SLO compliance
- Incident count
- Deployment frequency
- Cost variance

**Monthly Review**:
- Capacity planning
- SLO trends
- Cost optimization
- Team retrospective

---

**Operations Lead**: DevOps Engineer
**Next Review**: Monthly
