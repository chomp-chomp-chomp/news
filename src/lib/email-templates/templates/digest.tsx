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

interface DigestEmailProps {
  renderModel: RenderModel
}

/**
 * Digest Template
 * Compact, link-focused layout for news roundups and curated links
 */
export default function DigestEmail({ renderModel }: DigestEmailProps) {
  const { publication, issue, blocks, footer, urls } = renderModel
  const accentColor = publication.brand.accent_color || '#e73b42'

  return (
    <Html>
      <Head />
      <Preview>{issue.preheader || issue.subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Compact Header */}
          <Section style={header}>
            <Text style={title}>{publication.name}</Text>
            <Heading style={subject}>{issue.subject}</Heading>
          </Section>

          {/* Compact Blocks */}
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
                View online
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

// Compact story card with small thumbnail
function StoryBlock({ data, accentColor }: { data: StoryBlockData; accentColor: string }) {
  return (
    <Section style={storySection}>
      <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
        <tr>
          {data.image_url && (
            <td style={{ width: '80px', verticalAlign: 'top', paddingRight: '12px' }}>
              <Link href={data.link}>
                <Img
                  src={data.image_url}
                  alt={data.image_alt || data.title}
                  width="80"
                  height="80"
                  style={{ borderRadius: '4px', objectFit: 'cover', display: 'block' }}
                />
              </Link>
            </td>
          )}
          <td style={{ verticalAlign: 'top' }}>
            <Heading style={storyTitle}>
              <Link href={data.link} style={{ color: '#353535', textDecoration: 'none' }}>
                {data.title}
              </Link>
            </Heading>
            <Text style={storyBlurb}>{data.blurb}</Text>
            <Link href={data.link} style={{ ...readMore, color: accentColor }}>
              Read →
            </Link>
          </td>
        </tr>
      </table>
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

// Styles - Compact and dense
const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  border: '1px solid #e0e0e0',
}

const header = {
  padding: '20px 20px 10px',
  borderBottom: '2px solid #e73b42',
}

const title = {
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  color: '#999',
  margin: '0 0 8px',
}

const subject = {
  fontSize: '22px',
  fontWeight: '600',
  color: '#353535',
  margin: '0',
  lineHeight: '1.3',
}

const storySection = {
  padding: '16px 20px',
  borderBottom: '1px solid #f0f0f0',
}

const storyTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#353535',
  margin: '0 0 6px',
  lineHeight: '1.3',
}

const storyBlurb = {
  fontSize: '14px',
  color: '#7d7d7d',
  lineHeight: '1.5',
  margin: '0 0 6px',
}

const readMore = {
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
}

const contentSection = {
  padding: '16px 20px',
}

const textContent = {
  fontSize: '14px',
  color: '#353535',
  lineHeight: '1.6',
  margin: '0',
}

const divider = {
  borderColor: '#e0e0e0',
  margin: '0',
}

const footerSection = {
  padding: '16px 20px',
}

const footerText = {
  fontSize: '12px',
  color: '#999',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '0 0 12px',
}

const address = {
  fontSize: '11px',
  color: '#b0b0b0',
  textAlign: 'center' as const,
  margin: '0 0 12px',
}

const footerLinks = {
  fontSize: '12px',
  textAlign: 'center' as const,
  color: '#999',
  margin: '0',
}

const link = {
  textDecoration: 'none',
}
