import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const member = db.team.find(m => m.id === params.id);
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(member);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const idx = db.team.findIndex(m => m.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = { ...db.team[idx], ...body, id: params.id };
  db.team[idx] = updated;
  writeDb(db);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const idx = db.team.findIndex(m => m.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  db.team.splice(idx, 1);
  writeDb(db);
  return NextResponse.json({ success: true });
}
