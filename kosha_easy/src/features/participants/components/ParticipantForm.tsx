'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createParticipantSchema, CreateParticipantFormData } from '../schema';
import { Participant } from '../types';

interface ParticipantFormProps {
  initialData?: Participant;
  onSubmit: (data: CreateParticipantFormData) => void;
  isLoading?: boolean;
}

export function ParticipantForm({ initialData, onSubmit, isLoading = false }: ParticipantFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateParticipantFormData>({
    resolver: zodResolver(createParticipantSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          email: initialData.email,
          phone: initialData.phone || '',
          department: initialData.department || '',
          position: initialData.position || '',
        }
      : {
          name: '',
          email: '',
          phone: '',
          department: '',
          position: '',
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>참여자 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input id="name" {...register('name')} placeholder="홍길동" />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" {...register('email')} placeholder="email@example.com" />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input id="phone" {...register('phone')} placeholder="010-1234-5678" />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">부서</Label>
              <Input id="department" {...register('department')} placeholder="개발팀" />
              {errors.department && <p className="text-sm text-red-600">{errors.department.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">직급</Label>
            <Input id="position" {...register('position')} placeholder="팀장" />
            {errors.position && <p className="text-sm text-red-600">{errors.position.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '저장 중...' : initialData ? '수정하기' : '추가하기'}
        </Button>
      </div>
    </form>
  );
}
