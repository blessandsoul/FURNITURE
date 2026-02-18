import { redis } from '../../libs/redis.js';
import { logger } from '../../libs/logger.js';
import { creditsRepo } from './credits.repo.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/errors.js';
import { decimalToNumber } from './credits.types.js';
import type { PublicCreditBalance, PublicCreditTransaction, PublicCreditPackage } from './credits.types.js';
import type { AdminAdjustCreditsInput, CreateCreditPackageInput, UpdateCreditPackageInput } from './credits.schemas.js';
import type { PaginationInput } from '../../shared/schemas/pagination.schema.js';
import type { CreditBalance, CreditTransaction, CreditPackage, CreditTransactionType } from '@prisma/client';
import type { ServicePaginatedResult } from '../../shared/types/index.js';

const CACHE_TTL = 600; // 10 minutes
const CACHE_KEY_BALANCE_PREFIX = 'credit_balance:';
const CACHE_KEY_PACKAGES = 'credit_packages';

class CreditsService {
  // ─── User: Balance ──────────────────────────────────────────

  async getBalance(userId: string): Promise<PublicCreditBalance> {
    const cacheKey = `${CACHE_KEY_BALANCE_PREFIX}${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as PublicCreditBalance;
    }

    const balance = await creditsRepo.findBalanceByUserId(userId);
    const result: PublicCreditBalance = {
      userId,
      balance: balance?.balance ?? 0,
    };

    await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
    return result;
  }

  // ─── User: Transaction History ──────────────────────────────

  async getTransactions(
    userId: string,
    pagination: PaginationInput,
  ): Promise<ServicePaginatedResult<PublicCreditTransaction>> {
    const { items, totalItems } = await creditsRepo.findTransactionsByUserId(userId, pagination);
    return {
      items: items.map((t) => this.toPublicTransaction(t)),
      totalItems,
    };
  }

  // ─── User: Purchase Package ─────────────────────────────────

  async purchasePackage(userId: string, packageId: string): Promise<PublicCreditBalance> {
    const pkg = await creditsRepo.findPackageById(packageId);
    if (!pkg || !pkg.isActive) {
      throw new NotFoundError('Credit package not found', 'PACKAGE_NOT_FOUND');
    }

    // TODO: payment integration (BOG Pay / Stripe)
    // For now, credits are granted immediately without actual payment processing.
    // In production, this should:
    // 1. Create a payment intent/order
    // 2. Wait for payment confirmation webhook
    // 3. Then grant credits

    const result = await this.addCredits(
      userId,
      pkg.credits,
      'PURCHASE',
      `Purchased "${pkg.name}" package (${pkg.credits} credits)`,
      packageId,
    );

    logger.info(`User ${userId} purchased package "${pkg.name}" (${pkg.credits} credits)`);
    return result;
  }

  // ─── Credit Ledger Operations ───────────────────────────────

  async addCredits(
    userId: string,
    amount: number,
    type: CreditTransactionType,
    description?: string,
    referenceId?: string,
  ): Promise<PublicCreditBalance> {
    if (amount <= 0) {
      throw new BadRequestError('Amount must be positive', 'INVALID_AMOUNT');
    }

    const balance = await creditsRepo.executeInTransaction(async (tx) => {
      await creditsRepo.createTransaction(
        { userId, amount, type, description, referenceId },
        tx,
      );
      return creditsRepo.upsertBalance(userId, amount, tx);
    });

    await this.invalidateBalanceCache(userId);
    return { userId, balance: balance.balance };
  }

  async deductCredits(
    userId: string,
    amount: number,
    referenceId?: string,
  ): Promise<PublicCreditBalance> {
    if (amount <= 0) {
      throw new BadRequestError('Amount must be positive', 'INVALID_AMOUNT');
    }

    const balance = await creditsRepo.executeInTransaction(async (tx) => {
      const current = await creditsRepo.findBalanceByUserId(userId);
      const currentBalance = current?.balance ?? 0;

      if (currentBalance < amount) {
        throw new BadRequestError('Insufficient credits', 'INSUFFICIENT_CREDITS');
      }

      await creditsRepo.createTransaction(
        {
          userId,
          amount: -amount,
          type: 'GENERATION',
          description: `Deducted ${amount} credit(s) for AI generation`,
          referenceId,
        },
        tx,
      );
      return creditsRepo.upsertBalance(userId, -amount, tx);
    });

    await this.invalidateBalanceCache(userId);
    return { userId, balance: balance.balance };
  }

  async refundCredits(
    userId: string,
    amount: number,
    referenceId?: string,
  ): Promise<PublicCreditBalance> {
    if (amount <= 0) {
      throw new BadRequestError('Amount must be positive', 'INVALID_AMOUNT');
    }

    const balance = await creditsRepo.executeInTransaction(async (tx) => {
      await creditsRepo.createTransaction(
        {
          userId,
          amount,
          type: 'REFUND',
          description: `Refunded ${amount} credit(s) for failed generation`,
          referenceId,
        },
        tx,
      );
      return creditsRepo.upsertBalance(userId, amount, tx);
    });

    logger.info(`Refunded ${amount} credit(s) to user ${userId} (ref: ${referenceId ?? 'none'})`);
    await this.invalidateBalanceCache(userId);
    return { userId, balance: balance.balance };
  }

  // ─── Public: Packages ───────────────────────────────────────

  async getActivePackages(): Promise<PublicCreditPackage[]> {
    const cached = await redis.get(CACHE_KEY_PACKAGES);
    if (cached) {
      return JSON.parse(cached) as PublicCreditPackage[];
    }

    const packages = await creditsRepo.findActivePackages();
    const result = packages.map((p) => this.toPublicPackage(p));

    await redis.set(CACHE_KEY_PACKAGES, JSON.stringify(result), 'EX', CACHE_TTL);
    return result;
  }

  // ─── Admin: Adjust Credits ──────────────────────────────────

  async adminAdjustCredits(input: AdminAdjustCreditsInput): Promise<PublicCreditBalance> {
    const balance = await creditsRepo.executeInTransaction(async (tx) => {
      if (input.amount < 0) {
        const current = await creditsRepo.findBalanceByUserId(input.userId);
        const currentBalance = current?.balance ?? 0;
        if (currentBalance + input.amount < 0) {
          throw new BadRequestError(
            `Cannot deduct ${Math.abs(input.amount)} credits. User only has ${currentBalance}`,
            'INSUFFICIENT_CREDITS',
          );
        }
      }

      await creditsRepo.createTransaction(
        {
          userId: input.userId,
          amount: input.amount,
          type: input.type,
          description: input.description,
        },
        tx,
      );
      return creditsRepo.upsertBalance(input.userId, input.amount, tx);
    });

    logger.info(
      `Admin adjusted credits for user ${input.userId}: ${input.amount > 0 ? '+' : ''}${input.amount} (${input.type})`,
    );
    await this.invalidateBalanceCache(input.userId);
    return { userId: input.userId, balance: balance.balance };
  }

  // ─── Admin: Packages ────────────────────────────────────────

  async createPackage(input: CreateCreditPackageInput): Promise<PublicCreditPackage> {
    const pkg = await creditsRepo.createPackage(input);
    await this.invalidatePackagesCache();
    return this.toPublicPackage(pkg);
  }

  async updatePackage(id: string, input: UpdateCreditPackageInput): Promise<PublicCreditPackage> {
    const existing = await creditsRepo.findPackageById(id);
    if (!existing) {
      throw new NotFoundError('Credit package not found', 'PACKAGE_NOT_FOUND');
    }

    const updated = await creditsRepo.updatePackage(id, input);
    await this.invalidatePackagesCache();
    return this.toPublicPackage(updated);
  }

  async deletePackage(id: string): Promise<void> {
    const existing = await creditsRepo.findPackageById(id);
    if (!existing) {
      throw new NotFoundError('Credit package not found', 'PACKAGE_NOT_FOUND');
    }

    await creditsRepo.softDeletePackage(id);
    await this.invalidatePackagesCache();
  }

  // ─── Cache Invalidation ─────────────────────────────────────

  private async invalidateBalanceCache(userId: string): Promise<void> {
    await redis.del(`${CACHE_KEY_BALANCE_PREFIX}${userId}`);
  }

  private async invalidatePackagesCache(): Promise<void> {
    await redis.del(CACHE_KEY_PACKAGES);
  }

  // ─── Mappers ────────────────────────────────────────────────

  private toPublicTransaction(transaction: CreditTransaction): PublicCreditTransaction {
    return {
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      referenceId: transaction.referenceId,
      createdAt: transaction.createdAt.toISOString(),
    };
  }

  private toPublicPackage(pkg: CreditPackage): PublicCreditPackage {
    return {
      id: pkg.id,
      name: pkg.name,
      credits: pkg.credits,
      price: decimalToNumber(pkg.price),
      currency: pkg.currency,
      description: pkg.description,
      sortOrder: pkg.sortOrder,
    };
  }
}

export const creditsService = new CreditsService();
