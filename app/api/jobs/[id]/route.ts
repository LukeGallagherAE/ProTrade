import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { jobSchema } from '@/lib/validations';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      client: true,
      assignedTo: { select: { id: true, name: true, email: true, image: true, phone: true } },
      createdBy: { select: { id: true, name: true } },
      invoice: true,
      quote: { include: { items: true } },
      timeEntries: { include: { user: { select: { id: true, name: true } } }, orderBy: { startTime: 'desc' } },
      activities: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = jobSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { scheduledDate, assignedToId, ...rest } = parsed.data;

  const data: Record<string, unknown> = { ...rest };
  if (scheduledDate !== undefined) data.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
  if (assignedToId !== undefined) data.assignedToId = assignedToId || null;
  if (rest.status === 'COMPLETED' && !data.completedAt) data.completedAt = new Date();

  const job = await prisma.job.update({
    where: { id },
    data,
    include: {
      client: true,
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });

  await prisma.activity.create({
    data: {
      jobId: id,
      userId: session.user!.id!,
      type: 'UPDATE',
      message: `Job updated`,
    },
  });

  return NextResponse.json(job);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
