import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const { password, ...rest } = body;
  const updateData: Record<string, unknown> = { ...rest };

  if (password) {
    const bcrypt = await import('bcryptjs');
    updateData.password = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true, role: true, active: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const session2 = await auth();
  if (session2?.user?.id === id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
