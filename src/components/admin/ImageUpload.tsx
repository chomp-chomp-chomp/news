'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  onUpload: (url: string) => void
  currentImage?: string
  label?: string
}

export default function ImageUpload({ onUpload, currentImage, label = 'Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentImage || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      // Get authentication parameters from our API
      const authResponse = await fetch('/api/imagekit/auth')
      if (!authResponse.ok) {
        const errorData = await authResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to get authentication (${authResponse.status}: ${authResponse.statusText})`)
      }

      const authData = await authResponse.json()

      // Validate auth data
      if (!authData.signature || !authData.token || !authData.urlEndpoint) {
        throw new Error('Invalid authentication response')
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', file.name)
      formData.append('signature', authData.signature)
      formData.append('expire', authData.expire)
      formData.append('token', authData.token)
      formData.append('publicKey', authData.publicKey)

      // Upload to ImageKit
      const uploadResponse = await fetch(`${authData.urlEndpoint}/api/v1/files/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `Upload failed (${uploadResponse.status}: ${uploadResponse.statusText})`)
      }

      const result = await uploadResponse.json()

      // Validate upload result
      if (!result.url) {
        throw new Error('Upload succeeded but no URL returned')
      }

      // Set preview and call callback
      setPreviewUrl(result.url)
      onUpload(result.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="form-label">{label}</label>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
      }}>
        {previewUrl && (
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            {uploading ? 'Uploading...' : previewUrl ? 'Change Image' : 'Upload Image'}
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={() => {
                setPreviewUrl('')
                onUpload('')
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="btn btn-secondary"
              style={{ borderColor: '#dc3545', color: '#dc3545' }}
            >
              Remove
            </button>
          )}
        </div>

        {!previewUrl && (
          <div>
            <input
              type="url"
              className="form-input"
              placeholder="Or paste image URL"
              value={currentImage || ''}
              onChange={(e) => {
                setPreviewUrl(e.target.value)
                onUpload(e.target.value)
              }}
            />
          </div>
        )}
      </div>

      <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
        Upload an image or paste a URL. Max 5MB. Supports JPG, PNG, GIF, WebP.
      </p>
    </div>
  )
}
