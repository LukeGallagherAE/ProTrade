import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const quote = db.quotes.find(q => q.id === params.id);
  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const idx = db.quotes.findIndex(q => q.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = { ...db.quotes[idx], ...body, id: params.id, updatedAt: new Date().toISOString() };
  db.quotes[idx] = updated;
  writeDb(db);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const idx = db.quotes.findIndex(q => q.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  db.quotes.splice(idx, 1);
  writeDb(db);
  return NextResponse.json({ success: true });
}
