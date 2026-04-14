import { z } from 'zod'

// Outcome tags per D-04
export const outcomeTagSchema = z.enum([
  'skill_learned',
  'blocker_resolved',
  'need_followup',
  'not_helpful'
])

export type OutcomeTag = z.infer<typeof outcomeTagSchema>

// Session outcome schema per D-04
export const sessionOutcomeSchema = z.object({
  bookingId: z.string().uuid(),
  outcomeTags: z.array(outcomeTagSchema).min(1, 'Select at least one outcome'),
  notes: z.string().optional(),
})

export type SessionOutcomeFormData = z.infer<typeof sessionOutcomeSchema>

// Review schema per D-07, D-08
export const reviewSchema = z.object({
  bookingId: z.string().uuid(),
  communicationRating: z.number().int().min(1).max(5),
  expertiseRating: z.number().int().min(1).max(5),
  helpfulnessRating: z.number().int().min(1).max(5),
  npsScore: z.number().int().min(0).max(10),
  comment: z.string().optional(),
}).refine(
  // D-08: Comment required if NPS <= 6
  (data) => data.npsScore > 6 || (data.comment && data.comment.trim().length >= 10),
  {
    message: 'Please tell us why you gave this rating (at least 10 characters)',
    path: ['comment']
  }
)

export type ReviewFormData = z.infer<typeof reviewSchema>

// Combined review + outcome schema (submitted together after session)
export const postSessionFeedbackSchema = z.object({
  review: reviewSchema,
  outcome: sessionOutcomeSchema,
})

export type PostSessionFeedbackData = z.infer<typeof postSessionFeedbackSchema>

// Server-side insert schema (transforms camelCase to snake_case for DB)
export const reviewInsertSchema = z.object({
  booking_id: z.string().uuid(),
  enterprise_id: z.string().uuid(),
  practitioner_id: z.string().uuid(),
  communication_rating: z.number().int().min(1).max(5),
  expertise_rating: z.number().int().min(1).max(5),
  helpfulness_rating: z.number().int().min(1).max(5),
  nps_score: z.number().int().min(0).max(10),
  comment: z.string().nullable().optional(),
  is_public: z.boolean().default(true),
})

export type ReviewInsertData = z.infer<typeof reviewInsertSchema>

// Server-side outcome insert schema
export const outcomeInsertSchema = z.object({
  booking_id: z.string().uuid(),
  enterprise_id: z.string().uuid(),
  outcome_tags: z.array(outcomeTagSchema),
  notes: z.string().nullable().optional(),
})

export type OutcomeInsertData = z.infer<typeof outcomeInsertSchema>
