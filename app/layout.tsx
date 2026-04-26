import './globals.css';
import Providers from './providers';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'AdivoComics',
  description: 'Ultra‑lightweight premium comic reading platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 pb-16">{children}</main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}