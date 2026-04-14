import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  getPractitionerReviewStats,
  getPractitionerReviews,
  getPractitionerReviewTrends,
} from '@/actions/reviews'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ReviewCard } from '@/components/reviews/review-card'
import { StarRating } from '@/components/reviews/star-rating'
import { TrendingUp, TrendingDown, Minus, MessageSquare } from 'lucide-react'

export default async function PortalReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!practitioner) {
    redirect('/portal/pending')
  }

  const [statsResult, reviewsResult, trendsResult] = await Promise.all([
    getPractitionerReviewStats(practitioner.id),
    getPractitionerReviews(practitioner.id, { limit: 20 }),
    getPractitionerReviewTrends(practitioner.id),
  ])

  const { avgRating, totalReviews, communication, expertise, helpfulness, avgNps } = statsResult

  // Calculate trend (compare last 2 months if available)
  const monthlyData = trendsResult.monthlyData
  let ratingTrend: 'up' | 'down' | 'stable' = 'stable'
  if (monthlyData.length >= 2) {
    const latest = monthlyData[monthlyData.length - 1].avgRating
    const previous = monthlyData[monthlyData.length - 2].avgRating
    if (latest > previous + 0.1) ratingTrend = 'up'
    else if (latest < previous - 0.1) ratingTrend = 'down'
  }

  // Find actionable feedback (most common themes in comments)
  const reviewsWithComments = reviewsResult.reviews.filter((r) => r.comment)
  const recentPositive = reviewsWithComments.filter((r) => r.nps_score >= 9).slice(0, 2)
  const recentNegative = reviewsWithComments.filter((r) => r.nps_score <= 6).slice(0, 2)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews & Feedback</h1>
        <p className="text-muted-foreground">
          See how enterprises rate your sessions and identify areas for improvement.
        </p>
      </div>

      {totalReviews === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No reviews yet</h3>
            <p className="text-muted-foreground mt-1">
              Complete sessions to start receiving feedback from enterprises.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall stats per D-15 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">{avgRating}</span>
                  <StarRating value={Math.round(avgRating || 0)} readonly size="sm" />
                  {ratingTrend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {ratingTrend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                  {ratingTrend === 'stable' && <Minus className="h-4 w-4 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold">{avgNps}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Average likelihood to recommend
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold">{totalReviews}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  From completed sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold">
                  {monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].count : 0}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  New reviews received
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Per-criteria breakdown per D-15 */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CriteriaBar label="Communication" value={communication || 0} />
              <CriteriaBar label="Expertise" value={expertise || 0} />
              <CriteriaBar label="Helpfulness" value={helpfulness || 0} />
            </CardContent>
          </Card>

          {/* Actionable feedback per D-15 */}
          {(recentPositive.length > 0 || recentNegative.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              {recentPositive.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-green-700">What&apos;s Working</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentPositive.map((r) => (
                      <div key={r.id} className="text-sm p-3 bg-green-50 rounded-lg">
                        &ldquo;{r.comment}&rdquo;
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {recentNegative.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-orange-700">Areas to Improve</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentNegative.map((r) => (
                      <div key={r.id} className="text-sm p-3 bg-orange-50 rounded-lg">
                        &ldquo;{r.comment}&rdquo;
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Recent reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reviewsResult.reviews.slice(0, 10).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function CriteriaBar({ label, value }: { label: string; value: number }) {
  const percent = (value / 5) * 100

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value.toFixed(1)}/5</span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  )
}
