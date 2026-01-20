import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Database } from '@/types/database'

/**
 * Get current user or redirect to login
 * Use this in Server Components, not in API routes
 */
export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Get current user for API routes (returns null instead of redirecting)
 * Use this in API routes instead of requireAuth()
 */
export async function requireAuthApi() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/**
 * Get current user (or null)
 */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/**
 * Check if user is admin of a publication
 */
export async function isPublicationAdmin(
  publicationId: string,
  userId?: string
): Promise<boolean> {
  const user = userId || (await getUser())?.id

  if (!user) return false

  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('publication_admins')
    .select('id')
    .eq('publication_id', publicationId)
    .eq('user_id', user)
    .maybeSingle()

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return !!data
}

/**
 * Require user to be admin of publication or redirect
 */
export async function requirePublicationAdmin(publicationId: string) {
  const user = await requireAuth()

  const isAdmin = await isPublicationAdmin(publicationId, user.id)

  if (!isAdmin) {
    redirect('/admin')
  }

  return user
}

/**
 * Get all publications user has access to
 */
export async function getUserPublications(userId?: string) {
  const supabase = await createClient()
  const user = userId || (await getUser())?.id

  if (!user) return []

  const { data, error } = await supabase
    .from('publication_admins')
    .select('publication:publications(*)')
    .eq('user_id', user)

  if (error) {
    console.error('Error fetching user publications:', error)
    return []
  }

  return data?.map((d: { publication: Database['public']['Tables']['publications']['Row'] | null }) => d.publication).filter(Boolean) || []
}
