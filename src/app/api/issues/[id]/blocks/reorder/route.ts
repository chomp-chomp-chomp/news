import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { reorderBlocks, getIssueById } from '@/lib/db/issues'
import { z } from 'zod'

const reorderSchema = z.object({
  blockIds: z.array(z.string().uuid()),
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
    const { blockIds } = reorderSchema.parse(body)

    // Reorder blocks
    await reorderBlocks(issueId, blockIds)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Reorder blocks error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder blocks' },
      { status: 500 }
    )
  }
}
