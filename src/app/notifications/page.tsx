'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useNotifications, useNotificationStats, useMarkAllAsRead } from '@/features/notifications/hooks/useNotifications'
import { NotificationList } from '@/features/notifications/components/NotificationList'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationsPage() {
  const [userId, setUserId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all')

  // Get current user ID
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
      }
    })
  }, [])

  const { data: allNotifications, isLoading: isLoadingAll } = useNotifications(userId)
  const { data: unreadNotifications, isLoading: isLoadingUnread } = useNotifications(userId, 'unread')
  const { data: readNotifications, isLoading: isLoadingRead } = useNotifications(userId, 'read')
  const { data: stats } = useNotificationStats(userId)
  const markAllAsRead = useMarkAllAsRead()

  const getNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return unreadNotifications || []
      case 'read':
        return readNotifications || []
      default:
        return allNotifications || []
    }
  }

  const getIsLoading = () => {
    switch (activeTab) {
      case 'unread':
        return isLoadingUnread
      case 'read':
        return isLoadingRead
      default:
        return isLoadingAll
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-grayscale-900">알림</h1>
            <p className="text-grayscale-600 mt-1">받은 알림을 확인하고 관리하세요</p>
          </div>
          {stats && stats.unread > 0 && (
            <Button variant="outline" onClick={() => markAllAsRead.mutate(userId)} disabled={markAllAsRead.isPending}>
              {markAllAsRead.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              모두 읽음 처리
            </Button>
          )}
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 알림</CardTitle>
                <Bell className="h-4 w-4 text-grayscale-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">읽지 않음</CardTitle>
                <Bell className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">읽음</CardTitle>
                <CheckCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.read}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">시스템 알림</CardTitle>
                <Bell className="h-4 w-4 text-grayscale-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.byType.system}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>알림 목록</CardTitle>
            <CardDescription>받은 알림을 확인하고 관리할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="all">
                  전체 {allNotifications && `(${allNotifications.length})`}
                </TabsTrigger>
                <TabsTrigger value="unread">
                  읽지 않음 {stats && `(${stats.unread})`}
                </TabsTrigger>
                <TabsTrigger value="read">
                  읽음 {stats && `(${stats.read})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <NotificationList
                  notifications={getNotifications()}
                  userId={userId}
                  isLoading={getIsLoading()}
                  showActions={true}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

