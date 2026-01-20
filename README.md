# Newsletter Platform MVP

A production-ready, self-hosted newsletter platform built with Next.js, Supabase, and Resend. Manage multiple publications, create beautiful emails, and track subscriber engagement.

## Features

### ✨ Multi-Publication Support
- Host unlimited newsletters in one platform
- Each with its own branding, subscribers, and archive
- Public directory of all newsletters

### 📧 Email Management
- Visual content blocks (stories, promos, text, images)
- React Email templates with responsive design
- Preview before sending
- Test emails to verify rendering
- Batch sending with rate limiting

### 👥 Subscriber Management
- Double opt-in confirmation flow
- Manual subscriber addition via UI form
- CSV import/export with bulk operations
- Automatic bounce and complaint handling
- Subscriber status tracking (active, pending, unsubscribed, bounced)
- **Publication lists** for subscriber segmentation
- Assign subscribers to multiple lists for targeted campaigns

### 📊 Analytics & Tracking
- Email opens and clicks (via Resend webhooks)
- Subscriber growth metrics
- Issue performance stats

### 🔒 Security
- Row-level security (RLS) with Supabase
- Rate limiting on subscriptions and API endpoints
- Webhook signature verification
- Admin-only access control

### 🎨 Design & Customization
- Based on chompchomp.cc design system
- Responsive layouts
- Dark mode support
- Clean, minimal UI
- **Dynamic branding** - Configure logo, accent colors, and header images per publication
- **CSS customization** - Easily customize fonts, colors, spacing via CSS variables
- **Reusable templates** - Pre-built newsletter templates for faster content creation

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Supabase (Postgres)
- **Authentication**: Supabase Auth
- **Email**: Resend
- **Email Templates**: React Email
- **Image Storage**: ImageKit
- **Styling**: CSS Custom Properties + Tailwind
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Resend account ([resend.com](https://resend.com))
- ImageKit account ([imagekit.io](https://imagekit.io))
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/chomp-chomp-chomp/news.git
cd news
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a New Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize

#### Run Migrations

1. In the Supabase dashboard, go to **SQL Editor**
2. Open `supabase/migrations/20260118000001_initial_schema.sql`
3. Copy and paste the entire contents into the SQL Editor
4. Click **Run** to execute the migration

#### Load Seed Data (Optional)

1. In the SQL Editor, open `supabase/seed/seed.sql`
2. Copy and paste the contents
3. Click **Run** to create sample data

#### Get API Keys

1. Go to **Project Settings** → **API**
2. Copy the following:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Never expose this)

### 4. Set Up Resend

1. Go to [resend.com](https://resend.com) and create an account
2. Add and verify your domain
3. Go to **API Keys** and create a new key
4. Copy the key → `RESEND_API_KEY`
5. Go to **Webhooks** and create a webhook:
   - URL: `https://your-domain.com/api/webhooks/resend`
   - Events: Select all email events
   - Copy the signing secret → `RESEND_WEBHOOK_SECRET`

### 5. Set Up ImageKit

1. Go to [imagekit.io](https://imagekit.io) and create an account
2. Go to **Developer Options** → **API Keys**
3. Copy the following:
   - Public Key → `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
   - Private Key → `IMAGEKIT_PRIVATE_KEY`
   - URL Endpoint → `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`

### 6. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in all the values from steps 3-5:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend
RESEND_API_KEY=re_xxxxxxxxxx
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxx

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxx
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_SUBSCRIBE_PER_HOUR=5
RATE_LIMIT_SEND_TEST_PER_HOUR=10

# Email Configuration
EMAIL_BATCH_SIZE=100
EMAIL_BATCH_DELAY_MS=1000

# Branding & Metadata (Optional)
NEXT_PUBLIC_SITE_NAME=Newsletter Platform
NEXT_PUBLIC_SITE_DESCRIPTION=Subscribe to quality newsletters curated by experts
# NEXT_PUBLIC_OG_IMAGE=https://your-domain.com/og-image.png
```

### 7. Create Your Admin Account

```bash
npm run dev
```

1. Open [http://localhost:3000/login](http://localhost:3000/login)
2. Click "Sign Up" and create an account
3. Check your email for the confirmation link
4. Confirm your email address

### 8. Make Yourself an Admin

After confirming your email:

1. Go to Supabase Dashboard → **SQL Editor**
2. Find your user ID:

```sql
SELECT id, email FROM auth.users;
```

3. Copy your user ID and run:

```sql
INSERT INTO publication_admins (publication_id, user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- seed publication ID
  'YOUR_USER_ID_HERE',
  'admin'
);
```

4. Refresh the admin dashboard

### 9. Start Building!

You now have a fully functional newsletter platform! 🎉

- **Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Public Site**: [http://localhost:3000](http://localhost:3000)

## Project Structure

```
news/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   ├── n/[slug]/          # Public newsletter pages
│   │   └── login/             # Authentication
│   ├── components/            # React components
│   ├── emails/                # React Email templates
│   ├── lib/                   # Utilities and helpers
│   │   ├── db/               # Database query functions
│   │   ├── supabase/         # Supabase clients
│   │   ├── auth.ts           # Authentication helpers
│   │   ├── logger.ts         # Logging utilities
│   │   ├── rate-limit.ts     # Rate limiting
│   │   └── render-model.ts   # Email rendering logic
│   └── types/                 # TypeScript types
├── supabase/
│   ├── migrations/            # Database schema
│   └── seed/                  # Sample data
└── public/                    # Static assets
```

## API Routes

### Public Endpoints

- `POST /api/subscribe` - Subscribe to a publication
- `GET /api/confirm?token=xxx` - Confirm subscription
- `GET /api/unsubscribe?token=xxx` - Unsubscribe

### Admin Endpoints (Auth Required)

- `POST /api/send/test` - Send test email
- `POST /api/send/campaign` - Send to all subscribers
- `POST /api/upload/image` - Upload image to ImageKit
- `DELETE /api/upload/image?fileId=xxx` - Delete image
- `POST /api/admin/subscribers` - Add a single subscriber
- `POST /api/admin/subscribers/import` - Import subscribers from CSV
- `GET /api/admin/subscribers/export?publicationId=xxx` - Export subscribers to CSV
- `GET /api/admin/lists?publicationId=xxx` - Get publication lists
- `POST /api/admin/lists` - Create a new publication list
- `POST /api/admin/lists/[id]/subscribers` - Add subscriber to list
- `DELETE /api/admin/lists/[id]/subscribers?subscriberId=xxx` - Remove subscriber from list

### Webhooks

- `POST /api/webhooks/resend` - Receive Resend events

## Common Tasks

### Create a New Publication

1. Go to Admin → Publications
2. Click "Create Publication"
3. Fill in details including:
   - Basic information (name, slug, description)
   - Email settings (from name, from email, reply-to)
   - **Branding** (logo URL, accent color, header image URL)
4. You're automatically added as an admin

### Customize Publication Branding

1. Go to Admin → Publications → [Your Publication] → Edit Settings
2. In the **Branding** section:
   - **Logo URL**: Add your publication logo (displayed in emails and public pages)
   - **Accent Color**: Choose your primary brand color using the color picker
   - **Header Image URL**: Optional banner image for your email template
3. Save changes - your emails will now use these branding settings

### Customize Global Site Branding

You can customize the global site branding (homepage, page titles, OpenGraph tags) using environment variables:

1. Edit your `.env.local` file
2. Set the following variables:
   ```env
   # Site name - appears in browser tabs and page titles
   NEXT_PUBLIC_SITE_NAME=My Newsletter Platform
   
   # Site description - shown on homepage and in meta tags
   NEXT_PUBLIC_SITE_DESCRIPTION=Your custom description here
   
   # Optional: OpenGraph image for social media sharing (1200x630px recommended)
   NEXT_PUBLIC_OG_IMAGE=https://your-domain.com/og-image.png
   ```
3. Restart your development server to see the changes

These settings will:
- Update the site name in browser tabs and page titles
- Change the homepage heading and description
- Set OpenGraph and Twitter Card metadata for better social media sharing
- Allow customization of your site's appearance when shared on social platforms

### Send Your First Newsletter

1. Go to your publication in the admin
2. Click "New Issue"
3. **Optional**: Select a template to pre-populate content blocks
4. Add content blocks (stories, promos, text, images, etc.)
5. Click "Preview" to see how it looks
6. Click "Send Test" to send to your email
7. When ready, click "Send to Subscribers"

### Manage Subscribers

#### Add Individual Subscribers

1. Go to Admin → Publications → [Your Publication] → Subscribers
2. Click "Add Subscriber"
3. Enter the email address
4. Click "Add Subscriber" - they'll be automatically activated

### Import Subscribers

1. Go to Admin → Publications → [Your Publication] → Subscribers
2. Click "Import CSV"
3. Upload a CSV with at least an `email` column
4. Imported subscribers are automatically set to "active" status

### Export Subscribers

1. Go to Admin → Publications → [Your Publication] → Subscribers
2. Click "Export CSV"
3. Download the CSV file with all subscriber data

### Create and Manage Publication Lists

Publication lists allow you to segment your subscribers into groups:

1. Go to Admin → Publications → [Your Publication] → Manage Lists
2. Click "Create List"
3. Enter a name and optional description
4. Use the list to:
   - Organize subscribers by interest, engagement, or topic
   - Send targeted campaigns to specific segments (future feature)

### Use Newsletter Templates

Templates help you create consistent newsletters faster:

1. When creating a new issue, select a template from the dropdown
2. The issue will be pre-populated with content blocks from the template
3. Edit the blocks as needed

**Available Default Templates:**
- **Basic Newsletter**: Simple text and story blocks
- **Promo Newsletter**: Promotional content with call-to-action
- **Multi-Story Newsletter**: Multiple story blocks for roundups

### Customize Colors and Fonts

The platform uses CSS variables for easy customization. See `src/app/customization.css` for:
- Font size adjustments
- Color scheme options (blue, green, purple, orange themes)
- Typography customization
- Spacing and layout controls
- Component styling overrides

**Quick Example:**
```css
:root {
  --color-accent: #2563eb;  /* Change to blue theme */
  --font-size-base: 18px;   /* Increase base font size */
}
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables from `.env.local`
4. Update `NEXT_PUBLIC_APP_URL` to your production domain
5. Deploy!

### Update Resend Webhook

After deployment, update your Resend webhook URL:

1. Go to Resend Dashboard → Webhooks
2. Edit your webhook
3. Update URL to: `https://your-domain.com/api/webhooks/resend`
4. Save

## Configuration

### Rate Limiting

Adjust in `.env.local`:

```env
RATE_LIMIT_SUBSCRIBE_PER_HOUR=5      # Subscriptions per email per hour
RATE_LIMIT_SEND_TEST_PER_HOUR=10     # Test sends per user per hour
```

### Email Sending

```env
EMAIL_BATCH_SIZE=100          # Emails per batch
EMAIL_BATCH_DELAY_MS=1000     # Delay between batches (ms)
```

## Troubleshooting

### "No publications found"

Run the seed SQL to create the sample publication, or create a new one in the admin.

### "Unauthorized" errors

Make sure you've added yourself as a publication admin in Supabase:

```sql
INSERT INTO publication_admins (publication_id, user_id, role)
SELECT 'PUBLICATION_ID', id, 'admin'
FROM auth.users WHERE email = 'your-email@example.com';
```

### Emails not sending

1. Check that `RESEND_API_KEY` is set correctly
2. Verify your domain is verified in Resend
3. Check the console for error logs

### Images not uploading

1. Verify ImageKit credentials in `.env.local`
2. Check that your ImageKit account is active
3. Ensure the API keys have upload permissions

## Production Considerations

### Background Jobs

The current campaign sending happens in-process. For large subscriber lists, consider:

- Supabase Edge Functions
- Vercel Cron Jobs
- External job queue (BullMQ, etc.)

### Monitoring

Set up monitoring for:

- Email delivery rates
- API errors
- Database performance
- Webhook failures

### Backups

Enable automated backups in Supabase:

1. Go to Project Settings → Database
2. Enable Point-in-Time Recovery (PITR)

## Contributing

This is a personal project, but suggestions and bug reports are welcome!

## License

MIT License - feel free to use this for your own newsletters!

## Support

For issues or questions:
- Open a GitHub issue
- Check the code comments for implementation details
- Review the SQL schema for database structure

---

Built with ❤️ using the Chomp design system
