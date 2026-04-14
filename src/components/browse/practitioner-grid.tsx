import { PractitionerCard, PractitionerCardSkeleton } from './practitioner-card'
import type { PractitionerCard as PractitionerCardData, PractitionerStats } from '@/actions/browse'

interface PractitionerGridProps {
  practitioners: PractitionerCardData[]
  statsMap?: Map<string, PractitionerStats>
}

export function PractitionerGrid({ practitioners, statsMap }: PractitionerGridProps) {
  if (practitioners.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No practitioners found matching your filters.</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or clearing them.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {practitioners.map((practitioner) => {
        const stats = statsMap?.get(practitioner.id)
        return (
          <PractitionerCard
            key={practitioner.id}
            practitioner={practitioner}
            avgRating={stats?.avgRating}
            totalReviews={stats?.totalReviews}
          />
        )
      })}
    </div>
  )
}

export function PractitionerGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <PractitionerCardSkeleton key={i} />
      ))}
    </div>
  )
}
