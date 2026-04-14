import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { StarRating } from './star-rating'
import { type PractitionerReview } from '@/actions/reviews'

interface ReviewCardProps {
  review: PractitionerReview
  showEnterprise?: boolean
}

export function ReviewCard({ review, showEnterprise = true }: ReviewCardProps) {
  const avgRating = (
    review.communication_rating +
    review.expertise_rating +
    review.helpfulness_rating
  ) / 3

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <StarRating value={Math.round(avgRating)} readonly size="sm" />
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          {showEnterprise && review.enterprise_company && (
            <span className="text-sm text-muted-foreground">
              {review.enterprise_company}
            </span>
          )}
        </div>

        {review.comment && (
          <p className="text-sm text-foreground">{review.comment}</p>
        )}

        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span>Communication: {review.communication_rating}/5</span>
          <span>Expertise: {review.expertise_rating}/5</span>
          <span>Helpfulness: {review.helpfulness_rating}/5</span>
        </div>
      </CardContent>
    </Card>
  )
}
