import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createLogger, logWebhookEvent } from '@/lib/logger'
import { verifyWebhookSignature } from '@/lib/resend'

export async function POST(request: NextRequest) {
  const logger = createLogger()

  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('resend-signature') || ''

    // Verify webhook signature
    const secret = process.env.RESEND_WEBHOOK_SECRET
    if (secret && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, secret)
      if (!isValid) {
        logger.warn('Invalid webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody)
    const { type, data } = payload

    logger.info('Webhook received', { type, eventId: data.email_id })

    await logWebhookEvent(type, data)

    const supabase = await createAdminClient()

    // Find the send message by Resend message ID
    const { data: sendMessage } = await supabase
      .from('send_messages')
      .select('*, subscriber:subscribers(*)')
      .eq('resend_message_id', data.email_id)
      .single()

    if (!sendMessage) {
      logger.warn('Send message not found for email', {
        emailId: data.email_id,
      })
      // Still return 200 to avoid retries
      return NextResponse.json({ received: true })
    }

    // Handle different webhook types
    switch (type) {
      case 'email.sent':
        await handleEmailSent(supabase, sendMessage, data, logger)
        break

      case 'email.delivered':
        await handleEmailDelivered(supabase, sendMessage, data, logger)
        break

      case 'email.opened':
        await handleEmailOpened(supabase, sendMessage, data, logger)
        break

      case 'email.clicked':
        await handleEmailClicked(supabase, sendMessage, data, logger)
        break

      case 'email.bounced':
        await handleEmailBounced(supabase, sendMessage, data, logger)
        break

      case 'email.complained':
        await handleEmailComplained(supabase, sendMessage, data, logger)
        break

      case 'email.delivery_delayed':
        logger.info('Email delivery delayed', { emailId: data.email_id })
        break

      default:
        logger.warn('Unknown webhook type', { type })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Webhook handler error', error)
    // Return 200 to avoid retries for parsing errors
    return NextResponse.json({ received: true, error: 'Processing failed' })
  }
}

async function handleEmailSent(
  supabase: any,
  sendMessage: any,
  data: any,
  logger: any
) {
  await supabase
    .from('send_messages')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', sendMessage.id)

  logger.info('Email marked as sent', { messageId: sendMessage.id })
}

async function handleEmailDelivered(
  supabase: any,
  sendMessage: any,
  data: any,
  logger: any
) {
  await supabase
    .from('send_messages')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    })
    .eq('id', sendMessage.id)

  logger.info('Email marked as delivered', { messageId: sendMessage.id })
}

async function handleEmailOpened(
  supabase: any,
  sendMessage: any,
  data: any,
  logger: any
) {
  // Update send message if not already marked as opened
  if (!sendMessage.opened_at) {
    await supabase
      .from('send_messages')
      .update({
        opened_at: new Date().toISOString(),
      })
      .eq('id', sendMessage.id)

    // Increment issue open count
    await supabase.rpc('increment', {
      table_name: 'issues',
      row_id: sendMessage.issue_id,
      column_name: 'open_count',
    })
  }

  logger.info('Email opened', { messageId: sendMessage.id })
}

async function handleEmailClicked(
  supabase: any,
  sendMessage: any,
  data: any,
  logger: any
) {
  // Update send message if not already marked as clicked
  if (!sendMessage.clicked_at) {
    await supabase
      .from('send_messages')
      .update({
        clicked_at: new Date().toISOString(),
      })
      .eq('id', sendMessage.id)

    // Increment issue click count
    await supabase.rpc('increment', {
      table_name: 'issues',
      row_id: sendMessage.issue_id,
      column_name: 'click_count',
    })
  }

  logger.info('Email clicked', { messageId: sendMessage.id })
}

async function handleEmailBounced(
  supabase: any,
  sendMessage: any,
  data: any,
  logger: any
) {
  // Update send message
  await supabase
    .from('send_messages')
    .update({
      status: 'bounced',
      error_message: data.reason || 'Email bounced',
    })
    .eq('id', sendMessage.id)

  // Update subscriber status
  if (sendMessage.subscriber) {
    await supabase
      .from('subscribers')
      .update({
        status: 'bounced',
        bounced_at: new Date().toISOString(),
      })
      .eq('id', sendMessage.subscriber_id)

    const { logSubscriberEvent } = await import('@/lib/logger')
    await logSubscriberEvent(sendMessage.subscriber_id, 'bounced', {
      publicationId: sendMessage.subscriber.publication_id,
    })
  }

  logger.info('Email bounced', {
    messageId: sendMessage.id,
    subscriberId: sendMessage.subscriber_id,
  })
}

async function handleEmailComplained(
  supabase: any,
  sendMessage: any,
  data: any,
  logger: any
) {
  // Update send message
  await supabase
    .from('send_messages')
    .update({
      status: 'complained',
    })
    .eq('id', sendMessage.id)

  // Update subscriber status
  if (sendMessage.subscriber) {
    await supabase
      .from('subscribers')
      .update({
        status: 'complained',
        complained_at: new Date().toISOString(),
      })
      .eq('id', sendMessage.subscriber_id)

    const { logSubscriberEvent } = await import('@/lib/logger')
    await logSubscriberEvent(sendMessage.subscriber_id, 'complained', {
      publicationId: sendMessage.subscriber.publication_id,
    })
  }

  logger.info('Spam complaint received', {
    messageId: sendMessage.id,
    subscriberId: sendMessage.subscriber_id,
  })
}
