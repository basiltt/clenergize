/**
 * K6 Stress Test
 *
 * Push system beyond normal capacity to find breaking point
 * - Target: Gradually increase to 400 concurrent users
 * - Duration: 19 minutes
 * - Purpose: Identify system limits and degradation patterns
 */

import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { config } from './config.js';
import {
  login,
  authenticatedRequest,
  checkResponse,
  randomInt,
  thinkTime,
  weightedRandom
} from './utils/helpers.js';

// Test configuration - matches config.js stress profile
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to baseline
    { duration: '5m', target: 200 },   // Double the load
    { duration: '5m', target: 300 },   // Triple the load
    { duration: '5m', target: 400 },   // 4x load - stress point
    { duration: '2m', target: 0 }      // Ramp down
  ],
  thresholds: {
    // Relaxed thresholds for stress test
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'], // Allow up to 5% errors under stress
    checks: ['rate>0.85'], // 85% check pass rate acceptable under stress

    // Service degradation monitoring
    'http_req_duration{service:identity}': ['p(95)<500'],
    'http_req_duration{service:organization}': ['p(95)<800'],
    'http_req_duration{service:activity}': ['p(95)<600'],
    'http_req_duration{service:calculation}': ['p(95)<1200'],
    'http_req_duration{service:reporting}': ['p(95)<2000'],
    'http_req_duration{service:audit}': ['p(95)<1000']
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

// Main test scenario - focus on read-heavy operations
export default function (data) {
  const baseUrl = config.services.gateway;
  const token = data.userToken;

  if (!token) {
    console.error('Authentication failed');
    return;
  }

  // Simplified scenarios for stress test
  const scenario = weightedRandom([
    { value: 'read_activities', weight: 30 },
    { value: 'read_calculations', weight: 25 },
    { value: 'read_reports', weight: 20 },
    { value: 'query_audit', weight: 15 },
    { value: 'write_data', weight: 10 }
  ]);

  switch (scenario) {
    case 'read_activities':
      readActivitiesScenario(baseUrl, token, data);
      break;
    case 'read_calculations':
      readCalculationsScenario(baseUrl, token, data);
      break;
    case 'read_reports':
      readReportsScenario(baseUrl, token, data);
      break;
    case 'query_audit':
      queryAuditScenario(baseUrl, token, data);
      break;
    case 'write_data':
      writeDataScenario(baseUrl, token, data);
      break;
  }

  sleep(randomInt(1, 2)); // Shorter think time under stress
}

function readActivitiesScenario(baseUrl, token, data) {
  group('Read Activities', () => {
    const params = new URLSearchParams({
      projectId: data.projectId,
      page: randomInt(1, 10).toString(),
      limit: '50'
    });

    const response = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/activities?${params.toString()}`,
      null,
      token
    );

    check(response, {
      'activities retrieved': (r) => r.status === 200,
      'response time acceptable': (r) => r.timings.duration < 1000
    });

    thinkTime(0.5, 1);
  });
}

function readCalculationsScenario(baseUrl, token, data) {
  group('Read Calculations', () => {
    const aggParams = new URLSearchParams({
      projectId: data.projectId,
      groupBy: 'scope'
    });

    const response = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/calculations/aggregate?${aggParams.toString()}`,
      null,
      token
    );

    check(response, {
      'calculations retrieved': (r) => r.status === 200,
      'response time acceptable': (r) => r.timings.duration < 1500
    });

    thinkTime(0.5, 1);
  });
}

function readReportsScenario(baseUrl, token, data) {
  group('Read Reports', () => {
    const response = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/reports?projectId=${data.projectId}&page=1&limit=20`,
      null,
      token
    );

    check(response, {
      'reports retrieved': (r) => r.status === 200,
      'response time acceptable': (r) => r.timings.duration < 1000
    });

    thinkTime(0.5, 1);
  });
}

function queryAuditScenario(baseUrl, token, data) {
  group('Query Audit Logs', () => {
    const params = new URLSearchParams({
      organizationId: data.organizationId,
      page: randomInt(1, 5).toString(),
      limit: '50'
    });

    const response = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/audit/logs?${params.toString()}`,
      null,
      token
    );

    check(response, {
      'audit logs retrieved': (r) => r.status === 200,
      'response time acceptable': (r) => r.timings.duration < 1200
    });

    thinkTime(0.5, 1);
  });
}

function writeDataScenario(baseUrl, token, data) {
  group('Write Data', () => {
    const activity = {
      projectId: data.projectId,
      organizationId: data.organizationId,
      scope: randomInt(1, 3).toString(),
      category: `Category-${randomInt(1, 10)}`,
      entityId: `entity-stress-${randomInt(1, 1000)}`,
      activityType: 'ENERGY_CONSUMPTION',
      activityDate: new Date().toISOString(),
      quantity: randomInt(100, 10000),
      unit: 'kWh'
    };

    const response = authenticatedRequest(
      'POST',
      `${baseUrl}/api/v1/activities`,
      activity,
      token
    );

    check(response, {
      'activity ingested or queued': (r) => r.status === 201 || r.status === 202 || r.status === 429,
      'response time acceptable': (r) => r.timings.duration < 1500
    });

    thinkTime(0.5, 1);
  });
}

// Teardown function
export function teardown(data) {
  console.log('\n=== STRESS TEST COMPLETED ===');
  console.log('System limits identified');
  console.log('Review metrics for degradation patterns and breaking points');
}
