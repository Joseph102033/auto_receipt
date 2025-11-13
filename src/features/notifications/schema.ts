/**
 * Notification Validation Schemas
 *
 * Zod schemas for notification validation
 */

import { z } from 'zod';

export const sendNotificationSchema = z.object({
  type: z.enum(['email', 'sms', 'system'], {
    required_error: '알림 유형을 선택해주세요',
  }),
  recipientIds: z
    .array(z.string())
    .min(1, '최소 1명의 수신자를 선택해주세요')
    .max(100, '최대 100명까지 선택 가능합니다'),
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자 이내로 입력해주세요'),
  message: z
    .string()
    .min(1, '메시지를 입력해주세요')
    .max(1000, '메시지는 1000자 이내로 입력해주세요'),
  roundId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  templateId: z.string().optional(),
});

export const notificationTemplateSchema = z.object({
  name: z
    .string()
    .min(1, '템플릿 이름을 입력해주세요')
    .max(50, '템플릿 이름은 50자 이내로 입력해주세요'),
  type: z.enum(['email', 'sms', 'system'], {
    required_error: '알림 유형을 선택해주세요',
  }),
  subject: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자 이내로 입력해주세요'),
  body: z
    .string()
    .min(1, '본문을 입력해주세요')
    .max(2000, '본문은 2000자 이내로 입력해주세요'),
  variables: z.array(z.string()).default([]),
});

export type SendNotificationFormData = z.infer<typeof sendNotificationSchema>;
export type NotificationTemplateFormData = z.infer<typeof notificationTemplateSchema>;
