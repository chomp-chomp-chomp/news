import Link from 'next/link'
import { getPublicPublications } from '@/lib/db/publications'
import { getSiteSettings } from '@/lib/db/site-settings'
import { Database } from '@/types/database'
import { createClient } from '@/lib/supabase/server'

type Publication = Database['public']['Tables']['publications']['Row']

export default async function HomePage() {
  const settings = await getSiteSettings()

  let publications: Publication[]
  try {
    publications = await getPublicPublications()
  } catch (error) {
    console.error('Failed to load publications:', error)
    publications = []
  }

  // Check if user is authenticated (admin)
  let isAdmin = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isAdmin = !!user
  } catch {
    isAdmin = false
  }

  return (
    <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)', position: 'relative' }}>
      {/* Admin Edit Button */}
      {isAdmin && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <Link
            href="/admin/settings"
            className="btn btn-secondary"
            style={{ fontSize: '0.9rem' }}
          >
            ✏️ Edit Site Settings
          </Link>
        </div>
      )}

      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        {settings.site_logo_url && (
          <img
            src={settings.site_logo_url}
            alt={settings.site_name}
            style={{
              maxWidth: '200px',
              height: 'auto',
              marginBottom: '1.5rem',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          />
        )}
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{settings.site_name}</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          {settings.site_description}
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>All Newsletters</h2>
        {publications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No newsletters available yet.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-md)',
          }}>
            {publications.map((pub) => (
              <Link href={`/n/${pub.slug}`} key={pub.id} className="card" style={{
                textDecoration: 'none',
                color: 'inherit',
              }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{pub.name}</h3>
                {pub.description && (
                  <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {pub.description}
                  </p>
                )}
                <div style={{ marginTop: '1rem' }}>
                  <span style={{ color: 'var(--color-accent)', fontSize: '0.9rem', fontWeight: 500 }}>
                    Subscribe →
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
