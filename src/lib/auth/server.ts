// Server-side auth utilities for API routes and server components
import { cookies } from 'next/headers';
import { getServerUser, getServerUserWithProfile, getUserProfile } from './middleware';
import type { AuthenticatedUser } from './middleware';
import type { Profile } from './types';

/**
 * Get current authenticated user from cookies (for server components)
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  return getServerUser(cookieStore);
}

/**
 * Get current authenticated user with profile
 * @returns User and profile object or null if not authenticated
 */
export async function getCurrentUserWithProfile(): Promise<{
  user: AuthenticatedUser;
  profile: Profile;
} | null> {
  const cookieStore = await cookies();
  return getServerUserWithProfile(cookieStore);
}

/**
 * Get profile for a specific user ID
 * @param userId User ID
 * @returns Profile or null if not found
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  return getUserProfile(userId);
}

/**
 * Require authenticated user - throws error if not authenticated
 * @returns Authenticated user
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Require authenticated user with profile - throws error if not authenticated
 * @returns User and profile
 */
export async function requireAuthWithProfile(): Promise<{
  user: AuthenticatedUser;
  profile: Profile;
}> {
  const result = await getCurrentUserWithProfile();
  if (!result) {
    throw new Error('Authentication required');
  }
  return result;
}

// Re-export types for convenience
export type { AuthenticatedUser, Profile };
