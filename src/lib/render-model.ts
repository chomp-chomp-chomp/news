import { Database } from '@/types/database'
import {
  BlockData,
  BlockType,
  FooterContent,
  PublicationBrand,
} from '@/types/blocks'

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
