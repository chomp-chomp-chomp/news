// Typed block data structures

export interface StoryBlockData {
  title: string
  image_url?: string
  image_alt?: string
  link: string
  blurb: string
  publication_name?: string
}

export interface PromoBlockData {
  title: string
  content: string
  link?: string
  link_text?: string
  background_color?: string
}

export interface TextBlockData {
  content: string
  alignment?: 'left' | 'center' | 'right'
}

export interface DividerBlockData {
  style?: 'simple' | 'decorative' | 'spacer'
}

export interface ImageBlockData {
  url: string
  alt: string
  caption?: string
  link?: string
}

export interface FooterBlockData {
  content: string
}

export type BlockData =
  | StoryBlockData
  | PromoBlockData
  | TextBlockData
  | DividerBlockData
  | ImageBlockData
  | FooterBlockData

export type BlockType = 'story' | 'promo' | 'text' | 'divider' | 'image' | 'footer'

// Footer content structure
export interface FooterContent {
  text: string
  social_links?: Array<{
    platform: string
    url: string
    label?: string
  }>
  address?: string
}

// Publication brand structure
export interface PublicationBrand {
  logo_url?: string
  accent_color?: string
  header_image_url?: string
}

// Subscriber metadata
export interface SubscriberMetadata {
  source?: string
  tags?: string[]
  custom_fields?: Record<string, any>
}
