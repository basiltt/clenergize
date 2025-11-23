# API Documentation Guide - Clenergize V3 ESG Platform

**Version**: 1.0.0
**Last Updated**: November 22, 2025
**Tool**: OpenAPI 3.0 + Swagger UI

## Overview

All Clenergize V3 services provide self-documenting APIs using OpenAPI 3.0 specifications and Swagger UI for interactive exploration.

## Accessing API Documentation

### Swagger UI (Local Development)
- **URL**: http://localhost:8080/api-docs
- **Credentials**: None (local environment)

### Swagger UI (Production)
- **URL**: https://api.clenergize.com/docs
- **Credentials**: Requires API key or OAuth token

### Individual Service Documentation
- Identity Service: http://localhost:3001/api-docs
- Organization Service: http://localhost:3002/api-docs
- Reference Service: http://localhost:3003/api-docs
- Activity Service: http://localhost:3004/api-docs
- Calculation Service: http://localhost:3005/api-docs
- Reporting Service: http://localhost:3006/api-docs
- Audit Service: http://localhost:3007/api-docs

---

## OpenAPI Specification Structure

### NestJS Integration

Each service includes OpenAPI decorators:

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('api/v1/users')
export class UserController {
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}
```

### DTO Documentation

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (min 8 characters)',
    example: 'Password123!',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  @IsString()
  name: string;
}
```

---

## API Versioning

### URL Path Versioning

All APIs use URL path versioning: `/api/v{version}/{resource}`

**Example**:
- v1: `/api/v1/users`
- v2: `/api/v2/users` (future)

### Version Support Policy
- Current version (v1): Fully supported
- Previous version: Deprecated notice (6-month sunset)
- Older versions: No longer supported

---

## Authentication Documentation

### JWT Bearer Token

```yaml
securitySchemes:
  bearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
```

**Example Request**:
```bash
curl -X GET https://api.clenergize.com/api/v1/users/me   -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### API Key (for service-to-service)

```yaml
securitySchemes:
  apiKey:
    type: apiKey
    in: header
    name: X-API-Key
```

---

## Response Format Standards

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "metadata": {
    "timestamp": "2025-11-22T10:30:00Z",
    "requestId": "req-456",
    "version": "1.0.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email",
      "constraint": "isNotEmpty"
    },
    "timestamp": "2025-11-22T10:30:00Z",
    "requestId": "req-456"
  }
}
```

---

## Common HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but no permission |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 422 | Unprocessable Entity | Semantic validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Service temporarily down |

---

## Pagination Standards

### Request Parameters

```
GET /api/v1/users?page=1&limit=20&sortBy=createdAt&order=desc
```

### Response Format

```json
{
  "success": true,
  "data": [
    { "id": "user-1", "email": "user1@example.com" },
    { "id": "user-2", "email": "user2@example.com" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 100,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Filtering and Search

### Filter Syntax

```
GET /api/v1/users?filter[status]=ACTIVE&filter[role]=ADMIN
GET /api/v1/projects?search=carbon&filter[year]=2025
```

### Complex Queries

```
GET /api/v1/activities?filter[category]=ENERGY&filter[date][gte]=2025-01-01&filter[date][lte]=2025-12-31
```

---

## Rate Limiting

### Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1732287600
```

### Limits
- **Authenticated Users**: 100 requests per 15 minutes
- **Unauthenticated**: 20 requests per 15 minutes
- **Premium Tier**: 500 requests per 15 minutes

---

## Webhooks (Future)

### Event Types
- `user.created`
- `project.created`
- `calculation.completed`
- `report.generated`

### Webhook Payload

```json
{
  "event": "calculation.completed",
  "timestamp": "2025-11-22T10:30:00Z",
  "data": {
    "calculationId": "calc-123",
    "projectId": "proj-456",
    "totalEmissions": 1234.56,
    "unit": "kg CO2e"
  }
}
```

---

## Code Generation

### Generate TypeScript Client

```bash
npx @openapitools/openapi-generator-cli generate   -i http://localhost:3001/api-docs-json   -g typescript-axios   -o ./generated/api-client
```

### Generate Python Client

```bash
openapi-generator generate   -i http://localhost:3001/api-docs-json   -g python   -o ./generated/python-client
```

---

## API Testing with Swagger UI

### Interactive Testing
1. Navigate to Swagger UI
2. Click Authorize button
3. Enter JWT token
4. Select endpoint
5. Click Try it out
6. Fill in parameters
7. Click Execute
8. View response

---

## Postman Collections

### Export OpenAPI to Postman

```bash
# Download OpenAPI spec
curl http://localhost:3001/api-docs-json > openapi.json

# Import into Postman:
# File > Import > openapi.json
```

### Environment Variables

```json
{
  "name": "Clenergize Local",
  "values": [
    { "key": "baseUrl", "value": "http://localhost:3000" },
    { "key": "token", "value": "{{jwt_token}}" }
  ]
}
```

---

## Best Practices for API Documentation

1. **Keep it Updated**: Auto-generate from code
2. **Provide Examples**: Real-world request/response examples
3. **Document Errors**: All possible error codes
4. **Versioning**: Clear deprecation notices
5. **Authentication**: Step-by-step auth guide
6. **Rate Limits**: Document all limits
7. **Changelog**: Track API changes

---

## API Changelog

### v1.0.0 (2025-11-22)
- Initial API release
- 7 core services
- JWT authentication
- RBAC authorization

### Future Versions
- v1.1.0: Webhook support
- v1.2.0: GraphQL endpoint
- v2.0.0: Breaking changes (TBD)

---

**Documentation URL**: https://api.clenergize.com/docs
**OpenAPI Spec**: https://api.clenergize.com/openapi.json
**Support**: api-support@clenergize.com
