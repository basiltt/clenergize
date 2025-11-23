# Data Migration & Rollback Plan

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: ACTIVE
**Phase**: 4 (Migration Phase)
**Priority**: CRITICAL

---

## Executive Summary

This document defines comprehensive migration and rollback procedures for migrating data from the OLD Clenergize architecture to the NEW microservices architecture. The plan ensures **zero data loss**, **minimal downtime**, and **safe rollback capabilities** at every checkpoint.

### Critical Success Criteria

| Criterion | Target | Method |
|-----------|--------|--------|
| **Data Loss** | 0% | Backup verification + reconciliation |
| **Downtime** | < 2 hours | Phased migration with checkpoints |
| **Rollback Time** | < 15 minutes | Automated scripts |
| **Data Consistency** | 100% | Hash-based validation |
| **Rollback Window** | 48 hours | Dual-run period |

---

## Table of Contents

1. [Migration Strategy Overview](#migration-strategy-overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Migration Checkpoints](#migration-checkpoints)
4. [Rollback Scenarios](#rollback-scenarios)
5. [Data Reconciliation](#data-reconciliation)
6. [Rollback Procedures](#rollback-procedures)
7. [Post-Rollback Actions](#post-rollback-actions)
8. [Migration Scripts](#migration-scripts)

---

## Migration Strategy Overview

### Phased Approach

```
Phase 4.1: Identity Data (Users, Roles, Permissions)
  ↓
Phase 4.2: Organization Data (Companies, Projects, Hierarchies)
  ↓
Phase 4.3: Reference Data (Emission Factors, Units)
  ↓
Phase 4.4: Activity Data
  ↓
Phase 4.5: Calculation Results
  ↓
Phase 4.6: Reports & Audit Logs
```

### Dual-Run Strategy

```
T-0: OLD system running (production)
  ↓
T+0: Start migration
T+0 to T+24h: Dual write (OLD + NEW)
  ↓
T+24h: Switch reads to NEW
T+24h to T+48h: Dual write continues (safety net)
  ↓
T+48h: Decommission OLD writes
  ↓
T+7d: Archive OLD database
```

---

## Pre-Migration Checklist

### Week -2: Planning & Preparation

```yaml
Infrastructure:
  - [ ] NEW services deployed and health-checked
  - [ ] Database schemas validated
  - [ ] Event bus configured
  - [ ] Monitoring dashboards ready
  - [ ] Backup storage provisioned (S3)
  - [ ] Rollback scripts tested in staging

Communication:
  - [ ] Stakeholders notified (2-week notice)
  - [ ] Maintenance window scheduled
  - [ ] War room booked
  - [ ] On-call rotation defined
  - [ ] Communication templates prepared

Testing:
  - [ ] Migration scripts tested with 10% sample
  - [ ] Rollback tested successfully 3 times
  - [ ] Data validation scripts verified
  - [ ] Performance tested with production-like data
```

### Week -1: Final Preparations

```yaml
Data:
  - [ ] Full backup of OLD databases
  - [ ] Backup verification (restore test)
  - [ ] Row count baselines documented
  - [ ] Checksum calculations for key tables
  - [ ] Test migration completed successfully

Access:
  - [ ] Migration service accounts created
  - [ ] Database credentials rotated
  - [ ] VPN/Network access verified
  - [ ] S3 bucket permissions validated

Runbook:
  - [ ] Migration runbook reviewed
  - [ ] Rollback runbook reviewed
  - [ ] Emergency contacts list updated
  - [ ] Decision tree printed and available
```

### Day -1: Final Verification

```yaml
- [ ] All team members available and briefed
- [ ] Backup storage verified (10TB+ free)
- [ ] NEW services scaled to handle production load
- [ ] Circuit breakers configured
- [ ] Feature flags ready for quick rollback
- [ ] Monitoring alerts configured
- [ ] Final backup taken and verified
- [ ] GO/NO-GO meeting completed
```

---

## Migration Checkpoints

### Checkpoint 1: Identity Data (Users)

```yaml
Scope: User authentication and authorization data

Data Volume:
  - Users: ~5,000 records
  - Roles: ~20 records
  - Permissions: ~10,000 records

Duration Estimate: 30 minutes

Pre-Checkpoint:
  - [ ] Backup taken: OLD.user_management database
  - [ ] NEW identity-service database empty
  - [ ] Test user created successfully

Migration Steps:
  1. Enable read-only mode on OLD users table
  2. Export users to JSON (with hashed passwords)
  3. Transform data (single 'name' → 'firstName'+'lastName')
  4. Import to NEW identity database
  5. Verify password hashes still work
  6. Test login with 10 sample users
  7. Compare row counts (OLD vs NEW)

Validation Criteria:
  - Row count matches: OLD.users === NEW.users
  - Sample login test: 10/10 successful
  - Password hashes valid: 100%
  - Roles assigned correctly: 100%

Rollback Trigger:
  - Validation failure rate > 1%
  - Login test failures > 0%
  - Duration exceeded by 50%
  - Critical error encountered

GO Decision Criteria:
  ✅ All validation checks passed
  ✅ Duration within estimates
  ✅ No critical errors
  ✅ Team confidence: HIGH

NO-GO Decision Criteria:
  ❌ Any validation check failed
  ❌ Duration exceeded significantly
  ❌ Critical errors encountered
  ❌ Team confidence: LOW or MEDIUM

Rollback Window: 1 hour
```

---

### Checkpoint 2: Organization Data (Projects)

```yaml
Scope: Companies, projects, hierarchies (CRITICAL - fixing hierarchy cloning)

Data Volume:
  - Companies: ~500 records
  - Projects: ~2,000 records
  - Hierarchies: ~10,000 nodes
  - Permissions: ~50,000 records

Duration Estimate: 1 hour

Critical Transformation:
  OLD: Cloned hierarchy data in each project (70% wasted storage)
  NEW: Hierarchy template references + project-specific snapshots

Pre-Checkpoint:
  - [ ] Checkpoint 1 completed successfully
  - [ ] Backup taken: OLD.project_management database
  - [ ] Hierarchy templates created in reference database

Migration Steps:
  1. Export all projects and hierarchies
  2. Identify unique hierarchy templates (deduplicate)
  3. Create hierarchy templates in reference-service
  4. Transform projects to use template references
  5. Create snapshots for historical projects
  6. Migrate customizations as overrides
  7. Import to NEW organization database
  8. Rebuild permission mappings

Validation Criteria:
  - Row counts match (with deduplication)
  - Hierarchy integrity: 100% (no orphaned nodes)
  - Permission assignments preserved: 100%
  - Sample project queries return same results: 10/10
  - Storage reduction: > 60%

Rollback Trigger:
  - Hierarchy integrity check fails
  - Permission validation fails > 1%
  - Storage reduction < 50%
  - Data corruption detected

Rollback Window: 2 hours
```

---

### Checkpoint 3: Reference Data

```yaml
Scope: Emission factors, units, conversion rules

Data Volume:
  - Emission factors: ~50,000 records
  - Units: ~200 records
  - Conversion rules: ~1,000 records

Duration Estimate: 20 minutes

Pre-Checkpoint:
  - [ ] Checkpoints 1 & 2 completed
  - [ ] Backup taken: OLD.master_data database
  - [ ] Versioning system initialized

Migration Steps:
  1. Export emission factors with metadata
  2. Add versioning information
  3. Import to NEW reference database
  4. Create version snapshots
  5. Build lookup indexes

Validation Criteria:
  - Factor count matches: 100%
  - No NULL values in critical fields
  - All factors have valid sources
  - Lookup performance: < 50ms p95

Rollback Window: 30 minutes
```

---

### Checkpoint 4: Activity Data

```yaml
Scope: Activity data entries

Data Volume: ~1,000,000 records
Duration Estimate: 2 hours

Migration Strategy: Batch processing (10,000 records/batch)

Pre-Checkpoint:
  - [ ] Checkpoints 1-3 completed
  - [ ] Backup taken: OLD.carbon_footprint (activity portion)
  - [ ] NEW activity-service scaled up

Migration Steps:
  1. Enable read-only mode on OLD activity data
  2. Export in batches (10K records)
  3. Transform data format
  4. Validate each batch
  5. Import to NEW activity database
  6. Verify foreign key relationships (projects, hierarchies)

Validation Criteria:
  - Row count matches: 100%
  - Foreign key integrity: 100%
  - Date ranges valid: 100%
  - Sample data spot-check: 100/100 records

Rollback Trigger:
  - Batch validation failure > 5%
  - Foreign key violations detected
  - Duration exceeded by 100%

Rollback Window: 3 hours
```

---

### Checkpoint 5: Calculation Results

```yaml
Scope: Historical emission calculations

Data Volume: ~5,000,000 records
Duration Estimate: 4 hours

Migration Strategy: Batch processing + verification

Pre-Checkpoint:
  - [ ] Checkpoints 1-4 completed
  - [ ] Backup taken: OLD.carbon_footprint (calculations)
  - [ ] Calculation service ready

Migration Steps:
  1. Export calculation results in batches
  2. Recalculate 10% sample to verify OLD calculations
  3. Import historical results to NEW
  4. Verify calculations match (within 0.01 precision)
  5. Flag any discrepancies for manual review

Validation Criteria:
  - Row count matches: 100%
  - Recalculation verification: > 99.9% match
  - No calculation methodology mismatch
  - Aggregated totals match: 100%

Rollback Window: 4 hours
```

---

## Rollback Scenarios

### Scenario 1: Partial Migration Failure (< 50% complete)

**Situation**: Migration fails during Checkpoint 2 (Organization Data)

```yaml
Impact: Medium
Data at Risk: Low (Checkpoint 1 data already migrated)
Recovery Time Objective (RTO): 15 minutes
Recovery Point Objective (RPO): 0 (no data loss)

Rollback Procedure:

Step 1: Immediate Actions (0-5 minutes)
  - [ ] STOP migration process immediately
  - [ ] Enable maintenance mode on NEW services
  - [ ] Switch ALL traffic back to OLD system
  - [ ] Notify stakeholders via Slack/email

Step 2: Database Cleanup (5-10 minutes)
  - [ ] Drop NEW database tables created during failed migration
  - [ ] Verify OLD database integrity (checksum validation)
  - [ ] Restore OLD database from backup (if needed)
  - [ ] Verify OLD system responding normally

Step 3: Service Restoration (10-15 minutes)
  - [ ] Disable read-only mode on OLD databases
  - [ ] Test OLD system functionality (login, project load)
  - [ ] Verify 10 key user workflows working
  - [ ] Remove maintenance mode

Step 4: Logging & Analysis (post-rollback)
  - [ ] Capture all migration logs
  - [ ] Document failure point and root cause
  - [ ] Update migration scripts with fixes
  - [ ] Schedule post-mortem meeting

Success Criteria:
  ✅ OLD system fully operational
  ✅ Zero data loss confirmed
  ✅ Users can access system normally
  ✅ All services responding

Data Loss: NONE (OLD database untouched)
```

---

### Scenario 2: Post-Migration Issues (> 50% complete)

**Situation**: Migration completed, but critical issues discovered within 24 hours

```yaml
Impact: High
Data at Risk: Medium (data written to NEW during dual-run)
Recovery Time Objective (RTO): 1 hour
Recovery Point Objective (RPO): Controlled data loss window

Rollback Procedure:

Step 1: Assessment (0-10 minutes)
  - [ ] Determine issue severity (data corruption vs performance)
  - [ ] Identify data created in NEW during dual-run period
  - [ ] Calculate data loss window
  - [ ] Make GO/NO-GO rollback decision

Step 2: Data Preservation (10-20 minutes)
  - [ ] Export delta records from NEW (created during dual-run)
  - [ ] Store delta records in S3 for later re-import
  - [ ] Verify delta export completeness

Step 3: Database Restoration (20-40 minutes)
  - [ ] Enable read-only mode on NEW services
  - [ ] Switch traffic to OLD system
  - [ ] Restore OLD database from pre-migration backup
  - [ ] Import delta records into OLD (if compatible)
  - [ ] Reconcile any conflicts

Step 4: Verification (40-60 minutes)
  - [ ] Verify OLD system operational
  - [ ] Test critical workflows (10 scenarios)
  - [ ] Compare row counts before/after
  - [ ] Validate delta records imported correctly

Step 5: Communication
  - [ ] Notify users of rollback
  - [ ] Document data loss window (if any)
  - [ ] Provide status updates every 15 minutes

Success Criteria:
  ✅ OLD system fully operational
  ✅ Delta records preserved
  ✅ Data reconciled successfully
  ✅ Users notified

Data Loss: Controlled (delta records preserved)
```

---

### Scenario 3: Critical Failure (Production Down)

**Situation**: NEW system crashes, OLD system inaccessible

```yaml
Impact: CRITICAL
Data at Risk: High
Recovery Time Objective (RTO): 5 minutes
Recovery Point Objective (RPO): Last backup point

Emergency Rollback Procedure:

Step 1: IMMEDIATE Switch (0-2 minutes)
  - [ ] Execute emergency DNS failover to OLD backup
  - [ ] Disable ALL NEW services
  - [ ] Activate OLD standby database
  - [ ] Send emergency broadcast to all users

Step 2: OLD Activation (2-5 minutes)
  - [ ] Start OLD services from backup
  - [ ] Verify database connection
  - [ ] Test login for admin users
  - [ ] Enable traffic routing

Step 3: Damage Assessment (post-restoration)
  - [ ] Determine root cause of failure
  - [ ] Calculate data loss window
  - [ ] Identify affected users/records
  - [ ] Plan data recovery strategy

Step 4: Data Recovery (hours to days)
  - [ ] Restore from last known good backup
  - [ ] Identify missing transactions
  - [ ] Manual data entry for critical lost data
  - [ ] User communication about data loss

Success Criteria:
  ✅ System online within 5 minutes
  ✅ Basic functionality restored
  ✅ Communication sent to users

Data Loss: Possible (last backup to failure point)
Accepted Trade-off: Availability > Consistency in this scenario
```

---

## Data Reconciliation

### Reconciliation Checks

#### 1. Row Count Validation

```sql
-- OLD database
SELECT
  'users' AS table_name,
  COUNT(*) AS old_count
FROM OLD.users
UNION ALL
SELECT 'projects', COUNT(*) FROM OLD.projects
UNION ALL
SELECT 'activity_data', COUNT(*) FROM OLD.activity_data;

-- NEW database
SELECT
  'users' AS table_name,
  COUNT(*) AS new_count
FROM NEW.identity.users
UNION ALL
SELECT 'projects', COUNT(*) FROM NEW.organization.projects
UNION ALL
SELECT 'activity_data', COUNT(*) FROM NEW.activity.activity_data;

-- Comparison
-- Expected: old_count === new_count (or new_count higher due to deduplication)
```

---

#### 2. Hash-Based Validation

```typescript
// Compare key records using content hashing
import crypto from 'crypto';

async function validateDataConsistency(
  oldRecord: any,
  newRecord: any
): Promise<boolean> {
  // Hash critical fields
  const oldHash = crypto
    .createHash('sha256')
    .update(JSON.stringify({
      email: oldRecord.email,
      createdAt: oldRecord.created_at,
      status: oldRecord.status
    }))
    .digest('hex');

  const newHash = crypto
    .createHash('sha256')
    .update(JSON.stringify({
      email: newRecord.email,
      createdAt: newRecord.createdAt,
      status: newRecord.status
    }))
    .digest('hex');

  return oldHash === newHash;
}

// Sample 10% of records for validation
async function sampleValidation() {
  const oldUsers = await oldDb.users.find().limit(500);
  const matches = 0;
  const mismatches = [];

  for (const oldUser of oldUsers) {
    const newUser = await newDb.users.findOne({ email: oldUser.email });
    if (await validateDataConsistency(oldUser, newUser)) {
      matches++;
    } else {
      mismatches.push({ old: oldUser, new: newUser });
    }
  }

  console.log(`Validation: ${matches}/500 matched (${(matches/500*100).toFixed(2)}%)`);
  if (mismatches.length > 0) {
    console.error('Mismatches found:', mismatches);
  }
}
```

---

#### 3. Aggregation Validation

```typescript
// Verify aggregated totals match
interface ValidationResult {
  old: number;
  new: number;
  delta: number;
  percentDiff: number;
  status: 'PASS' | 'FAIL';
}

async function validateAggregations(): Promise<ValidationResult[]> {
  const checks = [
    {
      name: 'Total Emissions (Scope 1)',
      oldQuery: 'SELECT SUM(scope1_emissions) FROM OLD.calculations',
      newQuery: 'SELECT SUM(scope1_co2e) FROM NEW.calculation.emissions'
    },
    {
      name: 'Active Users Count',
      oldQuery: 'SELECT COUNT(*) FROM OLD.users WHERE status = "ACTIVE"',
      newQuery: 'SELECT COUNT(*) FROM NEW.identity.users WHERE status = "ACTIVE"'
    },
    {
      name: 'Active Projects Count',
      oldQuery: 'SELECT COUNT(*) FROM OLD.projects WHERE status = "ACTIVE"',
      newQuery: 'SELECT COUNT(*) FROM NEW.organization.projects WHERE status = "ACTIVE"'
    }
  ];

  const results: ValidationResult[] = [];

  for (const check of checks) {
    const oldValue = await oldDb.query(check.oldQuery);
    const newValue = await newDb.query(check.newQuery);
    const delta = newValue - oldValue;
    const percentDiff = (delta / oldValue) * 100;

    results.push({
      name: check.name,
      old: oldValue,
      new: newValue,
      delta,
      percentDiff,
      status: Math.abs(percentDiff) < 0.01 ? 'PASS' : 'FAIL'
    });
  }

  return results;
}

// Example output:
// {
//   name: 'Total Emissions (Scope 1)',
//   old: 1234567.89,
//   new: 1234567.91,
//   delta: 0.02,
//   percentDiff: 0.0000162,
//   status: 'PASS'
// }
```

---

#### 4. Foreign Key Integrity

```typescript
// Verify all foreign key relationships are valid
async function validateForeignKeys() {
  const checks = [
    {
      table: 'activity_data',
      foreignKey: 'project_id',
      references: 'projects'
    },
    {
      table: 'calculations',
      foreignKey: 'activity_data_id',
      references: 'activity_data'
    },
    {
      table: 'permissions',
      foreignKey: 'user_id',
      references: 'users'
    }
  ];

  for (const check of checks) {
    const orphanedRecords = await newDb.query(`
      SELECT COUNT(*) as orphaned
      FROM ${check.table} t
      LEFT JOIN ${check.references} r ON t.${check.foreignKey} = r.id
      WHERE r.id IS NULL
    `);

    if (orphanedRecords > 0) {
      console.error(`❌ Found ${orphanedRecords} orphaned records in ${check.table}`);
      return false;
    } else {
      console.log(`✅ ${check.table}.${check.foreignKey} integrity verified`);
    }
  }

  return true;
}
```

---

## Rollback Procedures

### Automated Rollback Script

```bash
#!/bin/bash
# rollback.sh - Emergency rollback script

set -e # Exit on any error

ROLLBACK_SCENARIO=$1 # partial, post-migration, critical
CHECKPOINT=$2         # 1, 2, 3, 4, 5

echo "🚨 INITIATING ROLLBACK - Scenario: $ROLLBACK_SCENARIO, Checkpoint: $CHECKPOINT"
echo "⏰ Started at: $(date)"

# Step 1: Stop NEW services
echo "Stopping NEW services..."
kubectl scale deployment/identity-service --replicas=0
kubectl scale deployment/organization-service --replicas=0
kubectl scale deployment/reference-service --replicas=0
kubectl scale deployment/activity-service --replicas=0
kubectl scale deployment/calculation-service --replicas=0
kubectl scale deployment/reporting-service --replicas=0
kubectl scale deployment/audit-service --replicas=0

# Step 2: Switch traffic to OLD
echo "Switching traffic to OLD system..."
kubectl patch service api-gateway -p '{"spec":{"selector":{"version":"old"}}}'

# Step 3: Restore OLD database (if needed)
if [ "$ROLLBACK_SCENARIO" == "critical" ]; then
  echo "Restoring OLD database from backup..."
  mongorestore --uri="$OLD_MONGODB_URI" --archive="$BACKUP_PATH/old-db-backup.archive"
fi

# Step 4: Remove read-only mode
echo "Enabling writes on OLD database..."
mongo "$OLD_MONGODB_URI" --eval "db.adminCommand({setParameter: 1, readOnly: false})"

# Step 5: Health check OLD system
echo "Health checking OLD system..."
for service in user-management project-management master-data carbon-footprint backend; do
  response=$(curl -s -o /dev/null -w "%{http_code}" "http://old-api.clenergize.com/health")
  if [ "$response" -eq 200 ]; then
    echo "✅ $service healthy"
  else
    echo "❌ $service unhealthy (HTTP $response)"
    exit 1
  fi
done

echo "✅ ROLLBACK COMPLETED at $(date)"
echo "📊 Next steps:"
echo "  1. Verify user access"
echo "  2. Check critical workflows"
echo "  3. Schedule post-mortem"
echo "  4. Analyze failure root cause"
```

---

## Post-Rollback Actions

### Immediate Actions (0-1 hour)

```yaml
- [ ] Verify OLD system fully operational
- [ ] Test 10 critical user workflows
- [ ] Notify all stakeholders of rollback
- [ ] Document rollback timeline
- [ ] Capture all logs and metrics
```

### Short-Term Actions (1-24 hours)

```yaml
- [ ] Conduct post-mortem meeting
- [ ] Root cause analysis documented
- [ ] Update migration scripts with fixes
- [ ] Test fixes in staging environment
- [ ] Calculate business impact
- [ ] User communication strategy
```

### Long-Term Actions (1-7 days)

```yaml
- [ ] Reschedule migration attempt
- [ ] Enhanced testing plan created
- [ ] Additional validation checks added
- [ ] Rollback automation improved
- [ ] Team retrospective completed
- [ ] Lessons learned documented
```

---

## Migration Scripts

### Example: User Migration Script

```typescript
// migrate-users.ts
import { MongoClient } from 'mongodb';
import { logger } from './logger';

interface OldUser {
  _id: string;
  email: string;
  password_hash: string;
  name: string;
  status: string;
  created_at: Date;
}

interface NewUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

export async function migrateUsers(
  oldDb: MongoClient,
  newDb: MongoClient
): Promise<{ success: number; failed: number; errors: any[] }> {
  const stats = { success: 0, failed: 0, errors: [] };

  const oldUsers = await oldDb.db('user_management').collection('users').find().toArray();
  logger.info(`Found ${oldUsers.length} users to migrate`);

  for (const oldUser of oldUsers as unknown as OldUser[]) {
    try {
      const [firstName, ...lastNameParts] = oldUser.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      const newUser: NewUser = {
        id: oldUser._id,
        email: oldUser.email,
        passwordHash: oldUser.password_hash,
        firstName,
        lastName,
        status: oldUser.status as 'ACTIVE' | 'PENDING' | 'SUSPENDED',
        createdAt: oldUser.created_at,
        updatedAt: new Date()
      };

      await newDb.db('identity').collection('users').insertOne(newUser);
      stats.success++;

      if (stats.success % 100 === 0) {
        logger.info(`Migrated ${stats.success}/${oldUsers.length} users`);
      }
    } catch (error) {
      stats.failed++;
      stats.errors.push({ user: oldUser, error });
      logger.error(`Failed to migrate user ${oldUser.email}:`, error);
    }
  }

  logger.info(`Migration complete: ${stats.success} success, ${stats.failed} failed`);
  return stats;
}
```

---

**Last Updated**: November 18, 2025
**Next Review**: Before Phase 4 Migration (Sprint 3.3)
**Maintained By**: Migration Agent + DevOps Agent + Master Coordinator
