"use client";

import { Header } from './Header';
import { Footer } from './Footer';
import { SyncStatus } from '../SyncStatus';
import { Sidebar } from './Sidebar';

interface PainelLayoutProps {
  children: React.ReactNode;
}

export function PainelLayout({ children }: PainelLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
          <Footer />
        </main>
        <SyncStatus />
      </div>
    </div>
  );
} 