'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, Mail, Phone, Building2, Briefcase } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  _count: { jobs: number; quotes: number; invoices: number };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res = await fetch(`/api/clients?${params}`);
    setClients(await res.json());
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchClients, 300);
    return () => clearTimeout(t);
  }, [fetchClients]);

  return (
    <>
      <Header title="Clients" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex gap-3 items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search clients..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Link href="/clients/new"><Button><Plus className="h-4 w-4" />New Client</Button></Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : clients.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No clients found</p>
              <Link href="/clients/new" className="mt-4 inline-block">
                <Button variant="outline" size="sm"><Plus className="h-4 w-4" />Add Client</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <Link key={client.id} href={`/clients/${client.id}`}>
                  <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                        {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                        {client._count.jobs} job{client._count.jobs !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{client.name}</h3>
                    {client.company && (
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                        <Building2 className="h-3.5 w-3.5" />{client.company}
                      </p>
                    )}
                    {client.email && (
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1 truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0" />{client.email}
                      </p>
                    )}
                    {client.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                        <Phone className="h-3.5 w-3.5" />{client.phone}
                      </p>
                    )}
                    <div className="mt-3 pt-3 border-t flex gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{client._count.jobs} jobs</span>
                      <span>{client._count.quotes} quotes</span>
                      <span>{client._count.invoices} invoices</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
