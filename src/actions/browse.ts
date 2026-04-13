'use server'

import { createClient } from '@/lib/supabase/server'

export type SortOption = 'relevance' | 'rating' | 'sessions' | 'newest'

export interface BrowseFilters {
  specializations?: string[]
  industries?: string[]
  tier?: 'rising' | 'expert' | 'master'
  sort?: SortOption
  q?: string // Search query
}

export interface PractitionerCard {
  id: string
  bio: string | null
  specializations: string[] | null
  industries: string[] | null
  tier: 'rising' | 'expert' | 'master' | null
  hourly_rate: number | null
  // Note: full_name excluded per DISC-04 anonymization
}

export async function searchPractitioners(filters: BrowseFilters): Promise<{
  success: boolean
  data: PractitionerCard[]
  error?: string
}> {
  const supabase = await createClient()

  // Base query: only approved practitioners, public fields only (no name)
  let query = supabase
    .from('practitioners')
    .select('id, bio, specializations, industries, tier, hourly_rate')
    .eq('application_status', 'approved')

  // Filter by specializations (array contains any)
  if (filters.specializations && filters.specializations.length > 0) {
    query = query.overlaps('specializations', filters.specializations)
  }

  // Filter by industries (array contains any)
  if (filters.industries && filters.industries.length > 0) {
    query = query.overlaps('industries', filters.industries)
  }

  // Filter by tier
  if (filters.tier) {
    query = query.eq('tier', filters.tier)
  }

  // Sorting per D-03
  // Note: rating/sessions requires stats table (Phase 4), use tier as proxy for now
  switch (filters.sort) {
    case 'rating':
      // Proxy: higher tier = higher implicit rating for MVP
      query = query.order('tier', { ascending: false, nullsFirst: false })
      break
    case 'sessions':
      // Proxy: tier for MVP (sessions data in Phase 4)
      query = query.order('tier', { ascending: false, nullsFirst: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'relevance':
    default:
      // Relevance: tier weight (Master > Expert > Rising)
      // For MVP, just sort by tier descending
      query = query.order('tier', { ascending: false, nullsFirst: false })
      break
  }

  const { data, error } = await query

  if (error) {
    return { success: false, data: [], error: error.message }
  }

  return { success: true, data: data || [] }
}
