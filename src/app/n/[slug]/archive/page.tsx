import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPublicationBySlug } from '@/lib/db/publications'
import { getPublishedIssues } from '@/lib/db/issues'
import { format } from 'date-fns'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ArchivePage({ params }: PageProps) {
  const { slug } = await params

  const publication = await getPublicationBySlug(slug)

  if (!publication || !publication.is_public) {
    notFound()
  }

  const issues = await getPublishedIssues(publication.id)

  return (
    <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
        <Link href="/">Home</Link>
        <span style={{ margin: '0 0.5rem', color: 'var(--color-text-muted)' }}>→</span>
        <Link href={`/n/${slug}`}>{publication.name}</Link>
        <span style={{ margin: '0 0.5rem', color: 'var(--color-text-muted)' }}>→</span>
        <span>Archive</span>
      </nav>

      {/* Header */}
      <section style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Archive</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          All issues from {publication.name}
        </p>
      </section>

      {/* Issues List */}
      <section>
        {issues.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No issues published yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {issues.map((issue) => (
              <Link
                href={`/n/${slug}/${issue.slug}`}
                key={issue.id}
                className="card"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>
                      {issue.subject}
                    </h3>
                    {issue.preheader && (
                      <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                        {issue.preheader}
                      </p>
                    )}
                  </div>
                  {issue.published_at && (
                    <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {format(new Date(issue.published_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
