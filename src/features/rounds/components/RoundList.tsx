'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoundItem } from './RoundItem';
import { RoundWithStats } from '../types';

interface RoundListProps {
  rounds: RoundWithStats[];
  onDelete: (id: string) => void;
  onSendNotification: (roundId: string, roundTitle: string) => void;
  isDeletingId?: string;
}

export function RoundList({ rounds, onDelete, onSendNotification, isDeletingId }: RoundListProps) {
  if (rounds.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">생성된 차수가 없습니다</p>
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
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  제목 / 설명
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  기간
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  제출 현황
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
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
                  onSendNotification={onSendNotification}
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
