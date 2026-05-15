'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Job } from '@/lib/types';

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function SchedulePage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(today.toISOString().split('T')[0]);

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(setJobs);
  }, []);

  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  const calendarStart = firstDay === 0 ? 6 : firstDay - 1;

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function dateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function jobsForDate(day: number) {
    const d = dateStr(day);
    return jobs.filter(j => j.scheduledDate === d);
  }

  const selectedJobs = selectedDate ? jobs.filter(j => j.scheduledDate === selectedDate) : [];

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Schedule</h2>
        <Link href="/jobs/new"><Button><Plus size={16} /> New Job</Button></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 transition">
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
              <h3 className="font-semibold text-slate-900">{monthNames[month]} {year}</h3>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 transition">
                <ChevronRight size={18} className="text-slate-600" />
              </button>
            </div>
            <div className="grid grid-cols-7">
              {dayNames.map(d => (
                <div key={d} className="text-center py-2 text-xs font-semibold text-slate-500">{d}</div>
              ))}
              {Array.from({ length: calendarStart }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 border-t border-slate-100" />
              ))}
              {Array.from({ length: days }).map((_, i) => {
                const day = i + 1;
                const ds = dateStr(day);
                const dayJobs = jobsForDate(day);
                const isToday = ds === today.toISOString().split('T')[0];
                const isSelected = ds === selectedDate;
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(ds)}
                    className={`h-24 border-t border-slate-100 p-1.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                      isToday ? 'bg-brand-600 text-white' : 'text-slate-700'
                    }`}>{day}</div>
                    <div className="space-y-0.5">
                      {dayJobs.slice(0, 3).map(job => (
                        <div key={job.id} className="text-xs px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 truncate">
                          {job.scheduledTime && <span className="opacity-70">{job.scheduledTime} </span>}
                          {job.title}
                        </div>
                      ))}
                      {dayJobs.length > 3 && (
                        <div className="text-xs text-slate-500 px-1">+{dayJobs.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Select a date'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="divide-y divide-slate-50">
              {selectedJobs.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-slate-500">No jobs scheduled</p>
                  <Link href="/jobs/new" className="mt-3 inline-block">
                    <Button size="sm" variant="outline"><Plus size={14} />New Job</Button>
                  </Link>
                </div>
              ) : (
                selectedJobs.map(job => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="block px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{job.customerName}</p>
                        {job.scheduledTime && <p className="text-xs text-brand-600 mt-1">{job.scheduledTime}</p>}
                      </div>
                      <Badge status={job.status} size="sm" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
