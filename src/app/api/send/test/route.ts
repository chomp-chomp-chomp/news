import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { createLogger } from '@/lib/logger'
import { resend } from '@/lib/resend'
import { getRenderModelFromDb } from '@/lib/render-model'
import { render } from '@react-email/render'
import NewsletterEmail from '@/emails/newsletter-template'
import { z } from 'zod'

const sendTestSchema = z.object({
  issueId: z.string().uuid(),
  testEmail: z.string().email(),
})

export async function POST(request: NextRequest) {
  const logger = createLogger({
    ipAddress: getClientIp(request.headers),
    userAgent: request.headers.get('user-agent') || undefined,
  })

  try {
    // Require authentication
    const user = await requireAuth()
    logger.withContext({ userId: user.id })

    // Parse and validate request
    const body = await request.json()
    const { issueId, testEmail } = sendTestSchema.parse(body)

    logger.info('Test email send requested', { issueId, testEmail })

    // Rate limiting by user
    const rateLimitResult = await checkRateLimit({
      identifier: user.id,
      endpoint: '/api/send/test',
      maxRequests: RATE_LIMITS.sendTest.maxRequests,
      windowMs: RATE_LIMITS.sendTest.windowMs,
    })

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded for test sends', { userId: user.id })
      return NextResponse.json(
        { error: 'Too many test emails sent. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      )
    }

    const supabase = await createClient()

    // Get issue and verify user has access
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('*, publication:publications(*)')
      .eq('id', issueId)
      .single()

    if (issueError || !issue) {
      logger.error('Issue not found', { issueId })
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Check if user is admin of publication
    const { data: adminCheck } = await supabase
      .from('publication_admins')
      .select('id')
      .eq('publication_id', issue.publication_id)
      .eq('user_id', user.id)
      .single()

    if (!adminCheck) {
      logger.warn('Unauthorized test send attempt', {
        userId: user.id,
        issueId,
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Build render model
    const renderModel = await getRenderModelFromDb(supabase, issueId, {
      baseUrl: process.env.NEXT_PUBLIC_APP_URL,
    })

    if (!renderModel) {
      logger.error('Failed to build render model', { issueId })
      return NextResponse.json(
        { error: 'Failed to generate email' },
        { status: 500 }
      )
    }

    // Render email HTML
    const emailHtml = await render(NewsletterEmail({ renderModel }))

    // Send test email
    const { data, error } = await resend.emails.send({
      from: `${issue.publication.from_name} <${issue.publication.from_email}>`,
      to: testEmail,
      subject: `[TEST] ${issue.subject}`,
      html: emailHtml,
    })

    if (error) {
      logger.error('Failed to send test email', error, { issueId, testEmail })
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      )
    }

    logger.info('Test email sent successfully', {
      issueId,
      testEmail,
      messageId: data?.id,
    })

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}`,
      messageId: data?.id,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Test send endpoint error', error)
    return NextResponse.json(
      { error: 'An error occurred while sending test email' },
      { status: 500 }
    )
  }
}
