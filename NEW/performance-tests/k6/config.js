/**
 * K6 Performance Testing Configuration
 *
 * Environment-specific configuration for testing Clenergize V3 microservices
 */

// Base URLs for services (override via environment variables)
export const config = {
  // Service endpoints
  services: {
    identity: __ENV.IDENTITY_SERVICE_URL || 'http://localhost:3001',
    organization: __ENV.ORGANIZATION_SERVICE_URL || 'http://localhost:3002',
    reference: __ENV.REFERENCE_SERVICE_URL || 'http://localhost:3003',
    activity: __ENV.ACTIVITY_SERVICE_URL || 'http://localhost:3004',
    calculation: __ENV.CALCULATION_SERVICE_URL || 'http://localhost:3005',
    reporting: __ENV.REPORTING_SERVICE_URL || 'http://localhost:3006',
    audit: __ENV.AUDIT_SERVICE_URL || 'http://localhost:3007',
    gateway: __ENV.API_GATEWAY_URL || 'http://localhost:80'
  },

  // Authentication
  auth: {
    // Test user credentials (use dedicated test account)
    username: __ENV.TEST_USER_EMAIL || 'perf-test@clenergize.com',
    password: __ENV.TEST_USER_PASSWORD || 'TestPassword123!',
    adminUsername: __ENV.TEST_ADMIN_EMAIL || 'admin-perf@clenergize.com',
    adminPassword: __ENV.TEST_ADMIN_PASSWORD || 'AdminPassword123!'
  },

  // Test data
  testData: {
    organizationId: __ENV.TEST_ORG_ID || '550e8400-e29b-41d4-a716-446655440001',
    projectId: __ENV.TEST_PROJECT_ID || '550e8400-e29b-41d4-a716-446655440002',
    userId: __ENV.TEST_USER_ID || '550e8400-e29b-41d4-a716-446655440003'
  },

  // Performance thresholds
  thresholds: {
    // Response time targets
    http_req_duration: {
      p50: 100,   // 50% of requests < 100ms
      p95: 200,   // 95% of requests < 200ms
      p99: 500    // 99% of requests < 500ms
    },

    // Error rate targets
    http_req_failed: 0.01,  // Less than 1% errors

    // Availability
    availability: 0.999     // 99.9% availability
  },

  // Load test profiles
  profiles: {
    smoke: {
      vus: 1,
      duration: '1m'
    },
    load: {
      stages: [
        { duration: '2m', target: 100 },   // Ramp up to 100 users
        { duration: '5m', target: 100 },   // Stay at 100 users
        { duration: '2m', target: 0 }      // Ramp down
      ]
    },
    stress: {
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '5m', target: 300 },
        { duration: '5m', target: 400 },
        { duration: '2m', target: 0 }
      ]
    },
    spike: {
      stages: [
        { duration: '10s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '10s', target: 1400 },  // Spike!
        { duration: '3m', target: 1400 },
        { duration: '10s', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '10s', target: 0 }
      ]
    },
    soak: {
      stages: [
        { duration: '5m', target: 200 },    // Ramp up
        { duration: '8h', target: 200 },    // Sustain for 8 hours
        { duration: '5m', target: 0 }       // Ramp down
      ]
    }
  },

  // Rate limiting (requests per second)
  rateLimit: {
    standard: 100,    // Standard user: 100 req/min
    premium: 500,     // Premium user: 500 req/min
    admin: 1000       // Admin user: 1000 req/min
  }
};

// Helper to get full URL for a service endpoint
export function getServiceUrl(serviceName, path = '') {
  const baseUrl = config.services[serviceName];
  if (!baseUrl) {
    throw new Error(`Unknown service: ${serviceName}`);
  }
  return `${baseUrl}${path}`;
}

// Helper to get API Gateway URL
export function getGatewayUrl(path = '') {
  return `${config.services.gateway}${path}`;
}

export default config;
