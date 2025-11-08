'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportParticipantsToExcel, exportStatisticsToExcel } from '../utils/exportToExcel';

interface ParticipantData {
  name: string;
  email: string;
  department?: string;
  position?: string;
  status: string;
  submittedAt?: string;
}

interface DetailedReportProps {
  roundTitle: string;
  participants: ParticipantData[];
  stats: {
    total: number;
    submitted: number;
    notSubmitted: number;
    notApplicable: number;
  };
}

export function DetailedReport({ roundTitle, participants, stats }: DetailedReportProps) {
  const submissionRate = stats.total > 0 ? ((stats.submitted / stats.total) * 100).toFixed(1) : '0.0';

  // Calculate department statistics
  const departmentMap = new Map<string, { total: number; submitted: number }>();

  participants.forEach((p) => {
    const dept = p.department || '미지정';
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, { total: 0, submitted: 0 });
    }
    const deptStats = departmentMap.get(dept)!;
    deptStats.total++;
    if (p.status === 'submitted') {
      deptStats.submitted++;
    }
  });

  const departmentStats = Array.from(departmentMap.entries()).map(([department, data]) => ({
    department,
    total: data.total,
    submitted: data.submitted,
    notSubmitted: data.total - data.submitted,
  }));

  const handleExportParticipants = () => {
    exportParticipantsToExcel(participants, roundTitle);
  };

  const handleExportStatistics = () => {
    exportStatisticsToExcel(
      {
        ...stats,
        submissionRate: parseFloat(submissionRate),
      },
      departmentStats,
      roundTitle
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>상세 리포트</CardTitle>
            <CardDescription>제출 현황 및 통계를 엑셀로 다운로드</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportStatistics}>
              <Download className="mr-2 h-4 w-4" />
              통계 다운로드
            </Button>
            <Button onClick={handleExportParticipants}>
              <Download className="mr-2 h-4 w-4" />
              참여자 목록 다운로드
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-grayscale-50 rounded-lg">
              <p className="text-sm text-grayscale-600">전체 참여자</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-grayscale-600">제출 완료</p>
              <p className="text-2xl font-bold text-green-600">{stats.submitted}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-grayscale-600">미제출</p>
              <p className="text-2xl font-bold text-red-600">{stats.notSubmitted}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-grayscale-600">제출률</p>
              <p className="text-2xl font-bold text-primary">{submissionRate}%</p>
            </div>
          </div>

          {/* Department Statistics */}
          {departmentStats.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-grayscale-700 mb-2">부서별 요약</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {departmentStats.map((dept) => (
                  <div key={dept.department} className="p-3 border border-grayscale-200 rounded-lg">
                    <p className="font-medium text-grayscale-900">{dept.department}</p>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-green-600">완료: {dept.submitted}</span>
                      <span className="text-red-600">미제출: {dept.notSubmitted}</span>
                      <span className="text-grayscale-600">
                        ({((dept.submitted / dept.total) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
