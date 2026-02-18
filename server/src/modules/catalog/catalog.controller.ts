import type { FastifyRequest, FastifyReply } from 'fastify';
import { catalogService } from './catalog.service.js';
import { successResponse } from '../../shared/responses/successResponse.js';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateOptionGroupSchema,
  UpdateOptionGroupSchema,
  CreateOptionValueSchema,
  UpdateOptionValueSchema,
} from './catalog.schemas.js';

class CatalogController {
  // ─── Public ────────────────────────────────────────────────

  async getCategories(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const categories = await catalogService.getActiveCategories();
    return reply.send(successResponse('Categories retrieved successfully', categories));
  }

  async getCategoryBySlug(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { slug } = request.params as { slug: string };
    const category = await catalogService.getCategoryBySlug(slug);
    return reply.send(successResponse('Category retrieved successfully', category));
  }

  async getOptionsByCategory(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { categoryId } = request.params as { categoryId: string };
    const options = await catalogService.getOptionsByCategory(categoryId);
    return reply.send(successResponse('Options retrieved successfully', options));
  }

  // ─── Admin: Categories ─────────────────────────────────────

  async createCategory(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateCategorySchema.parse(request.body);
    const category = await catalogService.createCategory(input);
    return reply.status(201).send(successResponse('Category created successfully', category));
  }

  async updateCategory(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const input = UpdateCategorySchema.parse(request.body);
    const category = await catalogService.updateCategory(id, input);
    return reply.send(successResponse('Category updated successfully', category));
  }

  async deleteCategory(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    await catalogService.deleteCategory(id);
    return reply.send(successResponse('Category deleted successfully', null));
  }

  // ─── Admin: Option Groups ─────────────────────────────────

  async createOptionGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateOptionGroupSchema.parse(request.body);
    const group = await catalogService.createOptionGroup(input);
    return reply.status(201).send(successResponse('Option group created successfully', group));
  }

  async updateOptionGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const input = UpdateOptionGroupSchema.parse(request.body);
    const group = await catalogService.updateOptionGroup(id, input);
    return reply.send(successResponse('Option group updated successfully', group));
  }

  async deleteOptionGroup(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    await catalogService.deleteOptionGroup(id);
    return reply.send(successResponse('Option group deleted successfully', null));
  }

  // ─── Admin: Option Values ─────────────────────────────────

  async createOptionValue(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateOptionValueSchema.parse(request.body);
    const value = await catalogService.createOptionValue(input);
    return reply.status(201).send(successResponse('Option value created successfully', value));
  }

  async updateOptionValue(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const input = UpdateOptionValueSchema.parse(request.body);
    const value = await catalogService.updateOptionValue(id, input);
    return reply.send(successResponse('Option value updated successfully', value));
  }

  async deleteOptionValue(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    await catalogService.deleteOptionValue(id);
    return reply.send(successResponse('Option value deleted successfully', null));
  }
}

export const catalogController = new CatalogController();
