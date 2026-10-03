'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bike, Inbox, LayoutDashboard, LogOut, PlusSquare, Tag } from 'lucide-react';
import { signOut } from '@/app/admin/actions';

const ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bikes', label: 'Manage Bikes', icon: Bike, exact: true },
  { href: '/admin/bikes/new', label: 'Add New Bike', icon: PlusSquare, exact: true },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
  { href: '/admin/sell-requests', label: 'Sell Requests', icon: Tag },
];

export default function AdminNav({ email }: { email?: string }) {
  const pathname = usePathname();
  return (
    <aside className="border-b border-border bg-surface shadow-sm lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:py-6">
        <Link href="/admin" className="font-display text-lg font-extrabold italic text-primary">SELVI <span className="text-accent">MOTORS</span></Link>
        {email && <p className="mt-1 hidden truncate text-xs text-text/60 lg:block">{email}</p>}
        <form action={signOut} className="lg:hidden"><button className="text-xs text-text/60 hover:text-primary">Logout</button></form>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Admin">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const on = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${on ? 'bg-primary text-white font-semibold shadow-sm' : 'text-text hover:bg-surface-muted hover:text-primary'}`}>
              <Icon size={16} className={on ? 'text-white' : 'text-text/60'} />{label}
            </Link>
          );
        })}
      </nav>
      <form action={signOut} className="hidden p-3 lg:block">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-text/70 hover:bg-surface-muted hover:text-primary font-medium transition-colors"><LogOut size={16} />Logout</button>
      </form>
    </aside>
  );
}
