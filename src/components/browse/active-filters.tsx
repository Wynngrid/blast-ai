'use client'

import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useBrowseFilters } from './filter-sidebar'
import { SPECIALIZATION_CATEGORIES } from '@/lib/constants/specializations'
import { INDUSTRIES } from '@/lib/constants/industries'

export function ActiveFilters() {
  const [filters, setFilters] = useBrowseFilters()

  const hasFilters = filters.specializations.length > 0 ||
    filters.industries.length > 0 ||
    filters.tier

  if (!hasFilters) return null

  const removeSpecialization = (id: string) => {
    setFilters({ specializations: filters.specializations.filter(s => s !== id) })
  }

  const removeIndustry = (id: string) => {
    setFilters({ industries: filters.industries.filter(i => i !== id) })
  }

  const clearAll = () => {
    setFilters({ specializations: [], industries: [], tier: null })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {filters.specializations.map((specId) => {
        const spec = SPECIALIZATION_CATEGORIES.find(s => s.id === specId)
        return (
          <Badge key={specId} variant="secondary" className="gap-1">
            {spec?.label || specId}
            <button onClick={() => removeSpecialization(specId)} className="ml-1">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
      })}
      {filters.industries.map((indId) => {
        const ind = INDUSTRIES.find(i => i.id === indId)
        return (
          <Badge key={indId} variant="secondary" className="gap-1">
            {ind?.label || indId}
            <button onClick={() => removeIndustry(indId)} className="ml-1">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
      })}
      {filters.tier && (
        <Badge variant="secondary" className="gap-1 capitalize">
          {filters.tier}
          <button onClick={() => setFilters({ tier: null })} className="ml-1">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
        Clear all
      </Button>
    </div>
  )
}
