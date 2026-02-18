import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { authService } from '../modules/auth/auth.service.js';
import { UnauthorizedError, ForbiddenError } from '../shared/errors/errors.js';
import type { JwtPayload } from '../modules/auth/auth.types.js';
import type { UserRole } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    currentUser?: JwtPayload;
  }
}

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  // Extract access token: signed cookie first, Authorization header fallback
  let token: string | undefined;

  const cookieValue = request.cookies.accessToken;
  if (cookieValue) {
    const unsigned = request.unsignCookie(cookieValue);
    if (unsigned.valid && unsigned.value) {
      token = unsigned.value;
    }
  }

  if (!token) {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    throw new UnauthorizedError('Access token is required', 'TOKEN_REQUIRED');
  }

  // Verify JWT signature first (rejects forged tokens before hitting Redis)
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired access token', 'INVALID_TOKEN');
  }

  // Then check blacklist
  const isBlacklisted = await authService.isTokenBlacklisted(token);
  if (isBlacklisted) {
    throw new UnauthorizedError('Token has been revoked', 'TOKEN_REVOKED');
  }

  // Verify the session is still active
  if (decoded.sessionId) {
    const sessionActive = await authService.isSessionActive(decoded.sessionId);
    if (!sessionActive) {
      throw new UnauthorizedError('Session has been revoked', 'SESSION_REVOKED');
    }
  }

  request.currentUser = decoded;
}

export function authorize(...allowedRoles: UserRole[]): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async function (request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    if (!request.currentUser) {
      throw new UnauthorizedError('Authentication required', 'TOKEN_REQUIRED');
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(request.currentUser.role)) {
      throw new ForbiddenError('You do not have permission to access this resource', 'INSUFFICIENT_ROLE');
    }
  };
}
