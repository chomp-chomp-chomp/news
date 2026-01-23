import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import { RenderModel, RenderBlock } from '@/lib/render-model'
import {
  StoryBlockData,
  PromoBlockData,
  TextBlockData,
  ImageBlockData,
  FooterBlockData,
} from '@/types/blocks'

interface MinimalEmailProps {
  renderModel: RenderModel
}

/**
 * Minimal Template
 * Clean, text-focused design for personal newsletters and essays
 */
export default function MinimalEmail({ renderModel }: MinimalEmailProps) {
  const { publication, issue, blocks, footer, urls } = renderModel
  const accentColor = publication.brand.accent_color || '#e73b42'

  return (
    <Html>
      <Head />
      <Preview>{issue.preheader || issue.subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Simple Header */}
          <Section style={header}>
            <Text style={publicationName}>{publication.name}</Text>
          </Section>

          {/* Issue Title */}
          <Section style={titleSection}>
            <Heading style={issueTitle}>{issue.subject}</Heading>
          </Section>

          {/* Content Blocks */}
          {blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} accentColor={accentColor} />
          ))}

          {/* Footer */}
          {footer && (
            <Section style={footerSection}>
              <Hr style={divider} />
              <Text style={footerText}>{footer.text}</Text>
              {footer.address && <Text style={address}>{footer.address}</Text>}
            </Section>
          )}

          {/* Unsubscribe - Always Shown */}
          <Section style={footerSection}>
            {!footer && <Hr style={divider} />}
            <Text style={footerLinks}>
              <Link href={urls.webVersion} style={{ ...link, color: accentColor }}>
                View in browser
              </Link>
              {' · '}
              <Link href={urls.unsubscribe} style={{ ...link, color: accentColor }}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

function BlockRenderer({ block, accentColor }: { block: RenderBlock; accentColor: string }) {
  switch (block.type) {
    case 'story':
      return <StoryBlock data={block.data as StoryBlockData} accentColor={accentColor} />
    case 'text':
      return <TextBlock data={block.data as TextBlockData} />
    case 'divider':
      return <Hr style={divider} />
    default:
      return null
  }
}

// Minimal story block - text-focused, no images
function StoryBlock({ data, accentColor }: { data: StoryBlockData; accentColor: string }) {
  return (
    <Section style={storySection}>
      <Heading style={storyTitle}>
        <Link href={data.link} style={{ color: '#1a1a1a', textDecoration: 'none' }}>
          {data.title}
        </Link>
      </Heading>
      <Text style={storyBlurb}>{data.blurb}</Text>
      <Link href={data.link} style={{ ...readMore, color: accentColor }}>
        Continue reading →
      </Link>
    </Section>
  )
}

function TextBlock({ data }: { data: TextBlockData }) {
  return (
    <Section style={contentSection}>
      <Text
        style={{ ...textContent, textAlign: data.alignment || 'left' }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </Section>
  )
}

// Styles - Clean and minimal
const main = {
  backgroundColor: '#fafafa',
  fontFamily: "'Georgia', 'Times New Roman', serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '0',
  maxWidth: '580px',
}

const header = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e0e0e0',
}

const publicationName = {
  fontSize: '11px',
  fontWeight: '400',
  textTransform: 'uppercase' as const,
  letterSpacing: '3px',
  color: '#999',
  margin: '0',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const titleSection = {
  padding: '40px 40px 30px',
  textAlign: 'center' as const,
}

const issueTitle = {
  fontSize: '28px',
  fontWeight: '400',
  color: '#1a1a1a',
  margin: '0',
  lineHeight: '1.4',
  fontFamily: "'Georgia', 'Times New Roman', serif",
}

const storySection = {
  padding: '0 40px 40px',
}

const storyTitle = {
  fontSize: '20px',
  fontWeight: '400',
  color: '#1a1a1a',
  margin: '0 0 16px',
  lineHeight: '1.4',
  fontFamily: "'Georgia', 'Times New Roman', serif",
}

const storyBlurb = {
  fontSize: '16px',
  color: '#5a5a5a',
  lineHeight: '1.7',
  margin: '0 0 16px',
  fontFamily: "'Georgia', 'Times New Roman', serif",
}

const readMore = {
  fontSize: '15px',
  fontWeight: '400',
  textDecoration: 'none',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const contentSection = {
  padding: '0 40px 30px',
}

const textContent = {
  fontSize: '16px',
  color: '#353535',
  lineHeight: '1.8',
  margin: '0',
  fontFamily: "'Georgia', 'Times New Roman', serif",
}

const divider = {
  borderColor: '#e0e0e0',
  margin: '0',
}

const footerSection = {
  padding: '30px 40px',
}

const footerText = {
  fontSize: '13px',
  color: '#999',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 0 12px',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const address = {
  fontSize: '12px',
  color: '#b0b0b0',
  textAlign: 'center' as const,
  margin: '0 0 12px',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const footerLinks = {
  fontSize: '12px',
  textAlign: 'center' as const,
  color: '#999',
  margin: '0',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const link = {
  textDecoration: 'none',
}
