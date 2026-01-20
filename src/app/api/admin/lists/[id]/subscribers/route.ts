import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { addSubscriberToList, removeSubscriberFromList } from '@/lib/db/lists'
import { z } from 'zod'

interface RouteContext {
  params: Promise<{ id: string }>
}

const addSubscriberSchema = z.object({
  subscriberId: z.string().uuid(),
})

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: listId } = await context.params
    const body = await request.json()
    const { subscriberId } = addSubscriberSchema.parse(body)

    const result = await addSubscriberToList(subscriberId, listId)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error adding subscriber to list:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to add subscriber to list' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: listId } = await context.params
    const searchParams = request.nextUrl.searchParams
    const subscriberId = searchParams.get('subscriberId')

    if (!subscriberId) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 })
    }

    await removeSubscriberFromList(subscriberId, listId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error removing subscriber from list:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to remove subscriber from list' }, { status: 500 })
  }
}
