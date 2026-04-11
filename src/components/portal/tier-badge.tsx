import { Badge } from '@/components/ui/badge'
import { Sparkles, Star, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PractitionerTier } from '@/types/database'

const tierConfig: Record<PractitionerTier, {
  label: string
  icon: typeof Sparkles
  className: string
}> = {
  rising: {
    label: 'Rising',
    icon: Sparkles,
    className: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100',
  },
  expert: {
    label: 'Expert',
    icon: Star,
    className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  master: {
    label: 'Master',
    icon: Crown,
    // Terracotta #D97757 per PROJECT.md brand color
    className: 'bg-[#D97757]/10 text-[#D97757] border-[#D97757]/20 hover:bg-[#D97757]/10',
  },
}

interface TierBadgeProps {
  tier: PractitionerTier | null
  size?: 'sm' | 'default'
  className?: string
}

export function TierBadge({ tier, size = 'default', className }: TierBadgeProps) {
  if (!tier) return null

  const config = tierConfig[tier]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium',
        size === 'sm' && 'text-xs px-1.5 py-0.5',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', size === 'sm' && 'h-2.5 w-2.5')} />
      {config.label}
    </Badge>
  )
}

// Export config for use in other components
export { tierConfig }
