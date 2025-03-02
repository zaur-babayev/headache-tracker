'use client';

import { useState, useEffect } from 'react';
import { Nav } from '@/components/nav';
import { HeadacheForm } from '@/components/headache-form';
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
      
      <main className="flex-1 container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Headache Tracker</h1>
          <HeadacheForm onSuccess={fetchHeadacheEntries} />
        </div>
        
        <Tabs defaultValue="recent">
          <TabsList>
            <TabsTrigger value="recent">Recent Entries</TabsTrigger>
            <TabsTrigger value="all">All Entries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Headache Entries</CardTitle>
                <CardDescription>
                  Your most recent headache entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-10">
                    <p>Loading headache entries...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <p className="text-red-500">{error}</p>
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
          
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Headache Entries</CardTitle>
                <CardDescription>
                  Complete history of your headache entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-10">
                    <p>Loading headache entries...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <p className="text-red-500">{error}</p>
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
