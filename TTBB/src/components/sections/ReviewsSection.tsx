import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: '김민지',
    rating: 5,
    comment:
      '처음 베이킹을 배우는데 너무 친절하게 알려주셔서 재미있게 배웠어요. 1:1 수업이라 제 속도에 맞춰서 진행할 수 있어서 좋았습니다!',
    date: '2024.10.15',
    class: '기초반',
  },
  {
    id: 2,
    name: '박서연',
    rating: 5,
    comment:
      '마카롱 클래스 너무 만족스러웠어요. 어려운 부분을 세심하게 가르쳐주셔서 집에서도 성공적으로 만들 수 있었습니다.',
    date: '2024.10.10',
    class: '심화반',
  },
  {
    id: 3,
    name: '이지혜',
    rating: 5,
    comment:
      '케이크 데코레이션 클래스 완전 추천합니다! 생각보다 쉽고 재미있어요. 선생님이 정말 친절하시고 세심하게 봐주세요.',
    date: '2024.09.28',
    class: '원데이',
  },
  {
    id: 4,
    name: '최유진',
    rating: 5,
    comment: '시즌 클래스로 크리스마스 쿠키 만들었는데 너무 예쁘게 나왔어요. 가족들이 다들 좋아했습니다!',
    date: '2024.09.20',
    class: '시즌클래스',
  },
];

export function ReviewsSection() {
  return (
    <section id="reviews" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">수강생 후기</h2>
          <p className="text-lg text-muted-foreground">
            티티빵빵 클래스를 경험한 분들의 생생한 후기
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-foreground">
                      {review.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-sm text-muted-foreground">{review.class}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <p className="text-foreground/90 leading-relaxed">{review.comment}</p>

                {/* Date */}
                <p className="text-sm text-muted-foreground">{review.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
