import argon2 from 'argon2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { authRepo } from './auth.repo.js';
import { redis } from '../../libs/redis.js';
import { env } from '../../config/env.js';
import { logger } from '../../libs/logger.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../shared/errors/errors.js';
import type { User } from '@prisma/client';
import type { PublicUser, AuthTokens, AuthResult, JwtPayload, RefreshTokenPayload, PublicSession } from './auth.types.js';
import type { RegisterInput, LoginInput } from './auth.schemas.js';

const REFRESH_TOKEN_PREFIX = 'refresh_token:';
const BLACKLIST_PREFIX = 'token_blacklist:';
const SESSION_PREFIX = 'session:';
const USER_SESSIONS_PREFIX = 'user_sessions:';
const USER_REFRESH_TOKENS_PREFIX = 'user_refresh_tokens:';

export function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 3600;
    case 'd': return num * 86400;
    default: return 900;
  }
}

class AuthService {
  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: parseExpiresIn(env.JWT_ACCESS_EXPIRES_IN),
    });
  }

  private generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN),
    });
  }

  private async generateTokens(user: User, sessionId: string): Promise<AuthTokens> {
    const tokenId = randomUUID();

    const accessToken = this.generateAccessToken({
      userId: user.id,
      role: user.role,
      sessionId,
    });

    const refreshToken = this.generateRefreshToken({
      userId: user.id,
      tokenId,
      sessionId,
    });

    const refreshTtl = parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN);
    await redis.set(
      `${REFRESH_TOKEN_PREFIX}${tokenId}`,
      user.id,
      'EX',
      refreshTtl,
    );

    // Track refresh token ID per user for efficient bulk deletion
    await redis.sadd(`${USER_REFRESH_TOKENS_PREFIX}${user.id}`, tokenId);

    return { accessToken, refreshToken };
  }

  private async createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const refreshTtl = parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + refreshTtl * 1000);

    const session = await authRepo.createSession({
      userId,
      userAgent,
      ipAddress,
      expiresAt,
    });

    // Track session in Redis for fast validation
    await redis.set(`${SESSION_PREFIX}${session.id}`, userId, 'EX', refreshTtl);
    await redis.sadd(`${USER_SESSIONS_PREFIX}${userId}`, session.id);

    return session.id;
  }

  async register(
    input: RegisterInput,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResult> {
    const normalizedEmail = input.email.toLowerCase();

    const existing = await authRepo.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('A user with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });

    const user = await authRepo.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: normalizedEmail,
      phone: input.phone,
      passwordHash,
    });

    const sessionId = await this.createSession(user.id, userAgent, ipAddress);
    const tokens = await this.generateTokens(user, sessionId);

    return {
      user: this.toPublicUser(user),
      tokens,
    };
  }

  async login(
    input: LoginInput,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResult> {
    const normalizedEmail = input.email.toLowerCase();

    const user = await authRepo.findByEmail(normalizedEmail);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Dual-verify: try Argon2 first, fall back to bcrypt for gradual migration
    let isPasswordValid = false;
    let needsRehash = false;

    try {
      isPasswordValid = await argon2.verify(user.passwordHash, input.password);
    } catch {
      // Not an Argon2 hash — try bcrypt fallback
    }

    if (!isPasswordValid) {
      try {
        isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
        if (isPasswordValid) {
          needsRehash = true;
        }
      } catch {
        // Invalid hash format
      }
    }

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Gradual migration: re-hash with Argon2id if bcrypt was used
    if (needsRehash) {
      try {
        const newHash = await argon2.hash(input.password, { type: argon2.argon2id });
        await authRepo.updatePassword(user.id, newHash);
        logger.info(`Migrated password hash to Argon2id for user ${user.id}`);
      } catch {
        // Non-critical — login still succeeds with old hash
      }
    }

    const sessionId = await this.createSession(user.id, userAgent, ipAddress);
    const tokens = await this.generateTokens(user, sessionId);

    return {
      user: this.toPublicUser(user),
      tokens,
    };
  }

  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      const decoded = jwt.verify(accessToken, env.JWT_ACCESS_SECRET) as JwtPayload & { exp: number };
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.set(`${BLACKLIST_PREFIX}${accessToken}`, '1', 'EX', ttl);
      }

      // Revoke the session
      if (decoded.sessionId) {
        await this.revokeSession(decoded.userId, decoded.sessionId);
      }
    } catch {
      // Token already expired or invalid — no need to blacklist
    }

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
        await redis.del(`${REFRESH_TOKEN_PREFIX}${decoded.tokenId}`);
        await redis.srem(`${USER_REFRESH_TOKENS_PREFIX}${decoded.userId}`, decoded.tokenId);
      } catch {
        // Invalid refresh token — ignore
      }
    }
  }

  async logoutAll(userId: string, currentAccessToken: string): Promise<void> {
    // Blacklist the current access token
    try {
      const decoded = jwt.verify(currentAccessToken, env.JWT_ACCESS_SECRET) as JwtPayload & { exp: number };
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.set(`${BLACKLIST_PREFIX}${currentAccessToken}`, '1', 'EX', ttl);
      }
    } catch {
      // Token already expired or invalid
    }

    // Get all active session IDs from Redis
    const sessionIds = await redis.smembers(`${USER_SESSIONS_PREFIX}${userId}`);

    // Delete all session keys from Redis
    if (sessionIds.length > 0) {
      const sessionKeys = sessionIds.map((id) => `${SESSION_PREFIX}${id}`);
      await redis.del(...sessionKeys);
    }
    await redis.del(`${USER_SESSIONS_PREFIX}${userId}`);

    // Delete all refresh tokens for this user (using per-user index)
    await this.deleteAllUserRefreshTokens(userId);

    // Revoke all sessions in DB
    await authRepo.revokeAllUserSessions(userId);
  }

  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    let decoded: RefreshTokenPayload;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const storedUserId = await redis.get(`${REFRESH_TOKEN_PREFIX}${decoded.tokenId}`);
    if (!storedUserId || storedUserId !== decoded.userId) {
      throw new UnauthorizedError('Refresh token has been revoked', 'REFRESH_TOKEN_REVOKED');
    }

    // Verify the session is still active
    if (decoded.sessionId) {
      const sessionActive = await redis.get(`${SESSION_PREFIX}${decoded.sessionId}`);
      if (!sessionActive) {
        await redis.del(`${REFRESH_TOKEN_PREFIX}${decoded.tokenId}`);
        await redis.srem(`${USER_REFRESH_TOKENS_PREFIX}${decoded.userId}`, decoded.tokenId);
        throw new UnauthorizedError('Session has been revoked', 'SESSION_REVOKED');
      }

      // Update last active time in DB
      try {
        await authRepo.updateSessionLastActive(decoded.sessionId);
      } catch {
        // Non-critical — don't fail the refresh
      }
    }

    // Token rotation: remove old refresh token
    await redis.del(`${REFRESH_TOKEN_PREFIX}${decoded.tokenId}`);
    await redis.srem(`${USER_REFRESH_TOKENS_PREFIX}${decoded.userId}`, decoded.tokenId);

    const user = await authRepo.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is disabled', 'ACCOUNT_DISABLED');
    }

    const tokens = await this.generateTokens(user, decoded.sessionId);

    return {
      user: this.toPublicUser(user),
      tokens,
    };
  }

  async getMe(userId: string): Promise<PublicUser> {
    const user = await authRepo.findById(userId);
    if (!user || !user.isActive) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }
    return this.toPublicUser(user);
  }

  async getSessions(userId: string, currentSessionId: string): Promise<PublicSession[]> {
    const sessions = await authRepo.findActiveSessionsByUserId(userId);
    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt.toISOString(),
      lastActiveAt: session.lastActiveAt.toISOString(),
      isCurrent: session.id === currentSessionId,
    }));
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await redis.get(`${BLACKLIST_PREFIX}${token}`);
    return result !== null;
  }

  async isSessionActive(sessionId: string): Promise<boolean> {
    const result = await redis.get(`${SESSION_PREFIX}${sessionId}`);
    return result !== null;
  }

  private async revokeSession(userId: string, sessionId: string): Promise<void> {
    await redis.del(`${SESSION_PREFIX}${sessionId}`);
    await redis.srem(`${USER_SESSIONS_PREFIX}${userId}`, sessionId);

    try {
      await authRepo.revokeSession(sessionId);
    } catch {
      // Non-critical if DB update fails
    }
  }

  private async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    const tokenIds = await redis.smembers(`${USER_REFRESH_TOKENS_PREFIX}${userId}`);
    if (tokenIds.length > 0) {
      const keys = tokenIds.map((id) => `${REFRESH_TOKEN_PREFIX}${id}`);
      await redis.del(...keys);
    }
    await redis.del(`${USER_REFRESH_TOKENS_PREFIX}${userId}`);
  }

  async requestPasswordReset(_email: string): Promise<void> {
    // TODO: Implement email sending with password reset token
    // This requires an email service (e.g., Resend, SendGrid) to be configured
    logger.info('Password reset requested (not yet implemented)');
  }

  async resetPassword(_token: string, _password: string): Promise<void> {
    // TODO: Implement actual password reset logic
    // This requires: token generation, storage in Redis with TTL, email delivery, and token validation
    logger.info('Password reset attempted (not yet implemented)');
  }
}

export const authService = new AuthService();
