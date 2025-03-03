"use client";

import { usePathname } from 'next/navigation';
import { UserButton } from './nav';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function PageContainer({ children, title, description }: PageContainerProps) {
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
  
  // Determine title based on pathname if not provided
  const pageTitle = title || (
    pathname === '/' ? 'Dashboard' :
    pathname === '/statistics' ? 'Statistics' :
    pathname === '/calendar' ? 'Calendar' : ''
  );

  // Default descriptions for common pages
  const pageDescription = description || (
    pathname === '/' ? 'Track and manage your headaches' :
    pathname === '/statistics' ? 'Analyze your headache patterns' :
    pathname === '/calendar' ? 'View your headache calendar' : ''
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] pb-20 md:pb-8">
      <div className="container px-4 py-6 md:max-w-2xl lg:max-w-2xl xl:max-w-2xl mx-auto">
        {/* Mobile page title with UserButton */}
        <div className="flex items-center justify-between mb-2 md:hidden">
          <h1 className="text-2xl font-semibold">{pageTitle}</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
        
        {/* Mobile description */}
        {pageDescription && (
          <p className="text-sm text-muted-foreground mb-6 md:hidden">{pageDescription}</p>
        )}
        
        {/* Desktop title and description - hidden on mobile */}
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-semibold">{pageTitle}</h1>
          {pageDescription && (
            <p className="text-sm text-muted-foreground">{pageDescription}</p>
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
}
