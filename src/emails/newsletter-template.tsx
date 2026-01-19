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
import {
  RenderModel,
  RenderBlock,
} from '@/lib/render-model'
import {
  StoryBlockData,
  PromoBlockData,
  TextBlockData,
  ImageBlockData,
  FooterContent,
} from '@/types/blocks'

interface NewsletterEmailProps {
  renderModel: RenderModel
}

export default function NewsletterEmail({ renderModel }: NewsletterEmailProps) {
  const { publication, issue, blocks, footer, urls } = renderModel

  return (
    <Html>
      <Head />
      <Preview>{issue.preheader || issue.subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with branding */}
          <Section style={header}>
            {publication.brand.logo_url && (
              <Img
                src={publication.brand.logo_url}
                alt={publication.name}
                style={logo}
              />
            )}
            <Heading style={title}>{publication.name}</Heading>
          </Section>

          {/* Subject line */}
          <Section style={contentSection}>
            <Heading style={h1}>{issue.subject}</Heading>
          </Section>

          {/* Render blocks */}
          {blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}

          {/* Footer */}
          {footer && (
            <Section style={footerSection}>
              <Hr style={divider} />
              <Text style={footerText}>{footer.text}</Text>

              {footer.social_links && footer.social_links.length > 0 && (
                <Section style={socialLinks}>
                  {footer.social_links.map((social, idx) => (
                    <Link
                      key={idx}
                      href={social.url}
                      style={socialLink}
                    >
                      {social.label || social.platform}
                    </Link>
                  ))}
                </Section>
              )}

              {footer.address && (
                <Text style={address}>{footer.address}</Text>
              )}

              <Text style={footerLinks}>
                <Link href={urls.webVersion} style={link}>
                  View in browser
                </Link>
                {' · '}
                <Link href={urls.unsubscribe} style={link}>
                  Unsubscribe
                </Link>
              </Text>
            </Section>
          )}
        </Container>
      </Body>
    </Html>
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
      return <Hr style={divider} />
    case 'image':
      return <ImageBlock data={block.data as any} />
    default:
      return null
  }
}

function StoryBlock({ data }: { data: StoryBlockData }) {
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
        <Link href={data.link} style={storyLink}>
          {data.title}
        </Link>
      </Heading>
      <Text style={storyBlurb}>{data.blurb}</Text>
      <Link href={data.link} style={readMore}>
        Read more →
      </Link>
    </Section>
  )
}

function PromoBlock({ data }: { data: PromoBlockData }) {
  return (
    <Section
      style={{
        ...promoSection,
        backgroundColor: data.background_color || '#fff8f0',
      }}
    >
      <Heading style={promoTitle}>{data.title}</Heading>
      <Text style={promoContent}>{data.content}</Text>
      {data.link && (
        <Link href={data.link} style={promoButton}>
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
        style={{
          ...textContent,
          textAlign: data.alignment || 'left',
        }}
      >
        {data.content}
      </Text>
    </Section>
  )
}

function ImageBlock({ data }: { data: ImageBlockData }) {
  const imgElement = (
    <Img
      src={data.url}
      alt={data.alt}
      style={{
        width: '100%',
        maxWidth: '600px',
        height: 'auto',
        borderRadius: '8px',
      }}
    />
  )

  return (
    <Section style={contentSection}>
      {data.link ? <Link href={data.link}>{imgElement}</Link> : imgElement}
      {data.caption && (
        <Text style={{ fontSize: '14px', color: '#7d7d7d', marginTop: '8px' }}>
          {data.caption}
        </Text>
      )}
    </Section>
  )
}

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
}

const header = {
  padding: '30px 20px',
  textAlign: 'center' as const,
}

const logo = {
  maxWidth: '150px',
  margin: '0 auto 16px',
}

const title = {
  color: '#353535',
  fontSize: '16px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0',
}

const h1 = {
  color: '#353535',
  fontSize: '28px',
  fontWeight: '500',
  lineHeight: '1.3',
  margin: '0 0 20px',
}

const contentSection = {
  padding: '0 20px 30px',
}

const storySection = {
  padding: '0 20px 40px',
}

const storyImage = {
  width: '100%',
  maxWidth: '600px',
  height: 'auto',
  borderRadius: '8px',
  marginBottom: '20px',
}

const storyTitle = {
  color: '#353535',
  fontSize: '22px',
  fontWeight: '500',
  lineHeight: '1.3',
  margin: '0 0 12px',
}

const storyLink = {
  color: '#353535',
  textDecoration: 'none',
}

const storyBlurb = {
  color: '#7d7d7d',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 12px',
}

const readMore = {
  color: '#e73b42',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
}

const promoSection = {
  padding: '30px 20px',
  margin: '0 20px 30px',
  borderRadius: '8px',
  textAlign: 'center' as const,
}

const promoTitle = {
  color: '#353535',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const promoContent = {
  color: '#353535',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px',
}

const promoButton = {
  backgroundColor: '#e73b42',
  color: '#ffffff',
  padding: '12px 30px',
  borderRadius: '4px',
  textDecoration: 'none',
  fontWeight: '500',
  display: 'inline-block',
}

const textContent = {
  color: '#353535',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0 0 20px',
}

const divider = {
  borderColor: '#e0e0e0',
  margin: '40px 20px',
}

const footerSection = {
  padding: '0 20px 30px',
}

const footerText = {
  color: '#7d7d7d',
  fontSize: '14px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '20px 0',
}

const socialLinks = {
  textAlign: 'center' as const,
  margin: '20px 0',
}

const socialLink = {
  color: '#e73b42',
  fontSize: '14px',
  textDecoration: 'none',
  margin: '0 10px',
}

const address = {
  color: '#9d9d9d',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '10px 0',
}

const footerLinks = {
  color: '#7d7d7d',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '20px 0',
}

const link = {
  color: '#e73b42',
  textDecoration: 'none',
}
