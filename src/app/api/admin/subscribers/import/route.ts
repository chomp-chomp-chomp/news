import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { importSubscribersFromCSV } from '@/lib/db/subscribers'
import { z } from 'zod'

const importSchema = z.object({
  publicationId: z.string().uuid(),
  csvContent: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { publicationId, csvContent } = importSchema.parse(body)

    const results = await importSubscribersFromCSV(publicationId, csvContent)

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error('Error importing subscribers:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to import subscribers' }, { status: 500 })
  }
}
