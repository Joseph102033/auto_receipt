import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Award } from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: '정성과 사랑',
    description: '하나하나 정성을 담아 가르쳐드립니다',
  },
  {
    icon: Users,
    title: '1:1 맞춤 레슨',
    description: '개인의 수준에 맞춘 맞춤형 수업',
  },
  {
    icon: Award,
    title: '검증된 커리큘럼',
    description: '체계적이고 실용적인 레시피',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            티티빵빵을 소개합니다
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            울산에서 운영하는 따뜻한 홈베이킹 클래스입니다.
            <br />
            초보자도 쉽게 배울 수 있는 친절한 수업을 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardContent className="pt-8 pb-6 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
