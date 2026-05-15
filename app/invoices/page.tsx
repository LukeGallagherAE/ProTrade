'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Receipt } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { Invoice } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/invoices?${params}`)
      .then(r => r.json())
      .then(data => { setInvoices(data); setLoading(false); });
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Invoices</h2>
          <p className="text-sm text-slate-500 mt-0.5">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}{outstanding > 0 ? ` · ${formatCurrency(outstanding)} outstanding` : ''}</p>
        </div>
        <Link href="/invoices/new"><Button><Plus size={16} /> New Invoice</Button></Link>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === f.value ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>{f.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>
      ) : invoices.length === 0 ? (
        <Card>
          <EmptyState icon={<Receipt size={28} />} title="No invoices" description="Create invoices to bill your customers for completed work." action={<Link href="/invoices/new"><Button>New Invoice</Button></Link>} />
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/invoices/${inv.id}`} className="hover:text-brand-600">
                      <p className="font-medium text-slate-900">{inv.title}</p>
                      <p className="text-xs text-slate-500">{inv.invoiceNumber}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{inv.customerName}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3"><Badge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
