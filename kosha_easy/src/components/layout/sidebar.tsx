'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '차수 관리', href: '/admin/rounds', icon: FileText },
  { name: '참여자 관리', href: '/admin/participants', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 mt-16">
      <div className="flex flex-col flex-grow bg-white border-r border-grayscale-200 pt-5 overflow-y-auto">
        <div className="flex-1 flex flex-col">
          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-primary-light/10 text-primary'
                      : 'text-grayscale-700 hover:bg-grayscale-100 hover:text-grayscale-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-primary' : 'text-grayscale-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

