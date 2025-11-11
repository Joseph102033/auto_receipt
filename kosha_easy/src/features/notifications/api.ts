/**
 * Notification API - Supabase Implementation
 */

import { createClient } from '@/lib/supabase/client';
import { Notification, NotificationStats, SendNotificationRequest, NotificationTemplate } from './types';

/**
 * Fetch notifications for a user
 */
export async function fetchNotifications(userId: string, status?: 'read' | 'unread'): Promise<Notification[]> {
  const supabase = createClient();

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`알림 조회 실패: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    type: item.type,
    status: item.status,
    priority: item.priority,
    title: item.title,
    message: item.message,
    recipientId: item.recipient_id,
    senderId: item.sender_id,
    roundId: item.round_id,
    createdAt: item.created_at,
    readAt: item.read_at,
  }));
}

/**
 * Fetch notification by ID
 */
export async function fetchNotification(id: string): Promise<Notification> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error('알림을 찾을 수 없습니다');
  }

  return {
    id: data.id,
    type: data.type,
    status: data.status,
    priority: data.priority,
    title: data.title,
    message: data.message,
    recipientId: data.recipient_id,
    senderId: data.sender_id,
    roundId: data.round_id,
    createdAt: data.created_at,
    readAt: data.read_at,
  };
}

/**
 * Mark notification as read
 */
export async function markAsRead(id: string): Promise<Notification> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notifications')
    .update({
      status: 'read',
      read_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new Error('알림 읽음 처리 실패');
  }

  return {
    id: data.id,
    type: data.type,
    status: data.status,
    priority: data.priority,
    title: data.title,
    message: data.message,
    recipientId: data.recipient_id,
    senderId: data.sender_id,
    roundId: data.round_id,
    createdAt: data.created_at,
    readAt: data.read_at,
  };
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .update({
      status: 'read',
      read_at: new Date().toISOString(),
    })
    .eq('recipient_id', userId)
    .eq('status', 'unread');

  if (error) {
    throw new Error('전체 읽음 처리 실패');
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('알림 삭제 실패');
  }
}

/**
 * Send notification
 */
export async function sendNotification(request: SendNotificationRequest): Promise<Notification[]> {
  const supabase = createClient();

  // Get current user info for sender
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('로그인이 필요합니다');
  }

  const senderId = user.id;
  const senderName = user.email || '시스템';

  // Fetch recipient info
  const { data: recipients, error: recipientsError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', request.recipientIds);

  if (recipientsError) {
    throw new Error(`수신자 정보 조회 실패: ${recipientsError.message}`);
  }

  // Get round title if roundId is provided
  let roundTitle = '';
  if (request.roundId) {
    const { data: round } = await supabase
      .from('rounds')
      .select('title')
      .eq('id', request.roundId)
      .single();
    roundTitle = round?.title || '';
  }

  // Create notifications for each recipient
  const notifications = (recipients || []).map((recipient: any) => ({
    type: request.type,
    status: 'unread',
    priority: request.priority || 'medium',
    title: request.title,
    message: request.message,
    recipient_id: recipient.id,
    sender_id: senderId,
    round_id: request.roundId || null,
  }));

  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select();

  if (error) {
    throw new Error(`알림 발송 실패: ${error.message}`);
  }

  // Send actual SMS if type is 'sms'
  if (request.type === 'sms') {
    const phoneNumbers = (recipients || [])
      .map((r: any) => r.phone)
      .filter((phone: string) => phone && phone.trim() !== '');

    if (phoneNumbers.length > 0) {
      try {
        await fetch('/api/sms/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: phoneNumbers,
            message: request.message,
          }),
        });
      } catch (smsError) {
        console.error('Failed to send SMS:', smsError);
        // Don't throw - notification was saved, just SMS failed
      }
    }
  }

  // TODO: Send actual email based on type

  return (data || []).map((item: any) => ({
    id: item.id,
    type: item.type,
    status: item.status,
    priority: item.priority,
    title: item.title,
    message: item.message,
    recipientId: item.recipient_id,
    senderId: item.sender_id,
    roundId: item.round_id,
    createdAt: item.created_at,
    readAt: item.read_at,
  }));
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(userId: string): Promise<NotificationStats> {
  const supabase = createClient();

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('status, type')
    .eq('recipient_id', userId);

  if (error) {
    throw new Error(`통계 조회 실패: ${error.message}`);
  }

  const total = notifications?.length || 0;
  const unread = notifications?.filter((n) => n.status === 'unread').length || 0;
  const read = notifications?.filter((n) => n.status === 'read').length || 0;

  return {
    total,
    unread,
    read,
    byType: {
      email: notifications?.filter((n) => n.type === 'email').length || 0,
      sms: notifications?.filter((n) => n.type === 'sms').length || 0,
      system: notifications?.filter((n) => n.type === 'system').length || 0,
    },
  };
}

/**
 * Fetch notification templates
 */
export async function fetchTemplates(): Promise<NotificationTemplate[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notification_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`템플릿 조회 실패: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    subject: item.subject,
    body: item.body,
    variables: item.variables || [],
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

/**
 * Fetch template by ID
 */
export async function fetchTemplate(id: string): Promise<NotificationTemplate> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error('템플릿을 찾을 수 없습니다');
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    subject: data.subject,
    body: data.body,
    variables: data.variables || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
