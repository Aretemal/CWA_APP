export type Role = 'USER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface ChangeRoleDto {
  userId: number;
  role: Role;
}

export interface AuthResponse {
  access_token: string;
  user: User;
} 