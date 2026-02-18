import type { FastifyRequest, FastifyReply } from 'fastify';
import { designsService } from './designs.service.js';
import { successResponse } from '../../shared/responses/successResponse.js';
import { paginatedResponse } from '../../shared/responses/paginatedResponse.js';
import { PaginationSchema } from '../../shared/schemas/pagination.schema.js';
import {
  CreateDesignSchema,
  UpdateDesignSchema,
  CalculatePriceSchema,
} from './designs.schemas.js';

class DesignsController {
  // ─── User Routes ────────────────────────────────────────────

  async listDesigns(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const pagination = PaginationSchema.parse(request.query);
    const { items, totalItems } = await designsService.getUserDesigns(userId, pagination);
    return reply.send(
      paginatedResponse('Designs retrieved successfully', items, pagination.page, pagination.limit, totalItems),
    );
  }

  async getDesign(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const { id } = request.params as { id: string };
    const design = await designsService.getDesign(id, userId);
    return reply.send(successResponse('Design retrieved successfully', design));
  }

  async createDesign(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const input = CreateDesignSchema.parse(request.body);
    const design = await designsService.createDesign(userId, input);
    return reply.status(201).send(successResponse('Design created successfully', design));
  }

  async updateDesign(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const { id } = request.params as { id: string };
    const input = UpdateDesignSchema.parse(request.body);
    const design = await designsService.updateDesign(id, userId, input);
    return reply.send(successResponse('Design updated successfully', design));
  }

  async deleteDesign(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const { id } = request.params as { id: string };
    await designsService.deleteDesign(id, userId);
    return reply.send(successResponse('Design deleted successfully', null));
  }

  async calculatePrice(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CalculatePriceSchema.parse(request.body);
    const result = await designsService.calculatePrice(input);
    return reply.send(successResponse('Price calculated successfully', result));
  }

  // ─── Admin Routes ──────────────────────────────────────────

  async adminListDesigns(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const pagination = PaginationSchema.parse(request.query);
    const { items, totalItems } = await designsService.getAllDesigns(pagination);
    return reply.send(
      paginatedResponse('All designs retrieved successfully', items, pagination.page, pagination.limit, totalItems),
    );
  }
}

export const designsController = new DesignsController();
