import Link from 'next/link'
import { getProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TierBadge } from '@/components/portal/tier-badge'
import { StatsPlaceholder } from '@/components/portal/stats-display'
import { SPECIALIZATION_CATEGORIES } from '@/lib/constants/specializations'
import { ExternalLink, Pencil, Eye, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function ProfilePage() {
  const result = await getProfile()

  if (!result.success || !result.data) {
    redirect('/portal')
  }

  const practitioner = result.data
  const portfolioItems = practitioner.portfolioItems || []

  // Get specialization labels
  const specLabels = (practitioner.specializations || []).map((specId) => {
    const cat = SPECIALIZATION_CATEGORIES.find((c) => c.id === specId)
    if (cat) return cat.label
    if (specId.startsWith('other:')) return specId.replace('other:', '')
    return specId
  })

  const primarySpec = specLabels[0] || 'AI Practitioner'
  const initials = primarySpec.split(' ').map((w) => w[0]).join('').slice(0, 2)

  // Check profile completeness
  const isComplete = Boolean(
    practitioner.bio &&
    practitioner.specializations?.length &&
    practitioner.tools?.length &&
    practitioner.hourly_rate
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage how enterprises see your profile
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/practitioners/${practitioner.id}`}
            target="_blank"
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Public Profile
          </Link>
          <Link
            href="/portal/profile/edit"
            className={cn(buttonVariants())}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Completeness Warning */}
      {!isComplete && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Profile incomplete</p>
              <p className="text-sm text-amber-600">
                Complete your profile to appear in enterprise searches.
              </p>
            </div>
            <Link
              href="/portal/profile/edit"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'ml-auto')}
            >
              Complete Profile
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
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
                    <h3 className="text-xl font-bold">{primarySpec}</h3>
                    <TierBadge tier={practitioner.tier} />
                  </div>
                  <StatsPlaceholder />
                  <p className="text-sm text-muted-foreground mt-2">
                    Public view shows specialization, not your name (per D-07)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              {practitioner.bio ? (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {practitioner.bio}
                </p>
              ) : (
                <p className="text-muted-foreground italic">No bio set</p>
              )}
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle>Specializations</CardTitle>
            </CardHeader>
            <CardContent>
              {specLabels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {specLabels.map((label) => (
                    <Badge key={label} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No specializations set</p>
              )}
            </CardContent>
          </Card>

          {/* Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Tools & Stack</CardTitle>
            </CardHeader>
            <CardContent>
              {practitioner.tools && practitioner.tools.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {practitioner.tools.map((tool) => (
                    <Badge key={tool} variant="outline">
                      {tool}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No tools set</p>
              )}
            </CardContent>
          </Card>

          {/* Portfolio */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              {portfolioItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {portfolioItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block p-4 border rounded-lg hover:border-primary"
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
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No portfolio items</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Private Info (not shown publicly) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Private Information</CardTitle>
              <CardDescription>
                Only visible to you and after booking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{practitioner.full_name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hourly Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {practitioner.hourly_rate ? (
                <p className="text-3xl font-bold">
                  ${practitioner.hourly_rate}
                  <span className="text-lg font-normal text-muted-foreground">/hr</span>
                </p>
              ) : (
                <p className="text-muted-foreground italic">Not set</p>
              )}
            </CardContent>
          </Card>

          {/* Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tier</CardTitle>
              <CardDescription>
                Assigned by BLAST AI admins (per D-03)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {practitioner.tier ? (
                <TierBadge tier={practitioner.tier} />
              ) : (
                <p className="text-muted-foreground italic">Pending assignment</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
