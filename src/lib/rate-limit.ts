import { createAdminClient } from '@/lib/supabase/server'

export interface RateLimitConfig {
  identifier: string // IP address, email, or other unique identifier
  endpoint: string // API endpoint being rate limited
  maxRequests: number // Maximum requests allowed in window
  windowMs: number // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

/**
 * Check if a request is within rate limits
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabase = await createAdminClient()
  const windowStart = new Date(Date.now() - config.windowMs)

  // Get or create rate limit record
  const { data: existing, error: fetchError } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', config.identifier)
    .eq('endpoint', config.endpoint)
    .gte('window_start', windowStart.toISOString())
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 is "not found" error
    console.error('Rate limit check error:', fetchError)
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMs),
    }
  }

  if (!existing) {
    // First request in this window
    const { error: insertError } = await supabase.from('rate_limits').insert({
      identifier: config.identifier,
      endpoint: config.endpoint,
      count: 1,
      window_start: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Rate limit insert error:', insertError)
    }

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(Date.now() + config.windowMs),
    }
  }

  // Check if limit exceeded
  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(
        new Date(existing.window_start).getTime() + config.windowMs
      ),
    }
  }

  // Increment counter
  const { error: updateError } = await supabase
    .from('rate_limits')
    .update({ count: existing.count + 1 })
    .eq('id', existing.id)

  if (updateError) {
    console.error('Rate limit update error:', updateError)
  }

  return {
    allowed: true,
    remaining: config.maxRequests - (existing.count + 1),
    resetAt: new Date(
      new Date(existing.window_start).getTime() + config.windowMs
    ),
  }
}

/**
 * Get IP address from request headers
 */
export function getClientIp(headers: Headers): string {
  // Check various headers for IP address
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return 'unknown'
}

/**
 * Clean up old rate limit records (call periodically)
 */
export async function cleanupOldRateLimits() {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('rate_limits')
    .delete()
    .lt('window_start', new Date(Date.now() - 3600000).toISOString()) // 1 hour ago

  if (error) {
    console.error('Rate limit cleanup error:', error)
  }
}

// Preset rate limit configurations
export const RATE_LIMITS = {
  subscribe: {
    maxRequests: parseInt(
      process.env.RATE_LIMIT_SUBSCRIBE_PER_HOUR || '5'
    ),
    windowMs: 3600000, // 1 hour
  },
  sendTest: {
    maxRequests: parseInt(
      process.env.RATE_LIMIT_SEND_TEST_PER_HOUR || '10'
    ),
    windowMs: 3600000, // 1 hour
  },
  api: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
} as const
