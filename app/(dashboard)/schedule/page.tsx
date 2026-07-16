'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, jobStatusColor, priorityColor } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus, Calendar, User, Clock, MapPin } from 'lucide-react';
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';

interface ScheduledJob {
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  client: { name: string };
  assignedTo: { name: string } | null;
  scheduledDate: string;
  scheduledTime: string | null;
  duration: number | null;
  siteCity: string | null;
  siteState: string | null;
}

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  useEffect(() => {
    const from = startOfMonth(currentMonth);
    const to = endOfMonth(currentMonth);
    const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
    setLoading(true);
    fetch(`/api/schedule?${params}`)
      .then(r => r.json())
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [currentMonth]);

  const calStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const calEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const getJobsForDay = (day: Date) =>
    jobs.filter(j => isSameDay(new Date(j.scheduledDate), day));

  const selectedDayJobs = selectedDay ? getJobsForDay(selectedDay) : [];

  return (
    <>
      <Header title="Schedule" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 rounded-lg hover:bg-gray-100">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold w-40 text-center">{format(currentMonth, 'MMMM yyyy')}</h2>
              <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 rounded-lg hover:bg-gray-100">
                <ChevronRight className="h-5 w-5" />
              </button>
              <Button variant="outline" size="sm" onClick={() => { setCurrentMonth(new Date()); setSelectedDay(new Date()); }}>
                Today
              </Button>
            </div>
            <Link href="/jobs/new"><Button size="sm"><Plus className="h-4 w-4" />New Job</Button></Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border overflow-hidden">
                <div className="grid grid-cols-7 border-b">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-500 py-3">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {calDays.map((day, i) => {
                    const dayJobs = getJobsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isSelected = selectedDay && isSameDay(day, selectedDay);
                    const isT = isToday(day);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDay(day)}
                        className={`min-h-[80px] p-1.5 border-b border-r text-left transition-colors hover:bg-gray-50 ${
                          isSelected ? 'bg-brand-50' : ''
                        } ${i % 7 === 6 ? 'border-r-0' : ''}`}
                      >
                        <span className={`text-xs font-medium inline-flex h-6 w-6 items-center justify-center rounded-full ${
                          isT ? 'bg-brand-600 text-white' : isCurrentMonth ? 'text-gray-900' : 'text-gray-300'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayJobs.slice(0, 2).map(j => (
                            <div key={j.id} className={`text-xs px-1 py-0.5 rounded truncate ${jobStatusColor(j.status)}`}>
                              {j.scheduledTime ? `${j.scheduledTime} ` : ''}{j.title}
                            </div>
                          ))}
                          {dayJobs.length > 2 && (
                            <div className="text-xs text-gray-400 px-1">+{dayJobs.length - 2} more</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                {selectedDay ? format(selectedDay, 'EEEE, d MMMM') : 'Select a day'}
              </h3>
              {loading && <p className="text-sm text-gray-500">Loading...</p>}
              {!loading && selectedDayJobs.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No jobs scheduled</p>
                    <Link href="/jobs/new" className="mt-2 inline-block">
                      <Button variant="outline" size="sm"><Plus className="h-4 w-4" />Schedule Job</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
              {selectedDayJobs.map(job => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-4 pb-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{job.title}</p>
                        <Badge className={`${jobStatusColor(job.status)} border-0 text-xs ml-2 shrink-0`}>
                          {job.status.replace('_',' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{job.client.name}</p>
                      {job.scheduledTime && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />{job.scheduledTime}{job.duration ? ` (${job.duration} min)` : ''}
                        </p>
                      )}
                      {job.assignedTo && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <User className="h-3 w-3" />{job.assignedTo.name}
                        </p>
                      )}
                      {(job.siteCity || job.siteState) && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{[job.siteCity, job.siteState].filter(Boolean).join(', ')}
                        </p>
                      )}
                      <Badge className={`${priorityColor(job.priority)} border-0 text-xs`}>{job.priority}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
