import { NextRequest, NextResponse } from 'next/server'
import { requireAuthApi, isPublicationAdmin } from '@/lib/auth'
import { createBlock, getIssueById } from '@/lib/db/issues'
import { z } from 'zod'

const createBlockSchema = z.object({
  type: z.enum(['story', 'promo', 'text', 'divider', 'image', 'footer']),
  sort_order: z.number(),
  data: z.any(),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthApi()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id: issueId } = await context.params

    // Verify issue exists and user has access
    const issue = await getIssueById(issueId)
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Check if user is admin of publication
    const isAdmin = await isPublicationAdmin(issue.publication_id, user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate request
    const body = await request.json()
    const blockData = createBlockSchema.parse(body)

    // Create block
    const block = await createBlock({
      issue_id: issueId,
      ...blockData,
    })

    return NextResponse.json(block)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create block error:', error)
    return NextResponse.json(
      { error: 'Failed to create block' },
      { status: 500 }
    )
  }
}
