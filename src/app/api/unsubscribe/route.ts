import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createLogger, logSubscriberEvent } from '@/lib/logger'

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
    const supabase = await createAdminClient()

    // Find subscriber by unsubscribe token
    const { data: subscriber, error: findError } = await supabase
      .from('subscribers')
      .select('*, publication:publications(*)')
      .eq('unsubscribe_token', token)
      .single()

    if (findError || !subscriber) {
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
    const { data: updated, error: updateError } = await supabase
      .from('subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to unsubscribe', updateError, {
        subscriberId: subscriber.id,
      })
      return NextResponse.redirect(
        new URL('/error?message=Failed to unsubscribe', request.url)
      )
    }

    await logSubscriberEvent(subscriber.id, 'unsubscribed', {
      publicationId: subscriber.publication_id,
    })

    logger.info('Subscriber unsubscribed successfully', {
      subscriberId: subscriber.id,
      email: subscriber.email,
    })

    // Redirect to publication page with success message
    return NextResponse.redirect(
      new URL(
        `/n/${subscriber.publication.slug}?message=unsubscribed`,
        request.url
      )
    )
  } catch (error) {
    logger.error('Unsubscribe endpoint error', error)
    return NextResponse.redirect(
      new URL('/error?message=An error occurred', request.url)
    )
  }
}
