import { prisma } from '../../libs/prisma.js';
import type { CreditBalance, CreditTransaction, CreditPackage, CreditTransactionType, Prisma } from '@prisma/client';
import type { CreateCreditPackageInput, UpdateCreditPackageInput } from './credits.schemas.js';
import type { PaginationInput } from '../../shared/schemas/pagination.schema.js';

class CreditsRepository {
  // ─── Credit Balance ────────────────────────────────────────

  async findBalanceByUserId(userId: string): Promise<CreditBalance | null> {
    return prisma.creditBalance.findUnique({
      where: { userId },
    });
  }

  async upsertBalance(userId: string, incrementBy: number, tx?: Prisma.TransactionClient): Promise<CreditBalance> {
    const client = tx ?? prisma;
    return client.creditBalance.upsert({
      where: { userId },
      create: { userId, balance: incrementBy },
      update: { balance: { increment: incrementBy } },
    });
  }

  // ─── Credit Transactions ───────────────────────────────────

  async createTransaction(
    data: {
      userId: string;
      amount: number;
      type: CreditTransactionType;
      description?: string;
      referenceId?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<CreditTransaction> {
    const client = tx ?? prisma;
    return client.creditTransaction.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        description: data.description ?? null,
        referenceId: data.referenceId ?? null,
      },
    });
  }

  async findTransactionsByUserId(
    userId: string,
    pagination: PaginationInput,
  ): Promise<{ items: CreditTransaction[]; totalItems: number }> {
    const skip = (pagination.page - 1) * pagination.limit;

    const [items, totalItems] = await prisma.$transaction([
      prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.creditTransaction.count({
        where: { userId },
      }),
    ]);

    return { items, totalItems };
  }

  // ─── Credit Packages ───────────────────────────────────────

  async findActivePackages(): Promise<CreditPackage[]> {
    return prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findPackageById(id: string): Promise<CreditPackage | null> {
    return prisma.creditPackage.findUnique({
      where: { id },
    });
  }

  async createPackage(data: CreateCreditPackageInput): Promise<CreditPackage> {
    return prisma.creditPackage.create({
      data: {
        name: data.name,
        credits: data.credits,
        price: data.price,
        currency: data.currency,
        description: data.description ?? null,
        sortOrder: data.sortOrder,
      },
    });
  }

  async updatePackage(id: string, data: UpdateCreditPackageInput): Promise<CreditPackage> {
    return prisma.creditPackage.update({
      where: { id },
      data,
    });
  }

  async softDeletePackage(id: string): Promise<CreditPackage> {
    return prisma.creditPackage.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ─── Transactional helpers ─────────────────────────────────

  async executeInTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn, { isolationLevel: 'Serializable' });
  }
}

export const creditsRepo = new CreditsRepository();
