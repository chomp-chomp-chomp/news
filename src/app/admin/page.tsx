import Link from 'next/link'
import { requireAuth, getUserPublications } from '@/lib/auth'
import { getPublicationStats } from '@/lib/db/publications'
import { getPublicationIssues } from '@/lib/db/issues'
import { Database } from '@/types/database'
import GrantSeedAccessButton from '@/components/admin/GrantSeedAccessButton'

type Publication = Database['public']['Tables']['publications']['Row']

export default async function AdminDashboard() {
  const user = await requireAuth()
  const publications = await getUserPublications(user.id)

  // Get stats for each publication
  const pubsWithStats = await Promise.all(
    publications.map(async (pub: Publication) => {
      const stats = await getPublicationStats(pub.id)
      const issues = await getPublicationIssues(pub.id)
      return { ...pub, stats, issueCount: issues.length }
    })
  )

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p className="text-muted">Manage your newsletters</p>
      </div>

      {publications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Welcome!</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>
            You don't have any publications yet. Get started by creating a new newsletter or accessing the demo publication.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Link href="/admin/publications/create" className="btn btn-primary">
              Create New Publication
            </Link>
            <div style={{ margin: '0.5rem 0', color: 'var(--color-text-muted)' }}>or</div>
            <GrantSeedAccessButton />
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          {pubsWithStats.map((pub) => (
            <Link href={`/admin/publications/${pub.id}`} key={pub.id} className="card" style={{
              textDecoration: 'none',
              color: 'inherit',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{pub.name}</h3>
                  {pub.description && (
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                      {pub.description}
                    </p>
                  )}
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: pub.is_public ? 'var(--color-sidebar)' : '#f8d7da',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                }}>
                  {pub.is_public ? 'Public' : 'Private'}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-border)',
              }}>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    Active Subscribers
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                    {pub.stats.active_count}
                  </div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    Total Subscribers
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                    {pub.stats.total_count}
                  </div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    Issues
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                    {pub.issueCount}
                  </div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    Pending
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                    {pub.stats.pending_count}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
