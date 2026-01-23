import { EmailTemplateId } from './registry'
import { RenderModel } from '@/lib/render-model'

// Import all email templates
import ClassicEmail from './templates/classic'
import DigestEmail from './templates/digest'
import FeatureEmail from './templates/feature'
import MinimalEmail from './templates/minimal'
import NewsletterEmail from './templates/newsletter'

// Template component map
const TEMPLATE_COMPONENTS = {
  classic: ClassicEmail,
  digest: DigestEmail,
  feature: FeatureEmail,
  minimal: MinimalEmail,
  newsletter: NewsletterEmail,
}

/**
 * Get the email template component for a given template ID
 */
export function getTemplateComponent(templateId: EmailTemplateId) {
  return TEMPLATE_COMPONENTS[templateId] || TEMPLATE_COMPONENTS.classic
}

/**
 * Render the appropriate email template for a publication
 */
export function renderEmailTemplate(
  renderModel: RenderModel,
  templateId: EmailTemplateId = 'classic'
) {
  const TemplateComponent = getTemplateComponent(templateId)
  return TemplateComponent({ renderModel })
}
