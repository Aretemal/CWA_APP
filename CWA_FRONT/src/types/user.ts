import { Role } from './auth';

export interface User {
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
}

export interface UserProfile {
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
}

// Расширяем тип User для использования в приложении
export interface AppUser extends User {
  isAdmin: boolean;
}

export interface UserState {
  userData: AppUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
} 