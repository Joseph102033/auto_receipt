'use client';

import { NavBar } from '@/components/navigation/NavBar';
import { Footer } from '@/components/navigation/Footer';
import { ClassesSection } from '@/components/sections/ClassesSection';

export default function ClassesPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        {/* Page Header */}
        <section className="py-16 bg-primary/20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                클래스 안내
              </h1>
              <p className="text-lg text-muted-foreground">
                다양한 수준과 주제의 베이킹 클래스를 만나보세요
              </p>
            </div>
          </div>
        </section>

        {/* Classes Content */}
        <ClassesSection />
      </main>
      <Footer />
    </div>
  );
}
