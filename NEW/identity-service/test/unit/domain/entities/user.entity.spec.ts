import { User } from '../../../../src/domain/entities/user.entity';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = Object.create(User.prototype);
    user.email = 'test@example.com';
    user.firstName = 'John';
    user.lastName = 'Doe';
    user.passwordHash = 'hashed_password';
    user.roles = ['USER'];
    user.status = 'PENDING';
    user.emailVerified = false;
    user.failedLoginAttempts = 0;
    user.metadata = {};
  });

  describe('Virtual Getters', () => {
    describe('fullName', () => {
      it('should return concatenated first and last name', () => {
        expect(user.fullName).toBe('John Doe');
      });

      it('should handle special characters in names', () => {
        user.firstName = 'Jean-Paul';
        user.lastName = "O'Connor";
        expect(user.fullName).toBe("Jean-Paul O'Connor");
      });
    });

    describe('isLocked', () => {
      it('should return false when lockedUntil is undefined', () => {
        user.lockedUntil = undefined;
        expect(user.isLocked).toBe(false);
      });

      it('should return true when lockedUntil is in the future', () => {
        user.lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        expect(user.isLocked).toBe(true);
      });

      it('should return false when lockedUntil is in the past', () => {
        user.lockedUntil = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
        expect(user.isLocked).toBe(false);
      });
    });

    describe('isActive', () => {
      it('should return true when status is ACTIVE and not locked', () => {
        user.status = 'ACTIVE';
        user.lockedUntil = undefined;
        expect(user.isActive).toBe(true);
      });

      it('should return false when status is not ACTIVE', () => {
        user.status = 'SUSPENDED';
        user.lockedUntil = undefined;
        expect(user.isActive).toBe(false);
      });

      it('should return false when locked even if status is ACTIVE', () => {
        user.status = 'ACTIVE';
        user.lockedUntil = new Date(Date.now() + 10 * 60 * 1000);
        expect(user.isActive).toBe(false);
      });
    });
  });

  describe('Business Logic Methods', () => {
    describe('activate', () => {
      it('should set status to ACTIVE', () => {
        user.activate();
        expect(user.status).toBe('ACTIVE');
      });

      it('should set emailVerified to true', () => {
        user.activate();
        expect(user.emailVerified).toBe(true);
      });

      it('should set emailVerifiedAt to current date', () => {
        const beforeActivation = new Date();
        user.activate();
        const afterActivation = new Date();

        expect(user.emailVerifiedAt).toBeDefined();
        expect(user.emailVerifiedAt!.getTime()).toBeGreaterThanOrEqual(beforeActivation.getTime());
        expect(user.emailVerifiedAt!.getTime()).toBeLessThanOrEqual(afterActivation.getTime());
      });
    });

    describe('suspend', () => {
      it('should set status to SUSPENDED', () => {
        user.suspend();
        expect(user.status).toBe('SUSPENDED');
      });

      it('should store suspension reason in metadata if provided', () => {
        const reason = 'Suspicious activity detected';
        user.suspend(reason);
        expect(user.metadata?.suspensionReason).toBe(reason);
      });

      it('should work without a reason', () => {
        user.suspend();
        expect(user.status).toBe('SUSPENDED');
        expect(user.metadata?.suspensionReason).toBeUndefined();
      });
    });

    describe('incrementFailedLoginAttempts', () => {
      it('should increment failedLoginAttempts by 1', () => {
        const initialAttempts = user.failedLoginAttempts;
        user.incrementFailedLoginAttempts();
        expect(user.failedLoginAttempts).toBe(initialAttempts + 1);
      });

      it('should not lock account when attempts < 5', () => {
        user.failedLoginAttempts = 3;
        user.incrementFailedLoginAttempts();
        expect(user.lockedUntil).toBeUndefined();
      });

      it('should lock account for 30 minutes after 5th failed attempt', () => {
        user.failedLoginAttempts = 4;
        const beforeLock = Date.now();
        user.incrementFailedLoginAttempts();
        const afterLock = Date.now();

        expect(user.lockedUntil).toBeDefined();
        expect(user.failedLoginAttempts).toBe(5);

        // Should be locked for approximately 30 minutes
        const expectedLockTime = beforeLock + 30 * 60 * 1000;
        const lockTime = user.lockedUntil!.getTime();
        expect(lockTime).toBeGreaterThanOrEqual(expectedLockTime);
        expect(lockTime).toBeLessThanOrEqual(afterLock + 30 * 60 * 1000);
      });

      it('should update lock time on additional failed attempts after reaching threshold', () => {
        user.failedLoginAttempts = 5;
        user.lockedUntil = new Date(Date.now() + 10 * 60 * 1000);

        const oldLockTime = user.lockedUntil.getTime();
        user.incrementFailedLoginAttempts();

        expect(user.failedLoginAttempts).toBe(6);
        expect(user.lockedUntil!.getTime()).toBeGreaterThan(oldLockTime);
      });
    });

    describe('resetFailedLoginAttempts', () => {
      it('should reset failedLoginAttempts to 0', () => {
        user.failedLoginAttempts = 5;
        user.resetFailedLoginAttempts();
        expect(user.failedLoginAttempts).toBe(0);
      });

      it('should clear lockedUntil', () => {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        user.resetFailedLoginAttempts();
        expect(user.lockedUntil).toBeUndefined();
      });
    });

    describe('recordSuccessfulLogin', () => {
      it('should update lastLoginAt to current time', () => {
        const beforeLogin = new Date();
        user.recordSuccessfulLogin('192.168.1.1');
        const afterLogin = new Date();

        expect(user.lastLoginAt).toBeDefined();
        expect(user.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
        expect(user.lastLoginAt!.getTime()).toBeLessThanOrEqual(afterLogin.getTime());
      });

      it('should store IP address', () => {
        const ipAddress = '192.168.1.100';
        user.recordSuccessfulLogin(ipAddress);
        expect(user.lastLoginIp).toBe(ipAddress);
      });

      it('should reset failed login attempts', () => {
        user.failedLoginAttempts = 3;
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);

        user.recordSuccessfulLogin('192.168.1.1');

        expect(user.failedLoginAttempts).toBe(0);
        expect(user.lockedUntil).toBeUndefined();
      });
    });

    describe('assignRole', () => {
      it('should add a new role to roles array', () => {
        user.assignRole('ADMIN');
        expect(user.roles).toContain('ADMIN');
        expect(user.roles).toContain('USER');
      });

      it('should not add duplicate role', () => {
        user.assignRole('USER');
        expect(user.roles).toEqual(['USER']);
      });

      it('should allow assigning multiple different roles', () => {
        user.assignRole('ADMIN');
        user.assignRole('VIEWER');
        expect(user.roles).toEqual(['USER', 'ADMIN', 'VIEWER']);
      });
    });

    describe('revokeRole', () => {
      beforeEach(() => {
        user.roles = ['USER', 'ADMIN', 'VIEWER'];
      });

      it('should remove specified role', () => {
        user.revokeRole('ADMIN');
        expect(user.roles).toEqual(['USER', 'VIEWER']);
        expect(user.roles).not.toContain('ADMIN');
      });

      it('should do nothing if role does not exist', () => {
        user.revokeRole('SUPER_ADMIN');
        expect(user.roles).toEqual(['USER', 'ADMIN', 'VIEWER']);
      });

      it('should ensure at least USER role remains when revoking all roles', () => {
        user.roles = ['ADMIN'];
        user.revokeRole('ADMIN');
        expect(user.roles).toEqual(['USER']);
      });

      it('should handle revoking multiple roles down to USER', () => {
        user.revokeRole('ADMIN');
        user.revokeRole('VIEWER');
        expect(user.roles).toEqual(['USER']);
      });
    });

    describe('hasRole', () => {
      beforeEach(() => {
        user.roles = ['USER', 'ADMIN'];
      });

      it('should return true when user has the role', () => {
        expect(user.hasRole('ADMIN')).toBe(true);
        expect(user.hasRole('USER')).toBe(true);
      });

      it('should return false when user does not have the role', () => {
        expect(user.hasRole('SUPER_ADMIN')).toBe(false);
        expect(user.hasRole('VIEWER')).toBe(false);
      });
    });

    describe('hasAnyRole', () => {
      beforeEach(() => {
        user.roles = ['USER', 'ADMIN'];
      });

      it('should return true if user has any of the specified roles', () => {
        expect(user.hasAnyRole(['ADMIN', 'VIEWER'])).toBe(true);
        expect(user.hasAnyRole(['USER', 'SUPER_ADMIN'])).toBe(true);
      });

      it('should return false if user has none of the specified roles', () => {
        expect(user.hasAnyRole(['SUPER_ADMIN', 'VIEWER'])).toBe(false);
      });

      it('should return true if user has all of the specified roles', () => {
        expect(user.hasAnyRole(['USER', 'ADMIN'])).toBe(true);
      });

      it('should handle empty array', () => {
        expect(user.hasAnyRole([])).toBe(false);
      });
    });
  });

  describe('Security Features', () => {
    describe('Account Locking Mechanism', () => {
      it('should lock account after exactly 5 failed attempts', () => {
        for (let i = 0; i < 4; i++) {
          user.incrementFailedLoginAttempts();
        }
        expect(user.isLocked).toBe(false);

        user.incrementFailedLoginAttempts();
        expect(user.isLocked).toBe(true);
        expect(user.failedLoginAttempts).toBe(5);
      });

      it('should unlock account after successful login', () => {
        user.failedLoginAttempts = 5;
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);

        user.recordSuccessfulLogin('192.168.1.1');

        expect(user.isLocked).toBe(false);
        expect(user.failedLoginAttempts).toBe(0);
      });
    });

    describe('Role Management', () => {
      it('should prevent user from having no roles', () => {
        user.roles = ['USER'];
        user.revokeRole('USER');
        expect(user.roles).toContain('USER');
        expect(user.roles.length).toBeGreaterThan(0);
      });
    });
  });
});
