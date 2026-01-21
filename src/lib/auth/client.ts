'use client';

// Client-side auth utilities

export interface AuthUser {
  id: string;
  email: string;
  email_verified: boolean;
  emailVerified?: boolean; // Alias for compatibility
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  subscription_tier: string;
  minutes_used: number;
  minutes_quota: number;
  settings: Record<string, unknown>;
  onboarding_completed: boolean;
}

export interface UserWithProfile {
  user: AuthUser;
  profile: Profile;
}

// Login
export async function login(
  email: string,
  password: string
): Promise<{ user?: AuthUser; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Login failed' };
    }

    return { user: data.user };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

// Signup
export async function signup(
  email: string,
  password: string,
  fullName: string
): Promise<{ success?: boolean; needsVerification?: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Signup failed' };
    }

    return { success: true, needsVerification: data.needsVerification };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

// Logout
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } finally {
    // Always redirect to login, even if request fails
    window.location.href = '/login';
  }
}

// Request password reset
export async function requestPasswordReset(
  email: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Failed to send reset email' };
    }

    return { success: true };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

// Reset password with token
export async function resetPassword(
  token: string,
  password: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Failed to reset password' };
    }

    return { success: true };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

// Verify email with token
export async function verifyEmail(
  token: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Failed to verify email' };
    }

    return { success: true };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

// Resend verification email
export async function resendVerification(
  email: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Failed to resend verification' };
    }

    return { success: true };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

// Alias for resendVerification
export const resendVerificationEmail = resendVerification;

// Get current user
export async function getCurrentUser(): Promise<{
  user?: AuthUser & { emailVerified: boolean };
  profile?: Profile;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/me');

    if (!res.ok) {
      return { error: 'Not authenticated' };
    }

    const data = await res.json();

    // Ensure emailVerified is set
    if (data.user) {
      data.user.emailVerified = data.user.email_verified || false;
    }

    return data;
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

// Change password
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Failed to change password' };
    }

    return { success: true };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

// Delete account
export async function deleteAccount(): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/delete-account', {
      method: 'POST',
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Failed to delete account' };
    }

    return { success: true };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}
