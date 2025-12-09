# Quick Start Guide - Clenergize V3 ESG Platform

**Version**: 1.0.0
**Last Updated**: November 22, 2025
**Estimated Time**: 30 minutes
**Prerequisites**: Docker Desktop, Git, Node.js 18+, WSL2 (Windows)

---

## Welcome to Clenergize V3!

This guide will help you set up your local development environment and run the Clenergize V3 ESG Platform in **under 30 minutes**.

---

## Quick Links

- **Project Repository**: [GitHub - Clenergize V3](https://github.com/yourcompany/clenergize-v3-rebuild)
- **Documentation**: [Docs Folder](../)
- **JIRA Board**: [CLNZ Project](https://yourcompany.atlassian.net/jira/software/projects/CLNZ)
- **Slack Channel**: #clenergize-rebuild

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourcompany/clenergize-v3-rebuild.git
cd clenergize-v3-rebuild

# Checkout develop branch
git checkout develop

# Verify you're on the right branch
git branch
```

**Expected Output**:
```
* develop
  main
```

---

## Step 2: Install Prerequisites

### Windows (WSL2)

```bash
# Ensure WSL2 is installed
wsl --list --verbose

# Install Docker Desktop (with WSL2 backend)
# Download from: https://www.docker.com/products/docker-desktop

# Install Node.js 18+ via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
node --version  # Should output v18.x.x
```

### Mac / Linux

```bash
# Install Docker
# Mac: https://www.docker.com/products/docker-desktop
# Linux: sudo apt-get install docker.io docker-compose

# Install Node.js via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Verify Prerequisites**:
```bash
docker --version       # Should be 20.10+
docker-compose --version  # Should be 2.0+
node --version         # Should be 18.x.x
npm --version          # Should be 9.x.x
git --version          # Should be 2.x.x
```

---

## Step 3: Environment Configuration

### Create Environment Files

```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables (optional for local dev)
nano .env
```

### Key Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/?authSource=admin

# Redis
REDIS_URL=redis://localhost:6379
REDIS_CACHE_DB=0
REDIS_PUBSUB_DB=1

# JWT Secret (generate a strong secret for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=3600

# AWS LocalStack (for local development)
LOCALSTACK_ENDPOINT=http://localhost:4566
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# Service Ports
GATEWAY_PORT=3000
IDENTITY_PORT=3001
ORGANIZATION_PORT=3002
REFERENCE_PORT=3003
ACTIVITY_PORT=3004
CALCULATION_PORT=3005
REPORTING_PORT=3006
AUDIT_PORT=3007

# Node Environment
NODE_ENV=development
LOG_LEVEL=debug
```

---

## Step 4: Start Infrastructure Services

```bash
# Start MongoDB, Redis, LocalStack using Docker Compose
docker-compose up -d

# Verify services are running
docker-compose ps
```

**Expected Output**:
```
NAME                    SERVICE    STATUS      PORTS
clenergize-mongodb      mongodb    running     0.0.0.0:27017->27017/tcp
clenergize-redis        redis      running     0.0.0.0:6379->6379/tcp
clenergize-localstack   localstack running     0.0.0.0:4566->4566/tcp
```

---

## Step 5: Seed Reference Data

```bash
# Install dependencies for reference-service
cd services/reference-service
npm install

# Run database seeding script
npm run seed
```

---

## Step 6: Start Backend Services

```bash
# From project root
npm run start:dev:all
```

**Verify Services**:
```bash
curl http://localhost:3001/health  # Identity Service
curl http://localhost:3002/health  # Organization Service
curl http://localhost:3003/health  # Reference Service
```

---

## Step 7: Start Frontend Application

```bash
cd frontend
npm install
npm run dev
```

**Access the Application**:
- Frontend: [http://localhost:3000](http://localhost:3000)
- API Gateway: [http://localhost:3000/api](http://localhost:3000/api)

**Default Login**:
```
Email: admin@clenergize.com
Password: Admin123!
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>
```

### MongoDB Connection Failed

```bash
# Restart MongoDB
docker-compose restart mongodb

# Check logs
docker-compose logs mongodb
```

---

## Next Steps

- Read [Architecture Summary](03_Architecture_Summary.md)
- Review [Development Standards](../04-Development/02-Standards/01_Coding_Standards.md)
- Join Slack: #clenergize-rebuild

---

**Questions?** Ask in #clenergize-rebuild on Slack
