import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { WizardContainer } from '@/components/booking/wizard-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TierBadge } from '@/components/portal/tier-badge'
import { SPECIALIZATION_CATEGORIES } from '@/lib/constants/specializations'

interface Props {
  params: Promise<{ practitioner_id: string }>
}

export default async function BookPractitionerPage({ params }: Props) {
  const { practitioner_id } = await params
  const supabase = await createClient()

  // Fetch practitioner (must be approved)
  const { data: practitioner, error: practitionerError } = await supabase
    .from('practitioners')
    .select('id, bio, specializations, tier, hourly_rate')
    .eq('id', practitioner_id)
    .eq('application_status', 'approved')
    .single()

  if (practitionerError || !practitioner) {
    notFound()
  }

  // Fetch availability rules
  const { data: rules } = await supabase
    .from('availability_rules')
    .select('*')
    .eq('practitioner_id', practitioner_id)
    .order('day_of_week')
    .order('start_time')

  // Fetch future exceptions
  const today = new Date().toISOString().split('T')[0]
  const { data: exceptions } = await supabase
    .from('availability_exceptions')
    .select('*')
    .eq('practitioner_id', practitioner_id)
    .gte('exception_date', today)

  // Fetch already booked slots (confirmed bookings)
  const { data: bookings } = await supabase
    .from('bookings')
    .select('scheduled_at, ends_at')
    .eq('practitioner_id', practitioner_id)
    .eq('status', 'confirmed')
    .gte('scheduled_at', new Date().toISOString())

  const bookedSlots = (bookings || []).map((b) => ({
    start: b.scheduled_at,
    end: b.ends_at,
  }))

  // Primary specialization for display (anonymous per DISC-04)
  const primarySpecId = practitioner.specializations?.[0]
  const primarySpec = SPECIALIZATION_CATEGORIES.find(c => c.id === primarySpecId)
  const displayTitle = primarySpec?.label || 'AI Practitioner'
  const initials = displayTitle.split(' ').map(w => w[0]).join('').slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <span className="font-bold text-lg">BLAST AI</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar: Practitioner summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-base">Booking Session With</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-muted">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{displayTitle}</p>
                    <TierBadge tier={practitioner.tier} size="sm" />
                  </div>
                </div>
                {practitioner.hourly_rate && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Rate: ${practitioner.hourly_rate}/hr
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main: Wizard */}
          <div className="lg:col-span-2">
            <WizardContainer
              practitionerId={practitioner_id}
              rules={rules || []}
              exceptions={exceptions || []}
              bookedSlots={bookedSlots}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
