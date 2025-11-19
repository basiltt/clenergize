import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './infrastructure/http/controllers/health.controller';
import { AuthController } from './infrastructure/http/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { UserRepository } from './infrastructure/database/repositories/user.repository';
import { User, UserSchema } from './domain/entities/user.entity';
import { PasswordService, JwtAuthGuard, JwtStrategy } from '@clenergize/auth-lib';
import { ConfigService as ClenergizeConfigService, IdentityServiceConfigSchema } from '@clenergize/config-lib';
import { EventBridgeEventBus } from '@clenergize/event-lib';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { LocalJwtGuard } from './infrastructure/auth/local-jwt.guard';
import { CorrelationService } from './shared/correlation/correlation.service';
import { CorrelationMiddleware } from './infrastructure/http/middleware/correlation.middleware';

@Module({
  imports: [
    // Configuration module - loads .env files
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env'],
    }),

    // MongoDB module
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Register Mongoose schemas
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),

    // Passport module
    PassportModule,

    // JWT module
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
        signOptions: {
          expiresIn: '1h',
          issuer: configService.get<string>('JWT_ISSUER') || 'clenergize-identity',
        },
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),

    // Health check module
    TerminusModule,
  ],
  controllers: [HealthController, AuthController],
  providers: [
    AuthService,
    UserRepository,
    PasswordService,
    LocalJwtGuard,
    Reflector,
    CorrelationService,
    {
      provide: 'JWT_CONFIG',
      useFactory: (configService: ConfigService) => ({
        jwksUri: configService.get<string>('JWKS_URI'),
        issuer: configService.get<string>('JWT_ISSUER') || 'clenergize-identity',
        audience: configService.get<string>('JWT_AUDIENCE') || 'clenergize-api',
        secret: configService.get<string>('JWT_SECRET') || 'dev-jwt-secret-change-in-production-12345678',
      }),
      inject: [ConfigService],
    },
    {
      provide: JwtStrategy,
      useFactory: (jwtConfig: any) => new JwtStrategy(jwtConfig),
      inject: ['JWT_CONFIG'],
    },
    {
      provide: EventBridgeEventBus,
      useFactory: (configService: ConfigService) => {
        return new EventBridgeEventBus({
          region: configService.get<string>('AWS_REGION') || 'us-east-1',
          eventBusName: configService.get<string>('EVENT_BUS_NAME') || 'clenergize-event-bus',
          endpoint: configService.get<string>('LOCALSTACK_ENDPOINT'),
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationMiddleware)
      .forRoutes('*');
  }
}
