import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const invoice = db.invoices.find(i => i.id === params.id);
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const idx = db.invoices.findIndex(i => i.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = { ...db.invoices[idx], ...body, id: params.id, updatedAt: new Date().toISOString() };
  db.invoices[idx] = updated;
  writeDb(db);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const idx = db.invoices.findIndex(i => i.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  db.invoices.splice(idx, 1);
  writeDb(db);
  return NextResponse.json({ success: true });
}
