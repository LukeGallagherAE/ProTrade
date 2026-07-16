import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { invoiceSchema } from '@/lib/validations';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      createdBy: { select: { id: true, name: true } },
      items: { orderBy: { sortOrder: 'asc' } },
      job: { select: { id: true, number: true, title: true } },
    },
  });

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = invoiceSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { items, dueDate, ...rest } = parsed.data;

  const updateData: Record<string, unknown> = { ...rest };
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (rest.status === 'PAID') updateData.paidDate = new Date();

  if (items) {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = rest.taxRate ?? 10;
    const tax = subtotal * (taxRate / 100);
    updateData.subtotal = subtotal;
    updateData.tax = tax;
    updateData.total = subtotal + tax;

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    updateData.items = {
      create: items.map((item, i) => ({ ...item, sortOrder: i })),
    };
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: updateData,
    include: {
      client: true,
      items: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
