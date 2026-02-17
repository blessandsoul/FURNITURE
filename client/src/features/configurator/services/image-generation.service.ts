import type { ImageGenerationRequest, ImageGenerationResponse } from '../types/configurator.types';

class ImageGenerationService {
    async generate(params: ImageGenerationRequest): Promise<ImageGenerationResponse> {
        const response = await fetch('/api/image-generation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorData = (await response.json().catch(() => null)) as
                | { error?: { message?: string } }
                | null;
            throw new Error(errorData?.error?.message ?? 'Image generation failed');
        }

        const json = (await response.json()) as { success: boolean; data: ImageGenerationResponse };
        return json.data;
    }
}

export const imageGenerationService = new ImageGenerationService();
