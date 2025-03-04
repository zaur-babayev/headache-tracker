'use client';

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatisticsDashboard } from "@/components/statistics-dashboard";
import { Nav } from '@/components/nav';
import { PageContainer } from '@/components/page-container';
import { toast } from 'sonner';

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
              <div className="rounded-lg bg-card py-4 text-card-foreground shadow-sm">
                {error ? (
                  <div className="text-center py-10">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                ) : headacheEntries.length === 0 && !isLoading ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground text-sm">No headache entries yet. Use the "Add Entry" button to record your first headache.</p>
                  </div>
                ) : (
                  <StatisticsDashboard entries={headacheEntries || []} isLoading={isLoading} />
                )}
              </div>
        </div>
      </PageContainer>
    </>
  );
}
