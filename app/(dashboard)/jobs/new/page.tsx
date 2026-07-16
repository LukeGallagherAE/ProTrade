'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { JobForm } from '@/components/jobs/job-form';
import { toast } from '@/hooks/use-toast';
import type { JobInput } from '@/lib/validations';

export default function NewJobPage() {
  const router = useRouter();

  const handleSubmit = async (data: JobInput) => {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      toast({ title: 'Error', description: err.error?.message ?? 'Failed to create job', variant: 'destructive' });
      return;
    }

    const job = await res.json();
    toast({ title: 'Job created', description: `${job.number} has been created.` });
    router.push(`/jobs/${job.id}`);
  };

  return (
    <>
      <Header title="New Job" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <JobForm onSubmit={handleSubmit} submitLabel="Create Job" />
        </div>
      </main>
    </>
  );
}
