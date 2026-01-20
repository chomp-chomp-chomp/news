import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isPublicationAdmin } from '@/lib/auth'
import { updateIssue, getIssueById, deleteIssue } from '@/lib/db/issues'
import { z } from 'zod'

const updateSchema = z.object({
  subject: z.string().optional(),
  preheader: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'sent', 'scheduled']).optional(),
  slug: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params

    // Verify issue exists and user has access
    const issue = await getIssueById(id)
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Verify user is admin of the publication
    const isAdmin = await isPublicationAdmin(issue.publication_id, user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - you must be an admin of this publication' },
        { status: 403 }
      )
    }

    // Parse and validate request
    const body = await request.json()
    const updates = updateSchema.parse(body)

    // Update issue
    const updated = await updateIssue(id, updates)

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Update issue error:', error)
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params

    // Verify issue exists and user has access
    const issue = await getIssueById(id)
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Verify user is admin of the publication
    const isAdmin = await isPublicationAdmin(issue.publication_id, user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - you must be an admin of this publication' },
        { status: 403 }
      )
    }

    // Delete issue (soft delete)
    await deleteIssue(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete issue error:', error)
    return NextResponse.json(
      { error: 'Failed to delete issue' },
      { status: 500 }
    )
  }
}
