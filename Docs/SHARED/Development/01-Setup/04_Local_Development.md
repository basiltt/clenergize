# Local Development Guide

> Complete guide for setting up and running the Clenergize V3 platform locally.

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Docker Desktop | 24.0+ | Container runtime |
| Node.js | 20.0+ | JavaScript runtime |
| npm | 10.0+ | Package manager |
| Git | 2.40+ | Version control |

### Recommended Tools

| Tool | Purpose |
|------|---------|
| VS Code | IDE with Extensions |
| MongoDB Compass | Database GUI |
| Postman/Insomnia | API testing |
| Docker Extension | VS Code Docker integration |

### VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-azuretools.vscode-docker",
    "mongodb.mongodb-vscode",
    "bradlc.vscode-tailwindcss",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourcompany/clenergize-v3.git
cd clenergize-v3
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your local settings (optional for defaults)
code .env
```

### 3. Start Infrastructure

```bash
# Start all infrastructure services
make up

# Verify services are running
make status

# Expected output:
# Port 3001: Healthy (Identity)
# Port 3002: Healthy (Organization)
# Port 3003: Healthy (Reference)
# Port 3004: Healthy (Activity)
# Port 3005: Healthy (Calculation)
# Port 3006: Healthy (Reporting)
# Port 3007: Healthy (Audit)
```

### 4. Install Dependencies (Optional - for IDE support)

```bash
# Install dependencies for all services
make install

# Or for specific service
cd NEW/identity-service && npm install
```

---

## Development Workflow

### Starting Services

```bash
# Start all services (development mode with hot reload)
make up

# Start specific service only
docker-compose -f docker-compose.dev.yml up identity-service -d

# View logs
make logs
make logs-service service=identity
```

### Running Tests

```bash
# All tests
make test

# Specific service
make test-service service=identity

# With coverage
cd NEW/identity-service && npm run test:cov

# E2E tests
cd NEW/identity-service && npm run test:e2e
```

### Code Quality

```bash
# Lint all services
make lint

# Format all services
make format

# Lint specific service
cd NEW/identity-service && npm run lint
```

---

## Service Development

### Working on a Service

1. **Create feature branch**
   ```bash
   git checkout -b feature/CLNZ-XXX-description
   ```

2. **Start only required services**
   ```bash
   # Start dependencies (MongoDB, Redis, LocalStack)
   docker-compose -f docker-compose.dev.yml up mongodb redis localstack -d

   # Run service locally with hot reload
   cd NEW/identity-service
   npm run start:dev
   ```

3. **Make changes and test**
   ```bash
   npm run test:watch
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin feature/CLNZ-XXX-description
   ```

### Debugging

#### VS Code Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Identity Service",
      "type": "node",
      "request": "attach",
      "port": 9001,
      "restart": true,
      "sourceMaps": true,
      "localRoot": "${workspaceFolder}/NEW/identity-service",
      "remoteRoot": "/app"
    }
  ]
}
```

#### Debug Ports

| Service | Debug Port |
|---------|------------|
| identity-service | 9001 |
| organization-service | 9002 |
| reference-service | 9003 |
| activity-service | 9004 |
| calculation-service | 9005 |
| reporting-service | 9006 |
| audit-service | 9007 |

---

## Database Access

### MongoDB

```bash
# Shell access
make mongo-shell

# MongoDB Express UI
open http://localhost:8081
# Username: admin
# Password: admin123

# Connection string
mongodb://admin:localdev123@localhost:27017/?authSource=admin
```

### Redis

```bash
# CLI access
make redis-cli

# Redis Commander UI
open http://localhost:8082
```

### InfluxDB

```bash
# UI access
open http://localhost:8086
# Username: admin
# Password: localdev123
# Token: clenergize-local-token
```

### Neo4j

```bash
# Browser UI
open http://localhost:7474
# Username: neo4j
# Password: localdev123
```

---

## Common Tasks

### Seed Development Data

```bash
make seed
```

### Reset Database

```bash
# Stop services and remove volumes
make clean

# Start fresh
make up
make seed
```

### View Service Logs

```bash
# All services
make logs

# Specific service
docker-compose -f docker-compose.dev.yml logs -f identity-service

# Filter logs
docker-compose -f docker-compose.dev.yml logs -f identity-service | grep ERROR
```

### Run Database Migrations

```bash
cd NEW/migration-scripts
npm run migrate:dev
```

### Generate TypeScript Types

```bash
# From OpenAPI spec
cd NEW/identity-service
npm run generate:types
```

---

## Troubleshooting

### Docker Issues

**Container won't start**
```bash
# Check container logs
docker logs clenergize-identity-service

# Rebuild container
make build-service service=identity
make restart-service service=identity
```

**Port already in use**
```bash
# Find process using port
lsof -i :3001
# Kill process
kill -9 <PID>
```

**Out of disk space**
```bash
# Clean Docker system
docker system prune -a --volumes
```

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker ps | grep mongodb

# Test connection
docker exec -it clenergize-mongodb mongosh -u admin -p localdev123 --authenticationDatabase admin
```

### Node.js Issues

**Module not found**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors after pulling changes**
```bash
# Clean and rebuild
npm run build
```

### Windows-Specific Issues

**Line endings**
```bash
# Configure Git for Windows
git config --global core.autocrlf true
```

**Path length issues**
```bash
# Enable long paths in Windows
# Run as Administrator:
git config --system core.longpaths true
```

---

## Performance Tips

### Docker Performance (Windows)

1. Use WSL2 backend for Docker Desktop
2. Store project in WSL filesystem (`/home/user/`)
3. Allocate sufficient memory (8GB+ recommended)

### Development Speed

1. Only start services you need
2. Use `npm run start:dev` for hot reload
3. Use test watch mode: `npm run test:watch`

---

## Environment Variables Reference

See [.env.example](../../../../.env.example) for complete list.

Key variables:
- `NODE_ENV`: development/production/test
- `LOG_LEVEL`: debug/info/warn/error
- `MONGODB_URI`: Database connection string
- `REDIS_URL`: Cache connection string

---

## Next Steps

- [Coding Standards](../02-Standards/01_Coding_Standards.md)
- [Git Workflow](../02-Standards/02_Git_Workflow.md)
- [Testing Guide](../../Testing/01_Testing_Strategy.md)
- [API Documentation](http://localhost:8080)
