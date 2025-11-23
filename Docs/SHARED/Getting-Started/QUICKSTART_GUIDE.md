# Clenergize V3 - Quick Start Guide

> **Get your local development environment running in under 10 minutes**

**Last Updated**: November 18, 2025
**For**: New developers joining the Clenergize V3 rebuild project
**Prerequisites**: Docker Desktop, Node.js 20+, Git

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Initial Setup (First Time)](#initial-setup-first-time)
3. [Daily Development Workflow](#daily-development-workflow)
4. [Service Architecture Overview](#service-architecture-overview)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)
7. [Next Steps](#next-steps)

---

## System Requirements

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| **Docker Desktop** | Latest | https://www.docker.com/products/docker-desktop |
| **Node.js** | 20 LTS+ | https://nodejs.org/ |
| **npm** | 10+ | Comes with Node.js |
| **Git** | Latest | https://git-scm.com/ |

### Optional (Recommended)

- **VSCode** with extensions:
  - ESLint
  - Prettier
  - Docker
  - MongoDB for VS Code
- **Postman** or **Insomnia** for API testing
- **MongoDB Compass** for database exploration

### System Resources

- **RAM**: 16GB minimum (32GB recommended for running all services)
- **Disk Space**: 20GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux

---

## Initial Setup (First Time)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourcompany/clenergize-v3-rebuild.git
cd clenergize-v3-rebuild
git checkout develop
```

### Step 2: Start Infrastructure Services

```bash
# Start MongoDB, Redis, LocalStack, and development tools
make up
```

**This will start:**
- MongoDB on port 27017
- Redis on port 6379
- LocalStack (AWS simulation) on port 4566
- Mongo Express (DB UI) on port 8081
- Redis Commander on port 8082
- Mailhog (email testing) on ports 1025/8025

**Wait 2-3 minutes** for all health checks to pass.

### Step 3: Verify Infrastructure

```bash
# Check service health
make status
```

**Expected output:**
```
✅ Port 3001: Healthy (identity-service)
✅ Port 3002: Healthy (organization-service)
✅ Port 3003: Healthy (reference-service)
✅ Port 3004: Healthy (activity-service)
✅ Port 3005: Healthy (calculation-service)
✅ Port 3006: Healthy (reporting-service)
✅ Port 3007: Healthy (audit-service)
```

### Step 4: Install Dependencies for Your Service

If you're working on a specific service:

```bash
# Option 1: Install for all services (takes ~10 minutes)
make install

# Option 2: Install for specific service (faster)
make install-service service=identity
```

### Step 5: Access Development Tools

Open these URLs in your browser:

| Tool | URL | Credentials | Purpose |
|------|-----|-------------|---------|
| **Mongo Express** | http://localhost:8081 | admin / admin123 | Browse databases |
| **Redis Commander** | http://localhost:8082 | None | View cache data |
| **Mailhog** | http://localhost:8025 | None | Test emails |
| **Swagger UI** | http://localhost:8080 | None | API documentation |

### Step 6: Seed Development Data (Optional)

```bash
make seed
```

This creates:
- Test users (admin@example.com, user@example.com)
- Sample organizations and projects
- Reference data (emission factors, units)

---

## Daily Development Workflow

### Morning Routine

```bash
# 1. Pull latest changes
git pull origin develop

# 2. Start all services
make up

# 3. View logs (optional)
make logs
```

### Working on a Service

```bash
# Example: Working on identity-service

# 1. Navigate to service directory
cd NEW/identity-service

# 2. Install dependencies (if package.json changed)
npm install

# 3. Run in development mode (with hot reload)
npm run dev

# 4. In another terminal, view logs
make logs-service service=identity

# 5. Run tests
npm test

# 6. Run tests with coverage
npm run test:cov
```

### Making Changes

```bash
# 1. Create a feature branch
git checkout -b feature/CLNZ-123-add-user-roles

# 2. Make your changes
# Edit files in src/

# 3. Run linter
npm run lint

# 4. Format code
npm run format

# 5. Run tests
npm test

# 6. Commit changes (use conventional commits)
git add .
git commit -m "feat(identity): add role-based access control

- Added Role entity and repository
- Implemented RBAC guards
- Added unit tests (85% coverage)

Resolves CLNZ-123"

# 7. Push to remote
git push origin feature/CLNZ-123-add-user-roles
```

### End of Day

```bash
# Stop all services (preserves data)
make down

# OR clean everything (removes volumes)
make clean
```

---

## Service Architecture Overview

### Microservices (Ports 3001-3007)

```
┌─────────────────────────────────────────────────────────┐
│                  Clenergize V3 Services                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  3001  Identity Service      Authentication, users     │
│  3002  Organization Service  Projects, hierarchies     │
│  3003  Reference Service     Emission factors, units   │
│  3004  Activity Service      Data ingestion           │
│  3005  Calculation Service   Carbon calculations      │
│  3006  Reporting Service     Reports, exports         │
│  3007  Audit Service         Compliance, logging      │
│                                                         │
│  3000  Frontend (Next.js)    User interface           │
│    80  NGINX                 API Gateway              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Service Communication

```
Frontend → NGINX (Port 80)
            ↓
       /api/v1/users → Identity Service (3001)
       /api/v1/projects → Organization Service (3002)
       /api/v1/factors → Reference Service (3003)
       etc.

Services communicate via:
- REST APIs (service-to-service)
- Event Bus (Redis Pub/Sub for local, EventBridge for production)
```

### Data Flow Example

```
1. User logs in via Frontend
2. Frontend → NGINX → Identity Service (3001)
3. Identity Service validates credentials
4. Identity Service publishes "user.authenticated.v1" event
5. Audit Service (3007) logs the authentication
6. Frontend receives JWT token
```

---

## Common Tasks

### Viewing Logs

```bash
# All services
make logs

# Specific service
make logs-service service=identity

# Follow logs in real-time
docker-compose -f docker-compose.dev.yml logs -f identity-service
```

### Database Operations

```bash
# Open MongoDB shell
make mongo-shell

# Inside shell:
use clenergize_identity
db.users.find().pretty()
db.users.countDocuments()

# Backup databases
make db-backup

# Restore from backup
make db-restore backup=20250118_120000
```

### Redis Operations

```bash
# Open Redis CLI
make redis-cli

# Inside CLI:
KEYS *
GET user:session:abc123
HGETALL user:123
```

### Running Tests

```bash
# All services
make test

# Specific service
make test-service service=identity

# With coverage
cd NEW/identity-service && npm run test:cov

# E2E tests
npm run test:e2e

# Watch mode (re-runs on file changes)
npm run test:watch
```

### Restarting Services

```bash
# Restart all
make restart

# Restart specific service
make restart-service service=identity

# Rebuild and restart (after Dockerfile changes)
make build-service service=identity
make restart-service service=identity
```

---

## Troubleshooting

### Service Won't Start

**Problem**: Service fails to start or crashes immediately

**Solutions**:
```bash
# 1. Check logs
make logs-service service=identity

# 2. Verify dependencies installed
cd NEW/identity-service && npm install

# 3. Check environment variables
cat NEW/identity-service/.env.local

# 4. Rebuild Docker image
make build-service service=identity

# 5. Check if port is already in use
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows
```

### MongoDB Connection Errors

**Problem**: `MongoServerError: Authentication failed`

**Solutions**:
```bash
# 1. Check MongoDB is running
docker ps | grep mongodb

# 2. Verify credentials
make mongo-shell

# 3. Restart MongoDB
docker-compose -f docker-compose.dev.yml restart mongodb

# 4. Clear volumes and restart (WARNING: deletes data)
make clean
make up
```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solutions**:
```bash
# Find process using port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process (use PID from above)
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in docker-compose.dev.yml
```

### Tests Failing

**Problem**: Tests pass locally but fail in CI/CD

**Solutions**:
```bash
# 1. Clear Jest cache
npm run test -- --clearCache

# 2. Update snapshots
npm run test -- -u

# 3. Check test database connection
# Tests should use separate test database

# 4. Run with verbose output
npm run test -- --verbose
```

### Docker Issues

**Problem**: Docker containers not starting or behaving oddly

**Solutions**:
```bash
# 1. Restart Docker Desktop

# 2. Clear Docker cache
docker system prune -a

# 3. Check disk space
docker system df

# 4. Remove all Clenergize containers and volumes
make clean
docker volume prune
```

### TypeScript Errors

**Problem**: TypeScript compilation errors after pulling latest code

**Solutions**:
```bash
# 1. Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Clear TypeScript cache
rm -rf dist/

# 3. Check tsconfig.json is correct

# 4. Restart TypeScript server (in VSCode)
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## Next Steps

### For New Developers

1. **Read Architecture Documentation**
   - [PHASE2_Target_Architecture_Overview.md](PHASE2_Target_Architecture_Overview.md)
   - [NESTJS_SERVICE_TEMPLATE_DESIGN.md](NESTJS_SERVICE_TEMPLATE_DESIGN.md)

2. **Understand Event-Driven Architecture**
   - [Event Schema Registry](event-schemas/README.md)
   - Study event flow between services

3. **Pick a Starter Task**
   - Look for tickets labeled `good-first-issue` in Jira
   - Example: Add a new API endpoint
   - Example: Write tests for existing functionality

4. **Join the Team**
   - Slack: #clenergize-rebuild
   - Daily standup: 9:30 AM
   - Sprint planning: Every other Monday

### Recommended Learning Path

**Week 1: Setup & Exploration**
- Get local environment running
- Explore each service's API using Swagger/Postman
- Read service specifications (PHASE3_Service_Spec_*.md)
- Run and understand existing tests

**Week 2: First Contribution**
- Pick a small ticket (1-2 story points)
- Implement feature following DDD patterns
- Write tests (minimum 80% coverage)
- Submit PR for review

**Week 3: Deeper Dive**
- Work on a medium-sized feature (3-5 story points)
- Understand service-to-service communication
- Implement event publishing/consuming
- Participate in code review

**Week 4: Full Feature**
- Take ownership of a complete user story
- Coordinate across multiple services
- Write integration tests
- Deploy to dev environment

### Key Resources

| Resource | Link | Purpose |
|----------|------|---------|
| **Jira Board** | [CLNZ Project](https://yourcompany.atlassian.net/jira/software/projects/CLNZ) | Task tracking |
| **Confluence** | [Clenergize Docs](https://yourcompany.atlassian.net/wiki/spaces/CLNZ) | Documentation |
| **GitHub** | [Repository](https://github.com/yourcompany/clenergize-v3-rebuild) | Source code |
| **Slack** | #clenergize-rebuild | Team communication |
| **Figma** | [Design Files](https://figma.com/clenergize) | UI/UX designs |

---

## FAQ

### Q: Do I need to run all services locally?

**A**: No! You can run just the services you're working on. Others can connect to the shared dev environment.

```bash
# Run only identity and organization services
docker-compose -f docker-compose.dev.yml up identity-service organization-service
```

### Q: How do I debug a running service?

**A**: Each service exposes a debug port (9001-9007). Use VSCode's debugger:

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "attach",
  "name": "Attach to Identity Service",
  "port": 9001,
  "restart": true
}
```

### Q: Can I use a different database?

**A**: For local development, stick with the provided MongoDB. For testing, Jest creates temporary databases automatically.

### Q: How do I add a new npm package?

**A**:
```bash
# 1. Navigate to service
cd NEW/identity-service

# 2. Install package
npm install package-name

# 3. Rebuild Docker image
cd ../..
make build-service service=identity

# 4. Commit package.json and package-lock.json
```

### Q: Where do I find API documentation?

**A**:
- **Swagger UI**: http://localhost:8080 (when services are running)
- **Service READMEs**: Each service has its own documentation
- **REST API Spec**: [Docs/REST_API_SPECIFICATION.md](REST_API_SPECIFICATION.md)

### Q: How do I run performance tests?

**A**:
```bash
cd NEW/performance-tests
npm install
npm run test:smoke     # Quick smoke test
npm run test:load      # Load test (1000 req/s)
npm run test:stress    # Stress test (find breaking point)
```

---

## Getting Help

### Stuck on Something?

1. **Check this guide** - Most common issues are covered above
2. **Search Confluence** - Someone may have solved it before
3. **Ask in Slack** (#clenergize-rebuild) - Team is very responsive
4. **Pair with a senior dev** - Schedule a pairing session
5. **Create a ticket** - If it's a bug, log it in Jira

### Code Review Tips

- **Keep PRs small** (< 400 lines of code)
- **Write descriptive commit messages** (use conventional commits)
- **Add tests** (minimum 80% coverage)
- **Update documentation** (if adding new features)
- **Request review from 2 people** (1 senior, 1 peer)

---

## Appendix: Environment Variables

Each service requires these environment variables (see `.env.example` in each service):

```bash
# Application
NODE_ENV=development
PORT=3001
SERVICE_NAME=identity-service

# Database
MONGODB_URI=mongodb://admin:localdev123@mongodb:27017/clenergize_identity?authSource=admin

# Cache
REDIS_URL=redis://redis:6379

# AWS (LocalStack for local)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
LOCALSTACK_ENDPOINT=http://localstack:4566

# Security
JWT_ISSUER=http://localhost:3001
JWT_AUDIENCE=clenergize-v3

# Logging
LOG_LEVEL=debug
```

---

**Welcome to the Clenergize V3 team!** 🚀

If you have suggestions for improving this guide, submit a PR or message in #clenergize-rebuild.

**Last Updated**: November 18, 2025
**Maintained By**: Tech Lead & DevOps Team
