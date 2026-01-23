import { WebTemplateId } from './registry'
import { RenderModel } from '@/lib/render-model'

// Import all web templates
import ClassicWebTemplate from './templates/classic'
import MagazineWebTemplate from './templates/magazine'
import MinimalWebTemplate from './templates/minimal'
import BlogWebTemplate from './templates/blog'
import NewspaperWebTemplate from './templates/newspaper'

// Template component map
const WEB_TEMPLATE_COMPONENTS = {
  classic: ClassicWebTemplate,
  magazine: MagazineWebTemplate,
  minimal: MinimalWebTemplate,
  blog: BlogWebTemplate,
  newspaper: NewspaperWebTemplate,
}

/**
 * Get the web template component for a given template ID
 */
export function getWebTemplateComponent(templateId: WebTemplateId) {
  return WEB_TEMPLATE_COMPONENTS[templateId] || WEB_TEMPLATE_COMPONENTS.classic
}

/**
 * Render the appropriate web template for a publication
 */
export function renderWebTemplate(
  renderModel: RenderModel,
  templateId: WebTemplateId = 'classic'
) {
  const TemplateComponent = getWebTemplateComponent(templateId)
  return <TemplateComponent renderModel={renderModel} />
}
