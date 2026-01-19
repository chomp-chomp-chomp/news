import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { createLogger, logSubscriberEvent } from '@/lib/logger'
import { resend } from '@/lib/resend'
import { reactivateSubscriber } from '@/lib/db/subscribers'
import { Database } from '@/types/database'
import { z } from 'zod'

type Subscriber = Database['public']['Tables']['subscribers']['Row']
type Publication = Database['public']['Tables']['publications']['Row']

const subscribeSchema = z.object({
  publicationId: z.string().uuid(),
  email: z.string().email().min(3).max(255).refine(
    (email) => {
      // More comprehensive email validation
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      return emailRegex.test(email)
    },
    { message: 'Invalid email format' }
  ),
})

export async function POST(request: NextRequest) {
  const logger = createLogger({
    ipAddress: getClientIp(request.headers),
    userAgent: request.headers.get('user-agent') || undefined,
  })

  try {
    // Parse and validate request body
    const body = await request.json()
    const { publicationId, email } = subscribeSchema.parse(body)

    logger.info('Subscribe request received', { publicationId, email })

    // Rate limiting by email
    const rateLimitResult = await checkRateLimit({
      identifier: email.toLowerCase(),
      endpoint: '/api/subscribe',
      maxRequests: RATE_LIMITS.subscribe.maxRequests,
      windowMs: RATE_LIMITS.subscribe.windowMs,
    })

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded', { email })
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      )
    }

    const supabase = await createAdminClient()

    // Get publication
    const { data: publication, error: pubError } = await supabase
      .from('publications')
      .select('*')
      .eq('id', publicationId)
      .is('deleted_at', null)
      .single()

    if (pubError || !publication) {
      logger.error('Publication not found', { publicationId })
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      )
    }

    // Check if subscriber already exists
    const normalizedEmail = email.toLowerCase().trim()
    const { data: existing } = await supabase
      .from('subscribers')
      .select('*')
      .eq('publication_id', publicationId)
      .eq('email', normalizedEmail)
      .single()

    if (existing) {
      if (existing.status === 'active') {
        logger.info('Subscriber already active', { email })
        return NextResponse.json({
          message: 'You are already subscribed!',
          status: 'already_subscribed',
        })
      }

      if (existing.status === 'pending') {
        // Resend confirmation email
        logger.info('Resending confirmation email', { email })
        await sendConfirmationEmail(
          existing,
          publication,
          request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || ''
        )

        return NextResponse.json({
          message: 'Confirmation email resent! Check your inbox.',
          status: 'confirmation_resent',
        })
      }

      if (existing.status === 'unsubscribed') {
        // Reactivate subscription with new confirmation
        try {
          const updated = await reactivateSubscriber(existing.id)

          await sendConfirmationEmail(
            updated,
            publication,
            request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || ''
          )
          await logSubscriberEvent(updated.id, 'subscribed', {
            publicationId: publication.id,
          })

          return NextResponse.json({
            message: 'Welcome back! Please confirm your subscription.',
            status: 'resubscribed',
          })
        } catch (reactivateError: any) {
          logger.error('Failed to reactivate subscriber', reactivateError, { email })
          return NextResponse.json(
            { error: 'Failed to resubscribe. Please try again.' },
            { status: 500 }
          )
        }
      }
    }

    // Create new subscriber
    const { data: subscriber, error: subError } = await supabase
      .from('subscribers')
      .insert({
        publication_id: publicationId,
        email: normalizedEmail,
        status: 'pending',
      })
      .select()
      .single()

    if (subError || !subscriber) {
      logger.error('Failed to create subscriber', subError, { email })
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    // Send confirmation email
    await sendConfirmationEmail(
      subscriber,
      publication,
      request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || ''
    )

    await logSubscriberEvent(subscriber.id, 'subscribed', {
      publicationId: publication.id,
    })

    logger.info('Subscriber created successfully', {
      subscriberId: subscriber.id,
      email,
    })

    return NextResponse.json({
      message: 'Success! Check your email to confirm your subscription.',
      status: 'confirmation_sent',
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    logger.error('Subscribe endpoint error', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

async function sendConfirmationEmail(
  subscriber: Subscriber,
  publication: Publication,
  baseUrl: string
) {
  const confirmUrl = `${baseUrl}/api/confirm?token=${subscriber.confirmation_token}`

  await resend.emails.send({
    from: `${publication.from_name} <${publication.from_email}>`,
    to: subscriber.email,
    subject: `Confirm your subscription to ${publication.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #353535; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #e73b42;
              color: #ffffff;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 500;
            }
            .footer { color: #7d7d7d; font-size: 14px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to ${publication.name}!</h1>
            <p>Thanks for subscribing! Please confirm your email address to start receiving our newsletter.</p>
            <p style="margin: 30px 0;">
              <a href="${confirmUrl}" class="button">Confirm Subscription</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #7d7d7d;">${confirmUrl}</p>
            <div class="footer">
              <p>If you didn't request this subscription, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}
