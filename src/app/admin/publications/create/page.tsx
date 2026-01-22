import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createPublication } from '@/lib/db/publications'
import PublicationForm from './PublicationForm'
import { FormState } from './types'

async function createPublicationAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  'use server'

  try {
    const user = await requireAuth()

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const fromName = formData.get('fromName') as string
    const fromEmail = formData.get('fromEmail') as string
    const replyToEmail = formData.get('replyToEmail') as string
    const isPublic = formData.get('isPublic') === 'on'

    // Branding fields
    const logoUrl = formData.get('logoUrl') as string
    const logoUrlLight = formData.get('logoUrlLight') as string
    const logoUrlDark = formData.get('logoUrlDark') as string
    const accentColor = formData.get('accentColor') as string
    const headerImageUrl = formData.get('headerImageUrl') as string
    const fontFamily = formData.get('fontFamily') as string
    const fontSize = formData.get('fontSize') as string

    // Basic validation
    if (!name || !slug || !fromName || !fromEmail) {
      return {
        error: 'Missing required fields: name, slug, from name, and from email are required',
        success: false
      }
    }

    console.log('Creating publication with:', { name, slug, fromName, fromEmail })

    // Build brand object
    interface BrandSettings {
      logo_url?: string
      logo_url_light?: string
      logo_url_dark?: string
      accent_color?: string
      header_image_url?: string
      font_family?: string
      font_size?: string
      [key: string]: string | undefined
    }

    const brand: BrandSettings = {}
    if (logoUrl) brand.logo_url = logoUrl
    if (logoUrlLight) brand.logo_url_light = logoUrlLight
    if (logoUrlDark) brand.logo_url_dark = logoUrlDark
    if (accentColor) brand.accent_color = accentColor
    if (headerImageUrl) brand.header_image_url = headerImageUrl
    if (fontFamily) brand.font_family = fontFamily
    if (fontSize) brand.font_size = fontSize

    // Create publication
    const publication = await createPublication(
      {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        description: description || null,
        from_name: fromName,
        from_email: fromEmail,
        reply_to_email: replyToEmail || null,
        is_public: isPublic,
        brand: Object.keys(brand).length > 0 ? brand : {},
      },
      user.id
    )

    console.log('Publication created:', publication.id)

    // Redirect on success - redirect() throws a special error that Next.js handles
    redirect(`/admin/publications/${publication.id}`)
  } catch (error) {
    // Re-throw redirect errors so Next.js can handle them
    if (error && typeof error === 'object' && 'digest' in error &&
        String(error.digest).startsWith('NEXT_REDIRECT')) {
      throw error
    }

    console.error('Failed to create publication:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return {
      error: `Failed to create publication: ${errorMessage}`,
      success: false
    }
  }
}

export default async function NewPublicationPage() {
  await requireAuth()

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Create Publication
        </h1>
        <p className="text-muted">Set up your new newsletter</p>
      </div>

      <PublicationForm action={createPublicationAction} />
    </div>
  )
}
