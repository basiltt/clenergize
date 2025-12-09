#!/usr/bin/env ts-node

import 'dotenv/config';
import { program } from 'commander';
import chalk from 'chalk';
import logger from './utils/logger';
import { dbManager } from './utils/db-connection';
import migrateIdentityService from './migrations/identity-migration';
import migrateOrganizationService from './migrations/organization-migration';

interface MigrationOptions {
  dryRun: boolean;
  services: string[];
  skipBackup: boolean;
  continueOnError: boolean;
}

/**
 * Main migration orchestrator
 *
 * Runs all service migrations in the correct order to handle dependencies
 */
async function main() {
  // Parse command line arguments
  program
    .name('migrate-all')
    .description('Migrate data from OLD Clenergize V3 to NEW microservices architecture')
    .version('1.0.0')
    .option('-d, --dry-run', 'Run migration without making changes', false)
    .option('-s, --services <services>', 'Comma-separated list of services to migrate (identity,organization,reference,activity)', 'all')
    .option('--skip-backup', 'Skip creating backups before migration', false)
    .option('--continue-on-error', 'Continue migration even if a service fails', false)
    .parse();

  const options = program.opts<MigrationOptions>();

  // Display migration configuration
  displayHeader(options);

  // Validate environment
  validateEnvironment();

  // Connect to databases
  logger.info(chalk.bold('\n📡 Connecting to databases...\n'));
  try {
    await dbManager.connect();
  } catch (error) {
    logger.error('Failed to connect to databases:', error);
    process.exit(1);
  }

  const databases = dbManager.getDatabases();

  // Determine which services to migrate
  const servicesToMigrate = options.services === 'all'
    ? ['identity', 'organization', 'reference', 'activity']
    : options.services.split(',').map(s => s.trim().toLowerCase());

  logger.info(chalk.bold(`\n🚀 Starting migration for services: ${servicesToMigrate.join(', ')}\n`));

  // Track overall statistics
  const overallStats: any = {
    startTime: Date.now(),
    servicesCompleted: [],
    servicesFailed: [],
    totalDuration: 0
  };

  try {
    // MIGRATION ORDER (respects dependencies):
    // 1. Identity (no dependencies)
    // 2. Organization (no dependencies)
    // 3. Reference (no dependencies)
    // 4. Activity (depends on Organization + Reference)
    // 5. Calculation (depends on Activity)
    // 6. Reporting (depends on Calculation)
    // 7. Audit (consumes events from all)

    // 1. IDENTITY SERVICE
    if (servicesToMigrate.includes('identity')) {
      try {
        const stats = await migrateIdentityService(
          databases.old.userManagement,
          databases.new.identity,
          options.dryRun
        );
        overallStats.servicesCompleted.push({ service: 'identity', stats });
        overallStats.identityStats = stats;
      } catch (error) {
        logger.error('Identity migration failed:', error);
        overallStats.servicesFailed.push({ service: 'identity', error: (error as Error).message });
        if (!options.continueOnError) {
          throw error;
        }
      }
    }

    // 2. ORGANIZATION SERVICE (CRITICAL - includes hierarchy deduplication)
    if (servicesToMigrate.includes('organization')) {
      try {
        const stats = await migrateOrganizationService(
          databases.old.projectManagement,
          databases.old.companyDetails,
          databases.new.organization,
          options.dryRun
        );
        overallStats.servicesCompleted.push({ service: 'organization', stats });
        overallStats.organizationStats = stats;
      } catch (error) {
        logger.error('Organization migration failed:', error);
        overallStats.servicesFailed.push({ service: 'organization', error: (error as Error).message });
        if (!options.continueOnError) {
          throw error;
        }
      }
    }

    // 3. REFERENCE SERVICE
    if (servicesToMigrate.includes('reference')) {
      logger.info(chalk.yellow('\n⚠️  Reference Service migration not yet implemented'));
      logger.info('   This service requires migration of emission factors, parameters, and units');
      logger.info('   Will be implemented in next iteration\n');
    }

    // 4. ACTIVITY SERVICE
    if (servicesToMigrate.includes('activity')) {
      logger.info(chalk.yellow('\n⚠️  Activity Service migration not yet implemented'));
      logger.info('   This service requires migration of activity data and carbon scopes');
      logger.info('   Will be implemented in next iteration\n');
    }

    // Calculate total duration
    overallStats.totalDuration = Date.now() - overallStats.startTime;

    // Display final summary
    displayMigrationSummary(overallStats, options);

    // Success!
    logger.info(chalk.bold.green('\n✅ Migration completed successfully!\n'));
    process.exit(0);

  } catch (error) {
    logger.error(chalk.bold.red('\n❌ Migration failed:'), error);
    process.exit(1);
  } finally {
    // Disconnect from databases
    logger.info('\n📡 Disconnecting from databases...');
    await dbManager.disconnect();
  }
}

/**
 * Display migration header
 */
function displayHeader(options: MigrationOptions) {
  console.log(chalk.bold.cyan('\n' + '='.repeat(80)));
  console.log(chalk.bold.cyan('  CLENERGIZE V3 DATA MIGRATION'));
  console.log(chalk.bold.cyan('  OLD System → NEW Microservices Architecture'));
  console.log(chalk.bold.cyan('='.repeat(80)));

  console.log(chalk.bold('\nMigration Configuration:'));
  console.log(`  Mode: ${options.dryRun ? chalk.yellow('DRY RUN (no changes will be made)') : chalk.green('LIVE')}`);
  console.log(`  Services: ${options.services}`);
  console.log(`  Backup: ${options.skipBackup ? chalk.yellow('SKIPPED') : chalk.green('ENABLED')}`);
  console.log(`  Continue on Error: ${options.continueOnError ? chalk.yellow('YES') : chalk.red('NO')}`);
  console.log(`  Batch Size: ${process.env.MIGRATION_BATCH_SIZE || '1000'}`);
  console.log(`  Parallel Workers: ${process.env.MIGRATION_PARALLEL_WORKERS || '4'}`);
  console.log('');
}

/**
 * Validate required environment variables
 */
function validateEnvironment() {
  const required = [
    'OLD_MONGODB_URI',
    'NEW_IDENTITY_MONGODB_URI',
    'NEW_ORGANIZATION_MONGODB_URI',
    'NEW_REFERENCE_MONGODB_URI',
    'NEW_ACTIVITY_MONGODB_URI'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    logger.error(chalk.red('\n❌ Missing required environment variables:'));
    missing.forEach(key => logger.error(`   - ${key}`));
    logger.error('\nPlease create a .env file based on .env.example\n');
    process.exit(1);
  }

  logger.info(chalk.green('✓ Environment variables validated'));
}

/**
 * Display migration summary
 */
function displayMigrationSummary(stats: any, options: MigrationOptions) {
  console.log(chalk.bold.cyan('\n' + '='.repeat(80)));
  console.log(chalk.bold.cyan('  MIGRATION SUMMARY'));
  console.log(chalk.bold.cyan('='.repeat(80)));

  console.log(chalk.bold('\nServices Completed:'));
  stats.servicesCompleted.forEach((s: any) => {
    console.log(chalk.green(`  ✓ ${s.service}`));
    if (s.stats) {
      Object.entries(s.stats).forEach(([key, value]) => {
        if (key !== 'duration') {
          console.log(`    ${key}: ${value}`);
        }
      });
    }
  });

  if (stats.servicesFailed.length > 0) {
    console.log(chalk.bold('\nServices Failed:'));
    stats.servicesFailed.forEach((s: any) => {
      console.log(chalk.red(`  ✗ ${s.service}: ${s.error}`));
    });
  }

  console.log(chalk.bold('\nPerformance:'));
  console.log(`  Total Duration: ${formatDuration(stats.totalDuration)}`);

  if (stats.identityStats) {
    console.log(chalk.bold('\nIdentity Service:'));
    console.log(`  Users Migrated: ${stats.identityStats.usersCreated}/${stats.identityStats.usersProcessed}`);
    console.log(`  Duration: ${formatDuration(stats.identityStats.duration)}`);
  }

  if (stats.organizationStats) {
    console.log(chalk.bold('\nOrganization Service:'));
    console.log(`  Organizations: ${stats.organizationStats.organizationsCreated}/${stats.organizationStats.organizationsProcessed}`);
    console.log(`  Projects: ${stats.organizationStats.projectsCreated}/${stats.organizationStats.projectsProcessed}`);
    console.log(`  Entities: ${stats.organizationStats.entitiesCreated}/${stats.organizationStats.entitiesProcessed}`);
    console.log(`  Hierarchies Deduplicated: ${stats.organizationStats.hierarchiesDeduplicated}`);
    console.log(`  Hierarchy Templates Created: ${stats.organizationStats.hierarchyTemplatesCreated}`);
    console.log(`  Duration: ${formatDuration(stats.organizationStats.duration)}`);
  }

  if (options.dryRun) {
    console.log(chalk.yellow.bold('\n⚠️  DRY RUN - No changes were made to the database'));
  }

  console.log('');
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Run migration
main().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
