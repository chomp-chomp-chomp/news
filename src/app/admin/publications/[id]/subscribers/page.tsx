import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requirePublicationAdmin } from '@/lib/auth'
import { getPublicationById } from '@/lib/db/publications'
import { getPublicationSubscribers } from '@/lib/db/subscribers'

interface PageProps {
  params: Promise<{ id: string }>
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return value
  }
}

export default async function PublicationSubscribersPage({ params }: PageProps) {
  const { id } = await params

  try {
    await requirePublicationAdmin(id)
  } catch {
    return notFound()
  }

  const [publication, subscribers] = await Promise.all([
    getPublicationById(id),
    getPublicationSubscribers(id),
  ])

  if (!publication) {
    return notFound()
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href={`/admin/publications/${id}`}
          style={{ fontSize: '0.9rem', color: 'var(--color-accent)', textDecoration: 'none' }}
        >
          ← Back to {publication.name}
        </Link>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          Subscribers
        </h1>
        <p className="text-muted">
          Manage subscribers for {publication.name}
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
            All Subscribers
          </h2>
          <span className="text-muted">
            {subscribers.length} total
          </span>
        </div>

        {subscribers.length === 0 ? (
          <p className="text-muted">No subscribers yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem' }}>{subscriber.email}</td>
                    <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>
                      {subscriber.status}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {formatDate(subscriber.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
