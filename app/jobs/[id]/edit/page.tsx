'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input, { Textarea } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Customer, Job, TeamMember } from '@/lib/types';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [form, setForm] = useState<Partial<Job> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/jobs/${id}`).then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/team').then(r => r.json()),
    ]).then(([job, c, t]) => {
      setForm(job);
      setCustomers(c);
      setTeam(t);
    });
  }, [id]);

  function set(key: string, value: string) {
    setForm(prev => prev ? { ...prev, [key]: value } : prev);
    if (key === 'customerId') {
      const c = customers.find(x => x.id === value);
      if (c) setForm(prev => prev ? { ...prev, customerId: value, customerName: c.name, address: [c.address, c.city, c.state, c.postcode].filter(Boolean).join(', ') } : prev);
    }
  }

  function toggleAssigned(mid: string) {
    setForm(prev => {
      if (!prev) return prev;
      const current = prev.assignedTo || [];
      return { ...prev, assignedTo: current.includes(mid) ? current.filter(x => x !== mid) : [...current, mid] };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    const res = await fetch(`/api/jobs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { showToast('Job updated'); router.push(`/jobs/${id}`); }
    else { showToast('Failed to update job', 'error'); setSaving(false); }
  }

  if (!form) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/jobs/${id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Edit Job</h2>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Job Details</h3>
          <div className="space-y-4">
            <Input label="Job Title *" value={form.title || ''} onChange={e => set('title', e.target.value)} required />
            <Textarea label="Description" value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Status" value={form.status || 'pending'} onChange={e => set('status', e.target.value)}
                options={[{value:'pending',label:'Pending'},{value:'scheduled',label:'Scheduled'},{value:'in_progress',label:'In Progress'},{value:'completed',label:'Completed'},{value:'invoiced',label:'Invoiced'},{value:'cancelled',label:'Cancelled'}]}
              />
              <Select label="Priority" value={form.priority || 'medium'} onChange={e => set('priority', e.target.value)}
                options={[{value:'low',label:'Low'},{value:'medium',label:'Medium'},{value:'high',label:'High'},{value:'urgent',label:'Urgent'}]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Job Type" value={form.jobType || ''} onChange={e => set('jobType', e.target.value)}
                placeholder="Select type"
                options={['Electrical','Plumbing','HVAC','Carpentry','Painting','Tiling','Roofing','General','Other'].map(v => ({ value: v, label: v }))}
              />
              <Input label="Scheduled Date" type="date" value={form.scheduledDate || ''} onChange={e => set('scheduledDate', e.target.value)} />
            </div>
            <Input label="Scheduled Time" type="time" value={form.scheduledTime || ''} onChange={e => set('scheduledTime', e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Customer & Location</h3>
          <div className="space-y-4">
            <Select label="Customer" value={form.customerId || ''} onChange={e => set('customerId', e.target.value)}
              placeholder="Select customer"
              options={customers.map(c => ({ value: c.id, label: c.name }))}
            />
            <Input label="Job Address" value={form.address || ''} onChange={e => set('address', e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Assign Team Members</h3>
          <div className="grid grid-cols-2 gap-2">
            {team.filter(m => m.status === 'active').map(m => (
              <label key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                (form.assignedTo || []).includes(m.id) ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <input type="checkbox" className="accent-brand-600" checked={(form.assignedTo || []).includes(m.id)} onChange={() => toggleAssigned(m.id)} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.trade}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <Textarea label="Notes" value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={3} />
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href={`/jobs/${id}`}><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
