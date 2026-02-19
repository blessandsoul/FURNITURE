'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { designsService } from '../services/designs.service';
import { getErrorMessage } from '@/lib/utils/error';
import type {
    DesignWithCategory,
    PriceCalculation,
    CreateDesignRequest,
    UpdateDesignRequest,
} from '../types/design.types';
import type { PaginatedData, PaginationParams } from '@/lib/api/api.types';

export const designKeys = {
    all: ['designs'] as const,
    lists: () => [...designKeys.all, 'list'] as const,
    list: (params?: PaginationParams) => [...designKeys.lists(), params] as const,
    details: () => [...designKeys.all, 'detail'] as const,
    detail: (id: string) => [...designKeys.details(), id] as const,
};

export function useMyDesigns(params?: PaginationParams): {
    data: PaginatedData<DesignWithCategory> | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: designKeys.list(params),
        queryFn: () => designsService.getMyDesigns(params),
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useDesign(id: string | null): {
    data: DesignWithCategory | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: designKeys.detail(id ?? ''),
        queryFn: () => designsService.getDesign(id!),
        enabled: !!id,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useCreateDesign(): {
    mutate: (data: CreateDesignRequest) => void;
    mutateAsync: (data: CreateDesignRequest) => Promise<DesignWithCategory>;
    isPending: boolean;
    error: Error | null;
} {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: CreateDesignRequest) => designsService.createDesign(data),
        onSuccess: () => {
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

export function useUpdateDesign(): {
    mutate: (args: { id: string; data: UpdateDesignRequest }) => void;
    mutateAsync: (args: { id: string; data: UpdateDesignRequest }) => Promise<DesignWithCategory>;
    isPending: boolean;
    error: Error | null;
} {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDesignRequest }) =>
            designsService.updateDesign(id, data),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: designKeys.lists() });
            queryClient.invalidateQueries({ queryKey: designKeys.detail(result.id) });
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

export function useDeleteDesign(): {
    mutate: (id: string) => void;
    mutateAsync: (id: string) => Promise<void>;
    isPending: boolean;
    error: Error | null;
} {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (id: string) => designsService.deleteDesign(id),
        onSuccess: () => {
            toast.success('Design deleted');
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

export function useCalculatePrice(): {
    mutate: (data: { categoryId: string; optionValueIds: string[] }) => void;
    mutateAsync: (data: { categoryId: string; optionValueIds: string[] }) => Promise<PriceCalculation>;
    data: PriceCalculation | undefined;
    isPending: boolean;
    error: Error | null;
} {
    const mutation = useMutation({
        mutationFn: (data: { categoryId: string; optionValueIds: string[] }) =>
            designsService.calculatePrice(data),
    });

    return {
        mutate: mutation.mutate,
        mutateAsync: mutation.mutateAsync,
        data: mutation.data,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
