import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../config/axios';
import { API_PATHS } from '../constants/apiPaths';
import type { User, UpdateUserRoleDto } from '../types/users';
import type { UserProfile } from '../types/user';

// Получение всех пользователей
export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => axios.get(API_PATHS.USERS.ALL).then(res => res.data),
  });
};

// Получение профиля текущего пользователя
export const useUserProfile = <T = UserProfile>() => {
  return useQuery<T>({
    queryKey: ['profile'],
    queryFn: () => axios.get(API_PATHS.USERS.PROFILE).then((res) => res.data),
  });
};

// Обновление роли пользователя
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRoleDto) => 
      axios.patch(`${API_PATHS.USERS.UPDATE_ROLE}/${data.userId}`, { role: data.role })
        .then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Удаление пользователя
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => 
      axios.delete(`${API_PATHS.USERS.BY_ID(userId)}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUser = (userId: number) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => axios.get(`${API_PATHS.USERS.BY_ID(userId)}`).then((res) => res.data),
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await axios.get(API_PATHS.USERS.STATS);
      return response.data;
    }
  });
};