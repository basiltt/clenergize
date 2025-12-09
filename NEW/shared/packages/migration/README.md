# @clenergize/migration

Enterprise-grade database migration framework for MongoDB with transaction support, rollback capabilities, and comprehensive tracking for the Clenergize V3 ESG Platform.

## Features

- ✅ **Full Transaction Support**: ACID-compliant migrations with MongoDB replica sets
- ✅ **Rollback Capabilities**: Every migration can be rolled back
- ✅ **Migration Tracking**: Complete history and status tracking
- ✅ **Checksum Validation**: Detect changes to already-executed migrations
- ✅ **Concurrent Lock Protection**: Prevents multiple migration processes
- ✅ **Dry Run Mode**: Test migrations without executing
- ✅ **CLI Tool**: Easy-to-use command-line interface
- ✅ **TypeScript Support**: Full type safety
- ✅ **Batch Processing**: Handle large-scale data transformations
- ✅ **Validation**: Pre-flight checks before migration

## Installation

```bash
npm install @clenergize/migration
```

## Quick Start

### 1. Create Migration Configuration

```javascript
// migration.config.js
module.exports = {
  connectionUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  databaseName: process.env.DB_NAME || 'clenergize',
  migrationsPath: './migrations',
  migrationsCollection: '_migrations',
  useTransactions: true,
  validateChecksums: true,
  timeout: 60000, // 1 minute per migration
};
```

### 2. Create Your First Migration

```bash
npx clenergize-migrate create add-user-indexes
```

This creates a migration file:

```typescript
// migrations/1234567890_add-user-indexes.migration.ts
import { BaseMigration } from '@clenergize/migration';
import { Connection, ClientSession } from 'mongoose';

export default class AddUserIndexesMigration extends BaseMigration {
  constructor() {
    super(
      '1234567890_add-user-indexes',
      'Add user indexes',
      1234567890
    );
  }

  async up(connection: Connection, session?: ClientSession): Promise<void> {
    this.log('Creating user indexes');

    // Create compound index for email and status
    await this.createIndex(
      connection,
      'users',
      { email: 1, status: 1 },
      { unique: false, background: true },
      session
    );

    // Create text index for search
    await this.createIndex(
      connection,
      'users',
      { name: 'text', bio: 'text' },
      { name: 'users_text_search' },
      session
    );

    this.log('User indexes created');
  }

  async down(connection: Connection, session?: ClientSession): Promise<void> {
    this.log('Dropping user indexes');

    await this.dropIndex(connection, 'users', 'email_1_status_1', session);
    await this.dropIndex(connection, 'users', 'users_text_search', session);
  }
}
```

### 3. Run Migrations

```bash
# Check status
npx clenergize-migrate status

# Run all pending migrations
npx clenergize-migrate up

# Run up to specific version
npx clenergize-migrate up 1234567890

# Dry run (test without executing)
npx clenergize-migrate up --dry-run

# Rollback last migration
npx clenergize-migrate down

# Rollback to specific version
npx clenergize-migrate down 1234567890
```

## CLI Commands

| Command | Description | Options |
|---------|-------------|---------|
| `up [target]` | Run pending migrations | `--dry-run` |
| `down [target]` | Rollback migrations | `--dry-run` |
| `status` | Show migration status | - |
| `validate` | Validate all migrations | - |
| `create <name>` | Create new migration | - |
| `reset` | Reset migration history | `--force` |

## Migration Examples

### Data Transformation Migration

```typescript
export default class NormalizeEmailsMigration extends BaseMigration {
  async up(connection: Connection, session?: ClientSession): Promise<void> {
    // Process users in batches of 1000
    await this.batchProcess(
      connection,
      'users',
      1000,
      async (batch) => {
        const operations = batch.map(user => ({
          updateOne: {
            filter: { _id: user._id },
            update: { $set: { email: user.email.toLowerCase() } },
          },
        }));

        await this.bulkWrite(connection, 'users', operations, session);
      },
      {}, // Process all documents
      session
    );
  }

  async down(connection: Connection, session?: ClientSession): Promise<void> {
    // Note: This is a non-reversible migration
    this.log('Email normalization cannot be reversed', 'warn');
  }
}
```

### Schema Migration

```typescript
export default class AddUserStatusMigration extends BaseMigration {
  async up(connection: Connection, session?: ClientSession): Promise<void> {
    // Add status field to all users
    const modifiedCount = await this.addField(
      connection,
      'users',
      'status',
      'active', // default value
      session
    );

    this.log(`Updated ${modifiedCount} users with status field`);

    // Create index on new field
    await this.createIndex(
      connection,
      'users',
      { status: 1 },
      { background: true },
      session
    );
  }

  async down(connection: Connection, session?: ClientSession): Promise<void> {
    // Drop index first
    await this.dropIndex(connection, 'users', 'status_1', session);

    // Remove field
    await this.removeField(connection, 'users', 'status', session);
  }
}
```

### Collection Restructuring

```typescript
export default class SplitUserProfileMigration extends BaseMigration {
  async up(connection: Connection, session?: ClientSession): Promise<void> {
    // Create new profiles collection
    await this.createCollection(connection, 'profiles', {}, session);

    // Migrate profile data
    const users = await connection.db
      .collection('users')
      .find({}, { session })
      .toArray();

    for (const user of users) {
      if (user.profile) {
        await connection.db.collection('profiles').insertOne(
          {
            userId: user._id,
            ...user.profile,
            createdAt: new Date(),
          },
          { session }
        );

        // Remove profile from user
        await connection.db
          .collection('users')
          .updateOne(
            { _id: user._id },
            { $unset: { profile: '' } },
            { session }
          );
      }
    }

    // Create indexes on new collection
    await this.createIndex(
      connection,
      'profiles',
      { userId: 1 },
      { unique: true },
      session
    );
  }

  async down(connection: Connection, session?: ClientSession): Promise<void> {
    // Merge profiles back into users
    const profiles = await connection.db
      .collection('profiles')
      .find({}, { session })
      .toArray();

    for (const profile of profiles) {
      const { userId, ...profileData } = profile;
      await connection.db
        .collection('users')
        .updateOne(
          { _id: userId },
          { $set: { profile: profileData } },
          { session }
        );
    }

    // Drop profiles collection
    await this.dropCollection(connection, 'profiles', session);
  }
}
```

## Programmatic Usage

```typescript
import { MigrationRunner } from '@clenergize/migration';
import mongoose from 'mongoose';

async function runMigrations() {
  const connection = await mongoose.connect('mongodb://localhost:27017', {
    dbName: 'clenergize',
  });

  const runner = new MigrationRunner(connection.connection, {
    migrationsPath: './migrations',
    useTransactions: true,
  });

  // Check pending migrations
  const pending = await runner.pending();
  console.log(`${pending.length} migrations pending`);

  // Run migrations
  const result = await runner.up();

  if (result.failed.length > 0) {
    console.error('Migration failed:', result.failed[0].error);
    process.exit(1);
  }

  console.log(`Successfully ran ${result.successful.length} migrations`);
}
```

## Base Migration Helpers

The `BaseMigration` class provides many helpers:

```typescript
// Collection operations
await this.createCollection(connection, name, options, session);
await this.dropCollection(connection, name, session);
await this.renameCollection(connection, oldName, newName, session);
await this.collectionExists(connection, name);

// Index operations
await this.createIndex(connection, collection, index, options, session);
await this.dropIndex(connection, collection, indexName, session);

// Field operations
await this.addField(connection, collection, fieldName, defaultValue, session);
await this.removeField(connection, collection, fieldName, session);
await this.renameField(connection, collection, oldName, newName, session);

// Batch operations
await this.batchProcess(connection, collection, batchSize, processor, filter, session);
await this.bulkWrite(connection, collection, operations, session);
await this.aggregate(connection, collection, pipeline, session);

// Logging
this.log('message', 'info' | 'warn' | 'error');
```

## Migration Tracking

Migrations are tracked in the `_migrations` collection:

```javascript
{
  _id: ObjectId,
  migrationId: '1234567890_add-user-indexes',
  name: 'Add user indexes',
  version: 1234567890,
  status: 'completed', // pending|running|completed|failed|rolled_back
  executedAt: ISODate('2024-01-01T00:00:00Z'),
  executionTime: 1234, // milliseconds
  checksum: 'sha256hash',
  error: null, // Error message if failed
  rollbackedAt: null // Date if rolled back
}
```

## Concurrent Execution Protection

The migration system uses a lock mechanism to prevent concurrent execution:

```javascript
{
  _id: 'migration_lock',
  lockedAt: ISODate('2024-01-01T00:00:00Z'),
  lockedBy: 'hostname-pid',
  pid: 12345,
  host: 'hostname'
}
```

Stale locks (older than timeout) are automatically cleared.

## Best Practices

### 1. Always Test Migrations

```bash
# Test in dry-run mode first
npx clenergize-migrate up --dry-run

# Run in development environment
NODE_ENV=development npx clenergize-migrate up

# Then production
NODE_ENV=production npx clenergize-migrate up
```

### 2. Make Migrations Idempotent

```typescript
async up(connection: Connection, session?: ClientSession): Promise<void> {
  // Check if migration was already applied
  const indexExists = await connection.db
    .collection('users')
    .indexExists('email_1');

  if (!indexExists) {
    await this.createIndex(connection, 'users', { email: 1 }, {}, session);
  }
}
```

### 3. Handle Large Data Sets

```typescript
async up(connection: Connection, session?: ClientSession): Promise<void> {
  // Process in batches to avoid memory issues
  await this.batchProcess(
    connection,
    'large_collection',
    100, // Small batch size
    async (batch) => {
      // Process batch
    },
    {},
    session
  );
}
```

### 4. Provide Meaningful Rollbacks

```typescript
async down(connection: Connection, session?: ClientSession): Promise<void> {
  // If rollback is not possible, document why
  if (this.isDataDestructive()) {
    throw new Error(
      'This migration cannot be rolled back as it would result in data loss'
    );
  }

  // Otherwise provide complete rollback
}
```

## MongoDB Requirements

### Replica Set for Transactions

```yaml
# docker-compose.yml
mongodb:
  image: mongo:7
  command: --replSet rs0
  environment:
    MONGO_INITDB_REPLICA_SET: rs0
```

Initialize replica set:

```bash
docker exec -it mongodb mongosh --eval "rs.initiate()"
```

## Error Handling

Migrations handle errors gracefully:

- **Transient errors**: Automatically retried
- **Validation errors**: Migration skipped with warning
- **Fatal errors**: Migration stopped, transaction rolled back
- **Timeout**: Migration aborted after configured timeout

## Testing

```typescript
import { MigrationRunner } from '@clenergize/migration';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

describe('Migrations', () => {
  let replSet: MongoMemoryReplSet;
  let runner: MigrationRunner;

  beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({
      replSet: { count: 1 }
    });

    const uri = replSet.getUri();
    // Setup runner with test database
  });

  it('should run migration successfully', async () => {
    const result = await runner.up();
    expect(result.successful.length).toBe(1);
  });
});
```

## License

MIT

## Support

For issues and questions, please refer to the Clenergize V3 documentation or create an issue in the repository.