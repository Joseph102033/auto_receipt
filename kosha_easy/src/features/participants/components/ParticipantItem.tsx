'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Participant } from '../types';
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

interface ParticipantItemProps {
  participant: Participant;
  onEdit: (participant: Participant) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function ParticipantItem({ participant, onEdit, onDelete, isDeleting = false }: ParticipantItemProps) {
  return (
    <tr className="border-b border-grayscale-100 hover:bg-grayscale-50">
      <td className="py-3 px-4 text-sm font-medium">{participant.name}</td>
      <td className="py-3 px-4 text-sm text-grayscale-600">{participant.email}</td>
      <td className="py-3 px-4 text-sm text-grayscale-600">{participant.phone || '-'}</td>
      <td className="py-3 px-4 text-sm text-grayscale-600">{participant.department || '-'}</td>
      <td className="py-3 px-4 text-sm text-grayscale-600">{participant.position || '-'}</td>
      <td className="py-3 px-4 text-sm">
        {participant.status === 'active' ? (
          <Badge className="bg-green-100 text-green-800">활성</Badge>
        ) : (
          <Badge variant="secondary">비활성</Badge>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(participant)}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>참여자를 삭제하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 취소할 수 없습니다. {participant.name}님의 모든 데이터가 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(participant.id)}
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
