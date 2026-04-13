'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MIN_PAYOUT_INR } from '@/lib/constants/coins'

export type EarningsResult<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Get practitioner's earnings summary per D-20
 * Shows money (INR), never coins or commission per D-13
 */
export async function getEarningsSummary(): Promise<EarningsResult<{
  availableBalance: number // INR, ready for payout
  pendingEarnings: number // INR, from pending bookings
  totalEarned: number // All time net earnings
  canRequestPayout: boolean
  minPayoutAmount: number
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get practitioner
  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!practitioner) {
    return { success: false, error: 'Practitioner not found' }
  }

  // Get all earnings
  const { data: earnings, error } = await supabase
    .from('practitioner_earnings')
    .select('net_amount_inr, status')
    .eq('practitioner_id', practitioner.id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Calculate balances
  const allEarnings = earnings || []
  const availableBalance = allEarnings
    .filter(e => e.status === 'available')
    .reduce((sum, e) => sum + e.net_amount_inr, 0)

  const pendingEarnings = allEarnings
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.net_amount_inr, 0)

  const totalEarned = allEarnings
    .filter(e => e.status !== 'pending') // Exclude pending (not yet completed sessions)
    .reduce((sum, e) => sum + e.net_amount_inr, 0)

  return {
    success: true,
    data: {
      availableBalance,
      pendingEarnings,
      totalEarned,
      canRequestPayout: availableBalance >= MIN_PAYOUT_INR,
      minPayoutAmount: MIN_PAYOUT_INR,
    },
  }
}

/**
 * Get earnings transaction history per D-20
 * Shows net amount per session (what practitioner earns, NOT coins or commission)
 */
export async function getEarningsHistory(): Promise<EarningsResult<{
  transactions: Array<{
    id: string
    amount_inr: number // Net amount earned
    status: string
    session_duration: number
    session_date: string
    created_at: string
  }>
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!practitioner) {
    return { success: false, error: 'Practitioner not found' }
  }

  // Get earnings with booking details
  const { data: earnings, error } = await supabase
    .from('practitioner_earnings')
    .select(`
      id,
      net_amount_inr,
      status,
      created_at,
      bookings (
        session_duration,
        scheduled_at
      )
    `)
    .eq('practitioner_id', practitioner.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return { success: false, error: error.message }
  }

  const transactions = (earnings || []).map(e => ({
    id: e.id,
    amount_inr: e.net_amount_inr,
    status: e.status,
    session_duration: (e.bookings as { session_duration: number }).session_duration,
    session_date: (e.bookings as { scheduled_at: string }).scheduled_at,
    created_at: e.created_at,
  }))

  return { success: true, data: { transactions } }
}

/**
 * Get monthly earnings for trend chart per D-20
 */
export async function getMonthlyEarnings(): Promise<EarningsResult<{
  monthly: Array<{
    month: string // YYYY-MM
    total_inr: number
  }>
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!practitioner) {
    return { success: false, error: 'Practitioner not found' }
  }

  // Get last 6 months of earnings
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: earnings, error } = await supabase
    .from('practitioner_earnings')
    .select('net_amount_inr, created_at')
    .eq('practitioner_id', practitioner.id)
    .gte('created_at', sixMonthsAgo.toISOString())
    .neq('status', 'pending')

  if (error) {
    return { success: false, error: error.message }
  }

  // Group by month
  const monthlyMap = new Map<string, number>()
  ;(earnings || []).forEach(e => {
    const month = e.created_at.slice(0, 7) // YYYY-MM
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + e.net_amount_inr)
  })

  // Fill in missing months with 0
  const monthly: Array<{ month: string; total_inr: number }> = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const month = d.toISOString().slice(0, 7)
    monthly.push({
      month,
      total_inr: monthlyMap.get(month) || 0,
    })
  }

  return { success: true, data: { monthly } }
}

/**
 * Request payout per D-19
 */
export async function requestPayout(bankDetails: {
  accountName: string
  accountNumber: string
  ifscCode: string
  bankName: string
}): Promise<EarningsResult<{ requestId: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!practitioner) {
    return { success: false, error: 'Practitioner not found' }
  }

  // Check available balance
  const summaryResult = await getEarningsSummary()
  if (!summaryResult.success || !summaryResult.data) {
    return { success: false, error: 'Failed to check balance' }
  }

  if (!summaryResult.data.canRequestPayout) {
    return {
      success: false,
      error: `Minimum payout amount is Rs ${MIN_PAYOUT_INR.toLocaleString('en-IN')}. Your available balance is Rs ${summaryResult.data.availableBalance.toLocaleString('en-IN')}.`,
    }
  }

  // Check for pending payout requests
  const { data: existingRequest } = await supabase
    .from('payout_requests')
    .select('id')
    .eq('practitioner_id', practitioner.id)
    .eq('status', 'pending')
    .single()

  if (existingRequest) {
    return { success: false, error: 'You already have a pending payout request' }
  }

  // Create payout request
  const { data: request, error } = await supabase
    .from('payout_requests')
    .insert({
      practitioner_id: practitioner.id,
      amount_inr: summaryResult.data.availableBalance,
      status: 'pending',
      bank_details: bankDetails,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Mark earnings as requested
  await supabase
    .from('practitioner_earnings')
    .update({ status: 'requested' })
    .eq('practitioner_id', practitioner.id)
    .eq('status', 'available')

  revalidatePath('/portal/earnings')

  return { success: true, data: { requestId: request.id } }
}

/**
 * Get payout request history
 */
export async function getPayoutHistory(): Promise<EarningsResult<{
  requests: Array<{
    id: string
    amount_inr: number
    status: string
    requested_at: string
    processed_at: string | null
  }>
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!practitioner) {
    return { success: false, error: 'Practitioner not found' }
  }

  const { data: requests, error } = await supabase
    .from('payout_requests')
    .select('id, amount_inr, status, requested_at, processed_at')
    .eq('practitioner_id', practitioner.id)
    .order('requested_at', { ascending: false })
    .limit(20)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: { requests: requests || [] } }
}
