import { prisma } from '../../libs/prisma.js';
import type { Design, DesignOptionItem, Prisma } from '@prisma/client';
import type { PaginationInput } from '../../shared/schemas/pagination.schema.js';

type DesignWithCategory = Design & {
  category: { name: string; slug: string };
  optionItems: (DesignOptionItem & {
    optionValue: {
      id: string;
      label: string;
      slug: string;
      priceModifier: Prisma.Decimal;
      group: { id: string; name: string; slug: string };
    };
  })[];
};

const designInclude = {
  category: { select: { name: true, slug: true } },
  optionItems: {
    include: {
      optionValue: {
        select: {
          id: true,
          label: true,
          slug: true,
          priceModifier: true,
          group: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  },
} as const;

class DesignsRepository {
  // ─── User Queries ──────────────────────────────────────────

  async findByUserId(
    userId: string,
    pagination: PaginationInput,
  ): Promise<{ items: DesignWithCategory[]; totalItems: number }> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [items, totalItems] = await prisma.$transaction([
      prisma.design.findMany({
        where: { userId },
        include: designInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.design.count({ where: { userId } }),
    ]);

    return { items: items as DesignWithCategory[], totalItems };
  }

  async findById(id: string): Promise<DesignWithCategory | null> {
    const design = await prisma.design.findUnique({
      where: { id },
      include: designInclude,
    });
    return design as DesignWithCategory | null;
  }

  async createDesign(
    data: {
      userId: string;
      categoryId: string;
      name: string;
      totalPrice: number;
      currency: string;
      configSnapshot: Prisma.InputJsonValue;
      optionValueIds: string[];
      roomImageUrl?: string;
      roomThumbnailUrl?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<Design> {
    const client = tx ?? prisma;
    return client.design.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        name: data.name,
        totalPrice: data.totalPrice,
        currency: data.currency,
        configSnapshot: data.configSnapshot,
        roomImageUrl: data.roomImageUrl ?? null,
        roomThumbnailUrl: data.roomThumbnailUrl ?? null,
        optionItems: {
          create: data.optionValueIds.map((optionValueId) => ({ optionValueId })),
        },
      },
    });
  }

  async updateDesign(
    id: string,
    data: {
      name?: string;
      totalPrice?: number;
      configSnapshot?: Prisma.InputJsonValue;
      optionValueIds?: string[];
    },
    tx?: Prisma.TransactionClient,
  ): Promise<Design> {
    const client = tx ?? prisma;

    if (data.optionValueIds) {
      // Delete old option items and create new ones
      await client.designOptionItem.deleteMany({ where: { designId: id } });
      await client.designOptionItem.createMany({
        data: data.optionValueIds.map((optionValueId) => ({ designId: id, optionValueId })),
      });
    }

    return client.design.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.totalPrice !== undefined && { totalPrice: data.totalPrice }),
        ...(data.configSnapshot !== undefined && { configSnapshot: data.configSnapshot }),
      },
    });
  }

  async deleteDesign(id: string): Promise<void> {
    await prisma.design.delete({ where: { id } });
  }

  // ─── Admin Queries ─────────────────────────────────────────

  async findAll(
    pagination: PaginationInput,
  ): Promise<{ items: DesignWithCategory[]; totalItems: number }> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [items, totalItems] = await prisma.$transaction([
      prisma.design.findMany({
        include: designInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.design.count(),
    ]);

    return { items: items as DesignWithCategory[], totalItems };
  }

  // ─── Transactional helpers ─────────────────────────────────

  async executeInTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }
}

export const designsRepo = new DesignsRepository();
