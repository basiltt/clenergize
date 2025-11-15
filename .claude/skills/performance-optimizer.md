# Performance Optimizer Skill

## Purpose
Fix N+1 queries, add caching strategies, and optimize database operations.

## Performance Optimization Patterns

### 1. N+1 Query Detection and Fix
```typescript
// OLD: N+1 query problem
async getProjectsWithActivities() {
  const projects = await this.projectRepo.find();
  for (const project of projects) {
    // N queries for N projects!
    project.activities = await this.activityRepo.find({ projectId: project.id });
  }
  return projects;
}

// NEW: Batch loading
async getProjectsWithActivities() {
  const projects = await this.projectRepo.find();
  const projectIds = projects.map(p => p.id);

  // Single query for all activities
  const activities = await this.activityRepo.find({
    projectId: { $in: projectIds }
  });

  // Group by project
  const activitiesByProject = _.groupBy(activities, 'projectId');

  return projects.map(project => ({
    ...project,
    activities: activitiesByProject[project.id] || []
  }));
}

// Even better: Use aggregation
async getProjectsWithActivitiesOptimized() {
  return this.projectRepo.aggregate([
    {
      $lookup: {
        from: 'activities',
        localField: '_id',
        foreignField: 'projectId',
        as: 'activities'
      }
    }
  ]);
}
```

### 2. Caching Strategy
```typescript
@Injectable()
export class CacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private readonly MAX_SIZE = 1000;

  constructor(
    @InjectRedis() private redis: Redis
  ) {}

  // Multi-layer caching
  async get<T>(key: string): Promise<T | null> {
    // L1: Memory cache
    const memoryCached = this.memoryCache.get(key);
    if (memoryCached && memoryCached.expires > Date.now()) {
      return memoryCached.value;
    }

    // L2: Redis cache
    const redisCached = await this.redis.get(key);
    if (redisCached) {
      const value = JSON.parse(redisCached);
      this.setMemoryCache(key, value, 60); // Cache in memory for 1 minute
      return value;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    // Set in both caches
    this.setMemoryCache(key, value, ttl);
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  private setMemoryCache(key: string, value: any, ttl: number): void {
    // LRU eviction if cache is full
    if (this.memoryCache.size >= this.MAX_SIZE) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }

    this.memoryCache.set(key, {
      value,
      expires: Date.now() + ttl * 1000
    });
  }

  // Cache decorator
  static Cacheable(ttl: number = 300) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function(...args: any[]) {
        const cache = this.cacheService;
        const key = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

        const cached = await cache.get(key);
        if (cached) {
          return cached;
        }

        const result = await originalMethod.apply(this, args);
        await cache.set(key, result, ttl);

        return result;
      };
    };
  }
}

// Usage
class ProjectService {
  @CacheService.Cacheable(600) // Cache for 10 minutes
  async getProjectById(id: string): Promise<Project> {
    return this.projectRepo.findById(id);
  }
}
```

### 3. Database Query Optimization
```typescript
export class QueryOptimizer {
  // Index hints
  async findWithIndex(filter: any): Promise<any[]> {
    return this.collection
      .find(filter)
      .hint({ organizationId: 1, createdAt: -1 }) // Use specific index
      .limit(100)
      .exec();
  }

  // Projection optimization
  async findWithProjection(filter: any): Promise<any[]> {
    return this.collection
      .find(filter)
      .select('id name status') // Only select needed fields
      .lean() // Return plain objects, not Mongoose documents
      .exec();
  }

  // Cursor for large datasets
  async processLargeDataset(): Promise<void> {
    const cursor = this.collection
      .find({})
      .cursor()
      .batchSize(100);

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      await this.processDocument(doc);
    }
  }

  // Aggregation pipeline optimization
  async getOptimizedAggregation(): Promise<any[]> {
    return this.collection.aggregate([
      { $match: { status: 'active' } }, // Filter early
      { $sort: { createdAt: -1 } }, // Sort before limit
      { $limit: 100 }, // Limit early
      { $lookup: { /* ... */ } }, // Join after filtering
      { $project: { /* ... */ } } // Project at the end
    ])
    .allowDiskUse(true) // For large aggregations
    .exec();
  }
}
```

### 4. Connection Pooling
```typescript
// MongoDB connection optimization
const mongooseOptions = {
  maxPoolSize: 100, // Maximum number of sockets
  minPoolSize: 10, // Minimum number of sockets
  maxIdleTimeMS: 10000, // Close sockets after 10 seconds of inactivity
  socketTimeoutMS: 45000, // Close sockets after 45 seconds
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  family: 4 // Use IPv4
};

// Redis connection pooling
const redisOptions = {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    return err.message.includes(targetError);
  }
};
```

### 5. Performance Monitoring
```typescript
@Injectable()
export class PerformanceMonitor {
  // Method execution time tracking
  static TrackPerformance() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function(...args: any[]) {
        const start = Date.now();
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;

        // Log slow queries
        if (duration > 1000) {
          console.warn(`Slow operation: ${propertyKey} took ${duration}ms`);
        }

        // Send metrics
        metrics.recordHistogram('method.duration', duration, {
          method: propertyKey,
          class: target.constructor.name
        });

        return result;
      };
    };
  }
}
```

## Performance Checklist
- [ ] No N+1 queries
- [ ] Proper indexes on all queries
- [ ] Caching implemented
- [ ] Connection pooling configured
- [ ] Query projections used
- [ ] Pagination on all lists
- [ ] Lean queries where possible
- [ ] Aggregation pipelines optimized
- [ ] Slow query logging enabled
- [ ] Performance metrics tracked