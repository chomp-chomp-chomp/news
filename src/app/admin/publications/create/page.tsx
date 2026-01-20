import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createPublication } from '@/lib/db/publications'
import Link from 'next/link'

export default async function NewPublicationPage() {
  await requireAuth()

  async function createPublicationAction(formData: FormData) {
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
        throw new Error('Missing required fields')
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
      throw error
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

      <div className="card" style={{ maxWidth: '800px' }}>
        <form action={createPublicationAction}>
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            <div>
              <label htmlFor="name" className="form-label">
                Publication Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="My Newsletter"
                required
              />
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                The name of your newsletter as it appears to readers
              </p>
            </div>

            <div>
              <label htmlFor="slug" className="form-label">
                URL Slug *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="text-muted">/n/</span>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  className="form-input"
                  placeholder="my-newsletter"
                  pattern="[a-z0-9\-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                  required
                  style={{ flex: 1 }}
                />
              </div>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <div>
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="form-input"
                placeholder="A brief description of your newsletter"
                rows={3}
              />
            </div>

            <div style={{
              paddingTop: 'var(--spacing-md)',
              borderTop: '1px solid var(--color-border)',
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)' }}>
                Email Settings
              </h3>

              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                <div>
                  <label htmlFor="fromName" className="form-label">
                    From Name *
                  </label>
                  <input
                    type="text"
                    id="fromName"
                    name="fromName"
                    className="form-input"
                    placeholder="John Doe"
                    required
                  />
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    The name that appears in the "From" field
                  </p>
                </div>

                <div>
                  <label htmlFor="fromEmail" className="form-label">
                    From Email *
                  </label>
                  <input
                    type="email"
                    id="fromEmail"
                    name="fromEmail"
                    className="form-input"
                    placeholder="newsletter@example.com"
                    required
                  />
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Must be verified in your Resend account
                  </p>
                </div>

                <div>
                  <label htmlFor="replyToEmail" className="form-label">
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    id="replyToEmail"
                    name="replyToEmail"
                    className="form-input"
                    placeholder="replies@example.com"
                  />
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Where replies are sent (defaults to From Email)
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              paddingTop: 'var(--spacing-md)',
              borderTop: '1px solid var(--color-border)',
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)' }}>
                Visibility
              </h3>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="isPublic"
                  defaultChecked
                  style={{ width: '1.25rem', height: '1.25rem' }}
                />
                <div>
                  <div>Make this publication public</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Public publications appear on your site and can be discovered by readers
                  </div>
                </div>
              </label>
            </div>

            <div style={{
              display: 'flex',
              gap: 'var(--spacing-sm)',
              paddingTop: 'var(--spacing-md)',
              borderTop: '1px solid var(--color-border)',
            }}>
              <button type="submit" className="btn btn-primary">
                Create Publication
              </button>
              <Link href="/admin/publications" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
