'use client';

import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/page-container';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@clerk/nextjs';
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, isToday, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MEDICATION_NAMES, TRIGGER_NAMES } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { HeadacheForm } from '@/components/headache-form';
import { Nav } from '@/components/nav';

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
  const { isLoaded: isAuthLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [headacheEntries, setHeadacheEntries] = useState<HeadacheEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('this-month');
  const [selectedEntry, setSelectedEntry] = useState<HeadacheEntry | null>(null);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const fetchHeadacheEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching headache entries, isSignedIn:', isSignedIn);
      const response = await fetch('/api/headaches', {
        credentials: 'include',
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

  // Calculate statistics
  const thisMonthEntries = headacheEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });

  const thisYearEntries = headacheEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getFullYear() === currentYear;
  });

  // Calculate top medication for this month only
  const topMedicationThisMonth = thisMonthEntries.reduce((acc, entry) => {
    entry.medications.forEach(med => {
      acc[med] = (acc[med] || 0) + 1;
    });
    return acc;
  }, {});

  const formattedTopMed = Object.entries(topMedicationThisMonth)
    .sort(([,a], [,b]) => b - a)
    .map(([med]) => MEDICATION_NAMES[med] || med)[0] || '-';

  // Calculate average severity
  const calculateAvgSeverity = (entries: HeadacheEntry[]) => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, entry) => acc + entry.severity, 0);
    return Math.round((sum / entries.length) * 10) / 10; // Round to 1 decimal place
  };

  const avgSeverity = calculateAvgSeverity(thisMonthEntries);
  
  // Get entries based on active tab
  const getActiveEntries = () => {
    switch (activeTab) {
      case 'this-month':
        return thisMonthEntries;
      case 'this-year':
        return thisYearEntries;
      case 'all-entries':
        return headacheEntries;
      default:
        return thisMonthEntries;
    }
  };

  const activeEntries = getActiveEntries();

  // Helper function to get severity color (blue shades)
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return 'bg-white';
      case 2: return 'bg-blue-200';
      case 3: return 'bg-blue-400';
      case 4: return 'bg-blue-600';
      case 5: return 'bg-blue-800';
      default: return 'bg-gray-300';
    }
  };

  // Helper function to render severity circles
  const renderSeverityCircles = (severity: number) => {
    const circles = [];
    for (let i = 1; i <= 5; i++) {
      circles.push(
        <div 
          key={i} 
          className={`w-5 h-5 rounded-full ${i <= severity ? getSeverityColor(i) : ''}`}
        />
      );
    }
    return (
      <div className="flex space-x-2">
        {circles}
      </div>
    );
  };

  const handleCardClick = (entry: HeadacheEntry) => {
    setSelectedEntry(entry);
  };

  const handleEditSuccess = () => {
    setSelectedEntry(null);
    fetchHeadacheEntries(); // Refresh the entries list
  };

  const handleDelete = async (entryId: string) => {
    try {
      const response = await fetch(`/api/headaches/${entryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      toast.success('Entry deleted successfully');
      setSelectedEntry(null);
      fetchHeadacheEntries(); // Refresh the list
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

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
    <>
      <Nav onRefresh={fetchHeadacheEntries} />
      <PageContainer>
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
          ) : (
            <div className="space-y-8">
              {/* Stats Section */}
              <div className="space-y-1 mt-16 px-4">
                <h1 className="text-5xl font-regular">
                  {thisMonthEntries.length}
                </h1>
                <p className="text-muted-foreground text-sm">headaches this month ({format(currentDate, 'MMMM')})</p>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div>
                    <p className="text-xl font-regular overflow-hidden text-ellipsis">{thisMonthEntries.reduce((acc, entry) => acc + entry.medications.length, 0)}</p>
                    <p className="text-muted-foreground text-xs">meds. taken</p>
                  </div>
                  <div>
                    <p className="text-xl font-regular overflow-hidden text-ellipsis">L{avgSeverity}</p>
                    <p className="text-muted-foreground text-xs">average sev.</p>
                  </div>
                  <div>
                    <p className="text-xl font-regular overflow-hidden text-ellipsis">{formattedTopMed}</p>
                    <p className="text-muted-foreground text-xs">top meds.</p>
                  </div>
                </div>
              </div>
              
              {/* Tabs for time periods */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 bg-transparent rounded-none mt-32">
                  <TabsTrigger 
                    value="this-month" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none cursor-pointer relative"
                  >
                    This month
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 data-[state=active]:opacity-100" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="this-year" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none cursor-pointer relative"
                  >
                    This year
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 data-[state=active]:opacity-100" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="all-entries" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none cursor-pointer relative"
                  >
                    All Entries
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 data-[state=active]:opacity-100" />
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-0 space-y-4">
                  {activeEntries.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <p className="text-muted-foreground text-sm">No headache entries for this period.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {activeEntries.map((entry) => {
                        const entryDate = new Date(entry.date);
                        const isYesterday = 
                          entryDate.getDate() === currentDate.getDate() - 1 && 
                          entryDate.getMonth() === currentDate.getMonth() && 
                          entryDate.getFullYear() === currentDate.getFullYear();
                        
                        return (
                          <Card 
                            key={entry.id} 
                            className="overflow-hidden bg-[#161616] border-[#161616] rounded-xl cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                            onClick={() => handleCardClick(entry)}
                          >
                            <CardContent className="px-4 space-y-2">
                              <p className="text-muted-foreground text-xs">
                                {isYesterday ? 'Yesterday' : format(entryDate, 'MMMM d, yyyy')}
                              </p>
                              
                              {renderSeverityCircles(entry.severity)}
                              
                              {entry.medications && entry.medications.length > 0 && (
                                <div className="space-y-1 mt-12">
                                  <p className="text-sm font-normal">
                                    {entry.medications.map(med => 
                                      med ? (MEDICATION_NAMES[med] || med) : ''
                                    ).filter(Boolean).join(', ')}
                                  </p>
                                  <p className="text-muted-foreground text-xs">meds.</p>
                                </div>
                              )}
                              
                              {entry.triggers && entry.triggers.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-sm font-normal">
                                    {entry.triggers[0] ? (TRIGGER_NAMES[entry.triggers[0]] || entry.triggers[0]) : ''}
                                  </p>
                                  <p className="text-muted-foreground text-xs">trigger</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
        {/* Edit Entry Form */}
        {selectedEntry && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md border relative">
              <div className="p-4">
                <HeadacheForm
                  mode="edit"
                  initialValues={selectedEntry}
                  existingEntry={selectedEntry}
                  onSuccess={() => {
                    setSelectedEntry(null);
                    fetchHeadacheEntries();
                  }}
                  onCancel={() => setSelectedEntry(null)}
                  onDelete={() => {
                    handleDelete(selectedEntry.id);
                    setSelectedEntry(null);
                  }}
                  isDialog={false}
                />
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </>
  );
}
