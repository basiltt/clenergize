# Makefile for Clenergize V3 Development Environment

.PHONY: help up down restart logs clean test status seed build init health

# Default target
help:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║           Clenergize V3 Development Commands              ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🚀 Quick Start:"
	@echo "  make init      - First-time setup (create directories, configs)"
	@echo "  make up        - Start all services"
	@echo "  make down      - Stop all services"
	@echo ""
	@echo "📊 Monitoring:"
	@echo "  make status    - Show service status"
	@echo "  make logs      - View all logs (Ctrl+C to exit)"
	@echo "  make health    - Check health of all services"
	@echo ""
	@echo "🔧 Development:"
	@echo "  make restart   - Restart all services"
	@echo "  make build     - Rebuild all service images"
	@echo "  make seed      - Load test data"
	@echo "  make test      - Run integration tests"
	@echo ""
	@echo "🗑️  Maintenance:"
	@echo "  make clean     - Stop services and remove all data"
	@echo ""
	@echo "🎯 Service-Specific Commands:"
	@echo "  make logs-identity    - View identity service logs"
	@echo "  make restart-identity - Restart identity service"
	@echo "  make shell-mongodb    - MongoDB shell access"
	@echo "  make shell-redis      - Redis CLI access"
	@echo ""
	@echo "🌐 Web UIs:"
	@echo "  Frontend:        http://localhost:3000"
	@echo "  Swagger:         http://localhost:8080"
	@echo "  Mongo Express:   http://localhost:8081 (admin/admin123)"
	@echo "  Redis Commander: http://localhost:8082"
	@echo "  MailHog:         http://localhost:8025"
	@echo ""

# First-time setup
init:
	@echo "🔧 Initializing Clenergize V3 Development Environment..."
	@mkdir -p NEW/identity-service NEW/organization-service NEW/reference-service
	@mkdir -p NEW/activity-service NEW/calculation-service NEW/reporting-service
	@mkdir -p NEW/audit-service NEW/frontend NEW/shared
	@mkdir -p nginx/conf.d nginx/ssl docs/api init-scripts/mongo init-scripts/aws
	@echo "✅ Directory structure created"
	@cp docker-compose.dev.yml docker-compose.yml 2>/dev/null || true
	@echo "✅ Docker compose file ready"
	@echo "📝 Next step: Run 'make up' to start services"

# Start all services
up:
	@echo "🚀 Starting Clenergize V3 services..."
	@docker compose -f docker-compose.dev.yml up -d
	@echo ""
	@echo "✅ Services starting up..."
	@sleep 5
	@make status
	@echo ""
	@echo "🌐 Access Points:"
	@echo "  Frontend:        http://localhost:3000"
	@echo "  Identity API:    http://localhost:3001"
	@echo "  Organization API:http://localhost:3002"
	@echo "  Mongo Express:   http://localhost:8081"
	@echo "  MailHog:         http://localhost:8025"

# Stop all services
down:
	@echo "🛑 Stopping Clenergize V3 services..."
	@docker compose -f docker-compose.dev.yml down
	@echo "✅ All services stopped"

# Restart all services
restart: down up

# View logs for all services
logs:
	@docker compose -f docker-compose.dev.yml logs -f

# View logs for specific service
logs-%:
	@docker compose -f docker-compose.dev.yml logs -f $*

# Restart specific service
restart-%:
	@echo "🔄 Restarting $* service..."
	@docker compose -f docker-compose.dev.yml restart $*
	@echo "✅ $* service restarted"

# Show status of all services
status:
	@echo "📊 Service Status:"
	@echo "══════════════════════════════════════════════════════════"
	@docker compose -f docker-compose.dev.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Check health of services
health:
	@echo "🏥 Health Check Results:"
	@echo "══════════════════════════════════════════════════════════"
	@echo -n "MongoDB:    " && (docker exec clenergize-mongodb mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1 && echo "✅ Healthy" || echo "❌ Unhealthy")
	@echo -n "Redis:      " && (docker exec clenergize-redis redis-cli ping > /dev/null 2>&1 && echo "✅ Healthy" || echo "❌ Unhealthy")
	@echo -n "LocalStack: " && (curl -s http://localhost:4566/_localstack/health | grep -q "running" && echo "✅ Healthy" || echo "❌ Unhealthy")
	@echo -n "MailHog:    " && (curl -s http://localhost:8025/api/v2/messages > /dev/null 2>&1 && echo "✅ Healthy" || echo "❌ Unhealthy")

# Build all service images
build:
	@echo "🔨 Building all service images..."
	@docker compose -f docker-compose.dev.yml build --no-cache
	@echo "✅ All images built"

# Load seed data
seed:
	@echo "🌱 Loading seed data..."
	@docker exec -it clenergize-mongodb mongosh -u admin -p localdev123 --eval "
		use clenergize_identity;
		db.users.insertMany([
			{email: 'admin@clenergize.com', role: 'admin', name: 'Admin User'},
			{email: 'user@clenergize.com', role: 'user', name: 'Test User'}
		]);
		use clenergize_reference;
		db.emissionFactors.insertMany([
			{name: 'Electricity', factor: 0.5, unit: 'kgCO2/kWh'},
			{name: 'Natural Gas', factor: 2.0, unit: 'kgCO2/m3'}
		]);
	" > /dev/null 2>&1
	@echo "✅ Seed data loaded"

# Run tests
test:
	@echo "🧪 Running integration tests..."
	@echo "Testing MongoDB connection..."
	@docker exec clenergize-mongodb mongosh -u admin -p localdev123 --eval "db.version()" --quiet || echo "❌ MongoDB test failed"
	@echo "Testing Redis connection..."
	@docker exec clenergize-redis redis-cli ping || echo "❌ Redis test failed"
	@echo "Testing LocalStack..."
	@curl -s http://localhost:4566/_localstack/health | grep -q "running" && echo "✅ LocalStack test passed" || echo "❌ LocalStack test failed"
	@echo "✅ Tests complete"

# Shell access to MongoDB
shell-mongodb:
	@docker exec -it clenergize-mongodb mongosh -u admin -p localdev123

# Shell access to Redis
shell-redis:
	@docker exec -it clenergize-redis redis-cli

# Shell access to a service container
shell-%:
	@docker exec -it clenergize-$* /bin/sh

# Clean everything (WARNING: Deletes all data)
clean:
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? (y/N) " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "🗑️  Cleaning everything..."; \
		docker compose -f docker-compose.dev.yml down -v; \
		echo "✅ All services stopped and data removed"; \
	else \
		echo "❌ Cancelled"; \
	fi

# Service-specific targets
.PHONY: up-infra up-services up-frontend

# Start only infrastructure
up-infra:
	@echo "🔧 Starting infrastructure services only..."
	@docker compose -f docker-compose.dev.yml up -d mongodb redis localstack mailhog
	@echo "✅ Infrastructure ready"

# Start only microservices
up-services:
	@echo "🚀 Starting microservices..."
	@docker compose -f docker-compose.dev.yml up -d identity-service organization-service reference-service activity-service calculation-service reporting-service audit-service
	@echo "✅ Microservices ready"

# Start only frontend
up-frontend:
	@echo "🎨 Starting frontend..."
	@docker compose -f docker-compose.dev.yml up -d frontend nginx
	@echo "✅ Frontend ready at http://localhost:3000"