/**
 * K6 Soak Test (Endurance Test)
 *
 * Long-running test to detect memory leaks and resource exhaustion
 * - Load: 200 concurrent users
 * - Duration: 8 hours 10 minutes
 * - Purpose: Identify long-term stability issues
 *
 * WARNING: This test runs for 8+ hours. Only run in dedicated test environments.
 * Monitor: Memory usage, connection pools, cache hit rates, database connections
 */

import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { config } from './config.js';
import {
  login,
  authenticatedRequest,
  checkResponse,
  randomInt,
  randomDate,
  randomString,
  thinkTime,
  weightedRandom
} from './utils/helpers.js';

// Test configuration - matches config.js soak profile
export const options = {
  stages: [
    { duration: '5m', target: 200 },    // Ramp up to sustained load
    { duration: '8h', target: 200 },    // Sustain for 8 hours
    { duration: '5m', target: 0 }       // Ramp down
  ],
  thresholds: {
    // Consistent performance required throughout
    http_req_duration: ['p(95)<300', 'p(99)<600'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.95'],

    // Memory leak indicators
    'http_req_duration{service:identity}': ['p(95)<250'],
    'http_req_duration{service:organization}': ['p(95)<350'],
    'http_req_duration{service:activity}': ['p(95)<300'],
    'http_req_duration{service:calculation}': ['p(95)<500']
  }
};

// Setup function
export function setup() {
  console.log('Starting 8-hour soak test...');
  console.log('Monitor: Memory, CPU, Database connections, Cache performance');

  const userToken = login(
    config.services.gateway,
    config.auth.username,
    config.auth.password
  );

  return {
    userToken,
    organizationId: config.testData.organizationId,
    projectId: config.testData.projectId,
    startTime: new Date().toISOString()
  };
}

// Main test scenario - realistic user behavior
export default function (data) {
  const baseUrl = config.services.gateway;
  const token = data.userToken;

  if (!token) {
    console.error('Authentication failed');
    sleep(10); // Back off on auth failure
    return;
  }

  // Weighted realistic scenarios
  const scenario = weightedRandom([
    { value: 'view_dashboard', weight: 30 },
    { value: 'browse_activities', weight: 25 },
    { value: 'analyze_emissions', weight: 20 },
    { value: 'generate_report', weight: 10 },
    { value: 'ingest_data', weight: 10 },
    { value: 'manage_projects', weight: 5 }
  ]);

  switch (scenario) {
    case 'view_dashboard':
      viewDashboardScenario(baseUrl, token, data);
      break;
    case 'browse_activities':
      browseActivitiesScenario(baseUrl, token, data);
      break;
    case 'analyze_emissions':
      analyzeEmissionsScenario(baseUrl, token, data);
      break;
    case 'generate_report':
      generateReportScenario(baseUrl, token, data);
      break;
    case 'ingest_data':
      ingestDataScenario(baseUrl, token, data);
      break;
    case 'manage_projects':
      manageProjectsScenario(baseUrl, token, data);
      break;
  }

  thinkTime(2, 5); // Realistic user think time
}

function viewDashboardScenario(baseUrl, token, data) {
  group('View Dashboard', () => {
    // Get project summary
    const projectResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/projects/${data.projectId}`,
      null,
      token
    );

    checkResponse(projectResponse, 200);
    sleep(1);

    // Get emission totals
    const aggParams = new URLSearchParams({
      projectId: data.projectId,
      groupBy: 'scope'
    });

    const aggResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/calculations/aggregate?${aggParams.toString()}`,
      null,
      token
    );

    checkResponse(aggResponse, 200);
    sleep(1);

    // Get recent activities
    const activityResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/activities?projectId=${data.projectId}&page=1&limit=10`,
      null,
      token
    );

    checkResponse(activityResponse, 200);
  });
}

function browseActivitiesScenario(baseUrl, token, data) {
  group('Browse Activities', () => {
    // Paginate through activities
    const pages = randomInt(1, 5);

    for (let page = 1; page <= pages; page++) {
      const params = new URLSearchParams({
        projectId: data.projectId,
        page: page.toString(),
        limit: '20'
      });

      const response = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/activities?${params.toString()}`,
        null,
        token
      );

      checkResponse(response, 200);
      sleep(2);
    }

    // Get statistics
    const statsParams = new URLSearchParams({
      projectId: data.projectId,
      groupBy: 'category'
    });

    const statsResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/activities/statistics?${statsParams.toString()}`,
      null,
      token
    );

    checkResponse(statsResponse, 200);
  });
}

function analyzeEmissionsScenario(baseUrl, token, data) {
  group('Analyze Emissions', () => {
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

    checkResponse(rollupResponse, 200);
    sleep(2);

    // Get scope breakdown
    const scopeParams = new URLSearchParams({
      projectId: data.projectId,
      groupBy: 'scope'
    });

    const scopeResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/calculations/aggregate?${scopeParams.toString()}`,
      null,
      token
    );

    checkResponse(scopeResponse, 200);
    sleep(2);

    // Get hierarchy rollup
    const hierarchyResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/calculations/hierarchy-rollup?projectId=${data.projectId}`,
      null,
      token
    );

    checkResponse(hierarchyResponse, 200);
  });
}

function generateReportScenario(baseUrl, token, data) {
  group('Generate Report', () => {
    // Request report generation
    const reportRequest = {
      projectId: data.projectId,
      organizationId: data.organizationId,
      reportType: 'EMISSION_SUMMARY',
      reportingPeriod: {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      },
      format: 'PDF',
      options: {
        includeCharts: true
      }
    };

    const generateResponse = authenticatedRequest(
      'POST',
      `${baseUrl}/api/v1/reports/generate`,
      reportRequest,
      token
    );

    checkResponse(generateResponse, 202);

    if (generateResponse.status === 202) {
      const reportId = generateResponse.json('data.reportId');
      sleep(5);

      // Check report status
      const statusResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/reports/${reportId}/status`,
        null,
        token
      );

      checkResponse(statusResponse, 200);
    }
  });
}

function ingestDataScenario(baseUrl, token, data) {
  group('Ingest Data', () => {
    // Ingest activity data
    const activity = {
      projectId: data.projectId,
      organizationId: data.organizationId,
      scope: randomInt(1, 3).toString(),
      category: `Category-${randomInt(1, 10)}`,
      entityId: `entity-soak-${randomInt(1, 10000)}`,
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

    checkResponse(ingestResponse, 201);
    sleep(1);

    // Validate ingested data
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

function manageProjectsScenario(baseUrl, token, data) {
  group('Manage Projects', () => {
    // List projects
    const listResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/organizations/${data.organizationId}/projects?page=1&limit=20`,
      null,
      token
    );

    checkResponse(listResponse, 200);
    sleep(2);

    // Get project details
    const projectResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/projects/${data.projectId}`,
      null,
      token
    );

    checkResponse(projectResponse, 200);
    sleep(2);

    // Get project hierarchy
    const hierarchyResponse = authenticatedRequest(
      'GET',
      `${baseUrl}/api/v1/projects/${data.projectId}/hierarchy`,
      null,
      token
    );

    checkResponse(hierarchyResponse, 200);
  });
}

// Teardown function
export function teardown(data) {
  const endTime = new Date();
  const startTime = new Date(data.startTime);
  const durationHours = (endTime - startTime) / (1000 * 60 * 60);

  console.log('\n=== SOAK TEST COMPLETED ===');
  console.log(`Test Duration: ${durationHours.toFixed(2)} hours`);
  console.log('');
  console.log('Critical Metrics to Review:');
  console.log('  1. Memory usage trend (should be stable, not increasing)');
  console.log('  2. Database connection pool (no connection leaks)');
  console.log('  3. Cache hit rate (should remain high)');
  console.log('  4. Response time degradation (should be minimal)');
  console.log('  5. Error rate (should be <1% throughout)');
  console.log('  6. CPU usage (should be consistent)');
  console.log('  7. Thread/goroutine count (should be stable)');
  console.log('');
  console.log('If any metric shows degradation over time, investigate for:');
  console.log('  - Memory leaks');
  console.log('  - Resource exhaustion');
  console.log('  - Connection pool exhaustion');
  console.log('  - Cache invalidation issues');
}
