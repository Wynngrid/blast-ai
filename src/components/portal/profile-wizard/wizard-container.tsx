'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWizardStore, WIZARD_STEPS } from '@/lib/stores/wizard-store'
import { WizardNavigation } from './wizard-navigation'
import { StepBio } from './step-bio'
import { StepSkills } from './step-skills'
import { StepPortfolio } from './step-portfolio'
import { StepRates } from './step-rates'
import { saveProfile } from '@/actions/profile'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WizardContainerProps {
  initialData: {
    full_name: string
    bio: string | null
    specializations: string[] | null
    tools: string[] | null
    industries: string[] | null
    hourly_rate: number | null
    portfolioItems: Array<{
      url: string
      title: string | null
      description: string | null
      thumbnail_url: string | null
    }>
  }
}

export function WizardContainer({ initialData }: WizardContainerProps) {
  const router = useRouter()
  const { currentStep, stepData, setStepData, setIsSubmitting, reset } = useWizardStore()

  // Initialize store with existing data on mount
  useEffect(() => {
    setStepData('bio', {
      fullName: initialData.full_name,
      bio: initialData.bio || '',
    })
    setStepData('skills', {
      specializations: initialData.specializations || [],
      tools: initialData.tools || [],
      industries: initialData.industries || [],
    })
    setStepData('portfolio', {
      items: initialData.portfolioItems.map(item => ({
        url: item.url,
        title: item.title || undefined,
        description: item.description || undefined,
        thumbnailUrl: item.thumbnail_url || undefined,
      })),
    })
    setStepData('rates', {
      hourlyRate: initialData.hourly_rate || 100,
    })
  }, [initialData, setStepData])

  const handleSubmit = async () => {
    if (!stepData.bio || !stepData.skills || !stepData.rates) {
      toast.error('Please complete all steps')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await saveProfile({
        bio: stepData.bio,
        skills: stepData.skills,
        rates: stepData.rates,
        portfolio: stepData.portfolio?.items || [],
      })

      if (result.success) {
        toast.success('Profile saved successfully')
        reset()
        router.push('/portal/profile')
      } else {
        toast.error(result.error || 'Failed to save profile')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    <StepBio key="bio" />,
    <StepSkills key="skills" />,
    <StepPortfolio key="portfolio" />,
    <StepRates key="rates" onSubmit={handleSubmit} />,
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile - {WIZARD_STEPS[currentStep]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {steps[currentStep]}
        <WizardNavigation />
      </CardContent>
    </Card>
  )
}
