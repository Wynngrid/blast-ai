import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userRole = user.user_metadata?.role

  if (userRole === 'practitioner') {
    redirect('/portal')
  } else if (userRole === 'admin') {
    redirect('/admin')
  }

  // Get enterprise info for header
  const { data: enterprise } = await supabase
    .from('enterprises')
    .select('company_name')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">BLAST AI</h1>
            <p className="text-sm text-muted-foreground">{enterprise?.company_name || 'Enterprise'}</p>
          </div>
          <div className="flex items-center gap-4">
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DashboardTabs />
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
