import { ClassItem, Review, GalleryItem } from './types';

export const DUMMY_CLASSES: ClassItem[] = [
  {
    id: '1',
    title: '기초 베이킹 클래스',
    description: '베이킹이 처음이신 분들을 위한 기초반입니다. 쿠키, 마들렌 등 간단한 베이킹부터 시작합니다.',
    image: '/images/class-basic.jpg',
    category: 'basic',
    capacity: 4,
    difficulty: 'beginner',
  },
  {
    id: '2',
    title: '케이크 마스터 클래스',
    description: '다양한 케이크 만들기를 배우는 심화반입니다. 생크림 케이크, 치즈케이크 등을 배웁니다.',
    image: '/images/class-advanced.jpg',
    category: 'advanced',
    capacity: 3,
    difficulty: 'advanced',
  },
  {
    id: '3',
    title: '봄 시즌 딸기 디저트',
    description: '제철 딸기를 활용한 다양한 디저트를 만들어봅니다.',
    image: '/images/class-seasonal.jpg',
    category: 'seasonal',
    capacity: 4,
    difficulty: 'intermediate',
  },
  {
    id: '4',
    title: '원데이 마카롱 클래스',
    description: '하루만에 마카롱 만들기를 완성하는 원데이 클래스입니다.',
    image: '/images/class-oneday.jpg',
    category: 'oneday',
    capacity: 4,
    difficulty: 'intermediate',
  },
];

export const DUMMY_REVIEWS: Review[] = [
  {
    id: '1',
    author: '김**',
    content: '선생님이 정말 친절하시고 자세하게 알려주셔서 처음인데도 잘 만들 수 있었어요!',
    rating: 5,
    date: '2024-10-15',
  },
  {
    id: '2',
    author: '이**',
    content: '분위기도 좋고 소규모로 진행되어서 집중해서 배울 수 있었습니다.',
    rating: 5,
    date: '2024-10-10',
  },
  {
    id: '3',
    author: '박**',
    content: '르꼬르동블루 출신 선생님의 노하우를 배울 수 있어서 너무 좋았어요!',
    rating: 5,
    date: '2024-10-05',
  },
];

export const DUMMY_GALLERY: GalleryItem[] = [
  {
    id: '1',
    image: '/images/gallery-1.jpg',
    title: '수강생 작품 - 딸기 케이크',
    category: 'student-work',
  },
  {
    id: '2',
    image: '/images/gallery-2.jpg',
    title: '클래스 현장',
    category: 'classroom',
  },
  {
    id: '3',
    image: '/images/gallery-3.jpg',
    title: '수강생 작품 - 마카롱',
    category: 'student-work',
  },
  {
    id: '4',
    image: '/images/gallery-4.jpg',
    title: '수강생 작품 - 쿠키',
    category: 'student-work',
  },
];

export const CLASS_CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'basic', label: '기초반' },
  { id: 'advanced', label: '심화반' },
  { id: 'seasonal', label: '시즌클래스' },
  { id: 'oneday', label: '원데이' },
] as const;
