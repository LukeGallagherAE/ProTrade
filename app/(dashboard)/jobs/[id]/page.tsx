'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, formatCurrency, jobStatusColor, priorityColor } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash2, MapPin, User, Calendar, Clock, FileText, Receipt, ArrowLeft } from 'lucide-react';
import { JobForm } from '@/components/jobs/job-form';
import type { JobInput } from '@/lib/validations';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchJob = async () => {
    const res = await fetch(`/api/jobs/${id}`);
    if (!res.ok) { router.push('/jobs'); return; }
    setJob(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchJob(); }, [id]);

  const handleUpdate = async (data: JobInput) => {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { toast({ title: 'Error', description: 'Failed to update job', variant: 'destructive' }); return; }
    toast({ title: 'Job updated' });
    setEditing(false);
    fetchJob();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    router.push('/jobs');
  };

  const handleStatusChange = async (status: string) => {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast({ title: 'Status updated' }); fetchJob(); }
  };

  if (loading) return <><Header /><div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div></>;
  if (!job) return null;

  const client = job.client as Record<string, string>;
  const assignedTo = job.assignedTo as Record<string, string> | null;
  const invoice = job.invoice as Record<string, unknown> | null;
  const activities = job.activities as Array<Record<string, unknown>>;

  if (editing) {
    return (
      <>
        <Header title="Edit Job" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" size="sm" className="mb-4" onClick={() => setEditing(false)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <JobForm
              defaultValues={{
                title: job.title as string,
                description: (job.description as string) ?? '',
                status: job.status as JobInput['status'],
                priority: job.priority as JobInput['priority'],
                jobType: (job.jobType as string) ?? '',
                clientId: (job.clientId as string),
                assignedToId: (job.assignedToId as string) ?? '',
                scheduledDate: job.scheduledDate ? new Date(job.scheduledDate as string).toISOString().split('T')[0] : '',
                scheduledTime: (job.scheduledTime as string) ?? '',
                duration: (job.duration as number) ?? undefined,
                siteAddress: (job.siteAddress as string) ?? '',
                siteCity: (job.siteCity as string) ?? '',
                siteState: (job.siteState as string) ?? '',
                sitePostcode: (job.sitePostcode as string) ?? '',
                notes: (job.notes as string) ?? '',
                internalNotes: (job.internalNotes as string) ?? '',
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
      <Header title={job.number as string} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href="/jobs"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{job.title as string}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{job.number as string} &bull; Created {formatDate(job.createdAt as string)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={job.status as string}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {['PENDING','SCHEDULED','IN_PROGRESS','ON_HOLD','COMPLETED','CANCELLED','INVOICED'].map(s => (
                  <option key={s} value={s}>{s.replace('_',' ')}</option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={`${jobStatusColor(job.status as string)} border-0`}>{(job.status as string).replace('_',' ')}</Badge>
            <Badge className={`${priorityColor(job.priority as string)} border-0`}>{job.priority as string}</Badge>
            {job.jobType && <Badge variant="outline">{job.jobType as string}</Badge>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  {job.description && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Description</CardTitle></CardHeader>
                      <CardContent><p className="text-sm text-gray-700 whitespace-pre-wrap">{job.description as string}</p></CardContent>
                    </Card>
                  )}
                  {(job.siteAddress || job.siteCity) && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" />Site Address</CardTitle></CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          {[job.siteAddress, job.siteCity, job.siteState, job.sitePostcode].filter(Boolean).join(', ')}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  {job.scheduledDate && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" />Scheduled</CardTitle></CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">
                          {formatDate(job.scheduledDate as string)}
                          {job.scheduledTime ? ` at ${job.scheduledTime}` : ''}
                          {job.duration ? ` (${job.duration} min)` : ''}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="notes" className="space-y-4 mt-4">
                  {job.notes && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
                      <CardContent><p className="text-sm text-gray-700 whitespace-pre-wrap">{job.notes as string}</p></CardContent>
                    </Card>
                  )}
                  {job.internalNotes && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Internal Notes</CardTitle></CardHeader>
                      <CardContent><p className="text-sm text-gray-700 whitespace-pre-wrap">{job.internalNotes as string}</p></CardContent>
                    </Card>
                  )}
                  {!job.notes && !job.internalNotes && (
                    <p className="text-sm text-gray-500 text-center py-8">No notes added yet.</p>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  {activities?.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No activity recorded.</p>}
                  <div className="space-y-2">
                    {activities?.map((a) => (
                      <div key={a.id as string} className="flex items-start gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                        <div>
                          <span className="font-medium">{(a.user as Record<string, string>).name}</span>
                          {' '}{a.message as string}
                          <span className="text-gray-400 text-xs ml-2">{formatDate(a.createdAt as string)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Client</CardTitle></CardHeader>
                <CardContent>
                  <Link href={`/clients/${client.id}`} className="font-medium text-brand-600 hover:underline text-sm">{client.name}</Link>
                  {client.company && <p className="text-xs text-gray-500 mt-0.5">{client.company}</p>}
                  {client.phone && <p className="text-xs text-gray-500 mt-1">{client.phone}</p>}
                  {client.email && <p className="text-xs text-gray-500">{client.email}</p>}
                </CardContent>
              </Card>

              {assignedTo && (
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" />Assigned To</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">{assignedTo.name}</p>
                    {assignedTo.phone && <p className="text-xs text-gray-500 mt-0.5">{assignedTo.phone}</p>}
                  </CardContent>
                </Card>
              )}

              {invoice ? (
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Receipt className="h-4 w-4" />Invoice</CardTitle></CardHeader>
                  <CardContent>
                    <Link href={`/invoices/${invoice.id}`} className="text-sm text-brand-600 hover:underline font-medium">
                      {invoice.number as string}
                    </Link>
                    <p className="text-sm font-bold mt-1">{formatCurrency(invoice.total as number)}</p>
                    <Badge className="mt-2 text-xs" variant="outline">{invoice.status as string}</Badge>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <Link href={`/invoices/new?jobId=${id}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        <Receipt className="h-4 w-4" /> Create Invoice
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6">
                  <Link href={`/quotes/new?jobId=${id}`}>
                    <Button variant="outline" className="w-full" size="sm">
                      <FileText className="h-4 w-4" /> Create Quote
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
