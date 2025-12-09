import { MongoClient, Db, Collection, Document } from 'mongodb';

export class TestDatabaseHelper {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  /**
   * Connect to test database
   * @param uri MongoDB connection URI (default: from TEST_MONGODB_URI env var)
   * @param dbName Database name (default: test database with random suffix)
   */
  async connect(uri?: string, dbName?: string): Promise<Db> {
    const mongoUri = uri || process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017';
    const testDbName = dbName || `test_clenergize_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    this.client = new MongoClient(mongoUri);
    await this.client.connect();
    this.db = this.client.db(testDbName);

    return this.db;
  }

  /**
   * Get database instance
   */
  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Get collection
   */
  getCollection<T extends Document = Document>(name: string): Collection<T> {
    return this.getDb().collection<T>(name);
  }

  /**
   * Clear all data from a collection
   */
  async clearCollection(collectionName: string): Promise<void> {
    await this.getCollection(collectionName).deleteMany({});
  }

  /**
   * Clear all collections in the database
   */
  async clearAllCollections(): Promise<void> {
    if (!this.db) return;

    const collections = await this.db.listCollections().toArray();
    await Promise.all(collections.map((col) => this.clearCollection(col.name)));
  }

  /**
   * Drop the test database
   */
  async dropDatabase(): Promise<void> {
    if (!this.db) return;
    await this.db.dropDatabase();
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  /**
   * Seed collection with test data
   */
  async seedCollection<T extends Document = Document>(
    collectionName: string,
    data: T[]
  ): Promise<void> {
    if (data.length === 0) return;
    await this.getCollection<T>(collectionName).insertMany(data as any);
  }

  /**
   * Create indexes on a collection
   */
  async createIndexes(
    collectionName: string,
    indexes: Array<{ key: Record<string, 1 | -1>; unique?: boolean; name?: string }>
  ): Promise<void> {
    const collection = this.getCollection(collectionName);
    await Promise.all(
      indexes.map((index) =>
        collection.createIndex(index.key, {
          unique: index.unique,
          name: index.name,
        })
      )
    );
  }
}

/**
 * Setup and teardown helper for Jest tests
 */
export function createTestDatabaseLifecycle() {
  const dbHelper = new TestDatabaseHelper();

  return {
    dbHelper,

    beforeAll: async () => {
      await dbHelper.connect();
    },

    beforeEach: async () => {
      await dbHelper.clearAllCollections();
    },

    afterAll: async () => {
      await dbHelper.dropDatabase();
      await dbHelper.disconnect();
    },
  };
}
