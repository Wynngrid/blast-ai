'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useBookingWizard } from '@/lib/stores/booking-wizard'
import { sessionBriefSchema, type SessionBriefInput } from '@/lib/validations/booking'

export function StepBrief() {
  const { brief, setBrief, nextStep, prevStep } = useBookingWizard()

  const form = useForm<SessionBriefInput>({
    resolver: zodResolver(sessionBriefSchema),
    defaultValues: brief || {
      stuckOn: '',
      desiredOutcome: '',
      context: '',
    },
  })

  const onSubmit = (data: SessionBriefInput) => {
    setBrief(data)
    nextStep()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Session Brief</h2>
        <p className="text-muted-foreground mt-1">
          Help your practitioner prepare by sharing what you want to cover
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* What are you stuck on? - Required per D-06 */}
        <div className="space-y-2">
          <Label htmlFor="stuckOn">
            What are you stuck on? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="stuckOn"
            {...form.register('stuckOn')}
            placeholder="Describe the specific challenge or blocker you're facing..."
            rows={4}
          />
          {form.formState.errors.stuckOn && (
            <p className="text-sm text-destructive">
              {form.formState.errors.stuckOn.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {form.watch('stuckOn')?.length || 0}/500 characters
          </p>
        </div>

        {/* What outcome do you want? - Required per D-06 */}
        <div className="space-y-2">
          <Label htmlFor="desiredOutcome">
            What outcome do you want? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="desiredOutcome"
            {...form.register('desiredOutcome')}
            placeholder="What would success look like after this session?"
            rows={4}
          />
          {form.formState.errors.desiredOutcome && (
            <p className="text-sm text-destructive">
              {form.formState.errors.desiredOutcome.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {form.watch('desiredOutcome')?.length || 0}/500 characters
          </p>
        </div>

        {/* Any context to share? - Optional per D-06 */}
        <div className="space-y-2">
          <Label htmlFor="context">
            Any context to share? <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="context"
            {...form.register('context')}
            placeholder="Tech stack, team size, timeline, prior attempts..."
            rows={4}
          />
          {form.formState.errors.context && (
            <p className="text-sm text-destructive">
              {form.formState.errors.context.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {form.watch('context')?.length || 0}/1000 characters
          </p>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button type="submit">
            Continue to Slot Selection
          </Button>
        </div>
      </form>
    </div>
  )
}
