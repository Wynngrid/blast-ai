import { create } from 'zustand'
import type { SessionBriefInput, SelectedSlot } from '@/lib/validations/booking'

// Wizard steps per D-04
export type WizardStep = 1 | 2 | 3 | 4 | 5 // SessionType, Brief, Slot, Payment, Confirmation

interface BookingWizardState {
  // Current step
  step: WizardStep

  // Practitioner being booked
  practitionerId: string | null

  // Step 1: Session type (per D-05)
  sessionDuration: 20 | 40 | 60 | 90 | null

  // Step 2: Brief (per D-06)
  brief: SessionBriefInput | null

  // Step 3: Selected slot (per D-07)
  selectedSlot: SelectedSlot | null
  timezone: string

  // Actions
  setPractitionerId: (id: string) => void
  setStep: (step: WizardStep) => void
  nextStep: () => void
  prevStep: () => void
  setSessionDuration: (duration: 20 | 40 | 60 | 90) => void
  setBrief: (brief: SessionBriefInput) => void
  setSelectedSlot: (slot: SelectedSlot) => void
  setTimezone: (tz: string) => void
  reset: () => void

  // Computed
  canProceedToPayment: () => boolean
}

const getInitialTimezone = (): string => {
  if (typeof window !== 'undefined') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
  return 'Asia/Kolkata' // Default for SSR
}

const initialState = {
  step: 1 as WizardStep,
  practitionerId: null,
  sessionDuration: null,
  brief: null,
  selectedSlot: null,
  timezone: getInitialTimezone(),
}

export const useBookingWizard = create<BookingWizardState>((set, get) => ({
  ...initialState,

  setPractitionerId: (id) => set({ practitionerId: id }),

  setStep: (step) => set({ step }),

  nextStep: () => {
    const { step } = get()
    if (step < 5) set({ step: (step + 1) as WizardStep })
  },

  prevStep: () => {
    const { step } = get()
    if (step > 1) set({ step: (step - 1) as WizardStep })
  },

  setSessionDuration: (duration) => set({ sessionDuration: duration }),

  setBrief: (brief) => set({ brief }),

  setSelectedSlot: (slot) => set({ selectedSlot: slot }),

  setTimezone: (tz) => set({ timezone: tz }),

  reset: () => set({ ...initialState, timezone: getInitialTimezone() }),

  canProceedToPayment: () => {
    const { sessionDuration, brief, selectedSlot } = get()
    return !!(sessionDuration && brief && selectedSlot)
  },
}))

// Step labels for progress indicator
export const BOOKING_WIZARD_STEPS: Record<WizardStep, string> = {
  1: 'Session Type',
  2: 'Brief',
  3: 'Time Slot',
  4: 'Payment',
  5: 'Confirmation',
}
