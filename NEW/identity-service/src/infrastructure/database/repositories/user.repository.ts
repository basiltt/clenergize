import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { User } from '../../../domain/entities/user.entity';
import { NotFoundError } from '@clenergize/common';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`, 'IDENTITY_USR_001');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();
  }

  async findAll(filter?: FilterQuery<User>): Promise<User[]> {
    return this.userModel.find(filter || {}).exec();
  }

  async findByOrganizationId(organizationId: string): Promise<User[]> {
    return this.userModel.find({ organizationId }).exec();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`, 'IDENTITY_USR_001');
    }

    return user;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundError(`User with ID ${id} not found`, 'IDENTITY_USR_001');
    }
  }

  async softDelete(id: string): Promise<User> {
    return this.update(id, { status: 'DELETED' });
  }

  async countByStatus(status: string): Promise<number> {
    return this.userModel.countDocuments({ status }).exec();
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel
      .countDocuments({ email: email.toLowerCase() })
      .exec();
    return count > 0;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    const user = await this.findByIdOrFail(userId);

    // Add current password to history (keep last 5)
    const passwordHistory = [...(user.passwordHistory || []), user.passwordHash].slice(-5);

    return this.update(userId, {
      passwordHash,
      passwordHistory,
      passwordChangedAt: new Date(),
    });
  }

  async recordLoginAttempt(
    userId: string,
    success: boolean,
    ipAddress: string
  ): Promise<User> {
    const user = await this.findByIdOrFail(userId);

    if (success) {
      // Record successful login
      return this.update(userId, {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        failedLoginAttempts: 0,
        lockedUntil: undefined,
      });
    } else {
      // Increment failed login attempts
      const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateData: Partial<User> = {
        failedLoginAttempts: newFailedAttempts,
      };

      // Lock account after 5 failed attempts
      if (newFailedAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        updateData.lockedUntil = lockUntil;
      }

      return this.update(userId, updateData);
    }
  }
}
