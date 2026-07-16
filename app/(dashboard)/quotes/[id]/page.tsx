'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatCurrency, quoteStatusColor } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2, Mail } from 'lucide-react';

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quote, setQuote] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuote = async () => {
    const res = await fetch(`/api/quotes/${id}`);
    if (!res.ok) { router.push('/quotes'); return; }
    setQuote(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchQuote(); }, [id]);

  const handleStatusChange = async (status: string) => {
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast({ title: 'Status updated' }); fetchQuote(); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this quote?')) return;
    await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
    router.push('/quotes');
  };

  if (loading) return <><Header /><div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div></>;
  if (!quote) return null;

  const client = quote.client as Record<string, string>;
  const items = quote.items as Array<Record<string, unknown>>;

  return (
    <>
      <Header title={quote.number as string} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href="/quotes"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
              <div>
                <h2 className="text-xl font-bold">{quote.title as string}</h2>
                <p className="text-sm text-gray-500">{quote.number as string} &bull; {formatDate(quote.createdAt as string)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={quote.status as string}
                onChange={e => handleStatusChange(e.target.value)}
                className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {['DRAFT','SENT','ACCEPTED','DECLINED','EXPIRED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Quote for: <Link href={`/clients/${client.id}`} className="text-brand-600 hover:underline">{client.name}</Link></CardTitle>
                  <Badge className={`${quoteStatusColor(quote.status as string)} border-0`}>{quote.status as string}</Badge>
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
                      {items.map((item) => (
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
                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(quote.subtotal as number)}</span></div>
                    <div className="flex justify-between text-gray-600"><span>GST ({quote.taxRate as number}%)</span><span>{formatCurrency(quote.tax as number)}</span></div>
                    <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Total</span><span>{formatCurrency(quote.total as number)}</span></div>
                  </div>
                </CardContent>
              </Card>

              {(quote.notes || quote.terms) && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {quote.notes && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes as string}</p></div>}
                    {quote.terms && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Terms</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.terms as string}</p></div>}
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
              <Card>
                <CardContent className="pt-6 space-y-2">
                  {quote.validUntil && <p className="text-xs text-gray-500">Valid until: <span className="font-medium text-gray-700">{formatDate(quote.validUntil as string)}</span></p>}
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleStatusChange('SENT')}>
                    <Mail className="h-4 w-4" /> Mark as Sent
                  </Button>
                  <Link href={`/invoices/new?quoteId=${id}`} className="block">
                    <Button size="sm" className="w-full">Convert to Invoice</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
