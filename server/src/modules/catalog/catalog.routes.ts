import type { FastifyInstance } from 'fastify';
import { catalogController } from './catalog.controller.js';
import { authenticate, authorize } from '../../libs/auth.guard.js';

export async function catalogRoutes(app: FastifyInstance): Promise<void> {
  // ─── Public Routes ───────────────────────────────────────

  app.get('/categories', {
    handler: catalogController.getCategories.bind(catalogController),
  });

  app.get('/categories/:slug', {
    handler: catalogController.getCategoryBySlug.bind(catalogController),
  });

  app.get('/categories/:categoryId/options', {
    handler: catalogController.getOptionsByCategory.bind(catalogController),
  });

  // ─── Admin: Categories ───────────────────────────────────

  app.post('/categories', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: catalogController.createCategory.bind(catalogController),
  });

  app.put('/categories/:id', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: catalogController.updateCategory.bind(catalogController),
  });

  app.delete('/categories/:id', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: catalogController.deleteCategory.bind(catalogController),
  });

  // ─── Admin: Option Groups ────────────────────────────────

  app.post('/option-groups', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: catalogController.createOptionGroup.bind(catalogController),
  });

  app.put('/option-groups/:id', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: catalogController.updateOptionGroup.bind(catalogController),
  });

  app.delete('/option-groups/:id', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: catalogController.deleteOptionGroup.bind(catalogController),
  });

  // ─── Admin: Option Values ────────────────────────────────

  app.post('/option-values', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: catalogController.createOptionValue.bind(catalogController),
  });

  app.put('/option-values/:id', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: catalogController.updateOptionValue.bind(catalogController),
  });

  app.delete('/option-values/:id', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: catalogController.deleteOptionValue.bind(catalogController),
  });
}
