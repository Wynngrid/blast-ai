import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TierBadge } from '@/components/portal/tier-badge'
import { SPECIALIZATION_CATEGORIES } from '@/lib/constants/specializations'
import type { PractitionerCard as PractitionerCardData } from '@/actions/browse'

interface PractitionerCardProps {
  practitioner: PractitionerCardData
}

export function PractitionerCard({ practitioner }: PractitionerCardProps) {
  // Get primary specialization label (anonymous display per DISC-04)
  const primarySpecId = practitioner.specializations?.[0]
  const primarySpec = SPECIALIZATION_CATEGORIES.find(c => c.id === primarySpecId)
  const displayTitle = primarySpec?.label || 'AI Practitioner'

  // Generate initials from specialization (NOT name - anonymous per DISC-04)
  const initials = displayTitle.split(' ').map(w => w[0]).join('').slice(0, 2)

  return (
    <Link href={`/practitioners/${practitioner.id}`}>
      <Card className="h-full hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-muted text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{displayTitle}</h3>
                <TierBadge tier={practitioner.tier} size="sm" />
              </div>
              {practitioner.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {practitioner.bio}
                </p>
              )}
              {/* Additional specializations */}
              {practitioner.specializations && practitioner.specializations.length > 1 && (
                <div className="flex flex-wrap gap-1">
                  {practitioner.specializations.slice(1, 3).map((specId) => {
                    const spec = SPECIALIZATION_CATEGORIES.find(c => c.id === specId)
                    return (
                      <Badge key={specId} variant="outline" className="text-xs">
                        {spec?.label || specId}
                      </Badge>
                    )
                  })}
                  {practitioner.specializations.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{practitioner.specializations.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Rate display */}
          {practitioner.hourly_rate && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm">
                <span className="font-semibold">${practitioner.hourly_rate}</span>
                <span className="text-muted-foreground">/hr</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

// Loading skeleton for card
export function PractitionerCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
