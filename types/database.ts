// Database Model Types

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role: string;
  kyc_status: string;
  aml_status: string;
  account_status: string;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  email_verified: boolean;
  phone_number?: string;
  phone_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WalletRecord {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  available_balance: number;
  locked_balance: number;
  created_at: Date;
  updated_at: Date;
}
export interface TransactionRecord {
  id: string;
  user_id: string;
  wallet_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  reference_id?: string;
  description?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface TradingBotRecord {
  id: string;
  user_id: string;
  bot_type: string;
  name: string;
  configuration: any;
  is_active: boolean;
  last_run?: Date;
  performance_metrics?: any;
  created_at: Date;
  updated_at: Date;
}

export interface SessionRecord {
  id: string;
  user_id: string;
  token: string;
  refresh_token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}