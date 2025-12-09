import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../src/domain/entities/user.entity';

describe('Authentication Integration Tests', () => {
  let app: INestApplication;
  let userModel: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    await app.init();

    userModel = moduleFixture.get(getModelToken(User.name));
  });

  afterAll(async () => {
    // Clean up test data
    await userModel.deleteMany({});
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await userModel.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'Test@1234',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validUser)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: validUser.email,
        firstName: validUser.firstName,
        lastName: validUser.lastName,
        fullName: 'John Doe',
        roles: ['USER'],
        status: 'PENDING',
        emailVerified: false,
      });

      expect(response.body).not.toHaveProperty('passwordHash');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 409 when email already exists', async () => {
      // Register first user
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validUser);

      // Try to register again with same email
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validUser)
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });

    it('should validate email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...validUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should validate password strength', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...validUser,
          password: 'weak',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should require all mandatory fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          // Missing password, firstName, lastName
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should include correlation ID in response headers', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validUser);

      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-correlation-id']).toMatch(
        /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
      );
    });

    it('should forward custom correlation ID', async () => {
      const customCorrelationId = 'test-correlation-123';

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('X-Correlation-Id', customCorrelationId)
        .send(validUser);

      expect(response.headers['x-correlation-id']).toBe(customCorrelationId);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const userCredentials = {
      email: 'test@example.com',
      password: 'Test@1234',
    };

    beforeEach(async () => {
      // Register a user for login tests
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...userCredentials,
          firstName: 'John',
          lastName: 'Doe',
        });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(userCredentials)
        .expect(200);

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        tokenType: 'Bearer',
        expiresIn: expect.any(Number),
      });

      expect(response.body.user).toMatchObject({
        id: expect.any(String),
        email: userCredentials.email,
      });

      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 401 with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@1234',
        })
        .expect(401);

      expect(response.body.message).toBeDefined();
    });

    it('should return 401 with invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: userCredentials.email,
          password: 'WrongPassword@123',
        })
        .expect(401);

      expect(response.body.message).toBeDefined();
    });

    it('should lock account after 5 failed attempts', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: userCredentials.email,
            password: 'WrongPassword@123',
          })
          .expect(401);
      }

      // 6th attempt should fail with locked account message
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password, // Even with correct password
        })
        .expect(401);

      expect(response.body.message).toContain('locked');
    });

    it('should record IP address on successful login', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(userCredentials)
        .expect(200);

      const user = await userModel.findOne({ email: userCredentials.email });
      expect(user.lastLoginIp).toBeDefined();
      expect(user.lastLoginAt).toBeDefined();
    });

    it('should reset failed attempts on successful login', async () => {
      // Make 3 failed attempts
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: userCredentials.email,
            password: 'WrongPassword@123',
          });
      }

      // Successful login
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(userCredentials)
        .expect(200);

      const user = await userModel.findOne({ email: userCredentials.email });
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.lockedUntil).toBeUndefined();
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let accessToken: string;
    const userCredentials = {
      email: 'test@example.com',
      password: 'Test@1234',
    };

    beforeEach(async () => {
      // Register and login to get access token
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...userCredentials,
          firstName: 'John',
          lastName: 'Doe',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(userCredentials);

      accessToken = loginResponse.body.accessToken;
    });

    it('should return current user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: userCredentials.email,
        roles: ['USER'],
      });

      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 401 without authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });

    it('should return 401 with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    let accessToken: string;
    const userCredentials = {
      email: 'test@example.com',
      password: 'Test@1234',
    };

    beforeEach(async () => {
      // Register and login
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...userCredentials,
          firstName: 'John',
          lastName: 'Doe',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(userCredentials);

      accessToken = loginResponse.body.accessToken;
    });

    it('should change password successfully with valid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'Test@1234',
          newPassword: 'NewTest@5678',
        })
        .expect(204);

      // Verify can login with new password
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: userCredentials.email,
          password: 'NewTest@5678',
        })
        .expect(200);

      expect(loginResponse.body.accessToken).toBeDefined();
    });

    it('should return 401 with incorrect current password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword@123',
          newPassword: 'NewTest@5678',
        })
        .expect(401);
    });

    it('should validate new password strength', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'Test@1234',
          newPassword: 'weak',
        })
        .expect(400);
    });

    it('should require authorization', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .send({
          currentPassword: 'Test@1234',
          newPassword: 'NewTest@5678',
        })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
          firstName: 'John',
          lastName: 'Doe',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should logout successfully with valid token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should require authorization', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .expect(401);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        info: expect.any(Object),
        details: expect.any(Object),
      });
    });

    it('should be accessible without authentication', async () => {
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);
    });
  });
});
