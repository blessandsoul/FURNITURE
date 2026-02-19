import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type {
    CreditPackage,
    CreditBalance,
    CreditTransaction,
} from '../types/credits.types';
import type {
    ApiResponse,
    PaginatedApiResponse,
    PaginatedData,
    PaginationParams,
} from '@/lib/api/api.types';

class CreditsService {
    async getPackages(): Promise<CreditPackage[]> {
        const response = await apiClient.get<ApiResponse<CreditPackage[]>>(
            API_ENDPOINTS.CREDITS.PACKAGES
        );
        return response.data.data;
    }

    async getBalance(): Promise<CreditBalance> {
        const response = await apiClient.get<ApiResponse<CreditBalance>>(
            API_ENDPOINTS.CREDITS.BALANCE
        );
        return response.data.data;
    }

    async getTransactions(
        params?: PaginationParams
    ): Promise<PaginatedData<CreditTransaction>> {
        const response = await apiClient.get<PaginatedApiResponse<CreditTransaction>>(
            API_ENDPOINTS.CREDITS.TRANSACTIONS,
            { params }
        );
        return response.data.data;
    }

    async purchasePackage(packageId: string): Promise<CreditBalance> {
        const response = await apiClient.post<ApiResponse<CreditBalance>>(
            API_ENDPOINTS.CREDITS.PURCHASE,
            { packageId }
        );
        return response.data.data;
    }
}

export const creditsService = new CreditsService();
