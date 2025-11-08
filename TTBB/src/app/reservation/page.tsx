'use client';

import { NavBar } from '@/components/navigation/NavBar';
import { Footer } from '@/components/navigation/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReservationForm } from '@/features/reservation/components/ReservationForm';
import { Instagram, Mail, Phone, MapPin, Calendar, Clock } from 'lucide-react';

export default function ReservationPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        {/* Page Header */}
        <section className="py-16 bg-primary/20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                클래스 예약
              </h1>
              <p className="text-lg text-muted-foreground">
                티티빵빵과 함께 베이킹의 즐거움을 경험해보세요
              </p>
            </div>
          </div>
        </section>

        {/* Reservation Options */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Two Reservation Methods */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Online Form */}
                <Card className="border-2 border-accent/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>온라인 예약 폼</CardTitle>
                      <Badge>추천</Badge>
                    </div>
                    <CardDescription>
                      간편하게 정보를 입력하고 예약 신청하세요
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReservationForm />
                  </CardContent>
                </Card>

                {/* Naver Reservation (Placeholder) */}
                <Card>
                  <CardHeader>
                    <CardTitle>네이버 예약</CardTitle>
                    <CardDescription>
                      네이버 예약 시스템을 통해 예약하실 수 있습니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="text-6xl">📅</div>
                        <p className="text-foreground/80 font-medium">네이버 예약</p>
                        <p className="text-sm text-muted-foreground px-4">
                          네이버 예약 서비스 연동 준비 중입니다
                        </p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline" disabled>
                      네이버 예약하기 (준비 중)
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      현재는 온라인 폼이나 직접 문의를 이용해주세요
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Separator className="my-12" />

              {/* Direct Contact Section */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">또는 직접 문의하세요</h2>
                  <p className="text-muted-foreground">
                    더 자세한 상담이 필요하시면 아래 연락처로 문의해주세요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reservation Information */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Contact Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>예약 문의</CardTitle>
                  <CardDescription>
                    아래 연락처로 문의주시면 친절하게 안내해드립니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Instagram */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-accent transition-colors">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary">
                        <Instagram className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">인스타그램 DM</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          가장 빠른 답변을 받을 수 있습니다
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href="https://instagram.com/ttbbang"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            @ttbbang 방문하기
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-accent transition-colors">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary">
                        <Mail className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">이메일 문의</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          자세한 문의사항은 이메일로 보내주세요
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="mailto:contact@ttbbang.com">
                            이메일 보내기
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>위치 및 운영시간</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium mb-1">주소</p>
                        <p className="text-sm text-muted-foreground">
                          울산광역시 남구 달동
                          <br />
                          <span className="text-xs">(정확한 위치는 예약 확정 후 안내드립니다)</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium mb-1">운영시간</p>
                        <p className="text-sm text-muted-foreground">
                          화요일 - 토요일: 10:00 - 18:00
                          <br />
                          일요일, 월요일: 휴무
                          <br />
                          <span className="text-xs">(예약제로 운영되며, 시간은 조율 가능합니다)</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium mb-1">예약 안내</p>
                        <p className="text-sm text-muted-foreground">
                          1:1 맞춤 수업으로 진행되므로 사전 예약이 필수입니다
                          <br />
                          최소 3일 전 예약을 권장드립니다
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Map Placeholder */}
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <MapPin className="w-12 h-12 text-accent mx-auto" />
                      <p className="text-foreground/80 font-medium">울산 남구 달동</p>
                      <p className="text-sm text-muted-foreground">
                        지도는 예약 확정 후 안내드립니다
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reservation Process */}
              <Card>
                <CardHeader>
                  <CardTitle>예약 절차</CardTitle>
                  <CardDescription>간단한 3단계로 예약이 완료됩니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary flex-shrink-0">
                        <span className="text-accent font-bold">1</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">문의하기</h4>
                        <p className="text-sm text-muted-foreground">
                          인스타그램 DM 또는 이메일로 원하시는 클래스와 날짜를 알려주세요
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary flex-shrink-0">
                        <span className="text-accent font-bold">2</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">일정 확정</h4>
                        <p className="text-sm text-muted-foreground">
                          상담 후 수업 일정과 내용을 최종 확정합니다
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary flex-shrink-0">
                        <span className="text-accent font-bold">3</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">예약 완료</h4>
                        <p className="text-sm text-muted-foreground">
                          예약금 입금 확인 후 예약이 최종 완료됩니다
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="text-center space-y-4 py-8">
                <h3 className="text-2xl font-bold text-foreground">
                  지금 바로 문의해보세요
                </h3>
                <p className="text-muted-foreground">
                  친절하게 상담해드리겠습니다
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <a
                      href="https://instagram.com/ttbbang"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="w-5 h-5 mr-2" />
                      인스타그램으로 문의
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="mailto:contact@ttbbang.com">
                      <Mail className="w-5 h-5 mr-2" />
                      이메일로 문의
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
