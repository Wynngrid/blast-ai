'use client'

import { Home, User, Calendar, Clock, Wallet, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { signOut } from '@/actions/auth'

const navItems = [
  { href: '/portal', label: 'Home', icon: Home },
  { href: '/portal/profile', label: 'Profile', icon: User },
  { href: '/portal/availability', label: 'Availability', icon: Calendar },
  { href: '/portal/sessions', label: 'Sessions', icon: Clock },
  { href: '/portal/earnings', label: 'Earnings', icon: Wallet },
]

export function PortalSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/portal" className="flex items-center gap-2">
          <span className="font-bold text-lg">BLAST AI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href ||
                    (item.href !== '/portal' && pathname.startsWith(item.href))}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" type="submit">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
