import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../config/axios';
import { API_PATHS } from '../constants/apiPaths';
import type { UserWithBooks } from '../types/subscriptions';

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: number) => 
      axios.post(API_PATHS.SUBSCRIPTIONS.FOLLOW(userId)).then(res => res.data),
    onSuccess: (_, userId) => {
      // Обновляем данные в кеше
      queryClient.setQueryData<UserWithBooks[]>(['users', 'search'], (old) => 
        old?.map(user => 
          user.id === userId ? { ...user, isFollowing: true } : user
        ) || []
      );
      queryClient.setQueryData<UserWithBooks[]>(['subscriptions', 'following'], (old) => 
        [...(old || []), queryClient.getQueryData<UserWithBooks[]>(['users', 'search'])?.find(u => u.id === userId)].filter(Boolean) as UserWithBooks[]
      );
      // Инвалидируем все связанные запросы
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: number) => 
      axios.delete(API_PATHS.SUBSCRIPTIONS.UNFOLLOW(userId)).then(res => res.data),
    onSuccess: (_, userId) => {
      // Обновляем данные в кеше
      queryClient.setQueryData<UserWithBooks[]>(['users', 'search'], (old) => 
        old?.map(user => 
          user.id === userId ? { ...user, isFollowing: false } : user
        ) || []
      );
      queryClient.setQueryData<UserWithBooks[]>(['subscriptions', 'following'], (old) => 
        (old || []).filter(user => user.id !== userId)
      );
      // Инвалидируем все связанные запросы
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useFollowers = () => {
  return useQuery<UserWithBooks[]>({
    queryKey: ['subscriptions', 'followers'],
    queryFn: () => axios.get(API_PATHS.SUBSCRIPTIONS.FOLLOWERS).then(res => res.data),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 0,
  });
};

export const useFollowing = () => {
  return useQuery<UserWithBooks[]>({
    queryKey: ['subscriptions', 'following'],
    queryFn: () => axios.get(API_PATHS.SUBSCRIPTIONS.FOLLOWING).then(res => res.data),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 0,
  });
};

export const useCheckFollowing = (userId: number) => {
  return useQuery<boolean>({
    queryKey: ['subscriptions', 'check', userId],
    queryFn: () => axios.get(API_PATHS.SUBSCRIPTIONS.CHECK(userId)).then(res => res.data),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 0,
  });
};

export const useSearchUsers = (searchTerm: string) => {
  const queryClient = useQueryClient();
  const following = queryClient.getQueryData<UserWithBooks[]>(['subscriptions', 'following']) || [];
  
  return useQuery<UserWithBooks[]>({
    queryKey: ['users', 'search', searchTerm],
    queryFn: async () => {
      const users = await axios.get(`${API_PATHS.SUBSCRIPTIONS.SEARCH}?search=${searchTerm}`).then(res => res.data);
      // Добавляем информацию о подписке
      return users.map((user: UserWithBooks) => ({
        ...user,
        isFollowing: following.some(f => f.id === user.id)
      }));
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 0,
  });
}; 