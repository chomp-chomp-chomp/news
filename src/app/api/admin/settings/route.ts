import { NextRequest, NextResponse } from 'next/server'
import { requireAuthApi } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateSettingsSchema = z.record(z.string(), z.string())
type SiteSettingRow = {
  key: string
  value: string | null
}

/**
 * GET /api/admin/settings
 * Get all site settings (public endpoint - no auth required)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('key')

    if (error) {
      console.error('Error fetching site settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Convert array to key-value object
    const settings = (data ?? []).reduce<Record<string, string>>((acc, setting: SiteSettingRow) => {
      acc[setting.key] = setting.value ?? ''
      return acc
    }, {})

    return NextResponse.json(settings, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/settings
 * Update site settings
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuthApi()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const settings = updateSettingsSchema.parse(body)

    const supabase = await createAdminClient()

    // Update each setting
    const updates = Object.entries(settings).map(([key, value]) => 
      supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    )

    const results = await Promise.all(updates)
    
    // Check for errors
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error('Error updating site settings:', errors)
      return NextResponse.json({ error: 'Failed to update some settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error updating site settings:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
