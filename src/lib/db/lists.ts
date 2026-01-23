import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type PublicationList = {
  id: string
  publication_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

type PublicationListInsert = {
  publication_id: string
  name: string
  description?: string | null
}

type SubscriberList = {
  id: string
  subscriber_id: string
  list_id: string
  added_at: string
}

/**
 * Get all lists for a publication
 */
export async function getPublicationLists(publicationId: string) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('publication_lists')
      .select('*')
      .eq('publication_id', publicationId)
      .order('name')

    if (error) {
      console.error('Error fetching publication lists:', error)
      throw new Error(`Failed to fetch lists: ${error.message}`)
    }
    return data as PublicationList[]
  } catch (error) {
    console.error('Error in getPublicationLists:', error)
    throw error
  }
}

/**
 * Get a single list by ID
 */
export async function getListById(listId: string) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('publication_lists')
      .select('*')
      .eq('id', listId)
      .single()

    if (error) {
      console.error('Error fetching list:', error)
      throw new Error(`Failed to fetch list: ${error.message}`)
    }
    return data as PublicationList
  } catch (error) {
    console.error('Error in getListById:', error)
    throw error
  }
}

/**
 * Create a new publication list
 */
export async function createPublicationList(list: PublicationListInsert) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('publication_lists')
      .insert(list)
      .select()
      .single()

    if (error) {
      console.error('Error creating list:', error)
      throw new Error(`Failed to create list: ${error.message}`)
    }
    return data as PublicationList
  } catch (error) {
    console.error('Error in createPublicationList:', error)
    throw error
  }
}

/**
 * Update a publication list
 */
export async function updatePublicationList(
  listId: string,
  updates: { name?: string; description?: string | null }
) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('publication_lists')
      .update(updates)
      .eq('id', listId)
      .select()
      .single()

    if (error) {
      console.error('Error updating list:', error)
      throw new Error(`Failed to update list: ${error.message}`)
    }
    return data as PublicationList
  } catch (error) {
    console.error('Error in updatePublicationList:', error)
    throw error
  }
}

/**
 * Delete a publication list
 */
export async function deletePublicationList(listId: string) {
  try {
    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('publication_lists')
      .delete()
      .eq('id', listId)

    if (error) {
      console.error('Error deleting list:', error)
      throw new Error(`Failed to delete list: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in deletePublicationList:', error)
    throw error
  }
}

/**
 * Get subscribers in a specific list
 */
export async function getListSubscribers(listId: string) {
  try {
    const supabase = await createAdminClient()

    const query = supabase.from('subscriber_lists') as any
    const { data, error } = await query
      .select(`
        *,
        subscribers:subscriber_id (*)
      `)
      .eq('list_id', listId)
      .order('added_at', { ascending: false })

    if (error) {
      console.error('Error fetching list subscribers:', error)
      throw new Error(`Failed to fetch list subscribers: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error('Error in getListSubscribers:', error)
    throw error
  }
}

/**
 * Get lists that a subscriber belongs to
 */
export async function getSubscriberLists(subscriberId: string) {
  try {
    const supabase = await createAdminClient()

    const query = supabase.from('subscriber_lists') as any
    const { data, error } = await query
      .select(`
        *,
        publication_lists:list_id (*)
      `)
      .eq('subscriber_id', subscriberId)
      .order('added_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriber lists:', error)
      throw new Error(`Failed to fetch subscriber lists: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error('Error in getSubscriberLists:', error)
    throw error
  }
}

/**
 * Add subscriber to a list
 */
export async function addSubscriberToList(subscriberId: string, listId: string) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('subscriber_lists')
      .insert({ subscriber_id: subscriberId, list_id: listId })
      .select()
      .single()

    if (error) {
      console.error('Error adding subscriber to list:', error)
      throw new Error(`Failed to add subscriber to list: ${error.message}`)
    }
    return data as SubscriberList
  } catch (error) {
    console.error('Error in addSubscriberToList:', error)
    throw error
  }
}

/**
 * Remove subscriber from a list
 */
export async function removeSubscriberFromList(subscriberId: string, listId: string) {
  try {
    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('subscriber_lists')
      .delete()
      .eq('subscriber_id', subscriberId)
      .eq('list_id', listId)

    if (error) {
      console.error('Error removing subscriber from list:', error)
      throw new Error(`Failed to remove subscriber from list: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in removeSubscriberFromList:', error)
    throw error
  }
}

/**
 * Get subscribers filtered by list (for sending emails to specific lists)
 */
export async function getActiveSubscribersByList(listId: string) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('subscriber_lists')
      .select(`
        subscribers:subscriber_id (*)
      `)
      .eq('list_id', listId)

    if (error) {
      console.error('Error fetching list active subscribers:', error)
      throw new Error(`Failed to fetch list active subscribers: ${error.message}`)
    }
    
    // Filter for active subscribers only and flatten the structure
    const activeSubscribers = data
      .map((item: any) => item.subscribers)
      .filter((sub: any) => sub && sub.status === 'active')

    return activeSubscribers
  } catch (error) {
    console.error('Error in getActiveSubscribersByList:', error)
    throw error
  }
}
