# Error Handling Documentation

This document describes the error handling patterns and error codes used throughout the Newsletter Platform.

## Error Response Format

All API endpoints return errors in a consistent JSON format:

```json
{
  "error": "Human-readable error message",
  "details": [] // Optional array with additional error details (e.g., validation errors)
}
```

## HTTP Status Codes

The API uses standard HTTP status codes to indicate the success or failure of requests:

| Status Code | Description | When Used |
|------------|-------------|-----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid request data or validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but lacking permission |
| 404 | Not Found | Resource does not exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

## API-Specific Error Responses

### Subscribe API (`POST /api/subscribe`)

| Error | Status Code | Cause |
|-------|-------------|-------|
| "Too many subscription attempts. Please try again later." | 429 | Rate limit exceeded (5 attempts per hour per email) |
| "Publication not found" | 404 | Invalid or deleted publication ID |
| "Invalid request data" | 400 | Missing or invalid email/publicationId |
| "Failed to subscribe. Please try again." | 500 | Database error during subscription |

#### Success Responses

| Status | Message | Description |
|--------|---------|-------------|
| `confirmation_sent` | "Success! Check your email to confirm your subscription." | New subscriber created |
| `already_subscribed` | "You are already subscribed!" | Email already active subscriber |
| `confirmation_resent` | "Confirmation email resent! Check your inbox." | Resent confirmation to pending subscriber |
| `resubscribed` | "Welcome back! Please confirm your subscription." | Reactivated unsubscribed email |

### Send Test Email API (`POST /api/send/test`)

| Error | Status Code | Cause |
|-------|-------------|-------|
| "Unauthorized" | 401 | Not logged in |
| "Too many test emails sent. Please try again later." | 429 | Rate limit exceeded (10 per hour per user) |
| "Issue not found" | 404 | Invalid issue ID |
| "Unauthorized" | 403 | User not admin of publication |
| "Failed to generate email" | 500 | Error building email template |
| "Failed to send test email" | 500 | Resend API error |

### Send Campaign API (`POST /api/send/campaign`)

| Error | Status Code | Cause |
|-------|-------------|-------|
| "Unauthorized" | 401 | Not logged in |
| "Issue not found" | 404 | Invalid issue ID |
| "Unauthorized" | 403 | User not admin of publication |
| "Issue already sent" | 400 | Cannot resend already-sent issue |
| "Failed to generate email" | 500 | Error building email template |
| "No active subscribers" | 400 | No subscribers to send to |

### Image Upload API (`POST /api/upload/image`)

| Error | Status Code | Cause |
|-------|-------------|-------|
| "Unauthorized" | 401 | Not logged in |
| "No file provided" | 400 | Missing file in request |
| "File too large" | 400 | File exceeds maximum size |
| "Invalid file type" | 400 | File is not an allowed image type |
| "Failed to upload image" | 500 | ImageKit upload error |

### Webhooks API (`POST /api/webhooks/resend`)

| Error | Status Code | Cause |
|-------|-------------|-------|
| "Webhook signature verification failed" | 401 | Invalid or missing webhook signature |
| "Invalid webhook payload" | 400 | Malformed webhook data |

## Rate Limiting

Rate limiting is applied to protect the API from abuse:

### Rate Limit Headers

When rate limiting is active, responses include these headers:

```
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-01-20T12:00:00.000Z
```

### Rate Limit Configuration

| Endpoint | Limit | Window |
|----------|-------|--------|
| Subscribe | 5 requests | 1 hour per email |
| Send Test | 10 requests | 1 hour per user |
| General API | 100 requests | 1 minute per IP |

Rate limits can be configured via environment variables:

```env
RATE_LIMIT_SUBSCRIBE_PER_HOUR=5
RATE_LIMIT_SEND_TEST_PER_HOUR=10
```

## Validation Errors

When request validation fails (status 400), the `details` field contains an array of Zod validation issues:

```json
{
  "error": "Invalid request data",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["email"],
      "message": "Required"
    }
  ]
}
```

## Error Logging

All errors are logged with context information:

```typescript
{
  timestamp: "2024-01-20T10:30:00.000Z",
  level: "error",
  message: "Subscribe endpoint error",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  error: "Error message",
  stack: "Error stack trace..."
}
```

### Log Levels

| Level | Description |
|-------|-------------|
| `debug` | Detailed debugging information (development only) |
| `info` | General operational events |
| `warn` | Warning conditions (e.g., rate limit exceeded) |
| `error` | Error conditions requiring attention |

## Client-Side Error Handling

### Recommended Pattern

```typescript
async function subscribe(email: string, publicationId: string) {
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, publicationId }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      // Handle specific error cases
      switch (response.status) {
        case 429:
          return { error: 'Please wait before trying again' }
        case 400:
          return { error: 'Invalid email address' }
        case 404:
          return { error: 'Newsletter not found' }
        default:
          return { error: data.error || 'An error occurred' }
      }
    }
    
    return { success: true, status: data.status }
  } catch (error) {
    return { error: 'Network error. Please check your connection.' }
  }
}
```

## Webhook Error Handling

### Resend Webhooks

The webhook endpoint handles various email events:

| Event Type | Description |
|------------|-------------|
| `email.sent` | Email successfully sent |
| `email.delivered` | Email delivered to recipient |
| `email.opened` | Recipient opened the email |
| `email.clicked` | Recipient clicked a link |
| `email.bounced` | Email bounced (hard/soft) |
| `email.complained` | Recipient marked as spam |

On bounce or complaint, subscribers are automatically updated:
- **Hard bounce**: Status set to `bounced`
- **Complaint**: Status set to `complained`

## Database Error Handling

Database operations use Supabase client and handle errors gracefully:

```typescript
const { data, error } = await supabase
  .from('subscribers')
  .insert({ ... })

if (error) {
  logger.error('Failed to create subscriber', error)
  return NextResponse.json(
    { error: 'Failed to subscribe. Please try again.' },
    { status: 500 }
  )
}
```

### Common Database Errors

| Error Code | Description | Handling |
|------------|-------------|----------|
| `PGRST116` | Row not found | Return 404 or continue with null handling |
| `23505` | Unique constraint violation | Handle duplicate entry case |
| `42501` | Permission denied | Check RLS policies |

## Best Practices

1. **Always log errors with context** - Include relevant IDs (user, publication, issue)
2. **Use structured logging** - JSON format for easy parsing
3. **Fail gracefully** - Rate limiting fails open on errors
4. **Validate early** - Use Zod schemas at API boundaries
5. **Don't expose internal errors** - Return generic messages to clients
6. **Audit sensitive operations** - Use the audit logger for security-relevant events
