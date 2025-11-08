'use client';

import { useState, use as usePromise, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, Clock, XCircle } from 'lucide-react';
import { SubmissionPieChart } from '@/features/dashboard/components/SubmissionPieChart';
import { SubmissionTrendChart } from '@/features/dashboard/components/SubmissionTrendChart';
import { DepartmentChart } from '@/features/dashboard/components/DepartmentChart';
import { DetailedReport } from '@/features/dashboard/components/DetailedReport';
import { SendNotificationDialog } from '@/features/notifications/components/SendNotificationDialog';
import { useRound } from '@/features/rounds/hooks/useRounds';
import { useSubmissionsByRound } from '@/features/submissions/hooks/useSubmissions';
import { useParticipants } from '@/features/participants/hooks/useParticipants';
import { format } from 'date-fns';

export default function AdminRoundDashboardPage(props: { params: Promise<{ id: string }> }) {
  const { id: roundId } = usePromise(props.params);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  const { data: round, isLoading: loadingRound } = useRound(roundId);
  const { data: submissions = [], isLoading: loadingSubmissions } = useSubmissionsByRound(roundId);
  const { data: participants = [], isLoading: loadingParticipants } = useParticipants();

  // Calculate statistics
  const stats = useMemo(() => {
    if (!round || !submissions) {
      return { total: 0, submitted: 0, notSubmitted: 0, notApplicable: 0 };
    }

    const participantIds = round.participants || [];
    const submittedParticipants = new Set(
      submissions
        .filter((s) => s.status === 'submitted' || s.status === 'not_applicable')
        .map((s) => s.participantId)
    );

    const submitted = submittedParticipants.size;
    const notSubmitted = participantIds.length - submitted;

    return {
      total: participantIds.length,
      submitted,
      notSubmitted,
      notApplicable: submissions.filter((s) => s.status === 'not_applicable').length,
    };
  }, [round, submissions]);

  // Calculate trend data (daily submissions)
  const trendData = useMemo(() => {
    if (!submissions) return [];

    const dailyCount: Record<string, number> = {};

    submissions.forEach((submission) => {
      if (submission.submittedAt) {
        const date = format(new Date(submission.submittedAt), 'MM-dd');
        dailyCount[date] = (dailyCount[date] || 0) + 1;
      }
    });

    return Object.entries(dailyCount)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7) // Last 7 days
      .map(([date, submissions]) => ({ date, submissions }));
  }, [submissions]);

  // Department data - simplified version
  const departmentData = useMemo(() => {
    // This would need participant data with department info
    // For now, return empty array
    return [];
  }, []);

  // Participant list with submission status
  const participantsList = useMemo(() => {
    if (!round || !submissions || !participants) return [];

    const submissionsByParticipant = submissions.reduce((acc, sub) => {
      if (!acc[sub.participantId]) {
        acc[sub.participantId] = [];
      }
      acc[sub.participantId].push(sub);
      return acc;
    }, {} as Record<string, typeof submissions>);

    const participantMap = participants.reduce((acc, participant) => {
      acc[participant.id] = participant;
      return acc;
    }, {} as Record<string, typeof participants[0]>);

    return (round.participants || []).map((participantId) => {
      const participant = participantMap[participantId];
      const participantSubmissions = submissionsByParticipant[participantId] || [];
      const hasSubmitted = participantSubmissions.length > 0;
      const allNotApplicable = participantSubmissions.every((s) => s.status === 'not_applicable');
      const latestSubmission = participantSubmissions.sort(
        (a, b) =>
          new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
      )[0];

      return {
        id: participantId,
        name: participant?.name || participantId,
        email: participant?.email || '',
        department: participant?.department || '',
        position: participant?.position || '',
        status: hasSubmitted ? (allNotApplicable ? 'not_applicable' : 'submitted') : 'not_submitted',
        submittedAt: latestSubmission?.submittedAt
          ? format(new Date(latestSubmission.submittedAt), 'yyyy-MM-dd')
          : undefined,
      };
    });
  }, [round, submissions, participants]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-green-100 text-green-800">제출 완료</Badge>;
      case 'not_applicable':
        return <Badge variant="secondary">해당 없음</Badge>;
      case 'not_submitted':
        return <Badge variant="destructive">미제출</Badge>;
      default:
        return null;
    }
  };

  // Get only not-submitted participants for notification
  const notSubmittedParticipants = participantsList.filter((p) => p.status === 'not_submitted');

  if (loadingRound || loadingSubmissions || loadingParticipants) {
    return (
      <AdminLayout>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">대시보드를 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!round) {
    return (
      <AdminLayout>
        <div className="py-12 text-center">
          <p className="text-red-600">차수를 찾을 수 없습니다</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{round.title}</h1>
          <p className="text-muted-foreground mt-1">{round.description}</p>
          <p className="text-sm text-muted-foreground mt-1">
            마감: {format(new Date(round.endDate), 'yyyy-MM-dd')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 참여자</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">제출 완료</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.submitted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">미제출</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.notSubmitted}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <SubmissionPieChart
            submitted={stats.submitted}
            notSubmitted={stats.notSubmitted}
            notApplicable={stats.notApplicable}
          />
          {trendData.length > 0 && <SubmissionTrendChart data={trendData} />}
        </div>

        {/* Department Chart */}
        {departmentData.length > 0 && <DepartmentChart data={departmentData} />}

        {/* Detailed Report */}
        <DetailedReport
          roundTitle={round.title}
          participants={participantsList}
          stats={stats}
        />

        {/* Participants List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>참여자 목록</CardTitle>
              <CardDescription>모든 참여자의 제출 현황을 확인할 수 있습니다</CardDescription>
            </div>
            <Button onClick={() => setNotificationDialogOpen(true)} disabled={notSubmittedParticipants.length === 0}>
              <Bell className="mr-2 h-4 w-4" />
              알림 보내기
            </Button>
          </CardHeader>
          <CardContent>
            {participantsList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">참여자가 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">이름</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">상태</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">제출일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantsList.map((participant) => (
                      <tr key={participant.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm font-medium">{participant.name}</td>
                        <td className="py-3 px-4 text-sm">{getStatusBadge(participant.status)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{participant.submittedAt || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Send Notification Dialog */}
        <SendNotificationDialog
          open={notificationDialogOpen}
          onOpenChange={setNotificationDialogOpen}
          participants={notSubmittedParticipants}
          roundId={round.id}
          roundTitle={round.title}
          preSelectedParticipants={notSubmittedParticipants.map((p) => p.id)}
        />
      </div>
    </AdminLayout>
  );
}
