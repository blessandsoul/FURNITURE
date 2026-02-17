'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/error';
import { videoGenerationService } from '../services/video-generation.service';
import type { VideoGenerationRequest, VideoGenerationResponse } from '../types/configurator.types';

export interface UseVideoGenerationReturn {
    generate: (request: VideoGenerationRequest) => void;
    data: VideoGenerationResponse | undefined;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
    reset: () => void;
}

export function useVideoGeneration(): UseVideoGenerationReturn {
    const mutation = useMutation<VideoGenerationResponse, Error, VideoGenerationRequest>({
        mutationFn: (request) => videoGenerationService.generate(request),
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error));
        },
    });

    return {
        generate: mutation.mutate,
        data: mutation.data,
        isPending: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        reset: mutation.reset,
    };
}
