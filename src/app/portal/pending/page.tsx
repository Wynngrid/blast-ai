import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export default async function PendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('full_name, application_status, created_at')
    .eq('user_id', user!.id)
    .single()

  // If approved, redirect to main portal
  if (practitioner?.application_status === 'approved') {
    redirect('/portal')
  }

  // If rejected, also redirect to main portal (which shows rejection message)
  if (practitioner?.application_status === 'rejected') {
    redirect('/portal')
  }

  const appliedDate = practitioner?.created_at
    ? new Date(practitioner.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'recently'

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle>Application Under Review</CardTitle>
          <CardDescription>
            Thank you for applying to join BLAST AI
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Hi {practitioner?.full_name || 'there'}, your application submitted on {appliedDate} is currently being reviewed by our team.
          </p>
          <p className="text-sm text-gray-500">
            We typically review applications within 48 hours. You'll receive an email once a decision has been made.
          </p>
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-400">
              Questions? Contact us at support@blastai.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
