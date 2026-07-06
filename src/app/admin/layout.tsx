'use client';

import { ReactNode } from 'react';
import { AdminProvider } from '@/contexts/admin-context';
import AdminSidebar from './components/admin-sidebar';
import AdminHeader from './components/admin-header';
import { useAdmin } from '@/contexts/admin-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAdmin();
  const { isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !isLoading && !isAdmin) {
      router.replace('/login');
    }
  }, [isAdmin, isLoading, isUserLoading, router]);

  if (isUserLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
