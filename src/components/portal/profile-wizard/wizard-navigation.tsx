'use client'

import { Button } from '@/components/ui/button'
import { useWizardStore, WIZARD_STEPS } from '@/lib/stores/wizard-store'

export function WizardNavigation() {
  const { currentStep, prevStep, isSubmitting } = useWizardStore()
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center gap-3">
        <div className="relative flex h-2 w-full items-center overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Step {currentStep + 1} of {WIZARD_STEPS.length}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0 || isSubmitting}
        >
          Back
        </Button>
        <div className="flex gap-1">
          {WIZARD_STEPS.map((step, idx) => (
            <div
              key={step}
              className={`h-2 w-8 rounded-full ${
                idx <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        {/* Next/Submit button is in each step component for form integration */}
      </div>
    </div>
  )
}
