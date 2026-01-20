import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const extractSchema = z.object({
  url: z.string().url(),
})

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth()

    // Parse and validate request
    const body = await request.json()
    const { url } = extractSchema.parse(body)

    console.log('Extracting metadata from URL:', url)

    // Fetch the page with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsletterBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    if (!response.ok) {
      console.error('Failed to fetch URL:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      )
    }

    const html = await response.text()
    console.log('Fetched HTML, length:', html.length)

    // Extract metadata using regex (simple but effective for Open Graph tags)
    const metadata = {
      title: extractMeta(html, 'og:title') || extractTag(html, 'title') || '',
      description:
        extractMeta(html, 'og:description') ||
        extractMeta(html, 'description') ||
        extractMeta(html, 'twitter:description') ||
        '',
      image:
        extractMeta(html, 'og:image') ||
        extractMeta(html, 'twitter:image') ||
        extractFirstImage(html) ||
        '',
      siteName: extractMeta(html, 'og:site_name') || '',
      url: extractMeta(html, 'og:url') || url,
    }

    console.log('Extracted metadata:', metadata)

    // Clean up the description - get first paragraph if it's too long
    if (metadata.description.length > 300) {
      metadata.description = metadata.description.substring(0, 297) + '...'
    }

    return NextResponse.json({
      success: true,
      metadata,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid URL format', details: error.issues },
        { status: 400 }
      )
    }

    // Handle abort/timeout errors
    if (error.name === 'AbortError') {
      console.error('Extract URL timeout:', error)
      return NextResponse.json(
        { error: 'Request timed out while fetching URL' },
        { status: 408 }
      )
    }

    // Handle network errors
    if (error.cause && error.cause.code) {
      console.error('Extract URL network error:', error.cause.code, error.message)
      return NextResponse.json(
        { error: `Network error: ${error.message}` },
        { status: 500 }
      )
    }

    console.error('Extract URL error:', error)
    return NextResponse.json(
      { error: 'Failed to extract URL metadata', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Extract meta tag content by property or name
 */
function extractMeta(html: string, property: string): string | null {
  // Try property attribute first (Open Graph)
  const propertyRegex = new RegExp(
    `<meta[^>]*property=["']${escapeRegex(property)}["'][^>]*content=["']([^"']*)["']`,
    'i'
  )
  let match = html.match(propertyRegex)
  if (match) return decodeHtml(match[1])

  // Try name attribute (standard meta tags)
  const nameRegex = new RegExp(
    `<meta[^>]*name=["']${escapeRegex(property)}["'][^>]*content=["']([^"']*)["']`,
    'i'
  )
  match = html.match(nameRegex)
  if (match) return decodeHtml(match[1])

  // Try reversed order (content before property/name)
  const reversedPropertyRegex = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${escapeRegex(property)}["']`,
    'i'
  )
  match = html.match(reversedPropertyRegex)
  if (match) return decodeHtml(match[1])

  const reversedNameRegex = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${escapeRegex(property)}["']`,
    'i'
  )
  match = html.match(reversedNameRegex)
  if (match) return decodeHtml(match[1])

  return null
}

/**
 * Extract content from HTML tag
 */
function extractTag(html: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i')
  const match = html.match(regex)
  return match ? decodeHtml(match[1].trim()) : null
}

/**
 * Extract first image from HTML
 */
function extractFirstImage(html: string): string | null {
  const imgRegex = /<img[^>]*src=["']([^"']*)["']/i
  const match = html.match(imgRegex)
  return match ? match[1] : null
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Decode HTML entities
 */
function decodeHtml(html: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  }

  return html.replace(/&[^;]+;/g, (entity) => entities[entity] || entity)
}
