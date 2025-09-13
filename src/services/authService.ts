import { User, ChangePasswordRequest, ApiResponse } from '@/types/user';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

class AuthService {
  private getHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    
    const data: ApiResponse<LoginResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Login failed');
    }
    
    return data.data!;
  }

  // Logout user
  async logout(token: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(token),
      });
    } catch (error) {
      // Don't throw on logout errors - clear local state anyway
      console.error('Logout error:', error);
    }
  }

  // Get current user info
  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: this.getHeaders(token),
    });
    
    const data: ApiResponse<{ user: User }> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to get user info');
    }
    
    return data.data!.user;
  }

  // Change password
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

  // Token storage helpers
  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  storeAuth(token: string, user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Check if token is expired (basic check)
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

export const authService = new AuthService();