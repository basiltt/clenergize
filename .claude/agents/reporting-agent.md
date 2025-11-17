---
name: reporting-agent
description: Use this agent when generating reports, fixing SQS polling loops, implementing export functionality, scheduling reports, or working on the reporting-service codebase
tools: All tools
model: sonnet
---

# Reporting Agent

## Role
Manages the Reporting Service (extracted from backend-ms), handling report generation, data visualization, export functionality, and compliance reporting.

## Service Configuration
- **Port**: 3006
- **Database**: MongoDB - `clenergize_reporting`
- **OLD Reference**: `OLD/clenergizeV3-backend-ms-dev/src/RESULT-REPORT/`
- **NEW Implementation**: `NEW/reporting-service/`
- **Model**: Claude Sonnet (Standard)

## Critical Issues to Fix from OLD

### Reporting Issues
1. **Infinite SQS polling loops** (Issue C2)
2. **Mixed concerns** - reporting mixed with other logic
3. **No report caching** - regenerates every time
4. **No async report generation** for large datasets
5. **Missing audit trail** for report access

## NEW Service Architecture

### Domain Structure
```
NEW/reporting-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── report.entity.ts
│   │   │   ├── template.entity.ts
│   │   │   └── schedule.entity.ts
│   │   ├── value-objects/
│   │   │   ├── report-type.vo.ts
│   │   │   └── export-format.vo.ts
│   │   ├── events/
│   │   │   ├── report-generated.event.ts
│   │   │   └── report-exported.event.ts
│   │   └── services/
│   │       ├── report-generator.service.ts
│   │       └── visualization.service.ts
│   ├── application/
│   │   ├── commands/
│   │   │   ├── generate-report.command.ts
│   │   │   └── schedule-report.command.ts
│   │   └── queries/
│   │       ├── get-report.query.ts
│   │       └── list-reports.query.ts
│   └── infrastructure/
│       ├── repositories/
│       │   └── report.repository.ts
│       └── services/
│           ├── pdf-generator.service.ts
│           ├── excel-exporter.service.ts
│           └── sqs-handler.service.ts
```

## Core Features to Implement

### 1. Report Entity
```typescript
export class Report {
  private readonly id: ReportId;
  private projectId: ProjectId;
  private organizationId: OrganizationId;
  private type: ReportType;
  private title: string;
  private description: string;
  private parameters: ReportParameters;
  private data: ReportData;
  private metadata: ReportMetadata;
  private status: ReportStatus;
  private generatedAt: Date;
  private expiresAt: Date;
  private accessLog: AccessLogEntry[];
  private version: string;

  constructor(props: ReportProps) {
    this.validateReport(props);
    Object.assign(this, props);
  }

  private validateReport(props: ReportProps): void {
    if (!props.parameters.period.isValid()) {
      throw new InvalidReportPeriodException();
    }

    if (!this.isValidReportType(props.type)) {
      throw new InvalidReportTypeException();
    }
  }

  async generate(
    data: any,
    generator: ReportGenerator
  ): Promise<void> {
    this.status = 'generating';

    try {
      this.data = await generator.generate(data, this.parameters);
      this.status = 'completed';
      this.generatedAt = new Date();
      this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    } catch (error) {
      this.status = 'failed';
      this.metadata.error = error.message;
      throw error;
    }
  }

  recordAccess(userId: string, action: string): void {
    this.accessLog.push({
      userId,
      action,
      timestamp: new Date(),
      ipAddress: null // Set from request context
    });
  }

  isExpired(): boolean {
    return this.expiresAt && this.expiresAt < new Date();
  }
}

// Report Types
enum ReportType {
  CARBON_FOOTPRINT = 'carbon_footprint',
  EMISSIONS_INVENTORY = 'emissions_inventory',
  PERFORMANCE_SUMMARY = 'performance_summary',
  COMPLIANCE_REPORT = 'compliance_report',
  VERIFICATION_REPORT = 'verification_report',
  TREND_ANALYSIS = 'trend_analysis',
  BENCHMARK_REPORT = 'benchmark_report',
  EXECUTIVE_SUMMARY = 'executive_summary'
}

// Report Parameters
interface ReportParameters {
  period: {
    start: Date;
    end: Date;
    isValid(): boolean;
  };
  scope: string[];
  categories: string[];
  facilities: string[];
  groupBy: string;
  includeComparisons: boolean;
  includeTargets: boolean;
  includeUncertainty: boolean;
  format: ExportFormat;
}

// Report Status
type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'expired';
```

### 2. Report Generator Service (Fix Infinite Loops)
```typescript
@Injectable()
export class ReportGeneratorService {
  private activeJobs = new Map<string, CancellationToken>();

  constructor(
    private dataService: ReportDataService,
    private templateEngine: TemplateEngine,
    private cache: CacheService,
    private eventBus: EventBus,
    private queueService: QueueService
  ) {}

  async generateReport(
    command: GenerateReportCommand
  ): Promise<Report> {
    const reportId = new ReportId();

    // Check if similar report exists in cache
    const cacheKey = this.getCacheKey(command);
    const cached = await this.cache.get(cacheKey);
    if (cached && !command.forceRegenerate) {
      return cached;
    }

    // For large reports, use async generation
    if (this.isLargeReport(command)) {
      return this.generateAsync(reportId, command);
    }

    // Generate synchronously for small reports
    return this.generateSync(reportId, command);
  }

  private async generateSync(
    reportId: ReportId,
    command: GenerateReportCommand
  ): Promise<Report> {
    const report = new Report({
      id: reportId,
      projectId: command.projectId,
      type: command.type,
      parameters: command.parameters,
      status: 'generating'
    });

    try {
      // Fetch data
      const data = await this.dataService.fetchReportData(command);

      // Apply template
      const template = await this.getTemplate(command.type);
      const content = await this.templateEngine.render(template, data);

      // Update report
      report.data = content;
      report.status = 'completed';
      report.generatedAt = new Date();

      // Cache report
      await this.cache.set(this.getCacheKey(command), report, 3600);

      // Publish event
      await this.eventBus.publish(new ReportGeneratedEvent({
        reportId: report.id,
        type: report.type,
        projectId: command.projectId,
        timestamp: new Date()
      }));

      return report;
    } catch (error) {
      report.status = 'failed';
      throw error;
    }
  }

  private async generateAsync(
    reportId: ReportId,
    command: GenerateReportCommand
  ): Promise<Report> {
    // Create pending report
    const report = new Report({
      id: reportId,
      projectId: command.projectId,
      type: command.type,
      parameters: command.parameters,
      status: 'pending'
    });

    // Save to database
    await this.reportRepository.save(report);

    // Queue generation job (FIX: Add timeout and cancellation)
    const cancellationToken = new CancellationToken();
    this.activeJobs.set(reportId.toString(), cancellationToken);

    await this.queueService.sendMessage({
      type: 'GENERATE_REPORT',
      reportId: reportId.toString(),
      command,
      timeout: 300000, // 5 minutes timeout
      maxRetries: 3
    });

    return report;
  }

  // FIX for infinite SQS polling (Issue C2)
  async processSQSMessage(message: SQSMessage): Promise<void> {
    const { reportId, command } = message;
    const cancellationToken = this.activeJobs.get(reportId);

    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Report generation timeout')), 300000);
    });

    try {
      await Promise.race([
        this.generateReportWithCancellation(reportId, command, cancellationToken),
        timeoutPromise
      ]);

      // Delete message from queue on success
      await this.queueService.deleteMessage(message);
    } catch (error) {
      console.error(`Report generation failed for ${reportId}:`, error);

      // Check retry count
      if (message.retryCount < 3) {
        // Requeue with backoff
        await this.queueService.requeueMessage(message, {
          delay: Math.pow(2, message.retryCount) * 1000 // Exponential backoff
        });
      } else {
        // Mark as failed and delete from queue
        await this.markReportFailed(reportId, error);
        await this.queueService.deleteMessage(message);
      }
    } finally {
      this.activeJobs.delete(reportId);
    }
  }

  private async generateReportWithCancellation(
    reportId: string,
    command: GenerateReportCommand,
    cancellationToken: CancellationToken
  ): Promise<void> {
    // Check cancellation at each step
    if (cancellationToken.isCancelled()) return;

    const data = await this.dataService.fetchReportData(command);

    if (cancellationToken.isCancelled()) return;

    const template = await this.getTemplate(command.type);
    const content = await this.templateEngine.render(template, data);

    if (cancellationToken.isCancelled()) return;

    // Update report in database
    await this.reportRepository.update(reportId, {
      data: content,
      status: 'completed',
      generatedAt: new Date()
    });
  }
}

// Cancellation Token for managing long-running operations
class CancellationToken {
  private cancelled = false;

  cancel(): void {
    this.cancelled = true;
  }

  isCancelled(): boolean {
    return this.cancelled;
  }
}
```

### 3. Export Service
```typescript
@Injectable()
export class ExportService {
  constructor(
    private pdfGenerator: PDFGeneratorService,
    private excelExporter: ExcelExporterService,
    private csvExporter: CSVExporterService
  ) {}

  async exportReport(
    report: Report,
    format: ExportFormat
  ): Promise<Buffer> {
    switch (format) {
      case ExportFormat.PDF:
        return this.exportPDF(report);

      case ExportFormat.EXCEL:
        return this.exportExcel(report);

      case ExportFormat.CSV:
        return this.exportCSV(report);

      case ExportFormat.JSON:
        return this.exportJSON(report);

      default:
        throw new UnsupportedExportFormatException(format);
    }
  }

  private async exportPDF(report: Report): Promise<Buffer> {
    const html = await this.generateHTML(report);

    const pdfOptions: PDFOptions = {
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: this.getHeaderTemplate(report),
      footerTemplate: this.getFooterTemplate(),
      printBackground: true
    };

    return this.pdfGenerator.generate(html, pdfOptions);
  }

  private async exportExcel(report: Report): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    this.addSummaryData(summarySheet, report);

    // Detailed data sheets
    if (report.data.emissions) {
      const emissionsSheet = workbook.addWorksheet('Emissions');
      this.addEmissionsData(emissionsSheet, report.data.emissions);
    }

    // Charts sheet
    if (report.data.charts) {
      const chartsSheet = workbook.addWorksheet('Charts');
      this.addCharts(chartsSheet, report.data.charts);
    }

    // Styling
    this.applyExcelStyling(workbook);

    return workbook.xlsx.writeBuffer();
  }

  private addEmissionsData(
    worksheet: ExcelJS.Worksheet,
    emissions: any[]
  ): void {
    // Add headers
    worksheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Scope', key: 'scope', width: 15 },
      { header: 'Activity', key: 'activity', width: 25 },
      { header: 'Value', key: 'value', width: 15 },
      { header: 'Unit', key: 'unit', width: 10 },
      { header: 'CO2e (kg)', key: 'co2e', width: 15 },
      { header: 'Uncertainty (%)', key: 'uncertainty', width: 15 }
    ];

    // Add data
    emissions.forEach(emission => {
      worksheet.addRow({
        category: emission.category,
        scope: emission.scope,
        activity: emission.activity,
        value: emission.value,
        unit: emission.unit,
        co2e: emission.co2e,
        uncertainty: emission.uncertainty
      });
    });

    // Add totals row
    const lastRow = worksheet.lastRow.number;
    worksheet.addRow({
      category: 'TOTAL',
      co2e: { formula: `SUM(F2:F${lastRow})` }
    });
  }
}

// Export Formats
enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}
```

### 4. Scheduled Reports
```typescript
@Injectable()
export class ScheduledReportService {
  constructor(
    private reportGenerator: ReportGeneratorService,
    private emailService: EmailService,
    private scheduleRepository: ScheduleRepository,
    private cronService: CronService
  ) {}

  async createSchedule(
    command: CreateScheduleCommand
  ): Promise<ReportSchedule> {
    const schedule = new ReportSchedule({
      id: new ScheduleId(),
      projectId: command.projectId,
      reportType: command.reportType,
      parameters: command.parameters,
      cron: command.cron,
      recipients: command.recipients,
      isActive: true
    });

    // Validate cron expression
    if (!this.cronService.isValidExpression(schedule.cron)) {
      throw new InvalidCronExpressionException();
    }

    // Save schedule
    await this.scheduleRepository.save(schedule);

    // Register cron job
    this.cronService.registerJob(
      schedule.id.toString(),
      schedule.cron,
      () => this.executeScheduledReport(schedule)
    );

    return schedule;
  }

  private async executeScheduledReport(
    schedule: ReportSchedule
  ): Promise<void> {
    try {
      // Generate report
      const report = await this.reportGenerator.generateReport({
        projectId: schedule.projectId,
        type: schedule.reportType,
        parameters: schedule.parameters
      });

      // Export to PDF
      const pdf = await this.exportService.exportReport(
        report,
        ExportFormat.PDF
      );

      // Send via email
      await this.emailService.sendReport({
        to: schedule.recipients,
        subject: `Scheduled Report: ${report.title}`,
        body: this.getEmailBody(report),
        attachments: [{
          filename: `${report.title}.pdf`,
          content: pdf
        }]
      });

      // Update schedule last run
      schedule.lastRun = new Date();
      schedule.nextRun = this.cronService.getNextRun(schedule.cron);
      await this.scheduleRepository.save(schedule);

    } catch (error) {
      console.error(`Failed to execute scheduled report ${schedule.id}:`, error);

      // Update error count
      schedule.errorCount++;
      if (schedule.errorCount >= 5) {
        schedule.isActive = false; // Disable after 5 failures
      }

      await this.scheduleRepository.save(schedule);
    }
  }
}

interface ReportSchedule {
  id: ScheduleId;
  projectId: ProjectId;
  reportType: ReportType;
  parameters: ReportParameters;
  cron: string; // e.g., "0 0 1 * *" for monthly
  recipients: string[];
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  errorCount: number;
}
```

## API Endpoints

### Reports
```typescript
POST   /reports/generate       - Generate report
GET    /reports               - List reports
GET    /reports/:id           - Get report
DELETE /reports/:id           - Delete report
GET    /reports/:id/export    - Export report
POST   /reports/:id/email     - Email report
```

### Templates
```typescript
GET    /templates             - List report templates
GET    /templates/:type       - Get template by type
PUT    /templates/:type       - Update template (admin)
```

### Schedules
```typescript
POST   /schedules             - Create scheduled report
GET    /schedules             - List schedules
PUT    /schedules/:id         - Update schedule
DELETE /schedules/:id         - Delete schedule
POST   /schedules/:id/run     - Run scheduled report now
```

## Events Published

```typescript
// Reporting.Report.Generated
{
  reportId: string;
  type: string;
  projectId: string;
  parameters: object;
  generatedAt: Date;
  size: number;
}

// Reporting.Report.Exported
{
  reportId: string;
  format: string;
  exportedBy: string;
  timestamp: Date;
}

// Reporting.Report.Accessed
{
  reportId: string;
  userId: string;
  action: string;
  timestamp: Date;
}
```

## Database Schema

### Reports Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  organizationId: ObjectId,
  type: string,
  title: string,
  description: string,
  parameters: {
    period: { start: Date, end: Date },
    scope: string[],
    categories: string[],
    facilities: string[],
    groupBy: string,
    includeComparisons: boolean,
    includeTargets: boolean
  },
  data: object, // Report content
  metadata: {
    generationTime: number,
    dataPoints: number,
    fileSize: number,
    error: string
  },
  status: string,
  generatedAt: Date,
  expiresAt: Date,
  accessLog: [{
    userId: string,
    action: string,
    timestamp: Date,
    ipAddress: string
  }],
  version: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Schedules Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  reportType: string,
  parameters: object,
  cron: string,
  recipients: string[],
  isActive: boolean,
  lastRun: Date,
  nextRun: Date,
  errorCount: number,
  createdBy: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing Requirements

### Unit Tests
```typescript
describe('Report Generator', () => {
  it('should generate reports correctly');
  it('should handle timeouts gracefully');
  it('should not create infinite loops');
  it('should cache generated reports');
});

describe('Export Service', () => {
  it('should export to PDF format');
  it('should export to Excel with formulas');
  it('should handle large datasets');
});
```

## Commands

```javascript
// Generate report
execute({
  action: 'bash',
  content: 'curl -X POST http://localhost:3006/reports -H "Content-Type: application/json" -d \'{"type":"monthly-emissions","projectId":"projectId"}\''
})

// Export report to specific format
execute({
  action: 'bash',
  content: 'curl http://localhost:3006/reports/reportId/export?format=pdf -o report.pdf'
})

// Schedule report generation
execute({
  action: 'mongodb',
  content: `
    db("clenergize_reporting").collection("scheduled_reports").insertOne({
      type: "monthly-emissions",
      projectId: ObjectId("projectId"),
      cron: "0 0 1 * *",
      enabled: true,
      createdAt: new Date()
    })
  `
})

// Clear report cache
execute({
  action: 'redis',
  content: 'DEL report:project:projectId:*'
})

// Regenerate expired reports
execute({
  action: 'bash',
  content: 'cd NEW/reporting-service && npm run regenerate:expired'
})
```

## Success Metrics
- No infinite SQS polling loops
- Reports cached appropriately
- Large reports generated async
- All exports working correctly
- Scheduled reports executing on time
- Report generation < 30s for standard reports
- Access logging for compliance

## Current Sprint 0.1 Tasks
1. Fix infinite SQS polling issue (C2)
2. Implement report caching
3. Add async generation for large reports
4. Create PDF export functionality
5. Build Excel export with charts
6. Add scheduled report system
7. Implement access logging
8. Add comprehensive tests

Remember: Reporting is critical for compliance and decision-making. Reports must be accurate, timely, and auditable.