/**
 * Notification Types
 *
 * Type definitions for the notification system
 */

export type NotificationType = 'email' | 'sms' | 'system';
export type NotificationStatus = 'unread' | 'read';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  priority: NotificationPriority;
  title: string;
  message: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  senderId?: string;
  senderName?: string;
  roundId?: string;
  roundTitle?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject: string;
  body: string;
  variables: string[]; // e.g., ['participantName', 'roundTitle', 'deadline']
  createdAt: string;
  updatedAt: string;
}

export interface SendNotificationRequest {
  type: NotificationType;
  recipientIds: string[];
  title: string;
  message: string;
  roundId?: string;
  priority?: NotificationPriority;
  templateId?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: {
    email: number;
    sms: number;
    system: number;
  };
}
