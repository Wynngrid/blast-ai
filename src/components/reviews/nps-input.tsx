'use client'

import { cn } from '@/lib/utils'

interface NPSInputProps {
  value: number | null
  onChange: (value: number) => void
  disabled?: boolean
}

const npsLabels: Record<number, string> = {
  0: 'Not at all likely',
  5: 'Neutral',
  10: 'Extremely likely',
}

export function NPSInput({ value, onChange, disabled = false }: NPSInputProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        How likely are you to recommend this practitioner? (NPS)
      </label>
      <div className="flex gap-1" role="radiogroup" aria-label="NPS Score">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={value === score}
            aria-label={`Score ${score}${npsLabels[score] ? `: ${npsLabels[score]}` : ''}`}
            disabled={disabled}
            onClick={() => onChange(score)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              value === score
                ? score <= 6
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : score <= 8
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-green-500 bg-green-50 text-green-700'
                : 'border-border bg-background hover:bg-muted',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Not at all likely</span>
        <span>Extremely likely</span>
      </div>
    </div>
  )
}
