'use client';

import { useState, useEffect } from 'react';
import { Nav } from '@/components/nav';
import { StatisticsDashboard } from '@/components/statistics-dashboard';
import { HeadacheCalendar } from '@/components/headache-calendar';
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

export default function StatisticsPage() {
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
      
      <main className="flex-1 container py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Analyze your headache patterns and trends
          </p>
        </div>
        
        <Tabs defaultValue="charts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="charts" className="text-sm">Analytics</TabsTrigger>
            <TabsTrigger value="calendar" className="text-sm">Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading statistics data...</p>
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
              <StatisticsDashboard entries={headacheEntries} />
            )}
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-6">
            <div className="rounded-lg bg-card py-4 text-card-foreground shadow-sm">
              {isLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading calendar data...</p>
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
                <HeadacheCalendar entries={headacheEntries} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
