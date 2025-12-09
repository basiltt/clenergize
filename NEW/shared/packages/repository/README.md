# @clenergize/repository

Production-ready repository pattern implementation with MongoDB transactions and Unit of Work support for the Clenergize V3 ESG Platform.

## Features

- ✅ **Full Transaction Support**: ACID compliance with MongoDB replica sets
- ✅ **Unit of Work Pattern**: Manage transactions across multiple repositories
- ✅ **Type Safety**: Full TypeScript support with generics
- ✅ **Event Emission**: Automatic domain event publishing
- ✅ **Retry Logic**: Built-in retry for transient errors
- ✅ **Bulk Operations**: Optimized bulk inserts, updates, and deletes
- ✅ **Aggregation Support**: Type-safe aggregation pipeline execution
- ✅ **Pagination**: Built-in pagination with metadata
- ✅ **Soft Deletes**: Support for soft delete patterns

## Installation

```bash
npm install @clenergize/repository
```

## Quick Start

### 1. Define Your Schema

```typescript
// schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['active', 'inactive', 'deleted'] })
  status: string;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### 2. Create Your Repository

```typescript
// repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { MongooseRepository } from '@clenergize/repository';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserRepository extends MongooseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) model: Model<UserDocument>,
    @InjectConnection() connection: Connection
  ) {
    super(model, connection);
  }

  // Add domain-specific methods
  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.findOne({ email: email.toLowerCase() });
  }

  async findActiveUsers(): Promise<UserDocument[]> {
    return await this.findMany({ status: 'active', deletedAt: null });
  }
}
```

### 3. Use in Your Service

```typescript
// services/user.service.ts
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { MongooseUnitOfWorkFactory } from '@clenergize/repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly unitOfWorkFactory: MongooseUnitOfWorkFactory
  ) {}

  // Simple operation without transaction
  async getUser(id: string) {
    return await this.userRepository.findById(id);
  }

  // Complex operation with transaction
  async createUserWithProfile(userData: any, profileData: any) {
    const unitOfWork = await this.unitOfWorkFactory.create();

    return await unitOfWork.execute(async (uow) => {
      const session = uow.getSession();

      // All operations in the same transaction
      const user = await this.userRepository.create(userData, { session });
      const profile = await this.profileRepository.create(
        { ...profileData, userId: user.id },
        { session }
      );

      return { user, profile };
    });
  }
}
```

## API Reference

### Repository Methods

#### Query Operations

```typescript
// Find by ID
const user = await userRepository.findById('123');

// Find one with filter
const user = await userRepository.findOne({ email: 'test@example.com' });

// Find many with options
const users = await userRepository.findMany(
  { status: 'active' },
  {
    sort: '-createdAt',
    select: ['name', 'email'],
    limit: 10,
    populate: 'profile',
  }
);

// Pagination
const result = await userRepository.findWithPagination(
  { status: 'active' },
  1, // page
  20 // limit
);
// result.data: User[]
// result.pagination: { total, page, limit, totalPages, hasNextPage, hasPrevPage }

// Count documents
const count = await userRepository.count({ status: 'active' });

// Check existence
const exists = await userRepository.exists({ email: 'test@example.com' });
```

#### Write Operations

```typescript
// Create single
const user = await userRepository.create({ name: 'John', email: 'john@example.com' });

// Create many
const users = await userRepository.createMany([userData1, userData2]);

// Update by ID
const updated = await userRepository.updateById('123', { name: 'Jane' });

// Update one
const updated = await userRepository.updateOne(
  { email: 'john@example.com' },
  { status: 'inactive' }
);

// Update many
const result = await userRepository.updateMany(
  { role: 'user' },
  { verified: true }
);
// result.modifiedCount: number

// Upsert
const { document, isNew } = await userRepository.upsert(
  { email: 'john@example.com' },
  { name: 'John', status: 'active' }
);

// Delete operations
const deleted = await userRepository.deleteById('123');
const deleted = await userRepository.deleteOne({ email: 'john@example.com' });
const { deletedCount } = await userRepository.deleteMany({ status: 'deleted' });
```

#### Bulk Operations

```typescript
const operations = [
  { type: 'insert', document: { name: 'User1' } },
  { type: 'update', filter: { id: '123' }, update: { $set: { status: 'active' } } },
  { type: 'delete', filter: { status: 'deleted' } },
];

const result = await userRepository.bulkWrite(operations);
// result: { insertedCount, modifiedCount, deletedCount, upsertedCount }
```

#### Aggregation

```typescript
const statistics = await userRepository.aggregate([
  { $match: { status: 'active' } },
  { $group: { _id: '$role', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);
```

### Unit of Work

#### Basic Transaction

```typescript
const unitOfWork = await unitOfWorkFactory.create();

try {
  await unitOfWork.startTransaction();

  const user = await userRepository.create(userData, {
    session: unitOfWork.getSession()
  });

  const profile = await profileRepository.create(profileData, {
    session: unitOfWork.getSession()
  });

  await unitOfWork.commit();
} catch (error) {
  await unitOfWork.rollback();
  throw error;
} finally {
  await unitOfWork.dispose();
}
```

#### Execute Helper

```typescript
// Automatic transaction management
const result = await unitOfWork.execute(async (uow) => {
  const session = uow.getSession();

  const user = await userRepository.create(userData, { session });
  const profile = await profileRepository.create(profileData, { session });

  return { user, profile };
});
```

#### With Retry Logic

```typescript
// Automatically retry on transient errors
const result = await unitOfWork.executeWithRetry(
  async (uow) => {
    // Your transactional code
  },
  3 // max retries
);

if (!result.committed) {
  console.error(`Failed after ${result.retryAttempts} attempts: ${result.error?.message}`);
}
```

### Decorator Support

```typescript
import { Transactional } from '@clenergize/repository';

class UserService {
  @Transactional()
  async transferOwnership(fromUserId: string, toUserId: string) {
    // Method automatically runs in a transaction
    await this.updateOwner(fromUserId, toUserId);
    await this.logTransfer(fromUserId, toUserId);
  }
}
```

## Event Handling

Repositories automatically emit domain events:

```typescript
userRepository.on('domain-event', (event) => {
  console.log(event);
  // {
  //   type: 'User.created',
  //   modelName: 'User',
  //   data: { ... },
  //   timestamp: Date
  // }
});
```

## Error Handling

### Retryable Errors

The following errors are automatically retried:
- `TransientTransactionError`
- `UnknownTransactionCommitResult`
- `WriteConflictError`
- Network timeouts

### Non-Retryable Errors

These errors fail immediately:
- Validation errors
- Duplicate key errors
- Authentication errors

## Best Practices

### 1. Always Use Transactions for Multi-Step Operations

```typescript
// ❌ Bad: No transaction
const user = await userRepository.create(userData);
const profile = await profileRepository.create({ userId: user.id });
// If profile creation fails, user is already created!

// ✅ Good: With transaction
await unitOfWork.execute(async (uow) => {
  const session = uow.getSession();
  const user = await userRepository.create(userData, { session });
  const profile = await profileRepository.create(
    { userId: user.id },
    { session }
  );
});
```

### 2. Use Bulk Operations for Performance

```typescript
// ❌ Bad: Individual operations
for (const user of users) {
  await userRepository.create(user);
}

// ✅ Good: Bulk operation
await userRepository.createMany(users);
```

### 3. Implement Repository Interfaces

```typescript
// Define interface for testing and flexibility
export interface IUserRepository {
  findByEmail(email: string): Promise<UserDocument | null>;
  findActiveUsers(): Promise<UserDocument[]>;
}

// Implement interface
export class UserRepository
  extends MongooseRepository<UserDocument>
  implements IUserRepository {
  // Implementation
}
```

### 4. Use Proper Error Handling

```typescript
const result = await unitOfWork.executeWithRetry(async (uow) => {
  // Your code
}, 3);

if (!result.committed) {
  // Handle failure
  logger.error('Transaction failed', {
    error: result.error,
    retries: result.retryAttempts
  });

  throw new InternalServerErrorException('Operation failed');
}
```

## MongoDB Configuration

Ensure your MongoDB is configured for transactions:

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

## Testing

```typescript
import { Test } from '@nestjs/testing';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

describe('UserRepository', () => {
  let replSet: MongoMemoryReplSet;

  beforeAll(async () => {
    // Create in-memory MongoDB replica set for testing
    replSet = await MongoMemoryReplSet.create({
      replSet: { count: 1 }
    });
  });

  afterAll(async () => {
    await replSet.stop();
  });

  // Your tests
});
```

## Performance Considerations

1. **Index Creation**: Create indexes for frequently queried fields
2. **Projection**: Only select needed fields to reduce network overhead
3. **Aggregation**: Use aggregation pipelines for complex queries
4. **Connection Pooling**: Configure appropriate pool size
5. **Read Preference**: Use secondary reads for read-heavy operations

## Migration from Raw Mongoose

```typescript
// Before: Raw Mongoose
const user = await UserModel.findById(id);
await UserModel.updateOne({ _id: id }, { $set: { status: 'active' } });

// After: Repository Pattern
const user = await userRepository.findById(id);
await userRepository.updateById(id, { status: 'active' });
```

## License

MIT

## Support

For issues and questions, please refer to the Clenergize V3 documentation or create an issue in the repository.