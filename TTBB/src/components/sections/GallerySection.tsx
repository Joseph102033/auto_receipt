import { Card } from '@/components/ui/card';

const galleryItems = [
  {
    id: 1,
    title: '크루아상 클래스',
    category: '프랑스 빵',
  },
  {
    id: 2,
    title: '마카롱 만들기',
    category: '디저트',
  },
  {
    id: 3,
    title: '생크림 케이크',
    category: '케이크',
  },
  {
    id: 4,
    title: '쿠키 데코레이션',
    category: '쿠키',
  },
  {
    id: 5,
    title: '식빵 만들기',
    category: '기본 빵',
  },
  {
    id: 6,
    title: '타르트',
    category: '타르트',
  },
];

export function GallerySection() {
  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">갤러리</h2>
          <p className="text-lg text-muted-foreground">
            수강생들이 만든 아름다운 작품들을 만나보세요
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {galleryItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-square bg-gradient-to-br from-primary to-primary/50">
                {/* Placeholder for image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-semibold text-foreground/80">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
