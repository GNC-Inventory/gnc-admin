// User role enum
export type UserRole = 'ADMIN' | 'MANAGER' | 'SALESMAN';

// Base user interface
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  employeeId?: string;
  avatar?: string;
  isActive: boolean;
  forcePasswordChange: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// User with online status (for management views)
export interface UserWithStatus extends User {
  isOnline: boolean;
}

// User creation payload
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId?: string;
}

// User creation response
export interface CreateUserResponse {
  user: User;
  tempPassword: string;
}

// Password change request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Admin password reset request
export interface AdminChangePasswordRequest {
  userId: number;
  newPassword: string;
}

// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  total?: number;
}