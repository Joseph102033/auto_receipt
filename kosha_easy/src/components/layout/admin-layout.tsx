'use client';

import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-grayscale-50">
      <Navbar userEmail="admin@example.com" />
      <Sidebar />
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 mt-16">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
