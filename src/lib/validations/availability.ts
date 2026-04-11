import { z } from 'zod'

// Time format: "HH:MM" (24-hour)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const availabilityRuleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6), // 0=Sunday, 6=Saturday
  startTime: z.string().regex(timeRegex, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(timeRegex, 'Invalid time format (HH:MM)'),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: 'End time must be after start time', path: ['endTime'] }
)

export const availabilityRulesSchema = z.object({
  rules: z.array(availabilityRuleSchema),
  timezone: z.string().min(1, 'Timezone is required'),
})

export const exceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  isBlocked: z.boolean().default(true),
  startTime: z.string().regex(timeRegex).optional(),
  endTime: z.string().regex(timeRegex).optional(),
  reason: z.string().max(200).optional(),
})

export const exceptionsSchema = z.object({
  exceptions: z.array(exceptionSchema),
})

export type AvailabilityRuleInput = z.infer<typeof availabilityRuleSchema>
export type AvailabilityRulesInput = z.infer<typeof availabilityRulesSchema>
export type ExceptionInput = z.infer<typeof exceptionSchema>
export type ExceptionsInput = z.infer<typeof exceptionsSchema>

// Day name helpers
export const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
] as const

export const DAY_ABBREVIATIONS = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
] as const
