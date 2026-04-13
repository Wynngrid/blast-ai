import { getBookingDetails } from '@/actions/booking'
import { BookingConfirmation } from '@/components/booking/booking-confirmation'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export default async function BookingConfirmationPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getBookingDetails(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const { booking, practitioner } = result.data

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <span className="font-bold text-lg">BLAST AI</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <BookingConfirmation booking={booking} practitioner={practitioner} />
      </main>
    </div>
  )
}
