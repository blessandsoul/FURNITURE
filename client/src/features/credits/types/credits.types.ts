export type CreditTransactionType =
    | 'PURCHASE'
    | 'GENERATION'
    | 'REFUND'
    | 'BONUS'
    | 'ADJUSTMENT';

export interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number;
    currency: string;
    description: string | null;
    sortOrder: number;
}

export interface CreditBalance {
    userId: string;
    balance: number;
}

export interface CreditTransaction {
    id: string;
    userId: string;
    amount: number;
    type: CreditTransactionType;
    description: string | null;
    referenceId: string | null;
    createdAt: string;
}
