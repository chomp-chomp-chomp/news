import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPublicationBySlug } from '@/lib/db/publications'
import { getIssueBySlug } from '@/lib/db/issues'
import { getRenderModelFromDb } from '@/lib/render-model'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import IssueRenderer from '@/components/IssueRenderer'

interface PageProps {
  params: Promise<{ slug: string; issueSlug: string }>
}

export default async function IssuePage({ params }: PageProps) {
  const { slug, issueSlug } = await params

  const publication = await getPublicationBySlug(slug)

  if (!publication || !publication.is_public) {
    notFound()
  }

  const issue = await getIssueBySlug(publication.id, issueSlug)

  if (!issue || !['published', 'sent'].includes(issue.status)) {
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
      {/* Header */}
      <div className="container" style={{ marginBottom: '2rem' }}>
        <nav style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
          <Link href="/">Home</Link>
          <span style={{ margin: '0 0.5rem', color: 'var(--color-text-muted)' }}>→</span>
          <Link href={`/n/${slug}`}>{publication.name}</Link>
          <span style={{ margin: '0 0.5rem', color: 'var(--color-text-muted)' }}>→</span>
          <span>{issue.subject}</span>
        </nav>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 500, marginBottom: '0.5rem' }}>{issue.subject}</h1>
          {issue.published_at && (
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
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
          <Link href={`/n/${slug}`} className="btn btn-primary">
            Subscribe to {publication.name}
          </Link>
        </div>
      </div>
    </main>
  )
}
