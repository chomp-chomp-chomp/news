/**
 * Email Template Registry
 *
 * Defines available email templates for publications
 */

export type EmailTemplateId = 'classic' | 'digest' | 'feature' | 'minimal' | 'newsletter'

export interface EmailTemplateMetadata {
  id: EmailTemplateId
  name: string
  description: string
  thumbnail: string
  bestFor: string[]
  features: string[]
}

export const EMAIL_TEMPLATES: Record<EmailTemplateId, EmailTemplateMetadata> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Clean, professional layout with prominent images and clear typography',
    thumbnail: '/templates/classic.png',
    bestFor: ['General newsletters', 'Content curation', 'Mixed content'],
    features: ['Large story images', 'Clear hierarchy', 'Social links in footer']
  },

  digest: {
    id: 'digest',
    name: 'Digest',
    description: 'Compact, link-focused layout perfect for news roundups and curated links',
    thumbnail: '/templates/digest.png',
    bestFor: ['Link roundups', 'News digests', 'Weekly summaries'],
    features: ['Compact story cards', 'Small thumbnails', 'High density']
  },

  feature: {
    id: 'feature',
    name: 'Feature',
    description: 'Bold, image-forward design with large hero image and focused content',
    thumbnail: '/templates/feature.png',
    bestFor: ['Feature stories', 'Single main article', 'Visual content'],
    features: ['Large hero image', 'Minimal distractions', 'Focus on one story']
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Text-focused, distraction-free layout emphasizing readability',
    thumbnail: '/templates/minimal.png',
    bestFor: ['Essays', 'Long-form writing', 'Text-heavy content'],
    features: ['No header images', 'Clean typography', 'Maximum readability']
  },

  newsletter: {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Traditional newsletter format with sections, borders, and classic styling',
    thumbnail: '/templates/newsletter.png',
    bestFor: ['Company updates', 'Community newsletters', 'Traditional format'],
    features: ['Sectioned layout', 'Table of contents', 'Classic newsletter style']
  }
}

export function getTemplateMetadata(templateId: EmailTemplateId): EmailTemplateMetadata {
  return EMAIL_TEMPLATES[templateId]
}

export function getAllTemplates(): EmailTemplateMetadata[] {
  return Object.values(EMAIL_TEMPLATES)
}
