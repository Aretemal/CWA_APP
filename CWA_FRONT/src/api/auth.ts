import { useMutation } from '@tanstack/react-query';
import axios from '../config/axios';
import { LoginDto, RegisterDto, ChangeRoleDto } from '../types/auth';
import { API_PATHS } from './constants';

export const useLogin = () => {
  return useMutation<any, Error, LoginDto>({
    mutationFn: (data: LoginDto) => 
      axios.post(API_PATHS.AUTH.LOGIN, data).then((res) => res.data),
  });
};

export const useRegister = () => {
  return useMutation<any, Error, RegisterDto>({
    mutationFn: (data: RegisterDto) => 
      axios.post(API_PATHS.AUTH.REGISTER, data).then((res) => res.data),
  });
};

export const useChangeUserRole = () => {
  return useMutation<any, Error, ChangeRoleDto>({
    mutationFn: (data: ChangeRoleDto) => 
      axios.patch(API_PATHS.AUTH.CHANGE_ROLE, data).then((res) => res.data),
  });
}; 