import { ObjectId } from 'mongodb';
import crypto from 'crypto';

/**
 * Transform OLD _id to NEW UUID string
 */
export function transformIdToUUID(oldId: any): string {
  if (!oldId) {
    return generateUUID();
  }

  // If already a string UUID, return as-is
  if (typeof oldId === 'string' && oldId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return oldId;
  }

  // If ObjectId, convert to deterministic UUID (for idempotency)
  if (oldId instanceof ObjectId || (oldId._bsontype && oldId._bsontype === 'ObjectID')) {
    return objectIdToUUID(oldId.toString());
  }

  // If string ObjectId
  if (typeof oldId === 'string' && oldId.match(/^[0-9a-f]{24}$/i)) {
    return objectIdToUUID(oldId);
  }

  // Fallback: generate new UUID
  return generateUUID();
}

/**
 * Convert ObjectId to deterministic UUID (using hash)
 */
export function objectIdToUUID(objectIdString: string): string {
  const hash = crypto.createHash('sha256').update(objectIdString).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-');
}

/**
 * Generate a new UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Transform dates to ISO 8601 strings
 */
export function transformDate(date: any): string {
  if (!date) {
    return new Date().toISOString();
  }

  if (date instanceof Date) {
    return date.toISOString();
  }

  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }

  if (typeof date === 'number') {
    return new Date(date).toISOString();
  }

  return new Date().toISOString();
}

/**
 * Transform OLD status values to NEW status enums
 */
export function transformStatus(oldStatus: string): 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' {
  const normalized = (oldStatus || '').toLowerCase().trim();

  switch (normalized) {
    case 'active':
    case '1':
    case 'true':
    case 'enabled':
      return 'ACTIVE';

    case 'inactive':
    case 'disabled':
    case '0':
    case 'false':
      return 'INACTIVE';

    case 'archived':
    case 'deleted':
      return 'ARCHIVED';

    default:
      return 'ACTIVE';  // Default to ACTIVE
  }
}

/**
 * Transform email to lowercase
 */
export function transformEmail(email: string): string {
  return (email || '').toLowerCase().trim();
}

/**
 * Transform phone number to E.164 format (if possible)
 */
export function transformPhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 0) return null;

  // If starts with country code, add +
  if (digits.length >= 10) {
    return `+${digits}`;
  }

  return digits;
}

/**
 * Transform OLD permissions array to NEW permission enum
 */
export function transformPermissions(oldPermissions: string[]): string[] {
  if (!Array.isArray(oldPermissions)) {
    return ['READ'];
  }

  const permissionMap: Record<string, string> = {
    'view': 'READ',
    'read': 'READ',
    'create': 'CREATE',
    'add': 'CREATE',
    'edit': 'UPDATE',
    'update': 'UPDATE',
    'modify': 'UPDATE',
    'delete': 'DELETE',
    'remove': 'DELETE',
    'admin': 'ADMIN',
    'manage': 'ADMIN'
  };

  const transformed = oldPermissions
    .map(perm => {
      const normalized = perm.toLowerCase().trim();
      return permissionMap[normalized] || 'READ';
    })
    .filter((value, index, self) => self.indexOf(value) === index);  // Remove duplicates

  return transformed.length > 0 ? transformed : ['READ'];
}

/**
 * Transform OLD role to NEW role enum
 */
export function transformRole(oldRole: string): 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER' {
  const normalized = (oldRole || '').toLowerCase().trim();

  const roleMap: Record<string, 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER'> = {
    'superadmin': 'SUPER_ADMIN',
    'super_admin': 'SUPER_ADMIN',
    'super-admin': 'SUPER_ADMIN',
    'admin': 'ADMIN',
    'administrator': 'ADMIN',
    'manager': 'MANAGER',
    'project_manager': 'MANAGER',
    'project-manager': 'MANAGER',
    'user': 'USER',
    'member': 'USER',
    'viewer': 'VIEWER',
    'read_only': 'VIEWER',
    'read-only': 'VIEWER',
    'guest': 'VIEWER'
  };

  return roleMap[normalized] || 'USER';
}

/**
 * Sanitize string (remove HTML, special chars)
 */
export function sanitizeString(str: string): string {
  if (!str) return '';

  return str
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/[^\w\s\-.,@]/g, '')  // Remove special chars except basic punctuation
    .trim();
}

/**
 * Transform cloned hierarchy to hierarchy reference
 * This is the CRITICAL transformation for the OLD→NEW migration
 */
export interface HierarchyReference {
  hierarchyId: string;
  version: number;
  snapshotDate: string;
}

export function transformClonedHierarchyToReference(
  clonedHierarchy: any,
  projectId: string
): HierarchyReference {
  // Generate deterministic hierarchy ID based on structure
  const hierarchyHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(clonedHierarchy))
    .digest('hex');

  const hierarchyId = [
    hierarchyHash.substring(0, 8),
    hierarchyHash.substring(8, 12),
    hierarchyHash.substring(12, 16),
    hierarchyHash.substring(16, 20),
    hierarchyHash.substring(20, 32)
  ].join('-');

  return {
    hierarchyId,
    version: clonedHierarchy?.version || 1,
    snapshotDate: clonedHierarchy?.createdAt || new Date().toISOString()
  };
}

/**
 * Deduplicate array of objects by key
 */
export function deduplicateByKey<T>(array: T[], keyExtractor: (item: T) => string): T[] {
  const seen = new Set<string>();
  return array.filter(item => {
    const key = keyExtractor(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Chunk array into smaller batches
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Sleep utility for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}
