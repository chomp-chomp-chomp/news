# Site Settings Error Fix

## Problem
The `/api/admin/settings` endpoint is returning a 500 Internal Server Error because the `site_settings` table doesn't exist in your database.

## Root Cause
The migration file `supabase/migrations/20260120215209_add_site_settings.sql` exists but hasn't been run in your Supabase database yet.

## Solution

### Step 1: Run the Site Settings Migration

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open the file `supabase/migrations/20260120215209_add_site_settings.sql` from this repository
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** to execute the migration

This will:
- Create the `site_settings` table
- Add default site settings values
- Enable Row Level Security (RLS)
- Set up policies for public read and authenticated write access

### Step 2: Verify the Fix

1. Restart your development server if it's running
2. Go to `/admin/settings` in your browser
3. The page should now load without errors
4. You should see the site settings form with default values

### Step 3: Configure Your Site Settings

Once the migration is run, you can customize:
- **Site Name**: The name displayed in browser tabs and page titles
- **Site Description**: Shown on homepage and in meta tags
- **Favicon URL**: Browser tab icon
- **Site Logo URL**: Main site logo
- **Open Graph Image**: Social media preview image (1200x630px)
- **Twitter Image**: Twitter/X preview image (1200x600px)

## What Changed in the Code

I've already updated `src/types/database.ts` to include the `site_settings` table type definition. This ensures TypeScript knows about the table structure.

## Alternative: Run All Pending Migrations

If you haven't run all migrations yet, you should run them in order. Here are the migration files that need to be executed:

1. `20260118000001_initial_schema.sql` (base schema)
2. `20260120000001_fix_publication_admin_rls.sql`
3. `20260120000002_fix_publication_admin_read_policy.sql`
4. `20260120000003_fix_view_permissions.sql`
5. `20260120000004_fix_default_footers_rls.sql`
6. `20260120000005_add_publication_lists.sql`
7. `20260120000006_add_newsletter_templates.sql`
8. `20260120215209_add_site_settings.sql` ⚠️ **This is the missing one**
9. `20260120000005_add_admin_rls_policies.sql`

Run each one in the SQL Editor in the order listed above.
