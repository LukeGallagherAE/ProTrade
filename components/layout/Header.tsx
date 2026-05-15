'use client';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/jobs': 'Jobs',
  '/customers': 'Customers',
  '/quotes': 'Quotes',
  '/invoices': 'Invoices',
  '/schedule': 'Schedule',
  '/team': 'Team',
};

export default function Header() {
  const pathname = usePathname();
  const title = Object.entries(titles).find(([k]) => k === '/' ? pathname === '/' : pathname.startsWith(k))?.[1] ?? 'ProTrade';

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 left-60 right-0 z-20">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
          <Search size={18} />
        </button>
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
