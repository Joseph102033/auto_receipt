/**
 * Participant Management React Query Hooks
 *
 * Custom hooks for managing participants with React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  fetchParticipants,
  fetchParticipant,
  fetchParticipantStats,
  createParticipant,
  updateParticipant,
  deleteParticipant,
  bulkImportParticipants,
  fetchDepartments,
} from '../api';
import { CreateParticipantInput, UpdateParticipantInput, ParticipantFilter, BulkImportParticipant } from '../types';

// Query keys
export const participantKeys = {
  all: ['participants'] as const,
  lists: () => [...participantKeys.all, 'list'] as const,
  list: (filters?: ParticipantFilter) => [...participantKeys.lists(), filters] as const,
  details: () => [...participantKeys.all, 'detail'] as const,
  detail: (id: string) => [...participantKeys.details(), id] as const,
  stats: () => [...participantKeys.all, 'stats'] as const,
  departments: () => [...participantKeys.all, 'departments'] as const,
};

/**
 * Hook to fetch all participants with optional filtering
 */
export function useParticipants(filter?: ParticipantFilter) {
  return useQuery({
    queryKey: participantKeys.list(filter),
    queryFn: () => fetchParticipants(filter),
  });
}

/**
 * Hook to fetch a single participant by ID
 */
export function useParticipant(id: string) {
  return useQuery({
    queryKey: participantKeys.detail(id),
    queryFn: () => fetchParticipant(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch participant statistics
 */
export function useParticipantStats() {
  return useQuery({
    queryKey: participantKeys.stats(),
    queryFn: fetchParticipantStats,
  });
}

/**
 * Hook to fetch unique departments
 */
export function useDepartments() {
  return useQuery({
    queryKey: participantKeys.departments(),
    queryFn: fetchDepartments,
  });
}

/**
 * Hook to create a new participant
 */
export function useCreateParticipant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createParticipant,
    onSuccess: () => {
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: participantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: participantKeys.stats() });
      queryClient.invalidateQueries({ queryKey: participantKeys.departments() });

      toast({
        title: '성공',
        description: '새로운 참여자가 추가되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '오류',
        description: error.message || '참여자 추가에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update an existing participant
 */
export function useUpdateParticipant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateParticipant,
    onSuccess: (data) => {
      // Invalidate and refetch both list and detail
      queryClient.invalidateQueries({ queryKey: participantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: participantKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: participantKeys.stats() });

      toast({
        title: '성공',
        description: '참여자 정보가 수정되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '오류',
        description: error.message || '참여자 수정에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to delete a participant
 */
export function useDeleteParticipant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteParticipant,
    onSuccess: () => {
      // Invalidate and refetch participants list
      queryClient.invalidateQueries({ queryKey: participantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: participantKeys.stats() });

      toast({
        title: '성공',
        description: '참여자가 삭제되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '오류',
        description: error.message || '참여자 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for bulk import of participants
 */
export function useBulkImportParticipants() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: bulkImportParticipants,
    onSuccess: (result) => {
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: participantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: participantKeys.stats() });
      queryClient.invalidateQueries({ queryKey: participantKeys.departments() });

      if (result.failed > 0) {
        toast({
          title: '일부 성공',
          description: `${result.success}명 등록, ${result.failed}명 실패`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '성공',
          description: `${result.success}명의 참여자가 일괄 등록되었습니다.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: '오류',
        description: error.message || '일괄 등록에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });
}
