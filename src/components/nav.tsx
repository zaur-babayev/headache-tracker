"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Home, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { HeadacheForm } from '@/components/headache-form';
import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

// Export UserButton component for use in page titles
export { UserButton };

interface NavProps {
  onRefresh?: () => void;
}

export function Nav({ onRefresh }: NavProps) {
  const pathname = usePathname();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { isSignedIn } = useAuth();

  // Don't render navigation if user is not signed in
  // and if the path is sign-in or sign-up
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up' || 
                     pathname.startsWith('/sign-in/') || pathname.startsWith('/sign-up/');
  
  if (!isSignedIn && !isAuthPage) {
    return null;
  }

  // Only render UserButton on auth pages
  if (isAuthPage) {
    return null;
  }

  const routes = [
    {
      href: '/',
      label: 'Dashboard',
      icon: Home,
      active: pathname === '/',
    },
    {
      href: '/statistics',
      label: 'Statistics',
      icon: BarChart3,
      active: pathname === '/statistics',
    },
  ];

  return (
    <>
      {/* Top header for desktop */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:flex hidden">
        <div className="container h-16 px-4 mx-auto md:max-w-2xl lg:max-w-2xl xl:max-w-2xl">
          <div className="flex h-full items-center justify-between">
            <nav className="flex items-center space-x-6">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground/80",
                    route.active 
                      ? "text-foreground" 
                      : "text-foreground/60"
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  <span>{route.label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <HeadacheForm onSuccess={onRefresh} isDialog={true} mode="create" />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile UserButton - top right */}
      <div className="fixed top-0 right-0 z-50 p-4 md:hidden">
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Bottom navigation for mobile */}
      <nav className="fixed bottom-0 left-0 z-50 w-full h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden">
        <div className="grid h-full grid-cols-3 mx-auto">
          <Link 
            href="/" 
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-accent/50 transition-colors",
              pathname === '/' ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-accent/50 transition-colors"
          >
            <div className="bg-primary text-primary-foreground rounded-full p-2 -mt-6 shadow-md">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs mt-1">Add Entry</span>
          </button>
          
          <Link 
            href="/statistics" 
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-accent/50 transition-colors",
              pathname === '/statistics' ? "text-primary" : "text-muted-foreground"
            )}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs mt-1">Statistics</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Add Entry Form Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 md:hidden">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md border">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Add Headache Entry</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsFormOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <div className="p-4">
              <HeadacheForm 
                onSuccess={() => {
                  setIsFormOpen(false);
                  onRefresh?.();
                }} 
                onCancel={() => setIsFormOpen(false)}
                isDialog={false}
                mode="create"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
