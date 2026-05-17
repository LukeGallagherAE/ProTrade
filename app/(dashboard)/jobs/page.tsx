'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, jobStatusColor, priorityColor } from '@/lib/utils';
import { Plus, Search, Briefcase, MapPin, User, Calendar } from 'lucide-react';

interface Job {
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  jobType: string | null;
  client: { id: string; name: string; company: string | null };
  assignedTo: { id: string; name: string } | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  siteCity: string | null;
  siteState: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'INVOICED', label: 'Invoiced' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function JobsPage() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') ?? 'ALL');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.set('status', status);
    if (search) params.set('search', search);
    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(fetchJobs, 300);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  return (
    <>
      <Header title="Jobs" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link href="/jobs/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Job
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No jobs found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or create a new job.</p>
              <Link href="/jobs/new" className="mt-4 inline-block">
                <Button variant="outline" size="sm"><Plus className="h-4 w-4" />New Job</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Job</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Client</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Assigned To</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Scheduled</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/jobs/${job.id}`} className="group">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600">{job.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            {job.number}
                            {(job.siteCity || job.siteState) && (
                              <><MapPin className="h-3 w-3" />{[job.siteCity, job.siteState].filter(Boolean).join(', ')}</>
                            )}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Link href={`/clients/${job.client.id}`} className="text-sm text-gray-700 hover:text-brand-600">
                          {job.client.name}
                          {job.client.company && <span className="text-xs text-gray-400 block">{job.client.company}</span>}
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {job.assignedTo ? (
                          <span className="flex items-center gap-1.5 text-sm text-gray-700">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            {job.assignedTo.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {job.scheduledDate ? (
                          <span className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDate(job.scheduledDate)}
                            {job.scheduledTime && <span className="text-gray-400">{job.scheduledTime}</span>}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${jobStatusColor(job.status)} border-0 text-xs`}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge className={`${priorityColor(job.priority)} border-0 text-xs`}>
                          {job.priority}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
