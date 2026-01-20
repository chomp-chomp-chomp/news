import { NextRequest, NextResponse } from 'next/server'
import { requireAuthApi } from '@/lib/auth'
import { exportSubscribersToCSV } from '@/lib/db/subscribers'

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuthApi()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const publicationId = searchParams.get('publicationId')

    if (!publicationId) {
      return NextResponse.json({ error: 'Publication ID is required' }, { status: 400 })
    }

    const csvContent = await exportSubscribersToCSV(publicationId)

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subscribers-${publicationId}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting subscribers:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to export subscribers' }, { status: 500 })
  }
}
