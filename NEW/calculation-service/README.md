# Calculation Service

> Clenergize Emission Calculation Service

## Overview

provides:

- Emission calculations
- Aggregation engine
- Carbon footprint computation
- Uncertainty calculations
- Historical calculations

- User registration and management
- JWT-based authentication with JWKS verification
- Multi-factor authentication (MFA)
- Role-based access control (RBAC)
- Session management
- Password policies and account security

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev

# Run tests
npm test

# Run with coverage
npm run test:cov
```

## API Documentation

When running in development mode, Swagger API documentation is available at:
- http://localhost:3005/api-docs

## Health Checks

- **General Health**: http://localhost:3005/v1/health
- **Liveness Probe**: http://localhost:3005/v1/health/live
- **Readiness Probe**: http://localhost:3005/v1/health/ready

## Architecture

This service follows Clean Architecture principles with Domain-Driven Design (DDD):

```
src/
├── domain/         # Business logic (entities, value objects, domain services)
├── application/    # Use cases (commands, queries, event handlers)
├── infrastructure/ # External interfaces (HTTP, database, messaging)
└── shared/         # Shared utilities and configuration
```

## Environment Variables

See `.env.example` for all required environment variables.

Critical variables:
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection URL
- `COGNITO_USER_POOL_ID` - AWS Cognito User Pool ID
- `COGNITO_JWKS_URI` - JWKS endpoint for JWT verification

## Security

### JWT Verification

This service implements proper JWT signature verification using JWKS:
- Fetches public keys from Cognito JWKS endpoint
- Verifies RS256 signatures
- Validates exp, iss, aud, and nbf claims
- Implements key caching and rotation

### Secrets Management

In production:
- All secrets stored in AWS Secrets Manager
- No default fallbacks
- Secrets rotated every 90 days

In development:
- LocalStack simulates AWS Secrets Manager
- Use `.env.local` for local overrides

## Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

Target coverage: 80% (enforced in CI/CD)

## License

Proprietary - Clenergize
