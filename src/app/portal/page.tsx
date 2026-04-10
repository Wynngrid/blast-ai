import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('full_name, application_status, bio, specializations')
    .eq('user_id', user!.id)
    .single()

  // If still pending, redirect to pending page
  if (practitioner?.application_status === 'pending') {
    redirect('/portal/pending')
  }

  // If rejected, show rejection message
  if (practitioner?.application_status === 'rejected') {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Application Not Approved</CardTitle>
            <CardDescription className="text-red-600">
              Unfortunately, your application was not approved at this time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700">
              Please contact support@blastai.com if you have questions.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome, {practitioner?.full_name || 'Practitioner'}!
        </h2>
        <p className="text-gray-600">
          Your application has been approved. Start managing your sessions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Manage your practitioner profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {practitioner?.specializations?.join(', ') || 'No specializations set'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Profile editing coming in Phase 2
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>
              Set your available time slots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Coming in Phase 2
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>
              View your scheduled sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              No sessions scheduled yet
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
