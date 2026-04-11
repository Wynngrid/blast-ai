import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TierBadge } from '@/components/portal/tier-badge'
import { StatsPlaceholder } from '@/components/portal/stats-display'
import { SPECIALIZATION_CATEGORIES } from '@/lib/constants/specializations'
import { ExternalLink, MessageSquare } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PractitionerProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch practitioner (only approved ones are publicly visible via RLS)
  const { data: practitioner, error } = await supabase
    .from('practitioners')
    .select(`
      id,
      bio,
      specializations,
      industries,
      tier,
      hourly_rate,
      tools
    `)
    .eq('id', id)
    .eq('application_status', 'approved')
    .single()

  if (error || !practitioner) {
    notFound()
  }

  // Fetch portfolio items
  const { data: portfolioItems } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('practitioner_id', id)
    .order('display_order')

  // Get specialization labels
  const specLabels = (practitioner.specializations || []).map((specId) => {
    const cat = SPECIALIZATION_CATEGORIES.find((c) => c.id === specId)
    if (cat) return cat.label
    if (specId.startsWith('other:')) return specId.replace('other:', '')
    return specId
  })

  const primarySpec = specLabels[0] || 'AI Practitioner'
  const initials = primarySpec.split(' ').map((w) => w[0]).join('').slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <span className="font-bold text-lg">BLAST AI</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl bg-muted">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">{primarySpec}</h1>
                      <TierBadge tier={practitioner.tier} />
                    </div>
                    {/* Stats - placeholder for Phase 2, real data in Phase 4 (PROF-03) */}
                    <StatsPlaceholder />
                    <p className="text-sm text-muted-foreground mt-1">
                      Name revealed after booking confirmation (per D-07)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            {practitioner.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {practitioner.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle>Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {specLabels.map((label) => (
                    <Badge key={label} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tools & Stack */}
            {practitioner.tools && practitioner.tools.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tools & Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {practitioner.tools.map((tool) => (
                      <Badge key={tool} variant="outline">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio (per PROF-05) */}
            {portfolioItems && portfolioItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {portfolioItems.map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block p-4 border rounded-lg hover:border-primary transition-colors"
                      >
                        {item.thumbnail_url && (
                          <img
                            src={item.thumbnail_url}
                            alt=""
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                        )}
                        <p className="font-medium group-hover:text-primary flex items-center gap-1">
                          {item.title || new URL(item.url).hostname}
                          <ExternalLink className="h-3 w-3" />
                        </p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Placeholder (per PROF-06) */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Reviews will appear here after completed sessions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book a Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {practitioner.hourly_rate && (
                  <div>
                    <p className="text-3xl font-bold">
                      ${practitioner.hourly_rate}
                      <span className="text-lg font-normal text-muted-foreground">/hr</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Platform fee included
                    </p>
                  </div>
                )}
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Booking flow coming in Phase 3
                </p>
              </CardContent>
            </Card>

            {/* Industries */}
            {practitioner.industries && practitioner.industries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Industries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {practitioner.industries.map((industry) => (
                      <Badge key={industry} variant="outline">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
