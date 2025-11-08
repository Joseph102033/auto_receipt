import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-br from-primary to-primary/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>

      {/* Content */}
      <div className="relative container px-4 text-center space-y-8">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground">
          따뜻하고 정성스러운
          <br />
          <span className="text-accent">홈베이킹 클래스</span>
        </h1>

        <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
          울산에서 만나는 1:1 맞춤 베이킹 레슨
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/reservation">클래스 신청하기</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
            <Link href="/classes">클래스 둘러보기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
