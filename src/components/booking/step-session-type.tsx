'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useBookingWizard } from '@/lib/stores/booking-wizard'
import { SESSION_DURATIONS, type SessionDuration } from '@/lib/constants/specializations'
import { Clock } from 'lucide-react'

const SESSION_DESCRIPTIONS: Record<SessionDuration, string> = {
  20: 'Quick check-in or focused question',
  40: 'Deep dive on a specific problem',
  60: 'Comprehensive consultation',
  90: 'Extended session for complex challenges',
}

export function StepSessionType() {
  const { sessionDuration, setSessionDuration, nextStep } = useBookingWizard()

  const handleSelect = (duration: SessionDuration) => {
    setSessionDuration(duration)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Select Session Duration</h2>
        <p className="text-muted-foreground mt-1">Choose the length that fits your needs</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SESSION_DURATIONS.map((duration) => (
          <Card
            key={duration}
            className={cn(
              'cursor-pointer transition-colors',
              sessionDuration === duration
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            )}
            onClick={() => handleSelect(duration)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                {duration} minutes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {SESSION_DESCRIPTIONS[duration]}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sprint packages teaser per D-05 */}
      <Card className="bg-muted/50 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-muted-foreground">Sprint Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Coming soon: Multi-session packages for ongoing mentorship
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={nextStep} disabled={!sessionDuration}>
          Continue to Brief
        </Button>
      </div>
    </div>
  )
}
