// Valifi Authentication Service
// Complete auth flow from sign-in to post-authentication features

import axios, { AxiosInstance } from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  isVerified: boolean;
  mfaEnabled: boolean;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: User;
  error?: string;
  requiresMFA?: boolean;
}

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;
  private apiClient: AxiosInstance;
  private refreshTokenTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.apiClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.initializeFromStorage();
    this.setupInterceptors();
  }

  // Initialize auth state from localStorage
  private initializeFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('valifi_token');
      this.refreshToken = localStorage.getItem('valifi_refresh_token');
      const userData = localStorage.getItem('valifi_user');
      
      if (userData) {
        try {
          this.user = JSON.parse(userData);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          this.clearAuth();
        }
      }

      if (this.token) {
        this.setAuthHeader(this.token);
        this.scheduleTokenRefresh();
      }
    }
  }

  // Setup axios interceptors for token refresh
  private setupInterceptors(): void {
    // Request interceptor to add token
    this.apiClient.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token expiry
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
              originalRequest.headers.Authorization = `Bearer ${this.token}`;
              return this.apiClient(originalRequest);
            }
          } catch (refreshError) {
            this.signOut();
            window.location.href = '/signin';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Sign In with email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post('/auth/signin', {
        email,
        password
      });

      const { token, refreshToken, user, requiresMFA } = response.data;

      if (requiresMFA) {
        // Store temporary auth state for MFA verification
        this.user = user;
        return { success: true, requiresMFA: true, user };
      }

      // Complete sign in
      this.setAuthData(token, refreshToken, user);
      this.scheduleTokenRefresh();

      return { success: true, user };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Authentication failed'
      };
    }
  }

  // Sign Up new user
  async signUp(userData: {
    email: string;
    password: string;
    name: string;
    acceptTerms: boolean;
  }): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post('/auth/signup', userData);
      
      const { token, refreshToken, user } = response.data;
      
      // Auto sign in after registration
      this.setAuthData(token, refreshToken, user);
      this.scheduleTokenRefresh();
      
      // Send verification email
      await this.sendVerificationEmail();
      
      return { success: true, user };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  // Verify MFA code
  async verifyMFA(code: string): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post('/auth/verify-mfa', {
        code,
        userId: this.user?.id
      });

      const { token, refreshToken } = response.data;
      
      this.setAuthData(token, refreshToken, this.user!);
      this.scheduleTokenRefresh();
      
      return { success: true, user: this.user! };
    } catch (error: any) {
      return {
        success: false,
        error: 'Invalid verification code'
      };
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await this.apiClient.post('/auth/refresh', {
        refreshToken: this.refreshToken
      });

      const { token, refreshToken } = response.data;
      
      this.token = token;
      this.refreshToken = refreshToken;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('valifi_token', token);
        localStorage.setItem('valifi_refresh_token', refreshToken);
      }
      
      this.setAuthHeader(token);
      this.scheduleTokenRefresh();
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Schedule automatic token refresh
  private scheduleTokenRefresh(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }

    // Refresh token 5 minutes before expiry
    const refreshIn = 25 * 60 * 1000; // 25 minutes
    
    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshAccessToken();
    }, refreshIn);
  }

  // Password reset request
  async requestPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      await this.apiClient.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: 'Password reset link sent to your email'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email'
      };
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post('/auth/reset-password', {
        token,
        newPassword
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reset password'
      };
    }
  }

  // Send verification email
  async sendVerificationEmail(): Promise<void> {
    try {
      await this.apiClient.post('/auth/send-verification');
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }
  }

  // Verify email with token
  async verifyEmail(token: string): Promise<{ success: boolean }> {
    try {
      const response = await this.apiClient.post('/auth/verify-email', { token });
      
      if (this.user) {
        this.user.isVerified = true;
        this.updateStoredUser();
      }
      
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  // Sign out
  signOut(): void {
    this.clearAuth();
    
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
    
    // Notify server about sign out
    this.apiClient.post('/auth/signout').catch(() => {});
    
    // Redirect to sign in page
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
  }

  // Helper methods
  private setAuthData(token: string, refreshToken: string, user: User): void {
    this.token = token;
    this.refreshToken = refreshToken;
    this.user = user;

    if (typeof window !== 'undefined') {
      localStorage.setItem('valifi_token', token);
      localStorage.setItem('valifi_refresh_token', refreshToken);
      localStorage.setItem('valifi_user', JSON.stringify(user));
    }

    this.setAuthHeader(token);
  }

  private setAuthHeader(token: string): void {
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  private clearAuth(): void {
    this.token = null;
    this.refreshToken = null;
    this.user = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('valifi_token');
      localStorage.removeItem('valifi_refresh_token');
      localStorage.removeItem('valifi_user');
    }

    delete this.apiClient.defaults.headers.common['Authorization'];
  }

  private updateStoredUser(): void {
    if (typeof window !== 'undefined' && this.user) {
      localStorage.setItem('valifi_user', JSON.stringify(this.user));
    }
  }

  // Getters
  getUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  hasPermission(permission: string): boolean {
    return this.user?.permissions?.includes(permission) || false;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
export type { User, AuthResponse };