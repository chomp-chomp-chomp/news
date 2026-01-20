'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { FormState } from './types'
import { Database } from '@/types/database'

type Publication = Database['public']['Tables']['publications']['Row']

type Props = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  initialData?: Publication
  cancelHref?: string
  submitLabel?: string
  disableSlugEdit?: boolean
}

const initialState: FormState = {}

export default function PublicationForm({ 
  action, 
  initialData, 
  cancelHref = '/admin/publications',
  submitLabel = 'Create Publication',
  disableSlugEdit = false
}: Props) {
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
              defaultValue={initialData?.name}
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
                defaultValue={initialData?.slug}
                pattern="[a-z0-9\-]+"
                title="Lowercase letters, numbers, and hyphens only"
                required
                disabled={disableSlugEdit}
                style={{ flex: 1, ...(disableSlugEdit ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
              />
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {disableSlugEdit ? 'URL slug cannot be changed after creation' : 'Lowercase letters, numbers, and hyphens only'}
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
              defaultValue={initialData?.description || ''}
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
                  defaultValue={initialData?.from_name}
                  required
                />
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  The name that appears in the &quot;From&quot; field
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
                  defaultValue={initialData?.from_email}
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
                  defaultValue={initialData?.reply_to_email || ''}
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
              Branding
            </h3>

            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              <div>
                <label htmlFor="logoUrl" className="form-label">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  className="form-input"
                  placeholder="https://example.com/logo.png"
                  defaultValue={(initialData?.brand as any)?.logo_url || ''}
                />
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  URL to your publication logo (displayed in emails and public pages)
                </p>
              </div>

              <div>
                <label htmlFor="accentColor" className="form-label">
                  Accent Color
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    id="accentColor"
                    name="accentColor"
                    defaultValue={(initialData?.brand as any)?.accent_color || '#e73b42'}
                    style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="#e73b42"
                    defaultValue={(initialData?.brand as any)?.accent_color || ''}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    title="Hex color code (e.g., #e73b42)"
                    style={{ flex: 1 }}
                    onChange={(e) => {
                      const colorPicker = document.getElementById('accentColor') as HTMLInputElement
                      if (colorPicker && /^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        colorPicker.value = e.target.value
                      }
                    }}
                  />
                </div>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Primary color used for links and accents in your emails
                </p>
              </div>

              <div>
                <label htmlFor="headerImageUrl" className="form-label">
                  Header Image URL
                </label>
                <input
                  type="url"
                  id="headerImageUrl"
                  name="headerImageUrl"
                  className="form-input"
                  placeholder="https://example.com/header.png"
                  defaultValue={(initialData?.brand as any)?.header_image_url || ''}
                />
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Optional header image for your email template
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
                defaultChecked={initialData?.is_public ?? true}
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
              {submitLabel}
            </button>
            <Link href={cancelHref} className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
