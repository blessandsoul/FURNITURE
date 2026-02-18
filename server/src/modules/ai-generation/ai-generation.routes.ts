import type { FastifyInstance } from 'fastify';
import { aiGenerationController } from './ai-generation.controller.js';
import { authenticate, authorize } from '../../libs/auth.guard.js';

export async function aiGenerationRoutes(app: FastifyInstance): Promise<void> {
  // ─── User Routes (authenticated) ─────────────────────────

  app.post('/generate', {
    preHandler: [authenticate],
    handler: aiGenerationController.generate.bind(aiGenerationController),
  });

  app.get('/generations', {
    preHandler: [authenticate],
    handler: aiGenerationController.listGenerations.bind(aiGenerationController),
  });

  app.get('/generations/:id', {
    preHandler: [authenticate],
    handler: aiGenerationController.getGeneration.bind(aiGenerationController),
  });

  app.get('/status', {
    preHandler: [authenticate],
    handler: aiGenerationController.getStatus.bind(aiGenerationController),
  });

  // ─── Admin Routes ─────────────────────────────────────────

  app.get('/admin/generations', {
    preHandler: [authenticate, authorize('ADMIN')],
    handler: aiGenerationController.adminListGenerations.bind(aiGenerationController),
  });
}
