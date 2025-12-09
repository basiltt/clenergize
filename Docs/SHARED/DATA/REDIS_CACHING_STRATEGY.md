# Redis Caching Strategy

> **Document Type**: Performance Architecture
> **Status**: Draft
> **Version**: 1.0.0
> **Last Updated**: November 18, 2025
> **Owner**: Architecture Agent

---

## Executive Summary

This document defines the Redis caching strategy for Clenergize V3 to achieve **sub-200ms response times** for 95% of API requests. Proper caching is critical given the data-intensive nature of carbon emission calculations and reporting.

### Performance Goals

| Metric | Target | Current (OLD System) | Improvement |
|--------|--------|---------------------|-------------|
| **p50 Response Time** | <50ms | 250ms | 80% faster |
| **p95 Response Time** | <200ms | 1,500ms | 87% faster |
| **p99 Response Time** | <500ms | 3,000ms | 83% faster |
| **Cache Hit Rate** | >85% | 0% (no cache) | N/A |
| **Database Load** | -70% | Baseline | 70% reduction |
| **Concurrent Users** | 10,000 | 500 | 20x capacity |

### Cache Statistics (Projected)

| Service | Cache Hit Rate | Avg TTL | Daily Cache Operations | Cache Size |
|---------|----------------|---------|------------------------|------------|
| Identity | 95% | 15 min | 100,000 | 50 MB |
| Organization | 90% | 1 hour | 50,000 | 200 MB |
| Reference | 99% | 24 hours | 10,000 | 100 MB |
| Activity | 70% | 5 min | 500,000 | 1 GB |
| Calculation | 85% | 1 hour | 800,000 | 5 GB |
| Reporting | 80% | 30 min | 20,000 | 500 MB |
| **Total** | **85%** | **Varies** | **1,480,000** | **~7 GB** |

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Redis Cluster Setup](#redis-cluster-setup)
3. [Caching Patterns](#caching-patterns)
4. [TTL Strategies](#ttl-strategies)
5. [Cache Key Design](#cache-key-design)
6. [Data Structures](#data-structures)
7. [Invalidation Strategies](#invalidation-strategies)
8. [Implementation in NestJS](#implementation-in-nestjs)
9. [Performance Optimization](#performance-optimization)
10. [Monitoring & Observability](#monitoring--observability)
11. [Cache Warming](#cache-warming)
12. [Disaster Recovery](#disaster-recovery)

---

## 1. Architecture Overview

### 1.1 Multi-Layer Cache Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                         │
│  Layer 0: Browser Cache (Static Assets, API Responses)     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    CDN (CloudFront)                         │
│  Layer 1: Edge Cache (Static Content, Public APIs)         │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              API Gateway (NestJS + In-Memory)               │
│  Layer 2: Application Cache (Hot Data, Session State)      │
│  • Node.js Memory (node-cache)                              │
│  • Size: 100 MB per instance                                │
│  • TTL: 1-5 minutes                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                Redis Cluster (ElastiCache)                  │
│  Layer 3: Distributed Cache (Shared Across Services)       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database 0: Session Store                           │   │
│  │  • User sessions, JWT jti tracking                   │   │
│  │  • TTL: 1 hour (session expiry)                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database 1: Query Cache                             │   │
│  │  • MongoDB query results                             │   │
│  │  • TTL: 5 min - 1 hour (data type dependent)         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database 2: Computation Cache                       │   │
│  │  • Calculation results, aggregations                 │   │
│  │  • TTL: 1-24 hours                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database 3: Reference Data Cache                    │   │
│  │  • Emission factors, units, parameters               │   │
│  │  • TTL: 24 hours - 7 days                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database 4: Rate Limiting & Analytics               │   │
│  │  • Token buckets, request counters                   │   │
│  │  • TTL: 1 minute - 1 hour                            │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Cache Miss
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  MongoDB (Database)                         │
│  Layer 4: Source of Truth (Persistent Storage)             │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Cache Flow Diagram

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       │ 1. Check Application Cache (in-memory)
       │
┌──────▼──────────┐
│  App Cache Hit? │
└──────┬──────────┘
       │
       ├─ YES ──> Return Cached Data (1-5ms)
       │
       ├─ NO
       │
       │ 2. Check Redis Cache
       │
┌──────▼──────────┐
│ Redis Cache Hit?│
└──────┬──────────┘
       │
       ├─ YES ──> Store in App Cache ──> Return Data (10-20ms)
       │
       ├─ NO
       │
       │ 3. Query Database
       │
┌──────▼──────────┐
│ MongoDB Query   │
└──────┬──────────┘
       │
       │ 4. Store in Redis Cache
       │ 5. Store in App Cache
       │
┌──────▼──────────┐
│  Return Data    │ (50-200ms)
└─────────────────┘
```

---

## 2. Redis Cluster Setup

### 2.1 AWS ElastiCache Configuration

**Production Setup** (High Availability):
```hcl
# terraform/elasticache.tf

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "clenergize-prod-redis"
  replication_group_description = "Redis cluster for Clenergize production"

  engine                     = "redis"
  engine_version             = "7.0"
  node_type                  = "cache.r7g.xlarge" # 26.32 GB memory
  num_cache_clusters         = 3 # 1 primary + 2 replicas

  parameter_group_name       = aws_elasticache_parameter_group.main.name
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  security_group_ids         = [aws_security_group.redis.id]

  # Automatic failover
  automatic_failover_enabled = true
  multi_az_enabled           = true

  # Backup configuration
  snapshot_retention_limit   = 5
  snapshot_window            = "03:00-05:00"
  maintenance_window         = "sun:05:00-sun:07:00"

  # Encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token_enabled         = true
  auth_token                 = var.redis_auth_token

  # Data tiering (for large datasets)
  data_tiering_enabled       = true

  tags = {
    Name        = "clenergize-prod-redis"
    Environment = "production"
  }
}

# Parameter group for optimization
resource "aws_elasticache_parameter_group" "main" {
  name   = "clenergize-redis-params"
  family = "redis7"

  # Memory management
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru" # Evict least recently used keys
  }

  # Persistence (disabled for cache)
  parameter {
    name  = "save"
    value = "" # No RDB snapshots
  }

  # AOF disabled (cache only, not persistence)
  parameter {
    name  = "appendonly"
    value = "no"
  }

  # Client output buffer limits
  parameter {
    name  = "client-output-buffer-limit-normal-hard-limit"
    value = "0"
  }

  parameter {
    name  = "client-output-buffer-limit-normal-soft-limit"
    value = "0"
  }

  # Timeout
  parameter {
    name  = "timeout"
    value = "300"
  }
}
```

**Staging Setup** (Cost-Optimized):
```hcl
resource "aws_elasticache_cluster" "staging" {
  cluster_id           = "clenergize-staging-redis"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.t4g.medium" # 3.09 GB memory
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379

  subnet_group_name    = aws_elasticache_subnet_group.staging.name
  security_group_ids   = [aws_security_group.redis_staging.id]

  # No encryption for staging (cost saving)
  at_rest_encryption_enabled = false
  transit_encryption_enabled = false
}
```

### 2.2 Local Development (Docker)

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: clenergize-redis
    ports:
      - "6379:6379"
    command: >
      redis-server
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      --appendonly no
      --save ""
    volumes:
      - redis-data:/data
    networks:
      - clenergize-network

  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: redis-commander
    environment:
      - REDIS_HOSTS=local:redis:6379
    ports:
      - "8081:8081"
    depends_on:
      - redis
    networks:
      - clenergize-network

volumes:
  redis-data:

networks:
  clenergize-network:
    driver: bridge
```

---

## 3. Caching Patterns

### 3.1 Cache-Aside (Lazy Loading)

**Pattern**: Application checks cache first, loads from DB on miss, then stores in cache

**Use Cases**:
- User profiles
- Organization details
- Project metadata

**Implementation**:
```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly redis: Redis,
    private readonly userRepository: UserRepository
  ) {}

  async findById(userId: string): Promise<User> {
    const cacheKey = `user:${userId}`;

    // 1. Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. Cache miss - load from database
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3. Store in cache with TTL
    await this.redis.setex(
      cacheKey,
      900, // 15 minutes
      JSON.stringify(user)
    );

    return user;
  }
}
```

**Pros**:
- Simple implementation
- Only caches data that's actually requested
- Tolerates cache failures

**Cons**:
- Cache miss penalty (slow first request)
- Stale data possible

### 3.2 Write-Through

**Pattern**: Update cache and database simultaneously on writes

**Use Cases**:
- Critical data that must be fresh
- Frequently read after write
- Session data

**Implementation**:
```typescript
async updateUser(userId: string, updates: UpdateUserDto): Promise<User> {
  const cacheKey = `user:${userId}`;

  // 1. Update database
  const user = await this.userRepository.update(userId, updates);

  // 2. Update cache immediately
  await this.redis.setex(
    cacheKey,
    900, // 15 minutes
    JSON.stringify(user)
  );

  // 3. Invalidate related caches
  await this.invalidateUserRelatedCaches(userId);

  return user;
}
```

**Pros**:
- Cache always fresh
- No cache miss penalty

**Cons**:
- Write latency (two writes)
- Cache pollution (write data that's never read)

### 3.3 Write-Behind (Write-Back)

**Pattern**: Update cache immediately, async update database

**Use Cases**:
- High write throughput scenarios
- Non-critical data
- Analytics counters

**Implementation**:
```typescript
async incrementActivityCount(projectId: string): Promise<number> {
  const cacheKey = `project:${projectId}:activity_count`;

  // 1. Increment in Redis (fast)
  const newCount = await this.redis.incr(cacheKey);

  // 2. Queue database update (async)
  await this.queue.add('update-activity-count', {
    projectId,
    count: newCount
  });

  return newCount;
}

// Queue worker
@Processor('update-activity-count')
export class ActivityCountProcessor {
  async process(job: Job<{ projectId: string; count: number }>) {
    // Batch update database every 5 minutes
    await this.projectRepository.updateActivityCount(
      job.data.projectId,
      job.data.count
    );
  }
}
```

**Pros**:
- Fast writes
- Reduced database load

**Cons**:
- Risk of data loss if cache fails
- Complex consistency model

### 3.4 Read-Through

**Pattern**: Cache library loads data from DB on miss (transparent to application)

**Use Cases**:
- Complex query results
- Aggregations

**Implementation**:
```typescript
@Injectable()
export class CacheService {
  constructor(private readonly redis: Redis) {}

  async getOrFetch<T>(
    key: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    // Try cache
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from source
    const data = await fetchFn();

    // Store in cache
    await this.redis.setex(key, ttl, JSON.stringify(data));

    return data;
  }
}

// Usage
const emissions = await this.cacheService.getOrFetch(
  `project:${projectId}:emissions:${year}`,
  3600, // 1 hour
  () => this.calculationService.calculateProjectEmissions(projectId, year)
);
```

---

## 4. TTL Strategies

### 4.1 TTL Matrix by Data Type

| Data Type | TTL | Pattern | Reason |
|-----------|-----|---------|--------|
| **User Sessions** | 1 hour | Write-through | Security (auto-logout) |
| **User Profiles** | 15 min | Cache-aside | Balance freshness & performance |
| **Organization Data** | 1 hour | Cache-aside | Rarely changes |
| **Projects** | 30 min | Cache-aside | Moderate update frequency |
| **Hierarchies** | 1 hour | Cache-aside | Rarely changes once created |
| **Permissions** | 5 min | Write-through | Security-critical |
| **Emission Factors** | 24 hours | Cache-aside | Static reference data |
| **Units & Conversions** | 7 days | Cache-aside | Never changes |
| **Activity Data** | 5 min | Cache-aside | Frequently updated |
| **Calculations** | 1 hour | Cache-aside | Expensive to compute |
| **Rollup Aggregations** | 4 hours | Cache-aside | Very expensive to compute |
| **Reports** | 30 min | Cache-aside | Moderate generation cost |
| **Rate Limit Counters** | 1 min | Write-back | Reset every minute |
| **JWKS Public Keys** | 10 hours | Cache-aside | AWS Cognito rotation cycle |

### 4.2 Dynamic TTL Based on Data Age

**Concept**: Longer TTL for older, more stable data

```typescript
function calculateDynamicTTL(data: { createdAt: Date; updatedAt: Date }): number {
  const age = Date.now() - data.createdAt.getTime();
  const lastUpdate = Date.now() - data.updatedAt.getTime();

  // Recently created/updated: Short TTL
  if (age < 86400000 || lastUpdate < 3600000) { // < 1 day old or updated in last hour
    return 300; // 5 minutes
  }

  // Medium age: Medium TTL
  if (age < 2592000000) { // < 30 days old
    return 3600; // 1 hour
  }

  // Old, stable data: Long TTL
  return 86400; // 24 hours
}
```

### 4.3 TTL by Access Frequency

**Concept**: Popular data gets longer TTL

```typescript
class AdaptiveTTLCache {
  private hitCounts = new Map<string, number>();

  async set(key: string, value: any): Promise<void> {
    const hits = this.hitCounts.get(key) || 0;

    // More hits = longer TTL
    let ttl: number;
    if (hits > 1000) {
      ttl = 7200; // 2 hours (very popular)
    } else if (hits > 100) {
      ttl = 3600; // 1 hour (popular)
    } else if (hits > 10) {
      ttl = 1800; // 30 minutes (moderate)
    } else {
      ttl = 300; // 5 minutes (unpopular)
    }

    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async get(key: string): Promise<any> {
    const value = await this.redis.get(key);

    if (value) {
      // Increment hit count
      const hits = this.hitCounts.get(key) || 0;
      this.hitCounts.set(key, hits + 1);
    }

    return value ? JSON.parse(value) : null;
  }
}
```

---

## 5. Cache Key Design

### 5.1 Key Naming Convention

**Format**: `{service}:{resource}:{id}:{variant}:{version}`

**Examples**:
```
identity:user:507f1f77bcf86cd799439011
identity:user:507f1f77bcf86cd799439011:profile
identity:user:507f1f77bcf86cd799439011:permissions
identity:session:a1b2c3d4-e5f6-7890-abcd-ef1234567890

organization:project:abc123:metadata
organization:project:abc123:emissions:2024
organization:project:abc123:hierarchy:nodes

reference:emission-factor:ipcc-2023:electricity:us
reference:unit:kwh:conversion:mwh

activity:data:project-123:year-2024:scope-1
activity:bulk-import:job-456:status

calculation:result:activity-789:emission-factor-ipcc2023
calculation:rollup:project-123:year-2024:scope-1

reporting:report:project-123:ghg-inventory:2024:pdf
```

**Benefits**:
- Easy to understand and debug
- Supports pattern-based invalidation
- Enables efficient key scanning

### 5.2 Key Versioning

**Problem**: Schema changes break cached data

**Solution**: Include version in key

```typescript
const CACHE_VERSION = 'v2'; // Increment on schema change

const cacheKey = `${CACHE_VERSION}:user:${userId}`;
```

When schema changes, increment version:
- Old keys (`v1:user:*`) expire naturally
- New keys (`v2:user:*`) use new schema
- No need to manually invalidate

### 5.3 Hierarchical Keys for Bulk Invalidation

**Pattern**: Use colons to create hierarchy

```
project:123:*             // All project data
project:123:emissions:*   // All emissions data
project:123:emissions:2024:* // All 2024 emissions
```

**Invalidation**:
```typescript
async function invalidateProject(projectId: string): Promise<void> {
  // Find all keys for this project
  const keys = await this.redis.keys(`project:${projectId}:*`);

  // Delete in batches
  const pipeline = this.redis.pipeline();
  keys.forEach(key => pipeline.del(key));
  await pipeline.exec();
}
```

**Warning**: `KEYS` command is slow - use `SCAN` in production:
```typescript
async function invalidateProjectSafe(projectId: string): Promise<void> {
  const pattern = `project:${projectId}:*`;
  let cursor = '0';

  do {
    const [newCursor, keys] = await this.redis.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100
    );
    cursor = newCursor;

    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  } while (cursor !== '0');
}
```

---

## 6. Data Structures

### 6.1 String (Simple Key-Value)

**Use Case**: Caching serialized objects, counters

**Examples**:
```typescript
// User profile
await redis.setex(
  'user:123',
  900,
  JSON.stringify({ id: '123', name: 'John', email: 'john@example.com' })
);

// Counter
await redis.incr('api:requests:count');

// Flag
await redis.set('feature:new-ui:enabled', 'true');
```

### 6.2 Hash (Object Fields)

**Use Case**: Storing objects with multiple fields (more memory-efficient than JSON strings for large objects)

**Examples**:
```typescript
// User profile as hash
await redis.hset('user:123', {
  id: '123',
  name: 'John',
  email: 'john@example.com',
  status: 'ACTIVE'
});

// Get specific fields
const email = await redis.hget('user:123', 'email');

// Get all fields
const user = await redis.hgetall('user:123');

// Update single field
await redis.hset('user:123', 'status', 'INACTIVE');
```

**Benefit**: Can update individual fields without fetching entire object

### 6.3 List (Ordered Collection)

**Use Case**: Activity feeds, recent items, queues

**Examples**:
```typescript
// Recent calculations
await redis.lpush('calculations:recent', JSON.stringify(calculation));
await redis.ltrim('calculations:recent', 0, 99); // Keep last 100

// Get recent items
const recent = await redis.lrange('calculations:recent', 0, 9); // First 10

// Queue
await redis.rpush('queue:reports', reportId);
const reportId = await redis.lpop('queue:reports');
```

### 6.4 Set (Unique Collection)

**Use Case**: Tags, permissions, online users

**Examples**:
```typescript
// User's organizations
await redis.sadd('user:123:organizations', 'org-abc', 'org-def');

// Check membership
const isMember = await redis.sismember('user:123:organizations', 'org-abc');

// Get all members
const orgs = await redis.smembers('user:123:organizations');

// Set operations
const commonOrgs = await redis.sinter('user:123:organizations', 'user:456:organizations');
```

### 6.5 Sorted Set (Scored Collection)

**Use Case**: Leaderboards, time-series data, priority queues

**Examples**:
```typescript
// Leaderboard (score = emissions)
await redis.zadd('leaderboard:lowest-emissions', 1234.56, 'project-abc');
await redis.zadd('leaderboard:lowest-emissions', 5678.90, 'project-def');

// Get top 10
const top10 = await redis.zrange('leaderboard:lowest-emissions', 0, 9, 'WITHSCORES');

// Get rank
const rank = await redis.zrank('leaderboard:lowest-emissions', 'project-abc');

// Recent items with timestamp score
await redis.zadd('calculations:recent', Date.now(), calculationId);

// Get items in time range
const last24h = await redis.zrangebyscore(
  'calculations:recent',
  Date.now() - 86400000,
  Date.now()
);
```

### 6.6 HyperLogLog (Cardinality Estimation)

**Use Case**: Unique visitor counts, unique emission sources

**Examples**:
```typescript
// Track unique users viewing project
await redis.pfadd('project:123:unique-viewers', userId);

// Get unique count (approximate, 0.81% error)
const uniqueViewers = await redis.pfcount('project:123:unique-viewers');

// Merge multiple HyperLogLogs
await redis.pfmerge('global:unique-users', 'project:123:unique-viewers', 'project:456:unique-viewers');
```

**Benefit**: Uses only ~12 KB memory regardless of cardinality

---

## 7. Invalidation Strategies

### 7.1 Event-Driven Invalidation

**Concept**: Invalidate cache when domain events occur

**Implementation**:
```typescript
@Injectable()
export class CacheInvalidationService implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBus,
    private readonly redis: Redis
  ) {}

  onModuleInit() {
    // Listen to domain events
    this.eventBus.subscribe('organization.project.updated.v1', async (event) => {
      await this.invalidateProject(event.data.projectId);
    });

    this.eventBus.subscribe('activity.data.created.v1', async (event) => {
      await this.invalidateActivityData(event.data.projectId, event.data.year);
    });

    this.eventBus.subscribe('calculation.emission.calculated.v1', async (event) => {
      await this.invalidateCalculations(event.data.projectId);
    });
  }

  private async invalidateProject(projectId: string): Promise<void> {
    // Invalidate project metadata
    await this.redis.del(`project:${projectId}:metadata`);

    // Invalidate project hierarchy
    await this.redis.del(`project:${projectId}:hierarchy`);

    // Invalidate project permissions
    const permKeys = await this.redis.keys(`permission:project:${projectId}:*`);
    if (permKeys.length > 0) {
      await this.redis.del(...permKeys);
    }
  }

  private async invalidateActivityData(projectId: string, year: number): Promise<void> {
    // Invalidate activity data cache
    await this.redis.del(`activity:project:${projectId}:year:${year}`);

    // Invalidate related calculations
    await this.redis.del(`calculation:project:${projectId}:year:${year}`);

    // Invalidate rollups
    await this.redis.del(`rollup:project:${projectId}:year:${year}`);
  }
}
```

### 7.2 Time-Based Invalidation (TTL)

**Concept**: Set appropriate TTL based on data characteristics

**Examples**:
```typescript
// Static reference data - long TTL
await redis.setex('emission-factor:ipcc-2023', 604800, data); // 7 days

// Frequently changing data - short TTL
await redis.setex(`activity-data:${id}`, 300, data); // 5 minutes

// Calculated results - medium TTL
await redis.setex(`calculation:${id}`, 3600, data); // 1 hour
```

### 7.3 Tag-Based Invalidation

**Concept**: Tag cache entries for bulk invalidation

**Implementation**:
```typescript
class TaggedCache {
  async set(key: string, value: any, ttl: number, tags: string[]): Promise<void> {
    // Store value
    await this.redis.setex(key, ttl, JSON.stringify(value));

    // Add key to each tag's set
    for (const tag of tags) {
      await this.redis.sadd(`tag:${tag}`, key);
      await this.redis.expire(`tag:${tag}`, ttl); // Tag expires with data
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    // Get all keys with this tag
    const keys = await this.redis.smembers(`tag:${tag}`);

    if (keys.length > 0) {
      // Delete all tagged keys
      await this.redis.del(...keys);

      // Delete tag set
      await this.redis.del(`tag:${tag}`);
    }
  }
}

// Usage
await taggedCache.set(
  'calculation:123',
  result,
  3600,
  ['project:abc', 'year:2024', 'scope:1']
);

// Invalidate all 2024 calculations
await taggedCache.invalidateByTag('year:2024');
```

### 7.4 Probabilistic Early Expiration (Cache Stampede Prevention)

**Problem**: When popular cache entry expires, many requests hit DB simultaneously

**Solution**: Probabilistically refresh before expiration

```typescript
async function getWithProbabilisticRefresh<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);

  if (cached) {
    const data = JSON.parse(cached);

    // Get remaining TTL
    const remainingTTL = await redis.ttl(key);

    // Probabilistically refresh if near expiration
    // Probability increases as expiration approaches
    const refreshProbability = 1 - (remainingTTL / ttl);

    if (Math.random() < refreshProbability) {
      // Async refresh (don't wait)
      fetchFn().then(freshData => {
        redis.setex(key, ttl, JSON.stringify(freshData));
      });
    }

    return data;
  }

  // Cache miss - fetch and store
  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}
```

---

## 8. Implementation in NestJS

### 8.1 Redis Module

**File Structure**:
```
src/
├── cache/
│   ├── cache.module.ts
│   ├── cache.service.ts
│   ├── decorators/
│   │   ├── cacheable.decorator.ts
│   │   └── cache-invalidate.decorator.ts
│   ├── interceptors/
│   │   └── cache.interceptor.ts
│   └── strategies/
│       ├── cache-aside.strategy.ts
│       ├── write-through.strategy.ts
│       └── tagged-cache.strategy.ts
```

**Cache Module**:
```typescript
// src/cache/cache.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB) || 0,
          keyPrefix: process.env.REDIS_KEY_PREFIX || 'clenergize:',
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          enableReadyCheck: true,
          maxRetriesPerRequest: 3
        });
      }
    },
    CacheService
  ],
  exports: ['REDIS_CLIENT', CacheService]
})
export class CacheModule {}
```

**Cache Service**:
```typescript
// src/cache/cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Delete multiple keys
   */
  async delMultiple(keys: string[]): Promise<void> {
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  /**
   * Get or fetch pattern (cache-aside)
   */
  async getOrFetch<T>(
    key: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    // Try cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const data = await fetchFn();

    // Store in cache
    await this.set(key, data, ttl);

    return data;
  }

  /**
   * Invalidate by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    let cursor = '0';

    do {
      const [newCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100
      );
      cursor = newCursor;

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== '0');
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const info = await this.redis.info('stats');
    const memory = await this.redis.info('memory');

    return {
      keyspace_hits: this.parseInfoValue(info, 'keyspace_hits'),
      keyspace_misses: this.parseInfoValue(info, 'keyspace_misses'),
      used_memory: this.parseInfoValue(memory, 'used_memory'),
      used_memory_human: this.parseInfoValue(memory, 'used_memory_human'),
      connected_clients: this.parseInfoValue(info, 'connected_clients')
    };
  }

  private parseInfoValue(info: string, key: string): string {
    const match = info.match(new RegExp(`${key}:(.+)`));
    return match ? match[1] : '0';
  }
}
```

### 8.2 Cacheable Decorator

**Decorator for automatic caching**:
```typescript
// src/cache/decorators/cacheable.decorator.ts
import { SetMetadata } from '@nestjs/common';

export interface CacheableOptions {
  ttl: number;
  key?: string | ((args: any[]) => string);
  condition?: (args: any[]) => boolean;
}

export const CACHEABLE_KEY = 'cacheable';

export function Cacheable(options: CacheableOptions) {
  return SetMetadata(CACHEABLE_KEY, options);
}

// Usage
@Injectable()
export class ProjectService {
  @Cacheable({
    ttl: 1800, // 30 minutes
    key: (args) => `project:${args[0]}`
  })
  async findById(id: string): Promise<Project> {
    return this.projectRepository.findById(id);
  }
}
```

**Cache Interceptor**:
```typescript
// src/cache/interceptors/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../cache.service';
import { CACHEABLE_KEY, CacheableOptions } from '../decorators/cacheable.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const cacheOptions = this.reflector.get<CacheableOptions>(
      CACHEABLE_KEY,
      context.getHandler()
    );

    if (!cacheOptions) {
      return next.handle();
    }

    // Generate cache key
    const args = context.getArgs();
    const cacheKey = typeof cacheOptions.key === 'function'
      ? cacheOptions.key(args)
      : cacheOptions.key || this.generateDefaultKey(context);

    // Check condition
    if (cacheOptions.condition && !cacheOptions.condition(args)) {
      return next.handle();
    }

    // Try cache
    const cached = await this.cacheService.get(cacheKey);
    if (cached !== null) {
      return of(cached);
    }

    // Cache miss - execute and cache result
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(cacheKey, data, cacheOptions.ttl);
      })
    );
  }

  private generateDefaultKey(context: ExecutionContext): string {
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const args = JSON.stringify(context.getArgs());
    return `${className}:${methodName}:${args}`;
  }
}
```

---

## 9. Performance Optimization

### 9.1 Pipeline for Batch Operations

**Problem**: Multiple Redis commands = multiple network round trips

**Solution**: Use pipeline to batch commands

```typescript
async function getMultipleUsers(userIds: string[]): Promise<User[]> {
  const pipeline = redis.pipeline();

  // Queue all get commands
  userIds.forEach(id => {
    pipeline.get(`user:${id}`);
  });

  // Execute all at once
  const results = await pipeline.exec();

  // Parse results
  return results
    .map(([err, data]) => (err ? null : JSON.parse(data as string)))
    .filter(user => user !== null);
}
```

**Performance**: 100 commands in pipeline = 1 network round trip (10-100x faster)

### 9.2 Lua Scripts for Atomic Operations

**Problem**: Race conditions in multi-step operations

**Solution**: Lua scripts execute atomically on Redis server

```typescript
// Atomic increment with max limit
const incrWithMaxScript = `
  local key = KEYS[1]
  local max = tonumber(ARGV[1])
  local current = tonumber(redis.call('GET', key) or 0)

  if current < max then
    return redis.call('INCR', key)
  else
    return current
  end
`;

// Load script
const sha = await redis.script('LOAD', incrWithMaxScript);

// Execute script
const newValue = await redis.evalsha(sha, 1, 'counter:api-requests', 1000);
```

### 9.3 Compression for Large Values

**Problem**: Large JSON objects consume memory and bandwidth

**Solution**: Compress values before storing

```typescript
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

async function setCompressed(key: string, value: any, ttl: number): Promise<void> {
  const json = JSON.stringify(value);
  const compressed = await gzipAsync(json);

  // Store as buffer
  await redis.setex(key, ttl, compressed);
}

async function getCompressed<T>(key: string): Promise<T | null> {
  const compressed = await redis.getBuffer(key);
  if (!compressed) return null;

  const json = await gunzipAsync(compressed);
  return JSON.parse(json.toString());
}
```

**Savings**: 60-80% reduction in memory usage for large objects

### 9.4 Connection Pooling

**Problem**: Creating new connections is expensive

**Solution**: Use connection pool

```typescript
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  // Connection pool settings
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: false,
  connectTimeout: 10000,
  // Keepalive
  keepAlive: 30000,
  family: 4, // IPv4
  // Pool size (for cluster)
  natMap: {},
  // Reconnect on error
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});
```

---

## 10. Monitoring & Observability

### 10.1 Key Metrics

| Metric | Target | Alert Threshold | Action |
|--------|--------|-----------------|--------|
| **Hit Rate** | >85% | <70% | Review TTL strategy |
| **Memory Usage** | <80% | >90% | Scale up or evict |
| **Latency (p99)** | <10ms | >50ms | Investigate slow commands |
| **Connected Clients** | <1000 | >5000 | Check for connection leaks |
| **Evictions/sec** | 0 | >100 | Increase memory or lower TTLs |
| **Network In** | <100 MB/s | >500 MB/s | Optimize payload size |

### 10.2 CloudWatch Metrics

```typescript
// Log cache metrics to CloudWatch
async function logCacheMetrics(): Promise<void> {
  const stats = await cacheService.getStats();

  const hitRate = stats.keyspace_hits / (stats.keyspace_hits + stats.keyspace_misses);

  await cloudwatch.putMetricData({
    Namespace: 'Clenergize/Cache',
    MetricData: [
      {
        MetricName: 'HitRate',
        Value: hitRate * 100,
        Unit: 'Percent',
        Timestamp: new Date()
      },
      {
        MetricName: 'MemoryUsage',
        Value: parseInt(stats.used_memory),
        Unit: 'Bytes',
        Timestamp: new Date()
      }
    ]
  });
}

// Run every minute
setInterval(logCacheMetrics, 60000);
```

### 10.3 Slow Command Logging

```typescript
// Monitor slow commands (>10ms)
redis.on('ready', () => {
  redis.config('SET', 'slowlog-log-slower-than', '10000'); // 10ms
  redis.config('SET', 'slowlog-max-len', '128');
});

// Periodically check slow log
setInterval(async () => {
  const slowLog = await redis.slowlog('GET', 10);

  slowLog.forEach((entry) => {
    console.warn('Slow Redis command:', {
      id: entry[0],
      timestamp: entry[1],
      duration: entry[2],
      command: entry[3]
    });
  });
}, 300000); // Every 5 minutes
```

---

## 11. Cache Warming

### 11.1 On Application Startup

```typescript
@Injectable()
export class CacheWarmingService implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    console.log('Warming cache...');

    await Promise.all([
      this.warmEmissionFactors(),
      this.warmUnits(),
      this.warmParameters(),
      this.warmActiveProjects()
    ]);

    console.log('Cache warming complete');
  }

  private async warmEmissionFactors(): Promise<void> {
    const factors = await this.referenceService.getAllEmissionFactors();

    const pipeline = this.redis.pipeline();
    factors.forEach(factor => {
      const key = `emission-factor:${factor.id}`;
      pipeline.setex(key, 86400, JSON.stringify(factor)); // 24 hours
    });

    await pipeline.exec();
  }

  private async warmActiveProjects(): Promise<void> {
    const projects = await this.projectService.getActiveProjects();

    const pipeline = this.redis.pipeline();
    projects.forEach(project => {
      const key = `project:${project.id}`;
      pipeline.setex(key, 1800, JSON.stringify(project)); // 30 minutes
    });

    await pipeline.exec();
  }
}
```

### 11.2 Scheduled Cache Refresh

```typescript
@Injectable()
export class CacheRefreshService {
  @Cron('0 */6 * * *') // Every 6 hours
  async refreshReferenceData(): Promise<void> {
    console.log('Refreshing reference data cache...');

    // Fetch fresh data
    const emissionFactors = await this.db.emission_factors.find({ status: 'ACTIVE' });

    // Update cache
    const pipeline = this.redis.pipeline();
    emissionFactors.forEach(factor => {
      pipeline.setex(
        `emission-factor:${factor.id}`,
        86400,
        JSON.stringify(factor)
      );
    });

    await pipeline.exec();
  }

  @Cron('0 0 * * *') // Daily at midnight
  async refreshCalculationResults(): Promise<void> {
    console.log('Refreshing popular calculation results...');

    // Get most accessed calculations (tracked separately)
    const popular = await this.getPopularCalculations(100);

    for (const calc of popular) {
      const result = await this.calculationService.calculate(calc.activityDataId);
      await this.redis.setex(
        `calculation:${calc.id}`,
        3600,
        JSON.stringify(result)
      );
    }
  }
}
```

---

## 12. Disaster Recovery

### 12.1 Redis Persistence Strategy

**RDB Snapshots** (Point-in-time backup):
```
# redis.conf
save 900 1      # Save if 1 key changed in 15 minutes
save 300 10     # Save if 10 keys changed in 5 minutes
save 60 10000   # Save if 10000 keys changed in 1 minute

dbfilename dump.rdb
dir /var/lib/redis
```

**AOF (Append-Only File)** - Not recommended for cache:
```
appendonly no  # Disable for cache (performance over durability)
```

### 12.2 Cache Failure Handling

**Graceful Degradation**:
```typescript
async function getWithFallback<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    // Try cache
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Redis error, bypassing cache:', error);
    // Continue to fetchFn
  }

  // Fetch from source
  const data = await fetchFn();

  try {
    // Try to cache (best effort)
    await redis.setex(key, 300, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to cache, continuing:', error);
    // Don't fail request
  }

  return data;
}
```

### 12.3 Circuit Breaker Pattern

```typescript
import CircuitBreaker from 'opossum';

const cacheCircuitBreaker = new CircuitBreaker(
  async (fn: () => Promise<any>) => fn(),
  {
    timeout: 3000, // 3 seconds
    errorThresholdPercentage: 50,
    resetTimeout: 30000 // 30 seconds
  }
);

cacheCircuitBreaker.fallback(() => null); // Return null on circuit open

async function safeGetCache<T>(key: string): Promise<T | null> {
  return cacheCircuitBreaker.fire(async () => {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  });
}
```

---

## Summary

This Redis caching strategy provides a **high-performance, resilient caching layer** for Clenergize V3:

**Key Benefits**:
1. ✅ **Sub-200ms p95 response times** - 87% faster than OLD system
2. ✅ **85% cache hit rate** - Reduces database load by 70%
3. ✅ **Multi-layer caching** - Application memory + Redis distributed cache
4. ✅ **Intelligent TTL strategies** - Dynamic TTL based on data characteristics
5. ✅ **Event-driven invalidation** - Automatic cache updates on data changes
6. ✅ **Production-ready monitoring** - CloudWatch metrics, slow command logging
7. ✅ **Graceful degradation** - Circuit breaker pattern for Redis failures

**Implementation Roadmap**:
- Week 1: Setup Redis cluster and NestJS cache module
- Week 2: Implement cache-aside pattern for all services
- Week 3: Add event-driven invalidation
- Week 4: Performance testing and optimization

---

**Last Updated**: November 18, 2025
**Next Review**: End of Sprint 0.4
**Maintained By**: Architecture Agent + Performance Team
