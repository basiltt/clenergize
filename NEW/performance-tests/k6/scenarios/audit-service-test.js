/**
 * K6 Performance Test - Audit Service
 *
 * Tests audit log querying, compliance reports, and data lineage
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
  vus: 8,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    'group_duration{group:::Audit Log Query}': ['p(95)<600'],
    'group_duration{group:::Compliance Reports}': ['p(95)<800']
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
    projectId: config.testData.projectId,
    userId: config.testData.userId
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

  // Scenario 1: Query Audit Logs (60% of traffic)
  if (Math.random() < 0.6) {
    group('Audit Log Query', () => {
      // Query audit logs by user (GET /api/v1/audit/logs?userId=...)
      const userLogsParams = new URLSearchParams({
        userId: data.userId,
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        page: '1',
        limit: '50'
      });

      const userLogsResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/audit/logs?${userLogsParams.toString()}`,
        null,
        token
      );

      checkResponse(userLogsResponse, 200, {
        'audit logs returned': (r) => Array.isArray(r.json('data.items')),
        'pagination exists': (r) => r.json('data.pagination') !== undefined,
        'logs have correlation IDs': (r) => {
          const items = r.json('data.items');
          return items.length === 0 || items[0].correlationId !== undefined;
        }
      });

      thinkTime(1, 3);

      // Query audit logs by entity (GET /api/v1/audit/logs?entityType=project&entityId=...)
      const entityLogsParams = new URLSearchParams({
        entityType: 'project',
        entityId: data.projectId,
        page: '1',
        limit: '50'
      });

      const entityLogsResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/audit/logs?${entityLogsParams.toString()}`,
        null,
        token
      );

      checkResponse(entityLogsResponse, 200, {
        'entity audit logs returned': (r) => Array.isArray(r.json('data.items'))
      });

      thinkTime(1, 2);

      // Query audit logs by action (GET /api/v1/audit/logs?action=CREATE)
      const actionLogsResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/audit/logs?organizationId=${data.organizationId}&action=CREATE&page=1&limit=20`,
        null,
        token
      );

      checkResponse(actionLogsResponse, 200, {
        'action filtered logs returned': (r) => Array.isArray(r.json('data.items'))
      });

      thinkTime(1, 2);

      // Search audit logs (POST /api/v1/audit/logs/search)
      const searchResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/audit/logs/search`,
        {
          organizationId: data.organizationId,
          filters: {
            actions: ['CREATE', 'UPDATE', 'DELETE'],
            entityTypes: ['project', 'activity'],
            startDate: '2024-01-01',
            endDate: '2025-12-31'
          },
          page: 1,
          limit: 50
        },
        token
      );

      checkResponse(searchResponse, 200, {
        'search results returned': (r) => Array.isArray(r.json('data.items')),
        'search metadata exists': (r) => r.json('data.searchId') !== undefined
      });
    });
  }

  // Scenario 2: Compliance and Data Lineage (25% of traffic)
  else if (Math.random() < 0.85) {
    group('Compliance Reports', () => {
      // Get compliance report (POST /api/v1/audit/compliance/report)
      const complianceReportRequest = {
        organizationId: data.organizationId,
        reportType: 'ACCESS_CONTROL',
        period: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        },
        includeDetails: true
      };

      const complianceResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/audit/compliance/report`,
        complianceReportRequest,
        token
      );

      checkResponse(complianceResponse, 200, {
        'compliance report generated': (r) => r.json('data.reportId') !== undefined,
        'summary exists': (r) => r.json('data.summary') !== undefined,
        'violations tracked': (r) => r.json('data.violations') !== undefined
      });

      thinkTime(2, 4);

      // Get data lineage (GET /api/v1/audit/lineage?entityType=calculation&entityId=...)
      const lineageParams = new URLSearchParams({
        entityType: 'calculation',
        entityId: `calc-${randomString(8)}`, // Mock calculation ID
        depth: '3'
      });

      const lineageResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/audit/lineage?${lineageParams.toString()}`,
        null,
        token
      );

      // Lineage may not exist for random ID, so 200 or 404 is acceptable
      check(lineageResponse, {
        'lineage query executed': (r) => r.status === 200 || r.status === 404
      });

      thinkTime(1, 2);

      // Get GDPR data export (POST /api/v1/audit/gdpr/export)
      const gdprExportResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/audit/gdpr/export`,
        {
          userId: data.userId,
          includeAuditLogs: true,
          includePersonalData: true
        },
        token
      );

      checkResponse(gdprExportResponse, 202, {
        'GDPR export initiated': (r) => r.json('data.exportId') !== undefined,
        'status is queued': (r) => r.json('data.status') === 'QUEUED' || r.json('data.status') === 'PROCESSING'
      });
    });
  }

  // Scenario 3: Integrity Verification (15% of traffic)
  else {
    group('Integrity Verification', () => {
      // Verify audit log integrity (POST /api/v1/audit/verify)
      const verifyRequest = {
        organizationId: data.organizationId,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        verifyHashChain: true,
        verifySignatures: true
      };

      const verifyResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/audit/verify`,
        verifyRequest,
        token
      );

      checkResponse(verifyResponse, 200, {
        'verification completed': (r) => r.json('data.verificationId') !== undefined,
        'integrity status exists': (r) => r.json('data.integrityStatus') !== undefined,
        'violations detected tracked': (r) => r.json('data.violationsDetected') !== undefined
      });

      thinkTime(2, 4);

      // Get verification history (GET /api/v1/audit/verify/history)
      const historyResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/audit/verify/history?organizationId=${data.organizationId}&page=1&limit=20`,
        null,
        token
      );

      checkResponse(historyResponse, 200, {
        'verification history returned': (r) => Array.isArray(r.json('data.items'))
      });

      thinkTime(1, 2);

      // Get audit statistics (GET /api/v1/audit/statistics)
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
        'statistics returned': (r) => r.json('data.groups') !== undefined,
        'total events tracked': (r) => r.json('data.totalEvents') !== undefined
      });
    });
  }

  sleep(1);
}

// Teardown function
export function teardown(data) {
  console.log('Audit Service test completed');
}
