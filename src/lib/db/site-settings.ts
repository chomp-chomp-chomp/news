import { createAdminClient } from '@/lib/supabase/server'

export interface SiteSettings {
  site_name: string
  site_description: string
  favicon_url: string
  site_logo_url: string
  og_image_url: string
  twitter_image_url: string
}

/**
 * Get site settings from database with fallback to environment variables
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')

    if (error) {
      console.error('Error fetching site settings:', error)
      return getDefaultSettings()
    }

    // Convert array to key-value object
    const settings = data.reduce((acc, setting) => {
      acc[setting.key] = setting.value || ''
      return acc
    }, {} as Record<string, string>)

    // Return settings with env fallbacks
    return {
      site_name: settings.site_name || process.env.NEXT_PUBLIC_SITE_NAME || 'Newsletter Platform',
      site_description: settings.site_description || process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Subscribe to quality newsletters curated by experts',
      favicon_url: settings.favicon_url || process.env.NEXT_PUBLIC_FAVICON_URL || '',
      site_logo_url: settings.site_logo_url || process.env.NEXT_PUBLIC_SITE_LOGO_URL || '',
      og_image_url: settings.og_image_url || process.env.NEXT_PUBLIC_OG_IMAGE || '',
      twitter_image_url: settings.twitter_image_url || process.env.NEXT_PUBLIC_TWITTER_IMAGE || '',
    }
  } catch (error) {
    console.error('Error in getSiteSettings:', error)
    return getDefaultSettings()
  }
}

/**
 * Get default settings from environment variables
 */
function getDefaultSettings(): SiteSettings {
  return {
    site_name: process.env.NEXT_PUBLIC_SITE_NAME || 'Newsletter Platform',
    site_description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Subscribe to quality newsletters curated by experts',
    favicon_url: process.env.NEXT_PUBLIC_FAVICON_URL || '',
    site_logo_url: process.env.NEXT_PUBLIC_SITE_LOGO_URL || '',
    og_image_url: process.env.NEXT_PUBLIC_OG_IMAGE || '',
    twitter_image_url: process.env.NEXT_PUBLIC_TWITTER_IMAGE || '',
  }
}
