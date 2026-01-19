'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: 'color: var(--color-accent); text-decoration: underline;',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        style: `
          min-height: 150px;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-surface);
          color: var(--color-text);
          font-family: inherit;
          outline: none;
        `,
      },
    },
  })

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const removeLink = () => {
    editor.chain().focus().unsetLink().run()
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        padding: '0.5rem',
        backgroundColor: 'var(--color-sidebar-bg)',
        border: '1px solid var(--color-border)',
        borderBottom: 'none',
        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
        flexWrap: 'wrap',
      }}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>

        <div style={{ width: '1px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>

        <div style={{ width: '1px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          • List
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          1. List
        </ToolbarButton>

        <div style={{ width: '1px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />

        <ToolbarButton
          onClick={addLink}
          active={editor.isActive('link')}
          title="Add Link"
        >
          🔗 Link
        </ToolbarButton>

        {editor.isActive('link') && (
          <ToolbarButton
            onClick={removeLink}
            title="Remove Link"
          >
            ✕ Link
          </ToolbarButton>
        )}

        <div style={{ width: '1px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          ↶
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          ↷
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {placeholder && !editor.getText() && (
        <div style={{
          position: 'absolute',
          top: '3.5rem',
          left: '0.75rem',
          color: 'var(--color-text-muted)',
          pointerEvents: 'none',
        }}>
          {placeholder}
        </div>
      )}
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: '0.25rem 0.5rem',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        background: active ? 'var(--color-accent)' : 'white',
        color: active ? 'white' : 'var(--color-text)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontSize: '0.85rem',
        fontWeight: 500,
        transition: 'all 0.2s',
      }}
      onMouseOver={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.background = 'var(--color-sidebar-bg)'
        }
      }}
      onMouseOut={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.background = 'white'
        }
      }}
    >
      {children}
    </button>
  )
}
