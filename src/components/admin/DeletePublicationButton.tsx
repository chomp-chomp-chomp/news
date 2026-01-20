'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeletePublicationButtonProps {
  publicationId: string
  publicationName: string
}

export default function DeletePublicationButton({ publicationId, publicationName }: DeletePublicationButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/publications/${publicationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete publication')
      }

      // Redirect to admin page
      router.push('/admin')
      router.refresh()
    } catch (error: any) {
      console.error('Delete error:', error)
      alert(`Failed to delete publication: ${error.message}`)
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <>
      {!showConfirm ? (
        <button
          onClick={handleDelete}
          className="btn"
          style={{
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger-text)',
            border: '1px solid var(--color-danger)',
          }}
          disabled={isDeleting}
        >
          Delete Publication
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-danger-text)' }}>
            Delete "{publicationName}"? This will also delete all issues and subscribers.
          </span>
          <button
            onClick={handleDelete}
            className="btn btn-sm"
            style={{
              backgroundColor: 'var(--color-danger)',
              color: 'white',
            }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
          <button
            onClick={handleCancel}
            className="btn btn-sm btn-secondary"
            disabled={isDeleting}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  )
}
