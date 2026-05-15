import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import { Customer } from '@/lib/types';

export async function GET(req: NextRequest) {
  const db = readDb();
  const { searchParams } = new URL(req.url);
  let customers = [...db.customers];

  const search = searchParams.get('search');
  if (search) {
    const s = search.toLowerCase();
    customers = customers.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.phone.includes(s) ||
      (c.company && c.company.toLowerCase().includes(s))
    );
  }

  customers.sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const db = readDb();
  const body = await req.json();
  const now = new Date().toISOString();

  const customer: Customer = {
    id: generateId(),
    name: body.name || '',
    email: body.email || '',
    phone: body.phone || '',
    address: body.address || '',
    city: body.city || '',
    state: body.state || '',
    postcode: body.postcode || '',
    company: body.company || '',
    notes: body.notes || '',
    createdAt: now,
  };

  db.customers.push(customer);
  writeDb(db);
  return NextResponse.json(customer, { status: 201 });
}
