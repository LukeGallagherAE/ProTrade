'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientForm } from '@/components/clients/client-form';
import { formatDate, formatCurrency, jobStatusColor, invoiceStatusColor, quoteStatusColor } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash2, ArrowLeft, Plus, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import type { ClientInput } from '@/lib/validations';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchClient = async () => {
    const res = await fetch(`/api/clients/${id}`);
    if (!res.ok) { router.push('/clients'); return; }
    setClient(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchClient(); }, [id]);

  const handleUpdate = async (data: ClientInput) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' }); return; }
    toast({ title: 'Client updated' });
    setEditing(false);
    fetchClient();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    router.push('/clients');
  };

  if (loading) return <><Header /><div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div></>;
  if (!client) return null;

  const jobs = client.jobs as Array<Record<string, unknown>>;
  const quotes = client.quotes as Array<Record<string, unknown>>;
  const invoices = client.invoices as Array<Record<string, unknown>>;

  if (editing) {
    return (
      <>
        <Header title="Edit Client" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Button variant="ghost" size="sm" className="mb-4" onClick={() => setEditing(false)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <ClientForm
              defaultValues={{
                name: client.name as string,
                email: (client.email as string) ?? '',
                phone: (client.phone as string) ?? '',
                company: (client.company as string) ?? '',
                address: (client.address as string) ?? '',
                city: (client.city as string) ?? '',
                state: (client.state as string) ?? '',
                postcode: (client.postcode as string) ?? '',
                notes: (client.notes as string) ?? '',
              }}
              onSubmit={handleUpdate}
              submitLabel="Save Changes"
            />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title={client.name as string} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href="/clients"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
              <div>
                <h2 className="text-xl font-bold">{client.name as string}</h2>
                {client.company && <p className="text-sm text-gray-500 flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{client.company as string}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/jobs/new?clientId=${id}`}>
                <Button variant="outline" size="sm"><Plus className="h-4 w-4" />New Job</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit className="h-4 w-4" />Edit</Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle className="text-sm">Contact Info</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {client.email && <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-gray-400" /><a href={`mailto:${client.email}`} className="text-brand-600 hover:underline">{client.email as string}</a></div>}
                {client.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-gray-400" /><a href={`tel:${client.phone}`} className="text-brand-600 hover:underline">{client.phone as string}</a></div>}
                {(client.address || client.city) && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{[client.address, client.city, client.state, client.postcode].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {client.notes && <div className="pt-2 border-t"><p className="text-xs text-gray-500 font-medium mb-1">Notes</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes as string}</p></div>}
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Tabs defaultValue="jobs">
                <TabsList>
                  <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
                  <TabsTrigger value="quotes">Quotes ({quotes.length})</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="mt-4">
                  <div className="space-y-2">
                    {jobs.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No jobs yet.</p>}
                    {jobs.map((job) => (
                      <Link key={job.id as string} href={`/jobs/${job.id}`}>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                          <div><p className="text-sm font-medium">{job.title as string}</p><p className="text-xs text-gray-400">{job.number as string} &bull; {formatDate(job.createdAt as string)}</p></div>
                          <Badge className={`${jobStatusColor(job.status as string)} border-0 text-xs`}>{(job.status as string).replace('_',' ')}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="quotes" className="mt-4">
                  <div className="space-y-2">
                    {quotes.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No quotes yet.</p>}
                    {quotes.map((q) => (
                      <Link key={q.id as string} href={`/quotes/${q.id}`}>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                          <div><p className="text-sm font-medium">{q.title as string}</p><p className="text-xs text-gray-400">{q.number as string} &bull; {formatDate(q.createdAt as string)}</p></div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{formatCurrency(q.total as number)}</span>
                            <Badge className={`${quoteStatusColor(q.status as string)} border-0 text-xs`}>{q.status as string}</Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="invoices" className="mt-4">
                  <div className="space-y-2">
                    {invoices.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No invoices yet.</p>}
                    {invoices.map((inv) => (
                      <Link key={inv.id as string} href={`/invoices/${inv.id}`}>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                          <div><p className="text-sm font-medium">{inv.title as string}</p><p className="text-xs text-gray-400">{inv.number as string} &bull; {formatDate(inv.createdAt as string)}</p></div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{formatCurrency(inv.total as number)}</span>
                            <Badge className={`${invoiceStatusColor(inv.status as string)} border-0 text-xs`}>{inv.status as string}</Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
