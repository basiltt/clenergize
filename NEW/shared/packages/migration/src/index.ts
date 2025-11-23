/**
 * @clenergize/migration
 *
 * Database migration framework for MongoDB with transaction support
 */

export * from './interfaces/migration.interface';
export * from './base-migration';
export * from './migration-runner';

// Export default runner factory
import { Connection } from 'mongoose';
import { MigrationRunner } from './migration-runner';
import { MigrationConfig } from './interfaces/migration.interface';

export function createMigrationRunner(
  connection: Connection,
  config: MigrationConfig
): MigrationRunner {
  return new MigrationRunner(connection, config);
}