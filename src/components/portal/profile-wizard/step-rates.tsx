'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWizardStore } from '@/lib/stores/wizard-store'
import { ratesSchema, type RatesInput } from '@/lib/validations/profile'

interface StepRatesProps {
  onSubmit: () => void
}

export function StepRates({ onSubmit }: StepRatesProps) {
  const { stepData, setStepData, isSubmitting } = useWizardStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RatesInput>({
    resolver: zodResolver(ratesSchema),
    defaultValues: stepData.rates || { hourlyRate: 100 },
  })

  const handleFormSubmit = (data: RatesInput) => {
    setStepData('rates', data)
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="hourlyRate"
            type="number"
            {...register('hourlyRate', { valueAsNumber: true })}
            className="pl-7"
            min={50}
            max={1000}
          />
        </div>
        {errors.hourlyRate && (
          <p className="text-sm text-destructive">{errors.hourlyRate.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Platform fee (30-40%) will be deducted from this rate. Range: $50-$1000/hour.
        </p>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm font-medium">Note: Tier is admin-assigned (per D-03)</p>
        <p className="text-xs text-muted-foreground mt-1">
          Your tier (Rising, Expert, Master) is assigned by BLAST AI admins based on
          your experience and portfolio review. You cannot edit this field.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  )
}
