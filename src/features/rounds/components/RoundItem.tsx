'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Bell } from 'lucide-react';
import { RoundWithStats } from '../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface RoundItemProps {
  round: RoundWithStats;
  onDelete: (id: string) => void;
  onSendNotification: (roundId: string, roundTitle: string) => void;
  isDeleting?: boolean;
}

export function RoundItem({ round, onDelete, onSendNotification, isDeleting = false }: RoundItemProps) {
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="py-3 px-4">
        <div>
          <p className="text-sm font-medium text-foreground">{round.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{round.description}</p>
        </div>
      </td>
      <td className="py-3 px-4 text-sm">
        <div className="space-y-1">
          <p>{round.startDate}</p>
          <p className="text-muted-foreground">~</p>
          <p>{round.endDate}</p>
        </div>
      </td>
      <td className="py-3 px-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-primary font-medium">{round.submittedCount}</span>
          <span className="text-muted-foreground">/ {round.participantCount}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Link href={`/admin/rounds/${round.id}/dashboard`}>
            <Button variant="outline" size="sm">
              상세보기
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSendNotification(round.id, round.title)}
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Link href={`/admin/rounds/${round.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>차수를 삭제하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 취소할 수 없습니다. 차수와 관련된 모든 데이터가 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(round.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );
}
