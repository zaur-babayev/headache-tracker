"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  onRefresh?: () => void;
}

export function PageContainer({ children, onRefresh }: PageContainerProps) {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  
  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Don't render content until auth is checked
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Don't render content if not signed in
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)]">
      <div className="container px-4 py-6 md:max-w-2xl lg:max-w-2xl xl:max-w-2xl mx-auto">
        {children}
      </div>
    </div>
  );
}
