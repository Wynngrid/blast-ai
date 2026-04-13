'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  COIN_VALUE_INR,
  MIN_COIN_PURCHASE,
  calculateDiscountedPrice,
} from '@/lib/constants/coins'

export type CoinResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Get enterprise's available coin balance with FIFO expiry awareness
 * Per D-12, D-16
 * Per T-03-11: Balance calculated server-side from ledger, not stored as field
 */
export async function getAvailableBalance(): Promise<CoinResult<{
  total: number
  expiringSoon: number // Within 30 days
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get enterprise ID
  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!enterprise) {
    return { success: false, error: 'Enterprise not found' }
  }

  // Get all transactions for this enterprise
  const { data: transactions, error } = await supabase
    .from('coin_transactions')
    .select('*')
    .eq('enterprise_id', enterprise.id)
    .order('created_at', { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  // Calculate balance: sum of all amounts (positive for purchase/refund, negative for spend/expire)
  const total = (transactions || []).reduce((sum, t) => sum + t.amount, 0)

  // Calculate expiring soon (purchases with expires_at within 30 days)
  // Using FIFO tracking to determine which coins are still remaining
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  // Track remaining coins from each purchase using FIFO
  const purchases = (transactions || [])
    .filter(t => t.type === 'purchase' && t.expires_at)
    .map(t => ({
      amount: t.amount,
      expiresAt: new Date(t.expires_at!),
      remaining: t.amount,
    }))

  // Apply spend/expire transactions to purchases in FIFO order
  let totalSpent = (transactions || [])
    .filter(t => t.type === 'spend' || t.type === 'expire')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  for (const purchase of purchases) {
    if (totalSpent <= 0) break
    const deduct = Math.min(purchase.remaining, totalSpent)
    purchase.remaining -= deduct
    totalSpent -= deduct
  }

  // Sum remaining coins expiring within 30 days
  const expiringSoon = purchases
    .filter(p => p.expiresAt <= thirtyDaysFromNow && p.remaining > 0)
    .reduce((sum, p) => sum + p.remaining, 0)

  return {
    success: true,
    data: { total: Math.max(0, total), expiringSoon },
  }
}

/**
 * Spend coins for a booking
 * Per D-12, D-13 (enterprise sees coins)
 */
export async function spendCoins(
  bookingId: string,
  coinsRequired: number
): Promise<CoinResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!enterprise) {
    return { success: false, error: 'Enterprise not found' }
  }

  // Check available balance
  const balanceResult = await getAvailableBalance()
  if (!balanceResult.success || !balanceResult.data) {
    return { success: false, error: balanceResult.error || 'Failed to check balance' }
  }

  if (balanceResult.data.total < coinsRequired) {
    return {
      success: false,
      error: `Insufficient coins. Need ${coinsRequired}, have ${balanceResult.data.total}`,
    }
  }

  // Insert spend transaction (negative amount)
  const { error } = await supabase
    .from('coin_transactions')
    .insert({
      enterprise_id: enterprise.id,
      type: 'spend',
      amount: -coinsRequired, // Negative for spend
      reference_id: bookingId,
      metadata: { booking_id: bookingId },
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/coins')
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Get coin transaction history for enterprise
 */
export async function getCoinHistory(): Promise<CoinResult<{
  transactions: Array<{
    id: string
    type: string
    amount: number
    created_at: string
    reference_id: string | null
  }>
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!enterprise) {
    return { success: false, error: 'Enterprise not found' }
  }

  const { data: transactions, error } = await supabase
    .from('coin_transactions')
    .select('id, type, amount, created_at, reference_id')
    .eq('enterprise_id', enterprise.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: { transactions: transactions || [] } }
}

/**
 * Get coin purchase tier info (for display)
 */
export async function getCoinPurchaseInfo(coins: number): Promise<CoinResult<{
  coins: number
  basePrice: number
  discount: number
  finalPrice: number
  tierLabel: string
  isValid: boolean
}>> {
  if (coins < MIN_COIN_PURCHASE) {
    return {
      success: true,
      data: {
        coins,
        basePrice: 0,
        discount: 0,
        finalPrice: 0,
        tierLabel: '',
        isValid: false,
      },
    }
  }

  const pricing = calculateDiscountedPrice(coins, 'INR')

  return {
    success: true,
    data: {
      coins,
      basePrice: pricing.basePrice,
      discount: pricing.discount,
      finalPrice: pricing.finalPrice,
      tierLabel: pricing.tier.label,
      isValid: true,
    },
  }
}

/**
 * Credit coins directly (for admin use or refunds)
 * This is an internal function, not exposed to users
 */
export async function creditCoins(
  enterpriseId: string,
  coins: number,
  referenceId: string,
  metadata: Record<string, unknown> = {}
): Promise<CoinResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user has admin role (this would check the profile)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('coin_transactions')
    .insert({
      enterprise_id: enterpriseId,
      type: 'refund',
      amount: coins, // Positive for refund/credit
      reference_id: referenceId,
      metadata,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/coins')
  return { success: true }
}
