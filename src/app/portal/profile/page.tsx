import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your practitioner profile
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/profile/edit">Edit Profile</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Preview</CardTitle>
          <CardDescription>
            This is how enterprises see your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Profile display coming soon. Use "Edit Profile" to complete your profile.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
