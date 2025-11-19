import bcrypt from 'bcrypt';

/**
 * Password Service
 *
 * Secure password hashing and verification using bcrypt.
 * Follows OWASP password storage recommendations.
 */

export interface PasswordConfig {
  saltRounds?: number; // Default: 12 (recommended by OWASP for 2024)
}

export class PasswordService {
  private readonly saltRounds: number;

  constructor(config: PasswordConfig = {}) {
    this.saltRounds = config.saltRounds || 12;
  }

  /**
   * Hash password with bcrypt
   * Time complexity: ~300ms per hash (intentionally slow to prevent brute force)
   */
  async hashPassword(plainTextPassword: string): Promise<string> {
    if (!plainTextPassword || plainTextPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    return bcrypt.hash(plainTextPassword, this.saltRounds);
  }

  /**
   * Verify password against hash
   * Returns true if password matches, false otherwise
   */
  async verifyPassword(plainTextPassword: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainTextPassword, hash);
    } catch {
      // If hash is invalid format, return false instead of throwing
      return false;
    }
  }

  /**
   * Check if password meets complexity requirements
   * - Minimum 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character
   */
  validatePasswordComplexity(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common patterns
    if (/^[0-9]+$/.test(password)) {
      errors.push('Password cannot be only numbers');
    }

    if (/^[a-zA-Z]+$/.test(password)) {
      errors.push('Password cannot be only letters');
    }

    // Check for sequential characters (e.g., "123456", "abcdef")
    if (this.hasSequentialCharacters(password)) {
      errors.push('Password contains sequential characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if password contains sequential characters
   */
  private hasSequentialCharacters(password: string): boolean {
    const sequences = [
      '0123456789',
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'qwertyuiop',
      'asdfghjkl',
      'zxcvbnm'
    ];

    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 4; i++) {
        const substring = sequence.substring(i, i + 4);
        if (password.includes(substring)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Generate random password
   * Useful for temporary passwords, reset tokens, etc.
   */
  generateRandomPassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = uppercase + lowercase + numbers + special;

    let password = '';

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill remaining length
    for (let i = 4; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}

/**
 * Factory function to create password service
 */
export function createPasswordService(config?: PasswordConfig): PasswordService {
  return new PasswordService(config);
}
