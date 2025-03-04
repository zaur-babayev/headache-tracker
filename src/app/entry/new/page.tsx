'use client';

import { HeadacheForm } from '@/components/headache-form';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/page-container';

export default function NewEntryPage() {
  const router = useRouter();
  
  return (
    <PageContainer>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Add New Headache Entry</h1>
        <HeadacheForm 
          mode="create"
          isDialog={false}
          onSuccess={() => router.push('/')}
          onCancel={() => router.push('/')}
        />
      </div>
    </PageContainer>
  );
}
