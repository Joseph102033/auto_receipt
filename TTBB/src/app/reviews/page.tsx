import { NavBar } from '@/components/navigation/NavBar';
import { Footer } from '@/components/navigation/Footer';
import { ReviewsSection } from '@/components/sections/ReviewsSection';

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        {/* Page Header */}
        <section className="py-16 bg-primary/20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                수강생 후기
              </h1>
              <p className="text-lg text-muted-foreground">
                티티빵빵 클래스를 경험한 분들의 생생한 후기
              </p>
            </div>
          </div>
        </section>

        {/* Reviews Content */}
        <ReviewsSection />
      </main>
      <Footer />
    </div>
  );
}
