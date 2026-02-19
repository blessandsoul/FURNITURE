import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type {
    AiGeneration,
    GenerationStatusResponse,
    GenerateRequest,
    GenerationsFilter,
    UploadRoomImageResponse,
} from '../types/ai-generation.types';
import type {
    ApiResponse,
    PaginatedApiResponse,
    PaginatedData,
} from '@/lib/api/api.types';

class AiGenerationService {
    async generate(data: GenerateRequest): Promise<AiGeneration> {
        const response = await apiClient.post<ApiResponse<AiGeneration>>(
            API_ENDPOINTS.AI.GENERATE,
            data
        );
        return response.data.data;
    }

    async getMyGenerations(
        params?: GenerationsFilter
    ): Promise<PaginatedData<AiGeneration>> {
        const response = await apiClient.get<PaginatedApiResponse<AiGeneration>>(
            API_ENDPOINTS.AI.GENERATIONS,
            { params }
        );
        return response.data.data;
    }

    async getGeneration(id: string): Promise<AiGeneration> {
        const response = await apiClient.get<ApiResponse<AiGeneration>>(
            API_ENDPOINTS.AI.GENERATION(id)
        );
        return response.data.data;
    }

    async getStatus(): Promise<GenerationStatusResponse> {
        const response = await apiClient.get<ApiResponse<GenerationStatusResponse>>(
            API_ENDPOINTS.AI.STATUS
        );
        return response.data.data;
    }

    async uploadRoomImage(file: File): Promise<UploadRoomImageResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<ApiResponse<UploadRoomImageResponse>>(
            API_ENDPOINTS.AI.UPLOAD_ROOM_IMAGE,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60_000,
            },
        );
        return response.data.data;
    }
}

export const aiGenerationService = new AiGenerationService();
