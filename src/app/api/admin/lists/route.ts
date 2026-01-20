import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getPublicationLists, createPublicationList } from '@/lib/db/lists'
import { z } from 'zod'

const createListSchema = z.object({
  publicationId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const publicationId = searchParams.get('publicationId')

    if (!publicationId) {
      return NextResponse.json({ error: 'Publication ID is required' }, { status: 400 })
    }

    const lists = await getPublicationLists(publicationId)

    return NextResponse.json(lists, { status: 200 })
  } catch (error) {
    console.error('Error fetching lists:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { publicationId, name, description } = createListSchema.parse(body)

    const list = await createPublicationList({
      publication_id: publicationId,
      name,
      description,
    })

    return NextResponse.json(list, { status: 201 })
  } catch (error) {
    console.error('Error creating list:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to create list' }, { status: 500 })
  }
}
