import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError, isAxiosError } from 'axios';
import axios from '../config/axios';
import { Book } from '../types/books';
import { API_PATHS } from '../constants/apiPaths';

export const useBooks = (genreIds?: number[]) => {
  return useQuery<Book[], Error>({
    queryKey: ['books', { genreIds }],
    queryFn: async () => {
      try {
        const response = await axios.get(API_PATHS.BOOKS.BASE, {
          params: genreIds?.length ? { genres: genreIds.join(',') } : undefined,
        });
        return response.data;
      } catch (error) {
        throw new Error('Ошибка при загрузке книг');
      }
    },
    staleTime: 0
  });
};

export const useBook = (id: number) => {
  return useQuery<Book>({
    queryKey: ['book', id],
    queryFn: () => 
      axios.get(API_PATHS.BOOKS.BY_ID(id))
        .then((res) => res.data),
  });
};

export const useBookPDF = (id: string) => {
  return useQuery<Blob>({
    queryKey: ['bookPDF', id],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_PATHS.BOOKS.BY_ID(Number(id))}/file`, {
          responseType: 'blob',
          withCredentials: true
        });

        if (response.data.type !== 'application/pdf') {
          throw new Error('Неверный формат файла');
        }

        return response.data;
      } catch (error) {
        if (isAxiosError(error) && error.message) {
          throw new Error(`Ошибка при загрузке файла: ${error.message}`);
        }
        throw new Error('Неизвестная ошибка при загрузке файла');
      }
    },
    enabled: !!id,
    staleTime: Infinity,
    gcTime: 0
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => 
      axios.post(API_PATHS.BOOKS.BASE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      axios.delete(API_PATHS.BOOKS.BY_ID(id)).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useMyBooks = () => {
  return useQuery<Book[]>({
    queryKey: ['books', 'my'],
    queryFn: () => axios.get<Book[]>(`${API_PATHS.BOOKS.MY}`).then(res => res.data),
  });
};

export const useUpdateBookCover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, coverFile }: { bookId: number; coverFile: File }) => {
      const formData = new FormData();
      formData.append('cover', coverFile);
      return axios.patch(`${API_PATHS.BOOKS.BASE}/${bookId}/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useBookCover = (bookId: number) => {
  return useQuery<string>({
    queryKey: ['bookCover', bookId],
    queryFn: async () => {
      const response = await axios.get(API_PATHS.BOOKS.COVER(bookId), {
        responseType: 'arraybuffer'
      });
      
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] 
      });
      
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    },
    enabled: !!bookId,
  });
}; 