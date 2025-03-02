'use client';

import { useState, useEffect } from 'react';
import { Nav } from '@/components/nav';
import { HeadacheCalendar } from '@/components/headache-calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function CalendarPage() {
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
      
      <main className="flex-1 container py-8 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Calendar View</h1>
          <p className="text-muted-foreground mt-1">
            Track your headache patterns over time
          </p>
        </div>
        
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Headache Calendar</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              View your headache entries by date
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <p className="text-muted-foreground text-sm">No headache entries yet. Add entries from the Dashboard to see them on the calendar.</p>
              </div>
            ) : (
              <HeadacheCalendar entries={headacheEntries} />
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Calendar Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">Severe (Level 5)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-sm">Moderate-Severe (Level 4)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm">Moderate (Level 3)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Mild-Moderate (Level 2)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Mild (Level 1)</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 shadow-sm md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Calendar Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Click on a date with a headache to view details</li>
                <li>Use the month navigation to explore patterns over time</li>
                <li>Color intensity indicates headache severity</li>
                <li>Add new entries from the Dashboard page</li>
                <li>Identify patterns by viewing the calendar over multiple months</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
