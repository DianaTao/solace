'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, setLoading } = useAuthStore();

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    
    setLoading(false);
  }, [isAuthenticated, router, setLoading]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
} 