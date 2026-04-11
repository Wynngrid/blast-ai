import { getAvailability } from '@/actions/availability'
import { redirect } from 'next/navigation'
import { AvailabilityCalendar } from '@/components/portal/availability-calendar'

export default async function AvailabilityPage() {
  const result = await getAvailability()

  if (!result.success || !result.data) {
    redirect('/portal')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Availability</h2>
        <p className="text-muted-foreground">
          Set your weekly availability and block specific dates
        </p>
      </div>

      <AvailabilityCalendar
        initialRules={result.data.rules}
        initialExceptions={result.data.exceptions}
        practitionerId={result.data.practitionerId}
      />
    </div>
  )
}
