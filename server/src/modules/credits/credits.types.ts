import type { Decimal } from '@prisma/client/runtime/library';
import type { CreditTransactionType } from '@prisma/client';

export interface PublicCreditBalance {
  userId: string;
  balance: number;
}

export interface PublicCreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: CreditTransactionType;
  description: string | null;
  referenceId: string | null;
  createdAt: string;
}

export interface PublicCreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  description: string | null;
  sortOrder: number;
}

/** Converts a Prisma Decimal to a plain number for JSON serialization */
export function decimalToNumber(value: Decimal): number {
  return Number(value);
}
