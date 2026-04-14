'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  postSessionFeedbackSchema,
  type PostSessionFeedbackData,
} from '@/lib/schemas/review'

export async function submitReview(data: PostSessionFeedbackData): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  // Validate input
  const validation = postSessionFeedbackSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || 'Invalid review data' }
  }

  const { review, outcome } = validation.data

  // Get current user and enterprise
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!enterprise) {
    return { error: 'Enterprise not found' }
  }

  // Verify booking belongs to this enterprise and is completed
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, practitioner_id, status, needs_review')
    .eq('id', review.bookingId)
    .eq('enterprise_id', enterprise.id)
    .single()

  if (!booking) {
    return { error: 'Booking not found' }
  }

  if (booking.status !== 'completed') {
    return { error: 'Can only review completed sessions' }
  }

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from('session_reviews')
    .select('id')
    .eq('booking_id', review.bookingId)
    .single()

  if (existingReview) {
    return { error: 'Review already submitted for this session' }
  }

  // Insert review
  const { error: reviewError } = await supabase.from('session_reviews').insert({
    booking_id: review.bookingId,
    enterprise_id: enterprise.id,
    practitioner_id: booking.practitioner_id,
    communication_rating: review.communicationRating,
    expertise_rating: review.expertiseRating,
    helpfulness_rating: review.helpfulnessRating,
    nps_score: review.npsScore,
    comment: review.comment || null,
    is_public: true,
  })

  if (reviewError) {
    console.error('Failed to insert review:', reviewError)
    return { error: 'Failed to save review' }
  }

  // Insert outcome
  const { error: outcomeError } = await supabase.from('session_outcomes').insert({
    booking_id: outcome.bookingId,
    enterprise_id: enterprise.id,
    outcome_tags: outcome.outcomeTags,
    notes: outcome.notes || null,
  })

  if (outcomeError) {
    console.error('Failed to insert outcome:', outcomeError)
    // Don't fail the whole submission, review is more important
  }

  // Update booking to mark review as complete
  await supabase
    .from('bookings')
    .update({ needs_review: false })
    .eq('id', review.bookingId)

  // Revalidate relevant paths
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/sessions')
  revalidatePath(`/practitioners/${booking.practitioner_id}`)

  return { success: true }
}

// Get pending reviews for current enterprise
export async function getPendingReviews(): Promise<{
  bookings: Array<{
    id: string
    practitioner_id: string
    practitioner_name: string
    scheduled_at: string
  }>
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { bookings: [], error: 'Not authenticated' }
  }

  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!enterprise) {
    return { bookings: [], error: 'Enterprise not found' }
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      practitioner_id,
      scheduled_at,
      practitioners!inner (full_name)
    `)
    .eq('enterprise_id', enterprise.id)
    .eq('status', 'completed')
    .eq('needs_review', true)
    .order('scheduled_at', { ascending: false })

  if (error) {
    console.error('Failed to get pending reviews:', error)
    return { bookings: [], error: 'Failed to load pending reviews' }
  }

  return {
    bookings: (bookings || []).map((b) => ({
      id: b.id,
      practitioner_id: b.practitioner_id,
      practitioner_name: (b.practitioners as { full_name: string }).full_name,
      scheduled_at: b.scheduled_at,
    })),
  }
}

// Get practitioner review stats (for profile/cards)
export async function getPractitionerReviewStats(practitionerId: string): Promise<{
  avgRating: number | null
  totalReviews: number
  avgNps: number | null
  communication: number | null
  expertise: number | null
  helpfulness: number | null
}> {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('session_reviews')
    .select('communication_rating, expertise_rating, helpfulness_rating, nps_score')
    .eq('practitioner_id', practitionerId)
    .eq('is_public', true)

  if (!reviews || reviews.length === 0) {
    return {
      avgRating: null,
      totalReviews: 0,
      avgNps: null,
      communication: null,
      expertise: null,
      helpfulness: null,
    }
  }

  const count = reviews.length
  const communication = reviews.reduce((sum, r) => sum + r.communication_rating, 0) / count
  const expertise = reviews.reduce((sum, r) => sum + r.expertise_rating, 0) / count
  const helpfulness = reviews.reduce((sum, r) => sum + r.helpfulness_rating, 0) / count
  const avgRating = (communication + expertise + helpfulness) / 3
  const avgNps = reviews.reduce((sum, r) => sum + r.nps_score, 0) / count

  return {
    avgRating: Math.round(avgRating * 10) / 10,
    totalReviews: count,
    avgNps: Math.round(avgNps * 10) / 10,
    communication: Math.round(communication * 10) / 10,
    expertise: Math.round(expertise * 10) / 10,
    helpfulness: Math.round(helpfulness * 10) / 10,
  }
}
