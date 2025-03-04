'use client';

import { useEffect, useState } from 'react';
import { HeadacheForm } from '@/components/headache-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageContainer } from '@/components/page-container';

interface EntryFormPageProps {
  mode: 'create' | 'edit';
  entryId?: string;
}

export function EntryFormPage({ mode, entryId }: EntryFormPageProps) {
  const router = useRouter();
  const [entry, setEntry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(mode === 'edit');

  useEffect(() => {
    const fetchEntry = async () => {
      if (mode !== 'edit' || !entryId) return;
      
      try {
        const response = await fetch(`/api/headaches/${entryId}`);
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
  }, [entryId, mode, router]);

  const title = mode === 'create' ? 'Add New Headache Entry' : 'Edit Headache Entry';

  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-base font-semibold">{title}</h1>
        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-[100px] bg-card animate-pulse rounded" />
                <div className="h-10 bg-card animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-[120px] bg-card animate-pulse rounded" />
                <div className="h-32 bg-card animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-[140px] bg-card animate-pulse rounded" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-10 bg-card animate-pulse rounded" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-[160px] bg-card animate-pulse rounded" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-10 bg-card animate-pulse rounded" />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-card animate-pulse rounded" />
              <div className="h-10 w-24 bg-card animate-pulse rounded" />
            </div>
          </div>
        ) : (
          <HeadacheForm 
            mode={mode}
            existingEntry={entry}
            onSuccess={() => {
              toast.success(mode === 'create' ? 'Entry added successfully' : 'Entry updated successfully');
              router.push('/');
            }}
            onCancel={() => router.push('/')}
          />
        )}
      </div>
    </PageContainer>
  );
}
