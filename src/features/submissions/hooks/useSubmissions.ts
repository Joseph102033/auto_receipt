/**
 * Submission Hooks
 *
 * React Query hooks for submission management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createSubmission,
  updateSubmission,
  deleteSubmission,
  fetchSubmissionsByRound,
  fetchSubmissionsByParticipant,
  fetchSubmission,
  getAmountStatsByRound,
  getParticipantAmountSummary,
} from '../api';
import type { CreateSubmissionRequest, UpdateSubmissionRequest } from '../types';

// Query keys
export const submissionKeys = {
  all: ['submissions'] as const,
  lists: () => [...submissionKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...submissionKeys.lists(), filters] as const,
  byRound: (roundId: string) => [...submissionKeys.all, 'round', roundId] as const,
  byParticipant: (participantId: string) =>
    [...submissionKeys.all, 'participant', participantId] as const,
  details: () => [...submissionKeys.all, 'detail'] as const,
  detail: (id: string) => [...submissionKeys.details(), id] as const,
  stats: () => [...submissionKeys.all, 'stats'] as const,
  amountStats: (roundId: string) => [...submissionKeys.stats(), 'amount', roundId] as const,
  participantSummary: (roundId: string) =>
    [...submissionKeys.stats(), 'participant-summary', roundId] as const,
};

/**
 * Hook to fetch submissions for a round
 */
export function useSubmissionsByRound(roundId: string) {
  return useQuery({
    queryKey: submissionKeys.byRound(roundId),
    queryFn: () => fetchSubmissionsByRound(roundId),
    enabled: !!roundId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch submissions for a participant
 */
export function useSubmissionsByParticipant(participantId: string) {
  return useQuery({
    queryKey: submissionKeys.byParticipant(participantId),
    queryFn: () => fetchSubmissionsByParticipant(participantId),
    enabled: !!participantId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to fetch a single submission
 */
export function useSubmission(id: string) {
  return useQuery({
    queryKey: submissionKeys.detail(id),
    queryFn: () => fetchSubmission(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch amount statistics for a round
 */
export function useAmountStats(roundId: string) {
  return useQuery({
    queryKey: submissionKeys.amountStats(roundId),
    queryFn: () => getAmountStatsByRound(roundId),
    enabled: !!roundId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch participant amount summary for a round
 */
export function useParticipantAmountSummary(roundId: string) {
  return useQuery({
    queryKey: submissionKeys.participantSummary(roundId),
    queryFn: () => getParticipantAmountSummary(roundId),
    enabled: !!roundId,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to create a submission
 */
export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateSubmissionRequest) => createSubmission(request),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: submissionKeys.all });
      queryClient.invalidateQueries({ queryKey: submissionKeys.byRound(data.roundId) });
      queryClient.invalidateQueries({
        queryKey: submissionKeys.byParticipant(data.participantId),
      });

      toast.success('문서가 성공적으로 제출되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '제출에 실패했습니다');
    },
  });
}

/**
 * Hook to update a submission
 */
export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateSubmissionRequest) => updateSubmission(request),
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: submissionKeys.all });
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: submissionKeys.byRound(data.roundId) });
      queryClient.invalidateQueries({
        queryKey: submissionKeys.byParticipant(data.participantId),
      });

      toast.success('문서가 성공적으로 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '수정에 실패했습니다');
    },
  });
}

/**
 * Hook to delete a submission
 */
export function useDeleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSubmission(id),
    onSuccess: () => {
      // Invalidate all submission queries
      queryClient.invalidateQueries({ queryKey: submissionKeys.all });

      toast.success('문서가 성공적으로 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '삭제에 실패했습니다');
    },
  });
}
