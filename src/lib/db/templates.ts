import { createAdminClient } from '@/lib/supabase/server'

export type NewsletterTemplate = {
  id: string
  publication_id: string | null
  name: string
  description: string | null
  template_data: {
    blocks: any[]
    subject_template?: string
    preheader?: string
  }
  is_global: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export type TemplateInsert = {
  publication_id?: string
  name: string
  description?: string | null
  template_data: {
    blocks: any[]
    subject_template?: string
    preheader?: string
  }
  is_global?: boolean
  created_by?: string
}

/**
 * Get all templates available to a publication (global + publication-specific)
 */
export async function getAvailableTemplates(publicationId: string) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('newsletter_templates')
      .select('*')
      .or(`is_global.eq.true,publication_id.eq.${publicationId}`)
      .order('name')

    if (error) {
      console.error('Error fetching templates:', error)
      throw new Error(`Failed to fetch templates: ${error.message}`)
    }
    return data as NewsletterTemplate[]
  } catch (error) {
    console.error('Error in getAvailableTemplates:', error)
    throw error
  }
}

/**
 * Get a single template by ID
 */
export async function getTemplateById(templateId: string) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('newsletter_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error) {
      console.error('Error fetching template:', error)
      throw new Error(`Failed to fetch template: ${error.message}`)
    }
    return data as NewsletterTemplate
  } catch (error) {
    console.error('Error in getTemplateById:', error)
    throw error
  }
}

/**
 * Create a new template
 */
export async function createTemplate(template: TemplateInsert) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('newsletter_templates')
      .insert(template)
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      throw new Error(`Failed to create template: ${error.message}`)
    }
    return data as NewsletterTemplate
  } catch (error) {
    console.error('Error in createTemplate:', error)
    throw error
  }
}

/**
 * Update a template
 */
export async function updateTemplate(
  templateId: string,
  updates: {
    name?: string
    description?: string | null
    template_data?: {
      blocks: any[]
      subject_template?: string
      preheader?: string
    }
  }
) {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('newsletter_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single()

    if (error) {
      console.error('Error updating template:', error)
      throw new Error(`Failed to update template: ${error.message}`)
    }
    return data as NewsletterTemplate
  } catch (error) {
    console.error('Error in updateTemplate:', error)
    throw error
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string) {
  try {
    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('newsletter_templates')
      .delete()
      .eq('id', templateId)

    if (error) {
      console.error('Error deleting template:', error)
      throw new Error(`Failed to delete template: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in deleteTemplate:', error)
    throw error
  }
}
