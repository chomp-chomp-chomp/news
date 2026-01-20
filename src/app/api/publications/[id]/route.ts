import { NextRequest, NextResponse } from 'next/server'
import { requireAuthApi, isPublicationAdmin } from '@/lib/auth'
import { deletePublication, getPublicationById } from '@/lib/db/publications'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthApi()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await context.params

    // Verify publication exists and user has access
    const publication = await getPublicationById(id)
    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 })
    }

    // Verify user is admin of the publication
    const isAdmin = await isPublicationAdmin(id, user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - you must be an admin of this publication' },
        { status: 403 }
      )
    }

    // Delete publication (soft delete)
    const deleted = await deletePublication(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete publication error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
