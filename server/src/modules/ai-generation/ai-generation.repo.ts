import { prisma } from '../../libs/prisma.js';
import type { AiGeneration, Design, DesignOptionItem, Prisma, DesignStatus } from '@prisma/client';
import type { PaginationInput } from '../../shared/schemas/pagination.schema.js';
import type { AdminGenerationsFilter, UserGenerationsFilter } from './ai-generation.schemas.js';

// ─── Types ──────────────────────────────────────────────────

/** Design loaded with full relations needed for prompt building */
export type DesignForGeneration = Design & {
  category: { id: string; name: string; slug: string; description: string | null };
  optionItems: (DesignOptionItem & {
    optionValue: {
      id: string;
      label: string;
      slug: string;
      promptHint: string | null;
      group: { id: string; name: string; slug: string; sortOrder: number };
    };
  })[];
};

const generationInclude = {
  design: {
    select: { id: true, name: true, status: true },
  },
} as const;

const designForGenerationInclude = {
  category: { select: { id: true, name: true, slug: true, description: true } },
  optionItems: {
    include: {
      optionValue: {
        select: {
          id: true,
          label: true,
          slug: true,
          promptHint: true,
          group: { select: { id: true, name: true, slug: true, sortOrder: true } },
        },
      },
    },
  },
} as const;

// ─── Repository ─────────────────────────────────────────────

class AiGenerationRepository {
  // ─── Create ───────────────────────────────────────────────

  async create(data: {
    userId: string;
    designId: string;
    prompt: string;
    userFreeText: string | null;
    model: string;
    status: 'PROCESSING';
    wasFree: boolean;
    creditsUsed: number;
    generationType: 'SCRATCH' | 'REIMAGINE';
    roomImageUrl: string | null;
    placementInstructions: string | null;
  }): Promise<AiGeneration> {
    return prisma.aiGeneration.create({
      data: {
        userId: data.userId,
        designId: data.designId,
        prompt: data.prompt,
        userFreeText: data.userFreeText,
        model: data.model,
        status: data.status,
        wasFree: data.wasFree,
        creditsUsed: data.creditsUsed,
        generationType: data.generationType,
        roomImageUrl: data.roomImageUrl,
        placementInstructions: data.placementInstructions,
      },
    });
  }

  // ─── Read ─────────────────────────────────────────────────

  async findById(id: string): Promise<(AiGeneration & { design: { id: string; name: string; status: string } | null }) | null> {
    return prisma.aiGeneration.findUnique({
      where: { id },
      include: generationInclude,
    });
  }

  async findByUserId(
    userId: string,
    pagination: PaginationInput,
    filters?: UserGenerationsFilter,
  ): Promise<{ items: AiGeneration[]; totalItems: number }> {
    const skip = (pagination.page - 1) * pagination.limit;
    const where: Prisma.AiGenerationWhereInput = { userId };

    if (filters?.designId) {
      where.designId = filters.designId;
    }

    const [items, totalItems] = await prisma.$transaction([
      prisma.aiGeneration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.aiGeneration.count({ where }),
    ]);

    return { items, totalItems };
  }

  async findAll(
    pagination: PaginationInput,
    filters?: AdminGenerationsFilter,
  ): Promise<{ items: AiGeneration[]; totalItems: number }> {
    const skip = (pagination.page - 1) * pagination.limit;
    const where: Prisma.AiGenerationWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.userId) {
      where.userId = filters.userId;
    }

    const [items, totalItems] = await prisma.$transaction([
      prisma.aiGeneration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.aiGeneration.count({ where }),
    ]);

    return { items, totalItems };
  }

  // ─── Design Loading (for prompt building) ─────────────────

  async findDesignForGeneration(designId: string): Promise<DesignForGeneration | null> {
    const design = await prisma.design.findUnique({
      where: { id: designId },
      include: designForGenerationInclude,
    });
    return design as DesignForGeneration | null;
  }

  // ─── Status Updates ───────────────────────────────────────

  async markCompleted(
    id: string,
    data: {
      imageUrl: string;
      thumbnailUrl: string;
      promptTokens: number | null;
      totalTokens: number | null;
      durationMs: number;
    },
  ): Promise<void> {
    await prisma.aiGeneration.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        promptTokens: data.promptTokens,
        totalTokens: data.totalTokens,
        durationMs: data.durationMs,
      },
    });
  }

  async markFailed(id: string, errorMessage: string, durationMs: number): Promise<void> {
    await prisma.aiGeneration.update({
      where: { id },
      data: {
        status: 'FAILED',
        errorMessage,
        durationMs,
      },
    });
  }

  // ─── Design Image Update ──────────────────────────────────

  async updateDesignImage(
    designId: string,
    data: { imageUrl: string; thumbnailUrl: string; status: DesignStatus },
  ): Promise<void> {
    await prisma.design.update({
      where: { id: designId },
      data: {
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        status: data.status,
      },
    });
  }
}

export const aiGenerationRepo = new AiGenerationRepository();
