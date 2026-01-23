import Link from 'next/link'
import { RenderModel, RenderBlock } from '@/lib/render-model'
import {
  StoryBlockData,
  PromoBlockData,
  TextBlockData,
  ImageBlockData,
  FooterContent,
} from '@/types/blocks'

interface NewspaperWebTemplateProps {
  renderModel: RenderModel
}

/**
 * Newspaper Web Template
 * Traditional newspaper layout with sections and compact information density
 */
export default function NewspaperWebTemplate({ renderModel }: NewspaperWebTemplateProps) {
  const { blocks } = renderModel

  return (
    <article style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '0 var(--spacing-md)',
      columnGap: 'var(--spacing-xl)',
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
      marginBottom: '2rem',
      paddingBottom: '2rem',
      borderBottom: '2px solid var(--color-border)',
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.01em'
      }}>
        <Link href={data.link} style={{ color: 'inherit', textDecoration: 'none' }}>
          {data.title}
        </Link>
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: data.image_url ? '200px 1fr' : '1fr',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {data.image_url && (
          <Link href={data.link}>
            <img
              src={data.image_url}
              alt={data.image_alt || data.title}
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                border: '1px solid var(--color-border)',
              }}
            />
          </Link>
        )}
        <div>
          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.9375rem',
            lineHeight: '1.6',
            marginBottom: '0.75rem'
          }}>
            {data.blurb}
          </p>
          <Link href={data.link} style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Read More »
          </Link>
        </div>
      </div>
    </section>
  )
}

function PromoBlock({ data }: { data: PromoBlockData }) {
  return (
    <section
      style={{
        backgroundColor: data.background_color || '#f5f5f5',
        padding: '1.5rem',
        border: '2px solid var(--color-border)',
        marginBottom: '2rem',
      }}
    >
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.02em'
      }}>
        {data.title}
      </h3>
      <div
        style={{ fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: data.link ? '1rem' : 0 }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
      {data.link && (
        <Link href={data.link} style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          textDecoration: 'underline'
        }}>
          {data.link_text || 'Learn More'}
        </Link>
      )}
    </section>
  )
}

function TextBlock({ data }: { data: TextBlockData }) {
  return (
    <section style={{
      marginBottom: '1rem',
      textAlign: data.alignment || 'left',
    }}>
      <div
        style={{ fontSize: '0.9375rem', lineHeight: '1.65' }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </section>
  )
}

function DividerBlock() {
  return (
    <hr style={{
      border: 'none',
      borderTop: '3px double var(--color-border)',
      margin: '2rem 0',
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
        border: '1px solid var(--color-border)',
      }}
    />
  )

  return (
    <section style={{ marginBottom: '1.5rem' }}>
      {data.link ? <Link href={data.link}>{imgElement}</Link> : imgElement}
      {data.caption && (
        <p style={{
          fontSize: '0.8125rem',
          marginTop: '0.25rem',
          fontStyle: 'italic',
          color: 'var(--color-text-muted)'
        }}>
          {data.caption}
        </p>
      )}
    </section>
  )
}

function FooterBlock({ data }: { data: FooterContent }) {
  return (
    <footer style={{
      marginTop: '3rem',
      paddingTop: '1.5rem',
      borderTop: '3px double var(--color-border)',
    }}>
      <p style={{
        fontSize: '0.875rem',
        marginBottom: '1rem',
        textAlign: 'center',
        color: 'var(--color-text-muted)'
      }}>
        {data.text}
      </p>

      {data.social_links && data.social_links.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {data.social_links.map((social, idx) => (
            <Link key={idx} href={social.url}>
              {social.label || social.platform}
            </Link>
          ))}
        </div>
      )}

      {data.address && (
        <p style={{
          fontSize: '0.8125rem',
          textAlign: 'center',
          color: 'var(--color-text-light)'
        }}>
          {data.address}
        </p>
      )}
    </footer>
  )
}
