import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Issue = Database['public']['Tables']['issues']['Row']
type IssueInsert = Database['public']['Tables']['issues']['Insert']
type IssueUpdate = Database['public']['Tables']['issues']['Update']
type Block = Database['public']['Tables']['blocks']['Row']
type BlockInsert = Database['public']['Tables']['blocks']['Insert']
type BlockUpdate = Database['public']['Tables']['blocks']['Update']

/**
 * Get all issues for a publication
 */
export async function getPublicationIssues(
  publicationId: string,
  includeBlocks = false
) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('issues')
      .select(includeBlocks ? '*, blocks(*)' : '*')
      .eq('publication_id', publicationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching publication issues:', error)
      throw new Error(`Failed to fetch issues: ${error.message}`)
    }
    return data as Issue[]
  } catch (error) {
    console.error('Error in getPublicationIssues:', error)
    throw error
  }
}

/**
 * Get published issues for a publication (public)
 */
export async function getPublishedIssues(publicationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('publication_id', publicationId)
    .in('status', ['published', 'sent'])
    .is('deleted_at', null)
    .order('published_at', { ascending: false })

  if (error) throw error
  return data as Issue[]
}

/**
 * Get issue by slug
 */
export async function getIssueBySlug(publicationId: string, slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('issues')
    .select('*, publication:publications(*), blocks(*)')
    .eq('publication_id', publicationId)
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as (Issue & { publication: Database['public']['Tables']['publications']['Row']; blocks: Block[] }) | null
}

/**
 * Get issue by ID with all related data
 */
export async function getIssueById(issueId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('issues')
    .select('*, publication:publications(*), blocks(*)')
    .eq('id', issueId)
    .is('deleted_at', null)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as (Issue & { publication: Database['public']['Tables']['publications']['Row']; blocks: Block[] }) | null
}

/**
 * Create a new issue
 */
export async function createIssue(issue: IssueInsert) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('issues')
      .insert(issue)
      .select()
      .single()

    if (error) {
      console.error('Error creating issue:', error)
      throw new Error(`Failed to create issue: ${error.message}`)
    }
    return data as Issue
  } catch (error) {
    console.error('Error in createIssue:', error)
    throw error
  }
}

/**
 * Update issue
 */
export async function updateIssue(id: string, updates: IssueUpdate) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('issues')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating issue:', error)
      throw new Error(`Failed to update issue: ${error.message}`)
    }
    return data as Issue
  } catch (error) {
    console.error('Error in updateIssue:', error)
    throw error
  }
}

/**
 * Publish issue
 */
export async function publishIssue(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('issues')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Issue
}

/**
 * Get blocks for an issue
 */
export async function getIssueBlocks(issueId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('issue_id', issueId)
    .order('sort_order')

  if (error) throw error
  return data as Block[]
}

/**
 * Create a block
 */
export async function createBlock(block: BlockInsert) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('blocks')
    .insert(block)
    .select()
    .single()

  if (error) {
    console.error('Error creating block:', error)
    throw error
  }
  return data as Block
}

/**
 * Update block
 */
export async function updateBlock(id: string, updates: BlockUpdate) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('blocks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating block:', error)
    throw error
  }
  return data as Block
}

/**
 * Delete block
 */
export async function deleteBlock(id: string) {
  const supabase = await createAdminClient()

  const { error } = await supabase.from('blocks').delete().eq('id', id)

  if (error) {
    console.error('Error deleting block:', error)
    throw error
  }
}

/**
 * Reorder blocks
 */
export async function reorderBlocks(
  issueId: string,
  blockIds: string[]
) {
  const supabase = await createAdminClient()

  // Update each block's sort_order
  const updates = blockIds.map((blockId, index) =>
    supabase
      .from('blocks')
      .update({ sort_order: index })
      .eq('id', blockId)
      .eq('issue_id', issueId)
  )

  await Promise.all(updates)
}

/**
 * Duplicate issue
 */
export async function duplicateIssue(issueId: string, newSlug: string) {
  const supabase = await createAdminClient()

  // Get original issue
  const issue = await getIssueById(issueId)
  
  if (!issue) {
    throw new Error('Issue not found')
  }

  // Create new issue
  const { data: newIssue, error: issueError } = await supabase
    .from('issues')
    .insert({
      publication_id: issue.publication_id,
      slug: newSlug,
      subject: `${issue.subject} (Copy)`,
      preheader: issue.preheader,
      status: 'draft',
    })
    .select()
    .single()

  if (issueError) throw issueError

  // Duplicate blocks
  if (issue.blocks && issue.blocks.length > 0) {
    const blockInserts = issue.blocks.map((block: Block) => ({
      issue_id: newIssue.id,
      type: block.type,
      sort_order: block.sort_order,
      data: block.data,
    }))

    const { error: blocksError } = await supabase
      .from('blocks')
      .insert(blockInserts)

    if (blocksError) throw blocksError
  }

  return newIssue as Issue
}

/**
 * Delete issue (soft delete)
 */
export async function deleteIssue(id: string) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('issues')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null) // Only update if not already deleted
      .select()

    if (error) {
      console.error('Error deleting issue:', error)
      throw new Error(`Failed to delete issue: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteIssue:', error)
    throw error
  }
}
