'use client';

import { useEffect, useState } from 'react';
import { HeadacheForm } from '@/components/headache-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageContainer } from '@/components/page-container';

export default function EditEntryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [entry, setEntry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/headaches/${params.id}`);
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
  }, [params.id, router]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Edit Headache Entry</h1>
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        ) : (
          <HeadacheForm 
            mode="edit"
            isDialog={false}
            existingEntry={entry}
            onSuccess={() => router.push('/')}
            onCancel={() => router.push('/')}
          />
        )}
      </div>
    </PageContainer>
  );
}
