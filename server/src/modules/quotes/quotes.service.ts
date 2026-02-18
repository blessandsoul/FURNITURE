import { prisma } from '../../libs/prisma.js';
import { quotesRepo } from './quotes.repo.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors/errors.js';
import type { PublicQuoteWithDesign, AdminQuoteWithUser } from './quotes.types.js';
import type { CreateQuoteInput } from './quotes.schemas.js';
import type { PaginationInput } from '../../shared/schemas/pagination.schema.js';
import type { ServicePaginatedResult } from '../../shared/types/index.js';
import type { Quote, QuoteStatus } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';

class QuotesService {
  // ─── User: Submit Quote ───────────────────────────────────

  async createQuote(userId: string, input: CreateQuoteInput): Promise<PublicQuoteWithDesign> {
    // 1. Validate design exists and belongs to user
    const design = await prisma.design.findUnique({
      where: { id: input.designId },
    });

    if (!design) {
      throw new NotFoundError('Design not found', 'DESIGN_NOT_FOUND');
    }

    if (design.userId !== userId) {
      throw new ForbiddenError('You do not have access to this design', 'DESIGN_ACCESS_DENIED');
    }

    // 2. Validate design has been generated (has AI image)
    if (design.status !== 'GENERATED' && design.status !== 'QUOTED') {
      throw new BadRequestError(
        'Design must have a generated image before requesting a quote',
        'DESIGN_NOT_GENERATED',
      );
    }

    // 3. Create quote with price snapshot from design
    const quote = await quotesRepo.createQuote({
      userId,
      designId: input.designId,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      message: input.message,
      quotedPrice: Number(design.totalPrice),
      currency: design.currency,
    });

    // 4. Update design status to QUOTED
    if (design.status === 'GENERATED') {
      await prisma.design.update({
        where: { id: input.designId },
        data: { status: 'QUOTED' },
      });
    }

    // 5. Re-fetch with relations
    const full = await quotesRepo.findById(quote.id);
    return this.toPublicQuoteWithDesign(full!);
  }

  // ─── User: List Quotes ────────────────────────────────────

  async getUserQuotes(
    userId: string,
    pagination: PaginationInput,
  ): Promise<ServicePaginatedResult<PublicQuoteWithDesign>> {
    const { items, totalItems } = await quotesRepo.findByUserId(userId, pagination);
    return {
      items: items.map((q) => this.toPublicQuoteWithDesign(q)),
      totalItems,
    };
  }

  // ─── User: Get Single Quote ───────────────────────────────

  async getQuote(quoteId: string, userId: string): Promise<PublicQuoteWithDesign> {
    const quote = await quotesRepo.findById(quoteId);
    if (!quote) {
      throw new NotFoundError('Quote not found', 'QUOTE_NOT_FOUND');
    }
    this.assertOwnership(quote, userId);
    return this.toPublicQuoteWithDesign(quote);
  }

  // ─── User: Cancel Quote ───────────────────────────────────

  async cancelQuote(quoteId: string, userId: string): Promise<PublicQuoteWithDesign> {
    const quote = await quotesRepo.findById(quoteId);
    if (!quote) {
      throw new NotFoundError('Quote not found', 'QUOTE_NOT_FOUND');
    }
    this.assertOwnership(quote, userId);

    if (quote.status !== 'PENDING') {
      throw new BadRequestError(
        'Only pending quotes can be cancelled',
        'QUOTE_NOT_CANCELLABLE',
      );
    }

    await quotesRepo.updateStatus(quoteId, 'CANCELLED');
    const updated = await quotesRepo.findById(quoteId);
    return this.toPublicQuoteWithDesign(updated!);
  }

  // ─── Admin: List All Quotes ───────────────────────────────

  async getAllQuotes(
    pagination: PaginationInput,
    status?: QuoteStatus,
  ): Promise<ServicePaginatedResult<AdminQuoteWithUser>> {
    const { items, totalItems } = await quotesRepo.findAll(pagination, status);
    return {
      items: items.map((q) => this.toAdminQuoteWithUser(q)),
      totalItems,
    };
  }

  // ─── Admin: Get Quote Detail ──────────────────────────────

  async getQuoteForAdmin(quoteId: string): Promise<AdminQuoteWithUser> {
    const quote = await quotesRepo.findByIdWithUser(quoteId);
    if (!quote) {
      throw new NotFoundError('Quote not found', 'QUOTE_NOT_FOUND');
    }
    return this.toAdminQuoteWithUser(quote);
  }

  // ─── Admin: Update Status ─────────────────────────────────

  async updateQuoteStatus(quoteId: string, status: QuoteStatus): Promise<AdminQuoteWithUser> {
    const quote = await quotesRepo.findByIdWithUser(quoteId);
    if (!quote) {
      throw new NotFoundError('Quote not found', 'QUOTE_NOT_FOUND');
    }

    // Set respondedAt on first status change from PENDING
    const respondedAt = quote.status === 'PENDING' && status !== 'PENDING'
      ? new Date()
      : undefined;

    await quotesRepo.updateStatus(quoteId, status, respondedAt);
    const updated = await quotesRepo.findByIdWithUser(quoteId);
    return this.toAdminQuoteWithUser(updated!);
  }

  // ─── Admin: Update Notes ──────────────────────────────────

  async updateQuoteNotes(quoteId: string, adminNotes: string): Promise<AdminQuoteWithUser> {
    const quote = await quotesRepo.findByIdWithUser(quoteId);
    if (!quote) {
      throw new NotFoundError('Quote not found', 'QUOTE_NOT_FOUND');
    }

    await quotesRepo.updateNotes(quoteId, adminNotes);
    const updated = await quotesRepo.findByIdWithUser(quoteId);
    return this.toAdminQuoteWithUser(updated!);
  }

  // ─── Ownership Check ─────────────────────────────────────

  private assertOwnership(quote: Quote, userId: string): void {
    if (quote.userId !== userId) {
      throw new ForbiddenError('You do not have access to this quote', 'QUOTE_ACCESS_DENIED');
    }
  }

  // ─── Mappers ──────────────────────────────────────────────

  private toPublicQuoteWithDesign(
    quote: Quote & {
      design: {
        name: string;
        totalPrice: Decimal;
        currency: string;
        imageUrl: string | null;
        thumbnailUrl: string | null;
        status: string;
      };
    },
  ): PublicQuoteWithDesign {
    return {
      id: quote.id,
      userId: quote.userId,
      designId: quote.designId,
      contactName: quote.contactName,
      contactEmail: quote.contactEmail,
      contactPhone: quote.contactPhone,
      message: quote.message,
      quotedPrice: quote.quotedPrice ? Number(quote.quotedPrice) : null,
      currency: quote.currency,
      status: quote.status,
      adminNotes: quote.adminNotes,
      respondedAt: quote.respondedAt?.toISOString() ?? null,
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
      design: {
        name: quote.design.name,
        totalPrice: Number(quote.design.totalPrice),
        currency: quote.design.currency,
        imageUrl: quote.design.imageUrl,
        thumbnailUrl: quote.design.thumbnailUrl,
        status: quote.design.status,
      },
    };
  }

  private toAdminQuoteWithUser(
    quote: Quote & {
      design: {
        name: string;
        totalPrice: Decimal;
        currency: string;
        imageUrl: string | null;
        thumbnailUrl: string | null;
        status: string;
      };
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      };
    },
  ): AdminQuoteWithUser {
    return {
      ...this.toPublicQuoteWithDesign(quote),
      user: {
        id: quote.user.id,
        firstName: quote.user.firstName,
        lastName: quote.user.lastName,
        email: quote.user.email,
        phone: quote.user.phone,
      },
    };
  }
}

export const quotesService = new QuotesService();
