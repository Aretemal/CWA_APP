export interface Book {
  id: number;
  title: string;
  author: string;
  content?: string;
  description?: string;
  imageUrl?: string;
  coverUrl?: string;
  filePath?: string;
  weight?: number;
  genres?: {
    id: number;
    name: string;
  }[];
  user?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookDto {
  title: string;
  author: string;
  genreIds: number[];
  file: File;
}

export interface BookFile {
  filePath: string;
}

export interface Genre {
  id: number;
  name: string;
  books?: {
    id: number;
    title: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: number;
  pageNumber: number;
  note?: string;
  bookId: number;
  userId: number;
  book: {
    title: string;
    author: string;
  };
} 