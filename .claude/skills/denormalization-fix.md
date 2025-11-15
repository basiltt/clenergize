# Denormalization Fix Skill

## Purpose
Convert denormalized fields to references, fixing data update anomalies and storage bloat.

## Problem in OLD Code

```typescript
// OLD: User data copied everywhere!
const activity = {
  id: 'activity-123',
  userData: {
    id: 'user-456',
    name: 'John Doe',
    email: 'john@example.com',
    department: 'Engineering'
  },
  // If user updates email, this becomes stale!
};

// OLD: Organization data duplicated
const project = {
  id: 'project-789',
  organizationData: {
    id: 'org-123',
    name: 'Acme Corp',
    address: '123 Main St',
    // Full copy of org data!
  }
};
```

## Solution: Reference-Based Architecture

### 1. Reference Pattern Implementation
```typescript
// NEW: Store only references
interface Activity {
  id: string;
  createdBy: string; // User ID reference only
  projectId: string; // Reference
  // No duplicated user data!
}

interface Project {
  id: string;
  organizationId: string; // Reference only
  // No duplicated org data!
}

// Populate when needed
class ActivityService {
  async getActivityWithUser(activityId: string): Promise<ActivityWithUser> {
    const activity = await this.activityRepo.findById(activityId);
    const user = await this.userService.getUser(activity.createdBy);

    return {
      ...activity,
      user // Join at query time, not storage time
    };
  }
}
```

### 2. Migration Script
```typescript
export class DenormalizationMigration {
  async migrate() {
    await this.fixUserDenormalization();
    await this.fixOrganizationDenormalization();
    await this.fixEmissionFactorDenormalization();
  }

  async fixUserDenormalization() {
    const activities = await this.db.collection('activities').find({
      userData: { $exists: true }
    }).toArray();

    for (const activity of activities) {
      const userId = activity.userData.id ||
                     await this.findOrCreateUser(activity.userData);

      await this.db.collection('activities').updateOne(
        { _id: activity._id },
        {
          $set: { createdBy: userId },
          $unset: { userData: '' }
        }
      );
    }
  }
}
```

### 3. Query Optimization with Lookups
```typescript
// MongoDB aggregation for joins
async getProjectsWithOrganizations() {
  return this.projectModel.aggregate([
    {
      $lookup: {
        from: 'organizations',
        localField: 'organizationId',
        foreignField: '_id',
        as: 'organization'
      }
    },
    { $unwind: '$organization' }
  ]);
}
```

## Benefits
- No stale data
- 50% storage reduction
- Single source of truth
- Easier updates
- Better cache utilization