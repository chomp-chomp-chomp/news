import { Database } from '@/types/database'
import {
  BlockData,
  BlockType,
  FooterContent,
  PublicationBrand,
  StoryBlockData,
  PromoBlockData,
  ImageBlockData,
} from '@/types/blocks'
import { shortenUrl } from './url-shortener'
import { createLogger } from './logger'

const logger = createLogger({ context: 'render-model' })

type Publication = Database['public']['Tables']['publications']['Row']
type Issue = Database['public']['Tables']['issues']['Row']
type Block = Database['public']['Tables']['blocks']['Row']
type DefaultFooter = Database['public']['Tables']['default_footers']['Row']

export interface RenderBlock {
  id: string
  type: BlockType
  sortOrder: number
  data: BlockData
}

export interface RenderModel {
  // Publication info
  publication: {
    id: string
    name: string
    slug: string
    brand: PublicationBrand
    fromName: string
    fromEmail: string
    email_template: string | null
  }

  // Issue info
  issue: {
    id: string
    slug: string
    subject: string
    preheader: string | null
    publishedAt: string | null
  }

  // Content blocks (including footer)
  blocks: RenderBlock[]

  // Footer content
  footer: FooterContent | null

  // URLs for web version
  urls: {
    webVersion: string
    unsubscribe: string
    publicationHome: string
  }
}

/**
 * Build a complete render model for an issue
 */
export function buildRenderModel(
  publication: Publication,
  issue: Issue,
  blocks: Block[],
  footer: DefaultFooter | null,
  options: {
    unsubscribeToken?: string
    baseUrl?: string
  } = {}
): RenderModel {
  const baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_APP_URL || ''

  // Sort blocks by sort_order
  const sortedBlocks = [...blocks].sort((a, b) => a.sort_order - b.sort_order)

  // Map blocks to render format
  const renderBlocks: RenderBlock[] = sortedBlocks.map((block) => ({
    id: block.id,
    type: block.type as BlockType,
    sortOrder: block.sort_order,
    data: block.data as BlockData,
  }))

  // Add footer block if not already present
  const hasFooterBlock = renderBlocks.some((b) => b.type === 'footer')
  if (!hasFooterBlock && footer) {
    renderBlocks.push({
      id: 'footer-auto',
      type: 'footer',
      sortOrder: 9999,
      data: footer.content as BlockData,
    })
  }

  return {
    publication: {
      id: publication.id,
      name: publication.name,
      slug: publication.slug,
      brand: (publication.brand as PublicationBrand) || {},
      fromName: publication.from_name,
      fromEmail: publication.from_email,
      email_template: publication.email_template,
    },
    issue: {
      id: issue.id,
      slug: issue.slug,
      subject: issue.subject,
      preheader: issue.preheader,
      publishedAt: issue.published_at,
    },
    blocks: renderBlocks,
    footer: footer ? (footer.content as unknown as FooterContent) : null, // Type assertion needed due to Json type limitations
    urls: {
      webVersion: `${baseUrl}/n/${publication.slug}/${issue.slug}`,
      unsubscribe: options.unsubscribeToken
        ? `${baseUrl}/api/unsubscribe?token=${options.unsubscribeToken}`
        : `${baseUrl}/n/${publication.slug}/unsubscribe`,
      publicationHome: `${baseUrl}/n/${publication.slug}`,
    },
  }
}

/**
 * Get render model from database
 */
export async function getRenderModelFromDb(
  supabase: any,
  issueId: string,
  options: {
    unsubscribeToken?: string
    baseUrl?: string
  } = {}
): Promise<RenderModel | null> {
  // Fetch issue with publication
  const { data: issue, error: issueError } = await supabase
    .from('issues')
    .select('*, publication:publications(*)')
    .eq('id', issueId)
    .single()

  if (issueError || !issue) {
    return null
  }

  // Fetch blocks
  const { data: blocks, error: blocksError } = await supabase
    .from('blocks')
    .select('*')
    .eq('issue_id', issueId)
    .order('sort_order')

  if (blocksError) {
    return null
  }

  // Fetch footer
  const footerId =
    issue.footer_override_id || issue.publication.default_footer_id
  let footer = null

  if (footerId) {
    const { data: footerData } = await supabase
      .from('default_footers')
      .select('*')
      .eq('id', footerId)
      .single()

    footer = footerData
  }

  return buildRenderModel(
    issue.publication,
    issue,
    blocks || [],
    footer,
    options
  )
}

/**
 * Process a render model and shorten all content URLs.
 * Shortens URLs in story blocks, promo blocks, image blocks, and footer social links.
 * Does NOT shorten system URLs like unsubscribe and web version links.
 *
 * @param renderModel - The render model to process
 * @returns A new render model with shortened URLs
 */
export async function shortenRenderModelUrls(
  renderModel: RenderModel
): Promise<RenderModel> {
  try {
    // Create a deep copy to avoid mutating the original
    const processedModel: RenderModel = JSON.parse(JSON.stringify(renderModel))

    // Collect all URLs that need to be shortened
    const urlMap = new Map<string, string>() // original URL -> shortened URL

    // Process each block
    for (const block of processedModel.blocks) {
      if (block.type === 'story') {
        const data = block.data as StoryBlockData
        if (data.link) {
          urlMap.set(data.link, data.link)
        }
      } else if (block.type === 'promo') {
        const data = block.data as PromoBlockData
        if (data.link) {
          urlMap.set(data.link, data.link)
        }
      } else if (block.type === 'image') {
        const data = block.data as ImageBlockData
        if (data.link) {
          urlMap.set(data.link, data.link)
        }
      }
    }

    // Process footer social links
    if (processedModel.footer?.social_links) {
      for (const socialLink of processedModel.footer.social_links) {
        if (socialLink.url) {
          urlMap.set(socialLink.url, socialLink.url)
        }
      }
    }

    // If no URLs to shorten, return the original model
    if (urlMap.size === 0) {
      logger.info('No URLs to shorten in render model')
      return renderModel
    }

    // Shorten all URLs in parallel
    const originalUrls = Array.from(urlMap.keys())
    logger.info(`Shortening ${originalUrls.length} URLs`, {
      issueId: processedModel.issue.id,
    })

    const shortenedUrls = await Promise.all(
      originalUrls.map(url => shortenUrl(url))
    )

    // Update the map with shortened URLs
    originalUrls.forEach((originalUrl, index) => {
      urlMap.set(originalUrl, shortenedUrls[index])
    })

    // Replace URLs in blocks
    for (const block of processedModel.blocks) {
      if (block.type === 'story') {
        const data = block.data as StoryBlockData
        if (data.link && urlMap.has(data.link)) {
          data.link = urlMap.get(data.link)!
        }
      } else if (block.type === 'promo') {
        const data = block.data as PromoBlockData
        if (data.link && urlMap.has(data.link)) {
          data.link = urlMap.get(data.link)!
        }
      } else if (block.type === 'image') {
        const data = block.data as ImageBlockData
        if (data.link && urlMap.has(data.link)) {
          data.link = urlMap.get(data.link)!
        }
      }
    }

    // Replace URLs in footer social links
    if (processedModel.footer?.social_links) {
      for (const socialLink of processedModel.footer.social_links) {
        if (socialLink.url && urlMap.has(socialLink.url)) {
          socialLink.url = urlMap.get(socialLink.url)!
        }
      }
    }

    logger.info('Successfully shortened URLs in render model', {
      issueId: processedModel.issue.id,
      urlCount: urlMap.size,
    })

    return processedModel
  } catch (error) {
    logger.error('Error shortening render model URLs', { error })
    // Return original model on error (graceful fallback)
    return renderModel
  }
}
