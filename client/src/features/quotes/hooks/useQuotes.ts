'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quoteService } from '../services/quote.service';
import { getErrorMessage } from '@/lib/utils/error';
import { designKeys } from '@/features/designs/hooks/useDesigns';
import type { QuoteWithDesign, CreateQuoteRequest } from '../types/quote.types';
import type { PaginatedData, PaginationParams } from '@/lib/api/api.types';

export const quoteKeys = {
    all: ['quotes'] as const,
    lists: () => [...quoteKeys.all, 'list'] as const,
    list: (params?: PaginationParams) => [...quoteKeys.lists(), params] as const,
    details: () => [...quoteKeys.all, 'detail'] as const,
    detail: (id: string) => [...quoteKeys.details(), id] as const,
};

export function useSubmitQuote(): {
    mutate: (data: CreateQuoteRequest) => void;
    mutateAsync: (data: CreateQuoteRequest) => Promise<QuoteWithDesign>;
    isPending: boolean;
    error: Error | null;
} {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: CreateQuoteRequest) => quoteService.submitQuote(data),
        onSuccess: () => {
            toast.success('Quote request submitted');
            queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
            queryClient.invalidateQueries({ queryKey: designKeys.lists() });
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

export function useMyQuotes(params?: PaginationParams): {
    data: PaginatedData<QuoteWithDesign> | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: quoteKeys.list(params),
        queryFn: () => quoteService.getMyQuotes(params),
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useQuote(id: string | null): {
    data: QuoteWithDesign | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: quoteKeys.detail(id ?? ''),
        queryFn: () => quoteService.getQuote(id!),
        enabled: !!id,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useCancelQuote(): {
    mutate: (id: string) => void;
    mutateAsync: (id: string) => Promise<QuoteWithDesign>;
    isPending: boolean;
    error: Error | null;
} {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (id: string) => quoteService.cancelQuote(id),
        onSuccess: (result) => {
            toast.success('Quote cancelled');
            queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
            queryClient.invalidateQueries({ queryKey: quoteKeys.detail(result.id) });
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
