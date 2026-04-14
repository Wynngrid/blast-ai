'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ReviewCard } from './review-card'
import { type PractitionerReview } from '@/actions/reviews'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ReviewListProps {
  curatedReviews: PractitionerReview[]
  allReviews: PractitionerReview[]
  totalCount: number
}

export function ReviewList({ curatedReviews, allReviews, totalCount }: ReviewListProps) {
  const [showAll, setShowAll] = useState(false)

  const displayReviews = showAll ? allReviews : curatedReviews

  if (totalCount === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Curated highlights or all reviews */}
      <div className="space-y-3">
        {displayReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Expand/collapse per D-10 */}
      {totalCount > curatedReviews.length && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            onClick={() => setShowAll(!showAll)}
            className="text-sm"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show all {totalCount} reviews
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
