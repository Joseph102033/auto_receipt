'use client';

import { use as usePromise } from 'react';
import Link from 'next/link';
import { ParticipantLayout } from '@/components/layout/participant-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, ArrowLeft } from 'lucide-react';
import { useRound } from '@/features/rounds/hooks/useRounds';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface RoundParticipant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
}

export default function RoundParticipantsPage(props: { params: Promise<{ id: string }> }) {
  const { id: roundId } = usePromise(props.params);
  const { data: round, isLoading: loadingRound } = useRound(roundId);

  // Fetch participants for this round
  const { data: participants = [], isLoading: loadingParticipants } = useQuery({
    queryKey: ['round-participants', roundId],
    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('round_participants')
        .select(`
          participant_id,
          profiles (
            id,
            name,
            email,
            phone,
            department,
            position
          )
        `)
        .eq('round_id', roundId);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.profiles.id,
        name: item.profiles.name,
        email: item.profiles.email,
        phone: item.profiles.phone,
        department: item.profiles.department,
        position: item.profiles.position,
      })) as RoundParticipant[];
    },
    enabled: !!roundId,
  });

  const isLoading = loadingRound || loadingParticipants;

  if (isLoading) {
    return (
      <ParticipantLayout>
        <div className="max-w-6xl mx-auto py-12 text-center">
          <p className="text-grayscale-600">정보를 불러오는 중...</p>
        </div>
      </ParticipantLayout>
    );
  }

  if (!round) {
    return (
      <ParticipantLayout>
        <div className="max-w-6xl mx-auto py-12 text-center">
          <p className="text-red-600">차수를 찾을 수 없습니다</p>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <Link href="/participant/rounds">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            차수 목록으로
          </Button>
        </Link>

        {/* Round Info Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{round.title}</CardTitle>
                <CardDescription className="mt-2">{round.description}</CardDescription>
              </div>
              <Badge variant="secondary">{participants.length}명 참석</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div className="flex items-center text-sm text-grayscale-600">
                <Calendar className="mr-2 h-4 w-4" />
                <span>시작: {format(new Date(round.startDate), 'yyyy-MM-dd')}</span>
              </div>
              <div className="flex items-center text-sm text-grayscale-600">
                <Calendar className="mr-2 h-4 w-4" />
                <span>마감: {format(new Date(round.endDate), 'yyyy-MM-dd')}</span>
              </div>
              <div className="flex items-center text-sm text-grayscale-600">
                <FileText className="mr-2 h-4 w-4" />
                <span>필수 문서: {round.requiredDocuments.length}개</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants List */}
        <div>
          <h2 className="text-xl font-bold text-grayscale-900 mb-4">참석자 명단</h2>

          {participants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-grayscale-600">등록된 참석자가 없습니다</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {participants.map((participant) => (
                <Card key={participant.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="mr-2 h-5 w-5 text-primary" />
                      {participant.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {participant.email && (
                      <p className="text-sm text-grayscale-600">
                        <span className="font-medium">이메일:</span> {participant.email}
                      </p>
                    )}
                    {participant.phone && (
                      <p className="text-sm text-grayscale-600">
                        <span className="font-medium">연락처:</span> {participant.phone}
                      </p>
                    )}
                    {participant.department && (
                      <p className="text-sm text-grayscale-600">
                        <span className="font-medium">부서:</span> {participant.department}
                      </p>
                    )}
                    {participant.position && (
                      <p className="text-sm text-grayscale-600">
                        <span className="font-medium">직급:</span> {participant.position}
                      </p>
                    )}
                    <Link href={`/participant/rounds/${roundId}/submit?participantId=${participant.id}&participantName=${encodeURIComponent(participant.name)}`}>
                      <Button className="w-full mt-2" size="sm">
                        문서 제출하기
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ParticipantLayout>
  );
}
