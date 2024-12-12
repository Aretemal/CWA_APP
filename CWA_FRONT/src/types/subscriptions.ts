export interface UserWithBooks {
  id: number;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  books?: {
    id: number;
    title: string;
    author: string;
    imageUrl?: string;
  }[];
  _count: {
    books: number;
    followers: number;
  };
  isFollowing: boolean;
} 