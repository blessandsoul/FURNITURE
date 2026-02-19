import path from 'node:path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { env } from './config/env.js';
import { logger } from './libs/logger.js';
import { AppError } from './shared/errors/AppError.js';
import { successResponse } from './shared/responses/successResponse.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { catalogRoutes } from './modules/catalog/catalog.routes.js';
import { creditRoutes } from './modules/credits/credits.routes.js';
import { designRoutes } from './modules/designs/designs.routes.js';
import { aiGenerationRoutes } from './modules/ai-generation/ai-generation.routes.js';
import { quoteRoutes } from './modules/quotes/quotes.routes.js';

export async function buildApp(): Promise<ReturnType<typeof Fastify>> {
  const app = Fastify({
    logger: false,
    disableRequestLogging: true,
  });

  // --- Plugins ---
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  });

  await app.register(helmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(cookie, {
    secret: env.COOKIE_SECRET,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1,
    },
  });

  await app.register(fastifyStatic, {
    root: path.resolve(env.IMAGE_STORAGE_PATH),
    prefix: '/uploads/generations/',
    decorateReply: false,
  });

  await app.register(fastifyStatic, {
    root: path.resolve(env.ROOM_IMAGE_STORAGE_PATH),
    prefix: '/uploads/rooms/',
    decorateReply: false,
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
  await app.register(catalogRoutes, { prefix: '/api/v1/catalog' });
  await app.register(creditRoutes, { prefix: '/api/v1/credits' });
  await app.register(designRoutes, { prefix: '/api/v1/designs' });
  await app.register(aiGenerationRoutes, { prefix: '/api/v1/ai' });
  await app.register(quoteRoutes, { prefix: '/api/v1/quotes' });

  // --- Health Check ---
  app.get('/api/v1/health', async () => {
    return successResponse('Server is healthy', {
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
