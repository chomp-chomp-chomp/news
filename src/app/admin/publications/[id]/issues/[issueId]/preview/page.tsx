import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requirePublicationAdmin } from '@/lib/auth'
import { getPublicationById } from '@/lib/db/publications'
import { getIssueById } from '@/lib/db/issues'
import { getRenderModelFromDb } from '@/lib/render-model'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import IssueRenderer from '@/components/IssueRenderer'

interface PageProps {
  params: Promise<{ id: string; issueId: string }>
}

export default async function IssuePreviewPage({ params }: PageProps) {
  const { id, issueId } = await params

  try {
    // Require admin authentication to preview draft issues
    await requirePublicationAdmin(id)
  } catch {
    return notFound()
  }

  const publication = await getPublicationById(id)

  if (!publication) {
    notFound()
  }

  const issue = await getIssueById(issueId)

  if (!issue || issue.publication_id !== id) {
    notFound()
  }

  const supabase = await createClient()
  const renderModel = await getRenderModelFromDb(supabase, issue.id, {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL,
  })

  if (!renderModel) {
    notFound()
  }

  return (
    <main style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-xl)' }}>
      {/* Preview Banner */}
      <div style={{
        background: 'var(--color-warning-bg)',
        borderBottom: '1px solid var(--color-warning)',
        padding: 'var(--spacing-sm)',
        textAlign: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-md)',
        }}>
          <span style={{ color: 'var(--color-warning-text)', fontWeight: 500 }}>
            📝 Preview Mode - This is how your issue will look when published
          </span>
          <Link 
            href={`/admin/publications/${id}/issues/${issueId}`}
            className="btn btn-sm"
            style={{ flexShrink: 0 }}
          >
            Back to Editor
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="container" style={{ marginBottom: '2rem' }}>
        <nav style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
          <Link href="/">Home</Link>
          <span style={{ margin: '0 0.5rem', color: 'var(--color-text-muted)' }}>→</span>
          <Link href={`/n/${publication.slug}`}>{publication.name}</Link>
          <span style={{ margin: '0 0.5rem', color: 'var(--color-text-muted)' }}>→</span>
          <span>{issue.subject}</span>
        </nav>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{issue.subject}</h1>
          {issue.published_at && (
            <p className="text-muted">
              {format(new Date(issue.published_at), 'MMMM d, yyyy')}
            </p>
          )}
        </div>
      </div>

      {/* Issue Content */}
      <IssueRenderer renderModel={renderModel} />

      {/* Footer */}
      <div className="container" style={{ marginTop: '3rem', textAlign: 'center' }}>
        <div style={{
          padding: '2rem',
          borderTop: '1px solid var(--color-border)',
        }}>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            Enjoyed this issue?
          </p>
          <Link href={`/n/${publication.slug}`} className="btn btn-primary">
            Subscribe to {publication.name}
          </Link>
        </div>
      </div>
    </main>
  )
}
