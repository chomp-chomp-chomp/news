import { NextRequest, NextResponse } from 'next/server'
import { requireAuthApi } from '@/lib/auth'
import { createLogger } from '@/lib/logger'
import { getServerImageKit } from '@/lib/imagekit'

export async function POST(request: NextRequest) {
  const logger = createLogger()

  try {
    // Require authentication
    const user = await requireAuthApi()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    logger.withContext({ userId: user.id })

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || '/newsletter-images'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    logger.info('Image upload requested', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to ImageKit
    const imagekit = getServerImageKit()

    const uploadResult = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: folder,
      useUniqueFileName: true,
      tags: [`uploaded_by:${user.id}`],
    })

    logger.info('Image uploaded successfully', {
      fileId: uploadResult.fileId,
      url: uploadResult.url,
    })

    return NextResponse.json({
      success: true,
      file: {
        id: uploadResult.fileId,
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        name: uploadResult.name,
        size: uploadResult.size,
        fileType: uploadResult.fileType,
      },
    })
  } catch (error: any) {
    logger.error('Image upload failed', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const logger = createLogger()

  try {
    // Require authentication
    const user = await requireAuthApi()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    logger.withContext({ userId: user.id })

    // Get file ID from query params
    const searchParams = request.nextUrl.searchParams
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID required' },
        { status: 400 }
      )
    }

    logger.info('Image delete requested', { fileId })

    // Delete from ImageKit
    const imagekit = getServerImageKit()
    await imagekit.deleteFile(fileId)

    logger.info('Image deleted successfully', { fileId })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error('Image delete failed', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    )
  }
}
