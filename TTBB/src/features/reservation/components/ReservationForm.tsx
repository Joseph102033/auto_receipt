'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Clock, Mail, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  classType: z.string({
    required_error: '클래스 종류를 선택해주세요',
  }),
  date: z.string({
    required_error: '날짜를 선택해주세요',
  }).min(1, '날짜를 선택해주세요'),
  time: z.string({
    required_error: '시간을 선택해주세요',
  }).min(1, '시간을 선택해주세요'),
  name: z
    .string({
      required_error: '이름을 입력해주세요',
    })
    .min(2, '이름은 최소 2글자 이상이어야 합니다'),
  email: z
    .string({
      required_error: '이메일을 입력해주세요',
    })
    .email('올바른 이메일 형식이 아닙니다'),
});

type FormValues = z.infer<typeof formSchema>;

const classTypes = [
  { value: 'basic-intro', label: '베이킹 입문 과정' },
  { value: 'basic-bread', label: '기본 빵 만들기' },
  { value: 'advanced-cake', label: '케이크 데코레이션' },
  { value: 'advanced-pastry', label: '프랑스 페이스트리' },
  { value: 'seasonal', label: '시즌 특별반' },
  { value: 'oneday-cookie', label: '쿠키 원데이 클래스' },
  { value: 'oneday-cake', label: '케이크 원데이' },
];

const timeSlots = [
  { value: '10:00', label: '10:00' },
  { value: '11:00', label: '11:00' },
  { value: '13:00', label: '13:00' },
  { value: '14:00', label: '14:00' },
  { value: '15:00', label: '15:00' },
  { value: '16:00', label: '16:00' },
];

// Mock submission function
async function mockSubmitReservation(data: FormValues): Promise<{ success: boolean }> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Reservation Data:', data);
      // Simulate 90% success rate
      resolve({ success: Math.random() > 0.1 });
    }, 1500);
  });
}

export function ReservationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classType: '',
      date: '',
      time: '',
      name: '',
      email: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const result = await mockSubmitReservation(data);

      if (result.success) {
        toast({
          title: '예약 신청이 완료되었습니다! 🎉',
          description: '입력하신 이메일로 확인 메일을 발송했습니다. 곧 연락드리겠습니다.',
        });
        form.reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      toast({
        title: '예약 신청에 실패했습니다',
        description: '잠시 후 다시 시도해주시거나, 인스타그램 DM으로 문의해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Class Type */}
        <FormField
          control={form.control}
          name="classType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent" />
                클래스 종류
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger aria-label="클래스 종류 선택">
                    <SelectValue placeholder="원하시는 클래스를 선택해주세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {classTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  날짜
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    aria-label="수업 날짜"
                    min={new Date().toISOString().split('T')[0]}
                    {...field}
                  />
                </FormControl>
                <FormDescription>최소 3일 전 예약을 권장합니다</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  시간
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger aria-label="수업 시간 선택">
                      <SelectValue placeholder="시간 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Name and Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  이름
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="홍길동"
                    aria-label="이름"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent" />
                  이메일
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    aria-label="이메일"
                    {...field}
                  />
                </FormControl>
                <FormDescription>예약 확인 메일을 받을 이메일 주소</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? '처리 중...' : '예약 신청하기'}
        </Button>
      </form>
    </Form>
  );
}
