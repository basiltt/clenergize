# Service Specification: Notification Service

## Service Overview

**Service Name**: Notification Service
**Port**: 3008
**Purpose**: Multi-channel notification delivery system for email, SMS, in-app, and push notifications with template management, delivery tracking, and user preferences
**Domain**: Core Platform Infrastructure
**Team Ownership**: Core Platform Team
**Phase**: 2 (Months 9-12)
**Story Points**: 20
**Agent**: Notification Agent

## 1. Functional Requirements

### 1.1 Core Features

#### Multi-Channel Notification Delivery
- **Email Notifications**: Transactional, marketing, and alert emails
  - Transactional emails (password reset, account verification, receipts)
  - Marketing emails (newsletters, product updates, ESG insights)
  - Alert emails (system alerts, threshold breaches, approvals)
  - HTML and plain text support
  - Inline images and attachments
  - Email tracking (open rates, click rates)
- **SMS Notifications**: Critical alerts and two-factor authentication
  - Two-factor authentication codes (2FA)
  - Critical system alerts
  - Approval reminders
  - Character limit optimization (160 chars)
  - Unicode support for international characters
- **In-App Notifications**: Real-time notifications via WebSocket
  - Real-time push via WebSocket
  - Notification bell with unread count
  - Categorization (info, warning, error, success)
  - Read/unread status tracking
  - Notification history with pagination
- **Push Notifications**: Mobile app notifications (future)
  - iOS push (APNs)
  - Android push (FCM)
  - Web push notifications
  - Badge counts
  - Silent background updates

#### Template Management System
- **Template Library**: Centralized notification templates
  - HTML email templates with variable substitution
  - SMS templates with dynamic placeholders
  - In-app notification templates
  - Multi-language template support
  - Version control for templates
  - Template preview and testing
- **Template Variables**: Dynamic content personalization
  - User-specific variables ({{firstName}}, {{organizationName}})
  - Context-specific variables ({{emissionValue}}, {{reportDueDate}})
  - System variables ({{currentDate}}, {{platformUrl}})
  - Conditional blocks (if/else logic)
  - Loops for list rendering
- **Template Categories**: Organized by use case
  - Authentication (login, password reset, MFA)
  - Approvals (workflow approval requests)
  - Alerts (threshold breaches, deadline reminders)
  - Reports (report ready, export complete)
  - Collaboration (comments, mentions, assignments)
  - System (maintenance, updates, announcements)
- **Template Designer**: Visual template editor
  - Drag-and-drop editor for HTML emails
  - WYSIWYG preview
  - Test data injection
  - Responsive design preview (desktop, mobile)
  - A/B testing support

#### User Notification Preferences
- **Channel Preferences**: User controls per notification type
  - Email opt-in/opt-out per category
  - SMS opt-in/opt-out
  - In-app notification settings
  - Quiet hours (do not disturb)
  - Frequency limits (digest vs real-time)
- **Notification Categories**: Granular preference control
  - System Alerts (critical, high, medium, low priority)
  - Workflow Notifications (approvals, assignments, comments)
  - Report Notifications (scheduled reports, exports)
  - Data Quality Alerts (validation errors, data issues)
  - Collaboration (mentions, shared documents)
  - Marketing (newsletters, product updates - must be opt-in)
- **Delivery Rules**: Smart delivery optimization
  - Batching (combine multiple notifications into digest)
  - Rate limiting (max X notifications per hour)
  - Priority escalation (critical notifications ignore quiet hours)
  - Fallback channels (if email fails, send SMS)
  - Duplicate detection (don't send same notification twice)

#### Delivery Tracking & Analytics
- **Delivery Status Tracking**: End-to-end notification monitoring
  - Queued: Notification accepted but not sent
  - Sent: Notification dispatched to provider
  - Delivered: Confirmed delivery (email/SMS)
  - Opened: Email opened (tracking pixel)
  - Clicked: Link clicked (UTM tracking)
  - Failed: Delivery failure with reason
  - Bounced: Invalid email/phone
- **Retry Logic**: Automatic retry for failures
  - Exponential backoff (1 min, 5 min, 15 min, 1 hr)
  - Max retry attempts (5 attempts)
  - Dead letter queue for permanent failures
  - Provider failover (if AWS SES fails, try SendGrid)
- **Analytics Dashboard**: Notification performance metrics
  - Delivery rate by channel (email, SMS, in-app)
  - Open rate for emails
  - Click-through rate (CTR)
  - Bounce rate and reasons
  - User engagement by notification type
  - Peak notification times
  - Template performance comparison

#### Rate Limiting & Throttling
- **User-Level Rate Limits**: Prevent notification spam
  - Max 10 emails per hour per user
  - Max 5 SMS per hour per user
  - No limit on in-app notifications (user controls display)
  - Configurable limits per notification category
- **System-Level Rate Limits**: Provider API limits
  - AWS SES: 14 emails/second (sandbox), 1000/second (production)
  - Twilio SMS: 10 SMS/second
  - WebSocket: 1000 messages/second per connection
  - Queue backpressure management
- **Priority Queue**: Critical notifications bypass rate limits
  - Priority levels: CRITICAL > HIGH > MEDIUM > LOW
  - Critical notifications always sent immediately
  - Low priority notifications batched into digests
  - Priority escalation rules

#### Notification Queue Management
- **Queue System**: Redis-based job queue
  - Job queue with priority ordering
  - Delayed job scheduling
  - Recurring job support
  - Job failure tracking
  - Queue metrics (depth, throughput, latency)
- **Batch Processing**: Efficient bulk notification sending
  - Batch size: 100 notifications per batch
  - Parallel processing (5 concurrent workers)
  - Progress tracking for large batches
  - Partial failure handling (continue on error)
- **Scheduled Notifications**: Time-based delivery
  - Cron-based scheduling (daily, weekly, monthly)
  - User timezone awareness
  - Send at optimal time (based on user activity)
  - Recurring notification templates

#### Multi-Language Support
- **Internationalization (i18n)**: Multi-language templates
  - Template translation management
  - Language detection from user profile
  - Fallback to default language (English)
  - Right-to-left (RTL) language support (Arabic, Hebrew)
  - Unicode support for all languages
- **Supported Languages** (Phase 2.3):
  - English (en)
  - Spanish (es)
  - French (fr)
  - German (de)
  - Chinese Simplified (zh-CN)
  - Japanese (ja)
  - Arabic (ar)
  - Portuguese (pt)

#### Compliance & Privacy
- **GDPR Compliance**: EU data protection
  - Explicit consent for marketing emails (double opt-in)
  - Unsubscribe link in all marketing emails
  - Preference center for user control
  - Data retention policy (delete notification history after 2 years)
  - Right to be forgotten (delete all user notification data)
- **CAN-SPAM Act**: US email regulations
  - Clear sender identification
  - Accurate subject lines
  - Physical mailing address in footer
  - One-click unsubscribe
  - Honor unsubscribe within 10 business days
- **TCPA (Telephone Consumer Protection Act)**: US SMS regulations
  - Explicit consent for SMS notifications
  - Opt-out via "STOP" keyword
  - Opt-in via "START" keyword
  - Clear sender identification
  - No auto-dialing without consent

### 1.2 API Endpoints

#### Notification Sending Endpoints
```yaml
POST /v1/notifications/send
  Description: Send a notification via specified channel
  Request:
    - channel: string (required) ("email" | "sms" | "in_app" | "push")
    - recipientId: string (userId)
    - recipientEmail: string (for email)
    - recipientPhone: string (for SMS, E.164 format)
    - templateId: string (required)
    - templateVariables: object (key-value pairs)
    - priority: string ("critical" | "high" | "medium" | "low")
    - scheduleAt: timestamp (optional, for delayed sending)
    - category: string (e.g., "alert", "approval", "report")
    - metadata: object (custom data for tracking)
  Response:
    - notificationId: string (UUID)
    - status: string ("queued" | "sent" | "scheduled")
    - estimatedDelivery: timestamp
    - queuePosition: number (if queued)
  Example:
    POST /v1/notifications/send
    {
      "channel": "email",
      "recipientId": "user-123",
      "recipientEmail": "user@example.com",
      "templateId": "password-reset",
      "templateVariables": {
        "firstName": "John",
        "resetLink": "https://app.clenergize.com/reset?token=abc123",
        "expiresAt": "2025-11-21T10:00:00Z"
      },
      "priority": "high",
      "category": "authentication"
    }

POST /v1/notifications/send-batch
  Description: Send notifications to multiple recipients
  Request:
    - channel: string (required)
    - templateId: string (required)
    - recipients: [{
        recipientId: string,
        recipientEmail: string (for email),
        recipientPhone: string (for SMS),
        templateVariables: object
      }]
    - priority: string
    - category: string
  Response:
    - batchId: string (UUID)
    - totalRecipients: number
    - queued: number
    - failed: number
    - failedRecipients: [{recipientId: string, error: string}]
  Example:
    POST /v1/notifications/send-batch
    {
      "channel": "email",
      "templateId": "monthly-report-ready",
      "recipients": [
        {
          "recipientId": "user-123",
          "recipientEmail": "user1@example.com",
          "templateVariables": {"reportUrl": "https://..."}
        },
        {
          "recipientId": "user-456",
          "recipientEmail": "user2@example.com",
          "templateVariables": {"reportUrl": "https://..."}
        }
      ],
      "priority": "medium",
      "category": "report"
    }

GET /v1/notifications/:notificationId
  Description: Get notification delivery status
  Response:
    - notification: {
        notificationId: string,
        channel: string,
        recipientId: string,
        templateId: string,
        status: string,
        sentAt: timestamp,
        deliveredAt: timestamp,
        openedAt: timestamp,
        clickedAt: timestamp,
        failureReason: string,
        retryCount: number,
        metadata: object
      }

DELETE /v1/notifications/:notificationId
  Description: Cancel a scheduled notification
  Response:
    - success: boolean
    - message: string
```

#### Template Management Endpoints
```yaml
POST /v1/templates
  Description: Create a new notification template
  Request:
    - name: string (required)
    - channel: string (required) ("email" | "sms" | "in_app" | "push")
    - category: string (required)
    - language: string (default: "en")
    - subject: string (for email)
    - bodyHtml: string (for email)
    - bodyText: string (for SMS or email fallback)
    - variables: [string] (list of variables used in template)
    - metadata: object
  Response:
    - templateId: string
    - version: number
    - createdAt: timestamp
  Example:
    POST /v1/templates
    {
      "name": "Emission Threshold Alert",
      "channel": "email",
      "category": "alert",
      "language": "en",
      "subject": "ALERT: Emission threshold exceeded for {{facilityName}}",
      "bodyHtml": "<p>Hi {{firstName}},</p><p>The emissions for {{facilityName}} have exceeded the threshold...</p>",
      "bodyText": "Hi {{firstName}}, The emissions for {{facilityName}} have exceeded...",
      "variables": ["firstName", "facilityName", "emissionValue", "thresholdValue", "facilityUrl"]
    }

GET /v1/templates
  Description: List all notification templates
  Query:
    - channel: string (optional)
    - category: string (optional)
    - language: string (optional)
    - page: number
    - limit: number
  Response:
    - templates: Template[]
    - total: number
    - page: number

GET /v1/templates/:templateId
  Description: Get template details
  Response:
    - template: Template
    - versions: TemplateVersion[] (history)

PUT /v1/templates/:templateId
  Description: Update template (creates new version)
  Request:
    - subject: string
    - bodyHtml: string
    - bodyText: string
    - variables: [string]
  Response:
    - template: Template
    - version: number

DELETE /v1/templates/:templateId
  Description: Delete (archive) template
  Response:
    - success: boolean

POST /v1/templates/:templateId/preview
  Description: Preview template with test data
  Request:
    - testData: object (template variables)
  Response:
    - renderedHtml: string
    - renderedText: string
    - subject: string

POST /v1/templates/:templateId/test
  Description: Send test notification
  Request:
    - testRecipient: string (email or phone)
    - testData: object (template variables)
  Response:
    - notificationId: string
    - status: string
```

#### User Preference Endpoints
```yaml
GET /v1/preferences/:userId
  Description: Get user notification preferences
  Response:
    - preferences: {
        userId: string,
        channels: {
          email: {
            enabled: boolean,
            categories: {
              alerts: boolean,
              approvals: boolean,
              reports: boolean,
              collaboration: boolean,
              marketing: boolean
            }
          },
          sms: {
            enabled: boolean,
            categories: {
              alerts: boolean,
              approvals: boolean
            }
          },
          inApp: {
            enabled: boolean,
            categories: {
              alerts: boolean,
              approvals: boolean,
              reports: boolean,
              collaboration: boolean
            }
          }
        },
        deliveryRules: {
          quietHours: {
            enabled: boolean,
            startTime: string ("22:00"),
            endTime: string ("08:00"),
            timezone: string ("America/New_York")
          },
          frequency: string ("real_time" | "hourly_digest" | "daily_digest"),
          maxNotificationsPerHour: number
        }
      }

PUT /v1/preferences/:userId
  Description: Update user notification preferences
  Request:
    - channels: object
    - deliveryRules: object
  Response:
    - preferences: Preferences

POST /v1/preferences/:userId/unsubscribe
  Description: Unsubscribe user from category
  Request:
    - category: string (required)
    - channel: string (required)
  Response:
    - success: boolean

POST /v1/preferences/:userId/resubscribe
  Description: Resubscribe user to category
  Request:
    - category: string (required)
    - channel: string (required)
  Response:
    - success: boolean
```

#### In-App Notification Endpoints
```yaml
GET /v1/in-app/:userId/notifications
  Description: Get user's in-app notifications
  Query:
    - status: string ("unread" | "read" | "all")
    - category: string (optional)
    - page: number
    - limit: number
  Response:
    - notifications: [{
        notificationId: string,
        title: string,
        message: string,
        category: string,
        priority: string,
        isRead: boolean,
        actionUrl: string (optional),
        createdAt: timestamp,
        readAt: timestamp
      }]
    - total: number
    - unreadCount: number

PUT /v1/in-app/:userId/notifications/:notificationId/read
  Description: Mark notification as read
  Response:
    - notification: InAppNotification

PUT /v1/in-app/:userId/notifications/mark-all-read
  Description: Mark all notifications as read
  Response:
    - markedCount: number

DELETE /v1/in-app/:userId/notifications/:notificationId
  Description: Delete notification from in-app history
  Response:
    - success: boolean
```

#### WebSocket Events (Real-Time In-App Notifications)
```yaml
Client → Server:
  subscribe:
    event: "subscribe"
    data: { userId: string, token: string }
  unsubscribe:
    event: "unsubscribe"
    data: { userId: string }

Server → Client:
  notification:
    event: "notification"
    data: {
      notificationId: string,
      title: string,
      message: string,
      category: string,
      priority: string,
      actionUrl: string,
      createdAt: timestamp
    }
  notification_read:
    event: "notification_read"
    data: { notificationId: string }
  connection_established:
    event: "connection_established"
    data: { userId: string, connectionId: string }
```

#### Analytics & Reporting Endpoints
```yaml
GET /v1/analytics/delivery-stats
  Description: Get notification delivery statistics
  Query:
    - startDate: timestamp
    - endDate: timestamp
    - channel: string (optional)
    - category: string (optional)
  Response:
    - stats: {
        totalSent: number,
        totalDelivered: number,
        totalOpened: number,
        totalClicked: number,
        totalFailed: number,
        deliveryRate: number,
        openRate: number,
        clickRate: number,
        bounceRate: number,
        channelBreakdown: {
          email: {sent: number, delivered: number, opened: number, clicked: number},
          sms: {sent: number, delivered: number},
          inApp: {sent: number, read: number}
        }
      }

GET /v1/analytics/template-performance
  Description: Get performance metrics for templates
  Query:
    - templateId: string (optional, if not provided, all templates)
    - startDate: timestamp
    - endDate: timestamp
  Response:
    - templates: [{
        templateId: string,
        templateName: string,
        channel: string,
        totalSent: number,
        deliveryRate: number,
        openRate: number,
        clickRate: number,
        avgDeliveryTime: number (seconds)
      }]

GET /v1/analytics/user-engagement
  Description: Get user engagement with notifications
  Query:
    - userId: string (optional)
    - startDate: timestamp
    - endDate: timestamp
  Response:
    - engagement: {
        totalReceived: number,
        totalOpened: number,
        totalClicked: number,
        engagementRate: number,
        preferredChannel: string,
        peakHours: [number] (hours of day),
        categoryEngagement: {[category: string]: number}
      }
```

### 1.3 Business Rules

#### Notification Priority & Delivery Rules
1. **Critical Priority**: Always delivered immediately, ignores quiet hours and rate limits
2. **High Priority**: Delivered immediately during active hours, queued during quiet hours
3. **Medium Priority**: Subject to rate limiting, batched if frequency set to digest
4. **Low Priority**: Always batched into daily/hourly digests

#### Channel Fallback Rules
1. If email delivery fails → retry 5 times → move to dead letter queue
2. If SMS delivery fails (invalid number) → send email if available
3. If in-app notification fails (user offline) → store in history, deliver when user connects
4. If all channels fail → log failure, notify admin

#### Template Validation Rules
1. **Required Variables**: All variables used in template must be provided at send time
2. **Missing Variables**: If variable missing, replace with placeholder "[VARIABLE_NAME]"
3. **Email Subject**: Max 150 characters (truncate if longer)
4. **SMS Body**: Max 160 characters (auto-split into multiple messages if longer)
5. **HTML Sanitization**: Remove dangerous HTML tags (script, iframe, object)

#### Rate Limiting Rules
1. **User Rate Limits**: Apply to non-critical notifications only
2. **System Rate Limits**: Apply to all notifications, queue excess
3. **Burst Allowance**: Allow 2x rate limit for 1 minute burst
4. **Rate Limit Reset**: Reset every hour
5. **Priority Override**: Critical notifications bypass all rate limits

#### Preference Enforcement Rules
1. **Marketing Emails**: Require explicit opt-in, cannot override
2. **Transactional Emails**: Ignore opt-out (required for system operation)
3. **Critical Alerts**: Ignore quiet hours and frequency limits
4. **Unsubscribe**: Immediate effect (within 1 minute)
5. **Resubscribe**: Require confirmation email (double opt-in)

#### Data Retention Rules
1. **Notification History**: Retain for 2 years, then delete
2. **Delivery Logs**: Retain for 90 days
3. **Template History**: Retain all versions indefinitely
4. **User Preferences**: Retain until account deletion
5. **Analytics Data**: Aggregate after 90 days, retain aggregates for 5 years

### 1.4 Error Handling

```yaml
Error Responses:
  400 Bad Request:
    - INVALID_CHANNEL
    - INVALID_TEMPLATE_ID
    - MISSING_REQUIRED_VARIABLE
    - INVALID_RECIPIENT_EMAIL
    - INVALID_RECIPIENT_PHONE
    - INVALID_PRIORITY_LEVEL

  401 Unauthorized:
    - INVALID_API_KEY
    - SESSION_EXPIRED

  403 Forbidden:
    - INSUFFICIENT_PERMISSIONS
    - USER_OPTED_OUT
    - RATE_LIMIT_EXCEEDED

  404 Not Found:
    - NOTIFICATION_NOT_FOUND
    - TEMPLATE_NOT_FOUND
    - USER_PREFERENCES_NOT_FOUND

  409 Conflict:
    - NOTIFICATION_ALREADY_SENT
    - TEMPLATE_VERSION_CONFLICT

  422 Unprocessable Entity:
    - TEMPLATE_RENDERING_FAILED
    - INVALID_TEMPLATE_VARIABLES
    - RECIPIENT_BLOCKED
    - RECIPIENT_BOUNCED

  429 Too Many Requests:
    - RATE_LIMIT_EXCEEDED
    - QUEUE_FULL

  500 Internal Server Error:
    - EMAIL_PROVIDER_ERROR
    - SMS_PROVIDER_ERROR
    - WEBSOCKET_ERROR
    - QUEUE_ERROR

  503 Service Unavailable:
    - PROVIDER_UNAVAILABLE
    - QUEUE_UNAVAILABLE
```

## 2. Data Model

### 2.1 MongoDB Collections

#### notifications Collection
```javascript
{
  _id: ObjectId,
  notificationId: String (UUID, unique, indexed),

  channel: String, // "email" | "sms" | "in_app" | "push"
  category: String, // "alert" | "approval" | "report" | "collaboration" | "marketing" | "system"
  priority: String, // "critical" | "high" | "medium" | "low"

  recipient: {
    userId: ObjectId (indexed),
    email: String (for email channel),
    phone: String (for SMS channel, E.164 format),
    name: String,
    language: String (ISO 639-1, e.g., "en", "es")
  },

  template: {
    templateId: ObjectId (indexed),
    templateName: String,
    version: Number
  },

  content: {
    subject: String (for email),
    bodyHtml: String (for email),
    bodyText: String (for SMS or email plaintext),
    variables: Object // Key-value pairs used for rendering
  },

  delivery: {
    status: String (indexed), // "queued" | "sent" | "delivered" | "opened" | "clicked" | "failed" | "bounced"
    queuedAt: Date,
    sentAt: Date,
    deliveredAt: Date,
    openedAt: Date,
    clickedAt: Date,
    failedAt: Date,
    failureReason: String,
    retryCount: Number,
    nextRetryAt: Date,
    provider: String, // "ses" | "twilio" | "fcm" | "apns"
    providerId: String, // External provider's message ID
    deliveryTime: Number // Milliseconds from queue to delivery
  },

  tracking: {
    openTracked: Boolean,
    openCount: Number,
    clickTracked: Boolean,
    clickCount: Number,
    clicks: [{
      url: String,
      clickedAt: Date,
      ipAddress: String (hashed)
    }],
    userAgent: String,
    ipAddress: String (hashed)
  },

  metadata: {
    correlationId: String (indexed),
    batchId: String (indexed, for batch sends),
    scheduledAt: Date (for delayed notifications),
    expiresAt: Date (auto-delete after this time),
    customData: Object // Application-specific data
  },

  audit: {
    createdAt: Date (indexed),
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId
  }
}

// Indexes
- notificationId: unique
- recipient.userId + createdAt: -1 (for user notification history)
- delivery.status: 1 (for status filtering)
- metadata.batchId: 1 (for batch tracking)
- metadata.correlationId: 1 (for distributed tracing)
- delivery.nextRetryAt: 1 (for retry scheduler)
- template.templateId: 1 (for template analytics)
- audit.createdAt: -1 (TTL index: delete after 2 years)
```

#### templates Collection
```javascript
{
  _id: ObjectId,
  templateId: String (UUID, unique, indexed),

  name: String (indexed),
  channel: String (indexed), // "email" | "sms" | "in_app" | "push"
  category: String (indexed), // "alert" | "approval" | "report" | etc.
  language: String (indexed), // "en" | "es" | "fr" | etc.

  content: {
    subject: String (for email),
    bodyHtml: String (for email),
    bodyText: String (for SMS or email plaintext),
    inAppTitle: String (for in-app),
    inAppMessage: String (for in-app),
    pushTitle: String (for push),
    pushBody: String (for push),
    pushIcon: String (URL),
    actionUrl: String (optional link)
  },

  variables: [String], // List of variables used in template (e.g., ["firstName", "organizationName"])

  design: {
    emailHtml: String (full HTML template),
    cssInline: Boolean (inline CSS for email clients),
    responsive: Boolean,
    previewText: String (email preview snippet),
    headerImageUrl: String,
    footerText: String
  },

  versioning: {
    version: Number (indexed),
    isActive: Boolean,
    previousVersionId: ObjectId,
    changelog: String,
    publishedAt: Date
  },

  testing: {
    lastTestedAt: Date,
    testRecipients: [String] // Email/phone for test sends
  },

  analytics: {
    totalSent: Number,
    totalOpened: Number,
    totalClicked: Number,
    openRate: Number,
    clickRate: Number,
    lastUsed: Date
  },

  metadata: {
    createdAt: Date (indexed),
    createdBy: ObjectId,
    updatedAt: Date,
    updatedBy: ObjectId,
    isDeleted: Boolean (soft delete)
  }
}

// Indexes
- templateId: unique
- name: 1
- channel + category: 1
- language: 1
- versioning.isActive: 1
- metadata.createdAt: -1
```

#### user_preferences Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (unique, indexed),

  channels: {
    email: {
      enabled: Boolean,
      address: String (verified email),
      verified: Boolean,
      verifiedAt: Date,
      categories: {
        alerts: Boolean,
        approvals: Boolean,
        reports: Boolean,
        collaboration: Boolean,
        marketing: Boolean, // Requires explicit opt-in
        system: Boolean
      }
    },
    sms: {
      enabled: Boolean,
      phone: String (E.164 format),
      verified: Boolean,
      verifiedAt: Date,
      categories: {
        alerts: Boolean,
        approvals: Boolean
      }
    },
    inApp: {
      enabled: Boolean,
      categories: {
        alerts: Boolean,
        approvals: Boolean,
        reports: Boolean,
        collaboration: Boolean,
        system: Boolean
      }
    },
    push: {
      enabled: Boolean,
      deviceTokens: [{
        token: String,
        platform: String, // "ios" | "android" | "web"
        registeredAt: Date,
        lastUsed: Date
      }],
      categories: {
        alerts: Boolean,
        approvals: Boolean,
        collaboration: Boolean
      }
    }
  },

  deliveryRules: {
    quietHours: {
      enabled: Boolean,
      startTime: String, // "22:00" (24-hour format)
      endTime: String, // "08:00"
      timezone: String, // IANA timezone (e.g., "America/New_York")
      excludePriorities: [String] // Priorities that ignore quiet hours (["critical"])
    },
    frequency: String, // "real_time" | "hourly_digest" | "daily_digest"
    digestDeliveryTime: String, // "09:00" (for daily digest)
    maxNotificationsPerHour: Number,
    maxEmailsPerDay: Number,
    maxSmsPerDay: Number
  },

  unsubscribeList: [{
    category: String,
    channel: String,
    unsubscribedAt: Date,
    reason: String,
    token: String (UUID) // Unsubscribe token
  }],

  language: String, // Preferred language for notifications

  metadata: {
    createdAt: Date,
    updatedAt: Date,
    lastModifiedBy: String, // "user" | "admin" | "system"
    version: Number
  }
}

// Indexes
- userId: unique
- unsubscribeList.token: 1
```

#### in_app_notifications Collection
```javascript
{
  _id: ObjectId,
  notificationId: String (UUID, unique, indexed),

  userId: ObjectId (indexed),

  content: {
    title: String,
    message: String,
    category: String,
    priority: String,
    icon: String (emoji or icon name),
    actionUrl: String (optional),
    actionLabel: String (optional, e.g., "View Report")
  },

  status: {
    isRead: Boolean (indexed),
    readAt: Date,
    isDismissed: Boolean,
    dismissedAt: Date
  },

  metadata: {
    correlationId: String,
    customData: Object,
    expiresAt: Date (auto-delete after 90 days)
  },

  audit: {
    createdAt: Date (indexed),
    createdBy: ObjectId
  }
}

// Indexes
- notificationId: unique
- userId + status.isRead: 1 (for unread notification queries)
- userId + audit.createdAt: -1 (for notification history)
- audit.createdAt: 1 (TTL index: delete after 90 days)
```

#### delivery_logs Collection
```javascript
{
  _id: ObjectId,
  logId: String (UUID, unique),
  notificationId: ObjectId (indexed),

  event: String, // "queued" | "sent" | "delivered" | "opened" | "clicked" | "failed" | "bounced"
  timestamp: Date (indexed),

  provider: {
    name: String, // "ses" | "twilio" | "fcm" | "apns"
    messageId: String,
    response: Object // Provider's response payload
  },

  error: {
    code: String,
    message: String,
    retryable: Boolean
  },

  metadata: {
    ipAddress: String (hashed),
    userAgent: String,
    correlationId: String
  }
}

// Indexes
- logId: unique
- notificationId: 1
- timestamp: -1 (TTL index: delete after 90 days)
- event: 1
```

### 2.2 Redis Data Structures

#### Notification Queue (Bull Queue)
```
Queue: notification_queue
Jobs: {
  jobId: string,
  data: {
    notificationId: string,
    channel: string,
    recipientId: string,
    templateId: string,
    templateVariables: object,
    priority: number (0-10, higher = more urgent)
  },
  opts: {
    priority: number,
    delay: number (milliseconds),
    attempts: number (max retries),
    backoff: {type: "exponential", delay: number}
  }
}
```

#### Rate Limiting
```
Key: rate_limit:user:{userId}:email
Value: number (count of emails sent in current hour)
TTL: 3600 seconds (1 hour)

Key: rate_limit:user:{userId}:sms
Value: number (count of SMS sent in current hour)
TTL: 3600 seconds

Key: rate_limit:system:{channel}
Value: number (count of notifications sent in current second)
TTL: 1 second
```

#### WebSocket Connection Tracking
```
Key: websocket:user:{userId}
Value: {
  connectionId: string,
  connectedAt: timestamp,
  lastPing: timestamp
}
TTL: 3600 seconds (refresh on activity)

Key: websocket:connection:{connectionId}
Value: {
  userId: string,
  connectedAt: timestamp
}
TTL: 3600 seconds
```

#### Digest Batching
```
Key: digest:user:{userId}:daily
Value: [notificationId1, notificationId2, ...]
TTL: 86400 seconds (24 hours)

Key: digest:user:{userId}:hourly
Value: [notificationId1, notificationId2, ...]
TTL: 3600 seconds (1 hour)
```

#### Template Cache
```
Key: template:{templateId}:v{version}
Value: {
  templateId: string,
  name: string,
  channel: string,
  content: object,
  variables: [string]
}
TTL: 3600 seconds (1 hour)
```

## 3. Non-Functional Requirements

### 3.1 Performance
- **Notification Queueing**: < 100ms to accept notification
- **Email Delivery**: < 5s from queue to provider (AWS SES)
- **SMS Delivery**: < 3s from queue to provider (Twilio)
- **In-App Delivery**: < 100ms via WebSocket
- **Template Rendering**: < 200ms for complex HTML templates
- **Batch Processing**: 100 notifications/second
- **WebSocket Latency**: < 50ms for real-time notifications
- **API Response Time**: < 300ms for read operations, < 500ms for write operations

### 3.2 Scalability
- **Horizontal Scaling**: Stateless service, scale to N instances
- **Queue Capacity**: 1M queued notifications
- **Concurrent Workers**: 10 workers per instance
- **WebSocket Connections**: 10,000 concurrent connections per instance
- **Notification Throughput**: 100,000 notifications/hour
- **Database**: MongoDB replica set (1 primary, 2 secondaries)
- **Cache**: Redis cluster (3 nodes)

### 3.3 Availability
- **Uptime SLA**: 99.9% (43 min/month downtime)
- **RTO**: 1 hour
- **RPO**: 5 minutes
- **Graceful Degradation**: If email fails, queue for retry (don't block request)
- **Circuit Breakers**: For AWS SES, Twilio, WebSocket
- **Provider Failover**: If AWS SES fails, failover to SendGrid (optional)

### 3.4 Security
- **Encryption at Rest**: AES-256 for user email/phone in MongoDB
- **Encryption in Transit**: TLS 1.3 for all API and provider communication
- **API Authentication**: JWT token required for all endpoints
- **Webhook Signature Verification**: HMAC-SHA256 for provider webhooks (SES, Twilio)
- **Rate Limiting**: Per-user and system-wide rate limits
- **PII Protection**: Hash IP addresses in tracking data
- **Unsubscribe Token**: Unique token per user/category (prevent abuse)

### 3.5 Compliance
- **GDPR**: Right to access, right to erasure, consent management
- **CAN-SPAM**: Unsubscribe link, physical address, accurate subject lines
- **TCPA**: SMS opt-in/opt-out, no auto-dialing without consent
- **Data Retention**: Auto-delete notification history after 2 years
- **Audit Trail**: All preference changes logged

## 4. Events

### 4.1 Events Published

#### Notification Lifecycle Events
```typescript
// notification.queued.v1
{
  eventId: string,
  eventType: "notification.queued.v1",
  timestamp: string (ISO 8601),
  notificationId: string,
  channel: string,
  recipientId: string,
  templateId: string,
  category: string,
  priority: string,
  queuePosition: number,
  correlationId: string
}

// notification.sent.v1
{
  eventId: string,
  eventType: "notification.sent.v1",
  timestamp: string,
  notificationId: string,
  channel: string,
  recipientId: string,
  provider: string,
  providerId: string, // Provider's message ID
  correlationId: string
}

// notification.delivered.v1
{
  eventId: string,
  eventType: "notification.delivered.v1",
  timestamp: string,
  notificationId: string,
  channel: string,
  recipientId: string,
  deliveredAt: string,
  deliveryTime: number (milliseconds),
  correlationId: string
}

// notification.opened.v1
{
  eventId: string,
  eventType: "notification.opened.v1",
  timestamp: string,
  notificationId: string,
  channel: string, // "email"
  recipientId: string,
  openedAt: string,
  correlationId: string
}

// notification.clicked.v1
{
  eventId: string,
  eventType: "notification.clicked.v1",
  timestamp: string,
  notificationId: string,
  channel: string, // "email"
  recipientId: string,
  clickedUrl: string,
  clickedAt: string,
  correlationId: string
}

// notification.failed.v1
{
  eventId: string,
  eventType: "notification.failed.v1",
  timestamp: string,
  notificationId: string,
  channel: string,
  recipientId: string,
  failureReason: string,
  retryCount: number,
  willRetry: boolean,
  correlationId: string
}

// notification.bounced.v1
{
  eventId: string,
  eventType: "notification.bounced.v1",
  timestamp: string,
  notificationId: string,
  channel: string, // "email" | "sms"
  recipientId: string,
  recipientAddress: string (email or phone),
  bounceType: string, // "hard" | "soft" | "complaint"
  bounceReason: string,
  correlationId: string
}
```

#### Preference Management Events
```typescript
// notification.preference.updated.v1
{
  eventId: string,
  eventType: "notification.preference.updated.v1",
  timestamp: string,
  userId: string,
  channel: string,
  category: string,
  enabled: boolean,
  updatedBy: string, // "user" | "admin"
  correlationId: string
}

// notification.user.unsubscribed.v1
{
  eventId: string,
  eventType: "notification.user.unsubscribed.v1",
  timestamp: string,
  userId: string,
  channel: string,
  category: string,
  reason: string,
  correlationId: string
}
```

#### Template Events
```typescript
// notification.template.created.v1
{
  eventId: string,
  eventType: "notification.template.created.v1",
  timestamp: string,
  templateId: string,
  templateName: string,
  channel: string,
  category: string,
  language: string,
  createdBy: string,
  correlationId: string
}

// notification.template.updated.v1
{
  eventId: string,
  eventType: "notification.template.updated.v1",
  timestamp: string,
  templateId: string,
  templateName: string,
  version: number,
  updatedBy: string,
  changelog: string,
  correlationId: string
}
```

### 4.2 Events Consumed

```typescript
// identity.user.created.v1
// Trigger: Create default notification preferences for new user

// identity.user.email.verified.v1
// Trigger: Enable email notifications for user

// identity.user.deleted.v1
// Trigger: Delete all user notification data (GDPR compliance)

// workflow.approval.requested.v1
// Trigger: Send approval request notification

// reporting.report.ready.v1
// Trigger: Send report ready notification

// calculation.threshold.exceeded.v1
// Trigger: Send emission threshold alert

// materiality.stakeholder.invited.v1
// Trigger: Send survey invitation email

// audit.access.unauthorized.v1
// Trigger: Send security alert to admin

// organization.user.invited.v1
// Trigger: Send invitation email with onboarding link
```

## 5. Service Dependencies

### 5.1 Upstream Dependencies (Services We Call)

#### Identity Service (3001)
- **Purpose**: User authentication, email/phone verification
- **Endpoints Used**:
  - `GET /v1/users/:userId` - Get user email, phone, language preference
  - `GET /v1/users/:userId/verified-contacts` - Get verified email/phone
- **Circuit Breaker**: Yes (30s timeout)
- **Fallback**: Use cached user data from preferences

#### Organization Service (3002)
- **Purpose**: Organization context for notifications
- **Endpoints Used**:
  - `GET /v1/organizations/:orgId` - Get organization details for notification context
- **Circuit Breaker**: Yes (30s timeout)
- **Fallback**: Use minimal organization data from metadata

### 5.2 Downstream Consumers (Services That Call Us)

**All Services** consume Notification Service for:
- User notifications (approvals, alerts, reports)
- System notifications (errors, warnings)
- Collaboration notifications (mentions, comments, shares)

#### Workflow Service (3009)
- **Consumes**: Approval request notifications
- **Events Subscribed**: N/A (calls API directly)

#### Reporting Service (3006)
- **Consumes**: Report ready notifications
- **Events Subscribed**: N/A (calls API directly)

#### Calculation Service (3005)
- **Consumes**: Threshold breach alerts
- **Events Subscribed**: N/A (calls API directly)

#### Materiality Service (3041)
- **Consumes**: Survey invitation emails
- **Events Subscribed**: N/A (calls API directly)

### 5.3 External Integrations

#### AWS SES (Simple Email Service)
- **Purpose**: Email delivery
- **API**: AWS SDK v3
- **Rate Limits**: 14 emails/second (sandbox), 1000/second (production)
- **Pricing**: $0.10 per 1,000 emails
- **Webhook**: SNS topics for bounce/complaint notifications

#### Twilio SMS API
- **Purpose**: SMS delivery
- **API**: Twilio REST API v2010-04-01
- **Rate Limits**: 10 SMS/second
- **Pricing**: $0.0075 per SMS (US)
- **Webhook**: Status callbacks for delivery confirmation

#### Firebase Cloud Messaging (FCM) - Future
- **Purpose**: Android push notifications
- **API**: Firebase Admin SDK
- **Rate Limits**: No published limit
- **Pricing**: Free

#### Apple Push Notification Service (APNs) - Future
- **Purpose**: iOS push notifications
- **API**: HTTP/2 APNs API
- **Rate Limits**: No published limit
- **Pricing**: Free

## 6. Implementation Phases

### 6.1 MVP (Phase 2.1 - Month 9)
**Story Points**: 8 (CLNZ-2201, CLNZ-2202)

**Features**:
- ✅ Email notifications via AWS SES
- ✅ Template management system
- ✅ Template variable substitution
- ✅ Notification queue (Redis + Bull)
- ✅ Basic user preferences (email opt-in/opt-out)
- ✅ Delivery status tracking
- ✅ Retry logic for failures

**Deliverables**:
- Notification CRUD APIs
- Template CRUD APIs
- Email delivery integration (AWS SES)
- Queue management
- MongoDB collections and indexes
- Basic frontend for template management

### 6.2 Phase 2 Enhancements (Phase 2.2 - Month 10)
**Story Points**: 7 (CLNZ-2203, CLNZ-2204)

**Features**:
- ✅ SMS notifications via Twilio
- ✅ In-app notifications via WebSocket
- ✅ Advanced user preferences (quiet hours, frequency, categories)
- ✅ Rate limiting (user and system level)
- ✅ Batch notification sending
- ✅ Delivery analytics dashboard
- ✅ Template preview and testing

**Deliverables**:
- SMS delivery integration (Twilio)
- WebSocket server for in-app notifications
- Preference management APIs
- Rate limiting middleware
- Analytics APIs
- Dashboard for notification metrics

### 6.3 Phase 3 Advanced Features (Phase 2.3 - Month 11)
**Story Points**: 5 (CLNZ-2205)

**Features**:
- ✅ Multi-language template support
- ✅ Email tracking (open rates, click rates)
- ✅ Template A/B testing
- ✅ Digest batching (hourly, daily)
- ✅ Advanced analytics (user engagement, template performance)
- ✅ Unsubscribe page and preference center
- ✅ GDPR compliance (data export, deletion)

**Deliverables**:
- Multi-language template system
- Email tracking pixel and click tracking
- A/B testing framework
- Digest batching logic
- Advanced analytics APIs
- Preference center UI
- GDPR compliance tools

### 6.4 Future Roadmap (Phase 3+)
**Story Points**: Future

**Features**:
- 🔮 Push notifications (iOS, Android, Web)
- 🔮 Rich media notifications (images, videos)
- 🔮 Interactive notifications (reply, action buttons)
- 🔮 AI-powered send time optimization
- 🔮 Personalization engine (ML-based content)
- 🔮 Email deliverability optimization (reputation management)
- 🔮 Multi-provider failover (SendGrid, Mailgun)

## 7. Testing Strategy

### 7.1 Unit Tests (Target: 90% Coverage)

**Core Business Logic**:
- Template rendering engine
  - Test variable substitution
  - Test conditional logic
  - Test loop rendering
  - Test HTML sanitization
- Rate limiting logic
  - Test user rate limits
  - Test system rate limits
  - Test burst allowance
  - Test priority override
- Preference enforcement
  - Test quiet hours
  - Test frequency limits
  - Test category opt-out
  - Test channel preferences
- Queue management
  - Test priority ordering
  - Test delayed scheduling
  - Test retry logic
  - Test backpressure handling

### 7.2 Integration Tests (Target: 80% Coverage)

**API Endpoint Tests**:
- Notification sending (email, SMS, in-app)
- Template CRUD operations
- Preference management
- In-app notification retrieval
- Batch notification sending
- Delivery status tracking

**External Integration Tests**:
- AWS SES email sending (mock)
- Twilio SMS sending (mock)
- WebSocket connection and delivery
- Webhook handling (SES bounce/complaint)

### 7.3 Contract Tests (Pact)

**Consumer Contracts** (Notification Service as Consumer):
```typescript
// Contract with Identity Service
describe('Identity Service Contract', () => {
  it('provides user contact details', async () => {
    await provider.addInteraction({
      state: 'user exists with verified email',
      uponReceiving: 'a request for user details',
      withRequest: {
        method: 'GET',
        path: '/v1/users/user-123',
        headers: { Authorization: 'Bearer token' }
      },
      willRespondWith: {
        status: 200,
        body: {
          userId: 'user-123',
          email: 'user@example.com',
          phone: '+12025551234',
          language: 'en',
          emailVerified: true,
          phoneVerified: true
        }
      }
    });
  });
});
```

**Provider Contracts** (Notification Service as Provider):
```typescript
// Contract for all services consuming notifications
describe('Notification Service Contract', () => {
  it('accepts notification send request', async () => {
    await provider.addInteraction({
      state: 'template exists',
      uponReceiving: 'a request to send notification',
      withRequest: {
        method: 'POST',
        path: '/v1/notifications/send',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json'
        },
        body: {
          channel: 'email',
          recipientId: 'user-123',
          recipientEmail: 'user@example.com',
          templateId: 'password-reset',
          templateVariables: {},
          priority: 'high'
        }
      },
      willRespondWith: {
        status: 200,
        body: {
          notificationId: string,
          status: 'queued'
        }
      }
    });
  });
});
```

### 7.4 E2E Test Flows

**Flow 1: Email Notification Delivery**
1. Create email template
2. Send notification via API
3. Verify notification queued
4. Process queue (mock SES call)
5. Verify delivery status updated
6. Verify event published

**Flow 2: User Preference Enforcement**
1. Set user preference (email alerts disabled)
2. Attempt to send email alert
3. Verify notification blocked
4. Verify no email sent
5. Update preference (enable alerts)
6. Resend notification
7. Verify email sent

**Flow 3: In-App Real-Time Notification**
1. User connects via WebSocket
2. Send in-app notification
3. Verify notification delivered via WebSocket
4. User marks notification as read
5. Verify read status updated
6. Verify unread count updated

**Flow 4: Batch Notification with Rate Limiting**
1. Send batch of 100 notifications
2. Verify rate limiting applied
3. Verify notifications queued
4. Process queue with rate limits
5. Verify all delivered over time
6. Verify no rate limit violations

### 7.5 Performance Tests

**Load Testing** (K6):
- 1000 concurrent notification requests
- 10,000 notifications/minute sustained load
- 10,000 concurrent WebSocket connections
- Template rendering under load (1000 renders/second)

**Stress Testing**:
- Queue exhaustion (1M queued notifications)
- Worker failure recovery
- Redis failure scenarios
- Provider API failures (SES, Twilio down)

### 7.6 Security Tests

**Authentication & Authorization**:
- Unauthenticated access (expect 401)
- Insufficient permissions (expect 403)
- JWT token expiration

**Input Validation**:
- XSS in template variables (should sanitize)
- SQL injection in template variables
- Invalid email format (should reject)
- Invalid phone format (should reject)

**Data Privacy**:
- Verify IP address hashing
- Verify email/phone encryption at rest
- Test GDPR data export
- Test GDPR data deletion

## 8. Migration Strategy

### 8.1 Data Migration

**No Legacy Migration** (New Service):
- Notification Service is a NEW capability for Clenergize V3
- No data migration from V2 required
- Fresh start with modern notification infrastructure

### 8.2 Initial Data Seeding

**Seed Data**:
```yaml
Templates:
  - Authentication Templates:
      - Welcome Email
      - Password Reset
      - Email Verification
      - 2FA Code (SMS)
  - Alert Templates:
      - Emission Threshold Alert
      - Data Quality Alert
      - System Error Alert
  - Approval Templates:
      - Approval Request
      - Approval Reminder
      - Approval Approved/Rejected
  - Report Templates:
      - Report Ready
      - Export Complete
      - Scheduled Report
  - Collaboration Templates:
      - User Mentioned
      - Document Shared
      - Comment Added

Default Preferences:
  - All categories enabled
  - Email enabled by default
  - SMS disabled by default
  - In-app enabled by default
  - Quiet hours disabled
  - Frequency: real_time
```

**Seeding Script** (`npm run seed:notification`):
```typescript
async function seedNotificationData() {
  // 1. Load template seeds from JSON files
  await loadTemplates('./seeds/email-templates.json');
  await loadTemplates('./seeds/sms-templates.json');
  await loadTemplates('./seeds/in-app-templates.json');

  // 2. Create default user preferences for existing users
  const users = await identityService.getAllUsers();
  for (const user of users) {
    await createDefaultPreferences(user.id, user.email, user.phone);
  }

  console.log('Notification service seed data loaded successfully');
}
```

### 8.3 Rollback Procedures

**Service Rollback**:
```bash
# Step 1: Stop notification service
kubectl scale deployment notification-service --replicas=0

# Step 2: Restore previous version
kubectl rollout undo deployment/notification-service

# Step 3: Verify health
kubectl rollout status deployment/notification-service

# Step 4: Verify queue processing
npm run verify:notification-queue
```

**Data Rollback** (MongoDB):
```bash
# Restore to timestamp before issue
mongorestore --uri="$MONGODB_URI" \
  --oplogReplay \
  --oplogLimit=1234567890:1 \
  --db=clenergize_notification
```

## 9. Monitoring & Observability

### 9.1 Key Metrics

**Business Metrics**:
```yaml
notifications_sent_total:
  type: counter
  description: Total notifications sent
  labels: [channel, category, priority, status]

notifications_delivery_rate:
  type: gauge
  description: Notification delivery success rate
  labels: [channel, category]

notifications_open_rate:
  type: gauge
  description: Email open rate
  labels: [templateId, category]

notifications_click_rate:
  type: gauge
  description: Email click-through rate
  labels: [templateId, category]

notifications_bounce_rate:
  type: gauge
  description: Email/SMS bounce rate
  labels: [channel, bounceType]

user_engagement_rate:
  type: gauge
  description: User engagement with notifications
  labels: [userId, category]
```

**Performance Metrics**:
```yaml
notification_queue_depth:
  type: gauge
  description: Number of notifications in queue
  labels: [priority]

notification_processing_duration:
  type: histogram
  description: Time to process notification from queue (ms)
  labels: [channel, priority]

template_rendering_duration:
  type: histogram
  description: Template rendering time (ms)
  labels: [templateId, channel]

email_delivery_duration:
  type: histogram
  description: Time from queue to SES delivery (ms)

sms_delivery_duration:
  type: histogram
  description: Time from queue to Twilio delivery (ms)

websocket_latency:
  type: histogram
  description: WebSocket message delivery latency (ms)
```

**Error Metrics**:
```yaml
notifications_failed_total:
  type: counter
  description: Failed notifications by reason
  labels: [channel, failureReason, retryable]

provider_errors_total:
  type: counter
  description: Provider API errors
  labels: [provider, errorCode]

rate_limit_exceeded_total:
  type: counter
  description: Rate limit violations
  labels: [userId, limitType]
```

### 9.2 Alerts

**Critical Alerts** (PagerDuty):
```yaml
NotificationServiceDown:
  condition: up{job="notification-service"} == 0
  duration: 5m
  severity: critical
  action: Page on-call engineer

HighFailureRate:
  condition: rate(notifications_failed_total[5m]) > 0.10
  duration: 10m
  severity: critical
  action: Page on-call engineer

QueueBacklog:
  condition: notification_queue_depth > 100000
  duration: 15m
  severity: critical
  action: Page on-call engineer and scale workers

ProviderDown:
  condition: provider_errors_total{provider="ses"} > 100
  duration: 5m
  severity: critical
  action: Page on-call and trigger failover
```

**Warning Alerts** (Slack):
```yaml
LowDeliveryRate:
  condition: notifications_delivery_rate < 0.95
  duration: 30m
  severity: warning
  action: Notify notification team

HighBounceRate:
  condition: notifications_bounce_rate > 0.05
  duration: 1h
  severity: warning
  action: Notify notification team

SlowQueueProcessing:
  condition: notification_processing_duration{quantile="0.95"} > 10000
  duration: 15m
  severity: warning
  action: Notify performance team
```

### 9.3 Dashboards

**Operations Dashboard** (Grafana):
```yaml
Panels:
  - Notifications Sent (by channel, category)
  - Delivery Rate (by channel)
  - Queue Depth (by priority)
  - Queue Processing Latency
  - Provider API Errors
  - Rate Limit Violations
  - Worker Health
```

**Analytics Dashboard** (Grafana):
```yaml
Panels:
  - Email Open Rate (by template)
  - Email Click-Through Rate
  - SMS Delivery Rate
  - In-App Notification Read Rate
  - User Engagement by Category
  - Peak Notification Times
  - Template Performance Comparison
```

**Compliance Dashboard**:
```yaml
Panels:
  - Unsubscribe Requests
  - Bounce/Complaint Rate
  - GDPR Data Export Requests
  - GDPR Data Deletion Requests
  - Consent Rates (marketing emails)
```

### 9.4 SLOs (Service Level Objectives)

```yaml
Availability SLO:
  target: 99.9%
  measurement_window: 30 days
  error_budget: 43 minutes/month

Latency SLO:
  target: 95% of notifications queued < 100ms
  measurement_window: 7 days

Delivery SLO:
  target: 99% of notifications delivered within 1 minute
  measurement_window: 7 days

Error Rate SLO:
  target: < 1% of notifications fail permanently
  measurement_window: 7 days
```

## 10. Compliance & Regulatory

### 10.1 GDPR Compliance

**Data Subject Rights**:
- ✅ **Right to Access**: Export all user notification data
- ✅ **Right to Erasure**: Delete all user notification data
- ✅ **Right to Rectification**: Update user email/phone
- ✅ **Right to Object**: Opt-out of processing (unsubscribe)
- ✅ **Right to Data Portability**: Export in machine-readable format (JSON)

**Consent Management**:
- ✅ Explicit consent for marketing emails (double opt-in)
- ✅ Implied consent for transactional emails (no opt-out)
- ✅ Record consent timestamp and method
- ✅ Granular consent by category

**Data Retention**:
- ✅ Notification history: 2 years
- ✅ Delivery logs: 90 days
- ✅ User preferences: Until account deletion
- ✅ Auto-delete expired data

### 10.2 CAN-SPAM Act Compliance

**Email Requirements**:
- ✅ Clear sender identification ("Clenergize ESG Platform")
- ✅ Accurate subject lines (no deceptive subjects)
- ✅ Physical mailing address in footer
- ✅ One-click unsubscribe link
- ✅ Honor unsubscribe within 10 business days
- ✅ Clear identification of marketing vs transactional emails

### 10.3 TCPA Compliance (SMS)

**SMS Requirements**:
- ✅ Explicit opt-in before sending SMS
- ✅ Clear identification of sender
- ✅ Opt-out via "STOP" keyword
- ✅ Opt-in via "START" keyword
- ✅ Help via "HELP" keyword
- ✅ No auto-dialing without consent

### 10.4 Audit Trail

**Logged Events**:
- ✅ All preference changes (with timestamp and user)
- ✅ All unsubscribe/resubscribe actions
- ✅ All notification sends (with delivery status)
- ✅ All template changes (versioned)
- ✅ All GDPR data requests (export, deletion)

## 11. Cost & Resource Estimates

### 11.1 Development Costs

**Team Allocation**:
```yaml
Phase 2.1 (Month 9) - MVP:
  Backend Developer: 0.5 FTE x 4 weeks = $10,000
  Frontend Developer: 0.25 FTE x 4 weeks = $5,000
  QA Engineer: 0.25 FTE x 4 weeks = $4,000
  Total: $19,000

Phase 2.2 (Month 10) - Enhancements:
  Backend Developer: 0.5 FTE x 4 weeks = $10,000
  Frontend Developer: 0.25 FTE x 4 weeks = $5,000
  QA Engineer: 0.25 FTE x 4 weeks = $4,000
  Total: $19,000

Phase 2.3 (Month 11) - Advanced Features:
  Backend Developer: 0.5 FTE x 4 weeks = $10,000
  Frontend Developer: 0.25 FTE x 4 weeks = $5,000
  QA Engineer: 0.25 FTE x 4 weeks = $4,000
  Total: $19,000

Grand Total: $57,000
```

### 11.2 Infrastructure Costs (Annual)

**AWS Resources**:
```yaml
Compute (ECS Fargate):
  - Task Definition: 0.5 vCPU, 1 GB RAM
  - Running Tasks: 3 (HA)
  - Cost: 3 tasks x $0.02 x 730 hrs = $43.80/month

Database (MongoDB Atlas):
  - Tier: M10 (2 GB RAM)
  - Replica Set: 3 nodes
  - Cost: $0.08/hr x 3 x 730 = $175.20/month

Cache (ElastiCache Redis):
  - Node Type: cache.t3.small
  - Nodes: 3 (cluster)
  - Cost: $0.034/hr x 3 x 730 = $74.52/month

AWS SES (Email):
  - Volume: 100,000 emails/month
  - Cost: 100,000 x $0.10/1000 = $10/month

Twilio SMS:
  - Volume: 5,000 SMS/month
  - Cost: 5,000 x $0.0075 = $37.50/month

EventBridge:
  - Custom Events: 500K/month
  - Cost: 500K x $1.00/million = $0.50/month

Total Monthly: $341.52
Total Annual: $4,098.24
```

### 11.3 Third-Party Costs

**Optional Integrations**:
```yaml
SendGrid (Backup Email Provider):
  - Tier: Pro (100K emails/month)
  - Cost: $89.95/month
  - Status: Optional (only if failover needed)

Firebase Cloud Messaging (FCM):
  - Cost: Free (unlimited)

Apple Push Notification Service (APNs):
  - Cost: Free (unlimited)

Total Third-Party (Optional): $1,079.40/year
```

## 12. Related Documentation

### 12.1 Architecture Documentation
- [ESG Platform Overview](../../Docs/ESG_PLATFORM_OVERVIEW.md)
- [Phase 2 Architecture Diagram](../../Docs/FUTURE-ROADMAP/Phase2-Strategic-ESG/Phase2_Architecture.md) *(To be created)*
- [Service Dependency Diagram](../../Docs/SERVICE_DEPENDENCY_DIAGRAM.md)
- [Event Schema Registry](../../Docs/ESG_EVENT_SCHEMA_REGISTRY.md)

### 12.2 API Documentation
- [Notification Service OpenAPI Spec](./api/notification-openapi.yaml) *(To be created)*
- [WebSocket Protocol Spec](./api/websocket-protocol.md) *(To be created)*

### 12.3 Integration Guides
- [AWS SES Integration Guide](../../Docs/INTEGRATIONS_AWS_SES.md) *(To be created)*
- [Twilio SMS Integration Guide](../../Docs/INTEGRATIONS_TWILIO_SMS.md) *(To be created)*
- [WebSocket Integration Guide](../../Docs/INTEGRATIONS_WEBSOCKET.md) *(To be created)*

### 12.4 Compliance & Standards
- [GDPR Compliance Guide](../../Docs/COMPLIANCE_GDPR.md) *(To be created)*
- [CAN-SPAM Compliance Checklist](../../Docs/COMPLIANCE_CAN_SPAM.md) *(To be created)*
- [TCPA Compliance Guide](../../Docs/COMPLIANCE_TCPA.md) *(To be created)*

### 12.5 Template Design
- [Email Template Design Guide](../../Docs/NOTIFICATION_EMAIL_TEMPLATE_DESIGN.md) *(To be created)*
- [SMS Best Practices](../../Docs/NOTIFICATION_SMS_BEST_PRACTICES.md) *(To be created)*

### 12.6 JIRA References
- **EPIC-022**: Notification Service (20 points)
  - [CLNZ-2201](https://yourcompany.atlassian.net/browse/CLNZ-2201): Build email notification system (8 pts)
  - [CLNZ-2202](https://yourcompany.atlassian.net/browse/CLNZ-2202): Implement template management (5 pts)
  - [CLNZ-2203](https://yourcompany.atlassian.net/browse/CLNZ-2203): Add SMS notifications (3 pts)
  - [CLNZ-2204](https://yourcompany.atlassian.net/browse/CLNZ-2204): Build in-app notification system (5 pts)
  - [CLNZ-2205](https://yourcompany.atlassian.net/browse/CLNZ-2205): Add advanced features (multi-language, tracking) (5 pts)

---

**Document Version**: 1.0.0
**Last Updated**: November 20, 2024
**Author**: Notification Agent
**Reviewers**: Architecture Agent, Master Coordinator
**Status**: Draft - Pending Review
