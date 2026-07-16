'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineItemsEditor } from '@/components/shared/line-items-editor';
import { invoiceSchema, type InvoiceInput } from '@/lib/validations';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Client { id: string; name: string; company: string | null; }

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetch('/api/clients').then(r => r.json()).then(setClients); }, []);

  const methods = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      status: 'DRAFT',
      taxRate: 10,
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = methods;

  const onSubmit = async (data: InvoiceInput) => {
    setSubmitting(true);
    const jobId = searchParams.get('jobId');
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, ...(jobId ? { jobId } : {}) }),
    });
    setSubmitting(false);
    if (!res.ok) { toast({ title: 'Error', description: 'Failed to create invoice', variant: 'destructive' }); return; }
    const inv = await res.json();
    toast({ title: 'Invoice created', description: inv.number });
    router.push(`/invoices/${inv.id}`);
  };

  return (
    <>
      <Header title="New Invoice" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Invoice Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Title *</Label>
                      <Input placeholder="e.g. Plumbing works - Feb 2024" {...register('title')} />
                      {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Client *</Label>
                      <Select value={watch('clientId') ?? ''} onValueChange={v => setValue('clientId', v)}>
                        <SelectTrigger className={errors.clientId ? 'border-red-400' : ''}>
                          <SelectValue placeholder="Select client..." />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select value={watch('status')} onValueChange={v => setValue('status', v as InvoiceInput['status'])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['DRAFT','SENT','PAID','OVERDUE','CANCELLED'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Due Date</Label>
                      <Input type="date" {...register('dueDate')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>GST Rate (%)</Label>
                      <Input type="number" step="0.1" {...register('taxRate')} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
                <CardContent>
                  <LineItemsEditor />
                  {errors.items && <p className="text-xs text-red-500 mt-2">{errors.items.message ?? errors.items.root?.message}</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Textarea placeholder="Any notes for the client..." rows={3} {...register('notes')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Payment Terms</Label>
                    <Textarea placeholder="e.g. Payment due within 14 days of invoice date." rows={2} {...register('terms')} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </main>
    </>
  );
}
