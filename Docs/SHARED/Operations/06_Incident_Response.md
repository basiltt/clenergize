# Incident Response Guide

> Procedures for handling production incidents in Clenergize V3.

---

## Overview

This document defines the incident response process for the Clenergize V3 platform, covering detection, classification, response, resolution, and post-incident activities.

---

## Incident Classification

### Severity Levels

| Level | Name | Description | Response Time | Examples |
|-------|------|-------------|---------------|----------|
| **SEV-1** | Critical | Platform down, data loss risk | 15 minutes | All services down, database corruption |
| **SEV-2** | High | Major feature broken, significant impact | 30 minutes | Auth failing, calculations broken |
| **SEV-3** | Medium | Feature degraded, workaround exists | 2 hours | Slow performance, minor feature broken |
| **SEV-4** | Low | Minor issue, minimal impact | 24 hours | UI glitch, non-critical bug |

### Impact Assessment

| Impact | Users Affected | Business Impact |
|--------|---------------|-----------------|
| Critical | All users | Revenue loss, compliance risk |
| High | >50% users | Significant productivity loss |
| Medium | <50% users | Moderate productivity loss |
| Low | Few users | Minimal impact |

---

## Incident Response Team

### Roles

| Role | Responsibility | On-Call |
|------|----------------|---------|
| **Incident Commander (IC)** | Coordinate response, communication | Rotating |
| **Technical Lead** | Drive technical resolution | On escalation |
| **DevOps Engineer** | Infrastructure actions | Primary on-call |
| **Developer** | Service-specific debugging | Service owner |
| **Communications** | Stakeholder updates | IC or delegate |

### On-Call Schedule

- **Primary**: DevOps Engineer (24/7)
- **Secondary**: Technical Lead (escalation)
- **Tertiary**: Service Owner (service-specific)

### Escalation Path

```
Alert Triggered
    │
    ▼
Primary On-Call (DevOps)
    │
    ├─── SEV-3/4 ──→ Create ticket, monitor
    │
    ├─── SEV-2 ──→ Page Technical Lead
    │
    └─── SEV-1 ──→ Page all responders
                   │
                   ▼
              Incident Commander takes over
```

---

## Incident Response Process

### Phase 1: Detection & Triage (0-15 min)

#### Detection Sources
- Monitoring alerts (Grafana, CloudWatch)
- User reports (support tickets)
- Automated health checks
- Log analysis (ELK/CloudWatch)

#### Initial Triage

1. **Acknowledge alert**
   - Confirm alert received
   - Assign initial responder

2. **Assess severity**
   - Determine impact scope
   - Classify severity level

3. **Declare incident (if SEV-1/2)**
   - Create incident channel
   - Notify stakeholders
   - Begin incident log

#### Incident Declaration Template

```
INCIDENT DECLARED

Severity: SEV-[X]
Service: [affected service]
Impact: [description of user impact]
Time detected: [timestamp]
Incident Commander: [name]

Status: INVESTIGATING

Updates will follow every [15/30] minutes.
```

### Phase 2: Investigation (15-60 min)

#### Investigation Checklist

- [ ] Check service health endpoints
- [ ] Review recent deployments
- [ ] Check infrastructure status
- [ ] Review error logs
- [ ] Check dependency health
- [ ] Review metrics dashboards

#### Common Investigation Commands

```bash
# Check service status
make status

# View service logs
docker logs clenergize-identity-service --tail 100

# Check MongoDB connection
docker exec -it clenergize-mongodb mongosh -u admin -p localdev123

# Check Redis
docker exec -it clenergize-redis redis-cli ping

# View all container status
docker ps -a | grep clenergize
```

#### Log Analysis

```bash
# Search for errors in last hour
grep -r "ERROR" /var/log/clenergize/ --include="*.log" | tail -100

# Search by correlation ID
grep "correlation-id-here" /var/log/clenergize/*.log
```

### Phase 3: Mitigation (ASAP)

#### Mitigation Options

| Option | When to Use | Risk |
|--------|-------------|------|
| Restart service | Transient issue | Low |
| Rollback deployment | Bad deployment | Medium |
| Scale up | Capacity issue | Low |
| Failover | Regional issue | Medium |
| Feature flag | Feature causing issue | Low |
| Block traffic | Attack/abuse | High |

#### Restart Service

```bash
make restart-service service=identity
```

#### Rollback Deployment

```bash
# Get previous deployment
kubectl rollout history deployment/identity-service

# Rollback
kubectl rollout undo deployment/identity-service

# Or specific revision
kubectl rollout undo deployment/identity-service --to-revision=2
```

#### Emergency Hotfix

If hotfix required:
1. Create branch from main: `hotfix/incident-XXX`
2. Apply minimal fix
3. Fast-track review (1 approval)
4. Deploy to production
5. Document in incident

### Phase 4: Resolution

#### Confirming Resolution

- [ ] Service health restored
- [ ] Error rates normalized
- [ ] User functionality verified
- [ ] Monitoring stable for 15+ minutes

#### Resolution Communication

```
INCIDENT RESOLVED

Severity: SEV-[X]
Service: [affected service]
Duration: [X hours Y minutes]
Resolution: [brief description]

Root Cause: [preliminary]
Impact: [users affected, data implications]

Full post-mortem to follow within 48 hours.
```

### Phase 5: Post-Incident

#### Timeline

| Activity | Deadline |
|----------|----------|
| Incident log complete | 24 hours |
| Post-mortem draft | 48 hours |
| Post-mortem review | 72 hours |
| Action items created | 72 hours |
| Follow-up complete | 2 weeks |

---

## Post-Mortem Process

### Post-Mortem Template

```markdown
# Incident Post-Mortem: [Title]

## Incident Summary
- **Date**: [YYYY-MM-DD]
- **Duration**: [X hours Y minutes]
- **Severity**: SEV-[X]
- **Services Affected**: [list]
- **Users Impacted**: [number/percentage]

## Timeline
| Time (UTC) | Event |
|------------|-------|
| HH:MM | [event] |
| HH:MM | [event] |

## Root Cause
[Detailed technical explanation of what caused the incident]

## Contributing Factors
1. [Factor 1]
2. [Factor 2]

## Impact
- Users affected: [number]
- Revenue impact: [if any]
- Data impact: [if any]

## What Went Well
- [Item 1]
- [Item 2]

## What Could Be Improved
- [Item 1]
- [Item 2]

## Action Items
| ID | Action | Owner | Due Date | Status |
|----|--------|-------|----------|--------|
| 1 | [action] | [name] | [date] | Open |

## Lessons Learned
[Key takeaways for the team]

## Appendix
- [Link to logs]
- [Link to metrics]
- [Link to Slack thread]
```

### Blameless Culture

Post-mortems focus on:
- Systems and processes, not individuals
- Learning and improvement
- Preventing recurrence
- Sharing knowledge

---

## Communication Templates

### Status Page Update

```
[Service Name] - [Status]

We are currently investigating [issue description].

Impact: [user impact]
Affected services: [list]

Last updated: [timestamp]
Next update: [expected time]
```

### Customer Communication (SEV-1/2)

```
Subject: Service Disruption Notice - [Brief Description]

Dear Customer,

We are aware of an issue affecting [service/feature]. Our team is actively working on resolution.

Current Status: [Investigating/Identified/Monitoring]
Estimated Resolution: [time if known]

We apologize for any inconvenience and will provide updates as they become available.

[Support contact information]
```

---

## Runbooks

### Common Incident Runbooks

| Incident Type | Runbook Location |
|---------------|------------------|
| Service Down | `/runbooks/service-down.md` |
| Database Issues | `/runbooks/database-issues.md` |
| High Latency | `/runbooks/high-latency.md` |
| Auth Failures | `/runbooks/auth-failures.md` |
| Memory Leak | `/runbooks/memory-leak.md` |
| Disk Full | `/runbooks/disk-full.md` |

### Service Down Runbook

```markdown
## Service Down

### Symptoms
- Health check failing
- 5xx errors increasing
- Service unreachable

### Quick Checks
1. Check container status: `docker ps | grep [service]`
2. Check logs: `docker logs clenergize-[service]`
3. Check dependencies (MongoDB, Redis)

### Resolution Steps
1. Attempt restart: `make restart-service service=[name]`
2. If restart fails, check logs for specific error
3. Check resource usage (memory, CPU)
4. Check recent deployments
5. If unresolved, rollback last deployment

### Escalation
If not resolved in 15 minutes, escalate to Technical Lead
```

---

## Monitoring & Alerting

### Key Metrics to Monitor

| Metric | Alert Threshold | Severity |
|--------|-----------------|----------|
| Service health | Unhealthy | SEV-1 |
| Error rate | >5% | SEV-2 |
| Latency p95 | >500ms | SEV-3 |
| CPU usage | >80% | SEV-3 |
| Memory usage | >85% | SEV-3 |
| Disk usage | >90% | SEV-2 |
| Queue depth | >1000 | SEV-3 |

### Alert Routing

| Alert Type | Route To |
|------------|----------|
| Infrastructure | DevOps on-call |
| Application | Service owner |
| Security | Security team |
| Database | DevOps + DB admin |

---

## Contact Information

### Emergency Contacts

| Role | Contact | Escalation Time |
|------|---------|-----------------|
| DevOps On-Call | [PagerDuty] | Immediate |
| Technical Lead | [Phone/Slack] | 15 min |
| Security Lead | [Phone/Slack] | 15 min (security) |
| Product Owner | [Email/Slack] | 30 min |

### External Contacts

| Service | Contact |
|---------|---------|
| AWS Support | [Support case] |
| MongoDB Atlas | [Support portal] |
| PagerDuty | [Admin dashboard] |

---

## Related Documents

- [Monitoring and Alerting](../Deployment/05_Monitoring_and_Alerting.md)
- [Circuit Breaker Patterns](./02_Circuit_Breaker_Patterns.md)
- [Service Health Checks](./05_Service_Health_Checks.md)
- [Disaster Recovery](../Deployment/07_Disaster_Recovery.md)
