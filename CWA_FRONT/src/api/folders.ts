import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../config/axios';
import { API_PATHS } from '../constants/apiPaths';
import type { Folder } from '../types/folders';

export const useMyFolders = () => {
  return useQuery<Folder[]>({
    queryKey: ['folders'],
    queryFn: () => axios.get(API_PATHS.FOLDERS.BASE).then((res) => res.data),
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      axios.post(API_PATHS.FOLDERS.BASE, { name }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}; 