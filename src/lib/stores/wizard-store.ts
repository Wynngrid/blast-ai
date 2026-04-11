import { create } from 'zustand'
import type { BioInput, SkillsInput, PortfolioInput, RatesInput } from '@/lib/validations/profile'

interface WizardState {
  currentStep: number
  stepData: {
    bio: BioInput | null
    skills: SkillsInput | null
    portfolio: PortfolioInput | null
    rates: RatesInput | null
  }
  isSubmitting: boolean
  setStepData: <K extends keyof WizardState['stepData']>(
    step: K,
    data: WizardState['stepData'][K]
  ) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  setIsSubmitting: (value: boolean) => void
  reset: () => void
}

const initialState = {
  currentStep: 0,
  stepData: {
    bio: null,
    skills: null,
    portfolio: null,
    rates: null,
  },
  isSubmitting: false,
}

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,
  setStepData: (step, data) =>
    set((state) => ({
      stepData: { ...state.stepData, [step]: data },
    })),
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 3),
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),
  goToStep: (step) =>
    set({ currentStep: Math.max(0, Math.min(step, 3)) }),
  setIsSubmitting: (value) =>
    set({ isSubmitting: value }),
  reset: () => set(initialState),
}))

export const WIZARD_STEPS = ['Bio', 'Skills & Tools', 'Portfolio', 'Rates'] as const
