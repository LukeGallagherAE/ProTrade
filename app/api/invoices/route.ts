import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, nextInvoiceNumber, generateId } from '@/lib/db';
import { Invoice } from '@/lib/types';

export async function GET(req: NextRequest) {
  const db = readDb();
  const { searchParams } = new URL(req.url);
  let invoices = [...db.invoices];

  const status = searchParams.get('status');
  const customerId = searchParams.get('customerId');
  if (status) invoices = invoices.filter(i => i.status === status);
  if (customerId) invoices = invoices.filter(i => i.customerId === customerId);

  invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const db = readDb();
  const body = await req.json();
  const now = new Date().toISOString();

  const invoice: Invoice = {
    id: generateId(),
    invoiceNumber: nextInvoiceNumber(db),
    customerId: body.customerId || '',
    customerName: body.customerName || '',
    jobId: body.jobId || '',
    quoteId: body.quoteId || '',
    title: body.title || '',
    lineItems: body.lineItems || [],
    subtotal: body.subtotal || 0,
    taxRate: body.taxRate ?? 10,
    tax: body.tax || 0,
    total: body.total || 0,
    status: body.status || 'draft',
    dueDate: body.dueDate || '',
    paidDate: '',
    createdAt: now,
    updatedAt: now,
    notes: body.notes || '',
    terms: body.terms || 'Payment due within 14 days of invoice.',
  };

  db.invoices.push(invoice);
  writeDb(db);
  return NextResponse.json(invoice, { status: 201 });
}
