'use client';

import { useState, useEffect } from 'react';
import { Nav } from '@/components/nav';
import { StatisticsDashboard } from '@/components/statistics-dashboard';
import { HeadacheCalendar } from '@/components/headache-calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { PageContainer } from '@/components/page-container';

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
  triggers: string[];
  medications: string[];
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
      const response = await fetch('/api/headaches', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch headache entries');
      }
      
      const data = await response.json();
      setHeadacheEntries(data);
    } catch (err) {
      console.error('Error fetching headache entries:', err);
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
    <>
      <Nav onRefresh={fetchHeadacheEntries} />
      <PageContainer 
        title="Statistics" 
        description="Analyze your headache patterns"
      >
        <div className="space-y-6 mt-12">
          <Tabs defaultValue="charts" className="w-full">
            <TabsList className="grid grid-cols-2 bg-transparent rounded-none">
              <TabsTrigger 
                value="charts" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none cursor-pointer relative"
              >
                Analytics
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 data-[state=active]:opacity-100" />
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none cursor-pointer relative"
              >
                Calendar
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 data-[state=active]:opacity-100" />
              </TabsTrigger>
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
        </div>
      </PageContainer>
    </>
  );
}
