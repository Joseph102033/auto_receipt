'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SubmissionPieChartProps {
  submitted: number;
  notSubmitted: number;
  notApplicable?: number;
}

export function SubmissionPieChart({ submitted, notSubmitted, notApplicable = 0 }: SubmissionPieChartProps) {
  const data = [
    { name: '제출 완료', value: submitted, color: '#10B981' },
    { name: '미제출', value: notSubmitted, color: '#EF4444' },
  ];

  if (notApplicable > 0) {
    data.push({ name: '해당 없음', value: notApplicable, color: '#6B7280' });
  }

  const total = submitted + notSubmitted + notApplicable;
  const submissionRate = total > 0 ? ((submitted / total) * 100).toFixed(1) : '0.0';

  return (
    <Card>
      <CardHeader>
        <CardTitle>제출 현황</CardTitle>
        <CardDescription>
          전체 제출률: <span className="text-primary font-bold">{submissionRate}%</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) =>
                `${props.name} ${props.percent ? (props.percent * 100).toFixed(0) : '0'}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
