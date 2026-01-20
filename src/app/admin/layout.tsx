import { requireAuth, getUserPublications } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import { Database } from '@/types/database'

type Publication = Database['public']['Tables']['publications']['Row']

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const publications = await getUserPublications(user.id)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: 'var(--color-sidebar)',
        borderRight: '1px solid var(--color-border)',
        padding: 'var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Newsletter Admin</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            {user.email}
          </p>
        </div>

        <nav style={{ flex: 1 }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              Main
            </h3>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/admin" style={{
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.2s',
                }}>
                  Dashboard
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/admin/publications" style={{
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.2s',
                }}>
                  Publications
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/admin/settings" style={{
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.2s',
                }}>
                  Site Settings
                </Link>
              </li>
            </ul>
          </div>

          {publications.length > 0 && (
            <div>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                Your Publications
              </h3>
              <ul style={{ listStyle: 'none' }}>
                {publications.map((pub: Publication) => (
                  <li key={pub.id} style={{ marginBottom: '0.5rem' }}>
                    <Link href={`/admin/publications/${pub.id}`} style={{
                      display: 'block',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s',
                    }}>
                      {pub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <Link href="/" className="btn btn-secondary" style={{ width: '100%', marginBottom: '0.5rem', justifyContent: 'center' }}>
            View Public Site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 'var(--spacing-xl)', maxWidth: '1200px' }}>
        {children}
      </main>
    </div>
  )
}
