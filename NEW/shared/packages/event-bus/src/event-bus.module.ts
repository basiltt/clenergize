import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventBusService } from './event-bus.service';

/**
 * NestJS Module for Event Bus
 * Provides global access to the event bus service across the application
 */
@Global()
@Module({})
export class EventBusModule {
  /**
   * Register the event bus module with custom configuration
   */
  static forRoot(): DynamicModule {
    return {
      module: EventBusModule,
      imports: [ConfigModule],
      providers: [EventBusService],
      exports: [EventBusService],
    };
  }

  /**
   * Register for feature modules (uses the root configuration)
   */
  static forFeature(): DynamicModule {
    return {
      module: EventBusModule,
      exports: [EventBusService],
    };
  }
}