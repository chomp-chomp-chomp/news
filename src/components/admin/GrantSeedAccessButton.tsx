'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GrantSeedAccessButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGrantAccess = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/grant-seed-access', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to grant access')
      }

      // Success! Refresh the page to show the new publication
      router.refresh()
    } catch (err) {
      console.error('Grant access error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleGrantAccess}
        className="btn btn-secondary"
        disabled={isLoading}
        style={{ marginBottom: '0.5rem' }}
      >
        {isLoading ? 'Granting Access...' : 'Access "Chomp Weekly" Demo'}
      </button>
      {error && (
        <p style={{ color: 'var(--color-danger-text)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          {error}
        </p>
      )}
      <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
        Grant yourself admin access to the seed publication to explore features
      </p>
    </div>
  )
}
