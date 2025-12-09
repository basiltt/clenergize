import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as winston from 'winston';

async function bootstrap() {
  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    }),
  });

  // Global prefix for all routes
  app.setGlobalPrefix('v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Swagger API documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Clenergize Audit Service')
      .setDescription('Audit Identity & Access Management API Compliance Service API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  // Get port from environment or default to 3007
  const port = process.env.PORT || 3007;

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);

  console.log(`
    🚀 Audit Service is running!
    📝 Environment: ${process.env.NODE_ENV || 'development'}
    🌐 Listening on: http://localhost:${port}
    📚 API Docs: http://localhost:${port}/api-docs
    🏥 Health Check: http://localhost:${port}/v1/health
  `);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Audit Service:', error);
  process.exit(1);
});
