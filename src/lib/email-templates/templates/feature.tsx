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

interface FeatureEmailProps {
  renderModel: RenderModel
}

/**
 * Feature Template
 * Bold, image-forward design with large hero and focused content
 */
export default function FeatureEmail({ renderModel }: FeatureEmailProps) {
  const { publication, issue, blocks, footer, urls } = renderModel
  const accentColor = publication.brand.accent_color || '#e73b42'

  // Get first story block for hero treatment
  const firstStory = blocks.find(b => b.type === 'story')
  const remainingBlocks = firstStory
    ? blocks.filter(b => b.id !== firstStory.id)
    : blocks

  return (
    <Html>
      <Head />
      <Preview>{issue.preheader || issue.subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Minimal Header */}
          <Section style={header}>
            <Text style={publicationName}>{publication.name}</Text>
          </Section>

          {/* Hero Story */}
          {firstStory && (
            <HeroStory data={firstStory.data as StoryBlockData} accentColor={accentColor} subject={issue.subject} />
          )}

          {/* Remaining Blocks */}
          {remainingBlocks.map((block) => (
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

function HeroStory({ data, accentColor, subject }: { data: StoryBlockData; accentColor: string; subject: string }) {
  return (
    <>
      {/* Large Hero Image */}
      {data.image_url && (
        <Link href={data.link}>
          <Img
            src={data.image_url}
            alt={data.image_alt || data.title}
            style={heroImage}
          />
        </Link>
      )}

      {/* Hero Content */}
      <Section style={heroContent}>
        <Heading style={heroTitle}>{subject}</Heading>
        <Heading style={heroSubtitle}>
          <Link href={data.link} style={{ color: '#353535', textDecoration: 'none' }}>
            {data.title}
          </Link>
        </Heading>
        <Text style={heroBlurb}>{data.blurb}</Text>
        <Link href={data.link} style={{ ...ctaButton, backgroundColor: accentColor }}>
          Read the full story
        </Link>
      </Section>
    </>
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

function StoryBlock({ data, accentColor }: { data: StoryBlockData; accentColor: string }) {
  return (
    <Section style={storySection}>
      <Heading style={storyTitle}>
        <Link href={data.link} style={{ color: '#353535', textDecoration: 'none' }}>
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

// Styles - Bold and focused
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '680px',
}

const header = {
  padding: '30px 30px 20px',
  textAlign: 'center' as const,
}

const publicationName = {
  fontSize: '13px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
  color: '#999',
  margin: '0',
}

const heroImage = {
  width: '100%',
  maxWidth: '680px',
  height: 'auto',
  display: 'block',
}

const heroContent = {
  padding: '40px 40px 50px',
  textAlign: 'center' as const,
}

const heroTitle = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#353535',
  margin: '0 0 16px',
  lineHeight: '1.2',
}

const heroSubtitle = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#353535',
  margin: '0 0 20px',
  lineHeight: '1.3',
}

const heroBlurb = {
  fontSize: '18px',
  color: '#7d7d7d',
  lineHeight: '1.6',
  margin: '0 0 30px',
  maxWidth: '500px',
  marginLeft: 'auto',
  marginRight: 'auto',
}

const ctaButton = {
  display: 'inline-block',
  padding: '14px 32px',
  backgroundColor: '#e73b42',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  borderRadius: '4px',
}

const storySection = {
  padding: '30px 40px',
  borderTop: '1px solid #e0e0e0',
}

const storyTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#353535',
  margin: '0 0 12px',
  lineHeight: '1.3',
}

const storyBlurb = {
  fontSize: '16px',
  color: '#7d7d7d',
  lineHeight: '1.6',
  margin: '0 0 12px',
}

const readMore = {
  fontSize: '15px',
  fontWeight: '500',
  textDecoration: 'none',
}

const contentSection = {
  padding: '20px 40px',
}

const textContent = {
  fontSize: '16px',
  color: '#353535',
  lineHeight: '1.7',
  margin: '0',
}

const divider = {
  borderColor: '#e0e0e0',
  margin: '0',
}

const footerSection = {
  padding: '20px 40px',
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
