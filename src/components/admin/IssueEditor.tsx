'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'
import RichTextEditor from './RichTextEditor'
import DeleteIssueButton from './DeleteIssueButton'
import { Database } from '@/types/database'
import { Json } from '@/types/database'
import { jsonToRecord, getStringFromJson } from '@/lib/json-utils'

type Publication = Database['public']['Tables']['publications']['Row']
type Issue = Database['public']['Tables']['issues']['Row']
type Block = {
  id: string
  issue_id: string
  type: 'story' | 'promo' | 'text' | 'divider' | 'image' | 'footer'
  sort_order: number
  data: Json
  created_at: string
  updated_at: string
}

interface IssueEditorProps {
  publication: Publication
  issue: Issue
  blocks: Block[]
}

export default function IssueEditor({ publication, issue, blocks: initialBlocks }: IssueEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [subject, setSubject] = useState(issue.subject)
  const [preheader, setPreheader] = useState(issue.preheader || '')
  const [status, setStatus] = useState(issue.status)

  const [showAddBlock, setShowAddBlock] = useState(false)
  const [extractUrl, setExtractUrl] = useState('')
  const [extracting, setExtracting] = useState(false)

  async function saveIssueMetadata() {
    setSaving(true)
    try {
      interface UpdateData {
        subject: string
        preheader: string
        status: 'draft' | 'published' | 'sent' | 'scheduled'
        published_at?: string
      }
      
      const updateData: UpdateData = { subject, preheader, status }
      
      // If changing to published status and not already published, set published_at
      if (status === 'published' && issue.status !== 'published') {
        updateData.published_at = new Date().toISOString()
      }
      
      const response = await fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) throw new Error('Failed to save')

      router.refresh()
    } catch (error) {
      alert('Failed to save issue')
    } finally {
      setSaving(false)
    }
  }

  async function addBlock(type: Block['type']) {
    try {
      const response = await fetch(`/api/issues/${issue.id}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          sort_order: blocks.length,
          data: getDefaultBlockData(type),
        }),
      })

      if (!response.ok) throw new Error('Failed to add block')

      const newBlock = await response.json()
      setBlocks([...blocks, newBlock])
      setShowAddBlock(false)
    } catch (error) {
      alert('Failed to add block')
    }
  }

  async function updateBlock(blockId: string, data: Json) {
    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })

      if (!response.ok) throw new Error('Failed to update block')

      const updatedBlock = await response.json()
      setBlocks(blocks.map(b => b.id === blockId ? updatedBlock : b))
    } catch (error) {
      alert('Failed to update block')
    }
  }

  async function deleteBlock(blockId: string) {
    if (!confirm('Delete this block?')) return

    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete block')

      setBlocks(blocks.filter(b => b.id !== blockId))
    } catch (error) {
      alert('Failed to delete block')
    }
  }

  async function moveBlock(blockId: string, direction: 'up' | 'down') {
    const index = blocks.findIndex(b => b.id === blockId)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === blocks.length - 1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newBlocks = [...blocks]
    const [removed] = newBlocks.splice(index, 1)
    newBlocks.splice(newIndex, 0, removed)

    setBlocks(newBlocks)

    // Save new order to backend
    try {
      await fetch(`/api/issues/${issue.id}/blocks/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockIds: newBlocks.map(b => b.id),
        }),
      })
    } catch (error) {
      alert('Failed to reorder blocks')
    }
  }

  async function extractFromUrl() {
    if (!extractUrl) return

    setExtracting(true)
    try {
      const response = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: extractUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to extract URL (${response.status}: ${response.statusText})`)
      }

      const data = await response.json()

      // Validate response structure
      if (!data.metadata) {
        throw new Error('Invalid response: missing metadata')
      }

      const { metadata } = data

      // Create a story block with extracted data
      const storyResponse = await fetch(`/api/issues/${issue.id}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'story',
          sort_order: blocks.length,
          data: {
            title: metadata.title || '',
            blurb: metadata.description || '',
            image_url: metadata.image || '',
            image_alt: metadata.title || '',
            link: metadata.url || extractUrl,
          },
        }),
      })

      if (!storyResponse.ok) {
        const errorData = await storyResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to create story block (${storyResponse.status}: ${storyResponse.statusText})`)
      }

      const newBlock = await storyResponse.json()
      setBlocks([...blocks, newBlock])
      setExtractUrl('')
      setShowAddBlock(false)
    } catch (error: any) {
      alert(`Failed to extract URL: ${error.message}`)
    } finally {
      setExtracting(false)
    }
  }

  async function sendTestEmail() {
    const email = prompt('Enter test email address:')
    if (!email) return

    try {
      const response = await fetch('/api/send/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: issue.id,
          testEmail: email,
        }),
      })

      if (!response.ok) throw new Error('Failed to send test')

      alert('Test email sent!')
    } catch (error) {
      alert('Failed to send test email')
    }
  }

  function getDefaultBlockData(type: Block['type']) {
    switch (type) {
      case 'story':
        return { title: '', blurb: '', image_url: '', image_alt: '', link: '' }
      case 'promo':
        return { title: '', content: '', link: '', link_text: 'Learn More', background_color: '#f5f5f5' }
      case 'text':
        return { content: '', alignment: 'left' }
      case 'divider':
        return { style: 'solid' }
      case 'image':
        return { url: '', alt: '', caption: '', link: '' }
      case 'footer':
        return { content: '' }
      default:
        return {}
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link
            href={`/admin/publications/${publication.id}`}
            style={{ fontSize: '0.9rem', color: 'var(--color-accent)', textDecoration: 'none' }}
          >
            ← Back to {publication.name}
          </Link>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '0' }}>
            Edit Issue
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button onClick={sendTestEmail} className="btn btn-secondary">
            Send Test
          </button>
          <Link href={`/admin/publications/${publication.id}/issues/${issue.id}/preview`} className="btn btn-secondary">
            Preview
          </Link>
        </div>
      </div>

      {/* Issue Metadata */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)' }}>
          Issue Details
        </h2>
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          <div>
            <label className="form-label">Subject Line</label>
            <input
              type="text"
              className="form-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onBlur={saveIssueMetadata}
            />
          </div>
          <div>
            <label className="form-label">Preheader</label>
            <input
              type="text"
              className="form-input"
              value={preheader}
              onChange={(e) => setPreheader(e.target.value)}
              onBlur={saveIssueMetadata}
              maxLength={150}
            />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as 'draft' | 'published' | 'sent' | 'scheduled')
              }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div style={{ paddingTop: 'var(--spacing-md)' }}>
            <button 
              onClick={saveIssueMetadata} 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Blocks Editor */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Content Blocks</h2>
          <button
            onClick={() => setShowAddBlock(!showAddBlock)}
            className="btn btn-primary"
          >
            {showAddBlock ? 'Cancel' : 'Add Block'}
          </button>
        </div>

        {showAddBlock && (
          <div style={{
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-sidebar-bg)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--spacing-md)',
          }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md)' }}>
              Add from URL
            </h3>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/article"
                value={extractUrl}
                onChange={(e) => setExtractUrl(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                onClick={extractFromUrl}
                disabled={extracting || !extractUrl}
                className="btn btn-primary"
              >
                {extracting ? 'Extracting...' : 'Extract'}
              </button>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md)' }}>
              Or add manually:
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-sm)' }}>
              <button onClick={() => addBlock('story')} className="btn btn-secondary">Story</button>
              <button onClick={() => addBlock('promo')} className="btn btn-secondary">Promo</button>
              <button onClick={() => addBlock('text')} className="btn btn-secondary">Text</button>
              <button onClick={() => addBlock('image')} className="btn btn-secondary">Image</button>
              <button onClick={() => addBlock('divider')} className="btn btn-secondary">Divider</button>
              <button onClick={() => addBlock('footer')} className="btn btn-secondary">Footer</button>
            </div>
          </div>
        )}

        {blocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            No content blocks yet. Add your first block to get started!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            {blocks.map((block, index) => (
              <BlockEditor
                key={block.id}
                block={block}
                isFirst={index === 0}
                isLast={index === blocks.length - 1}
                onUpdate={(data) => updateBlock(block.id, data)}
                onDelete={() => deleteBlock(block.id)}
                onMoveUp={() => moveBlock(block.id, 'up')}
                onMoveDown={() => moveBlock(block.id, 'down')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ marginBottom: '2rem', borderColor: 'var(--color-danger)', borderWidth: '2px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-md)', color: 'var(--color-danger-text)' }}>
          Danger Zone
        </h2>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
          Deleting this issue is permanent and cannot be undone. All content blocks will also be deleted.
        </p>
        <DeleteIssueButton
          issueId={issue.id}
          publicationId={publication.id}
          issueSubject={subject}
        />
      </div>

      {saving && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          padding: '1rem 1.5rem',
          backgroundColor: 'var(--color-accent)',
          color: 'white',
          borderRadius: 'var(--radius-sm)',
        }}>
          Saving...
        </div>
      )}
    </div>
  )
}

interface BlockEditorProps {
  block: Block
  isFirst: boolean
  isLast: boolean
  onUpdate: (data: Json) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function BlockEditor({ block, isFirst, isLast, onUpdate, onDelete, onMoveUp, onMoveDown }: BlockEditorProps) {
  const [data, setData] = useState<Json>(block.data)
  const [expanded, setExpanded] = useState(true)

  // Use utility function to safely convert Json to object
  const dataAsObject = jsonToRecord(data)
  
  // Helper to safely get string values
  const getString = (key: string): string => getStringFromJson(data, key)

  function handleChange(field: string, value: string | boolean | number | null) {
    const newData = { ...dataAsObject, [field]: value }
    setData(newData as Json)
  }

  function handleBlur() {
    onUpdate(data)
  }

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--spacing-md)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expanded ? 'var(--spacing-md)' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
          >
            {expanded ? '▼' : '▶'}
          </button>
          <strong style={{ textTransform: 'capitalize' }}>{block.type} Block</strong>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.5rem',
              cursor: isFirst ? 'not-allowed' : 'pointer',
              opacity: isFirst ? 0.5 : 1,
            }}
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.5rem',
              cursor: isLast ? 'not-allowed' : 'pointer',
              opacity: isLast ? 0.5 : 1,
            }}
          >
            ↓
          </button>
          <button
            onClick={onDelete}
            style={{
              background: 'none',
              border: '1px solid #dc3545',
              color: '#dc3545',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
          {block.type === 'story' && (
            <>
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={getString('title') || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <label className="form-label">Description/Blurb</label>
                <textarea
                  className="form-input"
                  value={getString('blurb') || ''}
                  onChange={(e) => handleChange('blurb', e.target.value)}
                  onBlur={handleBlur}
                  rows={3}
                />
              </div>
              <div>
                <label className="form-label">Link URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={getString('link') || ''}
                  onChange={(e) => handleChange('link', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <ImageUpload
                label="Story Image"
                currentImage={getString('image_url') || ''}
                onUpload={(url) => {
                  handleChange('image_url', url)
                  handleBlur()
                }}
              />
              <div>
                <label className="form-label">Image Alt Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={getString('image_alt') || ''}
                  onChange={(e) => handleChange('image_alt', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
            </>
          )}

          {block.type === 'promo' && (
            <>
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={getString('title') || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <label className="form-label">Content</label>
                <RichTextEditor
                  content={getString('content') || ''}
                  onChange={(html) => {
                    handleChange('content', html)
                    handleBlur()
                  }}
                  placeholder="Enter promo content..."
                />
              </div>
              <div>
                <label className="form-label">Link URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={getString('link') || ''}
                  onChange={(e) => handleChange('link', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <label className="form-label">Link Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={getString('link_text') || ''}
                  onChange={(e) => handleChange('link_text', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <label className="form-label">Background Color</label>
                <input
                  type="color"
                  className="form-input"
                  value={getString('background_color') || '#f5f5f5'}
                  onChange={(e) => handleChange('background_color', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
            </>
          )}

          {block.type === 'text' && (
            <>
              <div>
                <label className="form-label">Content</label>
                <RichTextEditor
                  content={getString('content') || ''}
                  onChange={(html) => {
                    handleChange('content', html)
                    handleBlur()
                  }}
                  placeholder="Enter your content..."
                />
              </div>
              <div>
                <label className="form-label">Alignment</label>
                <select
                  className="form-input"
                  value={getString('alignment') || 'left'}
                  onChange={(e) => {
                    handleChange('alignment', e.target.value)
                    handleBlur()
                  }}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </>
          )}

          {block.type === 'image' && (
            <>
              <ImageUpload
                label="Image"
                currentImage={getString('url') || ''}
                onUpload={(url) => {
                  handleChange('url', url)
                  handleBlur()
                }}
              />
              <div>
                <label className="form-label">Alt Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={getString('alt') || ''}
                  onChange={(e) => handleChange('alt', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <label className="form-label">Caption</label>
                <input
                  type="text"
                  className="form-input"
                  value={getString('caption') || ''}
                  onChange={(e) => handleChange('caption', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <label className="form-label">Link URL (optional)</label>
                <input
                  type="url"
                  className="form-input"
                  value={getString('link') || ''}
                  onChange={(e) => handleChange('link', e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
            </>
          )}

          {block.type === 'divider' && (
            <div>
              <label className="form-label">Style</label>
              <select
                className="form-input"
                value={getString('style') || 'solid'}
                onChange={(e) => {
                  handleChange('style', e.target.value)
                  handleBlur()
                }}
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          )}

          {block.type === 'footer' && (
            <div>
              <label className="form-label">Footer Content</label>
              <RichTextEditor
                content={getString('content') || ''}
                onChange={(html) => {
                  handleChange('content', html)
                  handleBlur()
                }}
                placeholder="Enter footer content..."
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
