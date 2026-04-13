'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { useBookingWizard, BOOKING_WIZARD_STEPS, type WizardStep } from '@/lib/stores/booking-wizard'
import { StepSessionType } from './step-session-type'
import { StepBrief } from './step-brief'
import { StepSlotPicker } from './step-slot-picker'
import { StepPayment } from './step-payment'
import { createBooking } from '@/actions/booking'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type AvailabilityRule = Database['public']['Tables']['availability_rules']['Row']
type AvailabilityException = Database['public']['Tables']['availability_exceptions']['Row']

interface WizardContainerProps {
  practitionerId: string
  practitionerHourlyRate: number
  rules: AvailabilityRule[]
  exceptions: AvailabilityException[]
  bookedSlots: { start: string; end: string }[]
}

export function WizardContainer({
  practitionerId,
  practitionerHourlyRate,
  rules,
  exceptions,
  bookedSlots,
}: WizardContainerProps) {
  const router = useRouter()
  const { step, setPractitionerId, reset, sessionDuration, brief, selectedSlot, timezone } = useBookingWizard()
  const [processing, setProcessing] = useState(false)

  // Set practitioner ID on mount
  useEffect(() => {
    setPractitionerId(practitionerId)
    // Reset wizard when unmounting (navigating away)
    return () => reset()
  }, [practitionerId, setPractitionerId, reset])

  const handleBookingComplete = async () => {
    if (!sessionDuration || !brief || !selectedSlot) {
      toast.error('Missing booking information')
      return
    }

    setProcessing(true)
    try {
      const result = await createBooking({
        practitionerId,
        sessionDuration,
        brief,
        slot: selectedSlot,
        timezone,
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Booking failed')
      }

      // Redirect to confirmation page
      router.push(`/booking/${result.data.bookingId}/confirmation`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Booking failed')
    } finally {
      setProcessing(false)
    }
  }

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
        <StepPayment
          practitionerHourlyRate={practitionerHourlyRate}
          onBookingComplete={handleBookingComplete}
        />
      )}
      {step === 5 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {processing ? 'Processing your booking...' : 'Redirecting to confirmation...'}
          </p>
        </div>
      )}
    </div>
  )
}
