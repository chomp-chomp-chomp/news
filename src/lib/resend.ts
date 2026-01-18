import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

// Email sending configuration
export const EMAIL_CONFIG = {
  batchSize: parseInt(process.env.EMAIL_BATCH_SIZE || '100'),
  batchDelayMs: parseInt(process.env.EMAIL_BATCH_DELAY_MS || '1000'),
}

// Verify webhook signature from Resend
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto')
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const digest = hmac.digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}
