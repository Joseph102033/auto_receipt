import { Card } from '@/components/ui/card';
import { Award, Heart, Users } from 'lucide-react';

export function AboutSection() {
  return (
    <section className="py-16 md:py-24" id="about">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">티티빵빵 소개</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            쉽고 따뜻한 홈베이킹을 통해 일상의 작은 행복을 만들어갑니다
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">전문 강사</h3>
            <p className="text-muted-foreground">
              르꼬르동블루·나카무라 출신 이현빈 선생님의 체계적인 커리큘럼
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">소규모 클래스</h3>
            <p className="text-muted-foreground">
              최대 4명의 소규모 수업으로 1:1 밀착 케어
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">따뜻한 분위기</h3>
            <p className="text-muted-foreground">
              편안하고 아늑한 공간에서 즐겁게 배우는 베이킹
            </p>
          </Card>
        </div>

        <div className="bg-muted rounded-lg p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h3 className="text-2xl font-bold">강사 소개</h3>
            <p className="text-lg">이현빈 선생님</p>
            <p className="text-muted-foreground">
              프랑스 르꼬르동블루와 일본 나카무라 제과학교에서 전문적인 베이킹 기술을 배우고,
              <br />
              울산에서 여러분과 함께 따뜻한 베이킹의 즐거움을 나누고 있습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
