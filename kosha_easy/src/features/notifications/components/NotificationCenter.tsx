'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, useNotificationStats } from '../hooks/useNotifications';
import { NotificationList } from './NotificationList';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const { data: stats } = useNotificationStats(userId);
  const { data: notifications, isLoading } = useNotifications(userId);

  const unreadCount = stats?.unread || 0;
  const recentNotifications = notifications?.slice(0, 5) || [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <>
              <span
                className={cn(
                  'absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full',
                  unreadCount > 99 && 'px-1.5'
                )}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              {/* Pulse animation for new notifications */}
              <span className="absolute top-0 right-0 w-[18px] h-[18px] bg-red-600 rounded-full animate-ping opacity-75" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[400px] p-0">
        {/* Header */}
        <div className="p-4 border-b border-grayscale-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-grayscale-900">알림</h3>
            {notifications && notifications.length > 5 && (
              <Link
                href="/notifications"
                className="text-sm text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                모두 보기
              </Link>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto p-3">
          <NotificationList
            notifications={recentNotifications}
            userId={userId}
            isLoading={isLoading}
            onNotificationClick={() => setOpen(false)}
            showActions={false}
          />
        </div>

        {/* Footer */}
        {notifications && notifications.length > 0 && (
          <div className="p-3 border-t border-grayscale-200">
            <Link
              href="/notifications"
              className="block text-center text-sm text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              알림 전체 보기
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
