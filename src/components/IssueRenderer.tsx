import Image from 'next/image'
import Link from 'next/link'
import { RenderModel, RenderBlock } from '@/lib/render-model'
import {
  StoryBlockData,
  PromoBlockData,
  TextBlockData,
  ImageBlockData,
  FooterContent,
} from '@/types/blocks'

interface IssueRendererProps {
  renderModel: RenderModel
}

export default function IssueRenderer({ renderModel }: IssueRendererProps) {
  const { blocks } = renderModel

  return (
    <article style={{
      maxWidth: '700px',
      margin: '0 auto',
      padding: '0 var(--spacing-md)',
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
    <section style={{ marginBottom: '3rem' }}>
      {data.image_url && (
        <Link href={data.link} style={{ display: 'block', marginBottom: '1.5rem' }}>
          <img
            src={data.image_url}
            alt={data.image_alt || data.title}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
            }}
          />
        </Link>
      )}
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
        <Link href={data.link} style={{ color: 'inherit', textDecoration: 'none' }}>
          {data.title}
        </Link>
      </h2>
      <p style={{ color: 'var(--color-text)', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '1rem' }}>
        {data.blurb}
      </p>
      <Link href={data.link} style={{ fontWeight: 500 }}>
        Read more →
      </Link>
    </section>
  )
}

function PromoBlock({ data }: { data: PromoBlockData }) {
  return (
    <section
      style={{
        backgroundColor: data.background_color || 'var(--color-sidebar)',
        padding: '2rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '3rem',
        textAlign: 'center',
      }}
    >
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{data.title}</h3>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.7', marginBottom: data.link ? '1.5rem' : 0 }}>
        {data.content}
      </p>
      {data.link && (
        <Link href={data.link} className="btn btn-primary">
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
      <p style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
        {data.content}
      </p>
    </section>
  )
}

function DividerBlock() {
  return (
    <hr style={{
      border: 'none',
      borderTop: '1px solid var(--color-border)',
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
      }}
    />
  )

  return (
    <section style={{ marginBottom: '2rem' }}>
      {data.link ? <Link href={data.link}>{imgElement}</Link> : imgElement}
      {data.caption && (
        <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
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
      paddingTop: '2rem',
      borderTop: '1px solid var(--color-border)',
      textAlign: 'center',
    }}>
      <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
        {data.text}
      </p>

      {data.social_links && data.social_links.length > 0 && (
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
          {data.social_links.map((social, idx) => (
            <Link key={idx} href={social.url} style={{ fontSize: '0.9rem' }}>
              {social.label || social.platform}
            </Link>
          ))}
        </div>
      )}

      {data.address && (
        <p className="text-light" style={{ fontSize: '0.85rem' }}>
          {data.address}
        </p>
      )}
    </footer>
  )
}
