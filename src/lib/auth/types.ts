// Authentication types

export interface AuthUser {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
}

export interface JWTPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh' | 'reset' | 'verify';
}

export interface AuthResult {
  user?: AuthUser;
  error?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  tokens?: TokenPair;
  user?: AuthUser;
  error?: string;
}

export interface SignUpResult {
  userId?: string;
  needsVerification?: boolean;
  error?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro' | 'pro_plus' | 'team' | 'enterprise';
  role: 'user' | 'admin' | 'super_admin';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'paused';
  minutes_used: number;
  minutes_quota: number;
  settings: Record<string, unknown>;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile extends AuthUser {
  profile: Profile;
}
