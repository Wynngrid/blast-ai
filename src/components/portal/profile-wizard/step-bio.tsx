'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useWizardStore } from '@/lib/stores/wizard-store'
import { bioSchema, type BioInput } from '@/lib/validations/profile'

export function StepBio() {
  const { stepData, setStepData, nextStep } = useWizardStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BioInput>({
    resolver: zodResolver(bioSchema),
    defaultValues: stepData.bio || { fullName: '', bio: '' },
  })

  const onSubmit = (data: BioInput) => {
    setStepData('bio', data)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          {...register('fullName')}
          placeholder="Your full name (for internal use)"
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Your name is only shared with enterprises after booking confirmation (per D-07)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="Tell enterprises about your experience..."
          rows={5}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          50-500 characters. Focus on what problems you solve.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  )
}
