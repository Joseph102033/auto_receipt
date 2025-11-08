import { NavBar } from '@/components/navigation/NavBar';
import { Footer } from '@/components/navigation/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { ClassesSection } from '@/components/sections/ClassesSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { ReviewsSection } from '@/components/sections/ReviewsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        <HeroSection />
        <AboutSection />
        <ClassesSection />
        <GallerySection />
        <ReviewsSection />
      </main>
      <Footer />
    </div>
  );
}
