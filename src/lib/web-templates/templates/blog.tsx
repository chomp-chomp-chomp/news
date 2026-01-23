import Link from 'next/link'
import { RenderModel, RenderBlock } from '@/lib/render-model'
import {
  StoryBlockData,
  PromoBlockData,
  TextBlockData,
  ImageBlockData,
  FooterContent,
} from '@/types/blocks'

interface BlogWebTemplateProps {
  renderModel: RenderModel
}

/**
 * Blog Web Template
 * Casual blog-style layout with comfortable spacing and personal feel
 */
export default function BlogWebTemplate({ renderModel }: BlogWebTemplateProps) {
  const { blocks } = renderModel

  return (
    <article style={{
      maxWidth: '750px',
      margin: '0 auto',
      padding: '0 var(--spacing-lg)',
    }}>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </article>
  )
}

function BlockRenderer({ block }: { block: RenderBlock }) {
  switch (block.type) {
    case 'story':
      return <StoryBlock data={block.data as StoryBlockData} />
    case 'promo':
      return <PromoBlock data={block.data as PromoBlockData} />
    case 'text':
      return <TextBlock data={block.data as TextBlockData} />
    case 'divider':
      return <DividerBlock />
    case 'image':
      return <ImageBlock data={block.data as ImageBlockData} />
    case 'footer':
      return <FooterBlock data={block.data as FooterContent} />
    default:
      return null
  }
}

function StoryBlock({ data }: { data: StoryBlockData }) {
  return (
    <section style={{
      marginBottom: '3rem',
      padding: '2rem',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)'
    }}>
      {data.image_url && (
        <Link href={data.link} style={{ display: 'block', marginBottom: '1.5rem' }}>
          <img
            src={data.image_url}
            alt={data.image_alt || data.title}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 'var(--radius-sm)',
              objectFit: 'cover',
            }}
          />
        </Link>
      )}
      <h2 style={{
        fontSize: '1.625rem',
        fontWeight: 600,
        lineHeight: 1.3,
        marginBottom: '1rem',
      }}>
        <Link href={data.link} style={{ color: 'inherit', textDecoration: 'none' }}>
          {data.title}
        </Link>
      </h2>
      <p style={{
        color: 'var(--color-text-muted)',
        fontSize: '1.0625rem',
        lineHeight: '1.7',
        marginBottom: '1rem'
      }}>
        {data.blurb}
      </p>
      <Link
        href={data.link}
        className="btn btn-secondary"
        style={{ fontSize: '1rem' }}
      >
        Read More
      </Link>
    </section>
  )
}

function PromoBlock({ data }: { data: PromoBlockData }) {
  return (
    <section
      style={{
        backgroundColor: data.background_color || 'var(--color-sidebar-bg)',
        padding: '2.25rem 1.75rem',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '2.5rem',
        border: '2px dashed var(--color-border)',
        textAlign: 'center',
      }}
    >
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{data.title}</h3>
      <div
        style={{ fontSize: '1.0625rem', lineHeight: '1.7', marginBottom: data.link ? '1.25rem' : 0 }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
      {data.link && (
        <Link href={data.link} className="btn btn-primary" style={{ fontSize: '1rem' }}>
          {data.link_text || 'Learn More'}
        </Link>
      )}
    </section>
  )
}

function TextBlock({ data }: { data: TextBlockData }) {
  return (
    <section style={{
      marginBottom: '1.5rem',
      textAlign: data.alignment || 'left',
    }}>
      <div
        style={{ fontSize: '1.0625rem', lineHeight: '1.75' }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </section>
  )
}

function DividerBlock() {
  return (
    <hr style={{
      border: 'none',
      borderTop: '1px dashed var(--color-border)',
      margin: '3rem 0',
    }} />
  )
}

function ImageBlock({ data }: { data: ImageBlockData }) {
  const imgElement = (
    <img
      src={data.url}
      alt={data.alt}
      style={{
        width: '100%',
        height: 'auto',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
      }}
    />
  )

  return (
    <section style={{ marginBottom: '2.5rem' }}>
      {data.link ? <Link href={data.link}>{imgElement}</Link> : imgElement}
      {data.caption && (
        <p className="text-muted" style={{ fontSize: '0.9375rem', marginTop: '0.75rem' }}>
          {data.caption}
        </p>
      )}
    </section>
  )
}

function FooterBlock({ data }: { data: FooterContent }) {
  return (
    <footer style={{
      marginTop: '4rem',
      padding: '2.5rem',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      textAlign: 'center',
    }}>
      <p className="text-muted" style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>
        {data.text}
      </p>

      {data.social_links && data.social_links.length > 0 && (
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
          {data.social_links.map((social, idx) => (
            <Link key={idx} href={social.url} style={{ fontSize: '0.9375rem' }}>
              {social.label || social.platform}
            </Link>
          ))}
        </div>
      )}

      {data.address && (
        <p className="text-light" style={{ fontSize: '0.875rem' }}>
          {data.address}
        </p>
      )}
    </footer>
  )
}
