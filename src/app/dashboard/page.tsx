import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user!.id)
    .single()

  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('company_name')
    .eq('user_id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome, {profile?.display_name || 'there'}!
        </h2>
        <p className="text-gray-600">
          {enterprise?.company_name || 'Your company'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Browse Practitioners</CardTitle>
            <CardDescription>
              Find AI experts for your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Coming in Phase 3
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>
              Your scheduled mentorship sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              No sessions booked yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Progress</CardTitle>
            <CardDescription>
              Track your team's AI upskilling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Coming in Phase 4
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
