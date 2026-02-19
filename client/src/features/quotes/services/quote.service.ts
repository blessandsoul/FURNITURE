import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type {
    QuoteWithDesign,
    CreateQuoteRequest,
} from '../types/quote.types';
import type {
    ApiResponse,
    PaginatedApiResponse,
    PaginatedData,
    PaginationParams,
} from '@/lib/api/api.types';

class QuoteService {
    async submitQuote(data: CreateQuoteRequest): Promise<QuoteWithDesign> {
        const response = await apiClient.post<ApiResponse<QuoteWithDesign>>(
            API_ENDPOINTS.QUOTES.CREATE,
            data
        );
        return response.data.data;
    }

    async getMyQuotes(
        params?: PaginationParams
    ): Promise<PaginatedData<QuoteWithDesign>> {
        const response = await apiClient.get<PaginatedApiResponse<QuoteWithDesign>>(
            API_ENDPOINTS.QUOTES.LIST,
            { params }
        );
        return response.data.data;
    }

    async getQuote(id: string): Promise<QuoteWithDesign> {
        const response = await apiClient.get<ApiResponse<QuoteWithDesign>>(
            API_ENDPOINTS.QUOTES.GET(id)
        );
        return response.data.data;
    }

    async cancelQuote(id: string): Promise<QuoteWithDesign> {
        const response = await apiClient.put<ApiResponse<QuoteWithDesign>>(
            API_ENDPOINTS.QUOTES.CANCEL(id)
        );
        return response.data.data;
    }
}

export const quoteService = new QuoteService();
