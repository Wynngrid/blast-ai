'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Calendar, Wallet } from 'lucide-react'

const tabs = [
  { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/sessions', label: 'Sessions', icon: Calendar },
  { href: '/dashboard/budget', label: 'Budget', icon: Wallet },
]

export function DashboardTabs() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background">
      <div className="flex h-10 items-center gap-4 px-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href ||
            (tab.href !== '/dashboard' && pathname.startsWith(tab.href))

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 border-b-2 px-1 pb-2.5 pt-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
