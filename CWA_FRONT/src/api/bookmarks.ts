import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../config/axios';
import { API_PATHS } from '../constants/apiPaths';

export interface Bookmark {
  id: number;
  title: string;
  pageNumber: number;
  note?: string;
  color?: string;
  bookId: number;
  createdAt: string;
  book: {
    title: string;
    author: string;
  };
}

export interface CreateBookmarkDto {
  title: string;
  pageNumber: number;
  bookId: number;
  note?: string;
  color: string;
}

export interface UpdateBookmarkNoteDto {
  id: number;
  note: string;
}

export const useBookmarks = (bookId: number) => {
  return useQuery<Bookmark[]>({
    queryKey: ['bookmarks', bookId],
    queryFn: () => axios.get(API_PATHS.BOOKMARKS.BY_BOOK(bookId)).then(res => res.data),
  });
};

export const useCreateBookmark = () => {
  const queryClient = useQueryClient();
  
  return useMutation<unknown, Error, CreateBookmarkDto>({
    mutationFn: (data) => 
      axios.post(API_PATHS.BOOKMARKS.BASE, data).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', variables.bookId] });
    },
  });
};

export const useUpdateBookmarkNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation<unknown, Error, UpdateBookmarkNoteDto>({
    mutationFn: (data) => 
      axios.patch(API_PATHS.BOOKMARKS.UPDATE_NOTE(data.id), { note: data.note }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};

export const useDeleteBookmark = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      axios.delete(API_PATHS.BOOKMARKS.BY_ID(id)).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};

export const useAllBookmarks = () => {
  return useQuery<Bookmark[]>({
    queryKey: ['bookmarks', 'all'],
    queryFn: () => axios.get(API_PATHS.BOOKMARKS.BASE).then(res => res.data),
  });
};

export const useUpdateBookmark = () => {
  const queryClient = useQueryClient();
  
  return useMutation<unknown, Error, { id: number; title: string; color: string; note?: string }>({
    mutationFn: ({ id, ...data }) => 
      axios.patch(API_PATHS.BOOKMARKS.BY_ID(id), data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}; 