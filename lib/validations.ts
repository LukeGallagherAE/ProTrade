import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  notes: z.string().optional(),
});

export const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'INVOICED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  jobType: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
  assignedToId: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  duration: z.coerce.number().optional(),
  siteAddress: z.string().optional(),
  siteCity: z.string().optional(),
  siteState: z.string().optional(),
  sitePostcode: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive'),
  unitPrice: z.coerce.number().min(0, 'Price must be 0 or more'),
  total: z.coerce.number(),
});

export const quoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  clientId: z.string().min(1, 'Client is required'),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED']),
  taxRate: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
  terms: z.string().optional(),
  validUntil: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'At least one item required'),
});

export const invoiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  clientId: z.string().min(1, 'Client is required'),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
  taxRate: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
  terms: z.string().optional(),
  dueDate: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'At least one item required'),
});

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
