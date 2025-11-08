'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Calendar } from 'lucide-react';

const classTypes = [
  { id: 'basic', label: '기초반' },
  { id: 'advanced', label: '심화반' },
  { id: 'seasonal', label: '시즌클래스' },
  { id: 'oneday', label: '원데이' },
];

const classData = {
  basic: [
    {
      title: '베이킹 입문 과정',
      description: '베이킹의 기초부터 차근차근 배우는 클래스',
      duration: '2시간',
      capacity: '1:1',
      price: '80,000원',
      topics: ['계량법', '반죽 다루기', '기본 쿠키', '머핀'],
    },
    {
      title: '기본 빵 만들기',
      description: '식빵과 간단한 빵 만들기',
      duration: '2.5시간',
      capacity: '1:1',
      price: '90,000원',
      topics: ['발효', '반죽법', '식빵', '소보로빵'],
    },
  ],
  advanced: [
    {
      title: '케이크 데코레이션',
      description: '아름다운 케이크 만들기와 데코레이션',
      duration: '3시간',
      capacity: '1:1',
      price: '120,000원',
      topics: ['시트 만들기', '크림 다루기', '생크림 케이크', '데코레이션'],
    },
    {
      title: '프랑스 페이스트리',
      description: '크루아상, 마카롱 등 프랑스 디저트',
      duration: '3.5시간',
      capacity: '1:1',
      price: '150,000원',
      topics: ['크루아상', '마카롱', '타르트', '슈'],
    },
  ],
  seasonal: [
    {
      title: '겨울 시즌 특별반',
      description: '크리스마스와 겨울 시즌 특별 디저트',
      duration: '2.5시간',
      capacity: '1:1',
      price: '100,000원',
      topics: ['슈톨렌', '진저브레드', '시즌 쿠키', '핫초코'],
    },
  ],
  oneday: [
    {
      title: '쿠키 원데이 클래스',
      description: '하루만에 완성하는 특별한 쿠키',
      duration: '1.5시간',
      capacity: '1:1',
      price: '60,000원',
      topics: ['버터쿠키', '아이싱', '포장법'],
    },
    {
      title: '케이크 원데이',
      description: '특별한 날을 위한 케이크 만들기',
      duration: '2시간',
      capacity: '1:1',
      price: '85,000원',
      topics: ['레터링 케이크', '디자인 케이크'],
    },
  ],
};

export function ClassesSection() {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <section id="classes" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">클래스 안내</h2>
          <p className="text-lg text-muted-foreground">
            다양한 수준과 주제의 베이킹 클래스를 만나보세요
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {classTypes.map((type) => (
            <Button
              key={type.id}
              variant={activeTab === type.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(type.id)}
              className="min-w-[100px]"
            >
              {type.label}
            </Button>
          ))}
        </div>

        {/* Class Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {classData[activeTab as keyof typeof classData].map((classItem, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{classItem.title}</CardTitle>
                  <Badge variant="secondary">{classItem.price}</Badge>
                </div>
                <CardDescription>{classItem.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{classItem.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{classItem.capacity}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">수업 내용</p>
                  <div className="flex flex-wrap gap-2">
                    {classItem.topics.map((topic) => (
                      <Badge key={topic} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full mt-4" asChild>
                  <Link href="/reservation">신청하기</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
