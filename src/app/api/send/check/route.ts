import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth()

    const checks = {
      resendApiKey: !!process.env.RESEND_API_KEY,
      resendApiKeyLength: process.env.RESEND_API_KEY?.length || 0,
      resendApiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 7) || 'missing',
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    return NextResponse.json({
      status: 'ok',
      checks,
      message: checks.resendApiKey
        ? 'Resend API key is configured'
        : 'WARNING: Resend API key is missing!',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
