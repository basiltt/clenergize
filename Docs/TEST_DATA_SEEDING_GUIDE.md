# Test Data Seeding Guide

## Overview

This guide provides comprehensive instructions for seeding test data across all Clenergize V3 services for local development, testing, and CI/CD pipelines.

**Purpose**: Consistent, reproducible test data for:
- Local development
- Integration testing
- E2E testing
- Demo environments
- Performance testing

---

## Table of Contents

1. [MongoDB Initialization Scripts](#mongodb-initialization-scripts)
2. [Per-Service Seed Data](#per-service-seed-data)
3. [LocalStack Initialization](#localstack-initialization)
4. [Seeder Execution](#seeder-execution)
5. [Data Relationships](#data-relationships)
6. [CI/CD Integration](#cicd-integration)

---

## MongoDB Initialization Scripts

### Directory Structure

```
init-scripts/
├── mongo/
│   ├── 01-create-databases.js
│   ├── 02-create-users.js
│   ├── 03-seed-reference-data.js
│   ├── 04-seed-test-users.js
│   ├── 05-seed-organizations.js
│   ├── 06-seed-activities.js
│   └── 07-seed-calculations.js
└── aws/
    └── init-localstack.sh
```

### 01-create-databases.js

```javascript
// init-scripts/mongo/01-create-databases.js

// Create all service databases
const databases = [
  'clenergize_identity',
  'clenergize_organization',
  'clenergize_reference',
  'clenergize_activity',
  'clenergize_calculation',
  'clenergize_reporting',
  'clenergize_audit',
  'clenergize_gateway'
];

databases.forEach(dbName => {
  db = db.getSiblingDB(dbName);

  // Create a dummy collection to initialize the database
  db.createCollection('_init');

  print(`✅ Created database: ${dbName}`);
});

print('✅ All databases created successfully');
```

### 02-create-users.js

```javascript
// init-scripts/mongo/02-create-users.js

// Create service-specific database users
const services = [
  { name: 'identity', db: 'clenergize_identity' },
  { name: 'organization', db: 'clenergize_organization' },
  { name: 'reference', db: 'clenergize_reference' },
  { name: 'activity', db: 'clenergize_activity' },
  { name: 'calculation', db: 'clenergize_calculation' },
  { name: 'reporting', db: 'clenergize_reporting' },
  { name: 'audit', db: 'clenergize_audit' }
];

services.forEach(service => {
  db = db.getSiblingDB(service.db);

  // Create service user with read/write permissions
  try {
    db.createUser({
      user: `${service.name}_service`,
      pwd: 'localdev123',
      roles: [
        { role: 'readWrite', db: service.db }
      ]
    });
    print(`✅ Created user for ${service.name} service`);
  } catch (e) {
    if (e.code === 51003) {  // User already exists
      print(`⚠️  User ${service.name}_service already exists`);
    } else {
      throw e;
    }
  }
});

print('✅ All service users created successfully');
```

### 03-seed-reference-data.js

```javascript
// init-scripts/mongo/03-seed-reference-data.js

db = db.getSiblingDB('clenergize_reference');

// Seed emission factors (GHG Protocol standards)
const emissionFactors = [
  {
    _id: new ObjectId(),
    scope: 'scope1',
    category: 'stationary_combustion',
    sub_category: 'natural_gas',
    fuel_type: 'natural_gas',
    unit: 'kg',
    co2_factor: 0.05306,  // kg CO2 per kWh
    ch4_factor: 0.000001,
    n2o_factor: 0.0000001,
    source: 'GHG Protocol',
    region: 'global',
    year: 2024,
    version: '1.0',
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    scope: 'scope1',
    category: 'mobile_combustion',
    sub_category: 'vehicles',
    fuel_type: 'diesel',
    unit: 'litre',
    co2_factor: 2.68,  // kg CO2 per litre
    ch4_factor: 0.00001,
    n2o_factor: 0.000001,
    source: 'DEFRA',
    region: 'uk',
    year: 2024,
    version: '1.0',
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    scope: 'scope2',
    category: 'purchased_electricity',
    sub_category: 'grid_electricity',
    fuel_type: 'grid_mix',
    unit: 'kWh',
    co2_factor: 0.233,  // kg CO2 per kWh (US average)
    ch4_factor: 0,
    n2o_factor: 0,
    source: 'EPA eGRID',
    region: 'us',
    year: 2024,
    version: '1.0',
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    scope: 'scope3',
    category: 'business_travel',
    sub_category: 'air_travel',
    fuel_type: 'jet_fuel',
    unit: 'km',
    distance_category: 'short_haul',  // < 500km
    co2_factor: 0.254,  // kg CO2 per passenger-km
    ch4_factor: 0.00001,
    n2o_factor: 0.00001,
    source: 'DEFRA',
    region: 'global',
    year: 2024,
    version: '1.0',
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.emission_factors.insertMany(emissionFactors);
print(`✅ Seeded ${emissionFactors.length} emission factors`);

// Seed units and conversions
const units = [
  {
    _id: new ObjectId(),
    name: 'kilowatt-hour',
    symbol: 'kWh',
    type: 'energy',
    base_unit: 'joule',
    conversion_factor: 3600000,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'litre',
    symbol: 'L',
    type: 'volume',
    base_unit: 'cubic_meter',
    conversion_factor: 0.001,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'kilometer',
    symbol: 'km',
    type: 'distance',
    base_unit: 'meter',
    conversion_factor: 1000,
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'kilogram',
    symbol: 'kg',
    type: 'mass',
    base_unit: 'kilogram',
    conversion_factor: 1,
    createdAt: new Date()
  }
];

db.units.insertMany(units);
print(`✅ Seeded ${units.length} units`);

// Seed hierarchy templates
const hierarchyTemplates = [
  {
    _id: new ObjectId(),
    name: 'Manufacturing Company',
    description: 'Standard hierarchy for manufacturing organizations',
    levels: [
      { level: 1, name: 'Corporation', required: true },
      { level: 2, name: 'Division', required: true },
      { level: 3, name: 'Site', required: true },
      { level: 4, name: 'Building', required: false },
      { level: 5, name: 'Department', required: false }
    ],
    is_default: true,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Service Company',
    description: 'Hierarchy for service-based organizations',
    levels: [
      { level: 1, name: 'Company', required: true },
      { level: 2, name: 'Region', required: true },
      { level: 3, name: 'Office', required: true },
      { level: 4, name: 'Team', required: false }
    ],
    is_default: false,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.hierarchy_templates.insertMany(hierarchyTemplates);
print(`✅ Seeded ${hierarchyTemplates.length} hierarchy templates`);
```

### 04-seed-test-users.js

```javascript
// init-scripts/mongo/04-seed-test-users.js

db = db.getSiblingDB('clenergize_identity');

// Note: Passwords are hashed with bcrypt (12 rounds)
// Plain text passwords for testing: 'password123'
const hashedPassword = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWZHJB3S';

const testUsers = [
  {
    _id: new ObjectId(),
    email: 'admin@clenergize.test',
    password: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    email: 'manager@clenergize.test',
    password: hashedPassword,
    firstName: 'Manager',
    lastName: 'User',
    role: 'manager',
    status: 'active',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    email: 'analyst@clenergize.test',
    password: hashedPassword,
    firstName: 'Analyst',
    lastName: 'User',
    role: 'analyst',
    status: 'active',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    email: 'viewer@clenergize.test',
    password: hashedPassword,
    firstName: 'Viewer',
    lastName: 'User',
    role: 'viewer',
    status: 'active',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.users.insertMany(testUsers);
print(`✅ Seeded ${testUsers.length} test users`);
print('📝 Test credentials: All users have password "password123"');
```

### 05-seed-organizations.js

```javascript
// init-scripts/mongo/05-seed-organizations.js

db = db.getSiblingDB('clenergize_organization');

// Get test users from identity DB
const identityDb = db.getSiblingDB('clenergize_identity');
const adminUser = identityDb.users.findOne({ email: 'admin@clenergize.test' });

// Get hierarchy template
const refDb = db.getSiblingDB('clenergize_reference');
const manufacturingTemplate = refDb.hierarchy_templates.findOne({ name: 'Manufacturing Company' });

// Create test organization
const organization = {
  _id: new ObjectId(),
  name: 'Acme Manufacturing Corp',
  domain: 'acme.test',
  industry: 'manufacturing',
  country: 'US',
  hierarchyTemplateRef: manufacturingTemplate._id,
  status: 'active',
  createdBy: adminUser._id,
  createdAt: new Date(),
  updatedAt: new Date()
};

const orgId = db.organizations.insertOne(organization).insertedId;
print(`✅ Created organization: ${organization.name}`);

// Create hierarchy nodes (reference-based, not cloned!)
const hierarchyNodes = [
  {
    _id: new ObjectId(),
    organizationId: orgId,
    level: 1,
    name: 'Acme Corporation',
    code: 'ACME-CORP',
    parentId: null,
    hierarchyPath: '/ACME-CORP',
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    organizationId: orgId,
    level: 2,
    name: 'Manufacturing Division',
    code: 'MFG-DIV',
    parentId: null,  // Will be updated after insert
    hierarchyPath: '/ACME-CORP/MFG-DIV',
    createdAt: new Date()
  },
  {
    _id: new ObjectId(),
    organizationId: orgId,
    level: 3,
    name: 'Portland Site',
    code: 'PDX-SITE',
    parentId: null,  // Will be updated
    hierarchyPath: '/ACME-CORP/MFG-DIV/PDX-SITE',
    location: {
      address: '123 Manufacturing Way',
      city: 'Portland',
      state: 'OR',
      country: 'US',
      postalCode: '97201'
    },
    createdAt: new Date()
  }
];

// Insert root node first
const rootId = db.hierarchy_nodes.insertOne(hierarchyNodes[0]).insertedId;

// Update and insert division
hierarchyNodes[1].parentId = rootId;
const divId = db.hierarchy_nodes.insertOne(hierarchyNodes[1]).insertedId;

// Update and insert site
hierarchyNodes[2].parentId = divId;
db.hierarchy_nodes.insertOne(hierarchyNodes[2]);

print(`✅ Created ${hierarchyNodes.length} hierarchy nodes`);

// Create test project
const project = {
  _id: new ObjectId(),
  organizationId: orgId,
  name: '2024 Carbon Footprint Assessment',
  description: 'Annual carbon footprint calculation',
  reporting_period: {
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31')
  },
  status: 'active',
  hierarchyScope: [rootId],  // Include all under root
  createdBy: adminUser._id,
  createdAt: new Date(),
  updatedAt: new Date()
};

db.projects.insertOne(project);
print(`✅ Created project: ${project.name}`);
```

### 06-seed-activities.js

```javascript
// init-scripts/mongo/06-seed-activities.js

db = db.getSiblingDB('clenergize_activity');

const orgDb = db.getSiblingDB('clenergize_organization');
const identityDb = db.getSiblingDB('clenergize_identity');

const organization = orgDb.organizations.findOne({ name: 'Acme Manufacturing Corp' });
const project = orgDb.projects.findOne({ name: '2024 Carbon Footprint Assessment' });
const user = identityDb.users.findOne({ email: 'analyst@clenergize.test' });

// Sample activities
const activities = [
  {
    _id: new ObjectId(),
    organizationId: organization._id,
    projectId: project._id,
    scope: 'scope1',
    category: 'stationary_combustion',
    sub_category: 'natural_gas',
    activity_date: new Date('2024-01-15'),
    quantity: 15000,  // kWh
    unit: 'kWh',
    location: 'Portland Site',
    description: 'Natural gas consumption - January',
    status: 'approved',
    createdBy: user._id,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    organizationId: organization._id,
    projectId: project._id,
    scope: 'scope1',
    category: 'mobile_combustion',
    sub_category: 'vehicles',
    activity_date: new Date('2024-01-20'),
    quantity: 500,  // litres
    unit: 'litre',
    fuel_type: 'diesel',
    vehicle_type: 'delivery_truck',
    description: 'Diesel fuel for delivery fleet - January',
    status: 'approved',
    createdBy: user._id,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    organizationId: organization._id,
    projectId: project._id,
    scope: 'scope2',
    category: 'purchased_electricity',
    sub_category: 'grid_electricity',
    activity_date: new Date('2024-01-31'),
    quantity: 25000,  // kWh
    unit: 'kWh',
    location: 'Portland Site',
    description: 'Grid electricity consumption - January',
    status: 'approved',
    createdBy: user._id,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.activities.insertMany(activities);
print(`✅ Seeded ${activities.length} sample activities`);
```

### 07-seed-calculations.js

```javascript
// init-scripts/mongo/07-seed-calculations.js

db = db.getSiblingDB('clenergize_calculation');

const activityDb = db.getSiblingDB('clenergize_activity');
const activities = activityDb.activities.find({}).toArray();

// Calculate emissions for each activity
const calculations = activities.map(activity => {
  let co2e = 0;

  // Simple calculation (real logic is more complex)
  if (activity.scope === 'scope1' && activity.sub_category === 'natural_gas') {
    co2e = activity.quantity * 0.05306;  // kg CO2e per kWh
  } else if (activity.scope === 'scope1' && activity.sub_category === 'vehicles') {
    co2e = activity.quantity * 2.68;  // kg CO2e per litre diesel
  } else if (activity.scope === 'scope2' && activity.category === 'purchased_electricity') {
    co2e = activity.quantity * 0.233;  // kg CO2e per kWh
  }

  return {
    _id: new ObjectId(),
    activityId: activity._id,
    organizationId: activity.organizationId,
    projectId: activity.projectId,
    scope: activity.scope,
    co2: co2e,
    ch4: 0,
    n2o: 0,
    co2e: co2e,  // Total CO2 equivalent
    unit: 'kg',
    emission_factor_used: {
      source: 'GHG Protocol',
      year: 2024
    },
    calculatedAt: new Date(),
    createdAt: new Date()
  };
});

db.calculations.insertMany(calculations);
print(`✅ Created ${calculations.length} calculations`);

// Create summary aggregation
const summary = {
  _id: new ObjectId(),
  projectId: activities[0].projectId,
  organizationId: activities[0].organizationId,
  period: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31')
  },
  totals: {
    scope1: calculations.filter(c => c.scope === 'scope1').reduce((sum, c) => sum + c.co2e, 0),
    scope2: calculations.filter(c => c.scope === 'scope2').reduce((sum, c) => sum + c.co2e, 0),
    scope3: 0,
    total: calculations.reduce((sum, c) => sum + c.co2e, 0)
  },
  unit: 'kg CO2e',
  calculatedAt: new Date()
};

db.summaries.insertOne(summary);
print(`✅ Created summary aggregation`);
print(`📊 Total emissions: ${summary.totals.total.toFixed(2)} kg CO2e`);
```

---

## LocalStack Initialization

### init-localstack.sh

```bash
#!/bin/bash
# init-scripts/aws/init-localstack.sh

set -e

echo "🚀 Initializing LocalStack AWS services..."

# Wait for LocalStack to be ready
echo "⏳ Waiting for LocalStack..."
until curl -s http://localhost:4566/_localstack/health | grep -q '"ready": true'; do
  echo "Waiting for LocalStack to be ready..."
  sleep 2
done

echo "✅ LocalStack is ready"

# Create EventBridge event bus
echo "📬 Creating EventBridge event bus..."
aws --endpoint-url=http://localhost:4566 events create-event-bus \
  --name clenergize-event-bus \
  --region us-east-1

# Create SQS queues
echo "📨 Creating SQS queues..."
aws --endpoint-url=http://localhost:4566 sqs create-queue \
  --queue-name clenergize-calculation-queue \
  --region us-east-1

aws --endpoint-url=http://localhost:4566 sqs create-queue \
  --queue-name clenergize-reporting-queue \
  --region us-east-1

# Create S3 buckets
echo "🪣 Creating S3 buckets..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://clenergize-reports
aws --endpoint-url=http://localhost:4566 s3 mb s3://clenergize-exports
aws --endpoint-url=http://localhost:4566 s3 mb s3://clenergize-uploads

# Create event rules
echo "📋 Creating EventBridge rules..."
aws --endpoint-url=http://localhost:4566 events put-rule \
  --name calculation-trigger \
  --event-bus-name clenergize-event-bus \
  --event-pattern '{"source":["activity-service"],"detail-type":["Activity.Data.Ingested"]}' \
  --region us-east-1

echo "✅ LocalStack initialization complete!"
```

---

## Seeder Execution

### Docker Compose Integration

Add to `docker-compose.dev.yml`:

```yaml
services:
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: localdev123
    volumes:
      - mongodb-data:/data/db
      - ./init-scripts/mongo:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  localstack:
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3,sqs,sns,eventbridge
      - DEBUG=1
    volumes:
      - ./init-scripts/aws:/docker-entrypoint-initaws.d:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4566/_localstack/health"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Manual Execution

```bash
# Start MongoDB
docker-compose up -d mongodb

# Wait for MongoDB to be ready
sleep 10

# Run seed scripts manually
docker exec -i clenergize-mongodb mongosh \
  -u admin -p localdev123 --authenticationDatabase admin \
  < init-scripts/mongo/01-create-databases.js

docker exec -i clenergize-mongodb mongosh \
  -u admin -p localdev123 --authenticationDatabase admin \
  < init-scripts/mongo/02-create-users.js

# Continue for all scripts...

# Initialize LocalStack
chmod +x init-scripts/aws/init-localstack.sh
./init-scripts/aws/init-localstack.sh
```

---

## Data Relationships

### Dependency Order

```
1. Reference Data (emission factors, units, templates)
   ↓
2. Identity Data (users, roles)
   ↓
3. Organization Data (orgs, hierarchies, projects)
   ↓
4. Activity Data (activities)
   ↓
5. Calculation Data (emissions calculations)
   ↓
6. Reporting Data (reports, exports)
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7.0
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: localdev123
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ping\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Seed test data
        run: |
          for script in init-scripts/mongo/*.js; do
            mongosh "mongodb://admin:localdev123@localhost:27017/admin" < $script
          done

      - name: Run tests
        run: npm test
```

---

## Cleanup

### Reset All Data

```bash
# Drop all databases
docker exec -i clenergize-mongodb mongosh \
  -u admin -p localdev123 --authenticationDatabase admin \
  --eval "
    db.getSiblingDB('clenergize_identity').dropDatabase();
    db.getSiblingDB('clenergize_organization').dropDatabase();
    db.getSiblingDB('clenergize_reference').dropDatabase();
    db.getSiblingDB('clenergize_activity').dropDatabase();
    db.getSiblingDB('clenergize_calculation').dropDatabase();
    db.getSiblingDB('clenergize_reporting').dropDatabase();
    db.getSiblingDB('clenergize_audit').dropDatabase();
    db.getSiblingDB('clenergize_gateway').dropDatabase();
  "

# Re-run seed scripts
docker-compose restart mongodb
```

---

## Verification

```bash
# Check seeded data
mongosh "mongodb://admin:localdev123@localhost:27017/clenergize_reference?authSource=admin"
db.emission_factors.countDocuments()  # Should be 4
db.units.countDocuments()  # Should be 4
db.hierarchy_templates.countDocuments()  # Should be 2

# Check test users
mongosh "mongodb://admin:localdev123@localhost:27017/clenergize_identity?authSource=admin"
db.users.countDocuments()  # Should be 4

# Check organization data
mongosh "mongodb://admin:localdev123@localhost:27017/clenergize_organization?authSource=admin"
db.organizations.countDocuments()  # Should be 1
db.hierarchy_nodes.countDocuments()  # Should be 3
db.projects.countDocuments()  # Should be 1
```

---

**Last Updated**: November 17, 2025
**Maintained By**: Testing Agent + DevOps Agent
