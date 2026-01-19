import ImageKit from 'imagekit-javascript'

// Lazy initialization to avoid build-time errors
let imagekitInstance: ImageKit | null = null

function getImageKit(): ImageKit {
  if (!imagekitInstance) {
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
    
    if (!publicKey || !urlEndpoint) {
      throw new Error('ImageKit configuration is missing')
    }
    
    imagekitInstance = new ImageKit({
      publicKey,
      urlEndpoint,
    })
  }
  return imagekitInstance
}

// Client-side ImageKit instance with lazy loading
export const imagekit = new Proxy({} as ImageKit, {
  get(_target, prop) {
    return (getImageKit() as any)[prop]
  }
})

// Server-side ImageKit for authenticated operations
export function getServerImageKit() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerImageKit can only be used on the server')
  }

  const ImageKitServer = require('imagekit')

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
  
  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error('ImageKit server configuration is missing')
  }

  return new ImageKitServer({
    publicKey,
    privateKey,
    urlEndpoint,
  })
}

// Generate transformation URL for responsive images
export function getResponsiveImageUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
  } = {}
) {
  const transformation = []

  if (options.width) transformation.push(`w-${options.width}`)
  if (options.height) transformation.push(`h-${options.height}`)
  if (options.quality) transformation.push(`q-${options.quality}`)
  if (options.format) transformation.push(`f-${options.format}`)

  // If it's already an ImageKit URL, modify it
  if (url.includes('ik.imagekit.io')) {
    const parts = url.split('/')
    const filenameIndex = parts.findIndex((part) => part.includes('.'))
    if (filenameIndex > 0) {
      parts.splice(filenameIndex, 0, `tr:${transformation.join(',')}`)
      return parts.join('/')
    }
  }

  return url
}

// Preset sizes for newsletter images
export const IMAGE_PRESETS = {
  storyCard: {
    width: 600,
    height: 400,
    quality: 85,
    format: 'auto' as const,
  },
  thumbnail: {
    width: 200,
    height: 200,
    quality: 80,
    format: 'auto' as const,
  },
  hero: {
    width: 1200,
    height: 600,
    quality: 90,
    format: 'auto' as const,
  },
  logo: {
    width: 200,
    quality: 90,
    format: 'auto' as const,
  },
} as const
