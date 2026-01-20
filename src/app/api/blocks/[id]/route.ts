import { NextRequest, NextResponse } from 'next/server'
import { requireAuthApi } from '@/lib/auth'
import { updateBlock, deleteBlock } from '@/lib/db/issues'
import { z } from 'zod'

const updateSchema = z.object({
  data: z.any().optional(),
  type: z.enum(['story', 'promo', 'text', 'divider', 'image', 'footer']).optional(),
})

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthApi()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await context.params

    // TODO: Add permission check that user is admin of publication

    // Parse and validate request
    const body = await request.json()
    const updates = updateSchema.parse(body)

    // Update block
    const block = await updateBlock(id, updates)

    return NextResponse.json(block)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Update block error:', error)
    return NextResponse.json(
      { error: 'Failed to update block' },
      { status: 500 }
    )
  }
}

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

    // TODO: Add permission check that user is admin of publication

    // Delete block
    await deleteBlock(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete block error:', error)
    return NextResponse.json(
      { error: 'Failed to delete block' },
      { status: 500 }
    )
  }
}
