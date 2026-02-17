'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/error';
import { buildFurniturePrompt } from '../lib/prompt.builder';
import { imageGenerationService } from '../services/image-generation.service';
import { useConfiguratorContext } from '../store/configuratorContext';
import type { FurnitureOption, FurnitureStyle, ImageGenerationResponse } from '../types/configurator.types';

interface GenerateParams {
    style: FurnitureStyle;
    selectedOptions: FurnitureOption[];
}

export function useImageGeneration(): {
    generate: (params: GenerateParams) => void;
    data: ImageGenerationResponse | undefined;
    isPending: boolean;
    isError: boolean;
    reset: () => void;
} {
    const { dispatch } = useConfiguratorContext();

    const mutation = useMutation({
        mutationFn: ({ style, selectedOptions }: GenerateParams) => {
            const prompt = buildFurniturePrompt(style, selectedOptions);
            return imageGenerationService.generate({ prompt, styleId: style.id });
        },
        onSuccess: (data: ImageGenerationResponse) => {
            dispatch({ type: 'SET_IMAGE_URLS', payload: data.imageUrls });
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error));
        },
    });

    return {
        generate: mutation.mutate,
        data: mutation.data,
        isPending: mutation.isPending,
        isError: mutation.isError,
        reset: mutation.reset,
    };
}
