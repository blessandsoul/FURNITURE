import type { VideoGenerationRequest, VideoGenerationResponse } from '../types/configurator.types';

class VideoGenerationService {
    async generate(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
        const response = await fetch('/api/video-generation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = (await response.json().catch(() => null)) as
                | { error?: { message?: string } }
                | null;
            throw new Error(errorData?.error?.message ?? 'Video generation failed');
        }

        const json = (await response.json()) as { success: boolean; data: VideoGenerationResponse };
        return json.data;
    }
}

export const videoGenerationService = new VideoGenerationService();
