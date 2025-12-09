.PHONY: help up down logs restart clean build test seed

help: ## Show this help message
	@echo "Clenergize V3 Development Commands"
	@echo "=================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Start all services
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ All services started"
	@echo "📊 MongoDB Express: http://localhost:8081 (admin/admin)"
	@echo "📊 Redis Commander: http://localhost:8082"
	@echo "📧 Mailhog: http://localhost:8025"
	@echo "🏥 Health checks: http://localhost:300[1-7]/v1/health"

down: ## Stop all services
	docker-compose -f docker-compose.dev.yml down
	@echo "✅ All services stopped"

logs: ## View logs for all services
	docker-compose -f docker-compose.dev.yml logs -f

logs-service: ## View logs for specific service (usage: make logs-service service=identity)
	docker-compose -f docker-compose.dev.yml logs -f $(service)-service

restart: ## Restart all services
	docker-compose -f docker-compose.dev.yml restart
	@echo "✅ All services restarted"

restart-service: ## Restart specific service (usage: make restart-service service=identity)
	docker-compose -f docker-compose.dev.yml restart $(service)-service
	@echo "✅ $(service)-service restarted"

clean: ## Stop and remove all containers, volumes, and networks
	docker-compose -f docker-compose.dev.yml down -v
	@echo "✅ All containers, volumes, and networks removed"

build: ## Rebuild all service images
	docker-compose -f docker-compose.dev.yml build --no-cache
	@echo "✅ All services rebuilt"

build-service: ## Rebuild specific service (usage: make build-service service=identity)
	docker-compose -f docker-compose.dev.yml build --no-cache $(service)-service
	@echo "✅ $(service)-service rebuilt"

ps: ## Show running containers
	docker-compose -f docker-compose.dev.yml ps

test: ## Run tests for all services
	@echo "Running tests for all services..."
	@for service in identity organization reference activity calculation reporting audit; do \
		echo "\n🧪 Testing $$service-service..."; \
		cd NEW/$$service-service && npm test || true; \
		cd ../..; \
	done

test-service: ## Run tests for specific service (usage: make test-service service=identity)
	cd NEW/$(service)-service && npm test

seed: ## Seed development data
	@echo "🌱 Seeding development data..."
	@docker-compose -f docker-compose.dev.yml exec mongodb mongosh admin --eval "load('/docker-entrypoint-initdb.d/seed-dev-data.js')"
	@echo "✅ Development data seeded"

install: ## Install dependencies for all services
	@echo "📦 Installing dependencies for all services..."
	@for service in identity organization reference activity calculation reporting audit; do \
		echo "\nInstalling $$service-service dependencies..."; \
		cd NEW/$$service-service && npm install; \
		cd ../..; \
	done
	@echo "✅ All dependencies installed"

install-service: ## Install dependencies for specific service (usage: make install-service service=identity)
	cd NEW/$(service)-service && npm install

lint: ## Run linters for all services
	@echo "🔍 Linting all services..."
	@for service in identity organization reference activity calculation reporting audit; do \
		echo "\nLinting $$service-service..."; \
		cd NEW/$$service-service && npm run lint || true; \
		cd ../..; \
	done

format: ## Format code for all services
	@echo "💅 Formatting all services..."
	@for service in identity organization reference activity calculation reporting audit; do \
		echo "\nFormatting $$service-service..."; \
		cd NEW/$$service-service && npm run format || true; \
		cd ../..; \
	done

status: ## Show service health status
	@echo "📊 Service Health Status:"
	@echo "========================"
	@for port in 3001 3002 3003 3004 3005 3006 3007; do \
		if curl -s http://localhost:$$port/v1/health/live > /dev/null 2>&1; then \
			echo "✅ Port $$port: Healthy"; \
		else \
			echo "❌ Port $$port: Unhealthy"; \
		fi \
	done

mongo-shell: ## Open MongoDB shell
	docker-compose -f docker-compose.dev.yml exec mongodb mongosh -u admin -p localdev123 --authenticationDatabase admin

redis-cli: ## Open Redis CLI
	docker-compose -f docker-compose.dev.yml exec redis redis-cli

db-backup: ## Backup all MongoDB databases
	@echo "💾 Backing up databases..."
	@mkdir -p backups
	@docker-compose -f docker-compose.dev.yml exec mongodb mongodump --uri="mongodb://admin:localdev123@localhost:27017/?authSource=admin" --out=/data/backup
	@docker cp clenergize-mongodb:/data/backup ./backups/$(shell date +%Y%m%d_%H%M%S)
	@echo "✅ Backup completed"

db-restore: ## Restore MongoDB databases (usage: make db-restore backup=20250118_120000)
	@echo "📥 Restoring databases from backup $(backup)..."
	@docker cp ./backups/$(backup) clenergize-mongodb:/data/restore
	@docker-compose -f docker-compose.dev.yml exec mongodb mongorestore --uri="mongodb://admin:localdev123@localhost:27017/?authSource=admin" /data/restore
	@echo "✅ Restore completed"
