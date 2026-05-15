import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const customer = db.customers.find(c => c.id === params.id);
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const jobs = db.jobs.filter(j => j.customerId === params.id);
  const invoices = db.invoices.filter(i => i.customerId === params.id);
  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);

  return NextResponse.json({ ...customer, jobs, invoices, totalInvoiced });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const idx = db.customers.findIndex(c => c.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = { ...db.customers[idx], ...body, id: params.id };
  db.customers[idx] = updated;
  writeDb(db);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = readDb();
  const idx = db.customers.findIndex(c => c.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  db.customers.splice(idx, 1);
  writeDb(db);
  return NextResponse.json({ success: true });
}
