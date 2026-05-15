'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Receipt,
  Calendar,
  UserCog,
  Wrench,
  ChevronRight,
} from 'lucide-react';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/quotes', label: 'Quotes', icon: FileText },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/team', label: 'Team', icon: UserCog },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-slate-900 flex flex-col z-30">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Wrench size={16} className="text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-base leading-none">ProTrade</span>
          <p className="text-slate-400 text-xs mt-0.5">Field Service Platform</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">JM</span>
          </div>
          <div className="min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate">James Mitchell</p>
            <p className="text-slate-500 text-xs">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
