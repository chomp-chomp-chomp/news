import { createAdminClient } from '@/lib/supabase/server'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface LogContext {
  userId?: string
  publicationId?: string
  issueId?: string
  subscriberId?: string
  ipAddress?: string
  userAgent?: string
  [key: string]: any
}

/**
 * Structured logging utility
 */
export class Logger {
  private context: LogContext

  constructor(context: LogContext = {}) {
    this.context = context
  }

  /**
   * Add persistent context to all logs
   */
  withContext(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context })
  }

  /**
   * Log an info message
   */
  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  /**
   * Log a warning
   */
  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  /**
   * Log an error
   */
  error(message: string, error?: Error | any, data?: any) {
    this.log('error', message, {
      ...data,
      error: error?.message || error,
      stack: error?.stack,
    })
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data)
    }
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...data,
    }

    // Console output
    const consoleMethod = level === 'error' ? console.error : console.log
    consoleMethod(JSON.stringify(logEntry, null, 2))

    // For production, you might want to send to a logging service
    // like Sentry, LogRocket, or Datadog
  }

  /**
   * Log audit event to database
   */
  async audit(action: string, data?: {
    entityType?: string
    entityId?: string
    changes?: any
  }) {
    try {
      const supabase = await createAdminClient()

      await supabase.from('audit_logs').insert({
        user_id: this.context.userId || null,
        publication_id: this.context.publicationId || null,
        action,
        entity_type: data?.entityType || null,
        entity_id: data?.entityId || null,
        changes: data?.changes || null,
        ip_address: this.context.ipAddress || null,
        user_agent: this.context.userAgent || null,
      })
    } catch (error) {
      // Don't let audit logging errors break the application
      console.error('Audit log error:', error)
    }
  }
}

/**
 * Create a logger instance
 */
export function createLogger(context?: LogContext): Logger {
  return new Logger(context)
}

/**
 * Log webhook events
 */
export async function logWebhookEvent(
  type: string,
  payload: any,
  context?: LogContext
) {
  const logger = createLogger(context)
  logger.info(`Webhook received: ${type}`, { payload })

  // Store in send_events table if it's a Resend webhook
  if (type.startsWith('email.')) {
    try {
      const supabase = await createAdminClient()

      await supabase.from('send_events').insert({
        subscriber_id: context?.subscriberId || null,
        issue_id: context?.issueId || null,
        type,
        payload,
        resend_event_id: payload.id || null,
      })
    } catch (error) {
      logger.error('Failed to store webhook event', error)
    }
  }
}

/**
 * Log subscriber events
 */
export async function logSubscriberEvent(
  subscriberId: string,
  event: 'subscribed' | 'confirmed' | 'unsubscribed' | 'bounced' | 'complained',
  context?: LogContext
) {
  const logger = createLogger({ ...context, subscriberId })
  logger.info(`Subscriber event: ${event}`)

  await logger.audit(`subscriber.${event}`, {
    entityType: 'subscriber',
    entityId: subscriberId,
  })
}
