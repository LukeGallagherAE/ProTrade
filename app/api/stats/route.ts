import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function GET() {
  const db = readDb();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const todayStr = now.toISOString().split('T')[0];

  const activeStatuses = ['pending', 'scheduled', 'in_progress'];
  const activeJobs = db.jobs.filter(j => activeStatuses.includes(j.status));
  const completedThisMonth = db.jobs.filter(j => j.status === 'completed' && j.completedDate >= monthStart.split('T')[0]).length;

  const pendingInvoices = db.invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
  const pendingInvoicesTotal = pendingInvoices.reduce((s, i) => s + i.total, 0);

  const paidInvoices = db.invoices.filter(i => i.status === 'paid');
  const totalRevenue = paidInvoices.reduce((s, i) => s + i.total, 0);
  const revenueThisMonth = paidInvoices
    .filter(i => i.paidDate && i.paidDate >= monthStart.split('T')[0])
    .reduce((s, i) => s + i.total, 0);

  const upcomingJobs = db.jobs
    .filter(j => j.scheduledDate >= todayStr && activeStatuses.includes(j.status))
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 5);

  const recentJobs = [...db.jobs]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return NextResponse.json({
    totalJobs: db.jobs.length,
    activeJobs: activeJobs.length,
    completedThisMonth,
    pendingInvoicesCount: pendingInvoices.length,
    pendingInvoicesTotal,
    totalRevenue,
    revenueThisMonth,
    totalCustomers: db.customers.length,
    upcomingJobs,
    recentJobs,
  });
}
