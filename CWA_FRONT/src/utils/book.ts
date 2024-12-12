import type { Book } from '../types/books';

export const getBookCover = (book: Book): string | undefined => {
  return book.coverUrl || book.imageUrl;
}; 