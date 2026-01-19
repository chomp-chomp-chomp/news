import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import ImageKit from 'imagekit'

export async function GET() {
  try {
    // Require authentication
    await requireAuth()

    // Initialize ImageKit
    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
    })

    // Generate authentication parameters
    const authenticationParameters = imagekit.getAuthenticationParameters()

    return NextResponse.json({
      ...authenticationParameters,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    })
  } catch (error) {
    console.error('ImageKit auth error:', error)
    return NextResponse.json(
      { error: 'Failed to generate authentication parameters' },
      { status: 500 }
    )
  }
}
