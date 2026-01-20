import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createPublication } from '@/lib/db/publications'
import Link from 'next/link'
import PublicationForm from './PublicationForm'

type FormState = {
  error?: string
  success?: boolean
}

export default async function NewPublicationPage() {
  await requireAuth()

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

      // Basic validation
      if (!name || !slug || !fromName || !fromEmail) {
        return {
          error: 'Missing required fields: name, slug, from name, and from email are required',
          success: false
        }
      }

      console.log('Creating publication with:', { name, slug, fromName, fromEmail })

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
        },
        user.id
      )

      console.log('Publication created:', publication.id)

      redirect(`/admin/publications/${publication.id}`)
    } catch (error) {
      console.error('Failed to create publication:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      return {
        error: `Failed to create publication: ${errorMessage}`,
        success: false
      }
    }
  }

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
