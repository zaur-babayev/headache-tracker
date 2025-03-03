"use client";

import { usePathname } from 'next/navigation';
import { UserButton } from './nav';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function PageContainer({ children, title, description }: PageContainerProps) {
  const pathname = usePathname();
  
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
