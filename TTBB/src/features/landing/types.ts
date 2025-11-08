export interface ClassItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'basic' | 'advanced' | 'seasonal' | 'oneday';
  capacity: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  date: string;
}

export interface GalleryItem {
  id: string;
  image: string;
  title: string;
  category: string;
}
