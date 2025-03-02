"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, BarChart3, Home, Plus, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { HeadacheForm } from '@/components/headache-form';

export function Nav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm md:flex hidden">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <div className="mr-4 flex">
            <Link href="/" className="mr-8 flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight">Headache Tracker</span>
            </Link>
            <nav className="flex items-center space-x-8 text-sm font-medium">
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
                  {route.active && (
                    <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <HeadacheForm onSuccess={() => {}} isDialog={true} mode="create" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content wrapper to ensure bottom nav doesn't overlap content */}
      <div className="pb-16 md:pb-0">
        {/* Children content will go here */}
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
                  // Refresh data if needed
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
