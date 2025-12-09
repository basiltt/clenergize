/**
 * K6 Performance Test - Identity Service
 *
 * Tests authentication, user management, and role-based access control
 */

import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { config, getServiceUrl, getGatewayUrl } from '../config.js';
import {
  login,
  authenticatedRequest,
  checkResponse,
  randomEmail,
  randomString,
  thinkTime,
  validateUUID
} from '../utils/helpers.js';

// Test configuration
export const options = {
  vus: 10,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
    'group_duration{group:::Authentication}': ['p(95)<300'],
    'group_duration{group:::User Management}': ['p(95)<400']
  }
};

// Setup function (runs once per VU)
export function setup() {
  // Create test admin user for test setup
  const adminToken = login(
    config.services.gateway,
    config.auth.adminUsername,
    config.auth.adminPassword
  );

  return { adminToken };
}

// Main test scenario
export default function (data) {
  const baseUrl = config.services.gateway;

  // Scenario 1: User Authentication (70% of traffic)
  if (Math.random() < 0.7) {
    group('Authentication', () => {
      // Login
      const token = login(
        baseUrl,
        config.auth.username,
        config.auth.password
      );

      check(token, {
        'login successful': (t) => t !== null,
        'token is valid JWT': (t) => t && t.split('.').length === 3
      });

      if (!token) return;

      thinkTime(1, 3);

      // Verify token (GET /api/v1/auth/verify)
      const verifyResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/auth/verify`,
        null,
        token
      );

      checkResponse(verifyResponse, 200, {
        'user data returned': (r) => r.json('data.user') !== undefined,
        'userId is UUID': (r) => validateUUID(r.json('data.user.id'))
      });

      thinkTime(2, 5);

      // Refresh token (POST /api/v1/auth/refresh)
      const refreshResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/auth/refresh`,
        { refreshToken: token }, // Simplified for test
        token
      );

      checkResponse(refreshResponse, 200, {
        'new token received': (r) => r.json('data.accessToken') !== undefined
      });
    });
  }

  // Scenario 2: User Profile Management (20% of traffic)
  else if (Math.random() < 0.9) {
    group('User Management', () => {
      const token = login(baseUrl, config.auth.username, config.auth.password);
      if (!token) return;

      // Get user profile (GET /api/v1/users/me)
      const profileResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/users/me`,
        null,
        token
      );

      checkResponse(profileResponse, 200, {
        'profile data returned': (r) => r.json('data') !== undefined,
        'email is valid': (r) => r.json('data.email') !== undefined
      });

      thinkTime(2, 4);

      // Update user profile (PATCH /api/v1/users/me)
      const updateData = {
        firstName: `Test${randomString(4)}`,
        lastName: `User${randomString(4)}`,
        preferences: {
          language: 'en',
          timezone: 'UTC',
          notifications: true
        }
      };

      const updateResponse = authenticatedRequest(
        'PATCH',
        `${baseUrl}/api/v1/users/me`,
        updateData,
        token
      );

      checkResponse(updateResponse, 200, {
        'profile updated': (r) => r.json('data.firstName') === updateData.firstName
      });

      thinkTime(1, 2);

      // Get user permissions (GET /api/v1/users/me/permissions)
      const permissionsResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/users/me/permissions`,
        null,
        token
      );

      checkResponse(permissionsResponse, 200, {
        'permissions returned': (r) => Array.isArray(r.json('data.permissions'))
      });
    });
  }

  // Scenario 3: Admin Operations (10% of traffic)
  else {
    group('Admin Operations', () => {
      const adminToken = data.adminToken;
      if (!adminToken) return;

      // List users (GET /api/v1/users?page=1&limit=20)
      const listResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/users?page=1&limit=20`,
        null,
        adminToken
      );

      checkResponse(listResponse, 200, {
        'users list returned': (r) => Array.isArray(r.json('data.items')),
        'pagination metadata exists': (r) => r.json('data.pagination') !== undefined
      });

      thinkTime(2, 4);

      // Create new user (POST /api/v1/users)
      const newUser = {
        email: randomEmail(),
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER'
      };

      const createResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/users`,
        newUser,
        adminToken
      );

      checkResponse(createResponse, 201, {
        'user created': (r) => r.json('data.id') !== undefined,
        'email matches': (r) => r.json('data.email') === newUser.email
      });

      if (createResponse.status === 201) {
        const userId = createResponse.json('data.id');

        thinkTime(1, 2);

        // Assign role (PATCH /api/v1/users/:id/role)
        const roleResponse = authenticatedRequest(
          'PATCH',
          `${baseUrl}/api/v1/users/${userId}/role`,
          { role: 'ADMIN' },
          adminToken
        );

        checkResponse(roleResponse, 200, {
          'role updated': (r) => r.json('data.role') === 'ADMIN'
        });

        thinkTime(1, 2);

        // Deactivate user (PATCH /api/v1/users/:id/status)
        const deactivateResponse = authenticatedRequest(
          'PATCH',
          `${baseUrl}/api/v1/users/${userId}/status`,
          { status: 'INACTIVE' },
          adminToken
        );

        checkResponse(deactivateResponse, 200, {
          'user deactivated': (r) => r.json('data.status') === 'INACTIVE'
        });
      }
    });
  }

  sleep(1);
}

// Teardown function (runs once at end)
export function teardown(data) {
  // Cleanup test data if needed
  console.log('Identity Service test completed');
}
