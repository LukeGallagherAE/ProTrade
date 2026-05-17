import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { jobSchema } from '@/lib/validations';
import { generateNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');
  const assignedToId = searchParams.get('assignedToId');
  const search = searchParams.get('search');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (assignedToId) where.assignedToId = assignedToId;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { number: { contains: search } },
    ];
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      client: true,
      assignedTo: { select: { id: true, name: true, email: true, image: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await prisma.job.count();
  const number = generateNumber('JOB', count);

  const { scheduledDate, assignedToId, ...rest } = parsed.data;

  const job = await prisma.job.create({
    data: {
      ...rest,
      number,
      createdById: session.user!.id!,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      assignedToId: assignedToId || undefined,
    },
    include: {
      client: true,
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(job, { status: 201 });
}
