import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type {
    DesignWithCategory,
    PriceCalculation,
    CreateDesignRequest,
    UpdateDesignRequest,
} from '../types/design.types';
import type {
    ApiResponse,
    PaginatedApiResponse,
    PaginatedData,
    PaginationParams,
} from '@/lib/api/api.types';

class DesignsService {
    async getMyDesigns(
        params?: PaginationParams
    ): Promise<PaginatedData<DesignWithCategory>> {
        const response = await apiClient.get<PaginatedApiResponse<DesignWithCategory>>(
            API_ENDPOINTS.DESIGNS.LIST,
            { params }
        );
        return response.data.data;
    }

    async getDesign(id: string): Promise<DesignWithCategory> {
        const response = await apiClient.get<ApiResponse<DesignWithCategory>>(
            API_ENDPOINTS.DESIGNS.GET(id)
        );
        return response.data.data;
    }

    async createDesign(data: CreateDesignRequest): Promise<DesignWithCategory> {
        const response = await apiClient.post<ApiResponse<DesignWithCategory>>(
            API_ENDPOINTS.DESIGNS.CREATE,
            data
        );
        return response.data.data;
    }

    async updateDesign(
        id: string,
        data: UpdateDesignRequest
    ): Promise<DesignWithCategory> {
        const response = await apiClient.put<ApiResponse<DesignWithCategory>>(
            API_ENDPOINTS.DESIGNS.UPDATE(id),
            data
        );
        return response.data.data;
    }

    async deleteDesign(id: string): Promise<void> {
        await apiClient.delete(API_ENDPOINTS.DESIGNS.DELETE(id));
    }

    async calculatePrice(data: {
        categoryId: string;
        optionValueIds: string[];
    }): Promise<PriceCalculation> {
        const response = await apiClient.post<ApiResponse<PriceCalculation>>(
            API_ENDPOINTS.DESIGNS.CALCULATE_PRICE,
            data
        );
        return response.data.data;
    }
}

export const designsService = new DesignsService();
