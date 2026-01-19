import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createBlock, getIssueById } from '@/lib/db/issues'
import { z } from 'zod'

const createBlockSchema = z.object({
  type: z.enum(['story', 'promo', 'text', 'divider', 'image', 'footer']),
  sort_order: z.number(),
  data: z.record(z.any()),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: issueId } = await context.params

    // Verify issue exists and user has access
    const issue = await getIssueById(issueId)
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // TODO: Add permission check that user is admin of publication

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
        { error: 'Invalid request data', details: error.errors },
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
