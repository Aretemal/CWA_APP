import type { Book } from './books';

export interface Folder {
  id: number;
  name: string;
  userId: number;
  books: Book[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderDto {
  name: string;
}

export interface UpdateFolderDto {
  name: string;
} 