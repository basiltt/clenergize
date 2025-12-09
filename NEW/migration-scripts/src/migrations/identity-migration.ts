import { Db } from 'mongodb';
import ProgressBar from 'progress';
import logger, { logMigrationStart, logMigrationComplete, logMigrationError } from '../utils/logger';
import {
  transformIdToUUID,
  transformDate,
  transformStatus,
  transformEmail,
  transformPhoneNumber,
  transformRole,
  sanitizeString,
  chunkArray,
  retryWithBackoff
} from '../utils/transformers';

export interface IdentityMigrationStats {
  usersProcessed: number;
  usersCreated: number;
  usersFailed: number;
  sessionsProcessed: number;
  sessionsCreated: number;
  duration: number;
}

/**
 * Migrate users from OLD user-management database to NEW identity service
 */
export async function migrateIdentityService(
  oldDb: Db,
  newDb: Db,
  dryRun: boolean = false
): Promise<IdentityMigrationStats> {
  const serviceName = 'Identity Service';
  logMigrationStart(serviceName);

  const startTime = Date.now();
  const stats: IdentityMigrationStats = {
    usersProcessed: 0,
    usersCreated: 0,
    usersFailed: 0,
    sessionsProcessed: 0,
    sessionsCreated: 0,
    duration: 0
  };

  try {
    // Step 1: Extract users from OLD database
    logger.info('Extracting users from OLD database...');
    const oldUsers = await oldDb.collection('users').find({}).toArray();
    logger.info(`Found ${oldUsers.length} users to migrate`);

    if (oldUsers.length === 0) {
      logger.warn('No users found in OLD database. Skipping migration.');
      return stats;
    }

    // Step 2: Transform users to NEW schema
    logger.info('Transforming users to NEW schema...');
    const transformedUsers = oldUsers.map(transformUser).filter(user => user !== null);
    logger.info(`Transformed ${transformedUsers.length} users (${oldUsers.length - transformedUsers.length} skipped due to errors)`);

    // Step 3: Load users into NEW database (in batches)
    if (!dryRun) {
      logger.info('Loading users into NEW database...');
      const batchSize = parseInt(process.env.MIGRATION_BATCH_SIZE || '1000');
      const userBatches = chunkArray(transformedUsers, batchSize);

      const progressBar = new ProgressBar('  [:bar] :percent :current/:total users | ETA: :etas', {
        complete: '=',
        incomplete: ' ',
        width: 40,
        total: transformedUsers.length
      });

      for (const batch of userBatches) {
        try {
          await retryWithBackoff(async () => {
            if (batch.length > 0) {
              await newDb.collection('users').insertMany(batch, { ordered: false });
            }
          });

          stats.usersCreated += batch.length;
          progressBar.tick(batch.length);
        } catch (error: any) {
          // Handle duplicate key errors (user already migrated)
          if (error.code === 11000) {
            const duplicates = error.writeErrors?.length || 0;
            stats.usersCreated += (batch.length - duplicates);
            logger.warn(`Skipped ${duplicates} duplicate users`);
            progressBar.tick(batch.length);
          } else {
            stats.usersFailed += batch.length;
            logger.error(`Failed to insert batch of ${batch.length} users:`, error.message);
          }
        }
      }

      logger.info(`\n✓ Created ${stats.usersCreated} users in NEW database`);

      // Step 4: Create indexes
      logger.info('Creating indexes...');
      await createIndexes(newDb);
      logger.info('✓ Indexes created');

      // Step 5: Verify data integrity
      logger.info('Verifying data integrity...');
      const verificationResult = await verifyMigration(oldDb, newDb);
      if (!verificationResult.success) {
        logger.warn('Data integrity verification failed:', verificationResult.errors);
      } else {
        logger.info('✓ Data integrity verified');
      }
    } else {
      logger.info('[DRY RUN] Would create ' + transformedUsers.length + ' users');
      stats.usersCreated = transformedUsers.length;
    }

    stats.usersProcessed = oldUsers.length;
    stats.duration = Date.now() - startTime;

    logMigrationComplete(serviceName, stats);
    return stats;

  } catch (error) {
    logMigrationError(serviceName, error as Error);
    throw error;
  }
}

/**
 * Transform OLD user document to NEW user document
 */
function transformUser(oldUser: any): any | null {
  try {
    // Skip if user is soft-deleted
    if (oldUser.isDeleted || oldUser.status === 'deleted') {
      return null;
    }

    const newUser = {
      _id: transformIdToUUID(oldUser._id),
      email: transformEmail(oldUser.email),
      passwordHash: oldUser.password || oldUser.passwordHash || '',  // Keep existing hash
      firstName: sanitizeString(oldUser.firstName || oldUser.first_name || ''),
      lastName: sanitizeString(oldUser.lastName || oldUser.last_name || ''),
      phoneNumber: transformPhoneNumber(oldUser.phone || oldUser.phoneNumber),
      role: transformRole(oldUser.role || oldUser.userRole || 'USER'),
      organizationId: transformIdToUUID(oldUser.organizationId || oldUser.companyId),
      status: transformStatus(oldUser.status || oldUser.isActive ? 'active' : 'inactive'),

      // Profile
      profile: {
        jobTitle: sanitizeString(oldUser.jobTitle || oldUser.position || ''),
        department: sanitizeString(oldUser.department || ''),
        avatarUrl: oldUser.avatar || oldUser.profilePicture || null,
        timezone: oldUser.timezone || 'UTC',
        language: oldUser.language || 'en',
        dateFormat: oldUser.dateFormat || 'YYYY-MM-DD',
        notifications: {
          email: oldUser.emailNotifications !== false,
          push: oldUser.pushNotifications === true,
          sms: oldUser.smsNotifications === true
        }
      },

      // Security
      security: {
        mfaEnabled: oldUser.mfaEnabled === true || oldUser.twoFactorEnabled === true,
        mfaMethod: oldUser.mfaMethod || (oldUser.twoFactorEnabled ? 'totp' : null),
        lastPasswordChange: transformDate(oldUser.lastPasswordChange || oldUser.createdAt),
        passwordExpiresAt: null,  // Will be set by password policy
        failedLoginAttempts: oldUser.failedLoginAttempts || 0,
        lockedUntil: oldUser.lockedUntil ? transformDate(oldUser.lockedUntil) : null,
        lastLoginAt: oldUser.lastLoginAt ? transformDate(oldUser.lastLoginAt) : null,
        lastLoginIp: oldUser.lastLoginIp || null
      },

      // Timestamps
      createdAt: transformDate(oldUser.createdAt || oldUser.created_at),
      updatedAt: transformDate(oldUser.updatedAt || oldUser.updated_at || oldUser.createdAt),
      deletedAt: null,

      // Migration metadata
      _migration: {
        sourceId: oldUser._id.toString(),
        migratedAt: new Date().toISOString(),
        sourceSystem: 'user-management-v2'
      }
    };

    return newUser;
  } catch (error) {
    logger.error(`Failed to transform user ${oldUser._id}:`, error);
    return null;
  }
}

/**
 * Create indexes for users collection
 */
async function createIndexes(newDb: Db): Promise<void> {
  const usersCollection = newDb.collection('users');

  await Promise.all([
    // Unique indexes
    usersCollection.createIndex({ email: 1 }, { unique: true }),
    usersCollection.createIndex({ '_migration.sourceId': 1 }, { unique: true, sparse: true }),

    // Query indexes
    usersCollection.createIndex({ organizationId: 1 }),
    usersCollection.createIndex({ role: 1 }),
    usersCollection.createIndex({ status: 1 }),
    usersCollection.createIndex({ 'security.lastLoginAt': -1 }),
    usersCollection.createIndex({ createdAt: -1 }),

    // Compound indexes
    usersCollection.createIndex({ organizationId: 1, role: 1 }),
    usersCollection.createIndex({ organizationId: 1, status: 1 }),

    // Text search
    usersCollection.createIndex({
      email: 'text',
      firstName: 'text',
      lastName: 'text'
    }, { name: 'user_text_search' })
  ]);
}

/**
 * Verify migration data integrity
 */
async function verifyMigration(oldDb: Db, newDb: Db): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  try {
    // Check user counts
    const oldCount = await oldDb.collection('users').countDocuments({ isDeleted: { $ne: true } });
    const newCount = await newDb.collection('users').countDocuments({});

    if (oldCount !== newCount) {
      errors.push(`User count mismatch: OLD=${oldCount}, NEW=${newCount}`);
    }

    // Check for duplicate emails
    const duplicateEmails = await newDb.collection('users').aggregate([
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicateEmails.length > 0) {
      errors.push(`Found ${duplicateEmails.length} duplicate emails`);
    }

    // Check for orphaned users (no organization)
    const orphanedUsers = await newDb.collection('users').countDocuments({
      organizationId: { $in: [null, ''] }
    });

    if (orphanedUsers > 0) {
      errors.push(`Found ${orphanedUsers} users without organization`);
    }

    // Check for invalid emails
    const invalidEmails = await newDb.collection('users').countDocuments({
      email: { $not: /@/ }
    });

    if (invalidEmails > 0) {
      errors.push(`Found ${invalidEmails} users with invalid emails`);
    }

    return {
      success: errors.length === 0,
      errors
    };

  } catch (error) {
    logger.error('Verification failed:', error);
    return {
      success: false,
      errors: [`Verification error: ${(error as Error).message}`]
    };
  }
}

// Export for use in main migration script
export default migrateIdentityService;
