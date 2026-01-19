import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createLogger, logSubscriberEvent } from '@/lib/logger'
import { getSubscriberByConfirmationToken } from '@/lib/db/subscribers'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  const logger = createLogger()

  if (!token) {
    logger.warn('Confirmation attempted without token')
    return NextResponse.redirect(
      new URL('/error?message=Invalid confirmation link', request.url)
    )
  }

  try {
    // Find subscriber by confirmation token
    const subscriber = await getSubscriberByConfirmationToken(token)

    if (!subscriber) {
      logger.warn('Invalid confirmation token', { token })
      return NextResponse.redirect(
        new URL(
          '/error?message=Invalid or expired confirmation link',
          request.url
        )
      )
    }

    // Check if already confirmed
    if (subscriber.status === 'active') {
      logger.info('Subscriber already confirmed', {
        subscriberId: subscriber.id,
      })
      return NextResponse.redirect(
        new URL(
          `/n/${subscriber.publication.slug}?message=already_subscribed`,
          request.url
        )
      )
    }

    // Confirm subscriber
    const supabase = await createAdminClient()
    const { data: updated, error: updateError } = await supabase
      .from('subscribers')
      .update({
        status: 'active',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id)
      .select()
      .single()

    if (updateError || !updated) {
      logger.error('Failed to confirm subscriber', updateError, {
        subscriberId: subscriber.id,
      })
      return NextResponse.redirect(
        new URL('/error?message=Failed to confirm subscription', request.url)
      )
    }

    await logSubscriberEvent(subscriber.id, 'confirmed', {
      publicationId: subscriber.publication_id,
    })

    logger.info('Subscriber confirmed successfully', {
      subscriberId: subscriber.id,
      email: subscriber.email,
    })

    // Redirect to publication page with success message
    return NextResponse.redirect(
      new URL(
        `/n/${subscriber.publication.slug}?message=confirmed`,
        request.url
      )
    )
  } catch (error) {
    logger.error('Confirmation endpoint error', error)
    return NextResponse.redirect(
      new URL('/error?message=An error occurred', request.url)
    )
  }
}
