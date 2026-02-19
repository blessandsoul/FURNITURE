'use client';

import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import type { PublicCategory, CategoryWithOptions, PublicOptionGroup } from '../types/catalog.types';

export const catalogKeys = {
    all: ['catalog'] as const,
    categories: () => [...catalogKeys.all, 'categories'] as const,
    categoryBySlug: (slug: string) => [...catalogKeys.all, 'category', slug] as const,
    optionsByCategory: (categoryId: string) => [...catalogKeys.all, 'options', categoryId] as const,
};

export function useCategories(): {
    data: PublicCategory[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: catalogKeys.categories(),
        queryFn: () => catalogService.getCategories(),
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useCategoryBySlug(slug: string | null): {
    data: CategoryWithOptions | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: catalogKeys.categoryBySlug(slug ?? ''),
        queryFn: () => catalogService.getCategoryBySlug(slug!),
        enabled: !!slug,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useCategoryOptions(categoryId: string | null): {
    data: PublicOptionGroup[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: catalogKeys.optionsByCategory(categoryId ?? ''),
        queryFn: () => catalogService.getOptionsByCategory(categoryId!),
        enabled: !!categoryId,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}
