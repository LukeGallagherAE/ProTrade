import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateId } from '@/lib/db';
import { TeamMember } from '@/lib/types';

export async function GET() {
  const db = readDb();
  const team = [...db.team].sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json(team);
}

export async function POST(req: NextRequest) {
  const db = readDb();
  const body = await req.json();
  const now = new Date().toISOString();

  const member: TeamMember = {
    id: generateId(),
    name: body.name || '',
    email: body.email || '',
    phone: body.phone || '',
    role: body.role || 'tradesperson',
    trade: body.trade || '',
    status: body.status || 'active',
    hourlyRate: body.hourlyRate || 0,
    createdAt: now,
  };

  db.team.push(member);
  writeDb(db);
  return NextResponse.json(member, { status: 201 });
}
