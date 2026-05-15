'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2, Phone, Mail, MapPin, Building2, Plus, Briefcase, Receipt, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Customer, Job, Invoice, Quote } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface CustomerDetail extends Customer {
  jobs: Job[];
  invoices: Invoice[];
  totalInvoiced: number;
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      fetch(`/api/customers/${id}`).then(r => r.json()),
      fetch(`/api/quotes?customerId=${id}`).then(r => r.json()),
    ]).then(([c, q]) => {
      setCustomer(c);
      setForm(c);
      setQuotes(q);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/customers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { const updated = await res.json(); setCustomer(c => c ? { ...c, ...updated } : c); setEditing(false); showToast('Customer updated'); }
    else showToast('Failed to update', 'error');
    setSaving(false);
  }

  async function del() {
    if (!confirm('Delete this customer?')) return;
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Customer deleted'); router.push('/customers'); }
    else showToast('Failed to delete', 'error');
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;
  if (!customer || (customer as { error?: string }).error) return <div className="text-center py-16 text-slate-500">Customer not found.</div>;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/customers" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"><ArrowLeft size={18} /></Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{customer.name}</h2>
            {customer.company && <p className="text-sm text-slate-500">{customer.company}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}><Edit2 size={14} /> {editing ? 'Cancel' : 'Edit'}</Button>
          <Button variant="danger" size="sm" onClick={del}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <Card>
            {editing ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Edit Details</h3>
                {(['name','email','phone','company','address','city','postcode'] as const).map(field => (
                  <div key={field}>
                    <label className="text-xs font-medium text-slate-500 capitalize">{field}</label>
                    <input
                      value={(form[field] as string) || ''}
                      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      className="w-full mt-0.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                ))}
                <Button onClick={save} loading={saving} size="sm" className="w-full">Save Changes</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
                  <span className="text-brand-700 font-bold text-lg">{customer.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span>
                </div>
                {customer.email && <div className="flex items-center gap-2 text-sm text-slate-700"><Mail size={15} className="text-slate-400" />{customer.email}</div>}
                {customer.phone && <div className="flex items-center gap-2 text-sm text-slate-700"><Phone size={15} className="text-slate-400" />{customer.phone}</div>}
                {customer.company && <div className="flex items-center gap-2 text-sm text-slate-700"><Building2 size={15} className="text-slate-400" />{customer.company}</div>}
                {customer.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-700">
                    <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
                    <span>{[customer.address, customer.city, customer.state, customer.postcode].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {customer.notes && <div className="pt-3 border-t border-slate-100 text-sm text-slate-600">{customer.notes}</div>}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Total Jobs</span><span className="font-medium">{customer.jobs.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Invoiced</span><span className="font-semibold text-slate-900">{formatCurrency(customer.totalInvoiced)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Customer Since</span><span className="font-medium">{formatDate(customer.createdAt)}</span></div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2"><Briefcase size={16} className="text-brand-600" /><h3 className="font-semibold text-slate-900">Jobs</h3></div>
              <Link href={`/jobs/new`}><Button size="sm" variant="outline"><Plus size={14} />New Job</Button></Link>
            </div>
            {customer.jobs.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">No jobs for this customer yet.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {customer.jobs.map(job => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                      <p className="text-xs text-slate-500">{job.jobNumber}{job.scheduledDate ? ` · ${formatDate(job.scheduledDate)}` : ''}</p>
                    </div>
                    <Badge status={job.status} size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Receipt size={16} className="text-brand-600" />
              <h3 className="font-semibold text-slate-900">Invoices</h3>
            </div>
            {customer.invoices.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">No invoices yet.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {customer.invoices.map(inv => (
                  <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{inv.title}</p>
                      <p className="text-xs text-slate-500">{inv.invoiceNumber} · Due {formatDate(inv.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(inv.total)}</p>
                      <Badge status={inv.status} size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <FileText size={16} className="text-brand-600" />
              <h3 className="font-semibold text-slate-900">Quotes</h3>
            </div>
            {quotes.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">No quotes yet.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {quotes.map(q => (
                  <Link key={q.id} href={`/quotes/${q.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{q.title}</p>
                      <p className="text-xs text-slate-500">{q.quoteNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(q.total)}</p>
                      <Badge status={q.status} size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
