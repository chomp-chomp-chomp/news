import { NextRequest, NextResponse } from 'next/server'
import { createLogger, logSubscriberEvent } from '@/lib/logger'
import { getSubscriberByUnsubscribeToken, unsubscribeSubscriber } from '@/lib/db/subscribers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  const logger = createLogger()

  if (!token) {
    logger.warn('Unsubscribe attempted without token')
    return NextResponse.redirect(
      new URL('/error?message=Invalid unsubscribe link', request.url)
    )
  }

  try {
    // Find subscriber by unsubscribe token
    const subscriber = await getSubscriberByUnsubscribeToken(token)

    if (!subscriber) {
      logger.warn('Invalid unsubscribe token', { token })
      return NextResponse.redirect(
        new URL('/error?message=Invalid unsubscribe link', request.url)
      )
    }

    // Check if already unsubscribed
    if (subscriber.status === 'unsubscribed') {
      logger.info('Subscriber already unsubscribed', {
        subscriberId: subscriber.id,
      })
      return NextResponse.redirect(
        new URL(
          `/n/${subscriber.publication.slug}?message=already_unsubscribed`,
          request.url
        )
      )
    }

    // Unsubscribe
    try {
      const updated = await unsubscribeSubscriber(token)

      await logSubscriberEvent(updated.id, 'unsubscribed', {
        publicationId: subscriber.publication_id,
      })

      logger.info('Subscriber unsubscribed successfully', {
        subscriberId: updated.id,
        email: subscriber.email,
      })

      // Redirect to publication page with success message
      return NextResponse.redirect(
        new URL(
          `/n/${subscriber.publication.slug}?message=unsubscribed`,
          request.url
        )
      )
    } catch (unsubError: any) {
      logger.error('Failed to unsubscribe', unsubError, {
        subscriberId: subscriber.id,
      })
      return NextResponse.redirect(
        new URL('/error?message=Failed to unsubscribe', request.url)
      )
    }
  } catch (error) {
    logger.error('Unsubscribe endpoint error', error)
    return NextResponse.redirect(
      new URL('/error?message=An error occurred', request.url)
    )
  }
}
