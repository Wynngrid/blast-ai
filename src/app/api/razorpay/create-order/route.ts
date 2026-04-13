import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRazorpay } from '@/lib/razorpay'
import { calculateDiscountedPrice, MIN_COIN_PURCHASE } from '@/lib/constants/coins'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get enterprise ID
    const { data: enterprise } = await supabase
      .from('enterprises')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!enterprise) {
      return NextResponse.json({ error: 'Enterprise not found' }, { status: 404 })
    }

    const { coins } = await req.json()

    // Validate coin amount per D-17
    if (!coins || typeof coins !== 'number' || coins < MIN_COIN_PURCHASE) {
      return NextResponse.json(
        { error: `Minimum purchase is ${MIN_COIN_PURCHASE} coins` },
        { status: 400 }
      )
    }

    // Calculate price with tier discount per D-15
    const { finalPrice } = calculateDiscountedPrice(coins, 'INR')

    // Create Razorpay order
    const razorpay = getRazorpay()
    const order = await razorpay.orders.create({
      amount: finalPrice * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: `coins_${enterprise.id}_${Date.now()}`,
      notes: {
        coins: coins.toString(),
        enterprise_id: enterprise.id,
        user_email: user.email || '',
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      coins,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
