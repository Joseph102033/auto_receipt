import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative bg-primary py-24 md:py-32">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            울산에서 가장 따뜻한
            <br />
            베이킹 클래스, 티티빵빵
          </h1>

          <p className="text-lg md:text-xl text-foreground/80">
            르꼬르동블루·나카무라 출신 전문 강사와 함께하는
            <br />
            1:1 맞춤형 홈베이킹 클래스
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white"
            >
              <Link href="#classes">수업 일정 보기</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#reservation">클래스 신청하기</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
