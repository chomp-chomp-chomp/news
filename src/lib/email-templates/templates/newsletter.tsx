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

interface NewsletterEmailProps {
  renderModel: RenderModel
}

/**
 * Newsletter Template
 * Traditional newsletter format with prominent branding and sections
 */
export default function NewsletterEmail({ renderModel }: NewsletterEmailProps) {
  const { publication, issue, blocks, footer, urls } = renderModel
  const accentColor = publication.brand.accent_color || '#e73b42'

  return (
    <Html>
      <Head />
      <Preview>{issue.preheader || issue.subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Traditional Header with Logo */}
          <Section style={header}>
            {publication.brand.logo_url && (
              <Img
                src={publication.brand.logo_url}
                alt={publication.name}
                style={logo}
              />
            )}
            <Heading style={publicationTitle}>{publication.name}</Heading>
            <Text style={tagline}>{issue.subject}</Text>
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
    case 'promo':
      return <PromoBlock data={block.data as PromoBlockData} accentColor={accentColor} />
    case 'text':
      return <TextBlock data={block.data as TextBlockData} />
    case 'divider':
      return <Hr style={divider} />
    default:
      return null
  }
}

function StoryBlock({ data, accentColor }: { data: StoryBlockData; accentColor: string }) {
  return (
    <Section style={storySection}>
      {data.image_url && (
        <Link href={data.link}>
          <Img
            src={data.image_url}
            alt={data.image_alt || data.title}
            style={storyImage}
          />
        </Link>
      )}
      <Heading style={storyTitle}>
        <Link href={data.link} style={{ color: '#2c2c2c', textDecoration: 'none' }}>
          {data.title}
        </Link>
      </Heading>
      <Text style={storyBlurb}>{data.blurb}</Text>
      <Link href={data.link} style={{ ...ctaLink, color: accentColor }}>
        Read More →
      </Link>
    </Section>
  )
}

function PromoBlock({ data, accentColor }: { data: PromoBlockData; accentColor: string }) {
  return (
    <Section style={{
      ...promoSection,
      backgroundColor: data.background_color || '#f8f9fa',
    }}>
      <Heading style={promoTitle}>{data.title}</Heading>
      <Text
        style={promoContent}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
      {data.link && (
        <Link href={data.link} style={{ ...ctaButton, backgroundColor: accentColor }}>
          {data.link_text || 'Learn More'}
        </Link>
      )}
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

// Styles - Traditional newsletter
const main = {
  backgroundColor: '#f0f0f0',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '640px',
  border: '1px solid #d0d0d0',
}

const header = {
  padding: '30px 30px 25px',
  textAlign: 'center' as const,
  backgroundColor: '#ffffff',
  borderBottom: '3px solid #e73b42',
}

const logo = {
  maxWidth: '200px',
  margin: '0 auto 16px',
  display: 'block',
}

const publicationTitle = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#2c2c2c',
  margin: '0 0 8px',
  lineHeight: '1.2',
}

const tagline = {
  fontSize: '14px',
  fontWeight: '400',
  color: '#666',
  margin: '0',
  lineHeight: '1.4',
}

const storySection = {
  padding: '30px 30px',
  borderBottom: '1px solid #e8e8e8',
}

const storyImage = {
  width: '100%',
  maxWidth: '580px',
  height: 'auto',
  marginBottom: '20px',
  borderRadius: '4px',
}

const storyTitle = {
  fontSize: '22px',
  fontWeight: '600',
  color: '#2c2c2c',
  margin: '0 0 14px',
  lineHeight: '1.3',
}

const storyBlurb = {
  fontSize: '16px',
  color: '#666',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const ctaLink = {
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
}

const promoSection = {
  padding: '25px 30px',
  margin: '0',
  textAlign: 'center' as const,
  borderTop: '1px solid #e8e8e8',
  borderBottom: '1px solid #e8e8e8',
}

const promoTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#2c2c2c',
  margin: '0 0 12px',
  lineHeight: '1.3',
}

const promoContent = {
  fontSize: '15px',
  color: '#666',
  lineHeight: '1.6',
  margin: '0 0 20px',
}

const ctaButton = {
  display: 'inline-block',
  padding: '12px 28px',
  backgroundColor: '#e73b42',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  borderRadius: '4px',
}

const contentSection = {
  padding: '20px 30px',
}

const textContent = {
  fontSize: '16px',
  color: '#353535',
  lineHeight: '1.7',
  margin: '0',
}

const divider = {
  borderColor: '#e8e8e8',
  margin: '0',
}

const footerSection = {
  padding: '25px 30px',
  backgroundColor: '#f8f9fa',
}

const footerText = {
  fontSize: '13px',
  color: '#999',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 0 12px',
}

const address = {
  fontSize: '12px',
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
