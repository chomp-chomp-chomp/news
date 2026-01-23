/**
 * Web Template Registry
 *
 * Defines available web layout templates for publications
 */

export type WebTemplateId = 'classic' | 'magazine' | 'minimal' | 'blog' | 'newspaper'

export interface WebTemplateMetadata {
  id: WebTemplateId
  name: string
  description: string
  thumbnail: string
  bestFor: string[]
  features: string[]
}

export const WEB_TEMPLATES: Record<WebTemplateId, WebTemplateMetadata> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Current default layout with clean typography and standard spacing',
    thumbnail: '/templates/web/classic.png',
    bestFor: ['General newsletters', 'Standard content', 'Familiar layout'],
    features: ['Clean design', 'Standard spacing', 'Easy to read']
  },

  magazine: {
    id: 'magazine',
    name: 'Magazine',
    description: 'Bold, image-forward design with large featured images and prominent headlines',
    thumbnail: '/templates/web/magazine.png',
    bestFor: ['Visual content', 'Photo journalism', 'Feature stories'],
    features: ['Large hero images', 'Bold typography', 'Visual hierarchy']
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, distraction-free layout focused on typography and content',
    thumbnail: '/templates/web/minimal.png',
    bestFor: ['Essays', 'Long-form writing', 'Personal blogs'],
    features: ['Minimal design', 'Typography focus', 'Maximum readability']
  },

  blog: {
    id: 'blog',
    name: 'Blog',
    description: 'Casual blog-style layout with comfortable spacing and personal feel',
    thumbnail: '/templates/web/blog.png',
    bestFor: ['Personal updates', 'Casual writing', 'Commentary'],
    features: ['Relaxed spacing', 'Personal style', 'Conversational layout']
  },

  newspaper: {
    id: 'newspaper',
    name: 'Newspaper',
    description: 'Traditional newspaper layout with sections and compact information density',
    thumbnail: '/templates/web/newspaper.png',
    bestFor: ['News roundups', 'Multiple stories', 'Information-dense content'],
    features: ['Compact layout', 'Clear sections', 'High information density']
  }
}

export function getWebTemplateMetadata(templateId: WebTemplateId): WebTemplateMetadata {
  return WEB_TEMPLATES[templateId]
}

export function getAllWebTemplates(): WebTemplateMetadata[] {
  return Object.values(WEB_TEMPLATES)
}
