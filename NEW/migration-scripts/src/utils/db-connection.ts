import { MongoClient, Db } from 'mongodb';
import logger from './logger';

export interface DatabaseConnections {
  old: MongoClient;
  newIdentity: MongoClient;
  newOrganization: MongoClient;
  newReference: MongoClient;
  newActivity: MongoClient;
  newCalculation: MongoClient;
  newReporting: MongoClient;
  newAudit: MongoClient;
}

export interface DatabaseInstances {
  old: {
    userManagement: Db;
    projectManagement: Db;
    masterData: Db;
    carbonFootprint: Db;
    backend: Db;
    companyDetails: Db;
  };
  new: {
    identity: Db;
    organization: Db;
    reference: Db;
    activity: Db;
    calculation: Db;
    reporting: Db;
    audit: Db;
  };
}

class DatabaseConnectionManager {
  private connections: DatabaseConnections | null = null;
  private databases: DatabaseInstances | null = null;

  /**
   * Connect to all OLD and NEW MongoDB databases
   */
  async connect(): Promise<void> {
    logger.info('Connecting to MongoDB databases...');

    try {
      // Connect to OLD MongoDB (all OLD databases in single instance)
      const oldClient = new MongoClient(process.env.OLD_MONGODB_URI!, {
        maxPoolSize: 100,
        minPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000
      });
      await oldClient.connect();
      logger.info('✓ Connected to OLD MongoDB');

      // Connect to NEW MongoDB databases (separate instances per service)
      const newIdentityClient = new MongoClient(process.env.NEW_IDENTITY_MONGODB_URI!, {
        maxPoolSize: 50,
        minPoolSize: 5
      });
      await newIdentityClient.connect();
      logger.info('✓ Connected to NEW Identity Service MongoDB');

      const newOrganizationClient = new MongoClient(process.env.NEW_ORGANIZATION_MONGODB_URI!, {
        maxPoolSize: 50,
        minPoolSize: 5
      });
      await newOrganizationClient.connect();
      logger.info('✓ Connected to NEW Organization Service MongoDB');

      const newReferenceClient = new MongoClient(process.env.NEW_REFERENCE_MONGODB_URI!, {
        maxPoolSize: 50,
        minPoolSize: 5
      });
      await newReferenceClient.connect();
      logger.info('✓ Connected to NEW Reference Service MongoDB');

      const newActivityClient = new MongoClient(process.env.NEW_ACTIVITY_MONGODB_URI!, {
        maxPoolSize: 50,
        minPoolSize: 5
      });
      await newActivityClient.connect();
      logger.info('✓ Connected to NEW Activity Service MongoDB');

      const newCalculationClient = new MongoClient(process.env.NEW_CALCULATION_MONGODB_URI!, {
        maxPoolSize: 50,
        minPoolSize: 5
      });
      await newCalculationClient.connect();
      logger.info('✓ Connected to NEW Calculation Service MongoDB');

      const newReportingClient = new MongoClient(process.env.NEW_REPORTING_MONGODB_URI!, {
        maxPoolSize: 50,
        minPoolSize: 5
      });
      await newReportingClient.connect();
      logger.info('✓ Connected to NEW Reporting Service MongoDB');

      const newAuditClient = new MongoClient(process.env.NEW_AUDIT_MONGODB_URI!, {
        maxPoolSize: 50,
        minPoolSize: 5
      });
      await newAuditClient.connect();
      logger.info('✓ Connected to NEW Audit Service MongoDB');

      // Store connections
      this.connections = {
        old: oldClient,
        newIdentity: newIdentityClient,
        newOrganization: newOrganizationClient,
        newReference: newReferenceClient,
        newActivity: newActivityClient,
        newCalculation: newCalculationClient,
        newReporting: newReportingClient,
        newAudit: newAuditClient
      };

      // Get database instances
      this.databases = {
        old: {
          userManagement: oldClient.db('user-management'),
          projectManagement: oldClient.db('project-management'),
          masterData: oldClient.db('master-data'),
          carbonFootprint: oldClient.db('carbon-footprint'),
          backend: oldClient.db('backend'),
          companyDetails: oldClient.db('company-details')
        },
        new: {
          identity: newIdentityClient.db('clenergize_identity'),
          organization: newOrganizationClient.db('clenergize_organization'),
          reference: newReferenceClient.db('clenergize_reference'),
          activity: newActivityClient.db('clenergize_activity'),
          calculation: newCalculationClient.db('clenergize_calculation'),
          reporting: newReportingClient.db('clenergize_reporting'),
          audit: newAuditClient.db('clenergize_audit')
        }
      };

      logger.info('✓ All database connections established successfully\n');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      await this.disconnect();
      throw error;
    }
  }

  /**
   * Disconnect from all databases
   */
  async disconnect(): Promise<void> {
    if (!this.connections) return;

    logger.info('Disconnecting from MongoDB databases...');

    try {
      await Promise.all([
        this.connections.old.close(),
        this.connections.newIdentity.close(),
        this.connections.newOrganization.close(),
        this.connections.newReference.close(),
        this.connections.newActivity.close(),
        this.connections.newCalculation.close(),
        this.connections.newReporting.close(),
        this.connections.newAudit.close()
      ]);

      this.connections = null;
      this.databases = null;

      logger.info('✓ All database connections closed\n');
    } catch (error) {
      logger.error('Error closing database connections:', error);
      throw error;
    }
  }

  /**
   * Get database instances
   */
  getDatabases(): DatabaseInstances {
    if (!this.databases) {
      throw new Error('Databases not connected. Call connect() first.');
    }
    return this.databases;
  }

  /**
   * Get connections
   */
  getConnections(): DatabaseConnections {
    if (!this.connections) {
      throw new Error('Not connected to databases. Call connect() first.');
    }
    return this.connections;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connections !== null && this.databases !== null;
  }
}

// Singleton instance
export const dbManager = new DatabaseConnectionManager();
