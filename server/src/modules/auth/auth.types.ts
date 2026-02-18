import type { UserRole } from '@prisma/client';

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: PublicUser;
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  sessionId: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  sessionId: string;
}

export interface PublicSession {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}
