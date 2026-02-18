import type { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from './auth.service.js';
import { successResponse } from '../../shared/responses/successResponse.js';
import { setAuthCookies, clearAuthCookies } from './auth.cookies.js';
import { BadRequestError } from '../../shared/errors/errors.js';
import {
  RegisterSchema,
  LoginSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
} from './auth.schemas.js';

class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = RegisterSchema.parse(request.body);
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip;
    const result = await authService.register(input, userAgent, ipAddress);

    setAuthCookies(reply, result.tokens);
    return reply.status(201).send(successResponse('User registered successfully', { user: result.user }));
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = LoginSchema.parse(request.body);
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip;
    const result = await authService.login(input, userAgent, ipAddress);

    setAuthCookies(reply, result.tokens);
    return reply.send(successResponse('Login successful', { user: result.user }));
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const accessToken = this.extractAccessToken(request);
    const refreshToken = this.extractRefreshToken(request);

    await authService.logout(accessToken, refreshToken);
    clearAuthCookies(reply);
    return reply.send(successResponse('Logged out successfully', null));
  }

  async logoutAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const accessToken = this.extractAccessToken(request);

    await authService.logoutAll(userId, accessToken);
    clearAuthCookies(reply);
    return reply.send(successResponse('All sessions have been logged out', null));
  }

  async getSessions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const sessionId = request.currentUser!.sessionId;
    const sessions = await authService.getSessions(userId, sessionId);
    return reply.send(successResponse('Sessions retrieved successfully', sessions));
  }

  async refresh(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const refreshToken = this.extractRefreshToken(request);
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required', 'REFRESH_TOKEN_REQUIRED');
    }

    const result = await authService.refreshTokens(refreshToken);
    setAuthCookies(reply, result.tokens);
    return reply.send(successResponse('Tokens refreshed successfully', { user: result.user }));
  }

  async getMe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const user = await authService.getMe(userId);
    return reply.send(successResponse('User profile retrieved', user));
  }

  async requestPasswordReset(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { email } = RequestPasswordResetSchema.parse(request.body);
    await authService.requestPasswordReset(email);
    return reply.send(successResponse('If an account with that email exists, a reset link has been sent', null));
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { token, password } = ResetPasswordSchema.parse(request.body);
    await authService.resetPassword(token, password);
    return reply.send(successResponse('Password has been reset successfully', null));
  }

  /**
   * Extract access token from signed cookie or Authorization header (fallback).
   */
  private extractAccessToken(request: FastifyRequest): string {
    // Try signed cookie first
    const cookieValue = request.cookies.accessToken;
    if (cookieValue) {
      const unsigned = request.unsignCookie(cookieValue);
      if (unsigned.valid && unsigned.value) {
        return unsigned.value;
      }
    }

    // Fallback to Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    return '';
  }

  /**
   * Extract refresh token from signed cookie or request body (fallback).
   */
  private extractRefreshToken(request: FastifyRequest): string | undefined {
    // Try signed cookie first
    const cookieValue = request.cookies.refreshToken;
    if (cookieValue) {
      const unsigned = request.unsignCookie(cookieValue);
      if (unsigned.valid && unsigned.value) {
        return unsigned.value;
      }
    }

    // TODO: Remove body fallback after all clients have migrated to cookie-based auth
    const body = request.body as { refreshToken?: string } | undefined;
    return body?.refreshToken;
  }
}

export const authController = new AuthController();
