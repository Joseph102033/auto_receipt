'use client'

import Link from 'next/link'
import { ParticipantLayout } from '@/components/layout/participant-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle, Clock } from 'lucide-react'
import { useParticipantRounds } from '@/features/rounds/hooks/useRounds'
import { format } from 'date-fns'

export default function ParticipantRoundsPage() {
  const { data: rounds = [], isLoading, error } = useParticipantRounds()

  const getStatusBadge = (submittedCount: number, totalDocuments: number) => {
    if (submittedCount >= totalDocuments) {
      return <Badge className="bg-green-100 text-green-800">제출 완료</Badge>
    }
    return <Badge variant="secondary">미제출 ({submittedCount}/{totalDocuments})</Badge>
  }

  return (
    <ParticipantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-grayscale-900">내 차수 목록</h1>
          <p className="text-grayscale-600 mt-1">본인에게 해당하는 문서 제출 차수를 확인하고 문서를 제출하세요</p>
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
            <p className="text-grayscale-600">참여 중인 차수가 없습니다</p>
          </div>
        )}

        {/* Rounds Grid */}
        {!isLoading && !error && rounds.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rounds.map((round) => {
              const isCompleted = (round.submittedCount || 0) >= (round.totalDocuments || 0)
              return (
                <Card key={round.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{round.title}</CardTitle>
                      {getStatusBadge(round.submittedCount || 0, round.totalDocuments || 0)}
                    </div>
                    <CardDescription>{round.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-grayscale-600">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>마감: {format(new Date(round.endDate), 'yyyy-MM-dd')}</span>
                      </div>
                      {isCompleted ? (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>모든 문서 제출 완료</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-orange-600">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{(round.totalDocuments || 0) - (round.submittedCount || 0)}개 문서 미제출</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/participant/rounds/${round.id}/submit`}>
                      <Button className="w-full" variant={isCompleted ? 'outline' : 'default'}>
                        {isCompleted ? '제출 내역 확인' : '문서 제출'}
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

