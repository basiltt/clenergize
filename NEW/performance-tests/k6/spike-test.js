/**
 * K6 Spike Test
 *
 * Sudden traffic spike to test auto-scaling and circuit breakers
 * - Normal load: 100 users
 * - Spike: 1400 users (14x sudden increase)
 * - Duration: ~8 minutes
 * - Purpose: Test system resilience to sudden traffic bursts
 */

import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { config } from './config.js';
import {
  login,
  authenticatedRequest,
  checkResponse,
  randomInt,
  thinkTime
} from './utils/helpers.js';

// Test configuration - matches config.js spike profile
export const options = {
  stages: [
    { duration: '10s', target: 100 },    // Baseline load
    { duration: '1m', target: 100 },     // Sustained baseline
    { duration: '10s', target: 1400 },   // SPIKE! 14x increase
    { duration: '3m', target: 1400 },    // Sustain spike
    { duration: '10s', target: 100 },    // Drop back to baseline
    { duration: '3m', target: 100 },     // Recovery period
    { duration: '10s', target: 0 }       // Ramp down
  ],
  thresholds: {
    // Very relaxed thresholds - expect degradation during spike
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.1'], // Allow up to 10% errors during spike
    checks: ['rate>0.7'], // 70% check pass rate

    // Monitor circuit breaker behavior
    'http_req_duration{service:identity}': ['p(95)<1000'],
    'http_req_duration{service:calculation}': ['p(95)<3000']
  }
};

// Setup function
export function setup() {
  const userToken = login(
    config.services.gateway,
    config.auth.username,
    config.auth.password
  );

  return {
    userToken,
    organizationId: config.testData.organizationId,
    projectId: config.testData.projectId
  };
}

// Main test scenario - simple read-only operations
export default function (data) {
  const baseUrl = config.services.gateway;
  const token = data.userToken;

  if (!token) {
    // During spike, auth may fail - continue anyway
    console.warn('Authentication failed - continuing test');
    sleep(1);
    return;
  }

  // Randomly select simple read operation
  const operations = [
    () => readActivities(baseUrl, token, data),
    () => readCalculations(baseUrl, token, data),
    () => readReports(baseUrl, token, data),
    () => queryOrganization(baseUrl, token, data)
  ];

  const selectedOp = operations[randomInt(0, operations.length - 1)];
  selectedOp();

  sleep(randomInt(0, 1)); // Minimal think time during spike
}

function readActivities(baseUrl, token, data) {
  const params = new URLSearchParams({
    projectId: data.projectId,
    page: '1',
    limit: '20'
  });

  const response = authenticatedRequest(
    'GET',
    `${baseUrl}/api/v1/activities?${params.toString()}`,
    null,
    token
  );

  check(response, {
    'activities endpoint responsive': (r) => r.status === 200 || r.status === 429 || r.status === 503,
    'response received': (r) => r.status !== 0
  });
}

function readCalculations(baseUrl, token, data) {
  const params = new URLSearchParams({
    projectId: data.projectId,
    page: '1',
    limit: '20'
  });

  const response = authenticatedRequest(
    'GET',
    `${baseUrl}/api/v1/calculations?${params.toString()}`,
    null,
    token
  );

  check(response, {
    'calculations endpoint responsive': (r) => r.status === 200 || r.status === 429 || r.status === 503,
    'response received': (r) => r.status !== 0
  });
}

function readReports(baseUrl, token, data) {
  const response = authenticatedRequest(
    'GET',
    `${baseUrl}/api/v1/reports?projectId=${data.projectId}&page=1&limit=10`,
    null,
    token
  );

  check(response, {
    'reports endpoint responsive': (r) => r.status === 200 || r.status === 429 || r.status === 503,
    'response received': (r) => r.status !== 0
  });
}

function queryOrganization(baseUrl, token, data) {
  const response = authenticatedRequest(
    'GET',
    `${baseUrl}/api/v1/organizations/${data.organizationId}`,
    null,
    token
  );

  check(response, {
    'organization endpoint responsive': (r) => r.status === 200 || r.status === 429 || r.status === 503,
    'response received': (r) => r.status !== 0
  });
}

// Teardown function
export function teardown(data) {
  console.log('\n=== SPIKE TEST COMPLETED ===');
  console.log('Metrics to review:');
  console.log('  - Circuit breaker activation');
  console.log('  - Rate limiting behavior');
  console.log('  - Auto-scaling response time');
  console.log('  - Error rate during spike');
  console.log('  - Recovery time after spike');
}
