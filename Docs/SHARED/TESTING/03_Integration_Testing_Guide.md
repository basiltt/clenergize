# Integration Testing Guide - Clenergize V3 ESG Platform

**Version**: 1.0.0
**Last Updated**: November 22, 2025
**Coverage Target**: 70% minimum
**Framework**: Jest + Supertest + TestContainers

## Quick Reference

```bash
npm run test:integration  # Run all integration tests
npm run test:int:watch   # Watch mode
```

## What Are Integration Tests?

Integration tests verify that multiple components work together:
- API endpoints (Controller + Service + Repository)
- Database operations (real MongoDB/Redis)
- Event publishing and consumption
- External service integrations (mocked)

## Test Structure with TestContainers

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { GenericContainer } from 'testcontainers';
import * as request from 'supertest';

describe('UserController (Integration)', () => {
  let app: INestApplication;
  let mongoContainer: StartedTestContainer;

  beforeAll(async () => {
    mongoContainer = await new GenericContainer('mongo:7.0')
      .withExposedPorts(27017)
      .start();

    const moduleFixture = await Test.createTestingModule({
      imports: [UserModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoContainer.stop();
  });

  it('should create user via API', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({ email: 'test@example.com', password: 'Pass123!' })
      .expect(201);

    expect(response.body.data.email).toBe('test@example.com');
  });
});
```

## Key Patterns

**TestContainers** - Spin up real databases for tests
**Supertest** - HTTP request testing
**Transaction Rollback Testing** - Verify database consistency
**Event Publishing** - Verify events are published correctly

## Best Practices

1. Use real databases via TestContainers
2. Isolate test data between tests
3. Test authentication on protected endpoints
4. Test all HTTP status codes (200, 201, 400, 401, 404, 409, 500)
5. Clean up containers in afterAll

## Additional Resources

- [Unit Testing Guide](02_Unit_Testing_Guide.md)
- [E2E Testing Guide](05_E2E_Testing_Guide.md)
- [TestContainers Documentation](https://testcontainers.com)
