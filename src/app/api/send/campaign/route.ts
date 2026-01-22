import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAuthApi } from '@/lib/auth'
import { createLogger } from '@/lib/logger'
import { resend, EMAIL_CONFIG } from '@/lib/resend'
import { getRenderModelFromDb, shortenRenderModelUrls } from '@/lib/render-model'
import { render } from '@react-email/render'
import NewsletterEmail from '@/emails/newsletter-template'
import { getIssueById } from '@/lib/db/issues'
import { z } from 'zod'

const sendCampaignSchema = z.object({
  issueId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const logger = createLogger()

  try {
    // Require authentication
    const user = await requireAuthApi()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    logger.withContext({ userId: user.id })

    // Parse and validate request
    const body = await request.json()
    const { issueId } = sendCampaignSchema.parse(body)

    logger.info('Campaign send requested', { issueId })

    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // Get issue and verify user has access
    const issue = await getIssueById(issueId)

    if (!issue) {
      logger.error('Issue not found', { issueId })
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('publication_admins')
      .select('id')
      .eq('publication_id', issue.publication_id)
      .eq('user_id', user.id)
      .single()

    if (!adminCheck) {
      logger.warn('Unauthorized campaign send attempt', {
        userId: user.id,
        issueId,
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get active subscribers
    const { data: subscribers, error: subError } = await adminSupabase
      .from('subscribers')
      .select('*')
      .eq('publication_id', issue.publication_id)
      .eq('status', 'active')

    if (subError || !subscribers || subscribers.length === 0) {
      logger.warn('No active subscribers found', {
        publicationId: issue.publication_id,
      })
      return NextResponse.json(
        { error: 'No active subscribers to send to' },
        { status: 400 }
      )
    }

    // Create send job
    const { data: sendJob, error: jobError } = await adminSupabase
      .from('send_jobs')
      .insert({
        publication_id: issue.publication_id,
        issue_id: issueId,
        status: 'pending',
        total_recipients: subscribers.length,
      })
      .select()
      .single()

    if (jobError || !sendJob) {
      logger.error('Failed to create send job', jobError)
      return NextResponse.json(
        { error: 'Failed to create send job' },
        { status: 500 }
      )
    }

    logger.info('Send job created', {
      jobId: sendJob.id,
      recipientCount: subscribers.length,
    })

    // Process send job asynchronously (in background)
    // In production, this should be handled by a job queue (Supabase Edge Functions, BullMQ, etc.)
    processSendJob(sendJob.id, issueId, subscribers).catch((error) => {
      logger.error('Background send job failed', error, { jobId: sendJob.id })
    })

    return NextResponse.json({
      success: true,
      message: `Campaign send started for ${subscribers.length} subscribers`,
      jobId: sendJob.id,
      recipientCount: subscribers.length,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    logger.error('Campaign send endpoint error', error)
    return NextResponse.json(
      { error: 'An error occurred while starting campaign' },
      { status: 500 }
    )
  }
}

/**
 * Process send job in batches
 * NOTE: In production, this should be moved to a background job processor
 * (Supabase Edge Function, Vercel Cron, or external job queue like BullMQ)
 */
async function processSendJob(
  jobId: string,
  issueId: string,
  subscribers: any[]
) {
  const logger = createLogger()
  const adminSupabase = await createAdminClient()

  try {
    // Update job status
    await adminSupabase
      .from('send_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    logger.info('Processing send job', { jobId, recipientCount: subscribers.length })

    // Get render model (once for all emails)
    let renderModel = await getRenderModelFromDb(adminSupabase, issueId, {
      baseUrl: process.env.NEXT_PUBLIC_APP_URL,
    })

    if (!renderModel) {
      throw new Error('Failed to build render model')
    }

    // Shorten all content URLs (story links, promo links, image links, social links)
    renderModel = await shortenRenderModelUrls(renderModel)

    const { publication, issue } = renderModel

    let sentCount = 0
    let failedCount = 0

    // Process in batches
    const batchSize = EMAIL_CONFIG.batchSize
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      // Send batch concurrently
      const results = await Promise.allSettled(
        batch.map(async (subscriber) => {
          try {
            // Build subscriber-specific render model with unsubscribe token
            const subscriberRenderModel = {
              ...renderModel,
              urls: {
                ...renderModel.urls,
                unsubscribe: `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${subscriber.unsubscribe_token}`,
              },
            }

            // Render email HTML
            const emailHtml = await render(
              NewsletterEmail({ renderModel: subscriberRenderModel })
            )

            // Send email via Resend
            // Note: Disable click tracking in Resend dashboard to avoid double-wrapping URLs
            const { data, error } = await resend.emails.send({
              from: `${publication.fromName} <${publication.fromEmail}>`,
              to: subscriber.email,
              subject: issue.subject,
              html: emailHtml,
              headers: {
                'List-Unsubscribe': `<${subscriberRenderModel.urls.unsubscribe}>`,
              },
              tags: [], // Empty tags to help prevent automatic click tracking
            })

            if (error) {
              throw error
            }

            // Create send message record
            await adminSupabase.from('send_messages').insert({
              send_job_id: jobId,
              subscriber_id: subscriber.id,
              issue_id: issueId,
              resend_message_id: data?.id,
              status: 'sent',
              sent_at: new Date().toISOString(),
            })

            return { success: true, subscriberId: subscriber.id }
          } catch (error: any) {
            // Log failed send
            await adminSupabase.from('send_messages').insert({
              send_job_id: jobId,
              subscriber_id: subscriber.id,
              issue_id: issueId,
              status: 'failed',
              error_message: error.message || 'Unknown error',
            })

            logger.error('Failed to send to subscriber', error, {
              subscriberId: subscriber.id,
              email: subscriber.email,
            })

            return { success: false, subscriberId: subscriber.id, error }
          }
        })
      )

      // Count results
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          sentCount++
        } else {
          failedCount++
        }
      })

      // Update job progress
      await adminSupabase
        .from('send_jobs')
        .update({
          sent_count: sentCount,
          failed_count: failedCount,
        })
        .eq('id', jobId)

      logger.info('Batch processed', {
        jobId,
        batchIndex: i / batchSize,
        sentCount,
        failedCount,
      })

      // Delay between batches to avoid rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, EMAIL_CONFIG.batchDelayMs)
        )
      }
    }

    // Mark job as completed
    await adminSupabase
      .from('send_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        sent_count: sentCount,
        failed_count: failedCount,
      })
      .eq('id', jobId)

    // Update issue status and stats
    await adminSupabase
      .from('issues')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        send_count: sentCount,
      })
      .eq('id', issueId)

    logger.info('Send job completed', {
      jobId,
      sentCount,
      failedCount,
      totalRecipients: subscribers.length,
    })
  } catch (error) {
    logger.error('Send job processing failed', error, { jobId })

    // Mark job as failed
    await adminSupabase
      .from('send_jobs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)
  }
}
