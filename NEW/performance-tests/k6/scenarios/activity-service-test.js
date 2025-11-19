/**
 * K6 Performance Test - Activity Service
 *
 * Tests activity data ingestion, validation, and retrieval
 */

import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { config, getServiceUrl, getGatewayUrl } from '../config.js';
import {
  login,
  authenticatedRequest,
  checkResponse,
  randomString,
  randomInt,
  randomDate,
  thinkTime,
  validateUUID
} from '../utils/helpers.js';

// Test configuration
export const options = {
  vus: 20,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<250', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
    'group_duration{group:::Activity Ingestion}': ['p(95)<300'],
    'group_duration{group:::Activity Retrieval}': ['p(95)<400']
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

  // Scenario 1: Ingest Activity Data (50% of traffic)
  if (Math.random() < 0.5) {
    group('Activity Ingestion', () => {
      // Ingest single activity data (POST /api/v1/activities)
      const newActivity = {
        projectId: data.projectId,
        organizationId: data.organizationId,
        scope: randomInt(1, 3).toString(),
        category: `Category-${randomInt(1, 10)}`,
        entityId: `entity-${randomString(8)}`,
        activityType: 'ENERGY_CONSUMPTION',
        activityDate: randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31)),
        quantity: randomInt(100, 10000),
        unit: 'kWh',
        metadata: {
          source: 'k6-load-test',
          facility: `Facility-${randomInt(1, 5)}`,
          department: `Dept-${randomInt(1, 20)}`
        }
      };

      const ingestResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/activities`,
        newActivity,
        token
      );

      checkResponse(ingestResponse, 201, {
        'activity ingested': (r) => r.json('data.id') !== undefined,
        'activityId is UUID': (r) => validateUUID(r.json('data.id')),
        'quantity matches': (r) => r.json('data.quantity') === newActivity.quantity
      });

      thinkTime(1, 2);

      // Validate ingested data (POST /api/v1/activities/validate)
      if (ingestResponse.status === 201) {
        const activityId = ingestResponse.json('data.id');

        const validateResponse = authenticatedRequest(
          'POST',
          `${baseUrl}/api/v1/activities/${activityId}/validate`,
          {},
          token
        );

        checkResponse(validateResponse, 200, {
          'validation completed': (r) => r.json('data.isValid') !== undefined,
          'validation result exists': (r) => r.json('data.validationResults') !== undefined
        });
      }
    });
  }

  // Scenario 2: Bulk Ingest Activity Data (20% of traffic)
  else if (Math.random() < 0.7) {
    group('Bulk Activity Ingestion', () => {
      // Generate bulk activities
      const bulkActivities = [];
      const batchSize = randomInt(10, 50);

      for (let i = 0; i < batchSize; i++) {
        bulkActivities.push({
          projectId: data.projectId,
          organizationId: data.organizationId,
          scope: randomInt(1, 3).toString(),
          category: `Category-${randomInt(1, 10)}`,
          entityId: `entity-${randomString(8)}`,
          activityType: 'ENERGY_CONSUMPTION',
          activityDate: randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31)),
          quantity: randomInt(100, 10000),
          unit: 'kWh'
        });
      }

      // Bulk ingest (POST /api/v1/activities/bulk)
      const bulkIngestResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/activities/bulk`,
        { activities: bulkActivities },
        token
      );

      checkResponse(bulkIngestResponse, 201, {
        'bulk ingest successful': (r) => r.json('data.totalIngested') === batchSize,
        'all activities created': (r) => r.json('data.failed').length === 0
      });

      thinkTime(2, 4);
    });
  }

  // Scenario 3: Retrieve and Query Activity Data (30% of traffic)
  else {
    group('Activity Retrieval', () => {
      // Query activities by project (GET /api/v1/activities?projectId=...)
      const queryParams = new URLSearchParams({
        projectId: data.projectId,
        page: '1',
        limit: '50',
        startDate: '2024-01-01',
        endDate: '2025-12-31'
      });

      const queryResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/activities?${queryParams.toString()}`,
        null,
        token
      );

      checkResponse(queryResponse, 200, {
        'activities returned': (r) => Array.isArray(r.json('data.items')),
        'pagination exists': (r) => r.json('data.pagination') !== undefined
      });

      thinkTime(1, 3);

      // Query activities by scope (GET /api/v1/activities?scope=1)
      const scopeQueryResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/activities?projectId=${data.projectId}&scope=1`,
        null,
        token
      );

      checkResponse(scopeQueryResponse, 200, {
        'scope filter works': (r) => Array.isArray(r.json('data.items'))
      });

      thinkTime(1, 2);

      // Get activity statistics (GET /api/v1/activities/statistics)
      const statsParams = new URLSearchParams({
        projectId: data.projectId,
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        groupBy: 'scope'
      });

      const statsResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/activities/statistics?${statsParams.toString()}`,
        null,
        token
      );

      checkResponse(statsResponse, 200, {
        'statistics returned': (r) => r.json('data.groups') !== undefined,
        'aggregation exists': (r) => r.json('data.totalQuantity') !== undefined
      });

      thinkTime(1, 2);

      // Export activities (POST /api/v1/activities/export)
      const exportResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/activities/export`,
        {
          projectId: data.projectId,
          startDate: '2024-01-01',
          endDate: '2025-12-31',
          format: 'CSV'
        },
        token
      );

      checkResponse(exportResponse, 200, {
        'export initiated': (r) => r.json('data.exportId') !== undefined || r.json('data.downloadUrl') !== undefined
      });
    });
  }

  sleep(1);
}

// Teardown function
export function teardown(data) {
  console.log('Activity Service test completed');
}
