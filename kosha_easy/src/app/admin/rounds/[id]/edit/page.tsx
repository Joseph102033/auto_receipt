'use client'

import { use as usePromise } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { RoundForm } from '@/features/rounds/components/RoundForm'
import { useRound, useUpdateRound } from '@/features/rounds/hooks/useRounds'
import { CreateRoundFormData } from '@/features/rounds/schema'

export default function AdminRoundEditPage(props: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = usePromise(props.params)

  // Fetch round data
  const { data: round, isLoading, error } = useRound(id)

  // Update round mutation
  const updateMutation = useUpdateRound()

  const handleUpdate = async (data: CreateRoundFormData) => {
    try {
      await updateMutation.mutateAsync({ id, ...data })
      router.push('/admin/rounds')
    } catch (error) {
      // Error is handled by mutation hook
      console.error('Failed to update round:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-grayscale-900">차수 수정</h1>
            <p className="text-grayscale-600 mt-1">차수 정보를 수정합니다</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-grayscale-600">차수 정보를 불러오는 중…</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-red-600">차수 정보를 불러오는데 실패했습니다</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Form */}
        {!isLoading && !error && round && (
          <RoundForm initialData={round} onSubmit={handleUpdate} isLoading={updateMutation.isPending} />
        )}

        {/* Round Not Found */}
        {!isLoading && !error && !round && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-grayscale-600">차수를 찾을 수 없습니다</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

