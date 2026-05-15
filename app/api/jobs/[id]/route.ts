import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const job = db.jobs.find(j => j.id === params.id);
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(job);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const idx = db.jobs.findIndex(j => j.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = { ...db.jobs[idx], ...body, id: params.id, updatedAt: new Date().toISOString() };
  db.jobs[idx] = updated;
  writeDb(db);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const idx = db.jobs.findIndex(j => j.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  db.jobs.splice(idx, 1);
  writeDb(db);
  return NextResponse.json({ success: true });
}
