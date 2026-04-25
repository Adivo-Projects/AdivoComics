"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
  { href: '/search', label: 'Search', special: true },
  { href: '/library', label: 'Library' },
  { href: '/profile', label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-neutral-800 flex justify-around items-center h-16 text-sm z-10">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 text-center py-3 ${active ? 'text-primary-dark' : 'text-muted'} ${item.special ? 'font-semibold' : ''}`}
            aria-label={item.label}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}