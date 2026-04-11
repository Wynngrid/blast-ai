import { z } from 'zod'

// Step 1: Bio (per D-01)
export const bioSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string()
    .min(50, 'Bio must be at least 50 characters')
    .max(500, 'Bio must be less than 500 characters'),
})

// Step 2: Skills & Tools (per D-01, D-12)
export const skillsSchema = z.object({
  specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
  otherSpecialization: z.string().optional(), // For "Other" option per D-12
  tools: z.array(z.string()).min(1, 'Add at least one tool'),
  industries: z.array(z.string()).optional(),
})

// Step 3: Portfolio (per D-02 - URL-based only)
export const portfolioItemSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
})

export const portfolioSchema = z.object({
  items: z.array(portfolioItemSchema).max(10, 'Maximum 10 portfolio items'),
})

// Step 4: Rates
export const ratesSchema = z.object({
  hourlyRate: z.number()
    .min(50, 'Minimum rate is $50/hour')
    .max(1000, 'Maximum rate is $1000/hour'),
})

// Combined schema for final submission
export const profileSchema = z.object({
  bio: bioSchema,
  skills: skillsSchema,
  portfolio: portfolioSchema,
  rates: ratesSchema,
})

// Types
export type BioInput = z.infer<typeof bioSchema>
export type SkillsInput = z.infer<typeof skillsSchema>
export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>
export type PortfolioInput = z.infer<typeof portfolioSchema>
export type RatesInput = z.infer<typeof ratesSchema>
export type ProfileInput = z.infer<typeof profileSchema>
