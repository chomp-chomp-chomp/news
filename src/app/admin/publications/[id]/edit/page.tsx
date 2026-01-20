import { redirect } from 'next/navigation'
import { requirePublicationAdmin } from '@/lib/auth'
import { getPublicationById, updatePublication } from '@/lib/db/publications'
import { notFound } from 'next/navigation'
import PublicationForm from '../../create/PublicationForm'
import { FormState } from '../../create/types'

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
      const isPublic = formData.get('isPublic') === 'on'

      // Basic validation
      if (!name || !fromName || !fromEmail) {
        return {
          error: 'Missing required fields: name, from name, and from email are required',
          success: false
        }
      }

      // Don't allow changing the slug to prevent breaking existing URLs
      // Only update other fields
      await updatePublication(id, {
        name,
        description: description || null,
        from_name: fromName,
        from_email: fromEmail,
        reply_to_email: replyToEmail || null,
        is_public: isPublic,
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
    </div>
  )
}
