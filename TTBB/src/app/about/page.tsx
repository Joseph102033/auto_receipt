import { NavBar } from '@/components/navigation/NavBar';
import { Footer } from '@/components/navigation/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Award, Book, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        {/* Page Header */}
        <section className="py-16 bg-primary/20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                티티빵빵 소개
              </h1>
              <p className="text-lg text-muted-foreground">
                따뜻한 마음으로 베이킹의 즐거움을 전합니다
              </p>
            </div>
          </div>
        </section>

        {/* Main Content - Two Column Layout */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Profile Card */}
                <Card>
                  <CardContent className="pt-8 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Avatar className="w-32 h-32 bg-primary">
                        <AvatarFallback className="text-4xl text-accent font-bold">
                          티빵
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-2xl font-bold">티티빵빵</h3>
                        <p className="text-muted-foreground">홈베이킹 강사</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium">자격사항</p>
                          <p className="text-sm text-muted-foreground">
                            제과제빵 기능사, 베이킹 전문 강사
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Book className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium">경력</p>
                          <p className="text-sm text-muted-foreground">
                            홈베이킹 클래스 5년 이상 운영
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium">교육 철학</p>
                          <p className="text-sm text-muted-foreground">
                            정성과 사랑을 담은 1:1 맞춤 교육
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Text Block */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>티티빵빵의 이야기</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
                      <p>
                        안녕하세요, 티티빵빵입니다. 울산에서 홈베이킹 클래스를 운영하고 있습니다.
                      </p>
                      <p>
                        베이킹은 단순히 빵과 과자를 만드는 것을 넘어, 누군가에게 따뜻한 마음을
                        전하는 특별한 방법이라고 생각합니다. 그래서 저는 수강생 한 분 한 분께
                        정성을 다해 가르쳐드리고 있습니다.
                      </p>
                      <p>
                        1:1 맞춤 수업으로 진행되기 때문에 베이킹이 처음이신 분들도 부담 없이
                        시작하실 수 있습니다. 개인의 수준과 속도에 맞춰 천천히, 그리고 확실하게
                        배워가실 수 있도록 도와드립니다.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>수업 특징</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-accent">소수 정예 1:1 수업</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          한 분 한 분에게 집중하여 세심하게 지도합니다. 궁금한 점은 언제든지
                          질문하실 수 있습니다.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-accent">체계적인 커리큘럼</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          기초부터 심화까지 단계별로 배울 수 있는 체계적인 프로그램을
                          운영합니다.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-accent">실용적인 레시피</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          집에서도 쉽게 따라 할 수 있는 실용적인 레시피로 수업합니다.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
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
