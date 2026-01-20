'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
      <h2 style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>
        Failed to Create Publication
      </h2>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        {error.message || 'An error occurred while creating the publication'}
      </p>
      <button onClick={reset} className="btn btn-primary">
        Try Again
      </button>
    </div>
  )
}
