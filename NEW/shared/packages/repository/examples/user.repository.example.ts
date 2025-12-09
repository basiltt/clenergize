/**
 * Example implementation of the repository pattern for a User model
 *
 * This demonstrates how services should implement repositories using
 * the base repository pattern with MongoDB transactions.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { MongooseRepository } from '../src/base.repository.mongoose';
import { User, UserDocument } from './schemas/user.schema';

/**
 * User-specific repository interface
 * Extends base repository with domain-specific methods
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<UserDocument | null>;
  findActiveUsers(): Promise<UserDocument[]>;
  updateLastLogin(userId: string): Promise<void>;
  softDelete(userId: string): Promise<boolean>;
}

/**
 * Concrete implementation of User repository
 */
@Injectable()
export class UserRepository
  extends MongooseRepository<UserDocument>
  implements IUserRepository
{
  constructor(
    @InjectModel(User.name) model: Model<UserDocument>,
    @InjectConnection() connection: Connection
  ) {
    super(model, connection);
  }

  /**
   * Find user by email address
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find all active users
   */
  async findActiveUsers(): Promise<UserDocument[]> {
    return await this.findMany(
      { status: 'active', deletedAt: null },
      {
        sort: 'createdAt',
        select: ['id', 'email', 'name', 'role', 'createdAt'],
      }
    );
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.updateById(userId, {
      lastLoginAt: new Date(),
      $inc: { loginCount: 1 },
    } as any);
  }

  /**
   * Soft delete a user
   */
  async softDelete(userId: string): Promise<boolean> {
    const result = await this.updateById(userId, {
      deletedAt: new Date(),
      status: 'deleted',
    } as any);

    return result !== null;
  }
}

/**
 * Example service using the repository with Unit of Work
 */
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly unitOfWorkFactory: MongooseUnitOfWorkFactory
  ) {}

  /**
   * Create a new user with related entities in a transaction
   */
  async createUserWithProfile(
    userData: CreateUserDto,
    profileData: CreateProfileDto
  ): Promise<UserDocument> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    return await unitOfWork.execute(async (uow) => {
      // Create user
      const user = await this.userRepository.create(
        {
          ...userData,
          email: userData.email.toLowerCase(),
          status: 'active',
        },
        { session: uow.getSession() }
      );

      // Create profile (would use ProfileRepository)
      await this.profileRepository.create(
        {
          ...profileData,
          userId: user.id,
        },
        { session: uow.getSession() }
      );

      // Send welcome email (would use EmailService)
      await this.emailService.sendWelcomeEmail(user.email);

      return user;
    });
  }

  /**
   * Transfer ownership between users in a transaction
   */
  async transferOwnership(
    fromUserId: string,
    toUserId: string,
    resourceIds: string[]
  ): Promise<void> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    const result = await unitOfWork.executeWithRetry(async (uow) => {
      const session = uow.getSession();

      // Verify both users exist
      const [fromUser, toUser] = await Promise.all([
        this.userRepository.findById(fromUserId, { session }),
        this.userRepository.findById(toUserId, { session }),
      ]);

      if (!fromUser || !toUser) {
        throw new Error('User not found');
      }

      // Update ownership of resources
      await this.resourceRepository.updateMany(
        { _id: { $in: resourceIds }, ownerId: fromUserId },
        { ownerId: toUserId },
        { session }
      );

      // Update user statistics
      await Promise.all([
        this.userRepository.updateById(
          fromUserId,
          { $inc: { resourceCount: -resourceIds.length } },
          { session }
        ),
        this.userRepository.updateById(
          toUserId,
          { $inc: { resourceCount: resourceIds.length } },
          { session }
        ),
      ]);

      // Log the transfer
      await this.auditService.logTransfer(
        fromUserId,
        toUserId,
        resourceIds,
        session
      );
    }, 3);

    if (!result.committed) {
      throw new Error(
        `Failed to transfer ownership after ${result.retryAttempts} attempts: ${result.error?.message}`
      );
    }
  }

  /**
   * Bulk import users with transaction
   */
  async bulkImportUsers(users: CreateUserDto[]): Promise<BulkImportResult> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    return await unitOfWork.execute(async (uow) => {
      const session = uow.getSession();
      const results: BulkImportResult = {
        successful: [],
        failed: [],
        total: users.length,
      };

      // Use bulk operations for performance
      const operations = users.map((userData) => ({
        type: 'insert' as const,
        document: {
          ...userData,
          email: userData.email.toLowerCase(),
          status: 'active',
          createdAt: new Date(),
        },
      }));

      try {
        const bulkResult = await this.userRepository.bulkWrite(operations, {
          session,
        });

        results.successful = users.slice(0, bulkResult.insertedCount);
      } catch (error) {
        // Handle duplicate emails or validation errors
        for (const user of users) {
          try {
            const created = await this.userRepository.create(user, { session });
            results.successful.push(created);
          } catch (err) {
            results.failed.push({
              user,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
          }
        }
      }

      return results;
    });
  }

  /**
   * Complex aggregation example
   */
  async getUserStatistics(): Promise<UserStatistics[]> {
    return await this.userRepository.aggregate<UserStatistics>([
      {
        $match: {
          status: 'active',
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          avgLoginCount: { $avg: '$loginCount' },
          lastCreated: { $max: '$createdAt' },
        },
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          avgLoginCount: { $round: ['$avgLoginCount', 2] },
          lastCreated: 1,
          _id: 0,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
  }
}

// Type definitions for the example
interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role: string;
}

interface CreateProfileDto {
  bio?: string;
  avatar?: string;
  preferences?: Record<string, any>;
}

interface BulkImportResult {
  successful: any[];
  failed: Array<{ user: any; error: string }>;
  total: number;
}

interface UserStatistics {
  role: string;
  count: number;
  avgLoginCount: number;
  lastCreated: Date;
}