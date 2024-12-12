import type { User } from '@prisma/client';

export interface ChatMessage {
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

export interface ChatMessageResponse
  extends Omit<ChatMessage, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}
