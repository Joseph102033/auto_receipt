/**
 * Round Management React Query Hooks
 *
 * Custom hooks for managing rounds with React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  fetchRounds,
  fetchRound,
  fetchParticipantRounds,
  createRound,
  updateRound,
  deleteRound,
  fetchParticipants,
} from '../api';
import { CreateRoundInput, UpdateRoundInput } from '../types';

// Query keys
export const roundKeys = {
  all: ['rounds'] as const,
  lists: () => [...roundKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...roundKeys.lists(), filters] as const,
  details: () => [...roundKeys.all, 'detail'] as const,
  detail: (id: string) => [...roundKeys.details(), id] as const,
  participantRounds: () => [...roundKeys.all, 'participant'] as const,
  participants: ['participants'] as const,
};

/**
 * Hook to fetch all rounds
 */
export function useRounds() {
  return useQuery({
    queryKey: roundKeys.lists(),
    queryFn: fetchRounds,
  });
}

/**
 * Hook to fetch a single round by ID
 */
export function useRound(id: string) {
  return useQuery({
    queryKey: roundKeys.detail(id),
    queryFn: () => fetchRound(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch rounds for the current participant
 */
export function useParticipantRounds() {
  return useQuery({
    queryKey: roundKeys.participantRounds(),
    queryFn: fetchParticipantRounds,
  });
}

/**
 * Hook to fetch all available participants
 */
export function useParticipants() {
  return useQuery({
    queryKey: roundKeys.participants,
    queryFn: fetchParticipants,
  });
}

/**
 * Hook to create a new round
 */
export function useCreateRound() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createRound,
    onSuccess: () => {
      // Invalidate and refetch rounds list
      queryClient.invalidateQueries({ queryKey: roundKeys.lists() });

      toast({
        title: '성공',
        description: '새로운 차수가 생성되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '오류',
        description: error.message || '차수 생성에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update an existing round
 */
export function useUpdateRound() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateRound,
    onSuccess: (data) => {
      // Invalidate and refetch both list and detail
      queryClient.invalidateQueries({ queryKey: roundKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roundKeys.detail(data.id) });

      toast({
        title: '성공',
        description: '차수가 수정되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '오류',
        description: error.message || '차수 수정에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to delete a round
 */
export function useDeleteRound() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteRound,
    onSuccess: () => {
      // Invalidate and refetch rounds list
      queryClient.invalidateQueries({ queryKey: roundKeys.lists() });

      toast({
        title: '성공',
        description: '차수가 삭제되었습니다.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '오류',
        description: error.message || '차수 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });
}
