'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input, { Textarea } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Customer, TeamMember } from '@/lib/types';
import { todayISO } from '@/lib/utils';

export default function NewJobPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', customerId: '', customerName: '',
    jobType: '', status: 'pending', priority: 'medium',
    scheduledDate: todayISO(), scheduledTime: '08:00',
    address: '', notes: '', assignedTo: [] as string[],
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/team').then(r => r.json()),
    ]).then(([c, t]) => { setCustomers(c); setTeam(t); });
  }, []);

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === 'customerId') {
      const c = customers.find(x => x.id === value);
      if (c) setForm(prev => ({ ...prev, customerId: value, customerName: c.name, address: [c.address, c.city, c.state, c.postcode].filter(Boolean).join(', ') }));
    }
  }

  function toggleAssigned(id: string) {
    setForm(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(id)
        ? prev.assignedTo.filter(x => x !== id)
        : [...prev.assignedTo, id],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.customerId) { showToast('Title and customer are required', 'error'); return; }
    setSaving(true);
    const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      const job = await res.json();
      showToast('Job created successfully');
      router.push(`/jobs/${job.id}`);
    } else {
      showToast('Failed to create job', 'error');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/jobs" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-xl font-bold text-slate-900">New Job</h2>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Job Details</h3>
          <div className="space-y-4">
            <Input label="Job Title *" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Hot Water System Replacement" required />
            <Textarea label="Description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the work to be done..." rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Job Type"
                value={form.jobType}
                onChange={e => set('jobType', e.target.value)}
                placeholder="Select type"
                options={['Electrical','Plumbing','HVAC','Carpentry','Painting','Tiling','Roofing','General','Other'].map(v => ({ value: v, label: v }))}
              />
              <Select
                label="Priority"
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
                options={[{value:'low',label:'Low'},{value:'medium',label:'Medium'},{value:'high',label:'High'},{value:'urgent',label:'Urgent'}]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Scheduled Date" type="date" value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)} />
              <Input label="Scheduled Time" type="time" value={form.scheduledTime} onChange={e => set('scheduledTime', e.target.value)} />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Customer & Location</h3>
          <div className="space-y-4">
            <Select
              label="Customer *"
              value={form.customerId}
              onChange={e => set('customerId', e.target.value)}
              placeholder="Select customer"
              options={customers.map(c => ({ value: c.id, label: c.name + (c.company ? ` (${c.company})` : '') }))}
            />
            <Input label="Job Address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Assign Team Members</h3>
          <div className="grid grid-cols-2 gap-2">
            {team.filter(m => m.status === 'active').map(m => (
              <label key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                form.assignedTo.includes(m.id) ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <input type="checkbox" className="accent-brand-600" checked={form.assignedTo.includes(m.id)} onChange={() => toggleAssigned(m.id)} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.trade}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <Textarea label="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes about this job..." rows={3} />
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/jobs"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" loading={saving}>Create Job</Button>
        </div>
      </form>
    </div>
  );
}
