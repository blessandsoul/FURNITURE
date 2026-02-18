import type { FastifyRequest, FastifyReply } from 'fastify';
import { quotesService } from './quotes.service.js';
import { successResponse } from '../../shared/responses/successResponse.js';
import { paginatedResponse } from '../../shared/responses/paginatedResponse.js';
import { PaginationSchema } from '../../shared/schemas/pagination.schema.js';
import {
  CreateQuoteSchema,
  UpdateQuoteStatusSchema,
  UpdateQuoteNotesSchema,
  AdminQuoteFiltersSchema,
} from './quotes.schemas.js';

class QuotesController {
  // ─── User Routes ────────────────────────────────────────────

  async createQuote(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const input = CreateQuoteSchema.parse(request.body);
    const quote = await quotesService.createQuote(userId, input);
    return reply.status(201).send(successResponse('Quote request submitted successfully', quote));
  }

  async listQuotes(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const pagination = PaginationSchema.parse(request.query);
    const { items, totalItems } = await quotesService.getUserQuotes(userId, pagination);
    return reply.send(
      paginatedResponse('Quotes retrieved successfully', items, pagination.page, pagination.limit, totalItems),
    );
  }

  async getQuote(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const { id } = request.params as { id: string };
    const quote = await quotesService.getQuote(id, userId);
    return reply.send(successResponse('Quote retrieved successfully', quote));
  }

  async cancelQuote(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const { id } = request.params as { id: string };
    const quote = await quotesService.cancelQuote(id, userId);
    return reply.send(successResponse('Quote cancelled successfully', quote));
  }

  // ─── Admin Routes ──────────────────────────────────────────

  async adminListQuotes(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const pagination = PaginationSchema.parse(request.query);
    const filters = AdminQuoteFiltersSchema.parse(request.query);
    const { items, totalItems } = await quotesService.getAllQuotes(pagination, filters.status);
    return reply.send(
      paginatedResponse('All quotes retrieved successfully', items, pagination.page, pagination.limit, totalItems),
    );
  }

  async adminGetQuote(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const quote = await quotesService.getQuoteForAdmin(id);
    return reply.send(successResponse('Quote retrieved successfully', quote));
  }

  async adminUpdateStatus(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const { status } = UpdateQuoteStatusSchema.parse(request.body);
    const quote = await quotesService.updateQuoteStatus(id, status);
    return reply.send(successResponse('Quote status updated successfully', quote));
  }

  async adminUpdateNotes(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const { adminNotes } = UpdateQuoteNotesSchema.parse(request.body);
    const quote = await quotesService.updateQuoteNotes(id, adminNotes);
    return reply.send(successResponse('Quote notes updated successfully', quote));
  }
}

export const quotesController = new QuotesController();
