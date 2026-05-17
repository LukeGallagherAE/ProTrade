'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, formatCurrency, quoteStatusColor } from '@/lib/utils';
import { Plus, Search, FileText } from 'lucide-react';

interface Quote {
  id: string;
  number: string;
  title: string;
  status: string;
  client: { id: string; name: string };
  total: number;
  createdAt: string;
  validUntil: string | null;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'ALL') params.set('status', status);
    const res = await fetch(`/api/quotes?${params}`);
    let data: Quote[] = await res.json();
    if (search) data = data.filter(q => q.title.toLowerCase().includes(search.toLowerCase()) || q.number.includes(search) || q.client.name.toLowerCase().includes(search.toLowerCase()));
    setQuotes(data);
    setLoading(false);
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(fetchQuotes, 300);
    return () => clearTimeout(t);
  }, [fetchQuotes]);

  return (
    <>
      <Header title="Quotes" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search quotes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['ALL','DRAFT','SENT','ACCEPTED','DECLINED','EXPIRED'].map(s => (
                    <SelectItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link href="/quotes/new"><Button><Plus className="h-4 w-4" />New Quote</Button></Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No quotes found</p>
              <Link href="/quotes/new" className="mt-4 inline-block"><Button variant="outline" size="sm"><Plus className="h-4 w-4" />New Quote</Button></Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Quote</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Client</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Valid Until</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Total</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quotes.map(q => (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/quotes/${q.id}`} className="group">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600">{q.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{q.number} &bull; {formatDate(q.createdAt)}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Link href={`/clients/${q.client.id}`} className="text-sm text-gray-700 hover:text-brand-600">{q.client.name}</Link>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">{formatDate(q.validUntil)}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold">{formatCurrency(q.total)}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${quoteStatusColor(q.status)} border-0 text-xs`}>{q.status}</Badge>
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
