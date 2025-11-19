import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Email } from '@clenergize/common';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'VIEWER';

@Schema({
  collection: 'users',
  timestamps: true,
})
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: [String], required: true, default: ['USER'] })
  roles: UserRole[];

  @Prop({
    type: String,
    required: true,
    enum: ['ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED'],
    default: 'PENDING',
  })
  status: UserStatus;

  @Prop({ type: String })
  organizationId?: string;

  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;

  @Prop({ type: Date })
  emailVerifiedAt?: Date;

  @Prop({ type: Boolean, default: false })
  mfaEnabled: boolean;

  @Prop({ type: String, select: false })
  mfaSecret?: string;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: String })
  lastLoginIp?: string;

  @Prop({ type: Number, default: 0 })
  failedLoginAttempts: number;

  @Prop({ type: Date })
  lockedUntil?: Date;

  @Prop({ type: Date })
  passwordChangedAt?: Date;

  @Prop({ type: [String], default: [] })
  passwordHistory: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;

  // Virtual getters
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isLocked(): boolean {
    return this.lockedUntil ? this.lockedUntil > new Date() : false;
  }

  get isActive(): boolean {
    return this.status === 'ACTIVE' && !this.isLocked;
  }

  // Business logic methods
  activate(): void {
    this.status = 'ACTIVE';
    this.emailVerified = true;
    this.emailVerifiedAt = new Date();
  }

  suspend(reason?: string): void {
    this.status = 'SUSPENDED';
    if (reason && this.metadata) {
      this.metadata.suspensionReason = reason;
    }
  }

  incrementFailedLoginAttempts(): void {
    this.failedLoginAttempts += 1;

    // Lock account after 5 failed attempts for 30 minutes
    if (this.failedLoginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
  }

  resetFailedLoginAttempts(): void {
    this.failedLoginAttempts = 0;
    this.lockedUntil = undefined;
  }

  recordSuccessfulLogin(ipAddress: string): void {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ipAddress;
    this.resetFailedLoginAttempts();
  }

  assignRole(role: UserRole): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
    }
  }

  revokeRole(role: UserRole): void {
    this.roles = this.roles.filter((r) => r !== role);

    // Ensure at least one role remains
    if (this.roles.length === 0) {
      this.roles = ['USER'];
    }
  }

  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((role) => this.roles.includes(role));
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtual getters
UserSchema.virtual('fullName').get(function (this: User) {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.virtual('isLocked').get(function (this: User) {
  return this.lockedUntil ? this.lockedUntil > new Date() : false;
});

UserSchema.virtual('isActive').get(function (this: User) {
  return this.status === 'ACTIVE' && !this.isLocked;
});

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ organizationId: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });
