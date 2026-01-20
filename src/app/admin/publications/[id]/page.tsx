import Link from 'next/link'
import { requirePublicationAdmin } from '@/lib/auth'
import { getPublicationById, getPublicationStats } from '@/lib/db/publications'
import { getPublicationIssues } from '@/lib/db/issues'
import { getPublicationSubscribers } from '@/lib/db/subscribers'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicationManagePage({ params }: PageProps) {
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

  const [issues, subscribers, stats] = await Promise.all([
    getPublicationIssues(id),
    getPublicationSubscribers(id),
    getPublicationStats(id),
  ])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{publication.name}</h1>
        {publication.description && (
          <p className="text-muted">{publication.description}</p>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-md)',
        marginBottom: '3rem',
      }}>
        <div className="card">
          <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Active Subscribers
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 500 }}>{stats.active_count}</div>
        </div>
        <div className="card">
          <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Total Issues
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 500 }}>{issues.length}</div>
        </div>
        <div className="card">
          <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Pending Subscribers
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 500 }}>{stats.pending_count}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <Link href={`/admin/publications/${id}/issues/create`} className="btn btn-primary">
          New Issue
        </Link>
        <Link href={`/admin/publications/${id}/edit`} className="btn btn-secondary">
          Edit Settings
        </Link>
        <Link href={`/admin/publications/${id}/subscribers`} className="btn btn-secondary">
          Manage Subscribers
        </Link>
        <Link href={`/admin/publications/${id}/lists`} className="btn btn-secondary">
          Manage Lists
        </Link>
        <Link href={`/n/${publication.slug}`} className="btn btn-secondary">
          View Public Page
        </Link>
      </div>

      {/* Recent Issues */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Issues</h2>
        {issues.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="text-muted">No issues yet. Create your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
            {issues.map((issue) => (
              <Link href={`/admin/publications/${id}/issues/${issue.id}`} key={issue.id} className="card" style={{
                textDecoration: 'none',
                color: 'inherit',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{issue.subject}</h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                      <span className="text-muted">
                        Status: <strong>{issue.status}</strong>
                      </span>
                      {issue.published_at && (
                        <span className="text-muted">
                          Published: {format(new Date(issue.published_at), 'MMM d, yyyy')}
                        </span>
                      )}
                      {issue.status === 'sent' && (
                        <span className="text-muted">
                          Sent to: <strong>{issue.send_count}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: issue.status === 'draft' ? '#fff3cd' : issue.status === 'sent' ? '#d4edda' : 'var(--color-sidebar)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                  }}>
                    {issue.status}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Subscribers */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.75rem' }}>Recent Subscribers</h2>
          <Link href={`/admin/publications/${id}/subscribers`} style={{ fontSize: '0.9rem' }}>
            View all →
          </Link>
        </div>
        {subscribers.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="text-muted">No subscribers yet.</p>
          </div>
        ) : (
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.slice(0, 5).map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem' }}>{sub.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: sub.status === 'active' ? '#d4edda' : sub.status === 'pending' ? '#fff3cd' : '#f8d7da',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                      }}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="text-muted" style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                      {format(new Date(sub.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
