import type { FastifyInstance } from 'fastify';
import { quotesController } from './quotes.controller.js';
import { authenticate, authorize } from '../../libs/auth.guard.js';

export async function quoteRoutes(app: FastifyInstance): Promise<void> {
  // ─── User Routes (authenticated) ─────────────────────────

  app.post('/', {
    preHandler: [authenticate],
    handler: quotesController.createQuote.bind(quotesController),
  });

  app.get('/', {
    preHandler: [authenticate],
    handler: quotesController.listQuotes.bind(quotesController),
  });

  app.get('/:id', {
    preHandler: [authenticate],
    handler: quotesController.getQuote.bind(quotesController),
  });

  app.put('/:id/cancel', {
    preHandler: [authenticate],
    handler: quotesController.cancelQuote.bind(quotesController),
  });

  // ─── Admin Routes ─────────────────────────────────────────

  app.get('/admin/all', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: quotesController.adminListQuotes.bind(quotesController),
  });

  app.get('/admin/:id', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: quotesController.adminGetQuote.bind(quotesController),
  });

  app.put('/admin/:id/status', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: quotesController.adminUpdateStatus.bind(quotesController),
  });

  app.put('/admin/:id/notes', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: quotesController.adminUpdateNotes.bind(quotesController),
  });
}
