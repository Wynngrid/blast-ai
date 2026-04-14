'use server'

import { createClient } from '@/lib/supabase/server'

export type SortOption = 'relevance' | 'rating' | 'sessions' | 'newest'

// Review stats for practitioner cards (fetched in batch)
export interface PractitionerStats {
  practitionerId: string
  avgRating: number | null
  totalReviews: number
}

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

// Fetch review stats for multiple practitioners (for card display per D-11)
export async function getPractitionerStatsForCards(
  practitionerIds: string[]
): Promise<Map<string, PractitionerStats>> {
  if (practitionerIds.length === 0) {
    return new Map()
  }

  const supabase = await createClient()

  // Fetch all public reviews for these practitioners
  const { data: reviews } = await supabase
    .from('session_reviews')
    .select('practitioner_id, communication_rating, expertise_rating, helpfulness_rating')
    .in('practitioner_id', practitionerIds)
    .eq('is_public', true)

  // Aggregate stats per practitioner
  const statsMap = new Map<string, PractitionerStats>()

  // Initialize with null stats for all practitioners
  practitionerIds.forEach((id) => {
    statsMap.set(id, { practitionerId: id, avgRating: null, totalReviews: 0 })
  })

  if (!reviews || reviews.length === 0) {
    return statsMap
  }

  // Group reviews by practitioner
  const reviewsByPractitioner = new Map<
    string,
    Array<{ communication_rating: number; expertise_rating: number; helpfulness_rating: number }>
  >()

  reviews.forEach((r) => {
    const existing = reviewsByPractitioner.get(r.practitioner_id) || []
    existing.push({
      communication_rating: r.communication_rating,
      expertise_rating: r.expertise_rating,
      helpfulness_rating: r.helpfulness_rating,
    })
    reviewsByPractitioner.set(r.practitioner_id, existing)
  })

  // Calculate stats
  reviewsByPractitioner.forEach((practitionerReviews, practitionerId) => {
    const count = practitionerReviews.length
    const totalRating = practitionerReviews.reduce((sum, r) => {
      return sum + (r.communication_rating + r.expertise_rating + r.helpfulness_rating) / 3
    }, 0)
    const avgRating = Math.round((totalRating / count) * 10) / 10

    statsMap.set(practitionerId, {
      practitionerId,
      avgRating,
      totalReviews: count,
    })
  })

  return statsMap
}
