/**
 * K6 Test Helpers
 *
 * Common utilities for performance testing
 */

import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import http from 'k6/http';

// Custom metrics
export const errorRate = new Rate('errors');

/**
 * Make authenticated HTTP request
 */
export function authenticatedRequest(method, url, body, token, additionalHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...additionalHeaders
  };

  const params = {
    headers,
    tags: { name: url }
  };

  let response;
  switch (method.toUpperCase()) {
    case 'GET':
      response = http.get(url, params);
      break;
    case 'POST':
      response = http.post(url, JSON.stringify(body), params);
      break;
    case 'PUT':
      response = http.put(url, JSON.stringify(body), params);
      break;
    case 'PATCH':
      response = http.patch(url, JSON.stringify(body), params);
      break;
    case 'DELETE':
      response = http.del(url, params);
      break;
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }

  return response;
}

/**
 * Login and get JWT token
 */
export function login(baseUrl, username, password) {
  const loginUrl = `${baseUrl}/api/v1/auth/login`;
  const payload = {
    email: username,
    password: password
  };

  const response = http.post(loginUrl, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' }
  });

  const success = check(response, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => r.json('data.accessToken') !== undefined
  });

  if (!success) {
    console.error(`Login failed: ${response.status} ${response.body}`);
    errorRate.add(1);
    return null;
  }

  return response.json('data.accessToken');
}

/**
 * Check response status and track errors
 */
export function checkResponse(response, expectedStatus = 200, additionalChecks = {}) {
  const checks = {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    'response time < 500ms': (r) => r.timings.duration < 500,
    ...additionalChecks
  };

  const result = check(response, checks);

  if (!result) {
    errorRate.add(1);
  }

  return result;
}

/**
 * Generate random test data
 */
export function randomString(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function randomEmail() {
  return `test-${randomString(8)}@clenergize.com`;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomDate(start = new Date(2020, 0, 1), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

/**
 * Weighted random selection (for realistic user behavior)
 */
export function weightedRandom(weights) {
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of weights) {
    if (random < item.weight) {
      return item.value;
    }
    random -= item.weight;
  }

  return weights[weights.length - 1].value;
}

/**
 * Think time simulation (realistic user pauses)
 */
export function thinkTime(min = 1, max = 3) {
  sleep(randomInt(min, max));
}

/**
 * Batch request helper
 */
export function batchRequests(requests) {
  const responses = http.batch(requests);

  responses.forEach((response, index) => {
    checkResponse(response, 200, {
      [`batch request ${index} successful`]: (r) => r.status === 200
    });
  });

  return responses;
}

/**
 * Retry with exponential backoff
 */
export function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      return fn();
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }
      sleep(delay / 1000);
      delay *= 2;
    }
  }
}

/**
 * Performance assertions
 */
export function assertPerformance(response, maxDuration = 500) {
  const performanceCheck = check(response, {
    'response time acceptable': (r) => r.timings.duration < maxDuration,
    'DNS lookup < 50ms': (r) => r.timings.looking_up < 50,
    'TCP connection < 100ms': (r) => r.timings.connecting < 100,
    'TLS handshake < 100ms': (r) => r.timings.tls_handshaking < 100,
    'Time to first byte < 200ms': (r) => r.timings.waiting < 200
  });

  if (!performanceCheck) {
    console.warn(`Performance issue detected: ${response.url} took ${response.timings.duration}ms`);
  }

  return performanceCheck;
}

/**
 * Data validation helpers
 */
export function validateUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateISODate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString === date.toISOString();
}
