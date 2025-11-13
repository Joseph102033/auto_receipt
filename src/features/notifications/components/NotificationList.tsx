'use client';

import { Notification } from '../types';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { CheckCheck, Loader2 } from 'lucide-react';
import { useMarkAllAsRead } from '../hooks/useNotifications';

interface NotificationListProps {
  notifications: Notification[];
  userId: string;
  isLoading?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  showActions?: boolean;
}

export function NotificationList({
  notifications,
  userId,
  isLoading,
  onNotificationClick,
  showActions = true,
}: NotificationListProps) {
  const markAllAsRead = useMarkAllAsRead();
  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(userId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-grayscale-400" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-grayscale-500">알림이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      {showActions && unreadCount > 0 && (
        <div className="flex items-center justify-between pb-2 border-b border-grayscale-200">
          <span className="text-sm text-grayscale-600">
            {unreadCount}개의 읽지 않은 알림
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            모두 읽음
          </Button>
        </div>
      )}

      {/* Notification Items */}
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => onNotificationClick?.(notification)}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  );
}
