'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#4B9DA9] border-t-transparent mb-4"></div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4B9DA9] to-[#E37434] bg-clip-text text-transparent">
          ATS Platform
        </h1>
        <p className="text-gray-500 mt-2">Loading...</p>
      </div>
    </div>
  );
}
