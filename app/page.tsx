'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase, TrendingUp, Clock, AlertCircle,
  DollarSign, Users, ArrowRight, Calendar
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { DashboardStats } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'text-brand-600', bg: 'bg-brand-50', href: '/jobs' },
    { label: 'Completed This Month', value: stats.completedThisMonth, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', href: '/jobs?status=completed' },
    { label: 'Pending Invoices', value: stats.pendingInvoicesCount, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', href: '/invoices' },
    { label: 'Awaiting Payment', value: formatCurrency(stats.pendingInvoicesTotal), icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50', href: '/invoices' },
    { label: 'Revenue This Month', value: formatCurrency(stats.revenueThisMonth), icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', href: '/invoices?status=paid' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', href: '/customers' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Good morning, James</h2>
        <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <Link key={c.label} href={c.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{c.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{c.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <c.icon size={20} className={c.color} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-brand-600" />
              <h3 className="font-semibold text-slate-900">Upcoming Jobs</h3>
            </div>
            <Link href="/schedule" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View schedule <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.upcomingJobs.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500 text-center">No upcoming jobs scheduled</p>
            ) : (
              stats.upcomingJobs.map(job => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{job.customerName} · {formatDate(job.scheduledDate)}</p>
                  </div>
                  <Badge status={job.priority} size="sm" />
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card padding={false}>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-brand-600" />
              <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            </div>
            <Link href="/jobs" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              All jobs <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recentJobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{job.jobNumber} · {job.customerName}</p>
                </div>
                <Badge status={job.status} size="sm" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
