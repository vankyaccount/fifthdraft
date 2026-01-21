// Auth module exports
export { AuthService } from './service';
export {
  withAuth,
  withOptionalAuth,
  getServerUser,
  getServerUserWithProfile,
  getUserProfile,
  setAuthCookies,
  clearAuthCookies,
  getTokenFromRequest,
  AUTH_COOKIE_OPTIONS,
  type AuthenticatedRequest,
  type AuthenticatedUser,
} from './middleware';
export type {
  AuthUser,
  JWTPayload,
  AuthResult,
  TokenPair,
  LoginResult,
  SignUpResult,
  Profile,
  UserWithProfile,
} from './types';
