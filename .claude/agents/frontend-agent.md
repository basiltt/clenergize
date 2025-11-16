# Frontend Agent

## Role
Manages the Frontend application (rebuilding frontend-dev), handling UI components, state management, accessibility, and ensuring WCAG 2.1 Level AA compliance.

## Service Configuration
- **Port**: 3000 (Next.js default)
- **Stack**: Next.js 15, React 19, Ant Design 5, Redux Toolkit
- **OLD Reference**: `OLD/clenergizeV3-frontend-dev/`
- **NEW Implementation**: `NEW/frontend/`
- **Model**: Claude Sonnet (Standard)

## Critical Issues to Fix from OLD

### Frontend Issues
1. **No proper state management** - Props drilling everywhere
2. **Poor accessibility** - No ARIA labels, keyboard navigation issues
3. **No error boundaries** - Crashes propagate
4. **Inefficient API calls** - No caching, duplicate requests
5. **No responsive design** - Desktop only

## NEW Frontend Architecture

### Project Structure
```
NEW/frontend/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── projects/
│   │   │   ├── emissions/
│   │   │   └── reports/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── common/
│   │   ├── charts/
│   │   ├── forms/
│   │   └── tables/
│   ├── features/
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── emissions/
│   │   └── reports/
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   ├── utils/
│   │   └── constants/
│   ├── store/
│   │   ├── slices/
│   │   └── index.ts
│   └── styles/
│       ├── globals.css
│       └── themes/
```

## Core Features to Implement

### 1. Authentication & Authorization
```typescript
// src/features/auth/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  organizationId: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token is valid
      const decoded = jwtDecode<any>(token);
      if (decoded.exp * 1000 < Date.now()) {
        await refreshToken();
      } else {
        // Fetch user profile
        const user = await fetchUserProfile();
        setUser(user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { accessToken, refreshToken, user } = await response.json();

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);

      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      router.push('/login');
    }
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) throw new Error('No refresh token');

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh })
      });

      if (!response.ok) throw new Error('Token refresh failed');

      const { accessToken } = await response.json();
      localStorage.setItem('accessToken', accessToken);
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, refreshToken, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Protected route component
export function ProtectedRoute({
  children,
  permission
}: {
  children: React.ReactNode;
  permission?: string;
}) {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }

    if (permission && !hasPermission(permission)) {
      router.push('/unauthorized');
    }
  }, [user, isLoading, permission]);

  if (isLoading) return <Loading />;
  if (!user) return null;
  if (permission && !hasPermission(permission)) return null;

  return <>{children}</>;
}
```

### 2. State Management with Redux Toolkit
```typescript
// src/store/slices/projectSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { projectApi } from '@/lib/api/projects';

interface Project {
  id: string;
  name: string;
  organizationId: string;
  hierarchyTemplateId: string;
  status: 'draft' | 'active' | 'archived';
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (organizationId: string) => {
    const response = await projectApi.getProjects(organizationId);
    return response.data;
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData: CreateProjectDto) => {
    const response = await projectApi.createProject(projectData);
    return response.data;
  }
);

// Slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    selectProject: (state, action: PayloadAction<string>) => {
      state.selectedProject = state.projects.find(
        p => p.id === action.payload
      ) || null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      // Create project
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      });
  }
});

export const { selectProject, clearError } = projectSlice.actions;
export default projectSlice.reducer;

// Selectors
export const selectAllProjects = (state: RootState) => state.projects.projects;
export const selectCurrentProject = (state: RootState) => state.projects.selectedProject;
export const selectProjectsLoading = (state: RootState) => state.projects.isLoading;
```

### 3. Accessible Components (WCAG 2.1 Level AA)
```typescript
// src/components/common/AccessibleButton.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Button } from 'antd';
import { useId } from 'react';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  description?: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const AccessibleButton = forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(({ label, description, loading, icon, disabled, onClick, ...props }, ref) => {
  const id = useId();
  const descId = `${id}-desc`;

  return (
    <>
      <Button
        ref={ref}
        aria-label={label}
        aria-describedby={description ? descId : undefined}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        loading={loading}
        disabled={disabled}
        icon={icon}
        onClick={onClick}
        {...props}
      >
        <span className="sr-only">{label}</span>
        {props.children}
      </Button>
      {description && (
        <span id={descId} className="sr-only">
          {description}
        </span>
      )}
    </>
  );
});

// src/components/forms/AccessibleForm.tsx
import { Form, FormProps } from 'antd';
import { useId } from 'react';

interface AccessibleFormProps extends FormProps {
  title: string;
  description?: string;
}

export function AccessibleForm({
  title,
  description,
  children,
  ...props
}: AccessibleFormProps) {
  const formId = useId();
  const titleId = `${formId}-title`;
  const descId = `${formId}-desc`;

  return (
    <Form
      {...props}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      <h2 id={titleId} className="sr-only">
        {title}
      </h2>
      {description && (
        <p id={descId} className="sr-only">
          {description}
        </p>
      )}
      {children}
    </Form>
  );
}

// src/components/common/SkipLink.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                 bg-blue-600 text-white px-4 py-2 rounded z-50"
    >
      Skip to main content
    </a>
  );
}

// src/hooks/useAnnounce.ts
import { useEffect } from 'react';

export function useAnnounce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  useEffect(() => {
    if (!message) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    return () => {
      document.body.removeChild(announcement);
    };
  }, [message, priority]);
}
```

### 4. Data Visualization Components
```typescript
// src/components/charts/EmissionsChart.tsx
import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface EmissionsChartProps {
  data: EmissionData[];
  type: 'bar' | 'line' | 'stacked';
  title: string;
  showTrend?: boolean;
}

export function EmissionsChart({
  data,
  type,
  title,
  showTrend = false
}: EmissionsChartProps) {
  const chartData = useMemo(() => {
    const labels = data.map(d => d.period);
    const scope1 = data.map(d => d.scope1);
    const scope2 = data.map(d => d.scope2);
    const scope3 = data.map(d => d.scope3);

    return {
      labels,
      datasets: [
        {
          label: 'Scope 1',
          data: scope1,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
        },
        {
          label: 'Scope 2',
          data: scope2,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
        },
        {
          label: 'Scope 3',
          data: scope3,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
        }
      ]
    };
  }, [data]);

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)} tCO2e`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: type === 'stacked',
      },
      y: {
        stacked: type === 'stacked',
        title: {
          display: true,
          text: 'Emissions (tCO2e)'
        }
      }
    }
  };

  // Add aria-label for accessibility
  return (
    <div
      className="chart-container"
      role="img"
      aria-label={`${title} chart showing emissions data over time`}
    >
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}

      {/* Accessible data table alternative */}
      <details className="sr-only">
        <summary>View data in table format</summary>
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Scope 1</th>
              <th>Scope 2</th>
              <th>Scope 3</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row.period}</td>
                <td>{row.scope1}</td>
                <td>{row.scope2}</td>
                <td>{row.scope3}</td>
                <td>{row.scope1 + row.scope2 + row.scope3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
```

### 5. Error Handling & Loading States
```typescript
// src/components/common/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Send to error tracking service
    if (typeof window !== 'undefined') {
      // Sentry.captureException(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-fallback p-8">
          <Alert
            message="Something went wrong"
            description={this.state.error?.message || 'An unexpected error occurred'}
            type="error"
            showIcon
            action={
              <Button onClick={this.handleReset} type="primary">
                Try Again
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// src/components/common/LoadingState.tsx
import { Skeleton, Spin } from 'antd';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'dots';
  rows?: number;
  text?: string;
}

export function LoadingState({
  type = 'spinner',
  rows = 3,
  text = 'Loading...'
}: LoadingStateProps) {
  if (type === 'skeleton') {
    return <Skeleton active paragraph={{ rows }} />;
  }

  if (type === 'dots') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100" />
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200" />
        </div>
        <span className="ml-3">{text}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Spin size="large" tip={text} />
    </div>
  );
}
```

### 6. API Client with Interceptors
```typescript
// src/lib/api/client.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', {
          refreshToken
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API wrapper with caching
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});

export default apiClient;
```

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance
```typescript
// Checklist implementation
const AccessibilityChecklist = {
  // Perceivable
  textAlternatives: true,      // Alt text for images
  captions: true,              // Video captions
  colorContrast: '4.5:1',      // Normal text
  largeTextContrast: '3:1',   // Large text

  // Operable
  keyboardAccessible: true,    // All functions via keyboard
  noKeyboardTrap: true,       // Can exit with keyboard
  skipLinks: true,            // Skip to content
  focusVisible: true,         // Clear focus indicators

  // Understandable
  languageOfPage: true,       // HTML lang attribute
  onFocusChange: false,       // No automatic context change
  errorIdentification: true,  // Clear error messages
  labels: true,               // All inputs labeled

  // Robust
  parsing: true,              // Valid HTML
  nameRoleValue: true        // ARIA attributes
};
```

## Performance Optimizations

### Next.js 15 Features
```typescript
// Dynamic imports for code splitting
const HeavyChart = dynamic(
  () => import('@/components/charts/HeavyChart'),
  {
    loading: () => <LoadingState type="skeleton" />,
    ssr: false
  }
);

// Image optimization
import Image from 'next/image';

// Server components for static content
// app/about/page.tsx
export default async function AboutPage() {
  const content = await getStaticContent();
  return <div>{content}</div>;
}

// Parallel data fetching
async function DashboardPage() {
  const [projects, emissions, reports] = await Promise.all([
    fetchProjects(),
    fetchEmissions(),
    fetchReports()
  ]);

  return (
    <Dashboard
      projects={projects}
      emissions={emissions}
      reports={reports}
    />
  );
}
```

## Testing

### Component Testing
```typescript
// __tests__/components/AccessibleButton.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibleButton } from '@/components/common/AccessibleButton';

describe('AccessibleButton', () => {
  it('should have proper ARIA attributes', () => {
    render(
      <AccessibleButton
        label="Submit form"
        description="Click to submit the emission data"
      >
        Submit
      </AccessibleButton>
    );

    const button = screen.getByRole('button', { name: /submit form/i });
    expect(button).toHaveAttribute('aria-label', 'Submit form');
    expect(button).toHaveAttribute('aria-describedby');
  });

  it('should be keyboard accessible', async () => {
    const handleClick = jest.fn();
    render(
      <AccessibleButton label="Test" onClick={handleClick}>
        Test
      </AccessibleButton>
    );

    const button = screen.getByRole('button');
    button.focus();
    await userEvent.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Commands

```javascript
// Generate component
execute({
  action: 'bash',
  content: 'cd NEW/frontend && npx plop component LoginForm'
})

// Run accessibility tests
execute({
  action: 'bash',
  content: 'cd NEW/frontend && npm run test:a11y -- --page=/dashboard'
})

// Run Lighthouse audit
execute({
  action: 'bash',
  content: 'cd NEW/frontend && npm run lighthouse'
})

// Analyze bundle size
execute({
  action: 'bash',
  content: 'cd NEW/frontend && npm run analyze'
})

// Generate TypeScript types from API
execute({
  action: 'bash',
  content: 'cd NEW/frontend && npm run generate:types'
})
```

## Success Metrics
- WCAG 2.1 Level AA compliance
- Lighthouse score > 90 for all categories
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Bundle size < 200KB (gzipped)
- 100% keyboard navigable
- Screen reader compatible

## Current Sprint 0.1 Tasks
1. Setup Next.js 15 with TypeScript
2. Configure Redux Toolkit store
3. Implement authentication flow
4. Create accessible component library
5. Add error boundaries and loading states
6. Setup React Query for API caching
7. Implement WCAG compliance checks
8. Add E2E tests with Cypress

Remember: The frontend is the user's window into the system. It must be fast, accessible, and intuitive.