'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, Search } from 'lucide-react';
import { ParticipantList } from '@/features/participants/components/ParticipantList';
import { ParticipantForm } from '@/features/participants/components/ParticipantForm';
import { BulkImportDialog } from '@/features/participants/components/BulkImportDialog';
import {
  useParticipants,
  useParticipantStats,
  useCreateParticipant,
  useUpdateParticipant,
  useDeleteParticipant,
  useDepartments,
} from '@/features/participants/hooks/useParticipants';
import { CreateParticipantFormData } from '@/features/participants/schema';
import { Participant, ParticipantFilter } from '@/features/participants/types';

export default function AdminParticipantsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  // Filter state
  const [filter, setFilter] = useState<ParticipantFilter>({
    search: '',
    department: 'all',
    status: 'all',
  });

  // Fetch data
  const { data: participants = [], isLoading, error } = useParticipants(filter);
  const { data: stats } = useParticipantStats();
  const { data: departments = [] } = useDepartments();

  // Mutations
  const createMutation = useCreateParticipant();
  const updateMutation = useUpdateParticipant();
  const deleteMutation = useDeleteParticipant();

  const handleCreate = async (data: CreateParticipantFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        position: data.position,
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create participant:', error);
    }
  };

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: CreateParticipantFormData) => {
    if (!editingParticipant) return;

    try {
      await updateMutation.mutateAsync({
        id: editingParticipant.id,
        ...data,
      });
      setIsEditDialogOpen(false);
      setEditingParticipant(null);
    } catch (error) {
      console.error('Failed to update participant:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete participant:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-grayscale-900">참여자 관리</h1>
            <p className="text-grayscale-600 mt-1">
              참여자를 등록하고 관리하세요
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              일괄 등록
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  참여자 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>새 참여자 추가</DialogTitle>
                  <DialogDescription>
                    새로운 참여자를 등록합니다
                  </DialogDescription>
                </DialogHeader>
                <ParticipantForm
                  onSubmit={handleCreate}
                  isLoading={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 참여자</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">비활성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-grayscale-500">{stats.inactive}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>검색 및 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-grayscale-500" />
                <Input
                  placeholder="이름, 이메일, 부서, 직급 검색..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="pl-9"
                />
              </div>

              <Select
                value={filter.department}
                onValueChange={(value) => setFilter({ ...filter, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="부서 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 부서</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filter.status}
                onValueChange={(value) => setFilter({ ...filter, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-grayscale-600">참여자 목록을 불러오는 중...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">참여자 목록을 불러오는데 실패했습니다</p>
          </div>
        )}

        {/* Participants List */}
        {!isLoading && !error && (
          <ParticipantList
            participants={participants}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeletingId={deleteMutation.isPending ? deleteMutation.variables : undefined}
          />
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>참여자 정보 수정</DialogTitle>
              <DialogDescription>
                참여자 정보를 수정합니다
              </DialogDescription>
            </DialogHeader>
            {editingParticipant && (
              <ParticipantForm
                initialData={editingParticipant}
                onSubmit={handleUpdate}
                isLoading={updateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Bulk Import Dialog */}
        <BulkImportDialog
          open={isBulkImportOpen}
          onOpenChange={setIsBulkImportOpen}
        />
      </div>
    </AdminLayout>
  );
}
