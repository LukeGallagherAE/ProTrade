import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, nextQuoteNumber, generateId } from '@/lib/db';
import { Quote } from '@/lib/types';

export async function GET(req: NextRequest) {
  const db = readDb();
  const { searchParams } = new URL(req.url);
  let quotes = [...db.quotes];

  const status = searchParams.get('status');
  const customerId = searchParams.get('customerId');
  if (status) quotes = quotes.filter(q => q.status === status);
  if (customerId) quotes = quotes.filter(q => q.customerId === customerId);

  quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(quotes);
}

export async function POST(req: NextRequest) {
  const db = readDb();
  const body = await req.json();
  const now = new Date().toISOString();

  const quote: Quote = {
    id: generateId(),
    quoteNumber: nextQuoteNumber(db),
    customerId: body.customerId || '',
    customerName: body.customerName || '',
    title: body.title || '',
    description: body.description || '',
    lineItems: body.lineItems || [],
    subtotal: body.subtotal || 0,
    taxRate: body.taxRate ?? 10,
    tax: body.tax || 0,
    total: body.total || 0,
    status: body.status || 'draft',
    validUntil: body.validUntil || '',
    createdAt: now,
    updatedAt: now,
    notes: body.notes || '',
    terms: body.terms || 'Payment due within 14 days of invoice.',
  };

  db.quotes.push(quote);
  writeDb(db);
  return NextResponse.json(quote, { status: 201 });
}
