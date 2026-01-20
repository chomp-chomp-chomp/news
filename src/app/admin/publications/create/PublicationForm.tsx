'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'

type FormState = {
  error?: string
  success?: boolean
}

type Props = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
}

const initialState: FormState = {}

export default function PublicationForm({ action }: Props) {
  const [state, formAction] = useFormState(action, initialState)

  return (
    <div className="card" style={{ maxWidth: '800px' }}>
      {state.error && (
        <div
          style={{
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-md)',
            backgroundColor: 'var(--color-error-bg, #fee)',
            border: '1px solid var(--color-error, #c33)',
            borderRadius: '4px',
            color: 'var(--color-error, #c33)',
          }}
        >
          {state.error}
        </div>
      )}

      <form action={formAction}>
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          <div>
            <label htmlFor="name" className="form-label">
              Publication Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="My Newsletter"
              required
            />
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              The name of your newsletter as it appears to readers
            </p>
          </div>

          <div>
            <label htmlFor="slug" className="form-label">
              URL Slug *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="text-muted">/n/</span>
              <input
                type="text"
                id="slug"
                name="slug"
                className="form-input"
                placeholder="my-newsletter"
                pattern="[a-z0-9\-]+"
                title="Lowercase letters, numbers, and hyphens only"
                required
                style={{ flex: 1 }}
              />
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div>
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              placeholder="A brief description of your newsletter"
              rows={3}
            />
          </div>

          <div style={{
            paddingTop: 'var(--spacing-md)',
            borderTop: '1px solid var(--color-border)',
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)' }}>
              Email Settings
            </h3>

            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              <div>
                <label htmlFor="fromName" className="form-label">
                  From Name *
                </label>
                <input
                  type="text"
                  id="fromName"
                  name="fromName"
                  className="form-input"
                  placeholder="John Doe"
                  required
                />
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  The name that appears in the "From" field
                </p>
              </div>

              <div>
                <label htmlFor="fromEmail" className="form-label">
                  From Email *
                </label>
                <input
                  type="email"
                  id="fromEmail"
                  name="fromEmail"
                  className="form-input"
                  placeholder="newsletter@example.com"
                  required
                />
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Must be verified in your Resend account
                </p>
              </div>

              <div>
                <label htmlFor="replyToEmail" className="form-label">
                  Reply-To Email
                </label>
                <input
                  type="email"
                  id="replyToEmail"
                  name="replyToEmail"
                  className="form-input"
                  placeholder="replies@example.com"
                />
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Where replies are sent (defaults to From Email)
                </p>
              </div>
            </div>
          </div>

          <div style={{
            paddingTop: 'var(--spacing-md)',
            borderTop: '1px solid var(--color-border)',
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-md)' }}>
              Visibility
            </h3>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isPublic"
                defaultChecked
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <div>
                <div>Make this publication public</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Public publications appear on your site and can be discovered by readers
                </div>
              </div>
            </label>
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            paddingTop: 'var(--spacing-md)',
            borderTop: '1px solid var(--color-border)',
          }}>
            <button type="submit" className="btn btn-primary">
              Create Publication
            </button>
            <Link href="/admin/publications" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
