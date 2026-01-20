'use client'

import { useState } from 'react'

interface List {
  id: string
  publication_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

interface Props {
  publicationId: string
  initialLists: List[]
}

export function ListManagement({ publicationId, initialLists }: Props) {
  const [lists, setLists] = useState(initialLists)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicationId, name, description }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create list')
      }

      setMessage({ type: 'success', text: 'List created successfully!' })
      setName('')
      setDescription('')
      setShowCreateForm(false)
      setLists([...lists, data])
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create list' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {message && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : '+ Create List'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Create New List</h3>
          <form onSubmit={handleCreateList}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="list-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                List Name
              </label>
              <input
                id="list-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., VIP Subscribers, Weekly Digest"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="list-description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Description (optional)
              </label>
              <textarea
                id="list-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this list..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create List'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>All Lists ({lists.length})</h2>

        {lists.length === 0 ? (
          <p className="text-muted">No lists yet. Create your first list to organize subscribers.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {lists.map((list) => (
              <div
                key={list.id}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{list.name}</h3>
                {list.description && <p className="text-muted" style={{ marginBottom: '0.5rem' }}>{list.description}</p>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <a
                    href={`/admin/publications/${publicationId}/lists/${list.id}/subscribers`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.9rem' }}
                  >
                    Manage Subscribers
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
