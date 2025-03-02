'use client';

import { useState, useEffect } from 'react';
import { Nav } from '@/components/nav';
import { HeadacheList } from '@/components/headache-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

type Medication = {
  id: string;
  name: string;
  dosage?: string;
};

type HeadacheEntry = {
  id: string;
  date: string;
  severity: number;
  notes?: string;
  triggers?: string;
  medications: Medication[];
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const [headacheEntries, setHeadacheEntries] = useState<HeadacheEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeadacheEntries = async () => {
    try {
      setIsLoading(true);
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
    fetchHeadacheEntries();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      
      <main className="flex-1 container py-8 px-4 sm:px-6 max-w-6xl mx-auto pb-20 md:pb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your headache entries
          </p>
        </div>
        
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid grid-cols-2 sm:inline-flex mb-4">
            <TabsTrigger value="recent" className="text-sm">Recent Entries</TabsTrigger>
            <TabsTrigger value="all" className="text-sm">All Entries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="mt-2">
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Recent Headache Entries</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Your most recent headache entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-10">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading headache entries...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                ) : headacheEntries.length === 0 ? (
                  <div className="text-center py-10 border border-dashed rounded-lg">
                    <p className="text-muted-foreground text-sm">No headache entries yet. Use the "Add Entry" button to record your first headache.</p>
                  </div>
                ) : (
                  <HeadacheList 
                    entries={headacheEntries.slice(0, 5)} 
                    onEntryUpdated={fetchHeadacheEntries} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all" className="mt-2">
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">All Headache Entries</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Complete history of your headache entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-10">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading headache entries...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                ) : headacheEntries.length === 0 ? (
                  <div className="text-center py-10 border border-dashed rounded-lg">
                    <p className="text-muted-foreground text-sm">No headache entries yet. Use the "Add Entry" button to record your first headache.</p>
                  </div>
                ) : (
                  <HeadacheList 
                    entries={headacheEntries} 
                    onEntryUpdated={fetchHeadacheEntries} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
