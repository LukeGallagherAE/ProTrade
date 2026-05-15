import fs from 'fs';
import path from 'path';
import { Database, Job, Customer, Quote, Invoice, TeamMember } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function seedData(): Database {
  const now = new Date().toISOString();
  const today = new Date();

  const team: TeamMember[] = [
    { id: 'tm1', name: 'James Mitchell', email: 'james@protrade.com.au', phone: '0412 345 678', role: 'admin', trade: 'Electrical', status: 'active', hourlyRate: 95, createdAt: now },
    { id: 'tm2', name: 'Sarah Chen', email: 'sarah@protrade.com.au', phone: '0423 456 789', role: 'tradesperson', trade: 'Plumbing', status: 'active', hourlyRate: 85, createdAt: now },
    { id: 'tm3', name: 'Ryan Torres', email: 'ryan@protrade.com.au', phone: '0434 567 890', role: 'tradesperson', trade: 'Electrical', status: 'active', hourlyRate: 85, createdAt: now },
    { id: 'tm4', name: 'Emma Wilson', email: 'emma@protrade.com.au', phone: '0445 678 901', role: 'apprentice', trade: 'Plumbing', status: 'active', hourlyRate: 35, createdAt: now },
  ];

  const customers: Customer[] = [
    { id: 'c1', name: 'David Thompson', email: 'david.thompson@email.com', phone: '0411 111 111', address: '14 Elm Street', city: 'Brisbane', state: 'QLD', postcode: '4000', company: '', notes: 'Prefers morning appointments', createdAt: now },
    { id: 'c2', name: 'Megan Roberts', email: 'megan.roberts@email.com', phone: '0422 222 222', address: '27 Oak Avenue', city: 'Brisbane', state: 'QLD', postcode: '4101', company: 'Roberts Real Estate', notes: '', createdAt: now },
    { id: 'c3', name: 'Steve Nguyen', email: 'steve.nguyen@email.com', phone: '0433 333 333', address: '5 Maple Drive', city: 'Gold Coast', state: 'QLD', postcode: '4217', company: 'Nguyen Construction', notes: 'Large commercial client', createdAt: now },
    { id: 'c4', name: 'Lucy Patel', email: 'lucy.patel@email.com', phone: '0444 444 444', address: '88 Pine Road', city: 'Sunshine Coast', state: 'QLD', postcode: '4556', company: '', notes: '', createdAt: now },
    { id: 'c5', name: 'Mark Johnson', email: 'mark.johnson@email.com', phone: '0455 555 555', address: '3 Cedar Lane', city: 'Ipswich', state: 'QLD', postcode: '4305', company: 'Johnson Homes', notes: 'Repeat customer', createdAt: now },
  ];

  const d = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const jobs: Job[] = [
    {
      id: 'j1', jobNumber: 'JOB-1001', title: 'Switchboard Upgrade', description: 'Upgrade main switchboard to 3-phase', customerId: 'c1', customerName: 'David Thompson', assignedTo: ['tm1', 'tm3'], status: 'in_progress', priority: 'high', jobType: 'Electrical', scheduledDate: d(0), scheduledTime: '08:00', completedDate: '', address: '14 Elm Street, Brisbane QLD 4000', notes: 'Customer away after 3pm', timeEntries: [{ id: 'te1', memberId: 'tm1', memberName: 'James Mitchell', date: d(-1), hours: 4, notes: 'Initial assessment' }], materials: [{ id: 'm1', name: 'Switchboard 3-phase', quantity: 1, unit: 'ea', cost: 450 }], createdAt: now, updatedAt: now
    },
    {
      id: 'j2', jobNumber: 'JOB-1002', title: 'Hot Water System Replacement', description: 'Replace 250L gas hot water unit', customerId: 'c2', customerName: 'Megan Roberts', assignedTo: ['tm2'], status: 'scheduled', priority: 'medium', jobType: 'Plumbing', scheduledDate: d(1), scheduledTime: '09:00', completedDate: '', address: '27 Oak Avenue, Brisbane QLD 4101', notes: '', timeEntries: [], materials: [], createdAt: now, updatedAt: now
    },
    {
      id: 'j3', jobNumber: 'JOB-1003', title: 'Office Fitout - Electrical', description: 'New power points and lighting for office fitout', customerId: 'c3', customerName: 'Steve Nguyen', assignedTo: ['tm1', 'tm3', 'tm4'], status: 'scheduled', priority: 'high', jobType: 'Electrical', scheduledDate: d(2), scheduledTime: '07:30', completedDate: '', address: '5 Maple Drive, Gold Coast QLD 4217', notes: 'Large job, 3 days estimated', timeEntries: [], materials: [], createdAt: now, updatedAt: now
    },
    {
      id: 'j4', jobNumber: 'JOB-1004', title: 'Leaking Tap Repair', description: 'Kitchen and bathroom taps leaking', customerId: 'c4', customerName: 'Lucy Patel', assignedTo: ['tm2'], status: 'completed', priority: 'low', jobType: 'Plumbing', scheduledDate: d(-3), scheduledTime: '10:00', completedDate: d(-3), address: '88 Pine Road, Sunshine Coast QLD 4556', notes: '', timeEntries: [{ id: 'te2', memberId: 'tm2', memberName: 'Sarah Chen', date: d(-3), hours: 2, notes: 'Replaced washers on 3 taps' }], materials: [{ id: 'm2', name: 'Tap washers', quantity: 6, unit: 'pack', cost: 12 }], createdAt: now, updatedAt: now
    },
    {
      id: 'j5', jobNumber: 'JOB-1005', title: 'Safety Inspection', description: 'Annual electrical safety inspection', customerId: 'c5', customerName: 'Mark Johnson', assignedTo: ['tm1'], status: 'pending', priority: 'medium', jobType: 'Electrical', scheduledDate: d(5), scheduledTime: '11:00', completedDate: '', address: '3 Cedar Lane, Ipswich QLD 4305', notes: '', timeEntries: [], materials: [], createdAt: now, updatedAt: now
    },
    {
      id: 'j6', jobNumber: 'JOB-1006', title: 'Blocked Drain Clearance', description: 'Main drain blockage causing backup', customerId: 'c1', customerName: 'David Thompson', assignedTo: ['tm2', 'tm4'], status: 'completed', priority: 'urgent', jobType: 'Plumbing', scheduledDate: d(-5), scheduledTime: '08:00', completedDate: d(-5), address: '14 Elm Street, Brisbane QLD 4000', notes: 'Tree roots in drain - cleared and treated', timeEntries: [{ id: 'te3', memberId: 'tm2', memberName: 'Sarah Chen', date: d(-5), hours: 3, notes: 'Hydro jetting required' }], materials: [{ id: 'm3', name: 'Root treatment chemical', quantity: 1, unit: 'L', cost: 45 }], createdAt: now, updatedAt: now
    },
  ];

  const quotes: Quote[] = [
    {
      id: 'q1', quoteNumber: 'QT-101', customerId: 'c3', customerName: 'Steve Nguyen', title: 'Office Fitout - Full Electrical Package', description: 'Complete electrical fitout for new office space', lineItems: [
        { id: 'li1', description: 'Labour - Electrician (40hrs)', quantity: 40, unit: 'hr', unitPrice: 95, total: 3800 },
        { id: 'li2', description: 'Labour - Apprentice (40hrs)', quantity: 40, unit: 'hr', unitPrice: 35, total: 1400 },
        { id: 'li3', description: 'Power points (double GPO)', quantity: 24, unit: 'ea', unitPrice: 85, total: 2040 },
        { id: 'li4', description: 'LED Downlights', quantity: 32, unit: 'ea', unitPrice: 65, total: 2080 },
        { id: 'li5', description: 'Data/comms cabling', quantity: 1, unit: 'lot', unitPrice: 1200, total: 1200 },
      ], subtotal: 10520, taxRate: 10, tax: 1052, total: 11572, status: 'sent', validUntil: d(30), createdAt: now, updatedAt: now, notes: 'Quote valid for 30 days', terms: 'Payment due within 14 days of invoice. 5% deposit required to secure booking.'
    },
    {
      id: 'q2', quoteNumber: 'QT-102', customerId: 'c5', customerName: 'Mark Johnson', title: 'New Home - Rough-in Electrical', description: 'Full rough-in electrical for new residential build', lineItems: [
        { id: 'li6', description: 'Labour - Electrician (60hrs)', quantity: 60, unit: 'hr', unitPrice: 95, total: 5700 },
        { id: 'li7', description: 'Main switchboard supply & install', quantity: 1, unit: 'ea', unitPrice: 1800, total: 1800 },
        { id: 'li8', description: 'Cabling and conduit', quantity: 1, unit: 'lot', unitPrice: 2400, total: 2400 },
      ], subtotal: 9900, taxRate: 10, tax: 990, total: 10890, status: 'draft', validUntil: d(14), createdAt: now, updatedAt: now, notes: '', terms: 'Payment due within 14 days of invoice.'
    },
  ];

  const invoices: Invoice[] = [
    {
      id: 'inv1', invoiceNumber: 'INV-101', customerId: 'c4', customerName: 'Lucy Patel', jobId: 'j4', quoteId: '', title: 'Leaking Tap Repair', lineItems: [
        { id: 'li9', description: 'Labour - Plumber (2hrs)', quantity: 2, unit: 'hr', unitPrice: 85, total: 170 },
        { id: 'li10', description: 'Tap washers', quantity: 1, unit: 'pack', unitPrice: 18, total: 18 },
        { id: 'li11', description: 'Call-out fee', quantity: 1, unit: 'ea', unitPrice: 75, total: 75 },
      ], subtotal: 263, taxRate: 10, tax: 26.30, total: 289.30, status: 'paid', dueDate: d(-10), paidDate: d(-8), createdAt: now, updatedAt: now, notes: '', terms: 'Thank you for your business!'
    },
    {
      id: 'inv2', invoiceNumber: 'INV-102', customerId: 'c1', customerName: 'David Thompson', jobId: 'j6', quoteId: '', title: 'Blocked Drain Clearance', lineItems: [
        { id: 'li12', description: 'Labour - Plumber (3hrs)', quantity: 3, unit: 'hr', unitPrice: 85, total: 255 },
        { id: 'li13', description: 'Hydro jetting service', quantity: 1, unit: 'ea', unitPrice: 350, total: 350 },
        { id: 'li14', description: 'Root treatment chemical', quantity: 1, unit: 'ea', unitPrice: 65, total: 65 },
        { id: 'li15', description: 'Urgent call-out fee', quantity: 1, unit: 'ea', unitPrice: 120, total: 120 },
      ], subtotal: 790, taxRate: 10, tax: 79, total: 869, status: 'sent', dueDate: d(7), paidDate: '', createdAt: now, updatedAt: now, notes: 'Urgent call-out surcharge applied', terms: 'Payment due within 14 days.'
    },
    {
      id: 'inv3', invoiceNumber: 'INV-103', customerId: 'c2', customerName: 'Megan Roberts', jobId: '', quoteId: '', title: 'Maintenance Contract - Q1', lineItems: [
        { id: 'li16', description: 'Quarterly maintenance - electrical', quantity: 1, unit: 'ea', unitPrice: 450, total: 450 },
        { id: 'li17', description: 'Quarterly maintenance - plumbing', quantity: 1, unit: 'ea', unitPrice: 350, total: 350 },
      ], subtotal: 800, taxRate: 10, tax: 80, total: 880, status: 'overdue', dueDate: d(-15), paidDate: '', createdAt: now, updatedAt: now, notes: '', terms: 'Payment due within 14 days.'
    },
  ];

  return {
    jobs,
    customers,
    quotes,
    invoices,
    team,
    counters: { jobNumber: 1006, quoteNumber: 102, invoiceNumber: 103 },
  };
}

export function readDb(): Database {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const seed = seedData();
      fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
      return seed;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw) as Database;
  } catch {
    return seedData();
  }
}

export function writeDb(db: Database): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function nextJobNumber(db: Database): string {
  db.counters.jobNumber += 1;
  return `JOB-${db.counters.jobNumber}`;
}

export function nextQuoteNumber(db: Database): string {
  db.counters.quoteNumber += 1;
  return `QT-${db.counters.quoteNumber}`;
}

export function nextInvoiceNumber(db: Database): string {
  db.counters.invoiceNumber += 1;
  return `INV-${db.counters.invoiceNumber}`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}
