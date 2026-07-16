'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ClientForm } from '@/components/clients/client-form';
import { toast } from '@/hooks/use-toast';
import type { ClientInput } from '@/lib/validations';

export default function NewClientPage() {
  const router = useRouter();

  const handleSubmit = async (data: ClientInput) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { toast({ title: 'Error', description: 'Failed to create client', variant: 'destructive' }); return; }
    const client = await res.json();
    toast({ title: 'Client created' });
    router.push(`/clients/${client.id}`);
  };

  return (
    <>
      <Header title="New Client" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <ClientForm onSubmit={handleSubmit} submitLabel="Create Client" />
        </div>
      </main>
    </>
  );
}
