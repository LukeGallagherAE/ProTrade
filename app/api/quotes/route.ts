import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { quoteSchema } from '@/lib/validations';
import { generateNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;

  const quotes = await prisma.quote.findMany({
    where,
    include: {
      client: true,
      createdBy: { select: { id: true, name: true } },
      items: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(quotes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await prisma.quote.count();
  const number = generateNumber('QUO', count);

  const { items, validUntil, ...rest } = parsed.data;

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (rest.taxRate / 100);
  const total = subtotal + tax;

  const quote = await prisma.quote.create({
    data: {
      ...rest,
      number,
      createdById: session.user!.id!,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      subtotal,
      tax,
      total,
      items: {
        create: items.map((item, i) => ({ ...item, sortOrder: i })),
      },
    },
    include: {
      client: true,
      items: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return NextResponse.json(quote, { status: 201 });
}
