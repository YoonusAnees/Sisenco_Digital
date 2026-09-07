import { UserRole } from '@/constants/roles';

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponseData {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: string;
  jobTitle?: string;
}

export interface UpdateUserPayload {
  name?: string;
  department?: string;
  jobTitle?: string;
}
