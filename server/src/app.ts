import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import { env } from './config/env.js';
import { logger } from './libs/logger.js';
import { AppError } from './shared/errors/AppError.js';
import { successResponse } from './shared/responses/successResponse.js';
import { authRoutes } from './modules/auth/auth.routes.js';

export async function buildApp(): Promise<ReturnType<typeof Fastify>> {
  const app = Fastify({
    logger: false,
    disableRequestLogging: true,
  });

  // --- Plugins ---
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(helmet);

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(cookie, {
    secret: env.COOKIE_SECRET,
  });

  // --- Request Logging ---
  app.addHook('onResponse', (request, reply, done) => {
    const responseTime = reply.elapsedTime.toFixed(0);
    logger.info(`${request.method} ${request.url} ${reply.statusCode} ${responseTime}ms`);
    done();
  });

  // --- Global Error Handler ---
  app.setErrorHandler((error: Error & { statusCode?: number; validation?: unknown }, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    if (error.name === 'ZodError') {
      const zodError = error as import('zod').ZodError;
      return reply.status(422).send({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          details: zodError.flatten().fieldErrors,
        },
      });
    }

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: error.message,
        },
      });
    }

    if (error.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
        },
      });
    }

    logger.error({ err: error }, 'Unhandled error');
    return reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });

  // --- Routes ---
  await app.register(authRoutes, { prefix: '/api/v1/auth' });

  // --- Health Check ---
  app.get('/api/v1/health', async () => {
    return successResponse('Server is healthy', {
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
