'use client'

import { useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { useBookingWizard, BOOKING_WIZARD_STEPS, type WizardStep } from '@/lib/stores/booking-wizard'
import { StepSessionType } from './step-session-type'
import { StepBrief } from './step-brief'
import { StepSlotPicker } from './step-slot-picker'
import type { Database } from '@/types/database'

type AvailabilityRule = Database['public']['Tables']['availability_rules']['Row']
type AvailabilityException = Database['public']['Tables']['availability_exceptions']['Row']

interface WizardContainerProps {
  practitionerId: string
  rules: AvailabilityRule[]
  exceptions: AvailabilityException[]
  bookedSlots: { start: string; end: string }[]
}

export function WizardContainer({
  practitionerId,
  rules,
  exceptions,
  bookedSlots,
}: WizardContainerProps) {
  const { step, setPractitionerId, reset } = useBookingWizard()

  // Set practitioner ID on mount
  useEffect(() => {
    setPractitionerId(practitionerId)
    // Reset wizard when unmounting (navigating away)
    return () => reset()
  }, [practitionerId, setPractitionerId, reset])

  const progressValue = (step / 5) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress indicator per D-04 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Step {step} of 5</span>
          <span className="text-muted-foreground">{BOOKING_WIZARD_STEPS[step]}</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Step content */}
      {step === 1 && <StepSessionType />}
      {step === 2 && <StepBrief />}
      {step === 3 && (
        <StepSlotPicker
          rules={rules}
          exceptions={exceptions}
          bookedSlots={bookedSlots}
        />
      )}
      {step === 4 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Payment step - implemented in Plan 04</p>
        </div>
      )}
      {step === 5 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Confirmation step - implemented in Plan 05</p>
        </div>
      )}
    </div>
  )
}
