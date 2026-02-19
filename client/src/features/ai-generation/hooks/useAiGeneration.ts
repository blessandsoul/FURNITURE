'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiGenerationService } from '../services/ai-generation.service';
import { getErrorMessage } from '@/lib/utils/error';
import { creditKeys } from '@/features/credits/hooks/useCredits';
import type {
    AiGeneration,
    GenerationStatusResponse,
    GenerateRequest,
    GenerationsFilter,
    UploadRoomImageResponse,
} from '../types/ai-generation.types';
import type { PaginatedData } from '@/lib/api/api.types';

export const aiGenerationKeys = {
    all: ['ai-generation'] as const,
    generations: () => [...aiGenerationKeys.all, 'generations'] as const,
    generationList: (params?: GenerationsFilter) => [...aiGenerationKeys.generations(), params] as const,
    generation: (id: string) => [...aiGenerationKeys.all, 'generation', id] as const,
    status: () => [...aiGenerationKeys.all, 'status'] as const,
};

export function useGenerateImage(): {
    mutate: (data: GenerateRequest) => void;
    mutateAsync: (data: GenerateRequest) => Promise<AiGeneration>;
    isPending: boolean;
    error: Error | null;
} {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: GenerateRequest) => aiGenerationService.generate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: aiGenerationKeys.generations() });
            queryClient.invalidateQueries({ queryKey: aiGenerationKeys.status() });
            queryClient.invalidateQueries({ queryKey: creditKeys.balance() });
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

export function useMyGenerations(params?: GenerationsFilter): {
    data: PaginatedData<AiGeneration> | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: aiGenerationKeys.generationList(params),
        queryFn: () => aiGenerationService.getMyGenerations(params),
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useGeneration(id: string | null): {
    data: AiGeneration | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
} {
    const query = useQuery({
        queryKey: aiGenerationKeys.generation(id ?? ''),
        queryFn: () => aiGenerationService.getGeneration(id!),
        enabled: !!id,
        refetchInterval: (query) => {
            // Stop polling on any error (429, network error, etc.)
            if (query.state.error) return false;
            const status = query.state.data?.status;
            if (status === 'PENDING' || status === 'PROCESSING') {
                return 2000;
            }
            return false;
        },
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

export function useUploadRoomImage(): {
    mutateAsync: (file: File) => Promise<UploadRoomImageResponse>;
    isPending: boolean;
    error: Error | null;
} {
    const mutation = useMutation({
        mutationFn: (file: File) => aiGenerationService.uploadRoomImage(file),
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });

    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}

export function useGenerationStatus(): {
    data: GenerationStatusResponse | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const query = useQuery({
        queryKey: aiGenerationKeys.status(),
        queryFn: () => aiGenerationService.getStatus(),
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}
