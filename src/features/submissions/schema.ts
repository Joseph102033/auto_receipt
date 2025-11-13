/**
 * Submission Validation Schemas
 *
 * Zod schemas for submission validation
 */

import { z } from 'zod';

/**
 * Schema for creating a submission
 */
export const createSubmissionSchema = z
  .object({
    roundId: z.string().uuid('유효한 차수 ID가 아닙니다'),
    participantId: z.string().uuid('유효한 참여자 ID가 아닙니다'),
    documentName: z
      .string()
      .min(1, '문서명을 입력해주세요')
      .max(100, '문서명은 100자 이하여야 합니다'),
    status: z.enum(['submitted', 'not_submitted', 'not_applicable'], {
      errorMap: () => ({ message: '유효한 제출 상태가 아닙니다' }),
    }),
    notApplicableReason: z.string().optional(),

    // Amount fields
    amountTransport: z.number().int().nonnegative('운임은 0 이상이어야 합니다').optional(),
    amountAccommodation: z
      .number()
      .int()
      .nonnegative('숙박비는 0 이상이어야 합니다')
      .optional(),
    amountEtc: z.number().int().nonnegative('기타 금액은 0 이상이어야 합니다').optional(),
    amountNote: z.string().max(500, '메모는 500자 이하여야 합니다').optional(),
  })
  .refine(
    (data) => {
      // If status is 'submitted', amounts must be provided
      if (data.status === 'submitted') {
        return (
          data.amountTransport !== undefined &&
          data.amountAccommodation !== undefined
        );
      }
      return true;
    },
    {
      message: '제출 시 운임과 숙박비는 필수입니다',
      path: ['amountTransport'],
    }
  )
  .refine(
    (data) => {
      // If status is 'not_applicable', reason must be provided
      if (data.status === 'not_applicable') {
        return data.notApplicableReason && data.notApplicableReason.trim().length > 0;
      }
      return true;
    },
    {
      message: '해당 없음 사유를 입력해주세요',
      path: ['notApplicableReason'],
    }
  );

/**
 * Schema for updating a submission
 */
export const updateSubmissionSchema = z
  .object({
    id: z.string().uuid('유효한 제출 ID가 아닙니다'),
    status: z.enum(['submitted', 'not_submitted', 'not_applicable']).optional(),
    notApplicableReason: z.string().optional(),

    amountTransport: z.number().int().nonnegative('운임은 0 이상이어야 합니다').optional(),
    amountAccommodation: z
      .number()
      .int()
      .nonnegative('숙박비는 0 이상이어야 합니다')
      .optional(),
    amountEtc: z.number().int().nonnegative('기타 금액은 0 이상이어야 합니다').optional(),
    amountNote: z.string().max(500, '메모는 500자 이하여야 합니다').optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'submitted') {
        return (
          data.amountTransport !== undefined &&
          data.amountAccommodation !== undefined
        );
      }
      return true;
    },
    {
      message: '제출 시 운임과 숙박비는 필수입니다',
      path: ['amountTransport'],
    }
  )
  .refine(
    (data) => {
      if (data.status === 'not_applicable') {
        return data.notApplicableReason && data.notApplicableReason.trim().length > 0;
      }
      return true;
    },
    {
      message: '해당 없음 사유를 입력해주세요',
      path: ['notApplicableReason'],
    }
  );

/**
 * Schema for file upload validation
 */
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: '파일 크기는 10MB 이하여야 합니다',
    })
    .refine(
      (file) => {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/haansofthwp',
          'application/x-hwp',
        ];
        return allowedTypes.includes(file.type) || file.name.endsWith('.hwp');
      },
      {
        message: '허용된 파일 형식: PDF, DOC, DOCX, HWP',
      }
    ),
});

/**
 * Client-side form schema (without file validation)
 */
export const submissionFormSchema = z
  .object({
    documentName: z
      .string()
      .min(1, '문서명을 입력해주세요')
      .max(100, '문서명은 100자 이하여야 합니다'),
    status: z.enum(['submitted', 'not_applicable'], {
      errorMap: () => ({ message: '제출 상태를 선택해주세요' }),
    }),
    notApplicableReason: z.string().optional(),

    amountTransport: z
      .number({ invalid_type_error: '운임을 입력해주세요' })
      .int('정수로 입력해주세요')
      .nonnegative('0 이상의 금액을 입력해주세요')
      .optional(),
    amountAccommodation: z
      .number({ invalid_type_error: '숙박비를 입력해주세요' })
      .int('정수로 입력해주세요')
      .nonnegative('0 이상의 금액을 입력해주세요')
      .optional(),
    amountEtc: z
      .number()
      .int('정수로 입력해주세요')
      .nonnegative('0 이상의 금액을 입력해주세요')
      .optional()
      .or(z.literal(0)),
    amountNote: z.string().max(500, '메모는 500자 이하여야 합니다').optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'submitted') {
        return (
          data.amountTransport !== undefined &&
          data.amountTransport !== null &&
          data.amountAccommodation !== undefined &&
          data.amountAccommodation !== null
        );
      }
      return true;
    },
    {
      message: '제출 시 운임과 숙박비는 필수입니다',
      path: ['amountTransport'],
    }
  )
  .refine(
    (data) => {
      if (data.status === 'not_applicable') {
        return data.notApplicableReason && data.notApplicableReason.trim().length > 0;
      }
      return true;
    },
    {
      message: '해당 없음 사유를 입력해주세요',
      path: ['notApplicableReason'],
    }
  );

export type SubmissionFormData = z.infer<typeof submissionFormSchema>;
