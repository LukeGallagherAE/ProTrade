export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateFull(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    invoiced: 'bg-teal-100 text-teal-800 border-teal-200',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    sent: 'bg-blue-100 text-blue-800 border-blue-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    declined: 'bg-red-100 text-red-800 border-red-200',
    expired: 'bg-orange-100 text-orange-700 border-orange-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    urgent: 'bg-red-100 text-red-700 border-red-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return map[status] || 'bg-gray-100 text-gray-600 border-gray-200';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pending',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    invoiced: 'Invoiced',
    cancelled: 'Cancelled',
    draft: 'Draft',
    sent: 'Sent',
    accepted: 'Accepted',
    declined: 'Declined',
    expired: 'Expired',
    paid: 'Paid',
    overdue: 'Overdue',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
    active: 'Active',
    inactive: 'Inactive',
    admin: 'Admin',
    manager: 'Manager',
    tradesperson: 'Tradesperson',
    apprentice: 'Apprentice',
  };
  return map[status] || status;
}

export function calcSubtotal(lineItems: { total: number }[]): number {
  return round2(lineItems.reduce((s, i) => s + i.total, 0));
}

export function calcTax(subtotal: number, taxRate: number): number {
  return round2(subtotal * (taxRate / 100));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
