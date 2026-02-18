import type { FastifyInstance } from 'fastify';
import { creditsController } from './credits.controller.js';
import { authenticate, authorize } from '../../libs/auth.guard.js';

export async function creditRoutes(app: FastifyInstance): Promise<void> {
  // ─── Public Routes ────────────────────────────────────────

  app.get('/packages', {
    handler: creditsController.getPackages.bind(creditsController),
  });

  // ─── User Routes (authenticated) ─────────────────────────

  app.get('/balance', {
    preHandler: [authenticate],
    handler: creditsController.getBalance.bind(creditsController),
  });

  app.get('/transactions', {
    preHandler: [authenticate],
    handler: creditsController.getTransactions.bind(creditsController),
  });

  app.post('/purchase', {
    preHandler: [authenticate],
    handler: creditsController.purchasePackage.bind(creditsController),
  });

  // ─── Admin Routes ─────────────────────────────────────────

  app.post('/admin/adjust', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: creditsController.adminAdjustCredits.bind(creditsController),
  });

  app.post('/admin/packages', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: creditsController.adminCreatePackage.bind(creditsController),
  });

  app.put('/admin/packages/:id', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: creditsController.adminUpdatePackage.bind(creditsController),
  });

  app.delete('/admin/packages/:id', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: creditsController.adminDeletePackage.bind(creditsController),
  });
}
