'use client'

import { useState } from 'react'

interface Subscriber {
  id: string
  email: string
  status: string
  created_at: string
}

interface Props {
  publicationId: string
  subscribers: Subscriber[]
}

export function SubscriberManagement({ publicationId, subscribers }: Props) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [showImportForm, setShowImportForm] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [importResults, setImportResults] = useState<{ imported: number; duplicates: number; errors: string[] } | null>(null)

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicationId, email: email.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add subscriber')
      }

      setMessage({ type: 'success', text: 'Subscriber added successfully!' })
      setEmail('')
      setShowAddForm(false)
      // Refresh the page to show new subscriber
      window.location.reload()
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to add subscriber' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault()
    const fileInput = document.getElementById('csv-file') as HTMLInputElement
    const file = fileInput?.files?.[0]

    if (!file) {
      setMessage({ type: 'error', text: 'Please select a CSV file' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)
    setImportResults(null)

    try {
      const text = await file.text()
      
      const response = await fetch(`/api/admin/subscribers/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicationId, csvContent: text }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import subscribers')
      }

      setImportResults(data)
      setMessage({ type: 'success', text: `Import complete! ${data.imported} subscriber(s) added.` })
      setShowImportForm(false)
      
      // Refresh after a delay to show results
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to import subscribers' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/admin/subscribers/export?publicationId=${publicationId}`)
      
      if (!response.ok) {
        throw new Error('Failed to export subscribers')
      }

      const csvContent = await response.text()
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setMessage({ type: 'success', text: 'Subscribers exported successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export subscribers' })
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

      {importResults && importResults.errors.length > 0 && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeeba',
          }}
        >
          <strong>Import Warnings:</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
            {importResults.errors.slice(0, 5).map((error, i) => (
              <li key={i}>{error}</li>
            ))}
            {importResults.errors.length > 5 && <li>...and {importResults.errors.length - 5} more</li>}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Subscriber'}
        </button>
        <button className="btn btn-secondary" onClick={() => setShowImportForm(!showImportForm)}>
          {showImportForm ? 'Cancel' : 'Import CSV'}
        </button>
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          Export CSV
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Add Single Subscriber</h3>
          <form onSubmit={handleAddSubscriber}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="subscriber@example.com"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Subscriber'}
            </button>
          </form>
        </div>
      )}

      {showImportForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Import Subscribers from CSV</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            Upload a CSV file with at least an &quot;email&quot; column. Imported subscribers will be automatically activated.
          </p>
          <form onSubmit={handleImportCSV}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                required
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.25rem',
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Importing...' : 'Import CSV'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
