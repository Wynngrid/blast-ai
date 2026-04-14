import { Suspense } from 'react'
import { searchPractitioners, getPractitionerStatsForCards, type BrowseFilters } from '@/actions/browse'
import { FilterSidebar } from '@/components/browse/filter-sidebar'
import { ActiveFilters } from '@/components/browse/active-filters'
import { SortSelect } from '@/components/browse/sort-select'
import { PractitionerGrid, PractitionerGridSkeleton } from '@/components/browse/practitioner-grid'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

interface Props {
  searchParams: Promise<{
    specializations?: string
    industries?: string
    tier?: string
    sort?: string
  }>
}

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams

  // Parse URL params into filters
  const filters: BrowseFilters = {
    specializations: params.specializations?.split(',').filter(Boolean) || [],
    industries: params.industries?.split(',').filter(Boolean) || [],
    tier: params.tier as BrowseFilters['tier'],
    sort: (params.sort as BrowseFilters['sort']) || 'relevance',
  }

  // Fetch practitioners server-side
  const { data: practitioners, error } = await searchPractitioners(filters)

  // Fetch review stats for all practitioners (per D-11)
  const practitionerIds = practitioners.map((p) => p.id)
  const statsMap = await getPractitionerStatsForCards(practitionerIds)

  return (
    <NuqsAdapter>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <span className="font-bold text-lg">BLAST AI</span>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar filters per D-02 */}
            <FilterSidebar />

            {/* Main content */}
            <div className="flex-1">
              {/* Header with sort */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Find AI Practitioners</h1>
                <SortSelect />
              </div>

              {/* Active filter pills per D-02 */}
              <ActiveFilters />

              {/* Results count */}
              <p className="text-sm text-muted-foreground mb-4">
                {practitioners.length} practitioner{practitioners.length !== 1 ? 's' : ''} found
              </p>

              {/* Grid per D-01 */}
              {error ? (
                <div className="text-center py-12 text-destructive">
                  Error loading practitioners: {error}
                </div>
              ) : (
                <Suspense fallback={<PractitionerGridSkeleton />}>
                  <PractitionerGrid practitioners={practitioners} statsMap={statsMap} />
                </Suspense>
              )}
            </div>
          </div>
        </main>
      </div>
    </NuqsAdapter>
  )
}
