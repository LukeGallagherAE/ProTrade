'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, formatCurrency, invoiceStatusColor } from '@/lib/utils';
import { Plus, Search, Receipt } from 'lucide-react';

interface Invoice {
  id: string; number: string; title: string; status: string;
  client: { id: string; name: string }; total: number;
  dueDate: string | null; createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'ALL') params.set('status', status);
    const res = await fetch(`/api/invoices?${params}`);
    let data: Invoice[] = await res.json();
    if (search) data = data.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.number.includes(search) || i.client.name.toLowerCase().includes(search.toLowerCase()));
    setInvoices(data);
    setLoading(false);
  }, [status, search]);

  useEffect(() => { const t = setTimeout(fetchInvoices, 300); return () => clearTimeout(t); }, [fetchInvoices]);

  const totalOutstanding = invoices.filter(i => ['SENT','OVERDUE'].includes(i.status)).reduce((s, i) => s + i.total, 0);

  return (
    <>
      <Header title="Invoices" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {totalOutstanding > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-800">
              <span className="font-semibold">{formatCurrency(totalOutstanding)}</span> outstanding across {invoices.filter(i => ['SENT','OVERDUE'].includes(i.status)).length} invoice(s)
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search invoices..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['ALL','DRAFT','SENT','PAID','OVERDUE','CANCELLED'].map(s => (
                    <SelectItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link href="/invoices/new"><Button><Plus className="h-4 w-4" />New Invoice</Button></Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-16">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No invoices found</p>
              <Link href="/invoices/new" className="mt-4 inline-block"><Button variant="outline" size="sm"><Plus className="h-4 w-4" />New Invoice</Button></Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Invoice</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Client</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Due Date</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Amount</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map(inv => (
                    <tr key={inv.id} className={`hover:bg-gray-50 transition-colors ${inv.status === 'OVERDUE' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <Link href={`/invoices/${inv.id}`} className="group">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600">{inv.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{inv.number} &bull; {formatDate(inv.createdAt)}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Link href={`/clients/${inv.client.id}`} className="text-sm text-gray-700 hover:text-brand-600">{inv.client.name}</Link>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-sm ${inv.status === 'OVERDUE' ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {formatDate(inv.dueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold">{formatCurrency(inv.total)}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${invoiceStatusColor(inv.status)} border-0 text-xs`}>{inv.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
