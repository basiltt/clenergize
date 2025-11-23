# Local Development Environment - Planning Updates

## Overview

This document summarizes all modifications made to the Clenergize V3 planning documents to adopt a local-first development approach using WSL2 + Docker Desktop instead of starting directly in AWS.

## Key Philosophy Change

### Original Approach
- Start development directly in AWS Dev environment
- Require AWS access from Day 1
- MongoDB Atlas setup in Sprint 0.1
- AWS VPC and networking as prerequisites

### New Approach
- **Local-first development** using WSL2 + Docker Desktop
- All services run in Docker Compose locally
- AWS infrastructure deferred to Sprint 0.2+
- Zero cloud dependencies for initial development

## Documents Updated

### 1. SPRINT_0.1_Task_Checklist.md
**Major Changes**:
- Title updated to "Security Foundation & Local Development"
- Added new story CLNZ-100: Local Docker Dev Cluster (8 points)
- Updated Pre-Sprint Setup to focus on WSL2 + Docker Desktop
- Deferred AWS VPC (CLNZ-111) to Sprint 0.2
- Deferred MongoDB Atlas (CLNZ-113) to Sprint 0.2
- Updated success criteria to prioritize local dev environment

**New Tasks Added**:
```yaml
Docker Compose Stack:
  - Docker Compose structure creation
  - Local MongoDB setup
  - LocalStack configuration for AWS simulation
  - Service Dockerization
  - Developer Makefile
```

### 2. PHASE7_Complete_Jira_Backlog.md
**Changes Made**:
- Added new Epic CLNZ-09: Local Development Environment (8 points)
- Added Story CLNZ-091: Docker Compose Development Stack
- Updated total points from 555 to 563
- Modified Sprint 0.1 allocation from 40 to 35 points
- Updated Sprint 0.2 to include deferred AWS infrastructure (45 points)

**Sprint Rebalancing**:
```yaml
Sprint 0.1 (35 points):
  - Docker Compose Stack: 8 pts (NEW)
  - JWT Verification: 8 pts
  - Secrets Management: 5 pts
  - Event Bus Client: 5 pts
  - GitHub Actions: 4 pts
  - Error Handling: 5 pts

Sprint 0.2 (45 points):
  - AWS VPC Setup: 8 pts (moved from 0.1)
  - ECS Setup: 5 pts (moved from 0.1)
  - MongoDB Atlas: 5 pts (moved from 0.1)
  - Plus original Sprint 0.2 work
```

### 3. ACTION_ITEMS_Next_Steps.md
**New Section Added**:
- Local Development Environment Setup guide
- WSL2 installation instructions
- Docker Desktop configuration
- VS Code Remote-WSL setup
- Updated Sprint 0.1 Kickoff Checklist

**Key Instructions**:
```bash
# Complete WSL2 + Docker Setup
wsl --install -d Ubuntu-22.04
# Configure Docker Desktop with WSL2 backend
# Install development tools in WSL2
# Single command startup: make up
```

## Technical Architecture

### Local Docker Compose Stack
```yaml
Services:
  - MongoDB: Single instance for all services
  - Redis: Single instance for caching
  - LocalStack: AWS services simulation
  - Identity Service: Port 3001
  - Organization Service: Port 3002
  - Reference Service: Port 3003
  - Activity Service: Port 3004
  - Calculation Service: Port 3005
  - Reporting Service: Port 3006
  - Audit Service: Port 3007
  - Frontend: Port 3000
  - Nginx: Port 80 (reverse proxy)
```

### Developer Experience Improvements
```makefile
# Simple commands for common operations
make up        # Start all services
make down      # Stop all services
make logs      # View all logs
make reset     # Clean reset
make seed      # Load test data
make test      # Run all tests
```

## Migration Path

### Phase 1: Local Development (Sprint 0.1)
- Set up WSL2 + Docker Desktop
- Create docker-compose.dev.yml
- Implement JWT security fixes
- All development happens locally

### Phase 2: AWS Foundation (Sprint 0.2)
- Set up AWS VPC and networking
- Configure MongoDB Atlas
- Create ECS clusters
- Maintain local dev as primary

### Phase 3: Hybrid Approach (Sprint 0.3+)
- Local development remains primary
- AWS Dev for integration testing
- Progressive cloud adoption
- Feature flags for environment switching

## Benefits of Local-First Approach

### Development Speed
- Zero network latency
- Instant service restarts
- Hot-reload for all services
- No AWS costs during development

### Developer Experience
- Works offline
- Consistent across all developers
- Easy onboarding (single command setup)
- Fast feedback loops

### Testing
- Complete control over data
- Easy to reset state
- Predictable environment
- Integration tests run locally

### Security
- No cloud credentials needed initially
- Secrets stay local
- Reduced attack surface
- Easier compliance during development

## Risk Mitigation

### Potential Issues & Solutions

| Risk | Mitigation |
|------|------------|
| Docker performance on Windows | WSL2 backend optimized for performance |
| Service discovery differences | Use docker-compose networking |
| AWS service differences | LocalStack provides good simulation |
| Database differences | Use same MongoDB version as Atlas |
| Memory constraints | WSL2 config limits resources |

## Success Metrics

### Sprint 0.1 Success Criteria
✅ **Must Have**:
1. `make up` starts complete dev environment
2. All 7 services running in Docker
3. JWT verification implemented
4. No hardcoded secrets
5. Hot-reload working

⚠️ **Nice to Have**:
1. LocalStack fully configured
2. Seed data scripts
3. Integration tests running
4. Performance monitoring

## Team Readiness Checklist

### Individual Developer Setup
- [ ] Windows 10/11 with WSL2 support
- [ ] 16GB RAM minimum (32GB recommended)
- [ ] 50GB free disk space
- [ ] Docker Desktop installed
- [ ] VS Code with Remote-WSL
- [ ] Git configured in WSL2

### Team Infrastructure
- [ ] GitHub repository created
- [ ] Jira project configured
- [ ] Slack/Teams channel setup
- [ ] Documentation wiki ready
- [ ] CI/CD pipeline (can be local initially)

## Next Steps

1. **Immediate** (Before Sprint 0.1):
   - All developers install WSL2 + Docker Desktop
   - Verify setup with `docker run hello-world`
   - Clone repository and test basic Docker Compose

2. **Sprint 0.1 Day 1**:
   - Create docker-compose.dev.yml
   - Set up LocalStack
   - Configure MongoDB and Redis

3. **Sprint 0.1 Completion**:
   - Full local dev environment operational
   - JWT security fixed
   - Team comfortable with Docker workflow

4. **Future Sprints**:
   - Progressive AWS adoption
   - Maintain local dev as primary
   - Cloud for integration/staging only

## Conclusion

The shift to local-first development provides:
1. **Faster startup** - No cloud setup blocking development
2. **Better DX** - Everything runs locally with hot-reload
3. **Cost savings** - No AWS costs during early development
4. **Flexibility** - Easy to experiment and reset
5. **Team autonomy** - Less dependency on DevOps/cloud team

This approach aligns with modern development practices and ensures the team can start productive work immediately while deferring complex cloud infrastructure decisions.