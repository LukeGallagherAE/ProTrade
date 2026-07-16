'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobSchema, type JobInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Client { id: string; name: string; company: string | null; }
interface TeamMember { id: string; name: string; role: string; }

export function JobForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
}: {
  defaultValues?: Partial<JobInput>;
  onSubmit: (data: JobInput) => Promise<void>;
  submitLabel?: string;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients);
    fetch('/api/team').then(r => r.json()).then(setTeam);
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      status: 'PENDING',
      priority: 'MEDIUM',
      ...defaultValues,
    },
  });

  const submit = async (data: JobInput) => {
    setSubmitting(true);
    await onSubmit(data);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Job Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Job Title *</Label>
            <Input id="title" placeholder="e.g. Hot Water System Replacement" {...register('title')} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Client *</Label>
              <Select
                value={watch('clientId') ?? ''}
                onValueChange={(v) => setValue('clientId', v)}
              >
                <SelectTrigger className={errors.clientId ? 'border-red-400' : ''}>
                  <SelectValue placeholder="Select client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}{c.company ? ` (${c.company})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Job Type</Label>
              <Input placeholder="e.g. Plumbing, Electrical" {...register('jobType')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe the work to be done..." rows={3} {...register('description')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Status & Priority</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={watch('status')} onValueChange={(v) => setValue('status', v as JobInput['status'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['PENDING','SCHEDULED','IN_PROGRESS','ON_HOLD','COMPLETED','CANCELLED','INVOICED'].map(s => (
                  <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={watch('priority')} onValueChange={(v) => setValue('priority', v as JobInput['priority'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['LOW','MEDIUM','HIGH','URGENT'].map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Assigned To</Label>
            <Select
              value={watch('assignedToId') ?? 'none'}
              onValueChange={(v) => setValue('assignedToId', v === 'none' ? '' : v)}
            >
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {team.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Schedule</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="scheduledDate">Date</Label>
            <Input id="scheduledDate" type="date" {...register('scheduledDate')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scheduledTime">Time</Label>
            <Input id="scheduledTime" type="time" {...register('scheduledTime')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input id="duration" type="number" placeholder="120" {...register('duration')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Site Address</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="siteAddress">Street Address</Label>
            <Input id="siteAddress" placeholder="123 Main Street" {...register('siteAddress')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="siteCity">City</Label>
              <Input id="siteCity" placeholder="Sydney" {...register('siteCity')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="siteState">State</Label>
              <Input id="siteState" placeholder="NSW" {...register('siteState')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sitePostcode">Postcode</Label>
              <Input id="sitePostcode" placeholder="2000" {...register('sitePostcode')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="notes">Customer Notes</Label>
            <Textarea id="notes" placeholder="Notes visible to client..." rows={3} {...register('notes')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="internalNotes">Internal Notes</Label>
            <Textarea id="internalNotes" placeholder="Internal team notes..." rows={3} {...register('internalNotes')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
