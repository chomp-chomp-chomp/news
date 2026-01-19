import Link from 'next/link'
import { getPublicPublications } from '@/lib/db/publications'

export default async function HomePage() {
  let publications
  try {
    publications = await getPublicPublications()
  } catch (error) {
    console.error('Failed to load publications:', error)
    publications = []
  }

  return (
    <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Newsletter Platform</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Subscribe to quality newsletters curated by experts
        </p>
      </section>

      <section>
        <h2 style={{ marginBottom: '2rem' }}>All Newsletters</h2>
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
