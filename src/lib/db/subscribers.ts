import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { parse } from 'papaparse'

type Subscriber = Database['public']['Tables']['subscribers']['Row']
type SubscriberInsert = Database['public']['Tables']['subscribers']['Insert']
type SubscriberUpdate = Database['public']['Tables']['subscribers']['Update']

/**
 * Get all subscribers for a publication
 */
export async function getPublicationSubscribers(
  publicationId: string,
  filters?: {
    status?: string
    search?: string
  }
) {
  const supabase = await createClient()

  let query = supabase
    .from('subscribers')
    .select('*')
    .eq('publication_id', publicationId)

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.ilike('email', `%${filters.search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data as Subscriber[]
}

/**
 * Get active subscribers for sending
 */
export async function getActiveSubscribers(publicationId: string) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('publication_id', publicationId)
    .eq('status', 'active')
    .order('email')

  if (error) throw error
  return data as Subscriber[]
}

/**
 * Get subscriber by email
 */
export async function getSubscriberByEmail(
  publicationId: string,
  email: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('publication_id', publicationId)
    .eq('email', email.toLowerCase())
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Subscriber | null
}

/**
 * Get subscriber by confirmation token
 */
export async function getSubscriberByConfirmationToken(token: string) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('confirmation_token', token)
    .single()

  if (error) throw error
  return data as Subscriber
}

/**
 * Get subscriber by unsubscribe token
 */
export async function getSubscriberByUnsubscribeToken(token: string) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('unsubscribe_token', token)
    .single()

  if (error) throw error
  return data as Subscriber
}

/**
 * Create subscriber (with pending status for double opt-in)
 */
export async function createSubscriber(subscriber: SubscriberInsert) {
  const supabase = await createAdminClient()

  // Normalize email
  const normalizedEmail = subscriber.email.toLowerCase().trim()

  const { data, error } = await supabase
    .from('subscribers')
    .insert({
      ...subscriber,
      email: normalizedEmail,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data as Subscriber
}

/**
 * Confirm subscriber (activate)
 */
export async function confirmSubscriber(token: string) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('subscribers')
    .update({
      status: 'active',
      confirmed_at: new Date().toISOString(),
    })
    .eq('confirmation_token', token)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) throw error
  return data as Subscriber
}

/**
 * Unsubscribe
 */
export async function unsubscribeSubscriber(token: string) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('unsubscribe_token', token)
    .select()
    .single()

  if (error) throw error
  return data as Subscriber
}

/**
 * Update subscriber status
 */
export async function updateSubscriberStatus(
  id: string,
  status: 'pending' | 'active' | 'unsubscribed' | 'bounced' | 'complained'
) {
  const supabase = await createAdminClient()

  const updates: SubscriberUpdate = { status }

  // Set timestamp based on status
  if (status === 'unsubscribed') {
    updates.unsubscribed_at = new Date().toISOString()
  } else if (status === 'bounced') {
    updates.bounced_at = new Date().toISOString()
  } else if (status === 'complained') {
    updates.complained_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('subscribers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Subscriber
}

/**
 * Delete subscriber
 */
export async function deleteSubscriber(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('subscribers').delete().eq('id', id)

  if (error) throw error
}

/**
 * Import subscribers from CSV
 */
export async function importSubscribersFromCSV(
  publicationId: string,
  csvContent: string
): Promise<{
  imported: number
  duplicates: number
  errors: string[]
}> {
  const supabase = await createAdminClient()

  return new Promise((resolve) => {
    parse<{ email: string; name?: string; metadata?: string }>(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let imported = 0
        let duplicates = 0
        const errors: string[] = []

        for (const row of results.data) {
          try {
            if (!row.email || !row.email.includes('@')) {
              errors.push(`Invalid email: ${row.email}`)
              continue
            }

            const email = row.email.toLowerCase().trim()

            // Check if subscriber already exists
            const { data: existing } = await supabase
              .from('subscribers')
              .select('id')
              .eq('publication_id', publicationId)
              .eq('email', email)
              .single()

            if (existing) {
              duplicates++
              continue
            }

            // Parse metadata if provided
            let metadata = {}
            if (row.metadata) {
              try {
                metadata = JSON.parse(row.metadata)
              } catch {
                metadata = { raw: row.metadata }
              }
            }

            // Create subscriber (auto-confirmed for imports)
            await supabase.from('subscribers').insert({
              publication_id: publicationId,
              email,
              status: 'active',
              confirmed_at: new Date().toISOString(),
              metadata,
            })

            imported++
          } catch (error: any) {
            errors.push(`Error importing ${row.email}: ${error.message}`)
          }
        }

        resolve({ imported, duplicates, errors })
      },
      error: (error) => {
        resolve({
          imported: 0,
          duplicates: 0,
          errors: [`CSV parse error: ${error.message}`],
        })
      },
    })
  })
}

/**
 * Export subscribers to CSV
 */
export async function exportSubscribersToCSV(
  publicationId: string,
  filters?: { status?: string }
): Promise<string> {
  const subscribers = await getPublicationSubscribers(publicationId, filters)

  // Create CSV header
  const header = 'email,status,confirmed_at,created_at\n'

  // Create CSV rows
  const rows = subscribers
    .map(
      (s) =>
        `${s.email},${s.status},${s.confirmed_at || ''},${s.created_at}`
    )
    .join('\n')

  return header + rows
}
