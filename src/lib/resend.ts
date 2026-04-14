import { Resend } from 'resend'

// Use a placeholder key during build when env var is not set
// The Resend constructor requires a non-empty string
const apiKey = process.env.RESEND_API_KEY || 're_placeholder_key'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not set - emails will not be sent')
}

export const resend = new Resend(apiKey)

export const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS || 'BLAST AI <onboarding@resend.dev>'

/**
 * Check if Resend is properly configured
 */
export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}
