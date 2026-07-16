import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where: Record<string, unknown> = {
    scheduledDate: { not: null },
  };

  if (from && to) {
    where.scheduledDate = { gte: new Date(from), lte: new Date(to) };
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      client: true,
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { scheduledDate: 'asc' },
  });

  return NextResponse.json(jobs);
}
