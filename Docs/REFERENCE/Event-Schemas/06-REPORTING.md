# Reporting Service Event Schemas

**Service**: Reporting Service
**Port**: 3006
**Event Count**: 6 types

---

## Reporting Service Events

### Event Types

```typescript
export type ReportingEvent =
  | ReportGenerationStartedEvent
  | ReportGenerationCompletedEvent
  | ReportGenerationFailedEvent
  | ReportScheduledEvent
  | ReportExportedEvent
  | DashboardRefreshedEvent
  | ExportStartedEvent
  | ExportCompletedEvent;
```

### Report Generation Completed Event

```typescript
export interface ReportGenerationCompletedEvent extends DomainEvent {
  type: 'reporting.report.generation-completed.v1';
  aggregateType: 'Report';
  data: {
    reportId: string;
    reportType: 'EMISSION_SUMMARY' | 'ACTIVITY_DETAIL' | 'COMPARISON' | 'AUDIT';
    projectId: string;
    period: {
      startDate: string;
      endDate: string;
    };
    format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
    fileUrl: string;
    fileSize: number; // bytes
    generationDuration: number; // milliseconds
    generatedBy: string;
    generatedAt: string;
    expiresAt?: string;
  };
}

export const ReportGenerationCompletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.report.generation-completed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Report'),
  correlationId: z.string().uuid(),
  data: z.object({
    reportId: z.string().uuid(),
    reportType: z.enum(['EMISSION_SUMMARY', 'ACTIVITY_DETAIL', 'COMPARISON', 'AUDIT']),
    projectId: z.string().uuid(),
    period: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime()
    }),
    format: z.enum(['PDF', 'EXCEL', 'CSV', 'JSON']),
    fileUrl: z.string().url(),
    fileSize: z.number().positive(),
    generationDuration: z.number().positive(),
    generatedBy: z.string().uuid(),
    generatedAt: z.string().datetime(),
    expiresAt: z.string().datetime().optional()
  })
});
```

### Report Exported Event

```typescript
export interface ReportExportedEvent extends DomainEvent {
  type: 'reporting.report.exported.v1';
  aggregateType: 'Report';
  data: {
    reportId: string;
    exportId: string;
    destination: 'S3' | 'EMAIL' | 'FTP' | 'WEBHOOK';
    destinationDetails: Record<string, any>;
    status: 'SUCCESS' | 'FAILED';
    error?: string;
    exportedBy: string;
    exportedAt: string;
  };
}

export const ReportExportedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.report.exported.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Report'),
  correlationId: z.string().uuid(),
  data: z.object({
    reportId: z.string().uuid(),
    exportId: z.string().uuid(),
    destination: z.enum(['S3', 'EMAIL', 'FTP', 'WEBHOOK']),
    destinationDetails: z.record(z.any()),
    status: z.enum(['SUCCESS', 'FAILED']),
    error: z.string().optional(),
    exportedBy: z.string().uuid(),
    exportedAt: z.string().datetime()
  })
});
```

### Report Generation Started Event

```typescript
export interface ReportGenerationStartedEvent extends DomainEvent {
  type: 'reporting.report.generation-started.v1';
  aggregateType: 'Report';
  data: {
    reportId: string;
    reportType: string;
    projectId: string;
    startedBy: string;
    timestamp: string;
  };
}

export const ReportGenerationStartedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.report.generation-started.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Report'),
  correlationId: z.string().uuid(),
  data: z.object({
    reportId: z.string().uuid(),
    reportType: z.string(),
    projectId: z.string().uuid(),
    startedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Report Generation Failed Event

```typescript
export interface ReportGenerationFailedEvent extends DomainEvent {
  type: 'reporting.report.generation-failed.v1';
  aggregateType: 'Report';
  data: {
    reportId: string;
    errorMessage: string;
    errorCode: string;
    timestamp: string;
  };
}

export const ReportGenerationFailedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.report.generation-failed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Report'),
  correlationId: z.string().uuid(),
  data: z.object({
    reportId: z.string().uuid(),
    errorMessage: z.string(),
    errorCode: z.string(),
    timestamp: z.string().datetime()
  })
});
```

### Report Scheduled Event

```typescript
export interface ReportScheduledEvent extends DomainEvent {
  type: 'reporting.report.scheduled.v1';
  aggregateType: 'ReportSchedule';
  data: {
    scheduleId: string;
    reportType: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    nextRunAt: string;
    recipients: string[];
    createdBy: string;
    timestamp: string;
  };
}

export const ReportScheduledEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.report.scheduled.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('ReportSchedule'),
  correlationId: z.string().uuid(),
  data: z.object({
    scheduleId: z.string().uuid(),
    reportType: z.string(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
    nextRunAt: z.string().datetime(),
    recipients: z.array(z.string().email()),
    createdBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Dashboard Refreshed Event

```typescript
export interface DashboardRefreshedEvent extends DomainEvent {
  type: 'reporting.dashboard.refreshed.v1';
  aggregateType: 'Dashboard';
  data: {
    dashboardId: string;
    projectId: string;
    refreshedAt: string;
    cacheKey: string;
    dataSources: string[];
  };
}

export const DashboardRefreshedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.dashboard.refreshed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Dashboard'),
  correlationId: z.string().uuid(),
  data: z.object({
    dashboardId: z.string().uuid(),
    projectId: z.string().uuid(),
    refreshedAt: z.string().datetime(),
    cacheKey: z.string(),
    dataSources: z.array(z.string())
  })
});
```

### Export Started Event

```typescript
export interface ExportStartedEvent extends DomainEvent {
  type: 'reporting.export.started.v1';
  aggregateType: 'Export';
  data: {
    exportId: string;
    exportType: 'ACTIVITY_DATA' | 'CALCULATIONS' | 'AGGREGATED';
    format: 'CSV' | 'EXCEL' | 'JSON';
    estimatedRows: number;
    startedBy: string;
    timestamp: string;
  };
}

export const ExportStartedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.export.started.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Export'),
  correlationId: z.string().uuid(),
  data: z.object({
    exportId: z.string().uuid(),
    exportType: z.enum(['ACTIVITY_DATA', 'CALCULATIONS', 'AGGREGATED']),
    format: z.enum(['CSV', 'EXCEL', 'JSON']),
    estimatedRows: z.number().int().nonnegative(),
    startedBy: z.string().uuid(),
    timestamp: z.string().datetime()
  })
});
```

### Export Completed Event

```typescript
export interface ExportCompletedEvent extends DomainEvent {
  type: 'reporting.export.completed.v1';
  aggregateType: 'Export';
  data: {
    exportId: string;
    fileUrl: string;
    fileSize: number;
    totalRows: number;
    duration: number; // ms
    timestamp: string;
  };
}

export const ExportCompletedEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('reporting.export.completed.v1'),
  version: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: z.literal('Export'),
  correlationId: z.string().uuid(),
  data: z.object({
    exportId: z.string().uuid(),
    fileUrl: z.string().url(),
    fileSize: z.number().positive(),
    totalRows: z.number().int().nonnegative(),
    duration: z.number().positive(),
    timestamp: z.string().datetime()
  })
});
```

---

