'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input, { Textarea } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Customer, LineItem } from '@/lib/types';
import { calcSubtotal, calcTax, round2, todayISO, addDays, formatCurrency } from '@/lib/utils';

function newItem(): LineItem {
  return { id: Math.random().toString(36).slice(2), description: '', quantity: 1, unit: 'ea', unitPrice: 0, total: 0 };
}

export default function NewQuotePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({
    customerId: '', customerName: '', title: '', description: '',
    taxRate: 10, validUntil: addDays(todayISO(), 30),
    notes: '', terms: 'Payment due within 14 days of invoice.',
  });
  const [items, setItems] = useState<LineItem[]>([newItem()]);

  useEffect(() => { fetch('/api/customers').then(r => r.json()).then(setCustomers); }, []);

  function setField(k: string, v: string | number) {
    setForm(p => ({ ...p, [k]: v }));
    if (k === 'customerId') {
      const c = customers.find(x => x.id === v);
      if (c) setForm(p => ({ ...p, customerId: v as string, customerName: c.name }));
    }
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.total = round2(Number(updated.quantity) * Number(updated.unitPrice));
      }
      return updated;
    }));
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const subtotal = calcSubtotal(items);
  const tax = calcTax(subtotal, form.taxRate);
  const total = round2(subtotal + tax);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId || !form.title) { showToast('Customer and title are required', 'error'); return; }
    setSaving(true);
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, lineItems: items, subtotal, tax, total }),
    });
    if (res.ok) { const q = await res.json(); showToast('Quote created'); router.push(`/quotes/${q.id}`); }
    else { showToast('Failed to create quote', 'error'); setSaving(false); }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/quotes" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"><ArrowLeft size={18} /></Link>
        <h2 className="text-xl font-bold text-slate-900">New Quote</h2>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Quote Details</h3>
          <div className="space-y-4">
            <Input label="Quote Title *" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. Electrical Fitout" required />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Customer *" value={form.customerId} onChange={e => setField('customerId', e.target.value)}
                placeholder="Select customer"
                options={customers.map(c => ({ value: c.id, label: c.name + (c.company ? ` (${c.company})` : '') }))}
              />
              <Input label="Valid Until" type="date" value={form.validUntil} onChange={e => setField('validUntil', e.target.value)} />
            </div>
            <Textarea label="Description" value={form.description} onChange={e => setField('description', e.target.value)} rows={2} placeholder="Brief description of work" />
          </div>
        </Card>

        <Card padding={false}>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Line Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => setItems(p => [...p, newItem()])}>
              <Plus size={14} /> Add Item
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Description</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 w-20">Qty</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 w-20">Unit</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 w-28">Unit Price</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 w-28">Total</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-2">
                      <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                        className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                        placeholder="Item description" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" min="0" step="0.01" value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
                    </td>
                    <td className="px-4 py-2">
                      <input value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)}
                        className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" min="0" step="0.01" value={item.unitPrice}
                        onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
                    </td>
                    <td className="px-4 py-2 font-medium text-slate-700">{formatCurrency(item.total)}</td>
                    <td className="px-2 py-2">
                      <button type="button" onClick={() => removeItem(item.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between items-center text-slate-600">
                <span>GST</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={form.taxRate} onChange={e => setField('taxRate', parseFloat(e.target.value) || 0)}
                    className="w-14 rounded border border-slate-200 px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  <span className="text-xs">% = {formatCurrency(tax)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <Textarea label="Notes" value={form.notes} onChange={e => setField('notes', e.target.value)} rows={2} placeholder="Additional notes for the customer..." />
            <Textarea label="Terms & Conditions" value={form.terms} onChange={e => setField('terms', e.target.value)} rows={2} />
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/quotes"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" loading={saving}>Create Quote</Button>
        </div>
      </form>
    </div>
  );
}
