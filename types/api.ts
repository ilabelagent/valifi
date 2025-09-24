// API Request and Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}
export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  TRADER = 'trader',
  PREMIUM = 'premium'
}

export interface BotRequest {
  bot: string;
  action: string;
  userId?: string;
  params?: Record<string, any>;
}

export interface TransactionRequest {
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  TRADE = 'trade',
  FEE = 'fee'
}