import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../config/axios';
import { Genre } from '../types/genres';
import { API_PATHS } from '../constants/apiPaths';

export const useGenres = () => {
  return useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: () => axios.get<Genre[]>(API_PATHS.GENRES.BASE).then(res => res.data),
    staleTime: 0,
    gcTime: 0,
  });
};

export const useCreateGenre = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string }) => 
      axios.post<Genre>(API_PATHS.GENRES.BASE, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
    },
  });
};

export const useDeleteGenre = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      axios.delete(`${API_PATHS.GENRES.BASE}/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
    },
  });
};

export const useUpdateGenre = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: number; name: string }) => 
      axios.patch(`${API_PATHS.GENRES.BY_ID(data.id)}`, { name: data.name }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
    },
  });
};
