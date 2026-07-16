import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { quoteSchema } from '@/lib/validations';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      client: true,
      createdBy: { select: { id: true, name: true } },
      items: { orderBy: { sortOrder: 'asc' } },
      jobs: true,
    },
  });

  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = quoteSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { items, validUntil, ...rest } = parsed.data;

  const updateData: Record<string, unknown> = { ...rest };
  if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;

  if (items) {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = rest.taxRate ?? 10;
    const tax = subtotal * (taxRate / 100);
    updateData.subtotal = subtotal;
    updateData.tax = tax;
    updateData.total = subtotal + tax;

    await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
    updateData.items = {
      create: items.map((item, i) => ({ ...item, sortOrder: i })),
    };
  }

  const quote = await prisma.quote.update({
    where: { id },
    data: updateData,
    include: {
      client: true,
      items: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return NextResponse.json(quote);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.quote.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
