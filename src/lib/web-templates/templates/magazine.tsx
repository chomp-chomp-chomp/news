import Link from 'next/link'
import { RenderModel, RenderBlock } from '@/lib/render-model'
import {
  StoryBlockData,
  PromoBlockData,
  TextBlockData,
  ImageBlockData,
  FooterContent,
} from '@/types/blocks'

interface MagazineWebTemplateProps {
  renderModel: RenderModel
}

/**
 * Magazine Web Template
 * Bold, image-forward design with large featured images and prominent headlines
 */
export default function MagazineWebTemplate({ renderModel }: MagazineWebTemplateProps) {
  const { blocks } = renderModel

  return (
    <article style={{
      maxWidth: '900px',
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
    <section style={{ marginBottom: '4rem' }}>
      {data.image_url && (
        <Link href={data.link} style={{ display: 'block', marginBottom: '1.5rem' }}>
          <img
            src={data.image_url}
            alt={data.image_alt || data.title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '600px',
              borderRadius: 'var(--radius-lg)',
              objectFit: 'cover',
            }}
          />
        </Link>
      )}
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        marginBottom: '1rem',
        letterSpacing: '-0.02em'
      }}>
        <Link href={data.link} style={{ color: 'inherit', textDecoration: 'none' }}>
          {data.title}
        </Link>
      </h2>
      <p style={{
        color: 'var(--color-text-muted)',
        fontSize: '1.25rem',
        lineHeight: '1.7',
        marginBottom: '1.25rem'
      }}>
        {data.blurb}
      </p>
      <Link
        href={data.link}
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        Read Full Story →
      </Link>
    </section>
  )
}

function PromoBlock({ data }: { data: PromoBlockData }) {
  return (
    <section
      style={{
        backgroundColor: data.background_color || 'var(--color-sidebar-bg)',
        padding: '3rem 2rem',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '3rem',
        textAlign: 'center',
      }}
    >
      <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>{data.title}</h3>
      <div
        style={{ fontSize: '1.125rem', lineHeight: '1.7', marginBottom: data.link ? '1.5rem' : 0 }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
      {data.link && (
        <Link
          href={data.link}
          className="btn btn-primary"
          style={{ fontSize: '1.125rem', padding: '0.875rem 2rem' }}
        >
          {data.link_text || 'Learn More'}
        </Link>
      )}
    </section>
  )
}

function TextBlock({ data }: { data: TextBlockData }) {
  return (
    <section style={{
      marginBottom: '2rem',
      textAlign: data.alignment || 'left',
    }}>
      <div
        style={{ fontSize: '1.125rem', lineHeight: '1.8' }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </section>
  )
}

function DividerBlock() {
  return (
    <hr style={{
      border: 'none',
      borderTop: '2px solid var(--color-border)',
      margin: '4rem 0',
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
        maxHeight: '600px',
        borderRadius: 'var(--radius-lg)',
        objectFit: 'cover',
      }}
    />
  )

  return (
    <section style={{ marginBottom: '3rem' }}>
      {data.link ? <Link href={data.link}>{imgElement}</Link> : imgElement}
      {data.caption && (
        <p className="text-muted" style={{
          fontSize: '1rem',
          marginTop: '0.75rem',
          fontStyle: 'italic'
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
      marginTop: '5rem',
      paddingTop: '3rem',
      borderTop: '2px solid var(--color-border)',
      textAlign: 'center',
    }}>
      <p className="text-muted" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
        {data.text}
      </p>

      {data.social_links && data.social_links.length > 0 && (
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {data.social_links.map((social, idx) => (
            <Link key={idx} href={social.url} style={{ fontSize: '1rem', fontWeight: 500 }}>
              {social.label || social.platform}
            </Link>
          ))}
        </div>
      )}

      {data.address && (
        <p className="text-light" style={{ fontSize: '0.9rem' }}>
          {data.address}
        </p>
      )}
    </footer>
  )
}
