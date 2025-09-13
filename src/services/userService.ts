import { 
  User, 
  UserWithStatus, 
  CreateUserRequest, 
  CreateUserResponse, 
  ChangePasswordRequest,
  AdminChangePasswordRequest,
  ApiResponse 
} from '@/types/user';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

class UserService {
  private getHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Get all users
  async getAllUsers(token: string): Promise<UserWithStatus[]> {
    const response = await fetch(`${API_BASE}/api/users`, {
      headers: this.getHeaders(token),
    });
    
    const data: ApiResponse<UserWithStatus[]> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to fetch users');
    }
    
    return data.data || [];
  }

  // Create new user
  async createUser(token: string, userData: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await fetch(`${API_BASE}/api/users/salesman`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(userData),
    });
    
    const data: ApiResponse<CreateUserResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to create user');
    }
    
    return data.data!;
  }

  // Delete user
  async deleteUser(token: string, userId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    
    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to delete user');
    }
  }

  // Force logout user
  async logoutUser(token: string, userId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/users/${userId}/logout`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    
    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to logout user');
    }
  }

  // Admin reset password
  async adminResetPassword(token: string, userId: number, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/users/admin-change-password`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ userId, newPassword }),
    });
    
    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to reset password');
    }
  }

  // Get user by ID
  async getUserById(token: string, userId: number): Promise<User> {
    const response = await fetch(`${API_BASE}/api/users/${userId}`, {
      headers: this.getHeaders(token),
    });
    
    const data: ApiResponse<User> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to fetch user');
    }
    
    return data.data!;
  }

  // Change own password (through auth endpoint)
  async changePassword(token: string, passwordData: ChangePasswordRequest): Promise<void> {
    const response = await fetch(`${API_BASE}/api/auth/change-password`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(passwordData),
    });
    
    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to change password');
    }
  }
}

export const userService = new UserService();