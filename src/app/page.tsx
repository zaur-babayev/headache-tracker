'use client';

import { useState, useEffect } from 'react';
import { HeadacheList } from '@/components/headache-list';
import { PageContainer } from '@/components/page-container';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

type HeadacheEntry = {
  id: string;
  date: string;
  severity: number;
  notes?: string;
  triggers: string[];
  medications: string[];
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const [headacheEntries, setHeadacheEntries] = useState<HeadacheEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeadacheEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/headaches');
      
      if (!response.ok) {
        throw new Error('Failed to fetch headache entries');
      }
      
      const data = await response.json();
      setHeadacheEntries(data);
    } catch (error) {
      console.error('Error fetching headache entries:', error);
      setError('Failed to load headache entries. Please try again later.');
      toast.error('Failed to load headache entries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchHeadacheEntries();
    }
  }, [isSignedIn]);

  // Show loading state while auth is loading
  if (!isAuthLoaded) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Headache Entries
          </h2>
          <p className="text-sm text-muted-foreground">
            Track and manage your headaches
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading headache entries...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : headacheEntries.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground text-sm">No headache entries yet. Use the "Add Entry" button to record your first headache.</p>
          </div>
        ) : (
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="recent">Recent Entries</TabsTrigger>
              <TabsTrigger value="all">All Entries ({headacheEntries.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="mt-6">
              <HeadacheList 
                entries={headacheEntries.slice(0, 5)} 
                onEntryUpdated={fetchHeadacheEntries} 
              />
            </TabsContent>
            <TabsContent value="all" className="mt-6">
              <HeadacheList 
                entries={headacheEntries} 
                onEntryUpdated={fetchHeadacheEntries} 
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageContainer>
  );
}
