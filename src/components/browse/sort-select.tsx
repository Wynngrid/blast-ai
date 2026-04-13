'use client'

import { useQueryState, parseAsStringLiteral } from 'nuqs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SORT_OPTIONS = ['relevance', 'rating', 'sessions', 'newest'] as const

const SORT_LABELS: Record<typeof SORT_OPTIONS[number], string> = {
  relevance: 'Relevance',
  rating: 'Highest Rated',
  sessions: 'Most Sessions',
  newest: 'Newest',
}

export function useSortOption() {
  return useQueryState(
    'sort',
    parseAsStringLiteral(SORT_OPTIONS).withDefault('relevance')
  )
}

export function SortSelect() {
  const [sort, setSort] = useSortOption()

  return (
    <Select value={sort} onValueChange={setSort}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {SORT_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
