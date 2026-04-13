import Razorpay from 'razorpay'
import crypto from 'crypto'

// Lazy initialization to avoid build-time errors when env vars aren't set
let _razorpay: Razorpay | null = null

export function getRazorpay(): Razorpay {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Missing Razorpay credentials in environment variables')
    }
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return _razorpay
}

// Export default instance for convenience
export const razorpay = new Proxy({} as Razorpay, {
  get(_, prop) {
    return (getRazorpay() as Record<string, unknown>)[prop as string]
  },
})

/**
 * Verify Razorpay webhook signature (HMAC-SHA256)
 * Per T-03-09: HMAC signature verification with RAZORPAY_WEBHOOK_SECRET
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.error('RAZORPAY_WEBHOOK_SECRET not configured')
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    // Lengths don't match
    return false
  }
}

/**
 * Verify Razorpay payment signature (for client-side verification)
 */
export function verifyPaymentSignature(params: {
  order_id: string
  payment_id: string
  signature: string
}): boolean {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error('RAZORPAY_KEY_SECRET not configured')
    return false
  }

  const body = `${params.order_id}|${params.payment_id}`
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(params.signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}
