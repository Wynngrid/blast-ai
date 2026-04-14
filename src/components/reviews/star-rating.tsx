'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function StarRating({ value, onChange, readonly = false, size = 'md', label }: StarRatingProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <div className="flex gap-1" role="radiogroup" aria-label={label || 'Rating'}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value >= star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className={cn(
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-transform',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            )}
          >
            <Star
              className={cn(
                sizes[size],
                value >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
