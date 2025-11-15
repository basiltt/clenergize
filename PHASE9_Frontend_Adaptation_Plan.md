# Frontend Adaptation Plan - Clenergize V3

## Executive Summary

This document outlines the frontend adaptation strategy for integrating the existing Next.js 15/React 19 application with the new microservices architecture. The plan follows a moderate refactoring approach with service-specific clients, maintaining the current UI while updating the data and API layers.

## Current Frontend Architecture

### Technology Stack
- **Framework**: Next.js 15.0.3
- **UI Library**: React 19.0.0
- **Component Library**: Ant Design 5.22.4
- **State Management**: Redux Toolkit 2.3.0
- **Charts**: Chart.js 4.4.6
- **Forms**: React Hook Form 7.54.0
- **HTTP Client**: Axios (to be replaced)
- **Routing**: Next.js App Router

### Current API Integration Issues
1. Direct API calls scattered throughout components
2. No service abstraction layer
3. Hardcoded endpoints
4. Inconsistent error handling
5. No request/response interceptors
6. Token management mixed with business logic
7. No proper cache invalidation

## Target Frontend Architecture

### Service Client Architecture
```
Frontend Application
├── API Client Layer
│   ├── BaseAPIClient (shared HTTP abstraction)
│   └── Service Clients
│       ├── IdentityClient
│       ├── OrganizationClient
│       ├── ReferenceClient
│       ├── ActivityClient
│       ├── CalculationClient
│       ├── ReportingClient
│       └── AuditClient
├── State Management (Redux)
│   ├── Auth Slice
│   ├── Organization Slice
│   ├── Activity Slice
│   └── Dashboard Slice
└── UI Components (React)
    ├── Pages
    ├── Features
    └── Common
```

### Design Principles
1. **Service Isolation**: Each microservice has dedicated client built on BaseAPIClient
2. **Type Safety**: TypeScript interfaces for all API contracts
3. **Security First**: HttpOnly cookies, no localStorage for tokens
4. **Error Normalization**: Consistent error model across all services
5. **Progressive Enhancement**: Features work with partial service availability
6. **No Direct HTTP**: UI never calls fetch directly, always through clients

## API Migration Mapping

### Authentication Flow Changes

#### Current (Broken)
```typescript
// Direct calls, JWT not verified, stored insecurely
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  localStorage.setItem('token', response.token); // INSECURE - XSS vulnerable
};
```

#### New (Secure)
```typescript
// Via IdentityClient built on BaseAPIClient
class IdentityClient {
  constructor(private baseClient: BaseAPIClient) {}

  async login(email: string, password: string): Promise<LoginResult> {
    // BaseAPIClient handles the request
    // Backend sets HttpOnly, Secure cookie on success
    const result = await this.baseClient.post('/auth/login', {
      email,
      password
    });

    // Returns normalized result (user profile or AuthError)
    return result;
  }

  async getCurrentUser(): Promise<UserProfile | AuthError> {
    // No token handling - cookies managed by browser
    return await this.baseClient.get('/auth/me');
  }

  async logout(): Promise<void> {
    // Backend clears HttpOnly cookies
    await this.baseClient.post('/auth/logout');
  }
}
```

### Service Endpoint Mapping

| Current Endpoint | New Service | New Endpoint | Breaking Changes |
|-----------------|-------------|--------------|------------------|
| `/api/auth/*` | Identity Service | `/api/v1/auth/*` | Token in cookie, not header |
| `/api/projects/*` | Organization Service | `/api/v1/projects/*` | Hierarchy structure changed |
| `/api/factors/*` | Reference Service | `/api/v1/emission-factors/*` | New QC workflow |
| `/api/activities/*` | Activity Service | `/api/v1/activities/*` | Validation required |
| `/api/calculations/*` | Calculation Service | `/api/v1/calculations/*` | Async processing |
| `/api/reports/*` | Reporting Service | `/api/v1/reports/*` | WebSocket for real-time |

## Implementation Phases

### Phase 1: Core Infrastructure (Sprint 1.1-1.2)

#### Epic: CLNZ-60 - Frontend Service Clients (15 points)

**Story: CLNZ-601 - Base API Client** (3 points)
```typescript
// lib/api/base-api-client.ts
export class BaseAPIClient {
  private baseURL: string;
  private timeout: number = 10000; // 10 seconds default

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  protected async request<T>(config: RequestConfig): Promise<Result<T>> {
    // 1. Construct request with headers
    // 2. Add correlation ID (X-Request-Id)
    // 3. Execute with timeout and abort support
    // 4. Normalize errors into categories:
    //    - AuthError (401/403)
    //    - ValidationError (400 with field errors)
    //    - NotFoundError (404)
    //    - RateLimitError (429)
    //    - ServerError (5xx)
    //    - NetworkError (timeout, DNS failure)
    // 5. Return typed Result<T> or Error
  }

  // Note: No token attachment - cookies handled by browser
  // Note: Retry only for idempotent GET on transient errors
  // Note: No localStorage usage - security first
}
```

**Story: CLNZ-602 - Identity Client Implementation** (3 points)
- Login/logout (cookies managed by backend)
- getCurrentUser (no token exposure)
- refreshSession (if needed)
- changePassword
- requestPasswordReset/confirmPasswordReset
- updateProfile
- All methods use BaseAPIClient's error model

**Story: CLNZ-603 - Error Handling Framework** (2 points)
- Global error boundary
- Service-specific error handlers
- User-friendly error messages
- Retry mechanisms
- Fallback UI states

**Story: CLNZ-604 - Type Definitions** (2 points)
- OpenAPI to TypeScript generation
- Shared DTO interfaces
- Response type mappings
- Enum definitions

**Story: CLNZ-605 - Redux Integration** (3 points)
- RTK Query setup
- Auth slice migration
- Cache invalidation logic
- Optimistic updates

**Story: CLNZ-606 - Auth Guard Components** (2 points)
```tsx
// components/guards/AuthGuard.tsx
export function AuthGuard({ children, requiredPermission }) {
  const { isAuthenticated, permissions } = useAuth();

  if (!isAuthenticated) return <LoginRedirect />;
  if (!hasPermission(permissions, requiredPermission)) {
    return <AccessDenied />;
  }

  return children;
}
```

### Phase 2: Feature Migration (Sprint 2.1-2.4)

#### Epic: CLNZ-61 - Activity UI Updates (10 points)

**Story: CLNZ-611 - Activity Form Refactor** (3 points)
- New validation rules
- File upload to S3
- Auto-save functionality
- Field-level errors

**Story: CLNZ-612 - Bulk Import UI** (3 points)
- Template download
- Mapping interface
- Progress tracking
- Error report display

**Story: CLNZ-613 - Activity Search Interface** (2 points)
- Advanced filters
- Saved searches
- Export functionality

**Story: CLNZ-614 - Calculation Status UI** (2 points)
- Job queue visualization
- Progress indicators
- Result display
- Error handling

### Phase 3: Dashboard & Reporting (Sprint 3.1-3.2)

#### Epic: CLNZ-62 - Dashboard Modernization (Included in Reporting)

**Story: CLNZ-621 - WebSocket Integration** (3 points)
```typescript
// lib/websocket/dashboard-socket.ts
export class DashboardSocket {
  private socket: Socket;

  connect(dashboardId: string): void {
    this.socket = io('/dashboards', {
      query: { dashboardId },
      transports: ['websocket'],
      reconnection: true
    });

    this.socket.on('update', this.handleUpdate);
    this.socket.on('error', this.handleError);
  }

  private handleUpdate(data: DashboardUpdate): void {
    // Redux dispatch
    store.dispatch(updateWidget(data));
  }
}
```

**Story: CLNZ-622 - Chart Component Updates** (2 points)
- Real-time data binding
- Responsive design
- Export functionality
- Drill-down capability

### Phase 4: Polish & Migration (Sprint 4.2)

#### Epic: CLNZ-63 - Frontend Cutover (5 points)

**Story: CLNZ-631 - Feature Flags Implementation** (2 points)
```typescript
// lib/features/feature-flags.ts
export const FeatureFlags = {
  USE_NEW_AUTH: process.env.NEXT_PUBLIC_USE_NEW_AUTH === 'true',
  USE_NEW_CALC: process.env.NEXT_PUBLIC_USE_NEW_CALC === 'true',
  USE_NEW_HIERARCHY: process.env.NEXT_PUBLIC_USE_NEW_HIERARCHY === 'true'
};

// Usage in components
if (FeatureFlags.USE_NEW_AUTH) {
  return <NewAuthFlow />;
} else {
  return <LegacyAuthFlow />;
}
```

**Story: CLNZ-632 - A/B Testing Setup** (1 point)
- User segmentation
- Metrics tracking
- Rollback capability

**Story: CLNZ-633 - Performance Optimization** (2 points)
- Bundle size reduction
- Lazy loading
- CDN configuration
- Image optimization

## Component Migration Strategy

### High-Priority Components (Phase 1)
1. **Login/Register Forms** - New auth flow
2. **Navigation/Header** - New permission model
3. **Project Selector** - Reference-based hierarchy
4. **User Profile** - New user management

### Medium-Priority Components (Phase 2)
1. **Activity Forms** - New validation
2. **Import Wizard** - New bulk import
3. **Calculation Status** - Async processing
4. **Hierarchy Tree** - Reference model

### Low-Priority Components (Phase 3)
1. **Dashboards** - WebSocket updates
2. **Reports** - New generation engine
3. **Settings** - New configuration model
4. **Audit Log Viewer** - New audit service

## Error Handling & Fallbacks

### Service Degradation Matrix

| Service Down | User Impact | Fallback Strategy |
|-------------|------------|-------------------|
| Identity | Cannot login | Show maintenance message |
| Organization | Limited navigation | Cache last known structure |
| Reference | Cannot calculate | Use cached factors with warning |
| Activity | Cannot submit data | Queue locally, sync later |
| Calculation | No new results | Show last calculation with timestamp |
| Reporting | No new reports | Show cached reports |
| Audit | No audit logs | Log locally, batch upload later |

### Error Recovery Flows
```typescript
// lib/error-recovery/circuit-breaker.ts
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: Date;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  async execute<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        return fallback();
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      return fallback();
    }
  }
}
```

## Testing Strategy

### Unit Tests (Component Level)
```typescript
// __tests__/components/ActivityForm.test.tsx
describe('ActivityForm', () => {
  it('should validate required fields', async () => {
    const { getByRole, getByText } = render(<ActivityForm />);

    fireEvent.click(getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(getByText(/quantity is required/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockActivityClient.create.mockRejectedValueOnce(new Error('Network error'));

    // Test error boundary and retry logic
  });
});
```

### Integration Tests (Service Client Level)
```typescript
// __tests__/integration/identity-client.test.ts
describe('IdentityClient', () => {
  it('should refresh token automatically', async () => {
    const client = new IdentityClient();

    // Mock expired token
    mockJWT.isExpired.mockReturnValue(true);

    await client.getProfile();

    expect(mockRefreshToken).toHaveBeenCalled();
  });
});
```

### E2E Tests (Critical Flows)
```typescript
// cypress/e2e/critical-flows.cy.ts
describe('Critical User Flows', () => {
  it('should complete activity submission flow', () => {
    cy.login();
    cy.visit('/activities/new');

    cy.fillActivityForm({
      quantity: 100,
      unit: 'kg',
      date: '2024-01-01'
    });

    cy.intercept('POST', '/api/v1/activities', { statusCode: 201 });
    cy.get('[data-testid=submit]').click();

    cy.url().should('include', '/activities');
    cy.contains('Activity created successfully');
  });
});
```

## Performance Considerations

### Bundle Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['antd', '@ant-design/icons']
  },

  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        framework: {
          name: 'framework',
          chunks: 'all',
          test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom)[\\/]/
        },
        lib: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)[\\/]/);
            return `npm.${packageName[1].replace('@', '')}`;
          }
        }
      }
    };
    return config;
  }
};
```

### Caching Strategy
```typescript
// lib/cache/service-cache.ts
export class ServiceCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      etag: generateETag(data)
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}
```

## Migration Timeline

### Month 3 (Phase 1)
- Week 1-2: Base infrastructure (clients, error handling)
- Week 3-4: Auth integration, core components

### Month 4 (Phase 1 cont.)
- Week 1-2: Organization UI updates
- Week 3-4: Reference data UI, testing

### Month 5 (Phase 2)
- Week 1-2: Activity forms and import
- Week 3-4: Calculation UI integration

### Month 6 (Phase 2 cont.)
- Week 1-2: Results display, aggregation UI
- Week 3-4: Testing and bug fixes

### Month 7 (Phase 3)
- Week 1-2: Dashboard WebSocket integration
- Week 3-4: Report generation UI

### Month 8 (Phase 4)
- Week 1-2: Feature flags, A/B testing
- Week 3-4: Final cutover, monitoring

## Success Metrics

### Performance KPIs
- First Contentful Paint: < 1.2s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- API response time (p95): < 500ms
- Bundle size: < 250KB (initial)

### Quality Metrics
- TypeScript coverage: 100%
- Test coverage: > 80%
- Accessibility score: > 95
- Lighthouse score: > 90

### User Experience Metrics
- Task completion rate: > 95%
- Error rate: < 1%
- Session duration: +20%
- User satisfaction: > 4.5/5

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| API contract mismatch | High | OpenAPI spec validation, contract tests |
| Performance regression | Medium | Bundle analysis, lazy loading |
| Breaking changes | High | Feature flags, gradual rollout |
| State management complexity | Medium | RTK Query, normalized state |
| WebSocket instability | Medium | Fallback to polling, reconnection logic |

## Conclusion

This frontend adaptation plan provides a structured approach to migrating the Next.js application to work with the new microservices architecture. By implementing service clients, improving error handling, and using feature flags for gradual rollout, we minimize risk while modernizing the frontend to match the backend improvements.

The plan allocates approximately 35 story points across all phases, with the majority of work in Phase 1 to establish the foundation. This represents about 6.5% of the total project effort, which is appropriate given we're adapting rather than rebuilding the frontend.