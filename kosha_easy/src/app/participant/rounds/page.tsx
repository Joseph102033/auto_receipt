'use client'

import Link from 'next/link'
import { ParticipantLayout } from '@/components/layout/participant-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users } from 'lucide-react'
import { useRounds } from '@/features/rounds/hooks/useRounds'
import { format } from 'date-fns'

export default function ParticipantRoundsPage() {
  const { data: rounds = [], isLoading, error } = useRounds()

  return (
    <ParticipantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-grayscale-900">전체 차수 목록</h1>
          <p className="text-grayscale-600 mt-1">차수를 선택하여 참석자 명단을 확인하고 문서를 제출하세요</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-grayscale-600">차수 목록을 불러오는 중...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">차수 목록을 불러오는데 실패했습니다</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && rounds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-grayscale-600">등록된 차수가 없습니다</p>
          </div>
        )}

        {/* Rounds Grid */}
        {!isLoading && !error && rounds.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rounds.map((round) => {
              return (
                <Card key={round.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{round.title}</CardTitle>
                      <Badge variant="secondary">
                        {round.participantCount}명 참석
                      </Badge>
                    </div>
                    <CardDescription>{round.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-grayscale-600">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>마감: {format(new Date(round.endDate), 'yyyy-MM-dd')}</span>
                      </div>
                      <div className="flex items-center text-sm text-grayscale-600">
                        <Users className="mr-2 h-4 w-4" />
                        <span>참석자 {round.participantCount}명</span>
                      </div>
                    </div>
                    <Link href={`/participant/rounds/${round.id}`}>
                      <Button className="w-full">
                        참석자 명단 보기
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </ParticipantLayout>
  )
}

