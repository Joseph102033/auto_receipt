'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ParticipantItem } from './ParticipantItem';
import { Participant } from '../types';

interface ParticipantListProps {
  participants: Participant[];
  onEdit: (participant: Participant) => void;
  onDelete: (id: string) => void;
  isDeletingId?: string;
}

export function ParticipantList({ participants, onEdit, onDelete, isDeletingId }: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-grayscale-500">등록된 참여자가 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>참여자 목록</CardTitle>
        <CardDescription>전체 {participants.length}명의 참여자</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grayscale-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-grayscale-700">이름</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-grayscale-700">이메일</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-grayscale-700">전화번호</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-grayscale-700">부서</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-grayscale-700">직급</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-grayscale-700">상태</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-grayscale-700">액션</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <ParticipantItem
                  key={participant.id}
                  participant={participant}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isDeleting={isDeletingId === participant.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
