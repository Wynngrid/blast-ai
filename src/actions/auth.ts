'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import {
  loginSchema,
  enterpriseSignupSchema,
  practitionerSignupSchema,
  type LoginInput,
  type EnterpriseSignupInput,
  type PractitionerSignupInput,
} from '@/lib/validations/auth'

export type AuthResult = {
  success: boolean
  error?: string
}

export async function login(data: LoginInput): Promise<AuthResult> {
  const validated = loginSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Get user role to redirect appropriately
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Failed to get user data' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'enterprise'

  // Redirect based on role
  if (role === 'admin') {
    redirect('/admin')
  } else if (role === 'practitioner') {
    redirect('/portal')
  } else {
    redirect('/dashboard')
  }
}

export async function signupEnterprise(data: EnterpriseSignupInput): Promise<AuthResult> {
  const validated = enterpriseSignupSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  // Create auth user with role metadata
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        role: 'enterprise',
        display_name: validated.data.displayName,
      },
    },
  })

  if (signUpError) {
    return { success: false, error: signUpError.message }
  }

  if (!authData.user) {
    return { success: false, error: 'Failed to create user' }
  }

  // Create enterprise record
  const { error: enterpriseError } = await supabase
    .from('enterprises')
    .insert({
      user_id: authData.user.id,
      company_name: validated.data.companyName,
      company_size: validated.data.companySize || null,
      industry: validated.data.industry || null,
    })

  if (enterpriseError) {
    console.error('Failed to create enterprise record:', enterpriseError)
    // User is created but enterprise record failed - they can retry profile setup
  }

  redirect('/dashboard')
}

export async function signupPractitioner(data: PractitionerSignupInput): Promise<AuthResult> {
  const validated = practitionerSignupSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  // Create auth user with practitioner role
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        role: 'practitioner',
        display_name: validated.data.fullName,
      },
    },
  })

  if (signUpError) {
    return { success: false, error: signUpError.message }
  }

  if (!authData.user) {
    return { success: false, error: 'Failed to create user' }
  }

  // Create practitioner record with pending status
  const { error: practitionerError } = await supabase
    .from('practitioners')
    .insert({
      user_id: authData.user.id,
      full_name: validated.data.fullName,
      bio: validated.data.bio,
      specializations: validated.data.specializations,
      application_status: 'pending',
    })

  if (practitionerError) {
    console.error('Failed to create practitioner record:', practitionerError)
  }

  redirect('/portal/pending')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    redirect('/error?message=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
