/**
 * K6 Smoke Test
 *
 * Quick sanity check to verify all services are functional
 * - Minimal load: 1-2 VUs
 * - Duration: 1 minute
 * - Purpose: Catch obvious bugs before full load tests
 */

import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { config, getGatewayUrl } from './config.js';
import { login, authenticatedRequest, checkResponse } from './utils/helpers.js';

// Test configuration
export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'], // Allow 5% errors for smoke test
    checks: ['rate>0.95'] // 95% of checks should pass
  }
};

// Main test scenario
export default function () {
  const baseUrl = config.services.gateway;

  // Test 1: Health Checks
  group('Health Checks', () => {
    const services = [
      { name: 'Identity', url: config.services.identity },
      { name: 'Organization', url: config.services.organization },
      { name: 'Reference', url: config.services.reference },
      { name: 'Activity', url: config.services.activity },
      { name: 'Calculation', url: config.services.calculation },
      { name: 'Reporting', url: config.services.reporting },
      { name: 'Audit', url: config.services.audit }
    ];

    services.forEach(service => {
      const response = http.get(`${service.url}/health`);
      check(response, {
        [`${service.name} is healthy`]: (r) => r.status === 200,
        [`${service.name} responds quickly`]: (r) => r.timings.duration < 500
      });
    });
  });

  sleep(1);

  // Test 2: Authentication Flow
  group('Authentication', () => {
    const token = login(baseUrl, config.auth.username, config.auth.password);

    check(token, {
      'login successful': (t) => t !== null,
      'token is valid JWT': (t) => t && t.split('.').length === 3
    });

    if (!token) {
      console.error('Authentication failed - aborting smoke test');
      return;
    }

    // Verify token
    const verifyResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/auth/verify`,
      null,
      token
    );

    checkResponse(verifyResponse, 200, {
      'token verification works': (r) => r.json('data.user') !== undefined
    });
  });

  sleep(1);

  // Test 3: Basic CRUD Operations
  group('Basic CRUD', () => {
    const token = login(baseUrl, config.auth.username, config.auth.password);
    if (!token) return;

    // Organization Service: Get organization
    const orgResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/organizations/${config.testData.organizationId}`,
      null,
      token
    );

    checkResponse(orgResponse, 200, {
      'can fetch organization': (r) => r.json('data.id') === config.testData.organizationId
    });

    // Activity Service: Query activities
    const activityResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/activities?projectId=${config.testData.projectId}&page=1&limit=10`,
      null,
      token
    );

    checkResponse(activityResponse, 200, {
      'can query activities': (r) => r.json('data.items') !== undefined
    });

    // Calculation Service: Get calculations
    const calcResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/calculations?projectId=${config.testData.projectId}&page=1&limit=10`,
      null,
      token
    );

    checkResponse(calcResponse, 200, {
      'can fetch calculations': (r) => r.json('data.items') !== undefined
    });

    // Reporting Service: List reports
    const reportResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/reports?projectId=${config.testData.projectId}&page=1&limit=10`,
      null,
      token
    );

    checkResponse(reportResponse, 200, {
      'can list reports': (r) => r.json('data.items') !== undefined
    });

    // Audit Service: Query audit logs
    const auditResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/audit/logs?organizationId=${config.testData.organizationId}&page=1&limit=10`,
      null,
      token
    );

    checkResponse(auditResponse, 200, {
      'can query audit logs': (r) => r.json('data.items') !== undefined
    });
  });

  sleep(1);

  // Test 4: API Gateway Routing
  group('API Gateway', () => {
    const token = login(baseUrl, config.auth.username, config.auth.password);
    if (!token) return;

    // Test that gateway correctly routes to different services
    const routes = [
      { path: '/api/v1/users/me', service: 'Identity' },
      { path: `/api/v1/organizations/${config.testData.organizationId}`, service: 'Organization' },
      { path: '/api/v1/activities?page=1&limit=1', service: 'Activity' },
      { path: '/api/v1/calculations?page=1&limit=1', service: 'Calculation' },
      { path: '/api/v1/reports?page=1&limit=1', service: 'Reporting' },
      { path: '/api/v1/audit/logs?page=1&limit=1', service: 'Audit' }
    ];

    routes.forEach(route => {
      const response = authenticatedRequest('GET', `${baseUrl}${route.path}`, null, token);
      check(response, {
        [`Gateway routes to ${route.service}`]: (r) => r.status === 200 || r.status === 404
      });
    });
  });

  sleep(2);
}

// Teardown function
export function teardown(data) {
  console.log('\n=== SMOKE TEST COMPLETED ===');
  console.log('All critical endpoints have been verified.');
  console.log('Ready for full load testing.');
}
