'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { createRoundSchema, CreateRoundFormData } from '../schema';
import { Round } from '../types';
import { useParticipants } from '../hooks/useRounds';

interface RoundFormProps {
  initialData?: Round;
  onSubmit: (data: CreateRoundFormData) => void;
  isLoading?: boolean;
  isAdmin?: boolean;
}

export function RoundForm({ initialData, onSubmit, isLoading = false, isAdmin = false }: RoundFormProps) {
  const { data: participants = [], isLoading: isLoadingParticipants } = useParticipants();
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>(
    initialData?.requiredDocuments || []
  );
  const [newDocument, setNewDocument] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRoundFormData>({
    resolver: zodResolver(createRoundSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          budgetCodeTransport: initialData.budgetCodeTransport || '',
          budgetCodeAccommodation: initialData.budgetCodeAccommodation || '',
          participants: initialData.participants,
          requiredDocuments: initialData.requiredDocuments,
        }
      : {
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          budgetCodeTransport: '',
          budgetCodeAccommodation: '',
          participants: [],
          requiredDocuments: [],
        },
  });

  const selectedParticipants = watch('participants');

  // Update required documents in form when state changes
  useEffect(() => {
    setValue('requiredDocuments', requiredDocuments);
  }, [requiredDocuments, setValue]);

  const handleAddDocument = () => {
    if (newDocument.trim()) {
      setRequiredDocuments([...requiredDocuments, newDocument.trim()]);
      setNewDocument('');
    }
  };

  const handleRemoveDocument = (index: number) => {
    setRequiredDocuments(requiredDocuments.filter((_, i) => i !== index));
  };

  const handleParticipantToggle = (participantId: string) => {
    const current = selectedParticipants || [];
    const updated = current.includes(participantId)
      ? current.filter((id) => id !== participantId)
      : [...current, participantId];
    setValue('participants', updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>차수의 기본 정보를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="예: 2024년 1차 문서 제출"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">설명 *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="차수에 대한 설명을 입력하세요"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">시작일 *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">종료일 *</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Budget Codes (Admin Only) */}
          {isAdmin && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetCodeTransport">운임 예산 코드</Label>
                  <Input
                    id="budgetCodeTransport"
                    {...register('budgetCodeTransport')}
                    placeholder="운임(여비) 예산 코드 입력"
                  />
                  {errors.budgetCodeTransport && (
                    <p className="text-sm text-red-600">{errors.budgetCodeTransport.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budgetCodeAccommodation">숙박비 예산 코드</Label>
                  <Input
                    id="budgetCodeAccommodation"
                    {...register('budgetCodeAccommodation')}
                    placeholder="숙박비 예산 코드 입력"
                  />
                  {errors.budgetCodeAccommodation && (
                    <p className="text-sm text-red-600">{errors.budgetCodeAccommodation.message}</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                * 예산 코드는 관리자만 확인할 수 있으며, 영수증 취합 시 사용됩니다.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Participants Selection */}
      <Card>
        <CardHeader>
          <CardTitle>참여자 선택 *</CardTitle>
          <CardDescription>차수에 참여할 사람을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingParticipants ? (
            <p className="text-sm text-muted-foreground">참여자 목록을 불러오는 중...</p>
          ) : (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`participant-${participant.id}`}
                    checked={selectedParticipants?.includes(participant.id)}
                    onCheckedChange={() => handleParticipantToggle(participant.id)}
                  />
                  <Label
                    htmlFor={`participant-${participant.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {participant.name} ({participant.email})
                  </Label>
                </div>
              ))}
            </div>
          )}
          {errors.participants && (
            <p className="text-sm text-red-600 mt-2">{errors.participants.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle>필수 문서 목록 *</CardTitle>
          <CardDescription>제출이 필요한 문서를 추가하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Document Input */}
          <div className="flex gap-2">
            <Input
              value={newDocument}
              onChange={(e) => setNewDocument(e.target.value)}
              placeholder="문서 이름 입력 (예: 사업계획서)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDocument();
                }
              }}
            />
            <Button type="button" onClick={handleAddDocument} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>

          {/* Document List */}
          {requiredDocuments.length > 0 ? (
            <div className="space-y-2">
              {requiredDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <span className="text-sm text-foreground">{doc}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">추가된 문서가 없습니다</p>
          )}

          {errors.requiredDocuments && (
            <p className="text-sm text-red-600">{errors.requiredDocuments.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '저장 중...' : initialData ? '수정하기' : '생성하기'}
        </Button>
      </div>
    </form>
  );
}
