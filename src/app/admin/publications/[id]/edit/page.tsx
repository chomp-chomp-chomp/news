import { redirect } from 'next/navigation'
import { requirePublicationAdmin } from '@/lib/auth'
import { getPublicationById, updatePublication } from '@/lib/db/publications'
import { notFound } from 'next/navigation'
import PublicationForm from '../../create/PublicationForm'
import { FormState } from '../../create/types'
import DeletePublicationButton from '@/components/admin/DeletePublicationButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPublicationPage({ params }: PageProps) {
  const { id } = await params

  try {
    await requirePublicationAdmin(id)
  } catch {
    return notFound()
  }

  const publication = await getPublicationById(id)
  if (!publication) {
    return notFound()
  }

  async function updatePublicationAction(
    prevState: FormState,
    formData: FormData
  ): Promise<FormState> {
    'use server'

    try {
      await requirePublicationAdmin(id)

      const name = formData.get('name') as string
      const description = formData.get('description') as string
      const fromName = formData.get('fromName') as string
      const fromEmail = formData.get('fromEmail') as string
      const replyToEmail = formData.get('replyToEmail') as string
      const emailTemplate = formData.get('emailTemplate') as string
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
      if (!name || !fromName || !fromEmail) {
        return {
          error: 'Missing required fields: name, from name, and from email are required',
          success: false
        }
      }

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

      // Don't allow changing the slug to prevent breaking existing URLs
      // Only update other fields
      await updatePublication(id, {
        name,
        description: description || null,
        from_name: fromName,
        from_email: fromEmail,
        reply_to_email: replyToEmail || null,
        email_template: emailTemplate || 'classic',
        is_public: isPublic,
        brand: Object.keys(brand).length > 0 ? brand : {},
      })

      // Redirect on success - redirect() throws a special error that Next.js handles
      redirect(`/admin/publications/${id}`)
    } catch (error) {
      // Re-throw redirect errors so Next.js can handle them
      if (error && typeof error === 'object' && 'digest' in error && 
          String(error.digest).startsWith('NEXT_REDIRECT')) {
        throw error
      }
      
      console.error('Failed to update publication:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      return {
        error: `Failed to update publication: ${errorMessage}`,
        success: false
      }
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Edit Publication
        </h1>
        <p className="text-muted">Update your newsletter settings</p>
      </div>

      <PublicationForm 
        action={updatePublicationAction}
        initialData={publication}
        cancelHref={`/admin/publications/${id}`}
        submitLabel="Update Publication"
        disableSlugEdit
      />

      {/* Danger Zone */}
      <div className="card" style={{ marginTop: '3rem', borderColor: 'var(--color-danger)', borderWidth: '2px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--color-danger-text)' }}>
          Danger Zone
        </h2>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
          Deleting this publication is permanent and cannot be undone. This will also delete all issues, content blocks, and subscribers associated with this publication.
        </p>
        <DeletePublicationButton
          publicationId={publication.id}
          publicationName={publication.name}
        />
      </div>
    </div>
  )
}
