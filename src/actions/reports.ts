'use server'

import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ManagerReport, type ManagerReportProps } from '@/components/reports/manager-report'
import { format, subDays, startOfMonth } from 'date-fns'

export interface ReportData extends Omit<ManagerReportProps, 'generatedAt'> {}

export async function getReportData(
  enterpriseId: string,
  period: 'week' | 'month' | 'quarter' = 'month'
): Promise<{ data: ReportData | null; error?: string }> {
  const supabase = await createClient()

  // Calculate date range
  const now = new Date()
  let startDate: Date
  let periodLabel: string

  switch (period) {
    case 'week':
      startDate = subDays(now, 7)
      periodLabel = `Week of ${format(startDate, 'MMM d, yyyy')}`
      break
    case 'quarter':
      startDate = subDays(now, 90)
      periodLabel = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`
      break
    case 'month':
    default:
      startDate = startOfMonth(now)
      periodLabel = format(now, 'MMMM yyyy')
  }

  // Get enterprise info
  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('company_name')
    .eq('id', enterpriseId)
    .single()

  if (!enterprise) {
    return { data: null, error: 'Enterprise not found' }
  }

  // Get completed sessions in period
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      session_duration,
      practitioner_id,
      practitioners!inner (full_name, specializations)
    `)
    .eq('enterprise_id', enterpriseId)
    .eq('status', 'completed')
    .gte('scheduled_at', startDate.toISOString())

  const sessionsCompleted = bookings?.length || 0
  const totalMinutes = (bookings || []).reduce((sum, b) => sum + (b.session_duration || 0), 0)
  const totalHoursUsed = Math.round(totalMinutes / 60)

  // Extract skills (specializations) covered
  const skillsSet = new Set<string>()
  ;(bookings || []).forEach((b) => {
    const specs = (b.practitioners as { specializations: string[] })?.specializations || []
    specs.forEach((s) => skillsSet.add(s))
  })
  const skillsCovered = Array.from(skillsSet)

  // Get outcomes
  const { data: outcomes } = await supabase
    .from('session_outcomes')
    .select('outcome_tags')
    .eq('enterprise_id', enterpriseId)
    .gte('created_at', startDate.toISOString())

  const outcomeBreakdown = {
    skill_learned: 0,
    blocker_resolved: 0,
    need_followup: 0,
    not_helpful: 0,
  }

  let totalOutcomes = 0
  ;(outcomes || []).forEach((o) => {
    ;(o.outcome_tags as string[]).forEach((tag) => {
      if (tag in outcomeBreakdown) {
        outcomeBreakdown[tag as keyof typeof outcomeBreakdown]++
        totalOutcomes++
      }
    })
  })

  const positiveOutcomes = outcomeBreakdown.skill_learned + outcomeBreakdown.blocker_resolved
  const positiveOutcomeRate = totalOutcomes > 0
    ? Math.round((positiveOutcomes / totalOutcomes) * 100)
    : 0

  // Get coins spent in period
  const { data: transactions } = await supabase
    .from('coin_transactions')
    .select('amount')
    .eq('enterprise_id', enterpriseId)
    .eq('type', 'spend')
    .gte('created_at', startDate.toISOString())

  const totalCoinsSpent = (transactions || []).reduce((sum, t) => sum + Math.abs(t.amount), 0)

  // Get top practitioners
  const practitionerCounts = new Map<string, { name: string; count: number }>()
  ;(bookings || []).forEach((b) => {
    const name = (b.practitioners as { full_name: string }).full_name
    const existing = practitionerCounts.get(b.practitioner_id)
    if (existing) {
      existing.count++
    } else {
      practitionerCounts.set(b.practitioner_id, { name, count: 1 })
    }
  })

  const topPractitioners = Array.from(practitionerCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((p) => ({ name: p.name, sessions: p.count }))

  return {
    data: {
      companyName: enterprise.company_name,
      period: periodLabel,
      sessionsCompleted,
      totalHoursUsed,
      skillsCovered,
      positiveOutcomeRate,
      outcomeBreakdown,
      totalCoinsSpent,
      topPractitioners,
    },
  }
}

export async function generateManagerReportBuffer(
  enterpriseId: string,
  period: 'week' | 'month' | 'quarter' = 'month'
): Promise<{ buffer: Buffer | null; error?: string }> {
  const { data, error } = await getReportData(enterpriseId, period)

  if (error || !data) {
    return { buffer: null, error: error || 'Failed to load report data' }
  }

  try {
    const buffer = await renderToBuffer(
      ManagerReport({
        ...data,
        generatedAt: format(new Date(), 'MMM d, yyyy h:mm a'),
      })
    )

    return { buffer: Buffer.from(buffer) }
  } catch (err) {
    console.error('Failed to generate PDF:', err)
    return { buffer: null, error: 'Failed to generate PDF' }
  }
}
