'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, Phone, Mail, Building2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { Customer } from '@/lib/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    fetch(`/api/customers?${params}`)
      .then(r => r.json())
      .then(data => { setCustomers(data); setLoading(false); });
  }, [search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customers</h2>
          <p className="text-sm text-slate-500 mt-0.5">{customers.length} customer{customers.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/customers/new">
          <Button><Plus size={16} /> New Customer</Button>
        </Link>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or company..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>
      ) : customers.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users size={28} />}
            title="No customers yet"
            description="Add your first customer to start managing jobs."
            action={<Link href="/customers/new"><Button>New Customer</Button></Link>}
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map(c => (
            <Link key={c.id} href={`/customers/${c.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="text-brand-700 font-bold text-sm">{c.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span>
                  </div>
                  {c.company && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Building2 size={12} /> {c.company}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-slate-900">{c.name}</p>
                {c.email && <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5"><Mail size={12} />{c.email}</p>}
                {c.phone && <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1"><Phone size={12} />{c.phone}</p>}
                {c.city && <p className="text-xs text-slate-400 mt-2">{[c.city, c.state].filter(Boolean).join(', ')}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
