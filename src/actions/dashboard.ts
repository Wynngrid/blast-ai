'use server'

import { createClient } from '@/lib/supabase/server'
import { type OutcomeTag } from '@/types/database'

export interface DashboardStats {
  sessionsCompleted: number
  upcomingSessions: number
  coinBalance: number
  totalCoinsSpent: number
  totalCoinsPurchased: number
  outcomeBreakdown: {
    skill_learned: number
    blocker_resolved: number
    need_followup: number
    not_helpful: number
  }
  positiveOutcomeRate: number
}

export async function getDashboardStats(): Promise<{ stats: DashboardStats | null; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { stats: null, error: 'Not authenticated' }
  }

  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!enterprise) {
    return { stats: null, error: 'Enterprise not found' }
  }

  // Sessions completed
  const { count: sessionsCompleted } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('enterprise_id', enterprise.id)
    .eq('status', 'completed')

  // Upcoming sessions
  const { count: upcomingSessions } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('enterprise_id', enterprise.id)
    .eq('status', 'confirmed')
    .gte('scheduled_at', new Date().toISOString())

  // Coin transactions
  const { data: transactions } = await supabase
    .from('coin_transactions')
    .select('type, amount')
    .eq('enterprise_id', enterprise.id)

  let coinBalance = 0
  let totalCoinsPurchased = 0
  let totalCoinsSpent = 0

  ;(transactions || []).forEach((t) => {
    if (t.type === 'purchase') {
      coinBalance += t.amount
      totalCoinsPurchased += t.amount
    } else if (t.type === 'spend') {
      coinBalance -= Math.abs(t.amount)
      totalCoinsSpent += Math.abs(t.amount)
    } else if (t.type === 'refund') {
      coinBalance += t.amount
      totalCoinsSpent -= t.amount
    } else if (t.type === 'expire') {
      coinBalance -= Math.abs(t.amount)
    }
  })

  // Outcome breakdown per D-05
  const { data: outcomes } = await supabase
    .from('session_outcomes')
    .select('outcome_tags')
    .eq('enterprise_id', enterprise.id)

  const outcomeBreakdown = {
    skill_learned: 0,
    blocker_resolved: 0,
    need_followup: 0,
    not_helpful: 0,
  }

  let totalOutcomes = 0
  ;(outcomes || []).forEach((o) => {
    ;(o.outcome_tags as OutcomeTag[]).forEach((tag) => {
      if (tag in outcomeBreakdown) {
        outcomeBreakdown[tag as keyof typeof outcomeBreakdown]++
        totalOutcomes++
      }
    })
  })

  const positiveOutcomes = outcomeBreakdown.skill_learned + outcomeBreakdown.blocker_resolved
  const positiveOutcomeRate = totalOutcomes > 0 ? (positiveOutcomes / totalOutcomes) * 100 : 0

  return {
    stats: {
      sessionsCompleted: sessionsCompleted || 0,
      upcomingSessions: upcomingSessions || 0,
      coinBalance: Math.max(0, coinBalance),
      totalCoinsSpent,
      totalCoinsPurchased,
      outcomeBreakdown,
      positiveOutcomeRate: Math.round(positiveOutcomeRate),
    },
  }
}

export interface SessionHistoryItem {
  id: string
  practitioner_id: string
  practitioner_name: string
  specializations: string[]
  scheduled_at: string
  ends_at: string
  status: string
  coins_spent: number
  brief_stuck_on: string
  needs_review: boolean
}

export async function getSessionHistory(filter: 'upcoming' | 'past' | 'all' = 'all'): Promise<{
  sessions: SessionHistoryItem[]
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { sessions: [], error: 'Not authenticated' }
  }

  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!enterprise) {
    return { sessions: [], error: 'Enterprise not found' }
  }

  let query = supabase
    .from('bookings')
    .select(`
      id,
      practitioner_id,
      scheduled_at,
      ends_at,
      status,
      coins_spent,
      brief_stuck_on,
      needs_review,
      practitioners!inner (full_name, specializations)
    `)
    .eq('enterprise_id', enterprise.id)

  const now = new Date().toISOString()

  if (filter === 'upcoming') {
    query = query
      .eq('status', 'confirmed')
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
  } else if (filter === 'past') {
    query = query
      .eq('status', 'completed')
      .order('scheduled_at', { ascending: false })
  } else {
    query = query.order('scheduled_at', { ascending: false })
  }

  const { data: sessions, error } = await query.limit(50)

  if (error) {
    console.error('Failed to get session history:', error)
    return { sessions: [], error: 'Failed to load sessions' }
  }

  return {
    sessions: (sessions || []).map((s) => ({
      id: s.id,
      practitioner_id: s.practitioner_id,
      practitioner_name: (s.practitioners as { full_name: string; specializations: string[] }).full_name,
      specializations: (s.practitioners as { full_name: string; specializations: string[] }).specializations || [],
      scheduled_at: s.scheduled_at,
      ends_at: s.ends_at,
      status: s.status,
      coins_spent: s.coins_spent,
      brief_stuck_on: s.brief_stuck_on,
      needs_review: s.needs_review,
    })),
  }
}
