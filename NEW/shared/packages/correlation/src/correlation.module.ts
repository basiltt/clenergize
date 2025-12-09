import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CorrelationService } from './correlation.service';
import { CorrelationMiddleware } from './correlation.middleware';
import { CorrelationInterceptor, GlobalCorrelationInterceptor } from './correlation.interceptor';
import { CorrelationLogger } from './correlation.logger';
import { CorrelationConfig } from './correlation.interfaces';

/**
 * Module for correlation ID tracking and distributed tracing
 */
@Global()
@Module({})
export class CorrelationModule {
  /**
   * Register correlation module with custom configuration
   */
  static forRoot(config?: Partial<CorrelationConfig>): DynamicModule {
    return {
      module: CorrelationModule,
      providers: [
        {
          provide: 'CORRELATION_CONFIG',
          useValue: {
            enabled: true,
            correlationHeader: 'x-correlation-id',
            causationHeader: 'x-causation-id',
            generateIfMissing: true,
            logCorrelation: process.env.NODE_ENV !== 'production',
            includeInResponse: true,
            ...config,
          } as CorrelationConfig,
        },
        {
          provide: CorrelationService,
          useFactory: (correlationConfig: CorrelationConfig) => {
            return new CorrelationService(correlationConfig);
          },
          inject: ['CORRELATION_CONFIG'],
        },
        {
          provide: CorrelationLogger,
          useFactory: (correlationService: CorrelationService) => {
            return new CorrelationLogger(
              correlationService,
              process.env.SERVICE_NAME
            );
          },
          inject: [CorrelationService],
        },
        CorrelationMiddleware,
        CorrelationInterceptor,
      ],
      exports: [
        CorrelationService,
        CorrelationLogger,
        CorrelationMiddleware,
        CorrelationInterceptor,
      ],
    };
  }

  /**
   * Register correlation module with global interceptor
   */
  static forRootWithInterceptor(
    config?: Partial<CorrelationConfig>
  ): DynamicModule {
    return {
      module: CorrelationModule,
      providers: [
        {
          provide: 'CORRELATION_CONFIG',
          useValue: {
            enabled: true,
            correlationHeader: 'x-correlation-id',
            causationHeader: 'x-causation-id',
            generateIfMissing: true,
            logCorrelation: process.env.NODE_ENV !== 'production',
            includeInResponse: true,
            ...config,
          } as CorrelationConfig,
        },
        {
          provide: CorrelationService,
          useFactory: (correlationConfig: CorrelationConfig) => {
            return new CorrelationService(correlationConfig);
          },
          inject: ['CORRELATION_CONFIG'],
        },
        {
          provide: CorrelationLogger,
          useFactory: (correlationService: CorrelationService) => {
            return new CorrelationLogger(
              correlationService,
              process.env.SERVICE_NAME
            );
          },
          inject: [CorrelationService],
        },
        CorrelationMiddleware,
        CorrelationInterceptor,
        {
          provide: APP_INTERCEPTOR,
          useClass: GlobalCorrelationInterceptor,
        },
      ],
      exports: [
        CorrelationService,
        CorrelationLogger,
        CorrelationMiddleware,
        CorrelationInterceptor,
      ],
    };
  }

  /**
   * Register for feature modules (uses root configuration)
   */
  static forFeature(): DynamicModule {
    return {
      module: CorrelationModule,
      exports: [CorrelationService, CorrelationLogger],
    };
  }
}