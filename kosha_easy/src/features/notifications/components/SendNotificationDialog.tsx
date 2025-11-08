'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { sendNotificationSchema, SendNotificationFormData } from '../schema';
import { useSendNotification, useTemplates } from '../hooks/useNotifications';
import { Loader2 } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  email: string;
  department?: string;
  status?: string;
}

interface SendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: Participant[];
  roundId?: string;
  roundTitle?: string;
  preSelectedParticipants?: string[];
}

export function SendNotificationDialog({
  open,
  onOpenChange,
  participants,
  roundId,
  roundTitle,
  preSelectedParticipants = [],
}: SendNotificationDialogProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(preSelectedParticipants);
  const sendNotification = useSendNotification();
  const { data: templates } = useTemplates();

  const form = useForm<SendNotificationFormData>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      type: 'system',
      recipientIds: preSelectedParticipants,
      title: '',
      message: '',
      roundId,
      priority: 'medium',
    },
  });

  const handleSubmit = async (data: SendNotificationFormData) => {
    try {
      await sendNotification.mutateAsync({
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority,
        recipientIds: selectedParticipants,
        roundId,
      });
      form.reset();
      setSelectedParticipants([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find((t) => t.id === templateId);
    if (template) {
      form.setValue('title', template.subject);
      form.setValue('message', template.body);
      form.setValue('type', template.type);
    }
  };

  const handleSelectAll = () => {
    if (selectedParticipants.length === participants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(participants.map((p) => p.id));
    }
  };

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(participantId) ? prev.filter((id) => id !== participantId) : [...prev, participantId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>알림 보내기</DialogTitle>
          <DialogDescription>
            {roundTitle ? `${roundTitle}의 참여자들에게 알림을 보냅니다` : '참여자들에게 알림을 보냅니다'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Template Selection */}
            {templates && templates.length > 0 && (
              <div className="space-y-2">
                <FormLabel>템플릿 선택 (선택사항)</FormLabel>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="템플릿을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>템플릿을 선택하면 제목과 내용이 자동으로 채워집니다</FormDescription>
              </div>
            )}

            {/* Notification Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>알림 유형</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="system" />
                        <label htmlFor="system" className="text-sm cursor-pointer">
                          시스템 알림
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <label htmlFor="email" className="text-sm cursor-pointer">
                          이메일
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sms" id="sms" />
                        <label htmlFor="sms" className="text-sm cursor-pointer">
                          SMS
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>우선순위</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">낮음</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="high">높음</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="알림 제목을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메시지</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="알림 메시지를 입력하세요"
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Participant Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>수신자 선택 ({selectedParticipants.length}명)</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedParticipants.length === participants.length ? '전체 해제' : '전체 선택'}
                </Button>
              </div>

              <div className="border border-grayscale-200 rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedParticipants.includes(participant.id)}
                      onCheckedChange={() => toggleParticipant(participant.id)}
                    />
                    <label className="flex-1 text-sm cursor-pointer" onClick={() => toggleParticipant(participant.id)}>
                      <span className="font-medium">{participant.name}</span>
                      <span className="text-grayscale-600 ml-2">({participant.email})</span>
                      {participant.department && (
                        <span className="text-grayscale-500 ml-2">- {participant.department}</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>

              {selectedParticipants.length === 0 && (
                <p className="text-sm text-red-600">최소 1명의 수신자를 선택해주세요</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button type="submit" disabled={sendNotification.isPending || selectedParticipants.length === 0}>
                {sendNotification.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                알림 발송
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
