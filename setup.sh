#!/bin/bash

# setup.sh - Complete setup script for Clenergize V3 Development Environment
# Run this in your WSL2 Ubuntu terminal

set -e  # Exit on any error

echo "======================================================"
echo "   Clenergize V3 Development Environment Setup"
echo "======================================================"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker not found! Please install Docker Desktop and enable WSL2 integration."
    exit 1
else
    echo "✅ Docker found: $(docker --version)"
fi

if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
    echo "❌ Docker Compose not found!"
    exit 1
else
    echo "✅ Docker Compose found"
fi

if ! command_exists node; then
    echo "⚠️  Node.js not found. Installing Node.js 24 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js found: $(node --version)"
fi

echo ""
echo "📁 Creating directory structure..."

# Create all required directories
mkdir -p NEW/{identity-service,organization-service,reference-service}
mkdir -p NEW/{activity-service,calculation-service,reporting-service}
mkdir -p NEW/{audit-service,frontend,shared}
mkdir -p nginx/{conf.d,ssl}
mkdir -p docs/api
mkdir -p init-scripts/{mongo,aws}
mkdir -p .claude/{agents,skills,commands,scripts}

echo "✅ Directory structure created"
echo ""

echo "📝 Creating configuration files..."

# Create docker-compose.infra.yml
cat > docker-compose.infra.yml << 'INFRA_EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: clenergize-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: localdev123
    volumes:
      - mongodb-data:/data/db
    networks:
      - clenergize-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: clenergize-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - clenergize-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  localstack:
    image: localstack/localstack:latest
    container_name: clenergize-localstack
    restart: unless-stopped
    ports:
      - "4566:4566"
    environment:
      - SERVICES=secretsmanager,sqs,s3,cognito-idp,eventbridge,ses
      - DEFAULT_REGION=us-east-1
      - EDGE_PORT=4566
      - DATA_DIR=/tmp/localstack/data
    volumes:
      - localstack-data:/var/lib/localstack
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - clenergize-network

  mailhog:
    image: mailhog/mailhog:latest
    container_name: clenergize-mailhog
    restart: unless-stopped
    ports:
      - "1025:1025"
      - "8025:8025"
    networks:
      - clenergize-network

  mongo-express:
    image: mongo-express:latest
    container_name: clenergize-mongo-express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongodb
      - ME_CONFIG_MONGODB_ADMINUSERNAME=admin
      - ME_CONFIG_MONGODB_ADMINPASSWORD=localdev123
      - ME_CONFIG_BASICAUTH_USERNAME=admin
      - ME_CONFIG_BASICAUTH_PASSWORD=admin123
    networks:
      - clenergize-network
    depends_on:
      - mongodb

  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: clenergize-redis-commander
    restart: unless-stopped
    ports:
      - "8082:8081"
    environment:
      - REDIS_HOSTS=local:redis:6379
    networks:
      - clenergize-network
    depends_on:
      - redis

volumes:
  mongodb-data:
  redis-data:
  localstack-data:

networks:
  clenergize-network:
    driver: bridge
INFRA_EOF

echo "✅ docker-compose.infra.yml created"

# Create simple Makefile for infrastructure
cat > Makefile.infra << 'MAKE_EOF'
.PHONY: help up down restart logs status clean test

help:
	@echo "Clenergize V3 Infrastructure Commands"
	@echo "====================================="
	@echo "make up      - Start infrastructure"
	@echo "make down    - Stop infrastructure"
	@echo "make status  - Show service status"
	@echo "make logs    - View logs"
	@echo "make test    - Test connections"
	@echo "make clean   - Remove all data"

up:
	@echo "🚀 Starting infrastructure services..."
	@docker compose -f docker-compose.infra.yml up -d
	@sleep 5
	@make status

down:
	@echo "🛑 Stopping infrastructure services..."
	@docker compose -f docker-compose.infra.yml down

restart: down up

logs:
	@docker compose -f docker-compose.infra.yml logs -f

status:
	@echo "📊 Service Status:"
	@docker compose -f docker-compose.infra.yml ps

test:
	@echo "🧪 Testing connections..."
	@echo -n "MongoDB: "
	@docker exec clenergize-mongodb mongosh -u admin -p localdev123 --eval "db.version()" --quiet > /dev/null 2>&1 && echo "✅" || echo "❌"
	@echo -n "Redis: "
	@docker exec clenergize-redis redis-cli ping > /dev/null 2>&1 && echo "✅" || echo "❌"
	@echo -n "LocalStack: "
	@curl -s http://localhost:4566/_localstack/health | grep -q "running" && echo "✅" || echo "❌"

clean:
	@echo "⚠️  This will delete all data!"
	@read -p "Continue? (y/N) " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose -f docker-compose.infra.yml down -v; \
		echo "✅ Cleaned"; \
	fi
MAKE_EOF

echo "✅ Makefile.infra created"
echo ""

# Check if Docker is running
echo "🐳 Checking Docker daemon..."
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker daemon is not running!"
    echo "Please start Docker Desktop and ensure WSL2 integration is enabled."
    exit 1
fi
echo "✅ Docker daemon is running"
echo ""

# Start infrastructure
echo "🚀 Starting infrastructure services..."
docker compose -f docker-compose.infra.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Test services
echo ""
echo "🧪 Testing services..."

echo -n "MongoDB:    "
if docker exec clenergize-mongodb mongosh -u admin -p localdev123 --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "✅ Running on port 27017"
else
    echo "❌ Not responding"
fi

echo -n "Redis:      "
if docker exec clenergize-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Running on port 6379"
else
    echo "❌ Not responding"
fi

echo -n "LocalStack: "
if curl -s http://localhost:4566/_localstack/health | grep -q "running"; then
    echo "✅ Running on port 4566"
else
    echo "❌ Not responding"
fi

echo -n "MailHog:    "
if curl -s http://localhost:8025/api/v2/messages > /dev/null 2>&1; then
    echo "✅ Running on port 8025"
else
    echo "❌ Not responding"
fi

echo ""
echo "======================================================"
echo "✅ Setup Complete!"
echo "======================================================"
echo ""
echo "🌐 Web Interfaces:"
echo "  MongoDB UI:  http://localhost:8081 (admin/admin123)"
echo "  Redis UI:    http://localhost:8082"
echo "  MailHog UI:  http://localhost:8025"
echo ""
echo "📝 Next Steps:"
echo "  1. Configure MCP in Claude Desktop"
echo "  2. Start building services with /generate-service"
echo "  3. Use 'make -f Makefile.infra status' to check services"
echo ""
echo "🛠️ Useful Commands:"
echo "  make -f Makefile.infra up       # Start infrastructure"
echo "  make -f Makefile.infra down     # Stop infrastructure"
echo "  make -f Makefile.infra logs     # View logs"
echo "  make -f Makefile.infra test     # Test connections"
echo ""