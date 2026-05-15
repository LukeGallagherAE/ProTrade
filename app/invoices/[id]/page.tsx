'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Invoice } from '@/lib/types';
import { formatCurrency, formatDate, todayISO } from '@/lib/utils';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/invoices/${id}`).then(r => r.json()).then(i => { setInvoice(i); setLoading(false); });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(status: string) {
    setUpdating(true);
    const updates: Partial<Invoice> = { status: status as Invoice['status'] };
    if (status === 'paid') updates.paidDate = todayISO();
    const res = await fetch(`/api/invoices/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (res.ok) { const updated = await res.json(); setInvoice(updated); showToast('Status updated'); }
    setUpdating(false);
  }

  async function del() {
    if (!confirm('Delete this invoice?')) return;
    const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Invoice deleted'); router.push('/invoices'); }
    else showToast('Failed to delete', 'error');
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;
  if (!invoice || (invoice as { error?: string }).error) return <div className="text-center py-16 text-slate-500">Invoice not found.</div>;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/invoices" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"><ArrowLeft size={18} /></Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{invoice.title}</h2>
            <p className="text-sm text-slate-500">{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {invoice.status !== 'paid' && (
            <Button size="sm" onClick={() => updateStatus('paid')} loading={updating}>
              <CheckCircle size={14} /> Mark Paid
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={del}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Billed To</p>
                <p className="font-semibold text-slate-900">{invoice.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-0.5">Due Date</p>
                <p className="font-medium text-slate-900">{formatDate(invoice.dueDate)}</p>
                {invoice.paidDate && <p className="text-xs text-green-600 mt-0.5">Paid {formatDate(invoice.paidDate)}</p>}
              </div>
            </div>

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
                {invoice.lineItems.map(item => (
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
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
                <div className="flex justify-between text-slate-600"><span>GST ({invoice.taxRate}%)</span><span>{formatCurrency(invoice.tax)}</span></div>
                <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-2"><span>Total</span><span>{formatCurrency(invoice.total)}</span></div>
              </div>
            </div>

            {invoice.notes && <div className="mt-6 pt-4 border-t border-slate-100"><p className="text-xs font-semibold text-slate-500 uppercase mb-1">Notes</p><p className="text-sm text-slate-600">{invoice.notes}</p></div>}
            {invoice.terms && <div className="mt-3"><p className="text-xs font-semibold text-slate-500 uppercase mb-1">Terms</p><p className="text-sm text-slate-600">{invoice.terms}</p></div>}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="mb-3"><p className="text-sm font-semibold text-slate-700 mb-2">Status</p><Badge status={invoice.status} /></div>
            <div className="space-y-1.5">
              {(['draft','sent','paid','overdue','cancelled'] as const).map(s => (
                <button key={s} onClick={() => updateStatus(s)} disabled={updating || invoice.status === s}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    invoice.status === s ? 'bg-brand-600 text-white cursor-default' : 'hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 mb-1">Issued</p>
            <p className="text-sm font-medium text-slate-900">{formatDate(invoice.createdAt)}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
