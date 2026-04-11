import { cn } from '@/lib/utils'

interface StatsDisplayProps {
  sessionsCompleted: number
  npsScore: number | null  // null if no reviews yet
  className?: string
  variant?: 'inline' | 'card'
}

export function StatsDisplay({
  sessionsCompleted,
  npsScore,
  className,
  variant = 'inline',
}: StatsDisplayProps) {
  if (variant === 'inline') {
    // Compact format for cards: "47 sessions - 9.2 NPS"
    return (
      <span className={cn('text-sm text-muted-foreground', className)}>
        {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''}
        {npsScore !== null && (
          <>
            {' '}&middot;{' '}
            <span className="font-medium text-foreground">{npsScore.toFixed(1)}</span> NPS
          </>
        )}
      </span>
    )
  }

  // Card variant for profile page
  return (
    <div className={cn('flex gap-6', className)}>
      <div>
        <p className="text-3xl font-bold">{sessionsCompleted}</p>
        <p className="text-sm text-muted-foreground">Sessions</p>
      </div>
      <div>
        <p className="text-3xl font-bold">
          {npsScore !== null ? npsScore.toFixed(1) : '--'}
        </p>
        <p className="text-sm text-muted-foreground">NPS</p>
      </div>
    </div>
  )
}

// Placeholder component for when there are no stats yet
export function StatsPlaceholder() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
      New practitioner
    </div>
  )
}
