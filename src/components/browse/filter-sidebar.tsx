'use client'

import { useQueryStates, parseAsArrayOf, parseAsString, parseAsStringLiteral } from 'nuqs'
import { SPECIALIZATION_CATEGORIES } from '@/lib/constants/specializations'
import { INDUSTRIES } from '@/lib/constants/industries'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const TIER_OPTIONS = ['rising', 'expert', 'master'] as const

export function useBrowseFilters() {
  return useQueryStates({
    specializations: parseAsArrayOf(parseAsString).withDefault([]),
    industries: parseAsArrayOf(parseAsString).withDefault([]),
    tier: parseAsStringLiteral(TIER_OPTIONS),
  })
}

export function FilterSidebar() {
  const [filters, setFilters] = useBrowseFilters()

  const toggleSpecialization = (id: string) => {
    const current = filters.specializations
    const updated = current.includes(id)
      ? current.filter(s => s !== id)
      : [...current, id]
    setFilters({ specializations: updated })
  }

  const toggleIndustry = (id: string) => {
    const current = filters.industries
    const updated = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id]
    setFilters({ industries: updated })
  }

  const setTier = (tier: typeof TIER_OPTIONS[number] | null) => {
    setFilters({ tier })
  }

  return (
    <aside className="w-64 shrink-0 space-y-6">
      {/* Specialization filters per DISC-01 */}
      <div>
        <h3 className="font-semibold mb-3">Specialization</h3>
        <div className="space-y-2">
          {SPECIALIZATION_CATEGORIES.filter(s => s.id !== 'other').map((spec) => (
            <div key={spec.id} className="flex items-center space-x-2">
              <Checkbox
                id={`spec-${spec.id}`}
                checked={filters.specializations.includes(spec.id)}
                onCheckedChange={() => toggleSpecialization(spec.id)}
              />
              <Label htmlFor={`spec-${spec.id}`} className="text-sm cursor-pointer">
                {spec.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Industry filters per DISC-02 */}
      <div>
        <h3 className="font-semibold mb-3">Industry</h3>
        <div className="space-y-2">
          {INDUSTRIES.filter(i => i.id !== 'other').map((industry) => (
            <div key={industry.id} className="flex items-center space-x-2">
              <Checkbox
                id={`ind-${industry.id}`}
                checked={filters.industries.includes(industry.id)}
                onCheckedChange={() => toggleIndustry(industry.id)}
              />
              <Label htmlFor={`ind-${industry.id}`} className="text-sm cursor-pointer">
                {industry.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tier filter per DISC-03 */}
      <div>
        <h3 className="font-semibold mb-3">Tier</h3>
        <div className="space-y-2">
          {TIER_OPTIONS.map((tier) => (
            <div key={tier} className="flex items-center space-x-2">
              <Checkbox
                id={`tier-${tier}`}
                checked={filters.tier === tier}
                onCheckedChange={(checked) => setTier(checked ? tier : null)}
              />
              <Label htmlFor={`tier-${tier}`} className="text-sm cursor-pointer capitalize">
                {tier}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
