import { prisma } from '../../libs/prisma.js';
import type { Quote, QuoteStatus, Prisma } from '@prisma/client';
import type { PaginationInput } from '../../shared/schemas/pagination.schema.js';

type QuoteWithDesign = Quote & {
  design: {
    name: string;
    totalPrice: Prisma.Decimal;
    currency: string;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    status: string;
  };
};

type QuoteWithDesignAndUser = QuoteWithDesign & {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
};

const quoteIncludeDesign = {
  design: {
    select: {
      name: true,
      totalPrice: true,
      currency: true,
      imageUrl: true,
      thumbnailUrl: true,
      status: true,
    },
  },
} as const;

const quoteIncludeDesignAndUser = {
  ...quoteIncludeDesign,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
} as const;

class QuotesRepository {
  // ─── User Queries ──────────────────────────────────────────

  async findByUserId(
    userId: string,
    pagination: PaginationInput,
  ): Promise<{ items: QuoteWithDesign[]; totalItems: number }> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [items, totalItems] = await prisma.$transaction([
      prisma.quote.findMany({
        where: { userId },
        include: quoteIncludeDesign,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.quote.count({ where: { userId } }),
    ]);

    return { items: items as QuoteWithDesign[], totalItems };
  }

  async findById(id: string): Promise<QuoteWithDesign | null> {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: quoteIncludeDesign,
    });
    return quote as QuoteWithDesign | null;
  }

  async findByIdWithUser(id: string): Promise<QuoteWithDesignAndUser | null> {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: quoteIncludeDesignAndUser,
    });
    return quote as QuoteWithDesignAndUser | null;
  }

  async createQuote(data: {
    userId: string;
    designId: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    message?: string;
    quotedPrice: number;
    currency: string;
  }): Promise<Quote> {
    return prisma.quote.create({
      data: {
        userId: data.userId,
        designId: data.designId,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        message: data.message ?? null,
        quotedPrice: data.quotedPrice,
        currency: data.currency,
      },
    });
  }

  async updateStatus(id: string, status: QuoteStatus, respondedAt?: Date): Promise<Quote> {
    return prisma.quote.update({
      where: { id },
      data: {
        status,
        ...(respondedAt && { respondedAt }),
      },
    });
  }

  async updateNotes(id: string, adminNotes: string): Promise<Quote> {
    return prisma.quote.update({
      where: { id },
      data: { adminNotes },
    });
  }

  // ─── Admin Queries ─────────────────────────────────────────

  async findAll(
    pagination: PaginationInput,
    status?: QuoteStatus,
  ): Promise<{ items: QuoteWithDesignAndUser[]; totalItems: number }> {
    const skip = (pagination.page - 1) * pagination.limit;
    const where: Prisma.QuoteWhereInput = status ? { status } : {};

    const [items, totalItems] = await prisma.$transaction([
      prisma.quote.findMany({
        where,
        include: quoteIncludeDesignAndUser,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.quote.count({ where }),
    ]);

    return { items: items as QuoteWithDesignAndUser[], totalItems };
  }
}

export const quotesRepo = new QuotesRepository();
