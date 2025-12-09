import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './infrastructure/http/controllers/health.controller';

@Module({
  imports: [
    // Configuration module - loads .env files
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env'],
      validate: (config) => {
        // Basic validation - will be enhanced with Zod later
        const required = ['NODE_ENV', 'PORT', 'MONGODB_URI'];
        const missing = required.filter((key) => !config[key]);

        if (missing.length > 0) {
          throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        return config;
      },
    }),

    // Health check module
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
