import Link from 'next/link'

interface ErrorPageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const { message } = await searchParams
  const errorMessage = message || 'An error occurred'

  return (
    <main className="container" style={{
      paddingTop: 'var(--spacing-xl)',
      paddingBottom: 'var(--spacing-xl)',
      textAlign: 'center',
      minHeight: '50vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Oops!</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        {errorMessage}
      </p>
      <Link href="/" className="btn btn-primary">
        Go Home
      </Link>
    </main>
  )
}
