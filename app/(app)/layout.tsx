
'use client'

import { AuthGuard } from '@/features/auth/components/auth-guard';
import { MainSidebar } from '@/shared/components/layout/main-sidebar';
import { MainHeader } from '@/shared/components/layout/main-header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-muted/40">
        <MainSidebar />
        <div className="flex flex-col flex-1">
          <MainHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}


