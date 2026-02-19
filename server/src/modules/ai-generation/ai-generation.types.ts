import type { AiGenerationStatus, GenerationType } from '@prisma/client';

export interface PublicAiGeneration {
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

export interface PublicGenerationStatus {
  freeRemaining: number;
  creditBalance: number;
}
