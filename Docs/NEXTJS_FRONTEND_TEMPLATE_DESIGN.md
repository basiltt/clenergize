# Next.js Frontend Template Design

**Document Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: Design Phase - Week 4-5
**Author**: Frontend Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [State Management](#state-management)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Client](#api-client)
8. [Component Architecture](#component-architecture)
9. [Styling & Theming](#styling--theming)
10. [Accessibility](#accessibility)
11. [Performance Optimization](#performance-optimization)
12. [Testing Strategy](#testing-strategy)
13. [Build & Deployment](#build--deployment)
14. [Example Implementations](#example-implementations)

---

## 1. Executive Summary

### Purpose

This document provides a comprehensive blueprint for creating the Clenergize V3 frontend application using Next.js 15 and React 19. It establishes:
- **Modern architecture** with App Router and Server Components
- **Type-safe development** with TypeScript strict mode
- **Accessible design** meeting WCAG 2.1 Level AA standards
- **Performance-first** approach with optimized bundle sizes
- **Consistent patterns** for scalability and maintainability

### Technology Stack

```yaml
Framework: Next.js 15 (App Router)
Library: React 19
Language: TypeScript 5+ (strict mode)
State Management: Zustand 4+
Styling: Tailwind CSS 4+ with CSS Modules fallback
UI Components: shadcn/ui + Radix UI primitives
Forms: React Hook Form + Zod validation
Data Fetching: TanStack Query (React Query)
Authentication: NextAuth.js v5 (Auth.js)
Charts: Recharts + D3.js
Testing: Vitest + Testing Library + Playwright
Build Tool: Turbopack (Next.js 15 default)
```

### Key Features

```yaml
Performance:
  - Server Components by default
  - Streaming SSR with Suspense
  - Automatic code splitting
  - Image optimization
  - Route prefetching
  - Bundle size: <100KB initial JS

Accessibility:
  - WCAG 2.1 Level AA compliant
  - Keyboard navigation
  - Screen reader support
  - Focus management
  - ARIA attributes

Developer Experience:
  - TypeScript strict mode
  - ESLint + Prettier
  - Hot reload with Fast Refresh
  - Component storybook
  - Auto-generated API types

User Experience:
  - Optimistic UI updates
  - Error boundaries
  - Loading states
  - Offline support
  - Progressive Web App (PWA)
```

---

## 2. Technology Stack

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.3.3",

    // State Management
    "zustand": "^4.4.7",
    "immer": "^10.0.3",

    // Data Fetching
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.5",

    // Forms & Validation
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.3",

    // Authentication
    "next-auth": "^5.0.0-beta.4",

    // UI Components
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tooltip": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",

    // Charts
    "recharts": "^2.10.3",
    "d3": "^7.8.5",

    // Utilities
    "date-fns": "^3.0.6",
    "lodash-es": "^4.17.21",
    "nanoid": "^5.0.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",

    // Testing
    "vitest": "^1.1.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@playwright/test": "^1.40.1",

    // Linting & Formatting
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "prettier": "^3.1.1",
    "prettier-plugin-tailwindcss": "^0.5.10",

    // Build Tools
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",

    // Storybook
    "@storybook/react": "^7.6.6",
    "@storybook/addon-a11y": "^7.6.6"
  }
}
```

### Feature Comparison: Pages Router vs App Router

| Feature | Pages Router (OLD) | App Router (NEW) | Benefit |
|---------|-------------------|------------------|---------|
| **Rendering** | CSR by default | Server Components by default | 85% less JS shipped |
| **Data Fetching** | getServerSideProps | async components | Simpler, more intuitive |
| **Layouts** | Manual wrapper components | Layout components | Automatic, persistent |
| **Loading States** | Manual with useState | Suspense boundaries | Better UX, less code |
| **Error Handling** | Error pages | Error boundaries | Granular error handling |
| **Streaming** | Not supported | Built-in | Progressive rendering |
| **Metadata** | Manual Head component | Metadata API | SEO-friendly, type-safe |

**Decision**: Use App Router for all new development.

---

## 3. Project Structure

### Folder Organization

```
frontend/
├── src/
│   ├── app/                        # App Router (routes)
│   │   ├── (auth)/                 # Auth group (login, register)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/            # Dashboard group (protected)
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── error.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── activity/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── profile/
│   │   │   │   └── organization/
│   │   │   └── layout.tsx
│   │   ├── api/                    # API routes (for NextAuth, webhooks)
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── route.ts
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── loading.tsx             # Root loading
│   │   ├── error.tsx               # Root error
│   │   └── not-found.tsx           # 404 page
│   │
│   ├── components/                 # React components
│   │   ├── ui/                     # Base UI components (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   ├── forms/                  # Form components
│   │   │   ├── login-form.tsx
│   │   │   ├── project-form.tsx
│   │   │   ├── activity-form.tsx
│   │   │   └── ...
│   │   ├── charts/                 # Chart components
│   │   │   ├── emission-chart.tsx
│   │   │   ├── trend-chart.tsx
│   │   │   └── ...
│   │   ├── layouts/                # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── ...
│   │   ├── features/               # Feature-specific components
│   │   │   ├── projects/
│   │   │   │   ├── project-list.tsx
│   │   │   │   ├── project-card.tsx
│   │   │   │   └── ...
│   │   │   ├── activity/
│   │   │   │   ├── activity-table.tsx
│   │   │   │   ├── activity-row.tsx
│   │   │   │   └── ...
│   │   │   └── reports/
│   │   │       ├── report-viewer.tsx
│   │   │       └── ...
│   │   └── shared/                 # Shared components
│   │       ├── loading-spinner.tsx
│   │       ├── error-message.tsx
│   │       ├── empty-state.tsx
│   │       └── ...
│   │
│   ├── lib/                        # Utilities & configuration
│   │   ├── api/                    # API client
│   │   │   ├── client.ts
│   │   │   ├── endpoints/
│   │   │   │   ├── projects.ts
│   │   │   │   ├── activity.ts
│   │   │   │   └── ...
│   │   │   └── types.ts
│   │   ├── auth/                   # Auth configuration
│   │   │   ├── config.ts
│   │   │   ├── provider.tsx
│   │   │   └── guards.ts
│   │   ├── utils/                  # Utility functions
│   │   │   ├── cn.ts               # Class name merger
│   │   │   ├── format.ts           # Formatters
│   │   │   ├── validation.ts       # Validators
│   │   │   └── ...
│   │   ├── hooks/                  # Custom hooks
│   │   │   ├── use-user.ts
│   │   │   ├── use-projects.ts
│   │   │   ├── use-debounce.ts
│   │   │   └── ...
│   │   └── constants/              # Constants
│   │       ├── routes.ts
│   │       ├── permissions.ts
│   │       └── ...
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── ui-store.ts
│   │   ├── project-store.ts
│   │   └── ...
│   │
│   ├── types/                      # TypeScript types
│   │   ├── api.types.ts
│   │   ├── models.types.ts
│   │   ├── components.types.ts
│   │   └── ...
│   │
│   ├── styles/                     # Global styles
│   │   ├── globals.css
│   │   ├── fonts.css
│   │   └── themes/
│   │       ├── light.css
│   │       └── dark.css
│   │
│   └── middleware.ts               # Next.js middleware
│
├── public/                         # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── tests/                          # Tests
│   ├── unit/
│   │   ├── components/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       ├── auth.spec.ts
│       ├── projects.spec.ts
│       └── ...
│
├── .storybook/                     # Storybook configuration
│   ├── main.ts
│   ├── preview.ts
│   └── ...
│
├── .github/                        # GitHub workflows
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
│
├── docker/                         # Docker files
│   ├── Dockerfile
│   └── nginx.conf
│
├── .env.example                    # Environment template
├── .eslintrc.json                  # ESLint config
├── .prettierrc                     # Prettier config
├── next.config.js                  # Next.js config
├── tailwind.config.ts              # Tailwind config
├── tsconfig.json                   # TypeScript config
├── vitest.config.ts                # Vitest config
├── playwright.config.ts            # Playwright config
└── package.json                    # Dependencies
```

### File Naming Conventions

```yaml
Pages (App Router): page.tsx, layout.tsx, loading.tsx, error.tsx
  Example: app/projects/page.tsx

Components: kebab-case.tsx
  Example: project-card.tsx, emission-chart.tsx

Hooks: use-*.ts
  Example: use-projects.ts, use-debounce.ts

Stores: *-store.ts
  Example: auth-store.ts, ui-store.ts

Types: *.types.ts
  Example: api.types.ts, models.types.ts

Tests: *.test.tsx (unit), *.spec.ts (e2e)
  Example: button.test.tsx, auth.spec.ts

Stories: *.stories.tsx
  Example: button.stories.tsx
```

---

## 4. Architecture Patterns

### 4.1 Component Hierarchy

```
App Router Page (Server Component)
  ├─ Layout (Server Component)
  │   ├─ Header (Server Component with Client Islands)
  │   │   ├─ UserMenu (Client Component)
  │   │   └─ Notifications (Client Component)
  │   ├─ Sidebar (Server Component with Client Islands)
  │   │   └─ NavLinks (Client Component)
  │   └─ Main Content Area
  │       └─ Page Content (Server Component)
  │           ├─ Data Fetching (Server)
  │           └─ Interactive UI (Client Components)
  │               ├─ Forms
  │               ├─ Charts
  │               └─ Tables
  └─ Error Boundary (error.tsx)
      └─ Loading Boundary (loading.tsx)
```

### 4.2 Server vs Client Components

**Server Components** (Default):
```typescript
// app/projects/page.tsx
import { getProjects } from '@/lib/api/endpoints/projects';
import { ProjectList } from '@/components/features/projects/project-list';

// This runs on the server
export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Projects</h1>
      {/* Client component with server-fetched data */}
      <ProjectList projects={projects} />
    </div>
  );
}
```

**Client Components** (Interactive):
```typescript
// components/features/projects/project-list.tsx
'use client';

import { useState } from 'react';
import { Project } from '@/types/models.types';
import { ProjectCard } from './project-card';

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search projects..."
        className="mb-4 w-full"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

### 4.3 Data Fetching Patterns

**Pattern 1: Server Component Fetch**

```typescript
// app/projects/[id]/page.tsx
import { getProject } from '@/lib/api/endpoints/projects';
import { notFound } from 'next/navigation';

export default async function ProjectDetailPage({
  params
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
    </div>
  );
}
```

**Pattern 2: Client Component with React Query**

```typescript
// components/features/projects/project-emissions.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectEmissions } from '@/lib/api/endpoints/projects';
import { EmissionChart } from '@/components/charts/emission-chart';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ErrorMessage } from '@/components/shared/error-message';

interface ProjectEmissionsProps {
  projectId: string;
}

export function ProjectEmissions({ projectId }: ProjectEmissionsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['project-emissions', projectId],
    queryFn: () => getProjectEmissions(projectId),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return <EmissionChart data={data} />;
}
```

**Pattern 3: Streaming with Suspense**

```typescript
// app/projects/[id]/page.tsx
import { Suspense } from 'react';
import { ProjectHeader } from '@/components/features/projects/project-header';
import { ProjectEmissions } from '@/components/features/projects/project-emissions';
import { ProjectActivity } from '@/components/features/projects/project-activity';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <div>
      {/* Renders immediately */}
      <Suspense fallback={<LoadingSpinner />}>
        <ProjectHeader projectId={params.id} />
      </Suspense>

      {/* Streams in when ready */}
      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200" />}>
        <ProjectEmissions projectId={params.id} />
      </Suspense>

      {/* Streams in independently */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200" />}>
        <ProjectActivity projectId={params.id} />
      </Suspense>
    </div>
  );
}
```

### 4.4 Error Handling

**Error Boundaries** (`error.tsx`):

```typescript
// app/projects/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ProjectsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Projects page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
        <p className="mb-4 text-gray-600">{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
```

**Global Error** (`app/global-error.tsx`):

```typescript
'use client';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
```

---

## 5. State Management

### 5.1 Zustand Store Pattern

**Auth Store**:

```typescript
// stores/auth-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,

        // Actions
        setUser: (user) => {
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
          });
        },

        setAccessToken: (token) => {
          set((state) => {
            state.accessToken = token;
          });
        },

        logout: () => {
          set((state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
          });
        },

        checkAuth: async () => {
          set((state) => {
            state.isLoading = true;
          });

          try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
              const user = await response.json();
              get().setUser(user);
            } else {
              get().logout();
            }
          } catch (error) {
            console.error('Auth check failed:', error);
            get().logout();
          } finally {
            set((state) => {
              state.isLoading = false;
            });
          }
        }
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          accessToken: state.accessToken,
          user: state.user
        })
      }
    ),
    { name: 'AuthStore' }
  )
);
```

**UI Store**:

```typescript
// stores/ui-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  devtools(
    immer((set) => ({
      // State
      sidebarOpen: true,
      theme: 'light',
      notifications: [],

      // Actions
      toggleSidebar: () => {
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        });
      },

      setSidebarOpen: (open) => {
        set((state) => {
          state.sidebarOpen = open;
        });
      },

      setTheme: (theme) => {
        set((state) => {
          state.theme = theme;
        });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      addNotification: (notification) => {
        set((state) => {
          state.notifications.push({
            ...notification,
            id: notification.id || `notif-${Date.now()}`
          });
        });
      },

      removeNotification: (id) => {
        set((state) => {
          state.notifications = state.notifications.filter((n) => n.id !== id);
        });
      }
    })),
    { name: 'UIStore' }
  )
);
```

### 5.2 Store Selectors

```typescript
// hooks/use-auth.ts
import { useAuthStore } from '@/stores/auth-store';
import { useShallow } from 'zustand/react/shallow';

// Optimized selector - only re-renders when user changes
export function useUser() {
  return useAuthStore((state) => state.user);
}

// Multiple values with shallow comparison
export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      logout: state.logout
    }))
  );
}

// Computed values
export function useUserPermissions() {
  return useAuthStore((state) => {
    if (!state.user) return [];
    return state.user.roles.flatMap((role) => getRolePermissions(role));
  });
}
```

---

## 6. Authentication & Authorization

### 6.1 NextAuth.js Configuration

```typescript
// lib/auth/config.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const response = await fetch(`${process.env.API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          return {
            id: data.data.user.id,
            email: data.data.user.email,
            name: `${data.data.user.firstName} ${data.data.user.lastName}`,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken
          };
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.userId = user.id;
      }

      // Return previous token if not expired
      if (Date.now() < token.exp * 1000) {
        return token;
      }

      // Token expired - refresh
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.userId = token.userId;
      session.error = token.error;

      return session;
    }
  },

  pages: {
    signIn: '/login',
    error: '/auth/error'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  }
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${process.env.API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: token.refreshToken
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return {
      ...token,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken ?? token.refreshToken,
      exp: Math.floor(Date.now() / 1000) + 15 * 60 // 15 minutes
    };
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError'
    };
  }
}
```

### 6.2 Protected Routes

**Middleware** (`middleware.ts`):

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Protected routes require authentication
  if (!req.auth) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

**Route Guards**:

```typescript
// lib/auth/guards.ts
import { redirect } from 'next/navigation';
import { auth } from './config';

export async function requireAuth() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();
  const user = await getUserFromSession(session);

  const hasRole = user.roles.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    redirect('/unauthorized');
  }

  return user;
}

// Usage in Server Component
export default async function AdminPage() {
  await requireRole(['ADMIN']);

  return <div>Admin Content</div>;
}
```

---

## 7. API Client

### 7.1 Axios Client Configuration

```typescript
// lib/api/client.ts
import axios, { AxiosError, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    // Add correlation ID
    config.headers['X-Correlation-ID'] = crypto.randomUUID();

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Extract data from success response
    return response.data.data;
  },
  async (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Extract error message
    const errorMessage =
      (error.response?.data as any)?.error?.message || 'An error occurred';

    throw new Error(errorMessage);
  }
);

export default apiClient;
```

### 7.2 API Endpoints

```typescript
// lib/api/endpoints/projects.ts
import apiClient from '../client';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/types/models.types';

export const projectsApi = {
  // Get all projects for organization
  getProjects: (organizationId: string): Promise<Project[]> => {
    return apiClient.get('/api/v1/projects', {
      params: { organizationId }
    });
  },

  // Get single project
  getProject: (id: string): Promise<Project> => {
    return apiClient.get(`/api/v1/projects/${id}`);
  },

  // Create project
  createProject: (data: CreateProjectDto): Promise<Project> => {
    return apiClient.post('/api/v1/projects', data);
  },

  // Update project
  updateProject: (id: string, data: UpdateProjectDto): Promise<Project> => {
    return apiClient.put(`/api/v1/projects/${id}`, data);
  },

  // Delete project
  deleteProject: (id: string): Promise<void> => {
    return apiClient.delete(`/api/v1/projects/${id}`);
  },

  // Get project emissions
  getProjectEmissions: (id: string, year: number): Promise<EmissionData[]> => {
    return apiClient.get(`/api/v1/projects/${id}/emissions`, {
      params: { year }
    });
  }
};
```

### 7.3 React Query Integration

```typescript
// lib/hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/endpoints/projects';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

export function useProjects() {
  const organizationId = useAuthStore((state) => state.user?.organizationId);

  return useQuery({
    queryKey: ['projects', organizationId],
    queryFn: () => projectsApi.getProjects(organizationId!),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getProject(id),
    enabled: !!id
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const addNotification = useUIStore((state) => state.addNotification);

  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: (data) => {
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      // Show success notification
      addNotification({
        type: 'success',
        title: 'Project created',
        message: `${data.name} has been created successfully`
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Failed to create project',
        message: error.message
      });
    }
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const addNotification = useUIStore((state) => state.addNotification);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) =>
      projectsApi.updateProject(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['project', id] });

      // Snapshot previous value
      const previousProject = queryClient.getQueryData(['project', id]);

      // Optimistically update
      queryClient.setQueryData(['project', id], (old: Project) => ({
        ...old,
        ...data
      }));

      return { previousProject };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(['project', id], context?.previousProject);

      addNotification({
        type: 'error',
        title: 'Failed to update project',
        message: error.message
      });
    },
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Project updated',
        message: 'Changes saved successfully'
      });
    },
    onSettled: (_, __, { id }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    }
  });
}
```

---

## 8. Component Architecture

### 8.1 Component Composition

**Base UI Component** (shadcn pattern):

```typescript
// components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

**Form Component**:

```typescript
// components/forms/project-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProject } from '@/lib/hooks/use-projects';

const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  reportingYear: z.number().min(2020).max(2100),
  organizationId: z.string().uuid()
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  organizationId: string;
  onSuccess?: () => void;
}

export function ProjectForm({ organizationId, onSuccess }: ProjectFormProps) {
  const createProject = useCreateProject();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      reportingYear: new Date().getFullYear(),
      organizationId
    }
  });

  async function onSubmit(data: ProjectFormValues) {
    try {
      await createProject.mutateAsync(data);
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="My Project" {...field} />
              </FormControl>
              <FormDescription>
                Choose a descriptive name for your project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Project description..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reportingYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reporting Year</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createProject.isPending}>
          {createProject.isPending ? 'Creating...' : 'Create Project'}
        </Button>
      </form>
    </Form>
  );
}
```

**Chart Component**:

```typescript
// components/charts/emission-chart.tsx
'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { EmissionData } from '@/types/models.types';

interface EmissionChartProps {
  data: EmissionData[];
  title?: string;
}

export function EmissionChart({ data, title }: EmissionChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
      scope1: item.scope1,
      scope2: item.scope2,
      scope3: item.scope3,
      total: item.scope1 + item.scope2 + item.scope3
    }));
  }, [data]);

  return (
    <div className="rounded-lg border bg-card p-6">
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis label={{ value: 'tCO2e', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="scope1"
            stroke="#ef4444"
            name="Scope 1"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="scope2"
            stroke="#f59e0b"
            name="Scope 2"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="scope3"
            stroke="#3b82f6"
            name="Scope 3"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            name="Total"
            strokeWidth={3}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## 9. Styling & Theming

### 9.1 Tailwind CSS Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)']
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')]
};

export default config;
```

### 9.2 CSS Variables (Theme)

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 9.3 Theme Switcher

```typescript
// components/shared/theme-toggle.tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

---

## 10. Accessibility

### 10.1 WCAG 2.1 Level AA Compliance

**Checklist**:

```yaml
Perceivable:
  - ✅ Text alternatives for non-text content
  - ✅ Captions for videos
  - ✅ Color contrast ratio ≥4.5:1 for normal text
  - ✅ Color contrast ratio ≥3:1 for large text
  - ✅ Text can be resized up to 200%
  - ✅ Images of text avoided when possible

Operable:
  - ✅ All functionality available via keyboard
  - ✅ No keyboard traps
  - ✅ Focus visible for all interactive elements
  - ✅ Skip navigation links
  - ✅ Descriptive page titles
  - ✅ Logical focus order

Understandable:
  - ✅ Language of page identified
  - ✅ Consistent navigation
  - ✅ Form labels and instructions
  - ✅ Error identification and suggestions
  - ✅ Consistent identification

Robust:
  - ✅ Valid HTML
  - ✅ ARIA attributes used correctly
  - ✅ Compatible with assistive technologies
```

### 10.2 Accessible Components

**Skip Navigation**:

```typescript
// components/shared/skip-nav.tsx
export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded focus:bg-primary focus:p-4 focus:text-primary-foreground"
    >
      Skip to main content
    </a>
  );
}
```

**Accessible Form**:

```typescript
// components/forms/accessible-input.tsx
import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        <Input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />
        {helperText && !error && (
          <p id={helperId} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';
```

**Accessible Dialog**:

```typescript
// All Radix UI components are accessible by default
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

// Automatically includes:
// - Proper ARIA attributes
// - Focus trap
// - Escape key handling
// - Click outside to close
// - Screen reader announcements
```

### 10.3 Keyboard Navigation

```typescript
// components/shared/keyboard-shortcuts.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ctrl/Cmd + K: Search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Open search modal
      }

      // G + P: Go to Projects
      if (event.key === 'g') {
        const nextKey = prompt('Navigate to: (p)rojects, (a)ctivity, (r)eports');
        if (nextKey === 'p') router.push('/projects');
        if (nextKey === 'a') router.push('/activity');
        if (nextKey === 'r') router.push('/reports');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null;
}
```

---

## 11. Performance Optimization

### 11.1 Bundle Size Optimization

**Next.js Configuration**:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60
  },

  // Bundle analyzer (dev only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true
        })
      );
      return config;
    }
  }),

  // React compiler (experimental)
  experimental: {
    reactCompiler: true,
    after: true
  }
};

module.exports = nextConfig;
```

**Dynamic Imports**:

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const EmissionChart = dynamic(
  () => import('@/components/charts/emission-chart').then((mod) => mod.EmissionChart),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-200" />,
    ssr: false // Don't render on server
  }
);

const PDFViewer = dynamic(() => import('@/components/shared/pdf-viewer'), {
  loading: () => <p>Loading PDF viewer...</p>,
  ssr: false
});
```

### 11.2 Image Optimization

```typescript
// Using Next.js Image component
import Image from 'next/image';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="rounded-lg border">
      <Image
        src={project.imageUrl}
        alt={project.name}
        width={400}
        height={300}
        className="rounded-t-lg"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..." // Low-quality placeholder
        priority={false} // Lazy load
      />
      <div className="p-4">
        <h3>{project.name}</h3>
      </div>
    </div>
  );
}
```

### 11.3 Route Prefetching

```typescript
// Automatic prefetching with Link component
import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      {/* Prefetches on hover */}
      <Link href="/projects" prefetch={true}>
        Projects
      </Link>

      {/* No prefetch (for dynamic routes) */}
      <Link href="/projects/new" prefetch={false}>
        New Project
      </Link>
    </nav>
  );
}
```

### 11.4 Caching Strategy

```typescript
// Server Component with caching
export const revalidate = 3600; // Revalidate every hour

export default async function ProjectsPage() {
  const projects = await fetch(`${API_URL}/projects`, {
    next: {
      revalidate: 3600, // Cache for 1 hour
      tags: ['projects'] // For on-demand revalidation
    }
  }).then((res) => res.json());

  return <ProjectList projects={projects} />;
}

// On-demand revalidation
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const { tag } = await request.json();
  revalidateTag(tag);
  return Response.json({ revalidated: true, now: Date.now() });
}
```

### 11.5 Performance Monitoring

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 12. Testing Strategy

### 12.1 Unit Testing with Vitest

```typescript
// components/ui/button.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders different variants', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Cancel</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });
});
```

### 12.2 Component Testing

```typescript
// components/forms/project-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectForm } from './project-form';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ProjectForm', () => {
  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<ProjectForm organizationId="org123" />, { wrapper: createWrapper() });

    // Submit without filling fields
    await user.click(screen.getByRole('button', { name: /create project/i }));

    // Expect validation errors
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(<ProjectForm organizationId="org123" onSuccess={onSuccess} />, {
      wrapper: createWrapper()
    });

    // Fill form
    await user.type(screen.getByLabelText(/project name/i), 'Test Project');
    await user.type(screen.getByLabelText(/description/i), 'Test description');

    // Submit
    await user.click(screen.getByRole('button', { name: /create project/i }));

    // Expect success
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

### 12.3 E2E Testing with Playwright

```typescript
// tests/e2e/projects.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/projects');
  });

  test('should create a new project', async ({ page }) => {
    // Click new project button
    await page.click('text=New Project');

    // Fill form
    await page.fill('[name="name"]', 'E2E Test Project');
    await page.fill('[name="description"]', 'Created by E2E test');
    await page.selectOption('[name="reportingYear"]', '2024');

    // Submit
    await page.click('button[type="submit"]');

    // Verify creation
    await expect(page).toHaveURL(/\/projects\/[\w-]+/);
    await expect(page.locator('h1')).toContainText('E2E Test Project');
  });

  test('should display project list', async ({ page }) => {
    await page.goto('/projects');

    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-card"]');

    // Verify at least one project is displayed
    const projectCards = await page.locator('[data-testid="project-card"]').count();
    expect(projectCards).toBeGreaterThan(0);
  });

  test('should filter projects by search', async ({ page }) => {
    await page.goto('/projects');

    // Type in search
    await page.fill('[placeholder="Search projects..."]', 'Test');

    // Verify filtered results
    await expect(page.locator('[data-testid="project-card"]')).toContainText('Test');
  });
});
```

### 12.4 Test Configuration

**Vitest Config** (`vitest.config.ts`):

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/types/**'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

---

## 13. Build & Deployment

### 13.1 Environment Variables

```bash
# .env.example

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GATEWAY_URL=http://localhost:3000

# Authentication
NEXTAUTH_URL=http://localhost:3005
NEXTAUTH_SECRET=your-secret-key-here

# AWS Cognito
COGNITO_CLIENT_ID=your-cognito-client-id
COGNITO_CLIENT_SECRET=your-cognito-client-secret
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_REPORTS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Build
NODE_ENV=production
```

### 13.2 Docker Configuration

**Dockerfile**:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: clenergize-frontend
    ports:
      - '3005:3000'
    environment:
      - NEXT_PUBLIC_API_URL=http://gateway:3000
      - NEXTAUTH_URL=http://localhost:3005
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - gateway
    networks:
      - clenergize

networks:
  clenergize:
    external: true
```

### 13.3 CI/CD Pipeline

**GitHub Actions** (`.github/workflows/frontend.yml`):

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Lint
        working-directory: ./frontend
        run: npm run lint

      - name: Type check
        working-directory: ./frontend
        run: npm run type-check

      - name: Unit tests
        working-directory: ./frontend
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Install Playwright
        working-directory: ./frontend
        run: npx playwright install --with-deps

      - name: Run E2E tests
        working-directory: ./frontend
        run: npm run test:e2e

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/

  build:
    needs: [test, e2e]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: nextjs-build
          path: frontend/.next

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./frontend
```

---

## 14. Example Implementations

### 14.1 Complete Page Example

```typescript
// app/(dashboard)/projects/[id]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth/guards';
import { getProject } from '@/lib/api/endpoints/projects';
import { ProjectHeader } from '@/components/features/projects/project-header';
import { ProjectEmissions } from '@/components/features/projects/project-emissions';
import { ProjectActivity } from '@/components/features/projects/project-activity';
import { ProjectSettings } from '@/components/features/projects/project-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);

  return {
    title: project?.name || 'Project',
    description: project?.description
  };
}

export default async function ProjectDetailPage({
  params
}: {
  params: { id: string };
}) {
  await requireAuth();

  const project = await getProject(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="container py-8">
      <Suspense fallback={<div className="h-32 animate-pulse bg-gray-200" />}>
        <ProjectHeader project={project} />
      </Suspense>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity Data</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectEmissions projectId={params.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectActivity projectId={params.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ProjectSettings project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 14.2 Package.json

```json
{
  "name": "clenergize-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3005",
    "build": "next build",
    "start": "next start -p 3005",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "format": "prettier --write \"src/**/*.{js,ts,jsx,tsx,json,css,md}\"",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

---

## Summary

This Next.js Frontend Template Design provides a comprehensive blueprint for building the Clenergize V3 frontend with:

1. **Modern Stack** - Next.js 15 App Router with React 19 Server Components
2. **Type Safety** - TypeScript strict mode with Zod validation
3. **State Management** - Zustand with immer for immutable updates
4. **Accessibility** - WCAG 2.1 Level AA compliance with Radix UI primitives
5. **Performance** - Sub-100KB initial JS, streaming SSR, automatic code splitting
6. **Developer Experience** - Hot reload, Storybook, comprehensive testing
7. **Production Ready** - Docker, CI/CD, monitoring, error boundaries

### Quick Start

```bash
# 1. Create project
npx create-next-app@latest clenergize-frontend --typescript --tailwind --app

# 2. Install dependencies
cd clenergize-frontend
npm install zustand @tanstack/react-query next-auth

# 3. Set up shadcn/ui
npx shadcn-ui@latest init

# 4. Configure environment
cp .env.example .env.local

# 5. Start development
npm run dev

# 6. Run tests
npm run test
npm run test:e2e

# 7. Build for production
npm run build
npm start
```

### Next Steps

1. ✅ **Completed**: Next.js Frontend Template Design
2. **Next**: Shared Packages Design
3. **Next**: CI/CD Pipeline Templates

---

**Document Complete**: November 18, 2025
