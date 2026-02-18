import type { FastifyReply } from 'fastify';
import type { AuthTokens } from './auth.types.js';
import { env } from '../../config/env.js';
import { parseExpiresIn } from './auth.service.js';

export function setAuthCookies(reply: FastifyReply, tokens: AuthTokens): void {
  const isProduction = env.NODE_ENV === 'production';

  reply.setCookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: parseExpiresIn(env.JWT_ACCESS_EXPIRES_IN),
    signed: true,
  });

  reply.setCookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN),
    signed: true,
  });
}

export function clearAuthCookies(reply: FastifyReply): void {
  const isProduction = env.NODE_ENV === 'production';

  reply.clearCookie('accessToken', {
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });

  reply.clearCookie('refreshToken', {
    path: '/api/v1/auth',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });
}
