#!/usr/bin/env node

import { Command } from 'commander';
import mongoose from 'mongoose';
import chalk from 'chalk';
import { MigrationRunner } from './migration-runner';
import { MigrationConfig } from './interfaces/migration.interface';
import * as path from 'path';
import * as fs from 'fs';

/**
 * CLI tool for managing database migrations
 */
const program = new Command();

// Load configuration
function loadConfig(): MigrationConfig {
  const configPath = path.resolve(process.cwd(), 'migration.config.js');

  if (fs.existsSync(configPath)) {
    return require(configPath);
  }

  // Default configuration
  return {
    connectionUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    databaseName: process.env.DB_NAME || 'clenergize',
    migrationsPath: path.resolve(process.cwd(), 'migrations'),
    migrationsCollection: '_migrations',
    migrationPattern: '*.migration.js',
    useTransactions: true,
    validateChecksums: true,
    timeout: 60000,
  };
}

// Connect to MongoDB
async function connect(config: MigrationConfig): Promise<mongoose.Connection> {
  const connection = await mongoose.connect(config.connectionUri, {
    dbName: config.databaseName,
  });

  console.log(chalk.green('✓'), 'Connected to MongoDB');
  return connection.connection;
}

// Disconnect from MongoDB
async function disconnect(): Promise<void> {
  await mongoose.disconnect();
  console.log(chalk.gray('Disconnected from MongoDB'));
}

// Error handler
function handleError(error: Error): void {
  console.error(chalk.red('✗'), 'Error:', error.message);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
}

// Main program
program
  .name('clenergize-migrate')
  .description('Database migration tool for Clenergize V3')
  .version('1.0.0');

// Up command
program
  .command('up [target]')
  .description('Run pending migrations')
  .option('-d, --dry-run', 'Simulate migrations without executing')
  .action(async (target, options) => {
    try {
      const config = loadConfig();
      config.dryRun = options.dryRun;

      const connection = await connect(config);
      const runner = new MigrationRunner(connection, config);

      console.log(chalk.blue('→'), 'Running migrations...');
      const result = await runner.up(target);

      // Display results
      if (result.successful.length > 0) {
        console.log(chalk.green('✓'), `${result.successful.length} migrations completed:`);
        result.successful.forEach(m => {
          console.log(
            chalk.gray('  •'),
            m.name,
            chalk.gray(`(${m.executionTime}ms)`)
          );
        });
      }

      if (result.failed.length > 0) {
        console.log(chalk.red('✗'), `${result.failed.length} migrations failed:`);
        result.failed.forEach(m => {
          console.log(chalk.red('  •'), m.name, chalk.red(`- ${m.error?.message}`));
        });
      }

      if (result.skipped.length > 0) {
        console.log(chalk.yellow('⊘'), `${result.skipped.length} migrations skipped`);
      }

      console.log(chalk.gray(`Total time: ${result.totalTime}ms`));

      await disconnect();
      process.exit(result.failed.length > 0 ? 1 : 0);
    } catch (error) {
      handleError(error as Error);
    }
  });

// Down command
program
  .command('down [target]')
  .description('Rollback migrations')
  .option('-d, --dry-run', 'Simulate rollback without executing')
  .action(async (target, options) => {
    try {
      const config = loadConfig();
      config.dryRun = options.dryRun;

      const connection = await connect(config);
      const runner = new MigrationRunner(connection, config);

      console.log(chalk.blue('→'), 'Rolling back migrations...');
      const result = await runner.down(target);

      // Display results
      if (result.successful.length > 0) {
        console.log(chalk.green('✓'), `${result.successful.length} migrations rolled back:`);
        result.successful.forEach(m => {
          console.log(
            chalk.gray('  •'),
            m.name,
            chalk.gray(`(${m.executionTime}ms)`)
          );
        });
      }

      if (result.failed.length > 0) {
        console.log(chalk.red('✗'), `${result.failed.length} rollbacks failed:`);
        result.failed.forEach(m => {
          console.log(chalk.red('  •'), m.name, chalk.red(`- ${m.error?.message}`));
        });
      }

      await disconnect();
      process.exit(result.failed.length > 0 ? 1 : 0);
    } catch (error) {
      handleError(error as Error);
    }
  });

// Status command
program
  .command('status')
  .description('Show migration status')
  .action(async () => {
    try {
      const config = loadConfig();
      const connection = await connect(config);
      const runner = new MigrationRunner(connection, config);

      const executed = await runner.executed();
      const pending = await runner.pending();

      console.log(chalk.blue('Migration Status'));
      console.log(chalk.gray('─'.repeat(50)));

      if (executed.length > 0) {
        console.log(chalk.green('Executed migrations:'));
        executed.forEach(m => {
          console.log(
            chalk.gray('  ✓'),
            chalk.white(m.name),
            chalk.gray(`(v${m.version})`),
            chalk.gray(`- ${new Date(m.executedAt!).toLocaleString()}`)
          );
        });
      } else {
        console.log(chalk.gray('No executed migrations'));
      }

      console.log();

      if (pending.length > 0) {
        console.log(chalk.yellow('Pending migrations:'));
        pending.forEach(m => {
          console.log(
            chalk.gray('  ○'),
            chalk.white(m.name),
            chalk.gray(`(v${m.version})`)
          );
        });
      } else {
        console.log(chalk.gray('No pending migrations'));
      }

      await disconnect();
    } catch (error) {
      handleError(error as Error);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate migrations')
  .action(async () => {
    try {
      const config = loadConfig();
      const connection = await connect(config);
      const runner = new MigrationRunner(connection, config);

      console.log(chalk.blue('→'), 'Validating migrations...');
      const isValid = await runner.validate();

      if (isValid) {
        console.log(chalk.green('✓'), 'All migrations are valid');
      } else {
        console.log(chalk.red('✗'), 'Validation failed');
      }

      await disconnect();
      process.exit(isValid ? 0 : 1);
    } catch (error) {
      handleError(error as Error);
    }
  });

// Create command
program
  .command('create <name>')
  .description('Create a new migration')
  .action(async (name) => {
    try {
      const config = loadConfig();

      // Ensure migrations directory exists
      if (!fs.existsSync(config.migrationsPath!)) {
        fs.mkdirSync(config.migrationsPath!, { recursive: true });
      }

      const timestamp = Date.now();
      const version = Math.floor(timestamp / 1000);
      const className = name
        .split(/[-_\s]/)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

      const template = `import { BaseMigration } from '@clenergize/migration';
import { Connection, ClientSession } from 'mongoose';

/**
 * Migration: ${name}
 * Created: ${new Date().toISOString()}
 */
export default class ${className}Migration extends BaseMigration {
  constructor() {
    super(
      '${timestamp}_${name}',
      '${name}',
      ${version}
    );
  }

  async up(connection: Connection, session?: ClientSession): Promise<void> {
    this.log('Running migration: ${name}');

    // TODO: Implement forward migration
    throw new Error('Migration not implemented');
  }

  async down(connection: Connection, session?: ClientSession): Promise<void> {
    this.log('Rolling back migration: ${name}');

    // TODO: Implement rollback migration
    throw new Error('Rollback not implemented');
  }

  async validate(connection: Connection): Promise<boolean> {
    // TODO: Add validation logic
    return true;
  }
}`;

      const filename = path.join(
        config.migrationsPath!,
        `${timestamp}_${name}.migration.ts`
      );

      fs.writeFileSync(filename, template);

      console.log(chalk.green('✓'), 'Created migration:', chalk.white(filename));
    } catch (error) {
      handleError(error as Error);
    }
  });

// Reset command (dangerous!)
program
  .command('reset')
  .description('Reset all migrations (DANGEROUS!)')
  .option('-f, --force', 'Force reset without confirmation')
  .action(async (options) => {
    try {
      if (!options.force) {
        console.log(chalk.red('⚠'), 'This will delete all migration history!');
        console.log(chalk.yellow('Use --force to confirm'));
        process.exit(1);
      }

      const config = loadConfig();
      const connection = await connect(config);
      const runner = new MigrationRunner(connection, config);

      console.log(chalk.red('→'), 'Resetting migrations...');
      await runner.reset();

      console.log(chalk.green('✓'), 'Migration history reset');

      await disconnect();
    } catch (error) {
      handleError(error as Error);
    }
  });

// Parse command line arguments
program.parse(process.argv);