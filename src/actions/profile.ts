'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  bioSchema,
  skillsSchema,
  ratesSchema,
  type BioInput,
  type SkillsInput,
  type RatesInput,
  type PortfolioItemInput,
} from '@/lib/validations/profile'

export type ProfileResult = {
  success: boolean
  error?: string
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', data: null }
  }

  const { data: practitioner, error } = await supabase
    .from('practitioners')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  // Also fetch portfolio items
  const { data: portfolioItems } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('practitioner_id', practitioner.id)
    .order('display_order')

  return {
    success: true,
    data: {
      ...practitioner,
      portfolioItems: portfolioItems || [],
    },
  }
}

export async function updateBio(data: BioInput): Promise<ProfileResult> {
  const validated = bioSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('practitioners')
    .update({
      full_name: validated.data.fullName,
      bio: validated.data.bio,
    })
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/portal/profile')
  return { success: true }
}

export async function updateSkills(data: SkillsInput): Promise<ProfileResult> {
  const validated = skillsSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Combine specializations with "other" if provided
  let specializations = validated.data.specializations
  if (validated.data.otherSpecialization && validated.data.specializations.includes('other')) {
    specializations = [
      ...specializations.filter(s => s !== 'other'),
      `other:${validated.data.otherSpecialization}`,
    ]
  }

  const { error } = await supabase
    .from('practitioners')
    .update({
      specializations,
      tools: validated.data.tools,
      industries: validated.data.industries || [],
    })
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/portal/profile')
  return { success: true }
}

export async function updateRates(data: RatesInput): Promise<ProfileResult> {
  const validated = ratesSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('practitioners')
    .update({
      hourly_rate: validated.data.hourlyRate,
    })
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/portal/profile')
  return { success: true }
}

export async function updatePortfolio(items: PortfolioItemInput[]): Promise<ProfileResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get practitioner ID
  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!practitioner) {
    return { success: false, error: 'Practitioner not found' }
  }

  // Delete existing portfolio items and insert new ones
  await supabase
    .from('portfolio_items')
    .delete()
    .eq('practitioner_id', practitioner.id)

  if (items.length > 0) {
    const { error } = await supabase
      .from('portfolio_items')
      .insert(
        items.map((item, index) => ({
          practitioner_id: practitioner.id,
          url: item.url,
          title: item.title || null,
          description: item.description || null,
          thumbnail_url: item.thumbnailUrl || null,
          display_order: index,
        }))
      )

    if (error) {
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/portal/profile')
  return { success: true }
}

// Combined save for final wizard submission
export async function saveProfile(data: {
  bio: BioInput
  skills: SkillsInput
  rates: RatesInput
  portfolio: PortfolioItemInput[]
}): Promise<ProfileResult> {
  // Save all sections
  const bioResult = await updateBio(data.bio)
  if (!bioResult.success) return bioResult

  const skillsResult = await updateSkills(data.skills)
  if (!skillsResult.success) return skillsResult

  const ratesResult = await updateRates(data.rates)
  if (!ratesResult.success) return ratesResult

  const portfolioResult = await updatePortfolio(data.portfolio)
  if (!portfolioResult.success) return portfolioResult

  return { success: true }
}
