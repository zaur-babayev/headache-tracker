'use client';

import { useState, useEffect } from 'react';
import { HeadacheList } from '@/components/headache-list';
import { PageContainer } from '@/components/page-container';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [headacheEntries, setHeadacheEntries] = useState<HeadacheEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeadacheEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching headache entries, isSignedIn:', isSignedIn);
      const response = await fetch('/api/headaches', {
        credentials: 'include', // Include credentials (cookies) with the request
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch headache entries');
      }
      
      const data = await response.json();
      console.log('Fetched headache entries:', data.length);
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
    if (!isAuthLoaded) {
      return;
    }

    if (!isSignedIn) {
      console.log('User not signed in, redirecting to sign-in page');
      router.push('/sign-in');
      return;
    }

    console.log('User is signed in, fetching headache entries');
    fetchHeadacheEntries();
  }, [isAuthLoaded, isSignedIn, router]);

  if (!isAuthLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <PageContainer 
      title="Headache Entries" 
      description="Track and manage your headaches"
    >
      <div className="space-y-6">
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
