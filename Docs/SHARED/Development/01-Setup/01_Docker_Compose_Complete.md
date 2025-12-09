# Docker Compose Complete Setup Guide

## Overview
This guide provides comprehensive documentation for the Clenergize V3 ESG Platform Docker Compose development environment, supporting all Phase 1 services and future ESG expansion.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   DOCKER COMPOSE ARCHITECTURE               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend Layer:                                            │
│  • Next.js Application (Port 3000)                         │
│  • NGINX API Gateway (Port 80/443)                         │
│                                                             │
│  Service Layer (Phase 1 - 7 Services):                     │
│  • Identity Service (3001)                                 │
│  • Organization Service (3002)                             │
│  • Reference Service (3003)                                │
│  • Activity Service (3004)                                 │
│  • Calculation Service (3005)                              │
│  • Reporting Service (3006)                                │
│  • Audit Service (3007)                                    │
│                                                             │
│  Data Layer:                                                │
│  • MongoDB - Document store for services (27017)           │
│  • Redis - Cache & Pub/Sub (6379)                         │
│  • InfluxDB - Time-series for ESG metrics (8086)          │
│  • Neo4j - Graph DB for relationships (7474/7687)         │
│                                                             │
│  Infrastructure:                                            │
│  • LocalStack - AWS simulation (4566)                      │
│  • Mailhog - Email testing (1025/8025)                     │
│                                                             │
│  Development Tools:                                         │
│  • Swagger UI - API docs (8080)                            │
│  • Mongo Express - MongoDB UI (8081)                       │
│  • Redis Commander - Redis UI (8082)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Docker Desktop 4.25+ installed
- Docker Compose v2.23+ installed
- WSL2 configured (Windows users)
- 16GB RAM minimum (32GB recommended)
- 50GB free disk space

### Starting the Environment

```bash
# Clone the repository
git clone https://github.com/yourcompany/clenergize-v3-rebuild.git
cd clenergize-v3-rebuild

# Create required directories
mkdir -p init-scripts/{mongo,aws,influx,neo4j}
mkdir -p nginx/{conf.d,ssl}
mkdir -p docs/api

# Copy environment template
cp .env.example .env

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs for all services
docker-compose -f docker-compose.dev.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs -f identity-service
```

### Stopping the Environment

```bash
# Stop all services (preserves data)
docker-compose -f docker-compose.dev.yml down

# Stop and remove all data (clean slate)
docker-compose -f docker-compose.dev.yml down -v

# Remove all containers, networks, and images
docker-compose -f docker-compose.dev.yml down --rmi all
```

## Service Configuration

### MongoDB Setup

Each service has its own database for data isolation:

```javascript
// Connection strings for each service
const databases = {
  identity: 'mongodb://admin:localdev123@localhost:27017/clenergize_identity?authSource=admin',
  organization: 'mongodb://admin:localdev123@localhost:27017/clenergize_organization?authSource=admin',
  reference: 'mongodb://admin:localdev123@localhost:27017/clenergize_reference?authSource=admin',
  activity: 'mongodb://admin:localdev123@localhost:27017/clenergize_activity?authSource=admin',
  calculation: 'mongodb://admin:localdev123@localhost:27017/clenergize_calculation?authSource=admin',
  reporting: 'mongodb://admin:localdev123@localhost:27017/clenergize_reporting?authSource=admin',
  audit: 'mongodb://admin:localdev123@localhost:27017/clenergize_audit?authSource=admin'
};
```

### Redis Configuration

Redis is configured with separate databases for different purposes:

```javascript
// Redis database allocation
const redisConfig = {
  cache: 0,        // General caching
  pubsub: 1,       // Event pub/sub
  sessions: 2,     // User sessions
  rateLimit: 3,    // API rate limiting
  queues: 4        // Background job queues
};
```

### InfluxDB Setup (ESG Time-Series Data)

InfluxDB is configured for time-series ESG metrics:

```javascript
// InfluxDB connection
const influxConfig = {
  url: 'http://localhost:8086',
  token: 'clenergize-local-token',
  org: 'clenergize',
  bucket: 'esg_metrics'
};

// Example: Writing environmental metrics
const point = new Point('energy_consumption')
  .tag('facility', 'facility-001')
  .tag('source', 'solar')
  .floatField('value', 125.5)
  .floatField('carbon_intensity', 0.05)
  .timestamp(new Date());
```

### Neo4j Setup (Graph Relationships)

Neo4j is configured for relationship mapping:

```cypher
// Example: Organization hierarchy
CREATE (org:Organization {id: 'org-001', name: 'Clenergize Corp'})
CREATE (proj:Project {id: 'proj-001', name: 'Carbon Reduction 2024'})
CREATE (org)-[:OWNS]->(proj)

// Example: Supply chain relationships
CREATE (supplier:Supplier {id: 'sup-001', name: 'Green Energy Co'})
CREATE (org)-[:SOURCES_FROM {since: 2024}]->(supplier)
```

## Port Mapping Reference

| Service | Container Port | Host Port | Purpose |
|---------|---------------|-----------|---------|
| Frontend | 3000 | 3000 | Next.js application |
| NGINX | 80/443 | 80/443 | API Gateway |
| Identity | 3001 | 3001 | Authentication service |
| Organization | 3002 | 3002 | Organization management |
| Reference | 3003 | 3003 | Master data |
| Activity | 3004 | 3004 | Activity tracking |
| Calculation | 3005 | 3005 | Emission calculations |
| Reporting | 3006 | 3006 | Report generation |
| Audit | 3007 | 3007 | Audit logging |
| MongoDB | 27017 | 27017 | Document database |
| Redis | 6379 | 6379 | Cache/Pub-Sub |
| InfluxDB | 8086 | 8086 | Time-series database |
| Neo4j HTTP | 7474 | 7474 | Graph database UI |
| Neo4j Bolt | 7687 | 7687 | Graph database protocol |
| LocalStack | 4566 | 4566 | AWS services |
| Mailhog SMTP | 1025 | 1025 | Email SMTP |
| Mailhog UI | 8025 | 8025 | Email UI |
| Swagger UI | 8080 | 8080 | API documentation |
| Mongo Express | 8081 | 8081 | MongoDB UI |
| Redis Commander | 8082 | 8082 | Redis UI |

## Health Checks

All services include health checks for monitoring:

```bash
# Check all service health status
docker-compose -f docker-compose.dev.yml ps

# Check specific service health
docker inspect clenergize-identity-service --format='{{.State.Health.Status}}'

# View health check logs
docker inspect clenergize-identity-service --format='{{json .State.Health}}'
```

## Debugging Services

Each service exposes a debug port for Node.js debugging:

| Service | Debug Port | VS Code Configuration |
|---------|------------|----------------------|
| Identity | 9001 | Attach to port 9001 |
| Organization | 9002 | Attach to port 9002 |
| Reference | 9003 | Attach to port 9003 |
| Activity | 9004 | Attach to port 9004 |
| Calculation | 9005 | Attach to port 9005 |
| Reporting | 9006 | Attach to port 9006 |
| Audit | 9007 | Attach to port 9007 |

### VS Code Debug Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Identity Service",
      "port": 9001,
      "restart": true,
      "localRoot": "${workspaceFolder}/NEW/identity-service",
      "remoteRoot": "/app"
    }
  ]
}
```

## Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
MONGODB_URI=mongodb://admin:localdev123@localhost:27017/?authSource=admin
REDIS_URL=redis://localhost:6379
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=clenergize-local-token
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=localdev123

# AWS Configuration (LocalStack)
AWS_ENDPOINT=http://localhost:4566
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# JWT Configuration
JWT_ISSUER=http://localhost:3001
JWT_AUDIENCE=clenergize-v3
JWKS_URI=http://localhost:3001/.well-known/jwks.json

# Service Discovery
SERVICE_DISCOVERY_ENABLED=false
CONSUL_HOST=localhost
CONSUL_PORT=8500

# Email Configuration
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=noreply@clenergize.local

# Feature Flags
ENABLE_METRICS=true
ENABLE_TRACING=true
ENABLE_AUDIT=true
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Services fail to start
```bash
# Check Docker daemon is running
docker version

# Check for port conflicts
netstat -an | grep -E "3000|3001|3002|3003|3004|3005|3006|3007|27017|6379|8086|7474"

# Reset Docker environment
docker system prune -a --volumes
```

#### 2. Database connection errors
```bash
# Verify MongoDB is running
docker-compose -f docker-compose.dev.yml logs mongodb

# Connect to MongoDB directly
docker exec -it clenergize-mongodb mongosh -u admin -p localdev123

# Check Redis connectivity
docker exec -it clenergize-redis redis-cli ping
```

#### 3. Out of memory errors
```bash
# Increase Docker Desktop memory allocation
# Windows: Docker Desktop > Settings > Resources > Memory: 8GB minimum

# Monitor resource usage
docker stats
```

#### 4. Volume permission issues (Linux/WSL)
```bash
# Fix volume ownership
sudo chown -R $(id -u):$(id -g) ./

# Set correct permissions
chmod -R 755 ./init-scripts
```

## Performance Optimization

### Docker Desktop Settings (Windows/Mac)
- CPU: 4+ cores
- Memory: 8GB minimum, 16GB recommended
- Swap: 2GB
- Disk image size: 64GB

### Docker Compose Optimizations
```yaml
# Add to docker-compose.dev.yml for better performance
services:
  mongodb:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Monitoring

### Viewing Service Metrics
```bash
# Real-time resource usage
docker stats

# Service logs with timestamps
docker-compose -f docker-compose.dev.yml logs -f --timestamps

# Export logs to file
docker-compose -f docker-compose.dev.yml logs > docker-logs.txt
```

### Health Endpoints
- Identity: http://localhost:3001/health
- Organization: http://localhost:3002/health
- Reference: http://localhost:3003/health
- Activity: http://localhost:3004/health
- Calculation: http://localhost:3005/health
- Reporting: http://localhost:3006/health
- Audit: http://localhost:3007/health

## Backup and Restore

### Backup All Data
```bash
# Create backup directory
mkdir -p backups/$(date +%Y%m%d)

# Backup MongoDB
docker exec clenergize-mongodb mongodump --out /dump --username admin --password localdev123
docker cp clenergize-mongodb:/dump backups/$(date +%Y%m%d)/mongo

# Backup Redis
docker exec clenergize-redis redis-cli SAVE
docker cp clenergize-redis:/data/dump.rdb backups/$(date +%Y%m%d)/redis.rdb

# Backup InfluxDB
docker exec clenergize-influxdb influx backup /backup
docker cp clenergize-influxdb:/backup backups/$(date +%Y%m%d)/influx

# Backup Neo4j
docker exec clenergize-neo4j neo4j-admin dump --to=/backup/neo4j.dump
docker cp clenergize-neo4j:/backup backups/$(date +%Y%m%d)/neo4j
```

### Restore Data
```bash
# Restore MongoDB
docker cp backups/20241123/mongo clenergize-mongodb:/restore
docker exec clenergize-mongodb mongorestore /restore --username admin --password localdev123

# Restore Redis
docker cp backups/20241123/redis.rdb clenergize-redis:/data/dump.rdb
docker exec clenergize-redis redis-cli SHUTDOWN SAVE
docker restart clenergize-redis
```

## Security Considerations

### Development Environment Only
⚠️ **WARNING**: This Docker Compose configuration is for development only. Do NOT use in production.

### Security Best Practices
1. Change all default passwords before deployment
2. Use Docker secrets for sensitive data
3. Enable TLS for all services in production
4. Implement network isolation
5. Regular security updates for base images

## Next Steps

1. **Initialize databases**: Run seed scripts in `init-scripts/`
2. **Configure NGINX**: Set up routing in `nginx/conf.d/`
3. **Generate SSL certs**: For local HTTPS testing
4. **Install service dependencies**: `npm install` in each service
5. **Run migrations**: Execute database migrations
6. **Seed test data**: Load sample ESG data

## Related Documentation

- [CI/CD Pipeline Setup](./02_CI_CD_Pipeline_Setup.md)
- [Infrastructure as Code](./03_Infrastructure_as_Code.md)
- [Kubernetes Configuration](./04_Kubernetes_Configuration.md)
- [Environment Configuration](./05_Environment_Configuration.md)