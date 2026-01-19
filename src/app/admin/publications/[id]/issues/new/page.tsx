import { redirect } from 'next/navigation'
import { requirePublicationAdmin } from '@/lib/auth'
import { getPublicationById } from '@/lib/db/publications'
import { createIssue } from '@/lib/db/issues'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewIssuePage({ params }: PageProps) {
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

  async function createIssueAction(formData: FormData) {
    'use server'

    await requirePublicationAdmin(id)

    const subject = formData.get('subject') as string
    const slug = formData.get('slug') as string
    const preheader = formData.get('preheader') as string

    // Basic validation
    if (!subject || !slug) {
      throw new Error('Subject and slug are required')
    }

    // Create issue
    const issue = await createIssue({
      publication_id: id,
      subject,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      preheader: preheader || null,
      status: 'draft',
    })

    redirect(`/admin/publications/${id}/issues/${issue.id}`)
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          New Issue
        </h1>
        <p className="text-muted">
          Create a new issue for {publication.name}
        </p>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form action={createIssueAction}>
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            <div>
              <label htmlFor="subject" className="form-label">
                Subject Line *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="form-input"
                placeholder="Your Newsletter Subject"
                required
              />
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                This appears in the email subject line
              </p>
            </div>

            <div>
              <label htmlFor="slug" className="form-label">
                URL Slug *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="text-muted">/n/{publication.slug}/</span>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  className="form-input"
                  placeholder="issue-01"
                  pattern="[a-z0-9-]+"
                  required
                  style={{ flex: 1 }}
                />
              </div>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <div>
              <label htmlFor="preheader" className="form-label">
                Preheader Text
              </label>
              <input
                type="text"
                id="preheader"
                name="preheader"
                className="form-input"
                placeholder="Preview text that appears after the subject"
                maxLength={150}
              />
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Optional text that appears after the subject in email clients (max 150 characters)
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: 'var(--spacing-sm)',
              paddingTop: 'var(--spacing-md)',
              borderTop: '1px solid var(--color-border)',
            }}>
              <button type="submit" className="btn btn-primary">
                Create Issue
              </button>
              <Link href={`/admin/publications/${id}`} className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
