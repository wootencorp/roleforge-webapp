
'use client'

import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { Home, Users, Shield, Sword, Settings, PanelLeft, Search, Bot } from 'lucide-react'
import { UserNav } from './user-nav'
import { Breadcrumbs } from './breadcrumbs'

const navItems = [
  { href: '/app', icon: Home, label: 'Dashboard' },
  { href: '/app/characters', icon: Users, label: 'Characters' },
  { href: '/app/campaigns', icon: Shield, label: 'Campaigns' },
  { href: '/app/sessions', icon: Sword, label: 'Game Sessions' },
  { href: '/app/ai-tools', icon: Bot, label: 'AI Tools' },
  { href: '/app/settings', icon: Settings, label: 'Settings' },
]

export function MainHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Shield className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">RoleForge</span>
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumbs />
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <UserNav />
    </header>
  )
}


