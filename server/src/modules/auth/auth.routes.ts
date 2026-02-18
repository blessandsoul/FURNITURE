import type { FastifyInstance } from 'fastify';
import { authController } from './auth.controller.js';
import { authenticate } from '../../libs/auth.guard.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Public routes
  app.post('/register', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes',
      },
    },
    handler: authController.register.bind(authController),
  });

  app.post('/login', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '15 minutes',
      },
    },
    handler: authController.login.bind(authController),
  });

  app.post('/refresh', {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '15 minutes',
      },
    },
    handler: authController.refresh.bind(authController),
  });

  app.post('/request-password-reset', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '15 minutes',
      },
    },
    handler: authController.requestPasswordReset.bind(authController),
  });

  app.post('/reset-password', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes',
      },
    },
    handler: authController.resetPassword.bind(authController),
  });

  // Protected routes
  app.post('/logout', {
    preHandler: [authenticate],
    handler: authController.logout.bind(authController),
  });

  app.post('/logout-all', {
    preHandler: [authenticate],
    handler: authController.logoutAll.bind(authController),
  });

  app.get('/me', {
    preHandler: [authenticate],
    handler: authController.getMe.bind(authController),
  });

  app.get('/sessions', {
    preHandler: [authenticate],
    handler: authController.getSessions.bind(authController),
  });
}
