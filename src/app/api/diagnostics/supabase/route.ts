import { NextResponse } from 'next/server'
import { requireAuthApi } from '@/lib/auth'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function GET() {
  const user = await requireAuthApi()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  }

  let anonClientOk = false
  let anonClientError: string | null = null
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.getUser()
    if (error) {
      anonClientError = error.message
    } else {
      anonClientOk = true
    }
  } catch (error) {
    anonClientError = error instanceof Error ? error.message : 'Unknown error'
  }

  let adminClientOk = false
  let adminClientError: string | null = null
  try {
    const adminClient = await createAdminClient()
    const { error } = await adminClient.from('publications').select('id').limit(1)
    if (error) {
      adminClientError = error.message
    } else {
      adminClientOk = true
    }
  } catch (error) {
    adminClientError = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json({
    env,
    anonClientOk,
    anonClientError,
    adminClientOk,
    adminClientError,
  })
}
