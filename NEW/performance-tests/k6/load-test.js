/**
 * K6 Load Test
 *
 * Realistic load test simulating normal production traffic
 * - Target: 100 concurrent users
 * - Duration: 9 minutes (2m ramp-up + 5m sustained + 2m ramp-down)
 * - Purpose: Validate performance under expected load
 */

import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { config, getGatewayUrl } from './config.js';
import {
  login,
  authenticatedRequest,
  checkResponse,
  randomString,
  randomInt,
  randomEmail,
  randomDate,
  thinkTime,
  weightedRandom,
  validateUUID
} from './utils/helpers.js';

// Test configuration - matches config.js load profile
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 0 }      // Ramp down
  ],
  thresholds: {
    // Global thresholds
    http_req_duration: ['p(50)<100', 'p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.95'],

    // Service-specific thresholds
    'http_req_duration{service:identity}': ['p(95)<200'],
    'http_req_duration{service:organization}': ['p(95)<300'],
    'http_req_duration{service:activity}': ['p(95)<250'],
    'http_req_duration{service:calculation}': ['p(95)<400'],
    'http_req_duration{service:reporting}': ['p(95)<1000'],
    'http_req_duration{service:audit}': ['p(95)<500']
  }
};

// Setup function - runs once
export function setup() {
  const adminToken = login(
    config.services.gateway,
    config.auth.adminUsername,
    config.auth.adminPassword
  );

  const userToken = login(
    config.services.gateway,
    config.auth.username,
    config.auth.password
  );

  return {
    adminToken,
    userToken,
    organizationId: config.testData.organizationId,
    projectId: config.testData.projectId,
    userId: config.testData.userId
  };
}

// Main test scenario - weighted distribution
export default function (data) {
  const baseUrl = config.services.gateway;
  const token = data.userToken;

  if (!token) {
    console.error('Authentication failed');
    return;
  }

  // Weighted scenario selection (realistic user behavior)
  const scenario = weightedRandom([
    { value: 'read_activity', weight: 40 },      // 40% read activity data
    { value: 'view_reports', weight: 20 },       // 20% view reports
    { value: 'manage_projects', weight: 15 },    // 15% manage projects
    { value: 'calculate_emissions', weight: 10 }, // 10% calculate emissions
    { value: 'ingest_data', weight: 10 },        // 10% ingest data
    { value: 'admin_tasks', weight: 5 }          // 5% admin tasks
  ]);

  // Execute scenario
  switch (scenario) {
    case 'read_activity':
      readActivityScenario(baseUrl, token, data);
      break;
    case 'view_reports':
      viewReportsScenario(baseUrl, token, data);
      break;
    case 'manage_projects':
      manageProjectsScenario(baseUrl, token, data);
      break;
    case 'calculate_emissions':
      calculateEmissionsScenario(baseUrl, token, data);
      break;
    case 'ingest_data':
      ingestDataScenario(baseUrl, token, data);
      break;
    case 'admin_tasks':
      adminTasksScenario(baseUrl, data.adminToken, data);
      break;
  }

  sleep(randomInt(1, 3));
}

// Scenario 1: Read Activity Data
function readActivityScenario(baseUrl, token, data) {
  group('Read Activity Data', () => {
    // Query activities
    const params = new URLSearchParams({
      projectId: data.projectId,
      page: '1',
      limit: '20',
      startDate: '2024-01-01',
      endDate: '2025-12-31'
    });

    const response = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/activities?${params.toString()}`,
      null,
      token
    );

    checkResponse(response, 200, {
      'activities retrieved': (r) => Array.isArray(r.json('data.items'))
    });

    thinkTime(2, 4);

    // Get statistics
    const statsParams = new URLSearchParams({
      projectId: data.projectId,
      groupBy: 'scope'
    });

    const statsResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/activities/statistics?${statsParams.toString()}`,
      null,
      token
    );

    checkResponse(statsResponse, 200, {
      'statistics calculated': (r) => r.json('data') !== undefined
    });
  });
}

// Scenario 2: View Reports
function viewReportsScenario(baseUrl, token, data) {
  group('View Reports', () => {
    // List reports
    const listResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/reports?projectId=${data.projectId}&page=1&limit=10`,
      null,
      token
    );

    checkResponse(listResponse, 200, {
      'reports listed': (r) => Array.isArray(r.json('data.items'))
    });

    thinkTime(1, 3);

    // Get emission aggregation
    const aggParams = new URLSearchParams({
      projectId: data.projectId,
      groupBy: 'scope',
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    });

    const aggResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/calculations/aggregate?${aggParams.toString()}`,
      null,
      token
    );

    checkResponse(aggResponse, 200, {
      'aggregation calculated': (r) => r.json('data') !== undefined
    });
  });
}

// Scenario 3: Manage Projects
function manageProjectsScenario(baseUrl, token, data) {
  group('Manage Projects', () => {
    // Get project details
    const projectResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/projects/${data.projectId}`,
      null,
      token
    );

    checkResponse(projectResponse, 200, {
      'project retrieved': (r) => r.json('data.id') === data.projectId
    });

    thinkTime(2, 4);

    // Get project hierarchy
    const hierarchyResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/projects/${data.projectId}/hierarchy`,
      null,
      token
    );

    checkResponse(hierarchyResponse, 200);

    thinkTime(1, 2);

    // List projects in organization
    const listResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/organizations/${data.organizationId}/projects?page=1&limit=20`,
      null,
      token
    );

    checkResponse(listResponse, 200, {
      'projects listed': (r) => Array.isArray(r.json('data.items'))
    });
  });
}

// Scenario 4: Calculate Emissions
function calculateEmissionsScenario(baseUrl, token, data) {
  group('Calculate Emissions', () => {
    // Calculate single emission
    const calcRequest = {
      projectId: data.projectId,
      activityType: 'ENERGY_CONSUMPTION',
      scope: randomInt(1, 3).toString(),
      quantity: randomInt(1000, 50000),
      unit: 'kWh',
      emissionFactorId: `ef-${randomInt(1, 100)}`,
      activityDate: randomDate()
    };

    const calcResponse = authenticatedRequest(
      'POST',
      `${baseUrl}/api/v1/calculations/calculate`,
      calcRequest,
      token
    );

    checkResponse(calcResponse, 200, {
      'calculation completed': (r) => r.json('data.emissionsCO2e') !== undefined
    });

    thinkTime(1, 2);

    // Get monthly rollup
    const rollupParams = new URLSearchParams({
      projectId: data.projectId,
      period: 'month',
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    });

    const rollupResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/calculations/rollup?${rollupParams.toString()}`,
      null,
      token
    );

    checkResponse(rollupResponse, 200, {
      'rollup calculated': (r) => Array.isArray(r.json('data.periods'))
    });
  });
}

// Scenario 5: Ingest Data
function ingestDataScenario(baseUrl, token, data) {
  group('Ingest Data', () => {
    // Ingest single activity
    const activity = {
      projectId: data.projectId,
      organizationId: data.organizationId,
      scope: randomInt(1, 3).toString(),
      category: `Category-${randomInt(1, 10)}`,
      entityId: `entity-${randomString(8)}`,
      activityType: 'ENERGY_CONSUMPTION',
      activityDate: randomDate(),
      quantity: randomInt(100, 10000),
      unit: 'kWh'
    };

    const ingestResponse = authenticatedRequest(
      'POST',
      `${baseUrl}/api/v1/activities`,
      activity,
      token
    );

    checkResponse(ingestResponse, 201, {
      'activity ingested': (r) => r.json('data.id') !== undefined
    });

    thinkTime(1, 2);

    // Validate data
    if (ingestResponse.status === 201) {
      const activityId = ingestResponse.json('data.id');

      const validateResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/activities/${activityId}/validate`,
        {},
        token
      );

      checkResponse(validateResponse, 200);
    }
  });
}

// Scenario 6: Admin Tasks
function adminTasksScenario(baseUrl, token, data) {
  if (!token) return;

  group('Admin Tasks', () => {
    // List users
    const usersResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/users?page=1&limit=20`,
      null,
      token
    );

    checkResponse(usersResponse, 200, {
      'users listed': (r) => Array.isArray(r.json('data.items'))
    });

    thinkTime(1, 3);

    // Query audit logs
    const auditResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/audit/logs?organizationId=${data.organizationId}&page=1&limit=50`,
      null,
      token
    );

    checkResponse(auditResponse, 200, {
      'audit logs retrieved': (r) => Array.isArray(r.json('data.items'))
    });

    thinkTime(1, 2);

    // Get audit statistics
    const statsParams = new URLSearchParams({
      organizationId: data.organizationId,
      startDate: '2024-01-01',
      endDate: '2025-12-31',
      groupBy: 'action'
    });

    const statsResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/audit/statistics?${statsParams.toString()}`,
      null,
      token
    );

    checkResponse(statsResponse, 200, {
      'audit statistics calculated': (r) => r.json('data') !== undefined
    });
  });
}

// Teardown function
export function teardown(data) {
  console.log('\n=== LOAD TEST COMPLETED ===');
  console.log('Performance validated under normal load');
}
