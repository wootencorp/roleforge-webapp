import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ErrorBoundary } from '@/shared/components/common/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'RoleForge - AI-Enhanced Virtual Tabletop',
    template: '%s | RoleForge'
  },
  description: 'The ultimate AI-enhanced virtual tabletop for tabletop role-playing games. Create characters, manage campaigns, and play with friends in real-time.',
  keywords: ['TTRPG', 'D&D', 'virtual tabletop', 'AI', 'role-playing games', 'character creation'],
  authors: [{ name: 'RoleForge Team' }],
  creator: 'RoleForge',
  publisher: 'RoleForge',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://app.roleforge.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://app.roleforge.ai',
    title: 'RoleForge - AI-Enhanced Virtual Tabletop',
    description: 'The ultimate AI-enhanced virtual tabletop for tabletop role-playing games.',
    siteName: 'RoleForge',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RoleForge - AI-Enhanced Virtual Tabletop',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoleForge - AI-Enhanced Virtual Tabletop',
    description: 'The ultimate AI-enhanced virtual tabletop for tabletop role-playing games.',
    images: ['/og-image.png'],
    creator: '@roleforge',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}

