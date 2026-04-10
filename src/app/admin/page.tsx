import { getPendingPractitioners } from '@/actions/admin'
import { PendingPractitionersList } from '@/components/features/admin/pending-practitioners-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminPage() {
  const { practitioners, error } = await getPendingPractitioners()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-gray-600">
          Manage practitioner applications and platform settings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Applications</CardDescription>
            <CardTitle className="text-3xl">{practitioners.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Practitioners</CardDescription>
            <CardTitle className="text-3xl text-gray-400">-</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Enterprises</CardDescription>
            <CardTitle className="text-3xl text-gray-400">-</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Pending Practitioner Applications</h3>
        {error ? (
          <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md">
            Error loading applications: {error}
          </div>
        ) : (
          <PendingPractitionersList practitioners={practitioners} />
        )}
      </div>
    </div>
  )
}
