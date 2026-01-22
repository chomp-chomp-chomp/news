import { createAdminClient } from './supabase/server'
import { createLogger } from './logger'

const logger = createLogger({ context: 'url-shortener' })

interface ShortenUrlResponse {
  success: boolean
  shortUrl?: string
  shortCode?: string
  error?: string
}

/**
 * Shortens a URL using the chom.pm API with database caching.
 * Falls back to the original URL if shortening fails.
 *
 * @param originalUrl - The full URL to shorten
 * @returns The shortened URL or original URL on failure
 */
export async function shortenUrl(originalUrl: string): Promise<string> {
  // Validate input
  if (!originalUrl || typeof originalUrl !== 'string') {
    logger.warn('Invalid URL provided to shortenUrl', { originalUrl })
    return originalUrl
  }

  // Trim whitespace
  const trimmedUrl = originalUrl.trim()
  if (!trimmedUrl) {
    return originalUrl
  }

  // Check if API key is configured
  const apiKey = process.env.URL_SHORTENER_API_KEY
  if (!apiKey) {
    logger.warn('URL_SHORTENER_API_KEY not configured, using original URL')
    return originalUrl
  }

  try {
    // Check cache first
    const supabase = await createAdminClient()
    const { data: cached, error: cacheError } = await supabase
      .from('url_shortener_cache')
      .select('short_url')
      .eq('original_url', trimmedUrl)
      .single()

    if (cacheError && cacheError.code !== 'PGRST116') {
      // PGRST116 is "not found", which is expected for cache misses
      logger.error('Error checking URL shortener cache', { error: cacheError })
    }

    if (cached?.short_url) {
      logger.info('URL shortener cache hit', { originalUrl: trimmedUrl })
      return cached.short_url
    }

    // Cache miss - call the API
    logger.info('URL shortener cache miss, calling API', { originalUrl: trimmedUrl })

    const response = await fetch('https://chom.pm/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ url: trimmedUrl }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('URL shortener API error', {
        status: response.status,
        error: errorText,
        originalUrl: trimmedUrl,
      })
      return originalUrl // Graceful fallback
    }

    const result: ShortenUrlResponse = await response.json()

    if (!result.success || !result.shortUrl) {
      logger.error('URL shortener API returned unsuccessful response', { result })
      return originalUrl // Graceful fallback
    }

    // Store in cache
    const { error: insertError } = await supabase
      .from('url_shortener_cache')
      .insert({
        original_url: trimmedUrl,
        short_url: result.shortUrl,
        short_code: result.shortCode || '',
      })

    if (insertError) {
      // Log but don't fail - we still have the shortened URL
      logger.error('Error caching shortened URL', { error: insertError })
    } else {
      logger.info('Shortened URL cached successfully', {
        originalUrl: trimmedUrl,
        shortUrl: result.shortUrl,
      })
    }

    return result.shortUrl
  } catch (error) {
    logger.error('Unexpected error in shortenUrl', { error, originalUrl: trimmedUrl })
    return originalUrl // Graceful fallback
  }
}

/**
 * Shortens multiple URLs in parallel with caching.
 *
 * @param urls - Array of URLs to shorten
 * @returns Array of shortened URLs (or original URLs on failure)
 */
export async function shortenUrls(urls: string[]): Promise<string[]> {
  return Promise.all(urls.map(url => shortenUrl(url)))
}

/**
 * Checks if URL shortening is enabled (API key configured).
 */
export function isUrlShorteningEnabled(): boolean {
  return !!process.env.URL_SHORTENER_API_KEY
}
