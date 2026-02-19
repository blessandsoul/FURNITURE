'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { creditsService } from '../services/credits.service';
import { getErrorMessage } from '@/lib/utils/error';
import type { CreditPackage, CreditBalance, CreditTransaction } from '../types/credits.types';
import type { PaginatedData, PaginationParams } from '@/lib/api/api.types';

export const creditKeys = {
    all: ['credits'] as const,
    packages: () => [...creditKeys.all, 'packages'] as const,
    balance: () => [...creditKeys.all, 'balance'] as const,
    transactions: () => [...creditKeys.all, 'transactions'] as const,
    transactionList: (params?: PaginationParams) => [...creditKeys.transactions(), params] as const,
};

export function useCreditPackages(): {
    data: CreditPackage[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: creditKeys.packages(),
        queryFn: () => creditsService.getPackages(),
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useCreditBalance(): {
    data: CreditBalance | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: creditKeys.balance(),
        queryFn: () => creditsService.getBalance(),
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useCreditTransactions(params?: PaginationParams): {
    data: PaginatedData<CreditTransaction> | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: creditKeys.transactionList(params),
        queryFn: () => creditsService.getTransactions(params),
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function usePurchasePackage(): {
    mutate: (packageId: string) => void;
    mutateAsync: (packageId: string) => Promise<CreditBalance>;
    isPending: boolean;
    error: Error | null;
} {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (packageId: string) => creditsService.purchasePackage(packageId),
        onSuccess: () => {
            toast.success('Credits purchased successfully');
            queryClient.invalidateQueries({ queryKey: creditKeys.balance() });
            queryClient.invalidateQueries({ queryKey: creditKeys.transactions() });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });

    return {
        mutate: mutation.mutate,
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
