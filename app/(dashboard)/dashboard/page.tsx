'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, jobStatusColor } from '@/lib/utils';
import { Briefcase, Users, DollarSign, Clock, TrendingUp, Plus, ArrowRight, Calendar } from 'lucide-react';

interface DashboardData {
  stats: {
    totalJobs: number;
    activeJobs: number;
    pendingJobs: number;
    completedJobs: number;
    totalClients: number;
    totalInvoiced: number;
    unpaidInvoices: number;
  };
  recentJobs: Array<{
    id: string;
    number: string;
    title: string;
    status: string;
    client: { name: string };
    assignedTo: { name: string } | null;
    createdAt: string;
  }>;
  upcomingJobs: Array<{
    id: string;
    number: string;
    title: string;
    status: string;
    client: { name: string };
    scheduledDate: string;
    scheduledTime: string | null;
    assignedTo: { name: string } | null;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </>
    );
  }

  const stats = data?.stats;

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening with your business today.</p>
            </div>
            <Link href="/jobs/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Job
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Jobs"
              value={stats?.activeJobs ?? 0}
              subtitle={`${stats?.pendingJobs ?? 0} pending`}
              icon={<Briefcase className="h-5 w-5 text-blue-600" />}
              color="blue"
            />
            <StatCard
              title="Total Clients"
              value={stats?.totalClients ?? 0}
              subtitle="in your database"
              icon={<Users className="h-5 w-5 text-purple-600" />}
              color="purple"
            />
            <StatCard
              title="Revenue Collected"
              value={formatCurrency(stats?.totalInvoiced ?? 0)}
              subtitle="paid invoices"
              icon={<DollarSign className="h-5 w-5 text-green-600" />}
              color="green"
            />
            <StatCard
              title="Outstanding"
              value={formatCurrency(stats?.unpaidInvoices ?? 0)}
              subtitle="awaiting payment"
              icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Jobs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Recent Jobs</CardTitle>
                <Link href="/jobs" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.recentJobs.length === 0 && (
                  <p className="text-sm text-gray-500 py-4 text-center">No jobs yet. <Link href="/jobs/new" className="text-brand-600 hover:underline">Create one</Link></p>
                )}
                {data?.recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-600">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{job.number} &bull; {job.client.name}</p>
                    </div>
                    <Badge className={`${jobStatusColor(job.status)} border-0 ml-2 shrink-0 text-xs`}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Schedule */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Upcoming Schedule</CardTitle>
                <Link href="/schedule" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.upcomingJobs.length === 0 && (
                  <p className="text-sm text-gray-500 py-4 text-center">No upcoming jobs scheduled.</p>
                )}
                {data?.upcomingJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="bg-brand-50 rounded-lg p-2 shrink-0">
                      <Calendar className="h-4 w-4 text-brand-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-600">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(job.scheduledDate)}{job.scheduledTime ? ` at ${job.scheduledTime}` : ''}
                        {job.assignedTo ? ` — ${job.assignedTo.name}` : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-4">
            <Link href="/jobs?status=PENDING">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-yellow-600">{stats?.pendingJobs ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Pending Jobs</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/jobs?status=IN_PROGRESS">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">{stats?.activeJobs ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-1">In Progress</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/jobs?status=COMPLETED">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-green-600">{stats?.completedJobs ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Completed</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({ title, value, subtitle, icon, color }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const bgMap = { blue: 'bg-blue-50', purple: 'bg-purple-50', green: 'bg-green-50', orange: 'bg-orange-50' };
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`${bgMap[color]} rounded-lg p-2`}>{icon}</div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700 mt-1">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
