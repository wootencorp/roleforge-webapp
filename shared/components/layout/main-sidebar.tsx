'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Shield, Sword, Settings, LogOut, Bot } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'

const navItems = [
  { href: '/app', icon: Home, label: 'Dashboard' },
  { href: '/app/characters', icon: Users, label: 'Characters' },
  { href: '/app/campaigns', icon: Shield, label: 'Campaigns' },
  { href: '/app/sessions', icon: Sword, label: 'Game Sessions' },
  { href: '/app/ai-tools', icon: Bot, label: 'AI Tools' },
]

export function MainSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/app" className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6" />
          <span>RoleForge</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <Link href="/app/settings">
          <Button variant={pathname === '/app/settings' ? 'secondary' : 'ghost'} className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}


