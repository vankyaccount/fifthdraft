// Core authentication service
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, transaction } from '@/lib/db/postgres';
import type { AuthUser, TokenPair, LoginResult, SignUpResult, JWTPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 12;

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate token pair
  static generateTokens(userId: string, email: string): TokenPair {
    const accessToken = jwt.sign(
      { sub: userId, email, type: 'access' } as Partial<JWTPayload>,
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    const refreshToken = jwt.sign(
      { sub: userId, email, type: 'refresh' } as Partial<JWTPayload>,
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
    return { accessToken, refreshToken };
  }

  // Verify access token
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      if (payload.type !== 'access') return null;
      return payload;
    } catch {
      return null;
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): JWTPayload | null {
    try {
      const payload = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
      if (payload.type !== 'refresh') return null;
      return payload;
    } catch {
      return null;
    }
  }

  // Sign up new user
  static async signUp(email: string, password: string, fullName: string): Promise<SignUpResult> {
    try {
      // Validate input
      if (!email || !password || password.length < 6) {
        return { error: 'Invalid email or password (min 6 characters)' };
      }

      // Check if user already exists
      const existing = await query('SELECT id FROM auth_users WHERE email = $1', [email.toLowerCase()]);
      if (existing.rows.length > 0) {
        return { error: 'An account with this email already exists' };
      }

      const passwordHash = await this.hashPassword(password);
      const userId = crypto.randomUUID();
      const verifyToken = crypto.randomBytes(32).toString('hex');

      await transaction(async (client) => {
        // Create auth user
        await client.query(
          `INSERT INTO auth_users (id, email, password_hash, verify_token, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [userId, email.toLowerCase(), passwordHash, verifyToken]
        );

        // Create profile
        await client.query(
          `INSERT INTO profiles (id, email, full_name, subscription_tier, role, minutes_quota, minutes_used, settings, onboarding_completed, created_at, updated_at)
           VALUES ($1, $2, $3, 'free', 'user', 30, 0, '{}', false, NOW(), NOW())`,
          [userId, email.toLowerCase(), fullName || '']
        );
      });

      // TODO: Send verification email
      // await sendVerificationEmail(email, verifyToken);

      return { userId, needsVerification: true };
    } catch (error: unknown) {
      console.error('Signup error:', error);
      return { error: 'Failed to create account' };
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<LoginResult> {
    try {
      const result = await query<{
        id: string;
        password_hash: string;
        email_verified: boolean;
        email: string;
        created_at: string;
      }>(
        'SELECT id, email, password_hash, email_verified, created_at FROM auth_users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return { error: 'Invalid email or password' };
      }

      const user = result.rows[0];
      const valid = await this.verifyPassword(password, user.password_hash);

      if (!valid) {
        return { error: 'Invalid email or password' };
      }

      // Update last login
      await query('UPDATE auth_users SET last_login_at = NOW() WHERE id = $1', [user.id]);

      const tokens = this.generateTokens(user.id, user.email);
      return {
        tokens,
        user: {
          id: user.id,
          email: user.email,
          email_verified: user.email_verified,
          created_at: user.created_at,
        },
      };
    } catch (error: unknown) {
      console.error('Login error:', error);
      return { error: 'Login failed' };
    }
  }

  // Refresh tokens
  static async refreshTokens(refreshToken: string): Promise<LoginResult> {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      if (!payload) {
        return { error: 'Invalid refresh token' };
      }

      // Verify user still exists
      const result = await query<{ id: string; email: string; email_verified: boolean; created_at: string }>(
        'SELECT id, email, email_verified, created_at FROM auth_users WHERE id = $1',
        [payload.sub]
      );

      if (result.rows.length === 0) {
        return { error: 'User not found' };
      }

      const user = result.rows[0];
      const tokens = this.generateTokens(user.id, user.email);

      return {
        tokens,
        user: {
          id: user.id,
          email: user.email,
          email_verified: user.email_verified,
          created_at: user.created_at,
        },
      };
    } catch (error: unknown) {
      console.error('Refresh token error:', error);
      return { error: 'Token refresh failed' };
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await query('SELECT id FROM auth_users WHERE email = $1', [email.toLowerCase()]);

      // Don't reveal if user exists
      if (result.rows.length === 0) {
        return { success: true };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 3600000); // 1 hour

      await query(
        'UPDATE auth_users SET reset_token = $1, reset_token_expiry = $2, updated_at = NOW() WHERE email = $3',
        [resetToken, expiry, email.toLowerCase()]
      );

      // TODO: Send reset email
      // await sendPasswordResetEmail(email, resetToken);

      return { success: true };
    } catch (error: unknown) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'Failed to process request' };
    }
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!newPassword || newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      const result = await query<{ id: string }>(
        'SELECT id FROM auth_users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
        [token]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      const passwordHash = await this.hashPassword(newPassword);

      await query(
        `UPDATE auth_users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW() WHERE id = $2`,
        [passwordHash, result.rows[0].id]
      );

      return { success: true };
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }

  // Verify email with token
  static async verifyEmail(token: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      const result = await query<{ id: string }>(
        'UPDATE auth_users SET email_verified = true, verify_token = NULL, updated_at = NOW() WHERE verify_token = $1 RETURNING id',
        [token]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Invalid verification token' };
      }

      return { success: true, userId: result.rows[0].id };
    } catch (error: unknown) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Failed to verify email' };
    }
  }

  // Resend verification email
  static async resendVerification(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const verifyToken = crypto.randomBytes(32).toString('hex');

      const result = await query(
        'UPDATE auth_users SET verify_token = $1, updated_at = NOW() WHERE email = $2 AND email_verified = false RETURNING id',
        [verifyToken, email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'User not found or already verified' };
      }

      // TODO: Send verification email
      // await sendVerificationEmail(email, verifyToken);

      return { success: true };
    } catch (error: unknown) {
      console.error('Resend verification error:', error);
      return { success: false, error: 'Failed to resend verification' };
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const result = await query<AuthUser>(
        'SELECT id, email, email_verified, created_at FROM auth_users WHERE id = $1',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error: unknown) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Change password (requires current password)
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!newPassword || newPassword.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters' };
      }

      const result = await query<{ password_hash: string }>(
        'SELECT password_hash FROM auth_users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const valid = await this.verifyPassword(currentPassword, result.rows[0].password_hash);
      if (!valid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      const passwordHash = await this.hashPassword(newPassword);
      await query(
        'UPDATE auth_users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, userId]
      );

      return { success: true };
    } catch (error: unknown) {
      console.error('Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  // Delete user account
  static async deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // auth_users has CASCADE delete to profiles, which cascades to other tables
      await query('DELETE FROM auth_users WHERE id = $1', [userId]);
      return { success: true };
    } catch (error: unknown) {
      console.error('Delete account error:', error);
      return { success: false, error: 'Failed to delete account' };
    }
  }
}
