'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TrendData {
  date: string;
  submissions: number;
}

interface SubmissionTrendChartProps {
  data: TrendData[];
}

export function SubmissionTrendChart({ data }: SubmissionTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>일별 제출 추이</CardTitle>
        <CardDescription>날짜별 문서 제출 현황</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="submissions" name="제출 건수" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
