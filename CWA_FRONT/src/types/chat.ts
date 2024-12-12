import type { User } from './user';

export interface ChatUser extends User {
  avatar: string | null;
}

export interface Message {
  id: number;
  content: string;
  userId: number;
  chatId: number;
  isAdmin: boolean;
  viewed: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
}

export interface Chat {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  messages: Message[];
}

export interface SendMessageDto {
  chatId?: number;
  content: string;
} 