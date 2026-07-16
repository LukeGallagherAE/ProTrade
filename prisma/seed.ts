import { PrismaClient, Role, JobStatus, Priority, QuoteStatus, InvoiceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@protrade.com.au' },
    update: {},
    create: {
      email: 'admin@protrade.com.au',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
      phone: '0400 000 001',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@protrade.com.au' },
    update: {},
    create: {
      email: 'manager@protrade.com.au',
      name: 'Sarah Manager',
      password: hashedPassword,
      role: Role.MANAGER,
      phone: '0400 000 002',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@protrade.com.au' },
    update: {},
    create: {
      email: 'staff@protrade.com.au',
      name: 'Jake Tradie',
      password: hashedPassword,
      role: Role.STAFF,
      phone: '0400 000 003',
    },
  });

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '0400 111 111',
        company: 'Smith Industries',
        address: '123 Main Street',
        city: 'Sydney',
        state: 'NSW',
        postcode: '2000',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Emily Johnson',
        email: 'emily@example.com',
        phone: '0400 222 222',
        address: '45 Oak Avenue',
        city: 'Melbourne',
        state: 'VIC',
        postcode: '3000',
      },
    }),
    prisma.client.create({
      data: {
        name: 'TechCorp Pty Ltd',
        email: 'info@techcorp.com.au',
        phone: '02 9000 0000',
        company: 'TechCorp Pty Ltd',
        address: '1 Business Park',
        city: 'Brisbane',
        state: 'QLD',
        postcode: '4000',
      },
    }),
  ]);

  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        number: 'JOB-001',
        title: 'Hot Water System Replacement',
        description: 'Replace old gas hot water system with new heat pump unit.',
        status: JobStatus.COMPLETED,
        priority: Priority.HIGH,
        jobType: 'Plumbing',
        clientId: clients[0].id,
        assignedToId: staff.id,
        createdById: admin.id,
        scheduledDate: new Date('2024-01-15'),
        scheduledTime: '09:00',
        duration: 240,
        siteAddress: '123 Main Street',
        siteCity: 'Sydney',
        siteState: 'NSW',
        sitePostcode: '2000',
        completedAt: new Date('2024-01-15'),
      },
    }),
    prisma.job.create({
      data: {
        number: 'JOB-002',
        title: 'Electrical Switchboard Upgrade',
        description: 'Upgrade main switchboard to comply with current standards.',
        status: JobStatus.SCHEDULED,
        priority: Priority.MEDIUM,
        jobType: 'Electrical',
        clientId: clients[1].id,
        assignedToId: staff.id,
        createdById: admin.id,
        scheduledDate: new Date('2024-02-20'),
        scheduledTime: '08:00',
        duration: 360,
        siteAddress: '45 Oak Avenue',
        siteCity: 'Melbourne',
        siteState: 'VIC',
        sitePostcode: '3000',
      },
    }),
    prisma.job.create({
      data: {
        number: 'JOB-003',
        title: 'Air Conditioning Installation',
        description: 'Install 3x split system air conditioners throughout office.',
        status: JobStatus.PENDING,
        priority: Priority.MEDIUM,
        jobType: 'HVAC',
        clientId: clients[2].id,
        createdById: admin.id,
        siteAddress: '1 Business Park',
        siteCity: 'Brisbane',
        siteState: 'QLD',
        sitePostcode: '4000',
      },
    }),
    prisma.job.create({
      data: {
        number: 'JOB-004',
        title: 'Bathroom Renovation',
        description: 'Full bathroom renovation including tiling, fixtures and fittings.',
        status: JobStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        jobType: 'Plumbing',
        clientId: clients[0].id,
        assignedToId: staff.id,
        createdById: manager.id,
        scheduledDate: new Date(),
        scheduledTime: '07:30',
        duration: 480,
        siteAddress: '123 Main Street',
        siteCity: 'Sydney',
        siteState: 'NSW',
        sitePostcode: '2000',
      },
    }),
  ]);

  await prisma.quote.create({
    data: {
      number: 'QUO-001',
      title: 'Air Conditioning Installation Quote',
      status: QuoteStatus.SENT,
      clientId: clients[2].id,
      createdById: admin.id,
      subtotal: 6500,
      taxRate: 10,
      tax: 650,
      total: 7150,
      validUntil: new Date('2024-03-31'),
      items: {
        create: [
          { description: 'Supply & Install Daikin 7kW Split System x3', quantity: 3, unitPrice: 1800, total: 5400, sortOrder: 0 },
          { description: 'Electrical connection & commissioning', quantity: 1, unitPrice: 600, total: 600, sortOrder: 1 },
          { description: 'Refrigerant pipe & cabling', quantity: 1, unitPrice: 500, total: 500, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      number: 'INV-001',
      title: 'Hot Water System Replacement',
      status: InvoiceStatus.PAID,
      clientId: clients[0].id,
      createdById: admin.id,
      jobId: jobs[0].id,
      subtotal: 2200,
      taxRate: 10,
      tax: 220,
      total: 2420,
      dueDate: new Date('2024-01-30'),
      paidDate: new Date('2024-01-28'),
      items: {
        create: [
          { description: 'Rheem heat pump hot water system 270L', quantity: 1, unitPrice: 1400, total: 1400, sortOrder: 0 },
          { description: 'Labour - installation (4 hours)', quantity: 4, unitPrice: 150, total: 600, sortOrder: 1 },
          { description: 'Disposal of old unit', quantity: 1, unitPrice: 200, total: 200, sortOrder: 2 },
        ],
      },
    },
  });

  console.log('Seed complete!');
  console.log('Login: admin@protrade.com.au / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
