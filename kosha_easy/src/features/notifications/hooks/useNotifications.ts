/**
 * Notification Hooks
 *
 * React Query hooks for notification management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchNotifications,
  fetchNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
  getNotificationStats,
  fetchTemplates,
  fetchTemplate,
} from '../api';
import { SendNotificationRequest } from '../types';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (userId: string, status?: 'read' | 'unread') =>
    [...notificationKeys.lists(), { userId, status }] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  stats: (userId: string) => [...notificationKeys.all, 'stats', userId] as const,
  templates: ['notification-templates'] as const,
  template: (id: string) => [...notificationKeys.templates, id] as const,
};

/**
 * Hook to fetch notifications for a user
 */
export function useNotifications(userId: string, status?: 'read' | 'unread') {
  return useQuery({
    queryKey: notificationKeys.list(userId, status),
    queryFn: () => fetchNotifications(userId, status),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single notification
 */
export function useNotification(id: string) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => fetchNotification(id),
    enabled: !!id,
  });
}

/**
 * Hook to get notification statistics
 */
export function useNotificationStats(userId: string) {
  return useQuery({
    queryKey: notificationKeys.stats(userId),
    queryFn: () => getNotificationStats(userId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('모든 알림을 읽음으로 표시했습니다');
    },
    onError: () => {
      toast.error('알림 업데이트에 실패했습니다');
    },
  });
}

/**
 * Hook to delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success('알림이 삭제되었습니다');
    },
    onError: () => {
      toast.error('알림 삭제에 실패했습니다');
    },
  });
}

/**
 * Hook to send notification
 */
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendNotificationRequest) => sendNotification(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success(`${data.length}명에게 알림을 발송했습니다`);
    },
    onError: () => {
      toast.error('알림 발송에 실패했습니다');
    },
  });
}

/**
 * Hook to fetch notification templates
 */
export function useTemplates() {
  return useQuery({
    queryKey: notificationKeys.templates,
    queryFn: fetchTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single template
 */
export function useTemplate(id: string) {
  return useQuery({
    queryKey: notificationKeys.template(id),
    queryFn: () => fetchTemplate(id),
    enabled: !!id,
  });
}
