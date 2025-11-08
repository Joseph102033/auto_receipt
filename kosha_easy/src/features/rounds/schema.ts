/**
 * Round Validation Schemas
 *
 * Zod schemas for Round entity validation
 */

import { z } from 'zod';

/**
 * Schema for creating a new Round
 */
export const createRoundSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자 이내로 입력해주세요'),
  description: z
    .string()
    .min(1, '설명을 입력해주세요')
    .max(500, '설명은 500자 이내로 입력해주세요'),
  startDate: z
    .string()
    .min(1, '시작일을 선택해주세요')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, '유효한 날짜를 입력해주세요'),
  endDate: z
    .string()
    .min(1, '종료일을 선택해주세요')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, '유효한 날짜를 입력해주세요'),
  budgetCode: z
    .string()
    .max(50, '예산 코드는 50자 이내로 입력해주세요')
    .optional(),
  participants: z
    .array(z.string())
    .min(1, '최소 1명의 참여자를 선택해주세요'),
  requiredDocuments: z
    .array(z.string())
    .min(1, '최소 1개의 필수 문서를 입력해주세요'),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  {
    message: '종료일은 시작일과 같거나 늦어야 합니다',
    path: ['endDate'],
  }
);

/**
 * Schema for updating an existing Round
 */
export const updateRoundSchema = z.object({
  id: z.string().min(1, 'Round ID가 필요합니다'),
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자 이내로 입력해주세요')
    .optional(),
  description: z
    .string()
    .min(1, '설명을 입력해주세요')
    .max(500, '설명은 500자 이내로 입력해주세요')
    .optional(),
  startDate: z
    .string()
    .min(1, '시작일을 선택해주세요')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, '유효한 날짜를 입력해주세요')
    .optional(),
  endDate: z
    .string()
    .min(1, '종료일을 선택해주세요')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, '유효한 날짜를 입력해주세요')
    .optional(),
  budgetCode: z
    .string()
    .max(50, '예산 코드는 50자 이내로 입력해주세요')
    .optional(),
  participants: z
    .array(z.string())
    .min(1, '최소 1명의 참여자를 선택해주세요')
    .optional(),
  requiredDocuments: z
    .array(z.string())
    .min(1, '최소 1개의 필수 문서를 입력해주세요')
    .optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    }
    return true;
  },
  {
    message: '종료일은 시작일과 같거나 늦어야 합니다',
    path: ['endDate'],
  }
);

export type CreateRoundFormData = z.infer<typeof createRoundSchema>;
export type UpdateRoundFormData = z.infer<typeof updateRoundSchema>;
