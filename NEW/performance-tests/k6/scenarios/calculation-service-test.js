/**
 * K6 Performance Test - Calculation Service
 *
 * Tests emission calculations, aggregations, and rollups
 */

import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { config, getServiceUrl, getGatewayUrl } from '../config.js';
import {
  login,
  authenticatedRequest,
  checkResponse,
  randomInt,
  randomDate,
  thinkTime,
  validateUUID
} from '../utils/helpers.js';

// Test configuration
export const options = {
  vus: 15,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<400', 'p(99)<800'], // Higher latency expected for calculations
    http_req_failed: ['rate<0.01'],
    'group_duration{group:::Emission Calculation}': ['p(95)<500'],
    'group_duration{group:::Aggregation}': ['p(95)<1000']
  }
};

// Setup function
export function setup() {
  const token = login(
    config.services.gateway,
    config.auth.username,
    config.auth.password
  );

  return {
    token,
    organizationId: config.testData.organizationId,
    projectId: config.testData.projectId
  };
}

// Main test scenario
export default function (data) {
  const baseUrl = config.services.gateway;
  const token = data.token;

  if (!token) {
    console.error('Authentication failed in setup');
    return;
  }

  // Scenario 1: Calculate Emissions (60% of traffic)
  if (Math.random() < 0.6) {
    group('Emission Calculation', () => {
      // Calculate emissions for activity (POST /api/v1/calculations/calculate)
      const calculationRequest = {
        projectId: data.projectId,
        activityType: 'ENERGY_CONSUMPTION',
        scope: randomInt(1, 3).toString(),
        quantity: randomInt(1000, 50000),
        unit: 'kWh',
        emissionFactorId: `ef-${randomInt(1, 100)}`, // Mock emission factor ID
        activityDate: randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31))
      };

      const calculateResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/calculations/calculate`,
        calculationRequest,
        token
      );

      checkResponse(calculateResponse, 200, {
        'calculation successful': (r) => r.json('data.emissionsCO2e') !== undefined,
        'calculation has breakdown': (r) => r.json('data.breakdown') !== undefined,
        'uncertainty included': (r) => r.json('data.uncertainty') !== undefined
      });

      thinkTime(1, 2);

      // Get calculation history (GET /api/v1/calculations?projectId=...)
      const historyResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/calculations?projectId=${data.projectId}&page=1&limit=20`,
        null,
        token
      );

      checkResponse(historyResponse, 200, {
        'history returned': (r) => Array.isArray(r.json('data.items')),
        'pagination exists': (r) => r.json('data.pagination') !== undefined
      });
    });
  }

  // Scenario 2: Batch Calculations (20% of traffic)
  else if (Math.random() < 0.8) {
    group('Batch Calculation', () => {
      // Generate batch calculation requests
      const batchCalculations = [];
      const batchSize = randomInt(5, 20);

      for (let i = 0; i < batchSize; i++) {
        batchCalculations.push({
          projectId: data.projectId,
          activityType: 'ENERGY_CONSUMPTION',
          scope: randomInt(1, 3).toString(),
          quantity: randomInt(1000, 50000),
          unit: 'kWh',
          emissionFactorId: `ef-${randomInt(1, 100)}`,
          activityDate: randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31))
        });
      }

      // Batch calculate (POST /api/v1/calculations/batch)
      const batchResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/calculations/batch`,
        { calculations: batchCalculations },
        token
      );

      checkResponse(batchResponse, 200, {
        'batch calculation successful': (r) => r.json('data.totalProcessed') === batchSize,
        'results array exists': (r) => Array.isArray(r.json('data.results')),
        'all calculations succeeded': (r) => r.json('data.failed').length === 0
      });

      thinkTime(2, 4);
    });
  }

  // Scenario 3: Aggregation and Rollups (20% of traffic)
  else {
    group('Aggregation', () => {
      // Get project emission totals (GET /api/v1/calculations/aggregate?projectId=...&groupBy=scope)
      const aggregateParams = new URLSearchParams({
        projectId: data.projectId,
        groupBy: 'scope',
        startDate: '2024-01-01',
        endDate: '2025-12-31'
      });

      const aggregateResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/calculations/aggregate?${aggregateParams.toString()}`,
        null,
        token
      );

      checkResponse(aggregateResponse, 200, {
        'aggregation returned': (r) => r.json('data.groups') !== undefined,
        'total emissions calculated': (r) => r.json('data.totalEmissionsCO2e') !== undefined,
        'breakdown by scope exists': (r) => Array.isArray(r.json('data.groups'))
      });

      thinkTime(1, 3);

      // Get monthly rollup (GET /api/v1/calculations/rollup?projectId=...&period=month)
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
        'rollup returned': (r) => Array.isArray(r.json('data.periods')),
        'monthly data exists': (r) => r.json('data.periods').length > 0,
        'each period has emissions': (r) => {
          const periods = r.json('data.periods');
          return periods.every(p => p.emissionsCO2e !== undefined);
        }
      });

      thinkTime(1, 2);

      // Get hierarchy rollup (GET /api/v1/calculations/hierarchy-rollup?projectId=...)
      const hierarchyRollupResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/calculations/hierarchy-rollup?projectId=${data.projectId}`,
        null,
        token
      );

      checkResponse(hierarchyRollupResponse, 200, {
        'hierarchy rollup returned': (r) => r.json('data.tree') !== undefined,
        'root node exists': (r) => r.json('data.tree.emissionsCO2e') !== undefined
      });

      thinkTime(1, 2);

      // Trigger recalculation (POST /api/v1/calculations/recalculate)
      const recalculateResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/calculations/recalculate`,
        {
          projectId: data.projectId,
          scope: '1',
          reason: 'Updated emission factors'
        },
        token
      );

      checkResponse(recalculateResponse, 202, {
        'recalculation triggered': (r) => r.json('data.jobId') !== undefined,
        'status is queued': (r) => r.json('data.status') === 'QUEUED' || r.json('data.status') === 'IN_PROGRESS'
      });
    });
  }

  sleep(1);
}

// Teardown function
export function teardown(data) {
  console.log('Calculation Service test completed');
}
