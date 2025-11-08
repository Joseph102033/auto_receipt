/**
 * Participant Validation Schemas
 *
 * Zod schemas for Participant entity validation
 */

import { z } from 'zod';

/**
 * Schema for creating a new Participant
 */
export const createParticipantSchema = z.object({
  name: z
    .string()
    .min(1, '이름을 입력해주세요')
    .max(50, '이름은 50자 이내로 입력해주세요'),
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^[0-9-+()]*$/, '올바른 전화번호 형식이 아닙니다')
    .optional(),
  department: z
    .string()
    .max(50, '부서명은 50자 이내로 입력해주세요')
    .optional(),
  position: z
    .string()
    .max(50, '직급은 50자 이내로 입력해주세요')
    .optional(),
});

/**
 * Schema for updating an existing Participant
 */
export const updateParticipantSchema = z.object({
  id: z.string().min(1, 'Participant ID가 필요합니다'),
  name: z
    .string()
    .min(1, '이름을 입력해주세요')
    .max(50, '이름은 50자 이내로 입력해주세요')
    .optional(),
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다')
    .optional(),
  phone: z
    .string()
    .regex(/^[0-9-+()]*$/, '올바른 전화번호 형식이 아닙니다')
    .optional(),
  department: z
    .string()
    .max(50, '부서명은 50자 이내로 입력해주세요')
    .optional(),
  position: z
    .string()
    .max(50, '직급은 50자 이내로 입력해주세요')
    .optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

/**
 * Schema for bulk import validation
 */
export const bulkImportSchema = z.array(
  z.object({
    name: z.string().min(1, '이름은 필수입니다'),
    email: z.string().email('올바른 이메일 형식이 아닙니다').optional().or(z.literal('')),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
  })
).min(1, '최소 1명 이상의 참여자가 필요합니다');

export type CreateParticipantFormData = z.infer<typeof createParticipantSchema>;
export type UpdateParticipantFormData = z.infer<typeof updateParticipantSchema>;
export type BulkImportData = z.infer<typeof bulkImportSchema>;
