import { NextRequest, NextResponse } from 'next/server'
import { createLogger, logSubscriberEvent } from '@/lib/logger'
import { getSubscriberByConfirmationToken, confirmSubscriber } from '@/lib/db/subscribers'

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
    try {
      const updated = await confirmSubscriber(token)

      await logSubscriberEvent(updated.id, 'confirmed', {
        publicationId: subscriber.publication_id,
      })

      logger.info('Subscriber confirmed successfully', {
        subscriberId: updated.id,
        email: subscriber.email,
      })

      // Redirect to publication page with success message
      return NextResponse.redirect(
        new URL(
          `/n/${subscriber.publication.slug}?message=confirmed`,
          request.url
        )
      )
    } catch (confirmError: any) {
      logger.error('Failed to confirm subscriber', confirmError, {
        subscriberId: subscriber.id,
      })
      return NextResponse.redirect(
        new URL('/error?message=Failed to confirm subscription', request.url)
      )
    }
  } catch (error) {
    logger.error('Confirmation endpoint error', error)
    return NextResponse.redirect(
      new URL('/error?message=An error occurred', request.url)
    )
  }
}
