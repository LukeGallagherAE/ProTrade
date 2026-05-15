'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2, Clock, Package, MapPin, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardHeader } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Job, TeamMember } from '@/lib/types';
import { formatCurrency, formatDate, formatDateFull, getStatusLabel } from '@/lib/utils';

const JOB_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      fetch(`/api/jobs/${id}`).then(r => r.json()),
      fetch('/api/team').then(r => r.json()),
    ]).then(([j, t]) => { setJob(j); setTeam(t); setLoading(false); });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(status: string) {
    if (!job) return;
    setUpdatingStatus(true);
    const updates: Partial<Job> = { status: status as Job['status'] };
    if (status === 'completed') updates.completedDate = new Date().toISOString().split('T')[0];
    const res = await fetch(`/api/jobs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (res.ok) { const updated = await res.json(); setJob(updated); showToast('Status updated'); }
    setUpdatingStatus(false);
  }

  async function deleteJob() {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Job deleted'); router.push('/jobs'); }
    else showToast('Failed to delete job', 'error');
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;
  if (!job || (job as { error?: string }).error) return <div className="text-center py-16 text-slate-500">Job not found.</div>;

  const assignedMembers = team.filter(m => job.assignedTo.includes(m.id));
  const totalLabourCost = job.timeEntries.reduce((s, e) => {
    const member = team.find(m => m.id === e.memberId);
    return s + e.hours * (member?.hourlyRate ?? 0);
  }, 0);
  const totalMaterialCost = job.materials.reduce((s, m) => s + m.quantity * m.cost, 0);

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/jobs" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
            <p className="text-sm text-slate-500">{job.jobNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/jobs/${id}/edit`}>
            <Button variant="outline" size="sm"><Edit2 size={14} /> Edit</Button>
          </Link>
          <Button variant="danger" size="sm" onClick={deleteJob}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader title="Job Information" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500 mb-1">Status</p><Badge status={job.status} /></div>
              <div><p className="text-slate-500 mb-1">Priority</p><Badge status={job.priority} /></div>
              <div><p className="text-slate-500 mb-1">Job Type</p><p className="font-medium text-slate-900">{job.jobType || '-'}</p></div>
              <div><p className="text-slate-500 mb-1">Scheduled</p><p className="font-medium text-slate-900">{job.scheduledDate ? `${formatDate(job.scheduledDate)} ${job.scheduledTime ? `at ${job.scheduledTime}` : ''}` : '-'}</p></div>
              {job.completedDate && <div><p className="text-slate-500 mb-1">Completed</p><p className="font-medium text-slate-900">{formatDate(job.completedDate)}</p></div>}
            </div>
            {job.description && <div className="mt-4 pt-4 border-t border-slate-100"><p className="text-slate-500 text-sm mb-1">Description</p><p className="text-sm text-slate-700">{job.description}</p></div>}
            {job.notes && <div className="mt-3"><p className="text-slate-500 text-sm mb-1">Notes</p><p className="text-sm text-slate-700">{job.notes}</p></div>}
          </Card>

          <Card>
            <CardHeader title="Time Entries" />
            {job.timeEntries.length === 0 ? (
              <p className="text-sm text-slate-500">No time entries recorded.</p>
            ) : (
              <div className="space-y-2">
                {job.timeEntries.map(entry => {
                  const member = team.find(m => m.id === entry.memberId);
                  return (
                    <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                      <Clock size={16} className="text-slate-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{entry.memberName}</p>
                        <p className="text-xs text-slate-500">{formatDate(entry.date)}{entry.notes && ` · ${entry.notes}`}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{entry.hours}h</p>
                        {member && <p className="text-xs text-slate-500">{formatCurrency(entry.hours * member.hourlyRate)}</p>}
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="text-slate-500">Total labour cost</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(totalLabourCost)}</span>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Materials" />
            {job.materials.length === 0 ? (
              <p className="text-sm text-slate-500">No materials recorded.</p>
            ) : (
              <div className="space-y-2">
                {job.materials.map(mat => (
                  <div key={mat.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                    <Package size={16} className="text-slate-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{mat.name}</p>
                      <p className="text-xs text-slate-500">{mat.quantity} {mat.unit}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(mat.quantity * mat.cost)}</p>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="text-slate-500">Total materials cost</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(totalMaterialCost)}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Update Status</h3>
            <div className="space-y-1.5">
              {JOB_STATUSES.map(s => (
                <button
                  key={s.value}
                  onClick={() => updateStatus(s.value)}
                  disabled={updatingStatus || job.status === s.value}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    job.status === s.value
                      ? 'bg-brand-600 text-white cursor-default'
                      : 'hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Customer</h3>
            <Link href={`/customers/${job.customerId}`} className="hover:text-brand-600">
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-900">{job.customerName}</span>
              </div>
            </Link>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Location</h3>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700">{job.address || 'No address specified'}</p>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Assigned Team</h3>
            {assignedMembers.length === 0 ? (
              <p className="text-sm text-slate-500">No team members assigned.</p>
            ) : (
              <div className="space-y-2">
                {assignedMembers.map(m => (
                  <div key={m.id} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-brand-700 text-xs font-bold">{m.name.split(' ').map(n=>n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.trade}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
