import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type {
    PublicCategory,
    CategoryWithOptions,
    PublicOptionGroup,
} from '../types/catalog.types';
import type { ApiResponse } from '@/lib/api/api.types';

class CatalogService {
    async getCategories(): Promise<PublicCategory[]> {
        const response = await apiClient.get<ApiResponse<PublicCategory[]>>(
            API_ENDPOINTS.CATALOG.CATEGORIES
        );
        return response.data.data;
    }

    async getCategoryBySlug(slug: string): Promise<CategoryWithOptions> {
        const response = await apiClient.get<ApiResponse<CategoryWithOptions>>(
            API_ENDPOINTS.CATALOG.CATEGORY_BY_SLUG(slug)
        );
        return response.data.data;
    }

    async getOptionsByCategory(categoryId: string): Promise<PublicOptionGroup[]> {
        const response = await apiClient.get<ApiResponse<PublicOptionGroup[]>>(
            API_ENDPOINTS.CATALOG.OPTIONS_BY_CATEGORY(categoryId)
        );
        return response.data.data;
    }
}

export const catalogService = new CatalogService();
