import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, TrendingUp, Star } from 'lucide-react'
import { getPractitionerReviewStats } from '@/actions/reviews'

export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id, full_name, application_status, bio, specializations, tier, hourly_rate')
    .eq('user_id', user!.id)
    .single()

  if (practitioner?.application_status === 'pending') {
    redirect('/portal/pending')
  }

  if (!practitioner) {
    redirect('/portal/pending')
  }

  if (practitioner.application_status === 'rejected') {
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

  // Fetch review stats for approved practitioners
  const reviewStats = await getPractitionerReviewStats(practitioner.id)

  // Approved practitioner view per D-10
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back!
        </h2>
        <p className="text-muted-foreground">
          Here's what's happening with your sessions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Sessions - Main Area per D-10 */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold">Upcoming Sessions</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No upcoming sessions</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Sessions booked by enterprises will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar per D-10 */}
        <div className="space-y-4">
          <h3 className="font-semibold">Your Stats</h3>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Sessions completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {reviewStats.avgRating !== null ? reviewStats.avgRating : '--'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reviewStats.totalReviews > 0
                      ? `from ${reviewStats.totalReviews} review${reviewStats.totalReviews !== 1 ? 's' : ''}`
                      : 'Average rating'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">$0</p>
                  <p className="text-xs text-muted-foreground">Earnings this month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
