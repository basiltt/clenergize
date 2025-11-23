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
import { PasswordService } from '@clenergize/auth-lib';
import { EventBridgeEventBus } from '@clenergize/event-lib';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwksService } from './infrastructure/auth/jwks.service';
import { JwksAuthGuard, RolesGuard } from './infrastructure/auth/jwks-auth.guard';
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

    // JWT module - configured for RS256 with JWKS
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const privateKey = configService.get<string>('JWT_PRIVATE_KEY');
        const useJwks = !!configService.get<string>('JWKS_URI') || !!privateKey;

        // Use RS256 if we have JWKS or private key, otherwise fallback to HS256 for dev
        if (useJwks && privateKey) {
          return {
            privateKey,
            publicKey: configService.get<string>('JWT_PUBLIC_KEY'),
            signOptions: {
              algorithm: 'RS256',
              expiresIn: '1h',
              issuer: configService.get<string>('JWT_ISSUER') || 'clenergize-identity',
              audience: configService.get<string>('JWT_AUDIENCE') || 'clenergize-api',
              keyid: configService.get<string>('JWT_KEY_ID') || 'dev-key',
            },
          };
        }

        // Fallback for initial development (should be replaced with RS256)
        console.warn('⚠️  Using HS256 for JWT signing. Run "npm run generate-keys" to create RSA keys.');
        return {
          secret: configService.get<string>('JWT_SECRET') || 'temporary-dev-secret-run-generate-keys',
          signOptions: {
            algorithm: 'HS256',
            expiresIn: '1h',
            issuer: configService.get<string>('JWT_ISSUER') || 'clenergize-identity',
          },
        };
      },
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
    JwksService,
    JwksAuthGuard,
    RolesGuard,
    Reflector,
    CorrelationService,
    // Global authentication guard
    {
      provide: APP_GUARD,
      useClass: JwksAuthGuard,
    },
    // Global roles guard (runs after auth guard)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
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
