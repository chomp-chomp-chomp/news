import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Publication = Database['public']['Tables']['publications']['Row']
type PublicationInsert = Database['public']['Tables']['publications']['Insert']
type PublicationUpdate = Database['public']['Tables']['publications']['Update']

/**
 * Get all public publications
 */
export async function getPublicPublications() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .eq('is_public', true)
    .is('deleted_at', null)
    .order('name')

  if (error) throw error
  return data as Publication[]
}

/**
 * Get publication by slug
 */
export async function getPublicationBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publications')
    .select('*, default_footer:default_footers(*)')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Publication | null
}

/**
 * Get publication by ID
 */
export async function getPublicationById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publications')
    .select('*, default_footer:default_footers(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Publication | null
}

/**
 * Create a new publication
 */
export async function createPublication(
  publication: PublicationInsert,
  userId: string
) {
  const supabase = await createAdminClient()

  console.log('Creating publication:', { publication, userId })

  // Create publication
  const { data, error } = await supabase
    .from('publications')
    .insert(publication)
    .select()
    .single()

  if (error) {
    console.error('Failed to insert publication:', error)
    throw new Error(`Failed to create publication: ${error.message}`)
  }

  console.log('Publication created, adding admin:', data.id)

  // Add user as admin
  const { error: adminError } = await supabase.from('publication_admins').insert({
    publication_id: data.id,
    user_id: userId,
    role: 'admin',
  })

  if (adminError) {
    console.error('Failed to add admin:', adminError)
    throw new Error(`Failed to add admin to publication: ${adminError.message}`)
  }

  console.log('Admin added successfully')

  return data as Publication
}

/**
 * Update publication
 */
export async function updatePublication(
  id: string,
  updates: PublicationUpdate
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publications')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Publication
}

/**
 * Get subscriber stats for publication
 */
export async function getPublicationStats(publicationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publication_subscriber_stats')
    .select('*')
    .eq('publication_id', publicationId)
    .single()

  if (error) {
    // Return zeros if no stats found
    return {
      active_count: 0,
      pending_count: 0,
      unsubscribed_count: 0,
      bounced_count: 0,
      complained_count: 0,
      total_count: 0,
    }
  }

  return data
}
