import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { teamMemberSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const team = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      active: true,
      image: true,
      createdAt: true,
      _count: { select: { assignedJobs: true } },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(team);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = teamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { password, ...rest } = parsed.data;
  const hashedPassword = await bcrypt.hash(password ?? 'changeme123', 12);

  const existing = await prisma.user.findUnique({ where: { email: rest.email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { ...rest, password: hashedPassword },
    select: { id: true, name: true, email: true, phone: true, role: true, active: true },
  });

  return NextResponse.json(user, { status: 201 });
}
