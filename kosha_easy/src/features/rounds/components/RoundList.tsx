'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoundItem } from './RoundItem';
import { RoundWithStats } from '../types';

interface RoundListProps {
  rounds: RoundWithStats[];
  onDelete: (id: string) => void;
  isDeletingId?: string;
}

export function RoundList({ rounds, onDelete, isDeletingId }: RoundListProps) {
  if (rounds.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-grayscale-500">생성된 차수가 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>차수 목록</CardTitle>
        <CardDescription>모든 문서 제출 차수를 확인할 수 있습니다</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grayscale-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-grayscale-700">
                  제목 / 설명
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-grayscale-700">
                  기간
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-grayscale-700">
                  제출 현황
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-grayscale-700">
                  액션
                </th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((round) => (
                <RoundItem
                  key={round.id}
                  round={round}
                  onDelete={onDelete}
                  isDeleting={isDeletingId === round.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
