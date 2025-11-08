'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { RoundList } from '@/features/rounds/components/RoundList';
import { RoundForm } from '@/features/rounds/components/RoundForm';
import { useRounds, useCreateRound, useDeleteRound } from '@/features/rounds/hooks/useRounds';
import { CreateRoundFormData } from '@/features/rounds/schema';

export default function AdminRoundsPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: rounds = [], isLoading, error } = useRounds();
  const createMutation = useCreateRound();
  const deleteMutation = useDeleteRound();

  const handleCreate = async (data: CreateRoundFormData) => {
    try {
      await createMutation.mutateAsync({
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        budgetCode: data.budgetCode,
        participants: data.participants,
        requiredDocuments: data.requiredDocuments,
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create round:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete round:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-grayscale-900">차수 관리</h1>
            <p className="text-grayscale-600 mt-1">문서 제출 차수를 관리하고 현황을 확인하세요</p>
          </div>

          {/* Create Round Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                새로 만들기
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>새 차수 만들기</DialogTitle>
                <DialogDescription>문서 제출 차수를 생성합니다</DialogDescription>
              </DialogHeader>
              <RoundForm onSubmit={handleCreate} isLoading={createMutation.isPending} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-grayscale-600">차수 목록을 불러오는 중...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">차수 목록을 불러오는데 실패했습니다</p>
          </div>
        )}

        {/* Rounds List */}
        {!isLoading && !error && (
          <RoundList
            rounds={rounds}
            onDelete={handleDelete}
            isDeletingId={deleteMutation.isPending ? (deleteMutation as any).variables : undefined}
          />
        )}
      </div>
    </AdminLayout>
  );
}

