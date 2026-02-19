export type AiGenerationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type GenerationType = 'SCRATCH' | 'REIMAGINE';

export interface AiGeneration {
    id: string;
    userId: string;
    designId: string | null;
    prompt: string;
    userFreeText: string | null;
    model: string;
    status: AiGenerationStatus;
    generationType: GenerationType;
    roomImageUrl: string | null;
    placementInstructions: string | null;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    errorMessage: string | null;
    promptTokens: number | null;
    totalTokens: number | null;
    wasFree: boolean;
    creditsUsed: number;
    durationMs: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface GenerationStatusResponse {
    freeRemaining: number;
    creditBalance: number;
}

export interface GenerateRequest {
    designId: string;
    freeText?: string;
    roomImageUrl?: string;
    placementInstructions?: string;
}

export interface UploadRoomImageResponse {
    roomImageUrl: string;
    thumbnailUrl: string;
}

export interface GenerationsFilter {
    page?: number;
    limit?: number;
    designId?: string;
}
