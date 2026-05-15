import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, nextJobNumber, generateId } from '@/lib/db';
import { Job } from '@/lib/types';

export async function GET(req: NextRequest) {
  const db = readDb();
  const { searchParams } = new URL(req.url);
  let jobs = [...db.jobs];

  const status = searchParams.get('status');
  const customerId = searchParams.get('customerId');
  const search = searchParams.get('search');

  if (status) jobs = jobs.filter(j => j.status === status);
  if (customerId) jobs = jobs.filter(j => j.customerId === customerId);
  if (search) {
    const s = search.toLowerCase();
    jobs = jobs.filter(j =>
      j.title.toLowerCase().includes(s) ||
      j.customerName.toLowerCase().includes(s) ||
      j.jobNumber.toLowerCase().includes(s)
    );
  }

  jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const db = readDb();
  const body = await req.json();
  const now = new Date().toISOString();

  const job: Job = {
    id: generateId(),
    jobNumber: nextJobNumber(db),
    title: body.title || '',
    description: body.description || '',
    customerId: body.customerId || '',
    customerName: body.customerName || '',
    assignedTo: body.assignedTo || [],
    status: body.status || 'pending',
    priority: body.priority || 'medium',
    jobType: body.jobType || '',
    scheduledDate: body.scheduledDate || '',
    scheduledTime: body.scheduledTime || '',
    completedDate: '',
    address: body.address || '',
    notes: body.notes || '',
    timeEntries: [],
    materials: [],
    createdAt: now,
    updatedAt: now,
  };

  db.jobs.push(job);
  writeDb(db);
  return NextResponse.json(job, { status: 201 });
}
