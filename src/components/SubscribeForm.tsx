'use client'

import { useState } from 'react'
import { isValidEmail } from '@/lib/validation'

interface SubscribeFormProps {
  publicationId: string
}

export default function SubscribeForm({ publicationId }: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    // Client-side validation
    if (!isValidEmail(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ publicationId, email }),
      })

      const responseText = await response.text()
      const data = responseText ? safeParseJson(responseText) : null

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || 'Failed to subscribe'
        throw new Error(errorMessage)
      }

      if (!data) {
        throw new Error('Unexpected response from server. Please try again.')
      }

      setStatus('success')
      setMessage(data.message || 'Success! Check your email to confirm your subscription.')
      setEmail('')
    } catch (error) {
      setStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setMessage(errorMessage)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading' || status === 'success'}
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="btn btn-primary"
          style={{
            opacity: status === 'loading' || status === 'success' ? 0.6 : 1,
            cursor: status === 'loading' || status === 'success' ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: status === 'error' ? '#f8d7da' : '#d4edda',
            color: status === 'error' ? '#721c24' : '#155724',
            fontSize: '0.9rem',
          }}
        >
          {message}
        </div>
      )}

      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '1rem', textAlign: 'center' }}>
        We'll send you a confirmation email. No spam, unsubscribe anytime.
      </p>
    </div>
  )
}

function safeParseJson(payload: string) {
  try {
    return JSON.parse(payload)
  } catch {
    return null
  }
}
