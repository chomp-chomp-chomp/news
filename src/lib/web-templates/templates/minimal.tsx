import Link from 'next/link'
import { RenderModel, RenderBlock } from '@/lib/render-model'
import {
  StoryBlockData,
  PromoBlockData,
  TextBlockData,
  ImageBlockData,
  FooterContent,
} from '@/types/blocks'

interface MinimalWebTemplateProps {
  renderModel: RenderModel
}

/**
 * Minimal Web Template
 * Clean, distraction-free layout focused on typography and content
 */
export default function MinimalWebTemplate({ renderModel }: MinimalWebTemplateProps) {
  const { blocks } = renderModel

  return (
    <article style={{
      maxWidth: '650px',
      margin: '0 auto',
      padding: '0 var(--spacing-md)',
      fontFamily: 'Georgia, serif',
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
    <section style={{ marginBottom: '3.5rem' }}>
      <h2 style={{
        fontSize: '1.75rem',
        fontWeight: 400,
        lineHeight: 1.4,
        marginBottom: '1rem',
        fontFamily: 'Georgia, serif'
      }}>
        <Link href={data.link} style={{ color: 'inherit', textDecoration: 'none' }}>
          {data.title}
        </Link>
      </h2>
      <p style={{
        color: 'var(--color-text-muted)',
        fontSize: '1.125rem',
        lineHeight: '1.8',
        marginBottom: '1rem',
        fontFamily: 'Georgia, serif'
      }}>
        {data.blurb}
      </p>
      <Link href={data.link} style={{
        fontSize: '1rem',
        fontWeight: 400,
        fontFamily: 'var(--font-sans)',
        textTransform: 'lowercase',
        letterSpacing: '0.02em'
      }}>
        continue reading →
      </Link>
    </section>
  )
}

function PromoBlock({ data }: { data: PromoBlockData }) {
  return (
    <section
      style={{
        backgroundColor: data.background_color || '#f9f9f9',
        padding: '2rem 1.5rem',
        borderLeft: '3px solid var(--color-border)',
        marginBottom: '2.5rem',
      }}
    >
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '0.75rem',
        fontFamily: 'var(--font-sans)'
      }}>
        {data.title}
      </h3>
      <div
        style={{
          fontSize: '1rem',
          lineHeight: '1.7',
          marginBottom: data.link ? '1rem' : 0,
          fontFamily: 'Georgia, serif'
        }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
      {data.link && (
        <Link href={data.link} style={{
          fontSize: '0.95rem',
          fontWeight: 500,
          textDecoration: 'underline',
          fontFamily: 'var(--font-sans)'
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
      marginBottom: '1.75rem',
      textAlign: data.alignment || 'left',
    }}>
      <div
        style={{
          fontSize: '1.125rem',
          lineHeight: '1.8',
          fontFamily: 'Georgia, serif'
        }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </section>
  )
}

function DividerBlock() {
  return (
    <div style={{
      textAlign: 'center',
      margin: '3.5rem 0',
      color: 'var(--color-border)'
    }}>
      * * *
    </div>
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
      }}
    />
  )

  return (
    <section style={{ marginBottom: '2.5rem' }}>
      {data.link ? <Link href={data.link}>{imgElement}</Link> : imgElement}
      {data.caption && (
        <p className="text-muted" style={{
          fontSize: '0.9rem',
          marginTop: '0.5rem',
          textAlign: 'center',
          fontStyle: 'italic',
          fontFamily: 'Georgia, serif'
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
      marginTop: '4.5rem',
      paddingTop: '2.5rem',
      borderTop: '1px solid var(--color-border)',
      textAlign: 'center',
    }}>
      <p className="text-muted" style={{
        fontSize: '0.95rem',
        marginBottom: '1rem',
        fontFamily: 'var(--font-sans)'
      }}>
        {data.text}
      </p>

      {data.social_links && data.social_links.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          {data.social_links.map((social, idx) => (
            <Link key={idx} href={social.url} style={{
              fontSize: '0.9rem',
              fontFamily: 'var(--font-sans)'
            }}>
              {social.label || social.platform}
            </Link>
          ))}
        </div>
      )}

      {data.address && (
        <p className="text-light" style={{
          fontSize: '0.85rem',
          fontFamily: 'var(--font-sans)'
        }}>
          {data.address}
        </p>
      )}
    </footer>
  )
}
