export type JobStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'invoiced' | 'cancelled';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type TeamRole = 'admin' | 'manager' | 'tradesperson' | 'apprentice';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface TimeEntry {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  hours: number;
  notes: string;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface Job {
  id: string;
  jobNumber: string;
  title: string;
  description: string;
  customerId: string;
  customerName: string;
  assignedTo: string[];
  status: JobStatus;
  priority: JobPriority;
  jobType: string;
  scheduledDate: string;
  scheduledTime: string;
  completedDate: string;
  address: string;
  notes: string;
  timeEntries: TimeEntry[];
  materials: Material[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  company: string;
  notes: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  title: string;
  description: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  status: QuoteStatus;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  terms: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  jobId: string;
  quoteId: string;
  title: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  paidDate: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  terms: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TeamRole;
  trade: string;
  status: 'active' | 'inactive';
  hourlyRate: number;
  createdAt: string;
}

export interface Database {
  jobs: Job[];
  customers: Customer[];
  quotes: Quote[];
  invoices: Invoice[];
  team: TeamMember[];
  counters: {
    jobNumber: number;
    quoteNumber: number;
    invoiceNumber: number;
  };
}

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  completedThisMonth: number;
  pendingInvoicesCount: number;
  pendingInvoicesTotal: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalCustomers: number;
  upcomingJobs: Job[];
  recentJobs: Job[];
}
