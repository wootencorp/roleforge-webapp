
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs() {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)

  if (pathSegments.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex">
      <ol className="flex items-center gap-1.5">
        <li>
          <Link href="/app" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
        </li>
        {pathSegments.slice(1).map((segment, index) => {
          const href = `/app/${pathSegments.slice(1, index + 2).join('/')}`
          const isLast = index === pathSegments.length - 2

          return (
            <li key={segment}>
              <div className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <Link
                  href={href}
                  className={`text-sm font-medium ${isLast ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
                </Link>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}


