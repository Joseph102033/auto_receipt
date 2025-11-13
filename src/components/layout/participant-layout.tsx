'use client';

import { Navbar } from './navbar';

interface ParticipantLayoutProps {
  children: React.ReactNode;
}

export function ParticipantLayout({ children }: ParticipantLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <Navbar userEmail="participant@example.com" />
      <main className="mt-16">
        <div className="py-6">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
