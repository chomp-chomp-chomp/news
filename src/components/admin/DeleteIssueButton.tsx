'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeleteIssueButtonProps {
  issueId: string
  publicationId: string
  issueSubject: string
}

export default function DeleteIssueButton({ issueId, publicationId, issueSubject }: DeleteIssueButtonProps) {
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
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete issue')
      }

      // Redirect to publication page
      router.push(`/admin/publications/${publicationId}`)
      router.refresh()
    } catch (error: any) {
      console.error('Delete error:', error)
      alert(`Failed to delete issue: ${error.message}`)
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
          Delete Issue
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-danger-text)' }}>
            Delete "{issueSubject}"?
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
