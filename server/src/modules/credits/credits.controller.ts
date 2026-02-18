import type { FastifyRequest, FastifyReply } from 'fastify';
import { creditsService } from './credits.service.js';
import { successResponse } from '../../shared/responses/successResponse.js';
import { paginatedResponse } from '../../shared/responses/paginatedResponse.js';
import { PaginationSchema } from '../../shared/schemas/pagination.schema.js';
import {
  PurchasePackageSchema,
  AdminAdjustCreditsSchema,
  CreateCreditPackageSchema,
  UpdateCreditPackageSchema,
} from './credits.schemas.js';

class CreditsController {
  // ─── User Routes ────────────────────────────────────────────

  async getBalance(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const balance = await creditsService.getBalance(userId);
    return reply.send(successResponse('Credit balance retrieved successfully', balance));
  }

  async getTransactions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const pagination = PaginationSchema.parse(request.query);
    const { items, totalItems } = await creditsService.getTransactions(userId, pagination);
    return reply.send(
      paginatedResponse('Transactions retrieved successfully', items, pagination.page, pagination.limit, totalItems),
    );
  }

  async purchasePackage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const { packageId } = PurchasePackageSchema.parse(request.body);
    const balance = await creditsService.purchasePackage(userId, packageId);
    return reply.send(successResponse('Package purchased successfully', balance));
  }

  // ─── Public Routes ──────────────────────────────────────────

  async getPackages(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const packages = await creditsService.getActivePackages();
    return reply.send(successResponse('Credit packages retrieved successfully', packages));
  }

  // ─── Admin Routes ──────────────────────────────────────────

  async adminAdjustCredits(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = AdminAdjustCreditsSchema.parse(request.body);
    const balance = await creditsService.adminAdjustCredits(input);
    return reply.send(successResponse('Credits adjusted successfully', balance));
  }

  async adminCreatePackage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateCreditPackageSchema.parse(request.body);
    const pkg = await creditsService.createPackage(input);
    return reply.status(201).send(successResponse('Credit package created successfully', pkg));
  }

  async adminUpdatePackage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const input = UpdateCreditPackageSchema.parse(request.body);
    const pkg = await creditsService.updatePackage(id, input);
    return reply.send(successResponse('Credit package updated successfully', pkg));
  }

  async adminDeletePackage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    await creditsService.deletePackage(id);
    return reply.send(successResponse('Credit package deactivated successfully', null));
  }
}

export const creditsController = new CreditsController();
