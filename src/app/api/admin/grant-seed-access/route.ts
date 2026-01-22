import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/admin/grant-seed-access
 *
 * Grants the current authenticated user admin access to the seed publication (Chomp Weekly).
 * This calls the database function add_current_user_to_seed_publication() created in migration
 * 20260122020001_add_seed_publication_admin_helper.sql
 */
export async function POST() {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Call the helper function to grant access
    const { error: funcError } = await supabase.rpc('add_current_user_to_seed_publication')

    if (funcError) {
      console.error('Failed to grant seed publication access:', funcError)
      return NextResponse.json(
        { error: funcError.message || 'Failed to grant access' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully granted admin access to Chomp Weekly'
    })
  } catch (error) {
    console.error('Grant seed access error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
