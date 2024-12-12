export interface CreateBookmarkDto {
  title: string;
  pageNumber: number;
  bookId: number;
}

export interface Bookmark {
  id: number;
  title: string;
  pageNumber: number;
  bookId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  book?: {
    title: string;
    author: string;
  };
} 