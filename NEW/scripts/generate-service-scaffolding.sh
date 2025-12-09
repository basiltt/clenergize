#!/bin/bash

# Service Generator Script for Clenergize V3
# This script generates NestJS service scaffolding for all remaining services

set -e

# Color output
GREEN='\033[0.32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service definitions: name|port|description|dbname
SERVICES=(
  "organization|3002|Organization & Project Management Service|organization"
  "reference|3003|Reference Data Management Service|reference"
  "activity|3004|Activity Data Ingestion Service|activity"
  "calculation|3005|Emission Calculation Service|calculation"
  "reporting|3006|Reporting & Analytics Service|reporting"
  "audit|3007|Audit & Compliance Service|audit"
)

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE_DIR="$BASE_DIR/identity-service"

echo -e "${BLUE}🚀 Generating service scaffolding...${NC}"

for service_def in "${SERVICES[@]}"; do
  IFS='|' read -r service_name port description dbname <<< "$service_def"

  SERVICE_DIR="$BASE_DIR/${service_name}-service"
  SERVICE_PASCAL=$(echo "$service_name" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1' | sed 's/ //g')

  echo -e "${GREEN}  Creating ${service_name}-service (port $port)...${NC}"

  # Create service directory
  mkdir -p "$SERVICE_DIR"

  # Copy files from template
  cp -r "$TEMPLATE_DIR/src" "$SERVICE_DIR/"
  cp "$TEMPLATE_DIR/package.json" "$SERVICE_DIR/"
  cp "$TEMPLATE_DIR/tsconfig.json" "$SERVICE_DIR/"
  cp "$TEMPLATE_DIR/nest-cli.json" "$SERVICE_DIR/"
  cp "$TEMPLATE_DIR/jest.config.js" "$SERVICE_DIR/"
  cp "$TEMPLATE_DIR/.env.example" "$SERVICE_DIR/"
  cp "$TEMPLATE_DIR/Dockerfile.dev" "$SERVICE_DIR/"
  cp "$TEMPLATE_DIR/.gitignore" "$SERVICE_DIR/"
  cp "$TEMPLATE_DIR/README.md" "$SERVICE_DIR/"

  # Create test directory structure
  mkdir -p "$SERVICE_DIR/test/"{unit,integration,e2e}

  # Replace service-specific values in package.json
  sed -i "s/@clenergize\/identity-service/@clenergize\/${service_name}-service/g" "$SERVICE_DIR/package.json"
  sed -i "s/Clenergize Identity & Access Management Service/$description/g" "$SERVICE_DIR/package.json"

  # Replace values in main.ts
  sed -i "s/Identity Service/${SERVICE_PASCAL} Service/g" "$SERVICE_DIR/src/main.ts"
  sed -i "s/Identity & Access Management API/$description API/g" "$SERVICE_DIR/src/main.ts"
  sed -i "s/identity-service/${service_name}-service/g" "$SERVICE_DIR/src/main.ts"
  sed -i "s/3001/$port/g" "$SERVICE_DIR/src/main.ts"

  # Replace values in health.controller.ts
  sed -i "s/identity-service/${service_name}-service/g" "$SERVICE_DIR/src/infrastructure/http/controllers/health.controller.ts"
  sed -i "s/identity_service/${service_name}_service/g" "$SERVICE_DIR/src/infrastructure/http/controllers/health.controller.ts"

  # Replace values in app.module.ts
  sed -i "s/identity/${service_name}/g" "$SERVICE_DIR/src/app.module.ts"

  # Replace values in .env.example
  sed -i "s/identity-service/${service_name}-service/g" "$SERVICE_DIR/.env.example"
  sed -i "s/PORT=3001/PORT=$port/g" "$SERVICE_DIR/.env.example"
  sed -i "s/clenergize_identity/clenergize_$dbname/g" "$SERVICE_DIR/.env.example"

  # Replace values in Dockerfile.dev
  sed -i "s/3001/$port/g" "$SERVICE_DIR/Dockerfile.dev"

  # Replace values in README.md
  sed -i "s/Identity Service/${SERVICE_PASCAL} Service/g" "$SERVICE_DIR/README.md"
  sed -i "s/Identity & Access Management Service/$description/g" "$SERVICE_DIR/README.md"
  sed -i "s/identity-service/${service_name}-service/g" "$SERVICE_DIR/README.md"
  sed -i "s/3001/$port/g" "$SERVICE_DIR/README.md"

  # Update README description based on service
  case "$service_name" in
    "organization")
      sed -i "/provides:/,/^$/c\\provides:\n\n- Organization and project management\n- Hierarchical structure management (entities, subsidiaries, locations)\n- Reference-based hierarchy (no cloning)\n- Permission management\n- User-project associations\n" "$SERVICE_DIR/README.md"
      ;;
    "reference")
      sed -i "/provides:/,/^$/c\\provides:\n\n- Emission factor management\n- Unit and conversion factor management\n- Data versioning and migration\n- Master data seeding\n- Reference data API\n" "$SERVICE_DIR/README.md"
      ;;
    "activity")
      sed -i "/provides:/,/^$/c\\provides:\n\n- Activity data ingestion\n- Bulk data import\n- Data validation\n- Activity data storage\n- Data quality checks\n" "$SERVICE_DIR/README.md"
      ;;
    "calculation")
      sed -i "/provides:/,/^$/c\\provides:\n\n- Emission calculations\n- Aggregation engine\n- Carbon footprint computation\n- Uncertainty calculations\n- Historical calculations\n" "$SERVICE_DIR/README.md"
      ;;
    "reporting")
      sed -i "/provides:/,/^$/c\\provides:\n\n- Report generation\n- Export functionality (PDF, Excel, CSV)\n- Scheduled reports\n- Report templates\n- Data visualization\n" "$SERVICE_DIR/README.md"
      ;;
    "audit")
      sed -i "/provides:/,/^$/c\\provides:\n\n- Audit logging\n- Compliance tracking\n- GDPR support (right to erasure, data portability)\n- Event sourcing\n- Security monitoring\n" "$SERVICE_DIR/README.md"
      ;;
  esac

  echo -e "${GREEN}  ✓ ${service_name}-service created${NC}"
done

echo -e "${BLUE}✅ All services generated successfully!${NC}"
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "  1. cd NEW/<service-name>-service"
echo -e "  2. npm install"
echo -e "  3. cp .env.example .env.local"
echo -e "  4. npm run dev"
