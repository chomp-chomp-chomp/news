import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createSubscriber } from '@/lib/db/subscribers'
import { z } from 'zod'

const addSubscriberSchema = z.object({
  publicationId: z.string().uuid(),
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { publicationId, email } = addSubscriberSchema.parse(body)

    // Create subscriber with active status (admin-added subscribers are auto-confirmed)
    const subscriber = await createSubscriber(
      { publication_id: publicationId, email },
      'active'
    )

    return NextResponse.json({ success: true, subscriber }, { status: 201 })
  } catch (error) {
    console.error('Error adding subscriber:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to add subscriber' }, { status: 500 })
  }
}
