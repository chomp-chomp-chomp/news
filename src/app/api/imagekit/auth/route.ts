import { NextResponse } from 'next/server'
import { requireAuthApi } from '@/lib/auth'
import ImageKit from 'imagekit'

export async function GET() {
  try {
    // Require authentication
    const user = await requireAuthApi()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate environment variables
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT

    if (!publicKey || !privateKey || !urlEndpoint) {
      console.error('Missing ImageKit environment variables:', {
        hasPublicKey: !!publicKey,
        hasPrivateKey: !!privateKey,
        hasUrlEndpoint: !!urlEndpoint,
      })
      return NextResponse.json(
        {
          error: 'ImageKit is not configured. Please set NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT environment variables.'
        },
        { status: 500 }
      )
    }

    // Initialize ImageKit
    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    })

    // Generate authentication parameters
    const authenticationParameters = imagekit.getAuthenticationParameters()

    return NextResponse.json({
      ...authenticationParameters,
      publicKey,
      urlEndpoint,
    })
  } catch (error) {
    console.error('ImageKit auth error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate authentication parameters'
      },
      { status: 500 }
    )
  }
}
