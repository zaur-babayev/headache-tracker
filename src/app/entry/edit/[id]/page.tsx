'use client';

import { useEffect, useState } from 'react';
import { HeadacheForm } from '@/components/headache-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageContainer } from '@/components/page-container';
import { use } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [entry, setEntry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/headaches/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch entry');
        }
        const data = await response.json();
        setEntry(data);
      } catch (error) {
        console.error('Error fetching entry:', error);
        toast.error('Failed to load headache entry');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [resolvedParams.id, router]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-base font-semibold">Edit Headache Entry</h1>
        <div className="relative">
          {/* Skeleton */}
          <div className={cn(
            "transition-opacity duration-300",
            isLoading 
              ? "opacity-100"
              : "opacity-0 absolute inset-0 pointer-events-none"
          )}>
            <div className="space-y-4 p-1">
              {/* Date field */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Date button */}
              </div>

              {/* Severity field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" /> {/* Label */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-8" /> {/* "Mild" text */}
                    <Skeleton className="h-3 w-12" /> {/* "Severe" text */}
                  </div>
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-10 rounded-full" /> /* Severity buttons */
                    ))}
                  </div>
                </div>
              </div>

              {/* Triggers field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" /> {/* Label */}
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" /> /* Trigger checkboxes */
                  ))}
                </div>
              </div>

              {/* Medications field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" /> {/* Label */}
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" /> /* Medication checkboxes */
                  ))}
                </div>
              </div>

              {/* Notes field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" /> {/* Label */}
                <Skeleton className="h-24 w-full" /> {/* Textarea */}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-2">
                <Skeleton className="h-10 w-20" /> {/* Cancel button */}
                <Skeleton className="h-10 w-20" /> {/* Save button */}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className={cn(
            "transition-opacity duration-300",
            isLoading 
              ? "opacity-0"
              : "opacity-100"
          )}>
            <HeadacheForm 
              mode="edit"
              existingEntry={entry}
              onSuccess={() => router.push('/')}
              onCancel={() => router.push('/')}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
