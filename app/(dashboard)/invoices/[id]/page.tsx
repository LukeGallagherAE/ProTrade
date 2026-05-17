'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatCurrency, invoiceStatusColor } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2, CheckCircle, Send } from 'lucide-react';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    const res = await fetch(`/api/invoices/${id}`);
    if (!res.ok) { router.push('/invoices'); return; }
    setInvoice(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchInvoice(); }, [id]);

  const handleStatusChange = async (status: string) => {
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast({ title: 'Invoice updated' }); fetchInvoice(); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this invoice?')) return;
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    router.push('/invoices');
  };

  if (loading) return <><Header /><div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div></>;
  if (!invoice) return null;

  const client = invoice.client as Record<string, string>;
  const items = invoice.items as Array<Record<string, unknown>>;
  const job = invoice.job as Record<string, string> | null;

  return (
    <>
      <Header title={invoice.number as string} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href="/invoices"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
              <div>
                <h2 className="text-xl font-bold">{invoice.title as string}</h2>
                <p className="text-sm text-gray-500">{invoice.number as string} &bull; {formatDate(invoice.createdAt as string)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={invoice.status as string}
                onChange={e => handleStatusChange(e.target.value)}
                className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {['DRAFT','SENT','PAID','OVERDUE','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Invoice for: <Link href={`/clients/${client.id}`} className="text-brand-600 hover:underline">{client.name}</Link></CardTitle>
                  <Badge className={`${invoiceStatusColor(invoice.status as string)} border-0`}>{invoice.status as string}</Badge>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold text-gray-600">Description</th>
                        <th className="text-right py-2 font-semibold text-gray-600">Qty</th>
                        <th className="text-right py-2 font-semibold text-gray-600">Unit Price</th>
                        <th className="text-right py-2 font-semibold text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map(item => (
                        <tr key={item.id as string}>
                          <td className="py-2 text-gray-700">{item.description as string}</td>
                          <td className="py-2 text-right text-gray-600">{item.quantity as number}</td>
                          <td className="py-2 text-right text-gray-600">{formatCurrency(item.unitPrice as number)}</td>
                          <td className="py-2 text-right font-medium">{formatCurrency(item.total as number)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4 pt-4 border-t space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal as number)}</span></div>
                    <div className="flex justify-between text-gray-600"><span>GST ({invoice.taxRate as number}%)</span><span>{formatCurrency(invoice.tax as number)}</span></div>
                    <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Total</span><span>{formatCurrency(invoice.total as number)}</span></div>
                  </div>
                </CardContent>
              </Card>

              {(invoice.notes || invoice.terms) && (
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    {invoice.notes && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes as string}</p></div>}
                    {invoice.terms && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Payment Terms</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.terms as string}</p></div>}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Client</CardTitle></CardHeader>
                <CardContent>
                  <Link href={`/clients/${client.id}`} className="font-medium text-brand-600 hover:underline text-sm">{client.name}</Link>
                  {client.email && <p className="text-xs text-gray-500 mt-1">{client.email}</p>}
                  {client.phone && <p className="text-xs text-gray-500">{client.phone}</p>}
                </CardContent>
              </Card>

              {job && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Linked Job</CardTitle></CardHeader>
                  <CardContent>
                    <Link href={`/jobs/${job.id}`} className="text-sm text-brand-600 hover:underline">{job.number}: {job.title}</Link>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6 space-y-2">
                  {invoice.dueDate && <p className="text-xs text-gray-500">Due: <span className="font-medium text-gray-700">{formatDate(invoice.dueDate as string)}</span></p>}
                  {invoice.paidDate && <p className="text-xs text-green-600">Paid: {formatDate(invoice.paidDate as string)}</p>}
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleStatusChange('SENT')}>
                    <Send className="h-4 w-4" /> Mark as Sent
                  </Button>
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('PAID')}>
                    <CheckCircle className="h-4 w-4" /> Mark as Paid
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
