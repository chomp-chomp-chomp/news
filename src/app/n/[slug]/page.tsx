import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPublicationBySlug, getPublicationStats } from '@/lib/db/publications'
import { getPublishedIssues } from '@/lib/db/issues'
import SubscribeForm from '@/components/SubscribeForm'
import { format } from 'date-fns'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ message?: string }>
}

export default async function PublicationPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { message } = await searchParams

  const publication = await getPublicationBySlug(slug)

  if (!publication || !publication.is_public) {
    notFound()
  }

  const issues = await getPublishedIssues(publication.id)
  const stats = await getPublicationStats(publication.id)

  return (
    <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      {/* Header */}
      <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{publication.name}</h1>
        {publication.description && (
          <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', maxWidth: '700px', margin: '0 auto 2rem' }}>
            {publication.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          <div>
            <strong>{stats.active_count}</strong> subscribers
          </div>
          <div>
            <strong>{issues.length}</strong> issues
          </div>
        </div>
      </section>

      {/* Messages */}
      {message && (
        <div className="card" style={{
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: message === 'confirmed' || message === 'already_subscribed'
            ? '#d4edda'
            : message === 'unsubscribed' || message === 'already_unsubscribed'
            ? '#f8d7da'
            : 'var(--color-surface)',
          borderColor: message === 'confirmed' || message === 'already_subscribed'
            ? '#c3e6cb'
            : message === 'unsubscribed' || message === 'already_unsubscribed'
            ? '#f5c6cb'
            : 'var(--color-border)',
        }}>
          {message === 'confirmed' && '✓ Subscription confirmed! You\'ll receive new issues via email.'}
          {message === 'already_subscribed' && 'You\'re already subscribed to this newsletter.'}
          {message === 'unsubscribed' && 'You\'ve been unsubscribed. We\'re sorry to see you go!'}
          {message === 'already_unsubscribed' && 'You\'re not subscribed to this newsletter.'}
        </div>
      )}

      {/* Subscribe Form */}
      <section style={{ marginBottom: '4rem' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Subscribe</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Get the latest issues delivered to your inbox
          </p>
          <SubscribeForm publicationId={publication.id} />
        </div>
      </section>

      {/* Recent Issues */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Recent Issues</h2>
          {issues.length > 3 && (
            <Link href={`/n/${slug}/archive`} style={{ fontSize: '0.9rem' }}>
              View all →
            </Link>
          )}
        </div>

        {issues.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No issues published yet.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: 'var(--spacing-md)',
          }}>
            {issues.slice(0, 3).map((issue) => (
              <Link href={`/n/${slug}/${issue.slug}`} key={issue.id} className="card" style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{issue.subject}</h3>
                  {issue.published_at && (
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {format(new Date(issue.published_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                {issue.preheader && (
                  <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {issue.preheader}
                  </p>
                )}
                <div style={{ marginTop: '1rem' }}>
                  <span style={{ color: 'var(--color-accent)', fontSize: '0.9rem', fontWeight: 500 }}>
                    Read issue →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
