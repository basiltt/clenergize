// Clenergize V3 - MongoDB Initialization Script
// Creates databases, users, and indexes for all 7 microservices
// Runs automatically when MongoDB container starts (via docker-entrypoint-initdb.d)

print('========================================');
print('Clenergize V3 - MongoDB Initialization');
print('========================================\n');

// Admin credentials (from docker-compose environment variables)
const adminUser = process.env.MONGO_INITDB_ROOT_USERNAME || 'admin';
const adminPassword = process.env.MONGO_INITDB_ROOT_PASSWORD || 'localdev123';

// Service databases configuration
const databases = [
  {
    name: 'clenergize_identity',
    description: 'Identity & Authentication Service',
    collections: ['users', 'roles', 'permissions', 'sessions', 'mfa_tokens', 'password_resets']
  },
  {
    name: 'clenergize_organization',
    description: 'Organization & Project Management Service',
    collections: ['organizations', 'projects', 'hierarchies', 'entities', 'subsidiaries', 'locations', 'scopes']
  },
  {
    name: 'clenergize_reference',
    description: 'Reference Data Management Service',
    collections: ['emission_factors', 'units', 'categories', 'sources', 'methodologies', 'conversions', 'versions']
  },
  {
    name: 'clenergize_activity',
    description: 'Activity Data Ingestion Service',
    collections: ['activity_data', 'imports', 'validation_errors', 'data_sources', 'ingestion_logs']
  },
  {
    name: 'clenergize_calculation',
    description: 'Emission Calculation Service',
    collections: ['calculations', 'emissions', 'aggregations', 'rollups', 'calculation_logs']
  },
  {
    name: 'clenergize_reporting',
    description: 'Reporting & Analytics Service',
    collections: ['reports', 'report_templates', 'exports', 'dashboards', 'insights', 'report_jobs']
  },
  {
    name: 'clenergize_audit',
    description: 'Audit & Compliance Service',
    collections: ['audit_logs', 'events', 'compliance_records', 'data_lineage']
  }
];

// Create databases and collections
databases.forEach(dbConfig => {
  print(`\nCreating database: ${dbConfig.name}`);
  print(`Description: ${dbConfig.description}`);

  const db = db.getSiblingDB(dbConfig.name);

  // Create collections
  dbConfig.collections.forEach(collectionName => {
    if (!db.getCollectionNames().includes(collectionName)) {
      db.createCollection(collectionName);
      print(`   Created collection: ${collectionName}`);
    } else {
      print(`  ™ Collection already exists: ${collectionName}`);
    }
  });

  // Create common indexes for all databases
  print(`  Creating common indexes...`);

  // All collections should have createdAt and updatedAt indexes
  dbConfig.collections.forEach(collectionName => {
    try {
      db[collectionName].createIndex({ createdAt: 1 });
      db[collectionName].createIndex({ updatedAt: 1 });
      print(`     Indexed ${collectionName}: createdAt, updatedAt`);
    } catch (e) {
      print(`    ! Error indexing ${collectionName}: ${e.message}`);
    }
  });

  // Service-specific indexes
  switch (dbConfig.name) {
    case 'clenergize_identity':
      db.users.createIndex({ email: 1 }, { unique: true });
      db.users.createIndex({ status: 1 });
      db.users.createIndex({ organizationId: 1 });
      db.sessions.createIndex({ userId: 1 });
      db.sessions.createIndex({ token: 1 }, { unique: true });
      db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      print('     Identity-specific indexes created');
      break;

    case 'clenergize_organization':
      db.organizations.createIndex({ name: 1 });
      db.organizations.createIndex({ status: 1 });
      db.projects.createIndex({ organizationId: 1 });
      db.projects.createIndex({ status: 1 });
      db.hierarchies.createIndex({ projectId: 1 });
      db.entities.createIndex({ projectId: 1 });
      db.subsidiaries.createIndex({ entityId: 1 });
      db.locations.createIndex({ subsidiaryId: 1 });
      print('     Organization-specific indexes created');
      break;

    case 'clenergize_reference':
      db.emission_factors.createIndex({ code: 1 }, { unique: true });
      db.emission_factors.createIndex({ category: 1 });
      db.emission_factors.createIndex({ version: 1 });
      db.emission_factors.createIndex({ validFrom: 1, validTo: 1 });
      db.units.createIndex({ code: 1 }, { unique: true });
      db.conversions.createIndex({ fromUnit: 1, toUnit: 1 });
      print('     Reference-specific indexes created');
      break;

    case 'clenergize_activity':
      db.activity_data.createIndex({ projectId: 1, scopeId: 1 });
      db.activity_data.createIndex({ period: 1 });
      db.activity_data.createIndex({ status: 1 });
      db.imports.createIndex({ status: 1 });
      db.imports.createIndex({ userId: 1 });
      db.validation_errors.createIndex({ importId: 1 });
      print('     Activity-specific indexes created');
      break;

    case 'clenergize_calculation':
      db.calculations.createIndex({ activityDataId: 1 });
      db.calculations.createIndex({ projectId: 1, scopeId: 1 });
      db.calculations.createIndex({ status: 1 });
      db.emissions.createIndex({ calculationId: 1 });
      db.emissions.createIndex({ projectId: 1, period: 1 });
      db.aggregations.createIndex({ projectId: 1, period: 1, level: 1 });
      print('     Calculation-specific indexes created');
      break;

    case 'clenergize_reporting':
      db.reports.createIndex({ projectId: 1 });
      db.reports.createIndex({ type: 1 });
      db.reports.createIndex({ status: 1 });
      db.exports.createIndex({ reportId: 1 });
      db.exports.createIndex({ status: 1 });
      db.report_jobs.createIndex({ status: 1 });
      db.report_jobs.createIndex({ scheduledAt: 1 });
      print('     Reporting-specific indexes created');
      break;

    case 'clenergize_audit':
      db.audit_logs.createIndex({ userId: 1 });
      db.audit_logs.createIndex({ action: 1 });
      db.audit_logs.createIndex({ resourceType: 1, resourceId: 1 });
      db.audit_logs.createIndex({ timestamp: 1 });
      db.events.createIndex({ eventType: 1 });
      db.events.createIndex({ aggregateId: 1 });
      db.events.createIndex({ correlationId: 1 });
      print('     Audit-specific indexes created');
      break;
  }

  print(` Database ${dbConfig.name} initialized successfully\n`);
});

print('========================================');
print('MongoDB Initialization Complete!');
print('========================================\n');
print('Summary:');
print(`  - Created ${databases.length} databases`);
print(`  - Total collections: ${databases.reduce((sum, db) => sum + db.collections.length, 0)}`);
print('  - Indexes created for optimal query performance');
print('\nServices can now connect to their respective databases.\n');
