'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input, { Textarea } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function NewCustomerPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    address: '', city: '', state: 'QLD', postcode: '', notes: '',
  });

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { showToast('Name is required', 'error'); return; }
    setSaving(true);
    const res = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      const c = await res.json();
      showToast('Customer created');
      router.push(`/customers/${c.id}`);
    } else {
      showToast('Failed to create customer', 'error');
      setSaving(false);
    }
  }

  const AUS_STATES = ['ACT','NSW','NT','QLD','SA','TAS','VIC','WA'].map(v => ({ value: v, label: v }));

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/customers" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-xl font-bold text-slate-900">New Customer</h2>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Contact Details</h3>
          <div className="space-y-4">
            <Input label="Full Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" required />
            <Input label="Company / Organisation" value={form.company} onChange={e => set('company', e.target.value)} placeholder="ABC Pty Ltd" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
              <Input label="Phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0400 000 000" />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Address</h3>
          <div className="space-y-4">
            <Input label="Street Address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main Street" />
            <div className="grid grid-cols-3 gap-4">
              <Input label="City / Suburb" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Brisbane" className="col-span-1" />
              <Select label="State" value={form.state} onChange={e => set('state', e.target.value)} options={AUS_STATES} />
              <Input label="Postcode" value={form.postcode} onChange={e => set('postcode', e.target.value)} placeholder="4000" />
            </div>
          </div>
        </Card>

        <Card>
          <Textarea label="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes about this customer..." rows={3} />
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/customers"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" loading={saving}>Create Customer</Button>
        </div>
      </form>
    </div>
  );
}
