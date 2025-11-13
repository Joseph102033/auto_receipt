'use client';

import { Notification } from '../types';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarkAsRead, useDeleteNotification } from '../hooks/useNotifications';
import { Button } from '@/components/ui/button';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  showActions?: boolean;
}

export function NotificationItem({ notification, onClick, showActions = true }: NotificationItemProps) {
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  const handleClick = () => {
    if (notification.status === 'unread') {
      markAsRead.mutate(notification.id);
    }
    onClick?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 알림을 삭제하시겠습니까?')) {
      deleteNotification.mutate(notification.id);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'system':
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className={cn(
        'group relative flex gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
        notification.status === 'unread'
          ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-100/50'
          : 'bg-white border-grayscale-200 hover:bg-grayscale-50'
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 p-2 rounded-full', getPriorityColor())}>{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4
            className={cn(
              'text-sm font-medium truncate',
              notification.status === 'unread' ? 'text-grayscale-900' : 'text-grayscale-700'
            )}
          >
            {notification.title}
          </h4>
          {notification.status === 'unread' && (
            <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </div>

        <p
          className={cn(
            'text-sm mb-2 line-clamp-2',
            notification.status === 'unread' ? 'text-grayscale-700' : 'text-grayscale-600'
          )}
        >
          {notification.message}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-grayscale-500">{formatDate(notification.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 text-grayscale-500" />
        </Button>
      )}
    </div>
  );
}
