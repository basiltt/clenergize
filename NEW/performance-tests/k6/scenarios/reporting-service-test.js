/**
 * K6 Performance Test - Reporting Service
 *
 * Tests report generation, scheduling, and export
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
  thinkTime,
  validateUUID
} from '../utils/helpers.js';

// Test configuration
export const options = {
  vus: 10,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'], // Higher latency for report generation
    http_req_failed: ['rate<0.01'],
    'group_duration{group:::Report Generation}': ['p(95)<1500'],
    'group_duration{group:::Report Retrieval}': ['p(95)<500']
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

  // Scenario 1: Generate Reports (40% of traffic)
  if (Math.random() < 0.4) {
    group('Report Generation', () => {
      // Generate emission report (POST /api/v1/reports/generate)
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
          includeCharts: true,
          includeDetailedBreakdown: true,
          includeTrends: true,
          groupBy: ['scope', 'category']
        }
      };

      const generateResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/reports/generate`,
        reportRequest,
        token
      );

      checkResponse(generateResponse, 202, {
        'report generation started': (r) => r.json('data.reportId') !== undefined,
        'reportId is UUID': (r) => validateUUID(r.json('data.reportId')),
        'status is queued or processing': (r) => ['QUEUED', 'PROCESSING'].includes(r.json('data.status'))
      });

      if (generateResponse.status === 202) {
        const reportId = generateResponse.json('data.reportId');

        thinkTime(2, 4);

        // Poll report status (GET /api/v1/reports/:id/status)
        const statusResponse = authenticatedRequest(
          'GET',
          `${baseUrl}/api/v1/reports/${reportId}/status`,
          null,
          token
        );

        checkResponse(statusResponse, 200, {
          'status retrieved': (r) => r.json('data.status') !== undefined,
          'progress exists': (r) => r.json('data.progress') !== undefined
        });
      }
    });
  }

  // Scenario 2: Retrieve and Download Reports (40% of traffic)
  else if (Math.random() < 0.8) {
    group('Report Retrieval', () => {
      // List available reports (GET /api/v1/reports?projectId=...)
      const listParams = new URLSearchParams({
        projectId: data.projectId,
        page: '1',
        limit: '20',
        status: 'COMPLETED'
      });

      const listResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/reports?${listParams.toString()}`,
        null,
        token
      );

      checkResponse(listResponse, 200, {
        'reports list returned': (r) => Array.isArray(r.json('data.items')),
        'pagination exists': (r) => r.json('data.pagination') !== undefined
      });

      const reports = listResponse.json('data.items') || [];

      if (reports.length > 0) {
        const randomReport = reports[randomInt(0, reports.length - 1)];

        thinkTime(1, 2);

        // Get report details (GET /api/v1/reports/:id)
        const detailsResponse = authenticatedRequest(
          'GET',
          `${baseUrl}/api/v1/reports/${randomReport.id}`,
          null,
          token
        );

        checkResponse(detailsResponse, 200, {
          'report details returned': (r) => r.json('data.id') === randomReport.id,
          'metadata exists': (r) => r.json('data.metadata') !== undefined
        });

        thinkTime(1, 2);

        // Download report (GET /api/v1/reports/:id/download)
        const downloadResponse = authenticatedRequest(
          'GET',
          `${baseUrl}/api/v1/reports/${randomReport.id}/download`,
          null,
          token
        );

        checkResponse(downloadResponse, 200, {
          'download successful': (r) => r.status === 200,
          'content type is PDF': (r) => r.headers['Content-Type']?.includes('application/pdf') || r.json('data.downloadUrl') !== undefined
        });
      }
    });
  }

  // Scenario 3: Scheduled Reports (20% of traffic)
  else {
    group('Scheduled Reports', () => {
      // Create report schedule (POST /api/v1/reports/schedules)
      const scheduleRequest = {
        projectId: data.projectId,
        reportType: 'EMISSION_SUMMARY',
        schedule: {
          frequency: 'MONTHLY',
          dayOfMonth: 1,
          time: '09:00',
          timezone: 'UTC'
        },
        format: 'PDF',
        recipients: [
          {
            email: config.auth.username,
            name: 'Test User'
          }
        ],
        options: {
          includeCharts: true,
          includeDetailedBreakdown: true
        }
      };

      const createScheduleResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/reports/schedules`,
        scheduleRequest,
        token
      );

      checkResponse(createScheduleResponse, 201, {
        'schedule created': (r) => r.json('data.scheduleId') !== undefined,
        'scheduleId is UUID': (r) => validateUUID(r.json('data.scheduleId')),
        'next run scheduled': (r) => r.json('data.nextRunAt') !== undefined
      });

      if (createScheduleResponse.status === 201) {
        const scheduleId = createScheduleResponse.json('data.scheduleId');

        thinkTime(1, 2);

        // Get schedule details (GET /api/v1/reports/schedules/:id)
        const scheduleDetailsResponse = authenticatedRequest(
          'GET',
          `${baseUrl}/api/v1/reports/schedules/${scheduleId}`,
          null,
          token
        );

        checkResponse(scheduleDetailsResponse, 200, {
          'schedule retrieved': (r) => r.json('data.scheduleId') === scheduleId
        });

        thinkTime(1, 2);

        // List all schedules (GET /api/v1/reports/schedules)
        const listSchedulesResponse = authenticatedRequest(
          'GET',
          `${baseUrl}/api/v1/reports/schedules?projectId=${data.projectId}`,
          null,
          token
        );

        checkResponse(listSchedulesResponse, 200, {
          'schedules list returned': (r) => Array.isArray(r.json('data.items'))
        });

        thinkTime(1, 2);

        // Update schedule (PATCH /api/v1/reports/schedules/:id)
        const updateScheduleResponse = authenticatedRequest(
          'PATCH',
          `${baseUrl}/api/v1/reports/schedules/${scheduleId}`,
          {
            schedule: {
              frequency: 'WEEKLY',
              dayOfWeek: 'MONDAY',
              time: '10:00'
            }
          },
          token
        );

        checkResponse(updateScheduleResponse, 200, {
          'schedule updated': (r) => r.json('data.schedule.frequency') === 'WEEKLY'
        });

        thinkTime(1, 2);

        // Delete schedule (DELETE /api/v1/reports/schedules/:id)
        const deleteScheduleResponse = authenticatedRequest(
          'DELETE',
          `${baseUrl}/api/v1/reports/schedules/${scheduleId}`,
          null,
          token
        );

        checkResponse(deleteScheduleResponse, 204);
      }
    });
  }

  sleep(1);
}

// Teardown function
export function teardown(data) {
  console.log('Reporting Service test completed');
}
