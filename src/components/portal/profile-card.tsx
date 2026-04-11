import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { TierBadge } from './tier-badge'
import { StatsDisplay, StatsPlaceholder } from './stats-display'
import { SPECIALIZATION_CATEGORIES } from '@/lib/constants/specializations'
import type { PractitionerTier } from '@/types/database'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileCardProps {
  practitioner: {
    id: string
    // Note: full_name is NOT included - anonymous per D-07
    bio: string | null
    specializations: string[] | null
    tier: PractitionerTier | null
    hourly_rate: number | null
    // Stats placeholders for Phase 2
    sessions_completed?: number
    nps_score?: number | null
  }
}

export function ProfileCard({ practitioner }: ProfileCardProps) {
  // Get primary specialization label
  const primarySpec = practitioner.specializations?.[0]
  const specLabel = primarySpec
    ? SPECIALIZATION_CATEGORIES.find((c) => c.id === primarySpec)?.label ||
      primarySpec.replace('other:', '')
    : 'AI Practitioner'

  // Generate avatar initials from specialization (not name - anonymous)
  const initials = specLabel.split(' ').map((w) => w[0]).join('').slice(0, 2)

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-muted text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold truncate">{specLabel}</p>
              <TierBadge tier={practitioner.tier} size="sm" />
            </div>
            {practitioner.sessions_completed !== undefined ? (
              <StatsDisplay
                sessionsCompleted={practitioner.sessions_completed}
                npsScore={practitioner.nps_score ?? null}
              />
            ) : (
              <StatsPlaceholder />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {practitioner.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {practitioner.bio}
          </p>
        )}

        <div className="flex items-center justify-between">
          {practitioner.hourly_rate && (
            <p className="font-semibold">
              ${practitioner.hourly_rate}
              <span className="text-sm font-normal text-muted-foreground">/hr</span>
            </p>
          )}
          <Link
            href={`/practitioners/${practitioner.id}`}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'group-hover:bg-primary group-hover:text-primary-foreground'
            )}
          >
            View Profile
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
