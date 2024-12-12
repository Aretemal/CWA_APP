import { useQuery } from '@tanstack/react-query';
import axios from '../config/axios';
import { API_PATHS } from '../constants/apiPaths';
import type { News } from '../types/news';

export const useNews = () => {
  return useQuery<News[]>({
    queryKey: ['news'],
    queryFn: () => axios.get(API_PATHS.NEWS.BASE).then(res => res.data),
  });
}; 