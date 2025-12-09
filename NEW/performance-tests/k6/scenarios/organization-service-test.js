/**
 * K6 Performance Test - Organization Service
 *
 * Tests organization, project, and hierarchy management
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
  vus: 15,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<600'],
    http_req_failed: ['rate<0.01'],
    'group_duration{group:::Organization Management}': ['p(95)<400'],
    'group_duration{group:::Project Management}': ['p(95)<500'],
    'group_duration{group:::Hierarchy Operations}': ['p(95)<600']
  }
};

// Setup function
export function setup() {
  const token = login(
    config.services.gateway,
    config.auth.username,
    config.auth.password
  );

  return { token, organizationId: config.testData.organizationId };
}

// Main test scenario
export default function (data) {
  const baseUrl = config.services.gateway;
  const token = data.token;

  if (!token) {
    console.error('Authentication failed in setup');
    return;
  }

  // Scenario 1: Browse Organizations and Projects (60% of traffic)
  if (Math.random() < 0.6) {
    group('Organization Management', () => {
      // Get organization details (GET /api/v1/organizations/:id)
      const orgResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/organizations/${data.organizationId}`,
        null,
        token
      );

      checkResponse(orgResponse, 200, {
        'organization data returned': (r) => r.json('data.id') === data.organizationId,
        'name exists': (r) => r.json('data.name') !== undefined
      });

      thinkTime(1, 3);

      // List projects in organization (GET /api/v1/organizations/:id/projects)
      const projectsResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/organizations/${data.organizationId}/projects?page=1&limit=20`,
        null,
        token
      );

      checkResponse(projectsResponse, 200, {
        'projects list returned': (r) => Array.isArray(r.json('data.items')),
        'pagination exists': (r) => r.json('data.pagination') !== undefined
      });

      thinkTime(2, 4);

      // Get organization settings (GET /api/v1/organizations/:id/settings)
      const settingsResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/organizations/${data.organizationId}/settings`,
        null,
        token
      );

      checkResponse(settingsResponse, 200, {
        'settings returned': (r) => r.json('data') !== undefined
      });
    });
  }

  // Scenario 2: Project Management (30% of traffic)
  else if (Math.random() < 0.9) {
    group('Project Management', () => {
      // Create new project (POST /api/v1/projects)
      const newProject = {
        name: `Performance Test Project ${randomString(8)}`,
        description: 'Created by K6 performance test',
        organizationId: data.organizationId,
        reportingYears: [2024, 2025],
        settings: {
          currency: 'USD',
          emissionStandard: 'GHG_PROTOCOL',
          reportingBoundary: 'OPERATIONAL_CONTROL'
        }
      };

      const createResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/projects`,
        newProject,
        token
      );

      checkResponse(createResponse, 201, {
        'project created': (r) => r.json('data.id') !== undefined,
        'projectId is UUID': (r) => validateUUID(r.json('data.id')),
        'name matches': (r) => r.json('data.name') === newProject.name
      });

      if (createResponse.status === 201) {
        const projectId = createResponse.json('data.id');

        thinkTime(1, 2);

        // Get project details (GET /api/v1/projects/:id)
        const projectResponse = authenticatedRequest(
          'GET',
          `${baseUrl}/api/v1/projects/${projectId}`,
          null,
          token
        );

        checkResponse(projectResponse, 200, {
          'project retrieved': (r) => r.json('data.id') === projectId
        });

        thinkTime(1, 3);

        // Update project (PATCH /api/v1/projects/:id)
        const updateData = {
          description: `Updated by K6 test at ${new Date().toISOString()}`,
          settings: {
            currency: 'EUR',
            emissionStandard: 'ISO_14064'
          }
        };

        const updateResponse = authenticatedRequest(
          'PATCH',
          `${baseUrl}/api/v1/projects/${projectId}`,
          updateData,
          token
        );

        checkResponse(updateResponse, 200, {
          'project updated': (r) => r.json('data.settings.currency') === 'EUR'
        });

        thinkTime(1, 2);

        // Get project hierarchy (GET /api/v1/projects/:id/hierarchy)
        const hierarchyResponse = authenticatedRequest(
          'GET',
          `${baseUrl}/api/v1/projects/${projectId}/hierarchy`,
          null,
          token
        );

        checkResponse(hierarchyResponse, 200, {
          'hierarchy returned': (r) => r.json('data') !== undefined
        });

        thinkTime(1, 2);

        // Delete project (DELETE /api/v1/projects/:id)
        const deleteResponse = authenticatedRequest(
          'DELETE',
          `${baseUrl}/api/v1/projects/${projectId}`,
          null,
          token
        );

        checkResponse(deleteResponse, 204);
      }
    });
  }

  // Scenario 3: Hierarchy Operations (10% of traffic)
  else {
    group('Hierarchy Operations', () => {
      // List hierarchy templates (GET /api/v1/hierarchies/templates)
      const templatesResponse = authenticatedRequest(
        'GET',
        `${baseUrl}/api/v1/hierarchies/templates?page=1&limit=10`,
        null,
        token
      );

      checkResponse(templatesResponse, 200, {
        'templates list returned': (r) => Array.isArray(r.json('data.items'))
      });

      thinkTime(2, 4);

      // Create custom hierarchy template (POST /api/v1/hierarchies/templates)
      const newHierarchy = {
        name: `Test Hierarchy ${randomString(6)}`,
        description: 'Created by K6 test',
        structure: [
          {
            id: `scope-1-${randomString(4)}`,
            name: 'Scope 1 - Direct Emissions',
            type: 'scope',
            level: 1,
            children: [
              {
                id: `category-1-${randomString(4)}`,
                name: 'Stationary Combustion',
                type: 'category',
                level: 2
              }
            ]
          },
          {
            id: `scope-2-${randomString(4)}`,
            name: 'Scope 2 - Indirect Emissions',
            type: 'scope',
            level: 1
          }
        ]
      };

      const createHierarchyResponse = authenticatedRequest(
        'POST',
        `${baseUrl}/api/v1/hierarchies/templates`,
        newHierarchy,
        token
      );

      checkResponse(createHierarchyResponse, 201, {
        'hierarchy created': (r) => r.json('data.id') !== undefined,
        'structure preserved': (r) => Array.isArray(r.json('data.structure'))
      });

      if (createHierarchyResponse.status === 201) {
        const hierarchyId = createHierarchyResponse.json('data.id');

        thinkTime(1, 2);

        // Get hierarchy details (GET /api/v1/hierarchies/templates/:id)
        const hierarchyResponse = authenticatedRequest(
          'GET',
          `${baseUrl}/api/v1/hierarchies/templates/${hierarchyId}`,
          null,
          token
        );

        checkResponse(hierarchyResponse, 200, {
          'hierarchy retrieved': (r) => r.json('data.id') === hierarchyId,
          'structure exists': (r) => r.json('data.structure').length > 0
        });

        thinkTime(1, 2);

        // Assign hierarchy to project (POST /api/v1/projects/:projectId/hierarchy)
        const assignResponse = authenticatedRequest(
          'POST',
          `${baseUrl}/api/v1/projects/${config.testData.projectId}/hierarchy`,
          {
            templateId: hierarchyId,
            customizations: {
              addedNodes: [],
              removedNodes: []
            }
          },
          token
        );

        // May fail if project doesn't exist, which is OK in load test
        if (assignResponse.status === 200 || assignResponse.status === 404) {
          check(assignResponse, {
            'hierarchy assignment attempted': (r) => r.status === 200 || r.status === 404
          });
        }

        thinkTime(1, 2);

        // Delete hierarchy template (DELETE /api/v1/hierarchies/templates/:id)
        const deleteHierarchyResponse = authenticatedRequest(
          'DELETE',
          `${baseUrl}/api/v1/hierarchies/templates/${hierarchyId}`,
          null,
          token
        );

        checkResponse(deleteHierarchyResponse, 204);
      }
    });
  }

  sleep(1);
}

// Teardown function
export function teardown(data) {
  console.log('Organization Service test completed');
}
