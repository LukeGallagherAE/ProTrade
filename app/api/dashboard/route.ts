import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [totalJobs, activeJobs, pendingJobs, completedJobs, totalClients, totalInvoiced, unpaidInvoices, recentJobs, upcomingJobs] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: { in: ['IN_PROGRESS', 'SCHEDULED'] } } }),
    prisma.job.count({ where: { status: 'PENDING' } }),
    prisma.job.count({ where: { status: 'COMPLETED' } }),
    prisma.client.count(),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
    prisma.invoice.aggregate({ _sum: { total: true }, where: { status: { in: ['SENT', 'OVERDUE'] } } }),
    prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true, assignedTo: { select: { id: true, name: true } } },
    }),
    prisma.job.findMany({
      where: {
        scheduledDate: { gte: new Date() },
        status: { in: ['SCHEDULED', 'PENDING'] },
      },
      take: 5,
      orderBy: { scheduledDate: 'asc' },
      include: { client: true, assignedTo: { select: { id: true, name: true } } },
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalJobs,
      activeJobs,
      pendingJobs,
      completedJobs,
      totalClients,
      totalInvoiced: totalInvoiced._sum.total ?? 0,
      unpaidInvoices: unpaidInvoices._sum.total ?? 0,
    },
    recentJobs,
    upcomingJobs,
  });
}
