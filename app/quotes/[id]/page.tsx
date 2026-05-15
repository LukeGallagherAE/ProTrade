'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Quote } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/quotes/${id}`).then(r => r.json()).then(q => { setQuote(q); setLoading(false); });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(status: string) {
    setUpdatingStatus(true);
    const res = await fetch(`/api/quotes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) { const updated = await res.json(); setQuote(updated); showToast('Status updated'); }
    setUpdatingStatus(false);
  }

  async function del() {
    if (!confirm('Delete this quote?')) return;
    const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Quote deleted'); router.push('/quotes'); }
    else showToast('Failed to delete', 'error');
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;
  if (!quote || (quote as { error?: string }).error) return <div className="text-center py-16 text-slate-500">Quote not found.</div>;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/quotes" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"><ArrowLeft size={18} /></Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{quote.title}</h2>
            <p className="text-sm text-slate-500">{quote.quoteNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="danger" size="sm" onClick={del}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Customer</p>
                <p className="font-semibold text-slate-900">{quote.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Valid Until</p>
                <p className="font-medium text-slate-900">{formatDate(quote.validUntil)}</p>
              </div>
            </div>
            {quote.description && <p className="text-sm text-slate-600 mb-6">{quote.description}</p>}

            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-xs font-semibold text-slate-500">Description</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500">Qty</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500">Unit Price</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {quote.lineItems.map(item => (
                  <tr key={item.id}>
                    <td className="py-2.5 text-slate-700">{item.description}</td>
                    <td className="py-2.5 text-right text-slate-600">{item.quantity} {item.unit}</td>
                    <td className="py-2.5 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2.5 text-right font-medium text-slate-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-slate-200 pt-4 flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(quote.subtotal)}</span></div>
                <div className="flex justify-between text-slate-600"><span>GST ({quote.taxRate}%)</span><span>{formatCurrency(quote.tax)}</span></div>
                <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-2"><span>Total</span><span>{formatCurrency(quote.total)}</span></div>
              </div>
            </div>

            {quote.notes && <div className="mt-6 pt-4 border-t border-slate-100"><p className="text-xs font-semibold text-slate-500 uppercase mb-1">Notes</p><p className="text-sm text-slate-600">{quote.notes}</p></div>}
            {quote.terms && <div className="mt-3"><p className="text-xs font-semibold text-slate-500 uppercase mb-1">Terms</p><p className="text-sm text-slate-600">{quote.terms}</p></div>}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="mb-3"><p className="text-sm font-semibold text-slate-700 mb-1">Status</p><Badge status={quote.status} /></div>
            <div className="space-y-1.5">
              {(['draft','sent','accepted','declined','expired'] as const).map(s => (
                <button key={s} onClick={() => updateStatus(s)} disabled={updatingStatus || quote.status === s}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quote.status === s ? 'bg-brand-600 text-white cursor-default' : 'hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 mb-2">Created</p>
            <p className="text-sm font-medium text-slate-900">{formatDate(quote.createdAt)}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
