'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { Quote } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' },
];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/quotes?${params}`)
      .then(r => r.json())
      .then(data => { setQuotes(data); setLoading(false); });
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quotes</h2>
          <p className="text-sm text-slate-500 mt-0.5">{quotes.length} quote{quotes.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/quotes/new"><Button><Plus size={16} /> New Quote</Button></Link>
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
      ) : quotes.length === 0 ? (
        <Card>
          <EmptyState icon={<FileText size={28} />} title="No quotes" description="Create a quote to send to your customers." action={<Link href="/quotes/new"><Button>New Quote</Button></Link>} />
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Quote</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valid Until</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {quotes.map(q => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/quotes/${q.id}`} className="hover:text-brand-600">
                      <p className="font-medium text-slate-900">{q.title}</p>
                      <p className="text-xs text-slate-500">{q.quoteNumber}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{q.customerName}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(q.total)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(q.validUntil)}</td>
                  <td className="px-4 py-3"><Badge status={q.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
