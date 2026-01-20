'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SiteSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    site_name: '',
    site_description: '',
    favicon_url: '',
    site_logo_url: '',
    og_image_url: '',
    twitter_image_url: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      
      const data = await response.json()
      setSettings({
        site_name: data.site_name || '',
        site_description: data.site_description || '',
        favicon_url: data.favicon_url || '',
        site_logo_url: data.site_logo_url || '',
        og_image_url: data.og_image_url || '',
        twitter_image_url: data.twitter_image_url || '',
      })
    } catch (error) {
      console.error('Error fetching settings:', error)
      alert('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save settings')
      }

      alert('Settings saved successfully!')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving settings:', error)
      alert(`Failed to save settings: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  function handleChange(field: string, value: string) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Site Settings</h1>
        <div className="card">
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href="/admin"
          style={{ fontSize: '0.9rem', color: 'var(--color-accent)', textDecoration: 'none' }}
        >
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '0' }}>
          Site Settings
        </h1>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>
          Manage global site configuration settings
        </p>
      </div>

      <form onSubmit={saveSettings}>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)' }}>
            General Settings
          </h2>
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            <div>
              <label className="form-label">Site Name</label>
              <input
                type="text"
                className="form-input"
                value={settings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                placeholder="Newsletter Platform"
              />
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                The name of your site
              </p>
            </div>

            <div>
              <label className="form-label">Site Description</label>
              <textarea
                className="form-input"
                value={settings.site_description}
                onChange={(e) => handleChange('site_description', e.target.value)}
                placeholder="A platform for creating and sending newsletters"
                rows={3}
              />
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                A brief description of your site
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)' }}>
            Branding
          </h2>
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            <div>
              <label className="form-label">Favicon URL</label>
              <input
                type="url"
                className="form-input"
                value={settings.favicon_url}
                onChange={(e) => handleChange('favicon_url', e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                The URL to your site's favicon (appears in browser tabs)
              </p>
            </div>

            <div>
              <label className="form-label">Site Logo URL</label>
              <input
                type="url"
                className="form-input"
                value={settings.site_logo_url}
                onChange={(e) => handleChange('site_logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                The URL to your site's main logo
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)' }}>
            Social Media
          </h2>
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            <div>
              <label className="form-label">Open Graph Image URL</label>
              <input
                type="url"
                className="form-input"
                value={settings.og_image_url}
                onChange={(e) => handleChange('og_image_url', e.target.value)}
                placeholder="https://example.com/og-image.png"
              />
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Image displayed when sharing on Facebook, LinkedIn, etc. (1200x630px recommended)
              </p>
            </div>

            <div>
              <label className="form-label">Twitter Image URL</label>
              <input
                type="url"
                className="form-input"
                value={settings.twitter_image_url}
                onChange={(e) => handleChange('twitter_image_url', e.target.value)}
                placeholder="https://example.com/twitter-image.png"
              />
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Image displayed when sharing on Twitter/X (1200x600px recommended)
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <Link href="/admin" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
