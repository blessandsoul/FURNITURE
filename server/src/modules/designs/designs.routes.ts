import type { FastifyInstance } from 'fastify';
import { designsController } from './designs.controller.js';
import { authenticate, authorize } from '../../libs/auth.guard.js';

export async function designRoutes(app: FastifyInstance): Promise<void> {
  // ─── User Routes (authenticated) ─────────────────────────

  app.get('/', {
    preHandler: [authenticate],
    handler: designsController.listDesigns.bind(designsController),
  });

  app.get('/:id', {
    preHandler: [authenticate],
    handler: designsController.getDesign.bind(designsController),
  });

  app.post('/', {
    preHandler: [authenticate],
    handler: designsController.createDesign.bind(designsController),
  });

  app.put('/:id', {
    preHandler: [authenticate],
    handler: designsController.updateDesign.bind(designsController),
  });

  app.delete('/:id', {
    preHandler: [authenticate],
    handler: designsController.deleteDesign.bind(designsController),
  });

  app.post('/calculate-price', {
    preHandler: [authenticate],
    handler: designsController.calculatePrice.bind(designsController),
  });

  // ─── Admin Routes ─────────────────────────────────────────

  app.get('/admin/all', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: designsController.adminListDesigns.bind(designsController),
  });
}
