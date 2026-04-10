import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const enterpriseSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  companySize: z.string().optional(),
  industry: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const practitionerSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500, 'Bio must be less than 500 characters'),
  specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type EnterpriseSignupInput = z.infer<typeof enterpriseSignupSchema>
export type PractitionerSignupInput = z.infer<typeof practitionerSignupSchema>
