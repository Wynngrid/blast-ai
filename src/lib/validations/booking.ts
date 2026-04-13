import { z } from 'zod'
import { SESSION_DURATIONS } from '@/lib/constants/specializations'

// Session brief schema per D-06 (all required with validation)
export const sessionBriefSchema = z.object({
  stuckOn: z.string()
    .min(20, 'Please describe what you are stuck on (at least 20 characters)')
    .max(500, 'Please keep your response under 500 characters'),
  desiredOutcome: z.string()
    .min(20, 'Please describe your desired outcome (at least 20 characters)')
    .max(500, 'Please keep your response under 500 characters'),
  context: z.string()
    .max(1000, 'Context should be under 1000 characters')
    .optional()
    .or(z.literal('')),
})

export type SessionBriefInput = z.infer<typeof sessionBriefSchema>

// Session type schema
export const sessionTypeSchema = z.enum(['20', '40', '60', '90']).transform(Number) as z.ZodType<20 | 40 | 60 | 90>

// Selected slot schema
export const selectedSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
})

export type SelectedSlot = z.infer<typeof selectedSlotSchema>

// Full booking input for creation
export const createBookingSchema = z.object({
  practitionerId: z.string().uuid(),
  sessionDuration: z.number().refine((n): n is 20 | 40 | 60 | 90 => SESSION_DURATIONS.includes(n as typeof SESSION_DURATIONS[number])),
  brief: sessionBriefSchema,
  slot: selectedSlotSchema,
  timezone: z.string(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
