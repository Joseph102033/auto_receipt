'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';
import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
  userEmail?: string;
  userId?: string;
}

export function Navbar({ userEmail: propUserEmail, userId: propUserId }: NavbarProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(propUserEmail || '');
  const [userId, setUserId] = useState(propUserId || '');

  useEffect(() => {
    const supabase = createClient();

    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || '');
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-grayscale-200 sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">문서 제출 관리 시스템</h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {/* Notification Center */}
            {userId && <NotificationCenter userId={userId} />}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-grayscale-700">
                  {userEmail || '사용자'}
                </div>
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
