import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { getCoinExpiryDate } from '@/lib/constants/coins'
import type { Database } from '@/types/database'

// Use service role for webhook (no user session)
// Per T-03-10: Immutable ledger with razorpay_payment_id logged
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature per T-03-09
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    // Handle payment.captured event per D-18
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id
      const paymentId = payment.id
      const notes = payment.notes || {}

      const coins = parseInt(notes.coins || '0', 10)
      const enterpriseId = notes.enterprise_id

      if (!coins || !enterpriseId) {
        console.error('Missing coins or enterprise_id in payment notes')
        return NextResponse.json({ error: 'Invalid payment notes' }, { status: 400 })
      }

      // Credit coins to enterprise wallet per D-12, D-16
      // Per T-03-11: Balance calculated from ledger, not stored as field
      // Per T-03-12: Idempotency via UNIQUE constraint on reference_id (race-condition safe)
      const { error: insertError } = await supabaseAdmin
        .from('coin_transactions')
        .insert({
          enterprise_id: enterpriseId,
          type: 'purchase',
          amount: coins, // Positive for purchase
          unit_price_inr: Math.round(payment.amount / 100 / coins), // Actual price paid per coin
          expires_at: getCoinExpiryDate().toISOString(),
          reference_id: paymentId, // UNIQUE constraint in DB prevents duplicates
          metadata: {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
          },
        })

      if (insertError) {
        // Check if it's a unique constraint violation (duplicate webhook delivery)
        if (insertError.code === '23505') { // PostgreSQL unique violation
          console.log('Payment already processed (concurrent webhook):', paymentId)
          return NextResponse.json({ received: true, duplicate: true })
        }
        console.error('Failed to credit coins:', insertError)
        return NextResponse.json({ error: 'Failed to credit coins' }, { status: 500 })
      }

      console.log(`Credited ${coins} coins to enterprise ${enterpriseId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
