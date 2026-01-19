import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { updateIssue, getIssueById } from '@/lib/db/issues'
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

    // TODO: Add permission check that user is admin of publication

    // Parse and validate request
    const body = await request.json()
    const updates = updateSchema.parse(body)

    // Update issue
    const updated = await updateIssue(id, updates)

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
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
