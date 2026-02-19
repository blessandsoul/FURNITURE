import type { FastifyRequest, FastifyReply } from 'fastify';
import { aiGenerationService } from './ai-generation.service.js';
import { successResponse } from '../../shared/responses/successResponse.js';
import { paginatedResponse } from '../../shared/responses/paginatedResponse.js';
import { PaginationSchema } from '../../shared/schemas/pagination.schema.js';
import { GenerateSchema, AdminGenerationsFilterSchema, UserGenerationsFilterSchema } from './ai-generation.schemas.js';
import { BadRequestError } from '../../shared/errors/errors.js';
import { validateRoomImageMime, validateRoomImageExtension, saveRoomImage } from '../../libs/room-image-storage.js';

class AiGenerationController {
  // ─── User Routes ──────────────────────────────────────────

  async uploadRoomImage(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;

    const file = await request.file();
    if (!file) {
      throw new BadRequestError('No file uploaded', 'FILE_REQUIRED');
    }

    if (!validateRoomImageMime(file.mimetype)) {
      throw new BadRequestError(
        'Invalid file type. Allowed: JPEG, PNG, WebP',
        'INVALID_FILE_TYPE',
      );
    }

    if (!validateRoomImageExtension(file.filename)) {
      throw new BadRequestError(
        'Invalid file extension. Allowed: .jpg, .jpeg, .png, .webp',
        'INVALID_FILE_EXTENSION',
      );
    }

    const buffer = await file.toBuffer();
    const result = await saveRoomImage(userId, buffer);

    return reply.status(201).send(
      successResponse('Room image uploaded successfully', {
        roomImageUrl: result.roomImageUrl,
        thumbnailUrl: result.thumbnailUrl,
      }),
    );
  }

  async generate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const input = GenerateSchema.parse(request.body);
    const generation = await aiGenerationService.generate(userId, input);
    return reply.status(201).send(successResponse('Image generated successfully', generation));
  }

  async listGenerations(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const pagination = PaginationSchema.parse(request.query);
    const filters = UserGenerationsFilterSchema.parse(request.query);
    const { items, totalItems } = await aiGenerationService.getUserGenerations(userId, pagination, filters);
    return reply.send(
      paginatedResponse('Generations retrieved successfully', items, pagination.page, pagination.limit, totalItems),
    );
  }

  async getGeneration(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const { id } = request.params as { id: string };
    const generation = await aiGenerationService.getGeneration(id, userId);
    return reply.send(successResponse('Generation retrieved successfully', generation));
  }

  async getStatus(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.currentUser!.userId;
    const status = await aiGenerationService.getStatus(userId);
    return reply.send(successResponse('Generation status retrieved successfully', status));
  }

  // ─── Admin Routes ────────────────────────────────────────

  async adminListGenerations(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const pagination = PaginationSchema.parse(request.query);
    const filters = AdminGenerationsFilterSchema.parse(request.query);
    const { items, totalItems } = await aiGenerationService.adminGetGenerations(pagination, filters);
    return reply.send(
      paginatedResponse('All generations retrieved successfully', items, pagination.page, pagination.limit, totalItems),
    );
  }
}

export const aiGenerationController = new AiGenerationController();
