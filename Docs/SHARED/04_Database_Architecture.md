# Database Schema Design - Clenergize V3

> **Document Type**: Database Design Specification
> **Status**: Draft
> **Version**: 1.0.0
> **Last Updated**: November 18, 2025
> **Owner**: Architecture Agent

---

## Executive Summary

This document defines the normalized MongoDB collection schemas for all 7 microservices in the Clenergize V3 rebuild. The design eliminates data denormalization issues from the OLD system (300% data bloat from hierarchy cloning) and implements proper referential integrity through document references.

### Schema Statistics

| Service | Collections | Total Indexes | Estimated Size (1 year) |
|---------|-------------|---------------|-------------------------|
| Identity | 5 | 18 | 500 MB |
| Organization | 7 | 30 | 2 GB |
| Reference | 5 | 17 | 100 MB |
| Activity | 6 | 23 | 50 GB |
| Calculation | 4 | 16 | 100 GB |
| Reporting | 5 | 15 | 10 GB |
| Audit | 5 | 20 | 20 GB |
| **Total** | **37** | **139** | **~183 GB** |

### Key Design Principles

1. **Database-Per-Service**: Each service owns its data in separate MongoDB databases
2. **Reference-Based Design**: Replace cloning with ObjectId references (fixes 300% bloat)
3. **Audit Trail**: All collections include createdAt, updatedAt, createdBy, version fields
4. **Soft Deletes**: Use `deletedAt` field instead of hard deletes
5. **Optimistic Locking**: Use `version` field for concurrent update detection
6. **Index Strategy**: Cover all query patterns identified in API spec
7. **TTL Indexes**: Auto-expire temporary data (sessions, tokens, exports)
8. **Hash Chain**: Audit logs use previousHash for tamper detection

---

## 1. Identity Service Schemas

**Database Name**: `clenergize_identity`

### 1.1 Users Collection

**Purpose**: Store user accounts and authentication metadata

```typescript
// @identity-service/src/infrastructure/database/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export enum UserRole {
  VIEWER = 'VIEWER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

@Schema({
  collection: 'users',
  timestamps: true,
  versionKey: 'version'
})
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.VIEWER] })
  roles: UserRole[];

  @Prop({ type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId?: Types.ObjectId;

  @Prop({ default: false })
  mfaEnabled: boolean;

  @Prop({ type: String })
  mfaSecret?: string;

  @Prop({ type: [String], default: [] })
  mfaBackupCodes: string[];

  @Prop({ type: String })
  phoneNumber?: string;

  @Prop({ type: String })
  avatarUrl?: string;

  @Prop({ type: String })
  timezone: string;

  @Prop({ type: String })
  locale: string;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: String })
  lastLoginIp?: string;

  @Prop({ type: Date })
  emailVerifiedAt?: Date;

  @Prop({ type: String })
  emailVerificationToken?: string;

  @Prop({ type: Date })
  passwordChangedAt?: Date;

  @Prop({ type: Number, default: 0 })
  failedLoginAttempts: number;

  @Prop({ type: Date })
  lockedUntil?: Date;

  @Prop({ type: Object })
  preferences: Record<string, any>;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  // Virtual for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Virtual for active status
  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE && !this.deletedAt;
  }

  // Virtual for locked status
  get isLocked(): boolean {
    return this.lockedUntil && this.lockedUntil > new Date();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ organizationId: 1, status: 1 });
UserSchema.index({ status: 1, deletedAt: 1 });
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true });
UserSchema.index({ createdAt: -1 });

// Virtual population
UserSchema.virtual('organization', {
  ref: 'Organization',
  localField: 'organizationId',
  foreignField: '_id',
  justOne: true
});

// Pre-save hooks
UserSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});
```

**Query Patterns**:
- Find by email (login): `{ email: "user@example.com" }`
- Find by organization: `{ organizationId: ObjectId, status: "ACTIVE" }`
- Find active users: `{ status: "ACTIVE", deletedAt: null }`

**Estimated Size**: 1 KB per document × 10,000 users = ~10 MB

---

### 1.2 Sessions Collection

**Purpose**: Track active user sessions with auto-expiration

```typescript
@Schema({
  collection: 'sessions',
  timestamps: true
})
export class Session extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  sessionToken: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ type: Object })
  deviceInfo: {
    browser?: string;
    os?: string;
    device?: string;
  };

  @Prop({ type: String })
  location?: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ type: Date })
  lastActivityAt: Date;

  @Prop({ type: Boolean, default: false })
  isRevoked: boolean;

  @Prop({ type: Date })
  revokedAt?: Date;

  @Prop({ type: String })
  revokedReason?: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Indexes
SessionSchema.index({ sessionToken: 1 }, { unique: true });
SessionSchema.index({ userId: 1, isRevoked: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
SessionSchema.index({ lastActivityAt: -1 });
```

**TTL Strategy**: Auto-delete expired sessions using MongoDB TTL index on `expiresAt` field

**Estimated Size**: 500 bytes × 50,000 active sessions = ~25 MB

---

### 1.3 Refresh Tokens Collection

**Purpose**: Store JWT refresh tokens with rotation support

```typescript
@Schema({
  collection: 'refresh_tokens',
  timestamps: true
})
export class RefreshToken extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ type: String, unique: true, sparse: true })
  previousTokenHash?: string; // For token rotation

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ type: Boolean, default: false })
  isRevoked: boolean;

  @Prop({ type: Date })
  revokedAt?: Date;

  @Prop({ type: String })
  revokedReason?: string;

  @Prop({ type: String })
  ipAddress: string;

  @Prop({ type: String })
  userAgent: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// Indexes
RefreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
RefreshTokenSchema.index({ previousTokenHash: 1 }, { sparse: true });
```

**Security Notes**:
- Store SHA-256 hash of token, not plaintext
- Implement token rotation on refresh
- Revoke all tokens on password change

**Estimated Size**: 300 bytes × 50,000 tokens = ~15 MB

---

### 1.4 MFA Secrets Collection

**Purpose**: Store TOTP secrets and backup codes

```typescript
@Schema({
  collection: 'mfa_secrets',
  timestamps: true
})
export class MFASecret extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  secretEncrypted: string; // Encrypted with KMS key

  @Prop({ type: [String], default: [] })
  backupCodesHash: string[]; // SHA-256 hashes

  @Prop({ type: Number, default: 0 })
  backupCodesUsed: number;

  @Prop({ type: Date })
  enabledAt: Date;

  @Prop({ type: String })
  qrCodeUrl: string;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: Date })
  verifiedAt?: Date;

  @Prop({ type: Date })
  lastUsedAt?: Date;
}

export const MFASecretSchema = SchemaFactory.createForClass(MFASecret);

// Indexes
MFASecretSchema.index({ userId: 1 }, { unique: true });
MFASecretSchema.index({ isVerified: 1 });
```

**Security Notes**:
- Encrypt secrets using AWS KMS
- Hash backup codes (don't store plaintext)
- Track usage for security monitoring

**Estimated Size**: 500 bytes × 2,000 MFA users = ~1 MB

---

### 1.5 Password Reset Tokens Collection

**Purpose**: Temporary tokens for password reset flow

```typescript
@Schema({
  collection: 'password_reset_tokens',
  timestamps: true
})
export class PasswordResetToken extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ type: Boolean, default: false })
  isUsed: boolean;

  @Prop({ type: Date })
  usedAt?: Date;

  @Prop({ type: String })
  ipAddress: string;

  @Prop({ type: String })
  userAgent: string;
}

export const PasswordResetTokenSchema = SchemaFactory.createForClass(PasswordResetToken);

// Indexes
PasswordResetTokenSchema.index({ tokenHash: 1 }, { unique: true });
PasswordResetTokenSchema.index({ userId: 1, isUsed: 1 });
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index - 1 hour
```

**TTL Strategy**: Auto-delete after 1 hour using TTL index

**Estimated Size**: 200 bytes × 1,000 tokens = ~200 KB

---

## 2. Organization Service Schemas

**Database Name**: `clenergize_organization`

### 2.1 Organizations Collection

**Purpose**: Top-level organization/company entities

```typescript
@Schema({
  collection: 'organizations',
  timestamps: true,
  versionKey: 'version'
})
export class Organization extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  legalName?: string;

  @Prop({ type: String, unique: true, sparse: true })
  taxId?: string;

  @Prop({ type: String })
  industry?: string;

  @Prop({ type: String })
  sector?: string;

  @Prop({ type: Number })
  employeeCount?: number;

  @Prop({ type: String })
  website?: string;

  @Prop({ type: Object })
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country: string;
  };

  @Prop({ type: Object })
  primaryContact: {
    name: string;
    email: string;
    phone?: string;
  };

  @Prop({ type: String, enum: ['ACTIVE', 'SUSPENDED', 'TRIAL', 'INACTIVE'], default: 'TRIAL' })
  status: string;

  @Prop({ type: String, enum: ['FREE', 'PRO', 'ENTERPRISE'], default: 'FREE' })
  subscriptionTier: string;

  @Prop({ type: Date })
  subscriptionStartDate?: Date;

  @Prop({ type: Date })
  subscriptionEndDate?: Date;

  @Prop({ type: Object })
  features: {
    maxProjects: number;
    maxUsers: number;
    apiAccess: boolean;
    advancedReporting: boolean;
    customEmissionFactors: boolean;
  };

  @Prop({ type: Object })
  settings: {
    defaultCurrency: string;
    defaultTimezone: string;
    defaultLocale: string;
    fiscalYearStart: number; // Month (1-12)
  };

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

// Indexes
OrganizationSchema.index({ name: 1 });
OrganizationSchema.index({ status: 1, deletedAt: 1 });
OrganizationSchema.index({ subscriptionTier: 1 });
OrganizationSchema.index({ createdAt: -1 });
```

**Estimated Size**: 2 KB × 1,000 orgs = ~2 MB

---

### 2.2 Projects Collection

**Purpose**: Carbon footprint projects within organizations

```typescript
@Schema({
  collection: 'projects',
  timestamps: true,
  versionKey: 'version'
})
export class Project extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED', 'COMPLETED'], default: 'DRAFT' })
  status: string;

  @Prop({ required: true })
  reportingYear: number;

  @Prop({ type: Date })
  reportingPeriodStart: Date;

  @Prop({ type: Date })
  reportingPeriodEnd: Date;

  @Prop({ type: Types.ObjectId, ref: 'Hierarchy' })
  hierarchyId?: Types.ObjectId; // Reference instead of cloning!

  @Prop({ type: String, enum: ['GHG_PROTOCOL', 'ISO_14064', 'CDP', 'CUSTOM'], default: 'GHG_PROTOCOL' })
  methodology: string;

  @Prop({ type: [String], enum: ['SCOPE_1', 'SCOPE_2', 'SCOPE_3'], default: ['SCOPE_1', 'SCOPE_2'] })
  includedScopes: string[];

  @Prop({ type: Object })
  scope2Approach: {
    location: boolean;
    market: boolean;
  };

  @Prop({ type: [String] })
  scope3Categories?: string[];

  @Prop({ type: Object })
  boundaries: {
    operationalControl: boolean;
    financialControl: boolean;
    equityShare: boolean;
  };

  @Prop({ type: Object })
  targets?: {
    baselineYear: number;
    baselineEmissions: number;
    targetYear: number;
    targetReduction: number; // Percentage
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Team', default: [] })
  teamIds: Types.ObjectId[];

  @Prop({ type: Date })
  archivedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Indexes
ProjectSchema.index({ organizationId: 1, status: 1 });
ProjectSchema.index({ organizationId: 1, reportingYear: 1 });
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ hierarchyId: 1 });
ProjectSchema.index({ status: 1, deletedAt: 1 });
ProjectSchema.index({ createdAt: -1 });
```

**Key Fix**: `hierarchyId` is a **reference** to Hierarchy collection, not a cloned copy. This eliminates 300% data bloat from OLD system!

**Estimated Size**: 3 KB × 5,000 projects = ~15 MB

---

### 2.3 Hierarchies Collection

**Purpose**: Reusable organizational hierarchy templates (NOT cloned per project)

```typescript
@Schema({
  collection: 'hierarchies',
  timestamps: true,
  versionKey: 'version'
})
export class Hierarchy extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Boolean, default: false })
  isTemplate: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Hierarchy' })
  templateId?: Types.ObjectId; // If created from template

  @Prop({ type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' })
  status: string;

  @Prop({ type: Number, default: 0 })
  maxDepth: number;

  @Prop({ type: Number, default: 0 })
  nodeCount: number;

  @Prop({ type: Date })
  archivedAt?: Date;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const HierarchySchema = SchemaFactory.createForClass(Hierarchy);

// Indexes
HierarchySchema.index({ organizationId: 1, status: 1 });
HierarchySchema.index({ isTemplate: 1 });
HierarchySchema.index({ templateId: 1 }, { sparse: true });
```

**Estimated Size**: 1 KB × 200 hierarchies = ~200 KB

---

### 2.4 Hierarchy Nodes Collection

**Purpose**: Individual nodes in hierarchies using Materialized Path pattern

```typescript
@Schema({
  collection: 'hierarchy_nodes',
  timestamps: true,
  versionKey: 'version'
})
export class HierarchyNode extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Hierarchy', index: true })
  hierarchyId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: ['REGION', 'COUNTRY', 'SITE', 'FACILITY', 'DEPARTMENT', 'CUSTOM'] })
  type: string;

  @Prop({ type: String })
  code?: string; // Unique identifier within hierarchy

  @Prop({ type: Types.ObjectId, ref: 'HierarchyNode' })
  parentId?: Types.ObjectId;

  @Prop({ type: String, index: true })
  path: string; // Materialized Path: "/root/region/country/site"

  @Prop({ type: Number, default: 0 })
  level: number; // 0 = root, 1 = first level, etc.

  @Prop({ type: Number, default: 0 })
  order: number; // Sort order within parent

  @Prop({ type: Object })
  metadata?: {
    address?: object;
    contactPerson?: string;
    customFields?: Record<string, any>;
  };

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const HierarchyNodeSchema = SchemaFactory.createForClass(HierarchyNode);

// Indexes
HierarchyNodeSchema.index({ hierarchyId: 1, path: 1 }); // Efficient tree queries
HierarchyNodeSchema.index({ hierarchyId: 1, parentId: 1 });
HierarchyNodeSchema.index({ organizationId: 1 });
HierarchyNodeSchema.index({ path: 1 }); // For regex queries like /^\/root\/region/
HierarchyNodeSchema.index({ level: 1 });
```

**Materialized Path Pattern**: Enables efficient tree queries:
- Find all descendants: `{ path: /^\/root\/region/ }`
- Find children: `{ parentId: ObjectId }`
- Find siblings: `{ parentId: ObjectId, order: 1 }`

**Estimated Size**: 500 bytes × 50,000 nodes = ~25 MB

---

### 2.5 Permissions Collection

**Purpose**: Fine-grained resource-level permissions (PBAC)

```typescript
@Schema({
  collection: 'permissions',
  timestamps: true
})
export class Permission extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: ['PROJECT', 'HIERARCHY', 'TEAM', 'REPORT'] })
  resourceType: string;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  resourceId: Types.ObjectId;

  @Prop({ type: [String], enum: ['READ', 'WRITE', 'DELETE', 'ADMIN'], default: ['READ'] })
  actions: string[];

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  grantedBy: Types.ObjectId;

  @Prop({ type: Date })
  revokedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  revokedBy?: Types.ObjectId;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// Indexes
PermissionSchema.index({ userId: 1, resourceType: 1, resourceId: 1 });
PermissionSchema.index({ organizationId: 1, userId: 1 });
PermissionSchema.index({ resourceType: 1, resourceId: 1 });
PermissionSchema.index({ expiresAt: 1 }, { sparse: true });
PermissionSchema.index({ revokedAt: 1 }, { sparse: true });
```

**Query Pattern**: Check permission:
```typescript
db.permissions.findOne({
  userId: ObjectId,
  resourceType: 'PROJECT',
  resourceId: ObjectId,
  actions: { $in: ['WRITE'] },
  revokedAt: null,
  $or: [
    { expiresAt: null },
    { expiresAt: { $gt: new Date() } }
  ]
})
```

**Estimated Size**: 200 bytes × 100,000 permissions = ~20 MB

---

### 2.6 Teams Collection

**Purpose**: Team management within organizations

```typescript
@Schema({
  collection: 'teams',
  timestamps: true,
  versionKey: 'version'
})
export class Team extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  leaderId?: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  members: Array<{
    userId: Types.ObjectId;
    role: 'LEAD' | 'MEMBER' | 'VIEWER';
    joinedAt: Date;
  }>;

  @Prop({ type: [Types.ObjectId], ref: 'Project', default: [] })
  projectIds: Types.ObjectId[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const TeamSchema = SchemaFactory.createForClass(Team);

// Indexes
TeamSchema.index({ organizationId: 1, isActive: 1 });
TeamSchema.index({ 'members.userId': 1 });
TeamSchema.index({ leaderId: 1 });
TeamSchema.index({ projectIds: 1 });
```

**Estimated Size**: 1 KB × 500 teams = ~500 KB

---

### 2.7 Reporting Years Collection

**Purpose**: Manage reporting periods and lock status

```typescript
@Schema({
  collection: 'reporting_years',
  timestamps: true,
  versionKey: 'version'
})
export class ReportingYear extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: String, enum: ['OPEN', 'LOCKED', 'ARCHIVED'], default: 'OPEN' })
  status: string;

  @Prop({ type: Date })
  lockedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lockedBy?: Types.ObjectId;

  @Prop({ type: String })
  lockReason?: string;

  @Prop({ type: Date })
  archivedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const ReportingYearSchema = SchemaFactory.createForClass(ReportingYear);

// Indexes
ReportingYearSchema.index({ organizationId: 1, year: 1 }, { unique: true });
ReportingYearSchema.index({ status: 1 });
ReportingYearSchema.index({ year: -1 });
```

**Business Rule**: Once LOCKED, no data modifications allowed for that year

**Estimated Size**: 300 bytes × 5,000 records = ~1.5 MB

---

## 3. Reference Service Schemas

**Database Name**: `clenergize_reference`

### 3.1 Emission Factors Collection

**Purpose**: Standard and custom emission factors for calculations

```typescript
@Schema({
  collection: 'emission_factors',
  timestamps: true,
  versionKey: 'version'
})
export class EmissionFactor extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Parameter', required: true, index: true })
  parameterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', index: true })
  categoryId?: Types.ObjectId;

  @Prop({ required: true, type: String, enum: ['STANDARD', 'CUSTOM'] })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId?: Types.ObjectId; // For custom factors only

  @Prop({ type: String, enum: ['IPCC', 'EPA', 'DEFRA', 'IEA', 'CUSTOM'] })
  source: string;

  @Prop({ type: String })
  sourceReference?: string;

  @Prop({ type: String })
  sourceUrl?: string;

  @Prop({ required: true })
  version: string;

  @Prop({ required: true })
  year: number;

  @Prop({ type: String })
  region?: string; // ISO 3166-1 alpha-2

  @Prop({ type: String })
  country?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Unit' })
  unitId: Types.ObjectId;

  @Prop({ required: true, type: Object })
  factors: {
    co2: number;
    ch4: number;
    n2o: number;
    hfcs?: number;
    pfcs?: number;
    sf6?: number;
    nf3?: number;
    co2e: number; // Total CO2 equivalent
  };

  @Prop({ type: Object })
  gwp: {
    ar4?: boolean; // Fourth Assessment Report
    ar5?: boolean; // Fifth Assessment Report
    ar6?: boolean; // Sixth Assessment Report
  };

  @Prop({ type: Number })
  uncertainty?: number; // Percentage

  @Prop({ type: String, enum: ['ACTIVE', 'DEPRECATED', 'DRAFT'], default: 'ACTIVE' })
  status: string;

  @Prop({ type: Date })
  effectiveFrom: Date;

  @Prop({ type: Date })
  effectiveTo?: Date;

  @Prop({ type: Date })
  deprecatedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'EmissionFactor' })
  supersededBy?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const EmissionFactorSchema = SchemaFactory.createForClass(EmissionFactor);

// Indexes
EmissionFactorSchema.index({ parameterId: 1, year: 1, status: 1 });
EmissionFactorSchema.index({ categoryId: 1, status: 1 });
EmissionFactorSchema.index({ organizationId: 1, type: 1 }, { sparse: true });
EmissionFactorSchema.index({ region: 1, year: 1 });
EmissionFactorSchema.index({ status: 1, effectiveFrom: 1 });
EmissionFactorSchema.index({ source: 1, version: 1 });
```

**Estimated Size**: 2 KB × 10,000 factors = ~20 MB

---

### 3.2 Units Collection

**Purpose**: Units of measurement and their metadata

```typescript
@Schema({
  collection: 'units',
  timestamps: true,
  versionKey: 'version'
})
export class Unit extends Document {
  @Prop({ required: true, unique: true, trim: true })
  symbol: string; // e.g., "kWh", "kg", "L"

  @Prop({ required: true, trim: true })
  name: string; // e.g., "Kilowatt Hour", "Kilogram", "Liter"

  @Prop({ type: String, enum: ['ENERGY', 'MASS', 'VOLUME', 'DISTANCE', 'AREA', 'COUNT', 'CURRENCY'] })
  category: string;

  @Prop({ type: String })
  system?: string; // "SI", "Imperial", "US Customary"

  @Prop({ type: Boolean, default: true })
  isStandard: boolean;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);

// Indexes
UnitSchema.index({ symbol: 1 }, { unique: true });
UnitSchema.index({ category: 1, isActive: 1 });
```

**Estimated Size**: 200 bytes × 200 units = ~40 KB

---

### 3.3 Conversion Rules Collection

**Purpose**: Unit conversion rules (e.g., kWh → MWh)

```typescript
@Schema({
  collection: 'conversion_rules',
  timestamps: true,
  versionKey: 'version'
})
export class ConversionRule extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Unit', index: true })
  fromUnitId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Unit', index: true })
  toUnitId: Types.ObjectId;

  @Prop({ required: true })
  factor: number;

  @Prop({ type: Number, default: 0 })
  offset: number; // For temperature conversions

  @Prop({ type: String })
  formula?: string; // Human-readable formula

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const ConversionRuleSchema = SchemaFactory.createForClass(ConversionRule);

// Indexes
ConversionRuleSchema.index({ fromUnitId: 1, toUnitId: 1 }, { unique: true });
ConversionRuleSchema.index({ toUnitId: 1, fromUnitId: 1 });
```

**Estimated Size**: 100 bytes × 500 rules = ~50 KB

---

### 3.4 Parameters Collection

**Purpose**: Activity parameters (e.g., "Electricity", "Natural Gas")

```typescript
@Schema({
  collection: 'parameters',
  timestamps: true,
  versionKey: 'version'
})
export class Parameter extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, unique: true, trim: true })
  code: string; // e.g., "ELEC_GRID", "NG_COMBUSTION"

  @Prop({ type: Types.ObjectId, ref: 'Category', index: true })
  categoryId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Unit', default: [] })
  allowedUnitIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Unit' })
  defaultUnitId?: Types.ObjectId;

  @Prop({ type: String, enum: [1, 2, 3] })
  scope: number;

  @Prop({ type: String })
  scope3Category?: string; // For Scope 3

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ParameterSchema = SchemaFactory.createForClass(Parameter);

// Indexes
ParameterSchema.index({ code: 1 }, { unique: true });
ParameterSchema.index({ categoryId: 1, isActive: 1 });
ParameterSchema.index({ scope: 1 });
```

**Estimated Size**: 500 bytes × 1,000 parameters = ~500 KB

---

### 3.5 Categories Collection

**Purpose**: Emission categories and subcategories

```typescript
@Schema({
  collection: 'categories',
  timestamps: true,
  versionKey: 'version'
})
export class Category extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, unique: true, trim: true })
  code: string; // e.g., "STATIONARY_COMBUSTION", "MOBILE_COMBUSTION"

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  parentId?: Types.ObjectId;

  @Prop({ type: String })
  path: string; // Materialized path

  @Prop({ type: Number, default: 0 })
  level: number;

  @Prop({ type: String, enum: [1, 2, 3] })
  scope?: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes
CategorySchema.index({ code: 1 }, { unique: true });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ path: 1 });
CategorySchema.index({ scope: 1 });
```

**Estimated Size**: 300 bytes × 200 categories = ~60 KB

---

## 4. Activity Service Schemas

**Database Name**: `clenergize_activity`

### 4.1 Carbon Scopes Collection

**Purpose**: Define Scope 1, 2, 3 entities within projects

```typescript
@Schema({
  collection: 'carbon_scopes',
  timestamps: true,
  versionKey: 'version'
})
export class CarbonScope extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId; // Cross-service reference to organization-service

  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, type: Number, enum: [1, 2, 3] })
  scope: number;

  @Prop({ type: String })
  scope3Category?: string; // For Scope 3 only

  @Prop({ type: Types.ObjectId })
  hierarchyNodeId?: Types.ObjectId; // Cross-service reference

  @Prop({ type: String, trim: true })
  name?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: string;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const CarbonScopeSchema = SchemaFactory.createForClass(CarbonScope);

// Indexes
CarbonScopeSchema.index({ projectId: 1, scope: 1 });
CarbonScopeSchema.index({ organizationId: 1 });
CarbonScopeSchema.index({ hierarchyNodeId: 1 }, { sparse: true });
CarbonScopeSchema.index({ status: 1, deletedAt: 1 });
```

**Estimated Size**: 500 bytes × 20,000 scopes = ~10 MB

---

### 4.2 Activity Data Collection

**Purpose**: Raw activity data entries (largest collection)

```typescript
@Schema({
  collection: 'activity_data',
  timestamps: true,
  versionKey: 'version'
})
export class ActivityData extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'CarbonScope', index: true })
  carbonScopeId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  parameterId: Types.ObjectId; // Cross-service reference to reference-service

  @Prop({ required: true })
  year: number;

  @Prop({ type: Number })
  month?: number; // 1-12, null for annual data

  @Prop({ required: true })
  quantityConsumed: number;

  @Prop({ required: true, type: Types.ObjectId })
  uomId: Types.ObjectId; // Unit of measurement

  @Prop({ type: Object })
  monthlyData?: {
    jan?: number;
    feb?: number;
    mar?: number;
    apr?: number;
    may?: number;
    jun?: number;
    jul?: number;
    aug?: number;
    sep?: number;
    oct?: number;
    nov?: number;
    dec?: number;
  };

  @Prop({ type: Number, min: 1, max: 4 })
  dataQuality?: number; // 1=Measured, 2=Calculated, 3=Estimated, 4=Proxy

  @Prop({ type: String, enum: ['PENDING', 'VALIDATED', 'REJECTED', 'VERIFIED'], default: 'PENDING' })
  status: string;

  @Prop({ type: String })
  source?: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: [String], default: [] })
  attachmentIds: string[]; // S3 keys

  @Prop({ type: Types.ObjectId })
  bulkImportId?: Types.ObjectId;

  @Prop({ type: Date })
  verifiedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const ActivityDataSchema = SchemaFactory.createForClass(ActivityData);

// Indexes
ActivityDataSchema.index({ carbonScopeId: 1, year: 1, month: 1 });
ActivityDataSchema.index({ projectId: 1, parameterId: 1, year: 1 });
ActivityDataSchema.index({ organizationId: 1, year: 1 });
ActivityDataSchema.index({ status: 1, deletedAt: 1 });
ActivityDataSchema.index({ bulkImportId: 1 }, { sparse: true });
ActivityDataSchema.index({ createdAt: -1 });
```

**Estimated Size**: 1 KB × 1,000,000 records = ~1 GB (largest collection)

---

### 4.3 Bulk Imports Collection

**Purpose**: Track bulk import jobs and their status

```typescript
@Schema({
  collection: 'bulk_imports',
  timestamps: true
})
export class BulkImport extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  s3Key: string;

  @Prop({ type: Number })
  fileSize: number;

  @Prop({ type: String, enum: ['CSV', 'EXCEL', 'JSON'] })
  fileFormat: string;

  @Prop({ type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'PENDING' })
  status: string;

  @Prop({ type: Number, default: 0 })
  totalRows: number;

  @Prop({ type: Number, default: 0 })
  processedRows: number;

  @Prop({ type: Number, default: 0 })
  successRows: number;

  @Prop({ type: Number, default: 0 })
  errorRows: number;

  @Prop({ type: [Object], default: [] })
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Date })
  failedAt?: Date;

  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const BulkImportSchema = SchemaFactory.createForClass(BulkImport);

// Indexes
BulkImportSchema.index({ projectId: 1, status: 1 });
BulkImportSchema.index({ organizationId: 1, createdAt: -1 });
BulkImportSchema.index({ status: 1 });
BulkImportSchema.index({ createdAt: -1 });
```

**Estimated Size**: 2 KB × 5,000 imports = ~10 MB

---

### 4.4 Attachments Collection

**Purpose**: Track file attachments linked to activity data

```typescript
@Schema({
  collection: 'attachments',
  timestamps: true
})
export class Attachment extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'ActivityData', index: true })
  activityDataId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  s3Key: string;

  @Prop({ type: String })
  mimeType: string;

  @Prop({ type: Number })
  fileSize: number;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploadedBy: Types.ObjectId;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

// Indexes
AttachmentSchema.index({ activityDataId: 1 });
AttachmentSchema.index({ projectId: 1, createdAt: -1 });
AttachmentSchema.index({ s3Key: 1 }, { unique: true });
```

**Estimated Size**: 300 bytes × 50,000 attachments = ~15 MB

---

### 4.5 Comments Collection

**Purpose**: Comments and discussions on activity data

```typescript
@Schema({
  collection: 'comments',
  timestamps: true
})
export class Comment extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'ActivityData', index: true })
  activityDataId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  parentId?: Types.ObjectId; // For threaded comments

  @Prop({ type: Boolean, default: false })
  isResolved: boolean;

  @Prop({ type: Date })
  resolvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  resolvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Indexes
CommentSchema.index({ activityDataId: 1, createdAt: -1 });
CommentSchema.index({ projectId: 1, isResolved: 1 });
CommentSchema.index({ parentId: 1 }, { sparse: true });
```

**Estimated Size**: 500 bytes × 20,000 comments = ~10 MB

---

### 4.6 Data Quality Flags Collection

**Purpose**: Track data quality issues and resolutions

```typescript
@Schema({
  collection: 'data_quality_flags',
  timestamps: true
})
export class DataQualityFlag extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'ActivityData', index: true })
  activityDataId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId;

  @Prop({ type: String, enum: ['WARNING', 'ERROR', 'INFO'], default: 'WARNING' })
  severity: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: ['MISSING_DATA', 'OUTLIER', 'INCONSISTENT', 'DUPLICATE', 'OTHER'] })
  type: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: String, enum: ['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'], default: 'OPEN' })
  status: string;

  @Prop({ type: Date })
  resolvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  resolvedBy?: Types.ObjectId;

  @Prop({ type: String })
  resolution?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const DataQualityFlagSchema = SchemaFactory.createForClass(DataQualityFlag);

// Indexes
DataQualityFlagSchema.index({ activityDataId: 1, status: 1 });
DataQualityFlagSchema.index({ projectId: 1, severity: 1, status: 1 });
DataQualityFlagSchema.index({ status: 1, createdAt: -1 });
```

**Estimated Size**: 400 bytes × 10,000 flags = ~4 MB

---

## 5. Calculation Service Schemas

**Database Name**: `clenergize_calculation`

### 5.1 Calculations Collection

**Purpose**: Individual emission calculations (largest in calculation service)

```typescript
@Schema({
  collection: 'calculations',
  timestamps: true,
  versionKey: 'version'
})
export class Calculation extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  activityDataId: Types.ObjectId; // Cross-service reference

  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  emissionFactorId: Types.ObjectId; // Cross-service reference

  @Prop({ required: true })
  scope: number; // 1, 2, or 3

  @Prop({ type: String })
  scope3Category?: string;

  @Prop({ required: true })
  quantityConsumed: number;

  @Prop({ required: true, type: Types.ObjectId })
  uomId: Types.ObjectId;

  @Prop({ type: String, enum: ['FUEL_BASED', 'DISTANCE_BASED', 'SPEND_BASED', 'LOCATION_BASED', 'MARKET_BASED'] })
  methodology: string;

  @Prop({ required: true, type: Object })
  result: {
    co2: number;
    ch4: number;
    n2o: number;
    hfcs?: number;
    pfcs?: number;
    sf6?: number;
    nf3?: number;
    co2e: number; // Total CO2 equivalent
  };

  @Prop({ type: Number })
  uncertainty?: number;

  @Prop({ type: Object })
  calculationDetails: {
    emissionFactor: object;
    conversionFactor?: number;
    gwpVersion?: string;
  };

  @Prop({ type: String, enum: ['COMPLETED', 'FAILED', 'RECALCULATED'], default: 'COMPLETED' })
  status: string;

  @Prop({ type: Date })
  calculatedAt: Date;

  @Prop({ type: Types.ObjectId })
  recalculationJobId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const CalculationSchema = SchemaFactory.createForClass(Calculation);

// Indexes
CalculationSchema.index({ activityDataId: 1 });
CalculationSchema.index({ projectId: 1, scope: 1, calculatedAt: -1 });
CalculationSchema.index({ organizationId: 1, calculatedAt: -1 });
CalculationSchema.index({ emissionFactorId: 1 });
CalculationSchema.index({ recalculationJobId: 1 }, { sparse: true });
CalculationSchema.index({ calculatedAt: -1 });
```

**Estimated Size**: 1.5 KB × 1,000,000 calculations = ~1.5 GB

---

### 5.2 Rollups Collection

**Purpose**: Aggregated emissions at various hierarchy levels

```typescript
@Schema({
  collection: 'rollups',
  timestamps: true,
  versionKey: 'version'
})
export class Rollup extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  hierarchyNodeId?: Types.ObjectId; // Null for project-level

  @Prop({ required: true })
  year: number;

  @Prop({ type: Number })
  month?: number;

  @Prop({ type: String, enum: ['PROJECT', 'HIERARCHY_NODE', 'SCOPE', 'CATEGORY'] })
  aggregationType: string;

  @Prop({ required: true, type: Object })
  totalEmissions: {
    scope1: number;
    scope2Location?: number;
    scope2Market?: number;
    scope3?: number;
    total: number;
  };

  @Prop({ type: Object })
  breakdown: {
    byScope?: Record<string, number>;
    byCategory?: Record<string, number>;
    byParameter?: Record<string, number>;
  };

  @Prop({ type: Date })
  calculatedAt: Date;

  @Prop({ type: Number })
  calculationCount: number; // Number of calculations included
}

export const RollupSchema = SchemaFactory.createForClass(Rollup);

// Indexes
RollupSchema.index({ projectId: 1, year: 1, month: 1, aggregationType: 1 });
RollupSchema.index({ organizationId: 1, year: 1 });
RollupSchema.index({ hierarchyNodeId: 1, year: 1 }, { sparse: true });
RollupSchema.index({ calculatedAt: -1 });
```

**Estimated Size**: 2 KB × 50,000 rollups = ~100 MB

---

### 5.3 Allocations Collection

**Purpose**: Emission allocations across entities

```typescript
@Schema({
  collection: 'allocations',
  timestamps: true,
  versionKey: 'version'
})
export class Allocation extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  calculationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  fromHierarchyNodeId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  toHierarchyNodeId: Types.ObjectId;

  @Prop({ type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'FORMULA'] })
  allocationType: string;

  @Prop({ required: true })
  allocationValue: number;

  @Prop({ type: String })
  formula?: string;

  @Prop({ required: true })
  allocatedEmissions: number;

  @Prop({ type: String })
  reason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const AllocationSchema = SchemaFactory.createForClass(Allocation);

// Indexes
AllocationSchema.index({ calculationId: 1 });
AllocationSchema.index({ projectId: 1, fromHierarchyNodeId: 1 });
AllocationSchema.index({ toHierarchyNodeId: 1 });
```

**Estimated Size**: 500 bytes × 10,000 allocations = ~5 MB

---

### 5.4 Recalculation Jobs Collection

**Purpose**: Track batch recalculation jobs

```typescript
@Schema({
  collection: 'recalculation_jobs',
  timestamps: true
})
export class RecalculationJob extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: String, enum: ['ALL', 'BY_PARAMETER', 'BY_YEAR', 'BY_SCOPE', 'CUSTOM'] })
  scope: string;

  @Prop({ type: Object })
  filters?: {
    parameterId?: Types.ObjectId;
    year?: number;
    scope?: number;
    customQuery?: object;
  };

  @Prop({ type: String, enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'], default: 'PENDING' })
  status: string;

  @Prop({ type: Number, default: 0 })
  totalCalculations: number;

  @Prop({ type: Number, default: 0 })
  processedCalculations: number;

  @Prop({ type: Number, default: 0 })
  successCount: number;

  @Prop({ type: Number, default: 0 })
  errorCount: number;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const RecalculationJobSchema = SchemaFactory.createForClass(RecalculationJob);

// Indexes
RecalculationJobSchema.index({ projectId: 1, status: 1 });
RecalculationJobSchema.index({ organizationId: 1, createdAt: -1 });
RecalculationJobSchema.index({ status: 1, createdAt: -1 });
```

**Estimated Size**: 1 KB × 1,000 jobs = ~1 MB

---

## 6. Reporting Service Schemas

**Database Name**: `clenergize_reporting`

### 6.1 Reports Collection

**Purpose**: Generated reports and their metadata

```typescript
@Schema({
  collection: 'reports',
  timestamps: true
})
export class Report extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: String, enum: ['GHG_INVENTORY', 'EXECUTIVE_SUMMARY', 'SCOPE_ANALYSIS', 'TREND_REPORT', 'ENTITY_COMPARISON', 'ACTIVITY_DETAIL', 'VERIFICATION_REPORT'] })
  reportType: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: Object })
  period: {
    year: number;
    month?: number;
    quarter?: number;
  };

  @Prop({ type: String, enum: ['PROCESSING', 'COMPLETED', 'FAILED'], default: 'PROCESSING' })
  status: string;

  @Prop({ type: String, enum: ['PDF', 'EXCEL', 'CSV'] })
  format: string;

  @Prop({ type: String })
  s3Key?: string;

  @Prop({ type: Number })
  fileSize?: number;

  @Prop({ type: Object })
  parameters?: Record<string, any>;

  @Prop({ type: Date })
  generatedAt?: Date;

  @Prop({ type: Date })
  expiresAt?: Date; // Auto-delete old reports

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

// Indexes
ReportSchema.index({ projectId: 1, reportType: 1, createdAt: -1 });
ReportSchema.index({ organizationId: 1, status: 1 });
ReportSchema.index({ status: 1, expiresAt: 1 });
ReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index - delete after 90 days
```

**TTL Strategy**: Auto-delete reports after 90 days

**Estimated Size**: 1 KB × 10,000 reports = ~10 MB

---

### 6.2 Report Schedules Collection

**Purpose**: Scheduled report generation

```typescript
@Schema({
  collection: 'report_schedules',
  timestamps: true,
  versionKey: 'version'
})
export class ReportSchedule extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: ['GHG_INVENTORY', 'EXECUTIVE_SUMMARY', 'SCOPE_ANALYSIS', 'TREND_REPORT', 'ENTITY_COMPARISON', 'ACTIVITY_DETAIL', 'VERIFICATION_REPORT'] })
  reportType: string;

  @Prop({ type: String, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'] })
  frequency: string;

  @Prop({ type: String }) // Cron expression
  cronExpression: string;

  @Prop({ type: String, enum: ['PDF', 'EXCEL', 'CSV'], default: 'PDF' })
  format: string;

  @Prop({ type: [String], default: [] })
  recipientEmails: string[];

  @Prop({ type: Object })
  parameters?: Record<string, any>;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  lastRunAt?: Date;

  @Prop({ type: Date })
  nextRunAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const ReportScheduleSchema = SchemaFactory.createForClass(ReportSchedule);

// Indexes
ReportScheduleSchema.index({ projectId: 1, isActive: 1 });
ReportScheduleSchema.index({ organizationId: 1, isActive: 1 });
ReportScheduleSchema.index({ nextRunAt: 1, isActive: 1 });
```

**Estimated Size**: 500 bytes × 500 schedules = ~250 KB

---

### 6.3 Exports Collection

**Purpose**: Data export jobs (CSV, Excel)

```typescript
@Schema({
  collection: 'exports',
  timestamps: true
})
export class Export extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: String, enum: ['ACTIVITY_DATA', 'CALCULATIONS', 'EMISSIONS_SUMMARY', 'CUSTOM'] })
  exportType: string;

  @Prop({ type: String, enum: ['CSV', 'EXCEL', 'JSON'] })
  format: string;

  @Prop({ type: Object })
  filters?: Record<string, any>;

  @Prop({ type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'PENDING' })
  status: string;

  @Prop({ type: String })
  s3Key?: string;

  @Prop({ type: Number })
  fileSize?: number;

  @Prop({ type: Number })
  rowCount?: number;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const ExportSchema = SchemaFactory.createForClass(Export);

// Indexes
ExportSchema.index({ projectId: 1, status: 1 });
ExportSchema.index({ organizationId: 1, createdAt: -1 });
ExportSchema.index({ status: 1, expiresAt: 1 });
ExportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL - 7 days
```

**TTL Strategy**: Auto-delete exports after 7 days

**Estimated Size**: 500 bytes × 5,000 exports = ~2.5 MB

---

### 6.4 Report Templates Collection

**Purpose**: Customizable report templates

```typescript
@Schema({
  collection: 'report_templates',
  timestamps: true,
  versionKey: 'version'
})
export class ReportTemplate extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId?: Types.ObjectId; // Null for global templates

  @Prop({ required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, enum: ['GHG_INVENTORY', 'EXECUTIVE_SUMMARY', 'SCOPE_ANALYSIS', 'TREND_REPORT', 'ENTITY_COMPARISON', 'ACTIVITY_DETAIL', 'VERIFICATION_REPORT', 'CUSTOM'] })
  reportType: string;

  @Prop({ type: Boolean, default: false })
  isGlobal: boolean;

  @Prop({ type: Object })
  sections: Array<{
    title: string;
    type: string;
    config: Record<string, any>;
  }>;

  @Prop({ type: Object })
  styling?: Record<string, any>;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const ReportTemplateSchema = SchemaFactory.createForClass(ReportTemplate);

// Indexes
ReportTemplateSchema.index({ organizationId: 1, isActive: 1 }, { sparse: true });
ReportTemplateSchema.index({ isGlobal: 1, reportType: 1 });
```

**Estimated Size**: 5 KB × 100 templates = ~500 KB

---

### 6.5 Dashboards Collection

**Purpose**: User-customizable dashboard configurations

```typescript
@Schema({
  collection: 'dashboards',
  timestamps: true,
  versionKey: 'version'
})
export class Dashboard extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Boolean, default: false })
  isDefault: boolean;

  @Prop({ type: [Object], default: [] })
  widgets: Array<{
    id: string;
    type: string;
    position: { x: number; y: number; w: number; h: number };
    config: Record<string, any>;
  }>;

  @Prop({ type: Object })
  filters?: Record<string, any>;

  @Prop({ type: Date })
  lastViewedAt?: Date;
}

export const DashboardSchema = SchemaFactory.createForClass(Dashboard);

// Indexes
DashboardSchema.index({ userId: 1, organizationId: 1 });
DashboardSchema.index({ userId: 1, isDefault: 1 });
```

**Estimated Size**: 3 KB × 1,000 dashboards = ~3 MB

---

## 7. Audit Service Schemas

**Database Name**: `clenergize_audit`

### 7.1 Audit Logs Collection

**Purpose**: Immutable audit trail with hash chain for tamper detection

```typescript
@Schema({
  collection: 'audit_logs',
  timestamps: { createdAt: true, updatedAt: false } // No updates allowed!
})
export class AuditLog extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: ['CREATE', 'UPDATE', 'DELETE', 'READ', 'EXPORT', 'LOGIN', 'LOGOUT', 'PERMISSION_CHANGE'] })
  action: string;

  @Prop({ required: true, type: String, enum: ['USER', 'ORGANIZATION', 'PROJECT', 'HIERARCHY', 'ACTIVITY_DATA', 'CALCULATION', 'REPORT', 'EMISSION_FACTOR'] })
  resourceType: string;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  resourceId: Types.ObjectId;

  @Prop({ type: String, enum: ['SUCCESS', 'FAILURE'] })
  result: string;

  @Prop({ type: [Object] })
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ required: true })
  hash: string; // SHA-256 hash of this log entry

  @Prop({ type: String })
  previousHash?: string; // Hash of previous log entry (hash chain)

  @Prop({ type: Number })
  sequenceNumber: number; // Auto-increment for ordering
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes
AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, result: 1, createdAt: -1 });
AuditLogSchema.index({ sequenceNumber: 1 }, { unique: true });
AuditLogSchema.index({ hash: 1 }, { unique: true });

// Pre-save hook to calculate hash
AuditLogSchema.pre('save', async function(next) {
  const crypto = require('crypto');

  // Get previous log for hash chain
  const prevLog = await this.constructor.findOne({
    organizationId: this.organizationId
  }).sort({ sequenceNumber: -1 });

  this.previousHash = prevLog?.hash || null;
  this.sequenceNumber = (prevLog?.sequenceNumber || 0) + 1;

  // Calculate hash
  const data = JSON.stringify({
    organizationId: this.organizationId,
    userId: this.userId,
    action: this.action,
    resourceType: this.resourceType,
    resourceId: this.resourceId,
    result: this.result,
    changes: this.changes,
    timestamp: this.createdAt,
    previousHash: this.previousHash,
    sequenceNumber: this.sequenceNumber
  });

  this.hash = crypto.createHash('sha256').update(data).digest('hex');
  next();
});
```

**Hash Chain**: Each log entry includes hash of previous entry, enabling tamper detection

**Estimated Size**: 2 KB × 1,000,000 logs = ~2 GB

---

### 7.2 Compliance Checks Collection

**Purpose**: Track compliance audit results

```typescript
@Schema({
  collection: 'compliance_checks',
  timestamps: true
})
export class ComplianceCheck extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, index: true })
  projectId?: Types.ObjectId;

  @Prop({ type: String, enum: ['GDPR', 'ISO_14064', 'GHG_PROTOCOL', 'SOC2', 'HIPAA', 'CUSTOM'] })
  complianceType: string;

  @Prop({ required: true })
  checkName: string;

  @Prop({ type: String, enum: ['PASSED', 'FAILED', 'WARNING', 'NOT_APPLICABLE'] })
  status: string;

  @Prop({ type: [Object] })
  findings?: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
    recommendation: string;
  }>;

  @Prop({ type: Object })
  evidence?: Record<string, any>;

  @Prop({ type: Date })
  checkedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  checkedBy?: Types.ObjectId;

  @Prop({ type: Date })
  nextCheckDue?: Date;
}

export const ComplianceCheckSchema = SchemaFactory.createForClass(ComplianceCheck);

// Indexes
ComplianceCheckSchema.index({ organizationId: 1, complianceType: 1, checkedAt: -1 });
ComplianceCheckSchema.index({ projectId: 1, status: 1 }, { sparse: true });
ComplianceCheckSchema.index({ nextCheckDue: 1 });
```

**Estimated Size**: 3 KB × 5,000 checks = ~15 MB

---

### 7.3 Security Events Collection

**Purpose**: Track security-related events for monitoring

```typescript
@Schema({
  collection: 'security_events',
  timestamps: { createdAt: true, updatedAt: false }
})
export class SecurityEvent extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ type: String, enum: ['FAILED_LOGIN', 'BRUTE_FORCE', 'SUSPICIOUS_ACTIVITY', 'UNAUTHORIZED_ACCESS', 'DATA_BREACH', 'PRIVILEGE_ESCALATION', 'API_ABUSE'] })
  eventType: string;

  @Prop({ type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] })
  severity: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: Object })
  details?: Record<string, any>;

  @Prop({ type: Date })
  detectedAt: Date;

  @Prop({ type: [String], default: [] })
  responseActions: string[];

  @Prop({ type: Boolean, default: false })
  isResolved: boolean;

  @Prop({ type: Date })
  resolvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  resolvedBy?: Types.ObjectId;
}

export const SecurityEventSchema = SchemaFactory.createForClass(SecurityEvent);

// Indexes
SecurityEventSchema.index({ organizationId: 1, severity: 1, detectedAt: -1 });
SecurityEventSchema.index({ userId: 1, eventType: 1 }, { sparse: true });
SecurityEventSchema.index({ eventType: 1, isResolved: 1, detectedAt: -1 });
```

**Estimated Size**: 1 KB × 10,000 events = ~10 MB

---

### 7.4 Data Access Logs Collection

**Purpose**: Track data access for GDPR compliance

```typescript
@Schema({
  collection: 'data_access_logs',
  timestamps: { createdAt: true, updatedAt: false }
})
export class DataAccessLog extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: ['USER', 'ORGANIZATION', 'PROJECT', 'ACTIVITY_DATA', 'CALCULATION', 'REPORT'] })
  resourceType: string;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  resourceId: Types.ObjectId;

  @Prop({ type: String, enum: ['READ', 'WRITE', 'DELETE', 'EXPORT'] })
  action: string;

  @Prop({ type: String, enum: ['UI', 'API', 'DIRECT_DATABASE'] })
  accessMethod: string;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: Boolean })
  success: boolean;

  @Prop({ type: String, enum: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'] })
  dataClassification?: string;

  @Prop({ type: Number })
  recordCount?: number;
}

export const DataAccessLogSchema = SchemaFactory.createForClass(DataAccessLog);

// Indexes
DataAccessLogSchema.index({ organizationId: 1, createdAt: -1 });
DataAccessLogSchema.index({ userId: 1, action: 1, createdAt: -1 });
DataAccessLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
DataAccessLogSchema.index({ createdAt: -1 });
```

**Estimated Size**: 500 bytes × 500,000 logs = ~250 MB

---

### 7.5 GDPR Requests Collection

**Purpose**: Track GDPR data subject requests

```typescript
@Schema({
  collection: 'gdpr_requests',
  timestamps: true
})
export class GDPRRequest extends Document {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  subjectUserId: Types.ObjectId;

  @Prop({ type: String, enum: ['ACCESS', 'ERASURE', 'RECTIFICATION', 'PORTABILITY', 'OBJECT', 'RESTRICT'] })
  requestType: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'], default: 'PENDING' })
  status: string;

  @Prop({ type: Date })
  dueDate: Date; // 30 days from request

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: String })
  completionNotes?: string;

  @Prop({ type: String })
  s3Key?: string; // For ACCESS/PORTABILITY requests

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const GDPRRequestSchema = SchemaFactory.createForClass(GDPRRequest);

// Indexes
GDPRRequestSchema.index({ organizationId: 1, status: 1 });
GDPRRequestSchema.index({ subjectUserId: 1, requestType: 1 });
GDPRRequestSchema.index({ status: 1, dueDate: 1 });
GDPRRequestSchema.index({ createdAt: -1 });
```

**Estimated Size**: 2 KB × 500 requests = ~1 MB

---

## 8. Migration Strategy

### From OLD to NEW Schema Mapping

| OLD Collection | NEW Collection(s) | Migration Strategy |
|----------------|-------------------|--------------------|
| users | identity.users | Direct copy with password re-hashing |
| companies | organization.organizations | Rename fields, add new required fields |
| projects | organization.projects | **Remove cloned hierarchies**, add hierarchyId reference |
| hierarchies | organization.hierarchies + hierarchy_nodes | Split into 2 collections, use Materialized Path |
| activityData | activity.activity_data | Direct copy with schema validation |
| calculations | calculation.calculations | Recalculate all (don't trust OLD results) |
| reports | reporting.reports | Regenerate (don't migrate) |
| auditLogs | audit.audit_logs | Copy and add hash chain |

### Critical Migration Issues to Fix

1. **Hierarchy Cloning → References**:
```typescript
// OLD (300% data bloat)
{
  projectId: "123",
  hierarchy: { /* ENTIRE 5MB HIERARCHY CLONED */ }
}

// NEW (99% savings)
{
  projectId: "123",
  hierarchyId: ObjectId("hierarchy-ref")
}
```

2. **Denormalized Data → Normalized**:
```typescript
// OLD
{
  activityData: {
    emissionFactor: { /* Full copy */ },
    unit: { /* Full copy */ },
    parameter: { /* Full copy */ }
  }
}

// NEW
{
  activityData: {
    emissionFactorId: ObjectId,
    unitId: ObjectId,
    parameterId: ObjectId
  }
}
```

3. **No Audit Trail → Full Audit**:
```typescript
// Add to all collections:
{
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  version: Number,
  deletedAt: Date // Soft delete
}
```

---

## 9. Index Strategy

### Compound Index Guidelines

1. **Equality fields first**: `{ organizationId: 1, status: 1 }`
2. **Sort fields last**: `{ organizationId: 1, createdAt: -1 }`
3. **Cover common queries**: Index all fields in WHERE and ORDER BY

### Index Performance Targets

- Query response time: <50ms for indexed queries
- Index size: <20% of collection size
- Index hit ratio: >95%

### Index Monitoring

```javascript
// Check index usage
db.collection.aggregate([
  { $indexStats: {} }
])

// Find missing indexes
db.collection.explain("executionStats").find({ ... })
```

---

## 10. Data Retention & Archival

### Retention Policies

| Collection | Retention | Strategy |
|------------|-----------|----------|
| sessions | 7 days | TTL index |
| refresh_tokens | 90 days | TTL index |
| password_reset_tokens | 1 hour | TTL index |
| reports | 90 days | TTL index |
| exports | 7 days | TTL index |
| audit_logs | 7 years | Archive to S3 Glacier after 1 year |
| data_access_logs | 3 years | Archive to S3 after 1 year |
| activity_data | Indefinite | Keep all |
| calculations | Indefinite | Keep all |

### Archival Process

```typescript
// Monthly cron job
async function archiveOldData() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const oldLogs = await db.audit_logs.find({
    createdAt: { $lt: oneYearAgo }
  }).toArray();

  // Upload to S3 Glacier
  await s3.upload({
    Bucket: 'clenergize-archives',
    Key: `audit-logs/${new Date().toISOString()}.json.gz`,
    Body: gzip(JSON.stringify(oldLogs)),
    StorageClass: 'GLACIER'
  });

  // Delete from MongoDB
  await db.audit_logs.deleteMany({
    createdAt: { $lt: oneYearAgo }
  });
}
```

---

## 11. Performance Optimization

### Sharding Strategy (for scale >100GB)

```javascript
// Shard key selection
// Activity Data: Shard by { organizationId: 1, year: 1 }
sh.shardCollection("clenergize_activity.activity_data", {
  organizationId: 1,
  year: 1
});

// Calculations: Shard by { organizationId: 1, calculatedAt: 1 }
sh.shardCollection("clenergize_calculation.calculations", {
  organizationId: 1,
  calculatedAt: 1
});
```

### Read Preference Strategy

```typescript
// Writes: Primary
await collection.insertOne(doc, { writeConcern: { w: "majority" } });

// Reads (reports): Secondary OK
await collection.find(query).readPreference('secondaryPreferred');

// Reads (real-time): Primary
await collection.findOne(query).readPreference('primary');
```

---

## Summary

This database design specification provides **37 normalized MongoDB collection schemas** across all 7 microservices:

| Service | Collections | Key Design Patterns |
|---------|-------------|---------------------|
| Identity | 5 | TTL indexes for tokens, encrypted MFA secrets |
| Organization | 7 | **Hierarchy references (not cloning!)**, Materialized Path |
| Reference | 5 | Versioned emission factors, unit conversions |
| Activity | 6 | Largest collections, bulk import tracking |
| Calculation | 4 | Recalculation jobs, rollup aggregations |
| Reporting | 5 | TTL for temporary exports, scheduled reports |
| Audit | 5 | **Hash chain for tamper detection**, immutable logs |

**Total Estimated Size (1 year)**: ~183 GB

**Key Improvements Over OLD System**:
1. ✅ **99% reduction in data bloat** (hierarchy references vs cloning)
2. ✅ **Full audit trail** with hash chain integrity verification
3. ✅ **Proper indexes** for all query patterns
4. ✅ **TTL indexes** for auto-cleanup of temporary data
5. ✅ **Materialized Path** for efficient hierarchy queries
6. ✅ **Soft deletes** instead of hard deletes
7. ✅ **Optimistic locking** with version fields
8. ✅ **Cross-service references** instead of denormalization

---

## 12. Complete Index Definitions (MongoDB Syntax)

This section provides all 92 indexes in executable MongoDB commands for each service database. These indexes support all query patterns identified in the API specification.

### 12.1 Identity Service Indexes (12 indexes)

**Database**: `clenergize_identity`

```javascript
// Users Collection (5 indexes)
db.users.createIndex({ email: 1 }, {
  unique: true,
  name: 'idx_users_email_unique'
});

db.users.createIndex({ organizationId: 1, status: 1 }, {
  name: 'idx_users_org_status'
});

db.users.createIndex({ status: 1, deletedAt: 1 }, {
  name: 'idx_users_status_deleted'
});

db.users.createIndex({ emailVerificationToken: 1 }, {
  sparse: true,
  name: 'idx_users_email_verification_token'
});

db.users.createIndex({ createdAt: -1 }, {
  name: 'idx_users_created_desc'
});

// Sessions Collection (4 indexes)
db.sessions.createIndex({ sessionToken: 1 }, {
  unique: true,
  name: 'idx_sessions_token_unique'
});

db.sessions.createIndex({ userId: 1, isRevoked: 1 }, {
  name: 'idx_sessions_user_revoked'
});

db.sessions.createIndex({ expiresAt: 1 }, {
  expireAfterSeconds: 0,
  name: 'idx_sessions_ttl'
});

db.sessions.createIndex({ lastActivityAt: -1 }, {
  name: 'idx_sessions_activity_desc'
});

// Refresh Tokens Collection (4 indexes)
db.refresh_tokens.createIndex({ tokenHash: 1 }, {
  unique: true,
  name: 'idx_refresh_tokens_hash_unique'
});

db.refresh_tokens.createIndex({ userId: 1, isRevoked: 1 }, {
  name: 'idx_refresh_tokens_user_revoked'
});

db.refresh_tokens.createIndex({ expiresAt: 1 }, {
  expireAfterSeconds: 0,
  name: 'idx_refresh_tokens_ttl'
});

db.refresh_tokens.createIndex({ previousTokenHash: 1 }, {
  sparse: true,
  name: 'idx_refresh_tokens_previous_hash'
});

// MFA Secrets Collection (2 indexes)
db.mfa_secrets.createIndex({ userId: 1 }, {
  unique: true,
  name: 'idx_mfa_secrets_user_unique'
});

db.mfa_secrets.createIndex({ isVerified: 1 }, {
  name: 'idx_mfa_secrets_verified'
});

// Password Reset Tokens Collection (3 indexes)
db.password_reset_tokens.createIndex({ tokenHash: 1 }, {
  unique: true,
  name: 'idx_password_reset_hash_unique'
});

db.password_reset_tokens.createIndex({ userId: 1, isUsed: 1 }, {
  name: 'idx_password_reset_user_used'
});

db.password_reset_tokens.createIndex({ expiresAt: 1 }, {
  expireAfterSeconds: 0,
  name: 'idx_password_reset_ttl'
});
```

**Identity Service Summary**: 18 indexes (corrected from 12)

---

### 12.2 Organization Service Indexes (18 indexes)

**Database**: `clenergize_organization`

```javascript
// Organizations Collection (4 indexes)
db.organizations.createIndex({ name: 1 }, {
  name: 'idx_organizations_name'
});

db.organizations.createIndex({ status: 1, deletedAt: 1 }, {
  name: 'idx_organizations_status_deleted'
});

db.organizations.createIndex({ subscriptionTier: 1 }, {
  name: 'idx_organizations_subscription'
});

db.organizations.createIndex({ createdAt: -1 }, {
  name: 'idx_organizations_created_desc'
});

// Projects Collection (6 indexes)
db.projects.createIndex({ organizationId: 1, status: 1 }, {
  name: 'idx_projects_org_status'
});

db.projects.createIndex({ organizationId: 1, reportingYear: 1 }, {
  name: 'idx_projects_org_year'
});

db.projects.createIndex({ ownerId: 1 }, {
  name: 'idx_projects_owner'
});

db.projects.createIndex({ hierarchyId: 1 }, {
  name: 'idx_projects_hierarchy'
});

db.projects.createIndex({ status: 1, deletedAt: 1 }, {
  name: 'idx_projects_status_deleted'
});

db.projects.createIndex({ createdAt: -1 }, {
  name: 'idx_projects_created_desc'
});

// Hierarchies Collection (3 indexes)
db.hierarchies.createIndex({ organizationId: 1, status: 1 }, {
  name: 'idx_hierarchies_org_status'
});

db.hierarchies.createIndex({ isTemplate: 1 }, {
  name: 'idx_hierarchies_template'
});

db.hierarchies.createIndex({ templateId: 1 }, {
  sparse: true,
  name: 'idx_hierarchies_template_id'
});

// Hierarchy Nodes Collection (5 indexes)
db.hierarchy_nodes.createIndex({ hierarchyId: 1, path: 1 }, {
  name: 'idx_hierarchy_nodes_hierarchy_path'
});

db.hierarchy_nodes.createIndex({ hierarchyId: 1, parentId: 1 }, {
  name: 'idx_hierarchy_nodes_hierarchy_parent'
});

db.hierarchy_nodes.createIndex({ organizationId: 1 }, {
  name: 'idx_hierarchy_nodes_org'
});

db.hierarchy_nodes.createIndex({ path: 1 }, {
  name: 'idx_hierarchy_nodes_path'
});

db.hierarchy_nodes.createIndex({ level: 1 }, {
  name: 'idx_hierarchy_nodes_level'
});

// Permissions Collection (5 indexes)
db.permissions.createIndex({ userId: 1, resourceType: 1, resourceId: 1 }, {
  name: 'idx_permissions_user_resource'
});

db.permissions.createIndex({ organizationId: 1, userId: 1 }, {
  name: 'idx_permissions_org_user'
});

db.permissions.createIndex({ resourceType: 1, resourceId: 1 }, {
  name: 'idx_permissions_resource'
});

db.permissions.createIndex({ expiresAt: 1 }, {
  sparse: true,
  name: 'idx_permissions_expires'
});

db.permissions.createIndex({ revokedAt: 1 }, {
  sparse: true,
  name: 'idx_permissions_revoked'
});

// Teams Collection (4 indexes)
db.teams.createIndex({ organizationId: 1, isActive: 1 }, {
  name: 'idx_teams_org_active'
});

db.teams.createIndex({ 'members.userId': 1 }, {
  name: 'idx_teams_members_user'
});

db.teams.createIndex({ leaderId: 1 }, {
  name: 'idx_teams_leader'
});

db.teams.createIndex({ projectIds: 1 }, {
  name: 'idx_teams_projects'
});

// Reporting Years Collection (3 indexes)
db.reporting_years.createIndex({ organizationId: 1, year: 1 }, {
  unique: true,
  name: 'idx_reporting_years_org_year_unique'
});

db.reporting_years.createIndex({ status: 1 }, {
  name: 'idx_reporting_years_status'
});

db.reporting_years.createIndex({ year: -1 }, {
  name: 'idx_reporting_years_year_desc'
});
```

**Organization Service Summary**: 30 indexes (corrected from 18)

---

### 12.3 Reference Service Indexes (10 indexes)

**Database**: `clenergize_reference`

```javascript
// Emission Factors Collection (6 indexes)
db.emission_factors.createIndex({ parameterId: 1, year: 1, status: 1 }, {
  name: 'idx_emission_factors_param_year_status'
});

db.emission_factors.createIndex({ categoryId: 1, status: 1 }, {
  name: 'idx_emission_factors_category_status'
});

db.emission_factors.createIndex({ organizationId: 1, type: 1 }, {
  sparse: true,
  name: 'idx_emission_factors_org_type'
});

db.emission_factors.createIndex({ region: 1, year: 1 }, {
  name: 'idx_emission_factors_region_year'
});

db.emission_factors.createIndex({ status: 1, effectiveFrom: 1 }, {
  name: 'idx_emission_factors_status_effective'
});

db.emission_factors.createIndex({ source: 1, version: 1 }, {
  name: 'idx_emission_factors_source_version'
});

// Units Collection (2 indexes)
db.units.createIndex({ symbol: 1 }, {
  unique: true,
  name: 'idx_units_symbol_unique'
});

db.units.createIndex({ category: 1, isActive: 1 }, {
  name: 'idx_units_category_active'
});

// Conversion Rules Collection (2 indexes)
db.conversion_rules.createIndex({ fromUnitId: 1, toUnitId: 1 }, {
  unique: true,
  name: 'idx_conversion_rules_from_to_unique'
});

db.conversion_rules.createIndex({ toUnitId: 1, fromUnitId: 1 }, {
  name: 'idx_conversion_rules_to_from'
});

// Parameters Collection (3 indexes)
db.parameters.createIndex({ code: 1 }, {
  unique: true,
  name: 'idx_parameters_code_unique'
});

db.parameters.createIndex({ categoryId: 1, isActive: 1 }, {
  name: 'idx_parameters_category_active'
});

db.parameters.createIndex({ scope: 1 }, {
  name: 'idx_parameters_scope'
});

// Categories Collection (4 indexes)
db.categories.createIndex({ code: 1 }, {
  unique: true,
  name: 'idx_categories_code_unique'
});

db.categories.createIndex({ parentId: 1 }, {
  name: 'idx_categories_parent'
});

db.categories.createIndex({ path: 1 }, {
  name: 'idx_categories_path'
});

db.categories.createIndex({ scope: 1 }, {
  name: 'idx_categories_scope'
});
```

**Reference Service Summary**: 17 indexes (corrected from 10)

---

### 12.4 Activity Service Indexes (15 indexes)

**Database**: `clenergize_activity`

```javascript
// Carbon Scopes Collection (4 indexes)
db.carbon_scopes.createIndex({ projectId: 1, scope: 1 }, {
  name: 'idx_carbon_scopes_project_scope'
});

db.carbon_scopes.createIndex({ organizationId: 1 }, {
  name: 'idx_carbon_scopes_org'
});

db.carbon_scopes.createIndex({ hierarchyNodeId: 1 }, {
  sparse: true,
  name: 'idx_carbon_scopes_hierarchy_node'
});

db.carbon_scopes.createIndex({ status: 1, deletedAt: 1 }, {
  name: 'idx_carbon_scopes_status_deleted'
});

// Activity Data Collection (6 indexes)
db.activity_data.createIndex({ carbonScopeId: 1, year: 1, month: 1 }, {
  name: 'idx_activity_data_scope_year_month'
});

db.activity_data.createIndex({ projectId: 1, parameterId: 1, year: 1 }, {
  name: 'idx_activity_data_project_param_year'
});

db.activity_data.createIndex({ organizationId: 1, year: 1 }, {
  name: 'idx_activity_data_org_year'
});

db.activity_data.createIndex({ status: 1, deletedAt: 1 }, {
  name: 'idx_activity_data_status_deleted'
});

db.activity_data.createIndex({ bulkImportId: 1 }, {
  sparse: true,
  name: 'idx_activity_data_bulk_import'
});

db.activity_data.createIndex({ createdAt: -1 }, {
  name: 'idx_activity_data_created_desc'
});

// Bulk Imports Collection (4 indexes)
db.bulk_imports.createIndex({ projectId: 1, status: 1 }, {
  name: 'idx_bulk_imports_project_status'
});

db.bulk_imports.createIndex({ organizationId: 1, createdAt: -1 }, {
  name: 'idx_bulk_imports_org_created'
});

db.bulk_imports.createIndex({ status: 1 }, {
  name: 'idx_bulk_imports_status'
});

db.bulk_imports.createIndex({ createdAt: -1 }, {
  name: 'idx_bulk_imports_created_desc'
});

// Attachments Collection (3 indexes)
db.attachments.createIndex({ activityDataId: 1 }, {
  name: 'idx_attachments_activity_data'
});

db.attachments.createIndex({ projectId: 1, createdAt: -1 }, {
  name: 'idx_attachments_project_created'
});

db.attachments.createIndex({ s3Key: 1 }, {
  unique: true,
  name: 'idx_attachments_s3_key_unique'
});

// Comments Collection (3 indexes)
db.comments.createIndex({ activityDataId: 1, createdAt: -1 }, {
  name: 'idx_comments_activity_data_created'
});

db.comments.createIndex({ projectId: 1, isResolved: 1 }, {
  name: 'idx_comments_project_resolved'
});

db.comments.createIndex({ parentId: 1 }, {
  sparse: true,
  name: 'idx_comments_parent'
});

// Data Quality Flags Collection (3 indexes)
db.data_quality_flags.createIndex({ activityDataId: 1, status: 1 }, {
  name: 'idx_quality_flags_activity_status'
});

db.data_quality_flags.createIndex({ projectId: 1, severity: 1, status: 1 }, {
  name: 'idx_quality_flags_project_severity_status'
});

db.data_quality_flags.createIndex({ status: 1, createdAt: -1 }, {
  name: 'idx_quality_flags_status_created'
});
```

**Activity Service Summary**: 23 indexes (corrected from 15)

---

### 12.5 Calculation Service Indexes (12 indexes)

**Database**: `clenergize_calculation`

```javascript
// Calculations Collection (6 indexes)
db.calculations.createIndex({ activityDataId: 1 }, {
  name: 'idx_calculations_activity_data'
});

db.calculations.createIndex({ projectId: 1, scope: 1, calculatedAt: -1 }, {
  name: 'idx_calculations_project_scope_calc'
});

db.calculations.createIndex({ organizationId: 1, calculatedAt: -1 }, {
  name: 'idx_calculations_org_calc'
});

db.calculations.createIndex({ emissionFactorId: 1 }, {
  name: 'idx_calculations_emission_factor'
});

db.calculations.createIndex({ recalculationJobId: 1 }, {
  sparse: true,
  name: 'idx_calculations_recalc_job'
});

db.calculations.createIndex({ calculatedAt: -1 }, {
  name: 'idx_calculations_calc_desc'
});

// Rollups Collection (4 indexes)
db.rollups.createIndex({ projectId: 1, year: 1, month: 1, aggregationType: 1 }, {
  name: 'idx_rollups_project_year_month_agg'
});

db.rollups.createIndex({ organizationId: 1, year: 1 }, {
  name: 'idx_rollups_org_year'
});

db.rollups.createIndex({ hierarchyNodeId: 1, year: 1 }, {
  sparse: true,
  name: 'idx_rollups_hierarchy_year'
});

db.rollups.createIndex({ calculatedAt: -1 }, {
  name: 'idx_rollups_calc_desc'
});

// Allocations Collection (3 indexes)
db.allocations.createIndex({ calculationId: 1 }, {
  name: 'idx_allocations_calculation'
});

db.allocations.createIndex({ projectId: 1, fromHierarchyNodeId: 1 }, {
  name: 'idx_allocations_project_from_node'
});

db.allocations.createIndex({ toHierarchyNodeId: 1 }, {
  name: 'idx_allocations_to_node'
});

// Recalculation Jobs Collection (3 indexes)
db.recalculation_jobs.createIndex({ projectId: 1, status: 1 }, {
  name: 'idx_recalc_jobs_project_status'
});

db.recalculation_jobs.createIndex({ organizationId: 1, createdAt: -1 }, {
  name: 'idx_recalc_jobs_org_created'
});

db.recalculation_jobs.createIndex({ status: 1, createdAt: -1 }, {
  name: 'idx_recalc_jobs_status_created'
});
```

**Calculation Service Summary**: 16 indexes (corrected from 12)

---

### 12.6 Reporting Service Indexes (10 indexes)

**Database**: `clenergize_reporting`

```javascript
// Reports Collection (4 indexes)
db.reports.createIndex({ projectId: 1, reportType: 1, createdAt: -1 }, {
  name: 'idx_reports_project_type_created'
});

db.reports.createIndex({ organizationId: 1, status: 1 }, {
  name: 'idx_reports_org_status'
});

db.reports.createIndex({ status: 1, expiresAt: 1 }, {
  name: 'idx_reports_status_expires'
});

db.reports.createIndex({ expiresAt: 1 }, {
  expireAfterSeconds: 0,
  name: 'idx_reports_ttl'
});

// Report Schedules Collection (3 indexes)
db.report_schedules.createIndex({ projectId: 1, isActive: 1 }, {
  name: 'idx_report_schedules_project_active'
});

db.report_schedules.createIndex({ organizationId: 1, isActive: 1 }, {
  name: 'idx_report_schedules_org_active'
});

db.report_schedules.createIndex({ nextRunAt: 1, isActive: 1 }, {
  name: 'idx_report_schedules_next_run'
});

// Exports Collection (4 indexes)
db.exports.createIndex({ projectId: 1, status: 1 }, {
  name: 'idx_exports_project_status'
});

db.exports.createIndex({ organizationId: 1, createdAt: -1 }, {
  name: 'idx_exports_org_created'
});

db.exports.createIndex({ status: 1, expiresAt: 1 }, {
  name: 'idx_exports_status_expires'
});

db.exports.createIndex({ expiresAt: 1 }, {
  expireAfterSeconds: 0,
  name: 'idx_exports_ttl'
});

// Report Templates Collection (2 indexes)
db.report_templates.createIndex({ organizationId: 1, isActive: 1 }, {
  sparse: true,
  name: 'idx_report_templates_org_active'
});

db.report_templates.createIndex({ isGlobal: 1, reportType: 1 }, {
  name: 'idx_report_templates_global_type'
});

// Dashboards Collection (2 indexes)
db.dashboards.createIndex({ userId: 1, organizationId: 1 }, {
  name: 'idx_dashboards_user_org'
});

db.dashboards.createIndex({ userId: 1, isDefault: 1 }, {
  name: 'idx_dashboards_user_default'
});
```

**Reporting Service Summary**: 15 indexes (corrected from 10)

---

### 12.7 Audit Service Indexes (15 indexes)

**Database**: `clenergize_audit`

```javascript
// Audit Logs Collection (6 indexes)
db.audit_logs.createIndex({ organizationId: 1, createdAt: -1 }, {
  name: 'idx_audit_logs_org_created'
});

db.audit_logs.createIndex({ userId: 1, action: 1, createdAt: -1 }, {
  name: 'idx_audit_logs_user_action_created'
});

db.audit_logs.createIndex({ resourceType: 1, resourceId: 1, createdAt: -1 }, {
  name: 'idx_audit_logs_resource_created'
});

db.audit_logs.createIndex({ action: 1, result: 1, createdAt: -1 }, {
  name: 'idx_audit_logs_action_result_created'
});

db.audit_logs.createIndex({ sequenceNumber: 1 }, {
  unique: true,
  name: 'idx_audit_logs_sequence_unique'
});

db.audit_logs.createIndex({ hash: 1 }, {
  unique: true,
  name: 'idx_audit_logs_hash_unique'
});

// Compliance Checks Collection (3 indexes)
db.compliance_checks.createIndex({ organizationId: 1, complianceType: 1, checkedAt: -1 }, {
  name: 'idx_compliance_checks_org_type_checked'
});

db.compliance_checks.createIndex({ projectId: 1, status: 1 }, {
  sparse: true,
  name: 'idx_compliance_checks_project_status'
});

db.compliance_checks.createIndex({ nextCheckDue: 1 }, {
  name: 'idx_compliance_checks_next_due'
});

// Security Events Collection (3 indexes)
db.security_events.createIndex({ organizationId: 1, severity: 1, detectedAt: -1 }, {
  name: 'idx_security_events_org_severity_detected'
});

db.security_events.createIndex({ userId: 1, eventType: 1 }, {
  sparse: true,
  name: 'idx_security_events_user_type'
});

db.security_events.createIndex({ eventType: 1, isResolved: 1, detectedAt: -1 }, {
  name: 'idx_security_events_type_resolved_detected'
});

// Data Access Logs Collection (4 indexes)
db.data_access_logs.createIndex({ organizationId: 1, createdAt: -1 }, {
  name: 'idx_data_access_logs_org_created'
});

db.data_access_logs.createIndex({ userId: 1, action: 1, createdAt: -1 }, {
  name: 'idx_data_access_logs_user_action_created'
});

db.data_access_logs.createIndex({ resourceType: 1, resourceId: 1, createdAt: -1 }, {
  name: 'idx_data_access_logs_resource_created'
});

db.data_access_logs.createIndex({ createdAt: -1 }, {
  name: 'idx_data_access_logs_created_desc'
});

// GDPR Requests Collection (4 indexes)
db.gdpr_requests.createIndex({ organizationId: 1, status: 1 }, {
  name: 'idx_gdpr_requests_org_status'
});

db.gdpr_requests.createIndex({ subjectUserId: 1, requestType: 1 }, {
  name: 'idx_gdpr_requests_user_type'
});

db.gdpr_requests.createIndex({ status: 1, dueDate: 1 }, {
  name: 'idx_gdpr_requests_status_due'
});

db.gdpr_requests.createIndex({ createdAt: -1 }, {
  name: 'idx_gdpr_requests_created_desc'
});
```

**Audit Service Summary**: 20 indexes (corrected from 15)

---

## 13. Index Summary & Statistics

### 13.1 Total Index Count by Service

| Service | Collections | Total Indexes | TTL Indexes | Unique Indexes | Compound Indexes |
|---------|-------------|---------------|-------------|----------------|------------------|
| Identity | 5 | 18 | 3 | 5 | 6 |
| Organization | 7 | 30 | 0 | 2 | 18 |
| Reference | 5 | 17 | 0 | 5 | 7 |
| Activity | 6 | 23 | 0 | 1 | 14 |
| Calculation | 4 | 16 | 0 | 0 | 11 |
| Reporting | 5 | 15 | 2 | 0 | 8 |
| Audit | 5 | 20 | 0 | 3 | 12 |
| **TOTAL** | **37** | **139** | **5** | **16** | **76** |

### 13.2 Special Index Types

#### TTL Indexes (5 total)
Auto-expire temporary data after specified duration:

1. **sessions.expiresAt** - Auto-delete expired sessions immediately
2. **refresh_tokens.expiresAt** - Auto-delete expired tokens immediately
3. **password_reset_tokens.expiresAt** - Auto-delete after 1 hour
4. **reports.expiresAt** - Auto-delete after 90 days
5. **exports.expiresAt** - Auto-delete after 7 days

#### Unique Indexes (16 total)
Enforce data uniqueness constraints:

1. **users.email** - Unique user email addresses
2. **sessions.sessionToken** - Unique session identifiers
3. **refresh_tokens.tokenHash** - Unique refresh token hashes
4. **mfa_secrets.userId** - One MFA secret per user
5. **password_reset_tokens.tokenHash** - Unique reset token hashes
6. **reporting_years.organizationId+year** - One reporting year per org
7. **units.symbol** - Unique unit symbols (kWh, kg, etc.)
8. **conversion_rules.fromUnitId+toUnitId** - Unique conversion pairs
9. **parameters.code** - Unique parameter codes
10. **categories.code** - Unique category codes
11. **attachments.s3Key** - Unique S3 storage keys
12. **audit_logs.sequenceNumber** - Ordered audit trail
13. **audit_logs.hash** - Tamper detection via hash chain

#### Text Indexes (0 total)
None currently defined. Consider adding for:
- **users.firstName, lastName** - Name search
- **projects.name, description** - Project search
- **activity_data.notes** - Full-text search on notes

#### Geospatial Indexes (0 total)
None required for current functionality.

### 13.3 Index Performance Targets

| Metric | Target | Monitoring |
|--------|--------|------------|
| Query response time | <50ms | CloudWatch, slow query log |
| Index hit ratio | >95% | `db.collection.aggregate([{$indexStats:{}}])` |
| Index size vs data | <20% | Monitor index sizes |
| Unused indexes | 0 | Review `accesses.ops` in indexStats |

### 13.4 Index Maintenance Commands

```javascript
// Check index usage statistics
db.collection_name.aggregate([{ $indexStats: {} }]);

// Find slow queries missing indexes
db.setProfilingLevel(1, { slowms: 100 });
db.system.profile.find().sort({ millis: -1 }).limit(10);

// Rebuild indexes (use during maintenance window)
db.collection_name.reIndex();

// Drop unused index
db.collection_name.dropIndex('idx_name');

// Check index sizes
db.collection_name.stats().indexSizes;
```

### 13.5 Index Creation Script

Complete initialization script for all databases:

```bash
#!/bin/bash
# create_all_indexes.sh

mongosh "mongodb://admin:localdev123@localhost:27017/?authSource=admin" << 'EOF'

// Identity Service
use clenergize_identity;
load('identity_indexes.js');

// Organization Service
use clenergize_organization;
load('organization_indexes.js');

// Reference Service
use clenergize_reference;
load('reference_indexes.js');

// Activity Service
use clenergize_activity;
load('activity_indexes.js');

// Calculation Service
use clenergize_calculation;
load('calculation_indexes.js');

// Reporting Service
use clenergize_reporting;
load('reporting_indexes.js');

// Audit Service
use clenergize_audit;
load('audit_indexes.js');

print('All indexes created successfully!');
EOF
```

---

**Next Steps**:
1. Week 2-3: Security Architecture (STRIDE threat modeling, JWT/JWKS)
2. Week 3-4: Performance Architecture (Redis caching, query optimization)
3. Week 4-5: Service Templates (NestJS boilerplate with these schemas)

**Last Updated**: November 18, 2025
**Version**: 1.1.0
**Maintained By**: Architecture Agent
