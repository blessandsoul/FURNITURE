import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type {
    ILoginRequest,
    IRegisterRequest,
    IUser,
    IAuthTokens,
} from '../types/auth.types';
import type { ApiResponse } from '@/lib/api/api.types';

class AuthService {
    async register(
        data: IRegisterRequest
    ): Promise<{ user: IUser; tokens: IAuthTokens }> {
        const response = await apiClient.post<
            ApiResponse<{ user: IUser; tokens: IAuthTokens }>
        >(API_ENDPOINTS.AUTH.REGISTER, data);
        return response.data.data;
    }

    async login(
        data: ILoginRequest
    ): Promise<{ user: IUser; tokens: IAuthTokens }> {
        const response = await apiClient.post<
            ApiResponse<{ user: IUser; tokens: IAuthTokens }>
        >(API_ENDPOINTS.AUTH.LOGIN, data);
        return response.data.data;
    }

    async logout(): Promise<void> {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    }

    async refreshToken(
        refreshToken: string
    ): Promise<IAuthTokens> {
        const response = await apiClient.post<ApiResponse<IAuthTokens>>(
            API_ENDPOINTS.AUTH.REFRESH,
            { refreshToken }
        );
        return response.data.data;
    }

    async getMe(): Promise<IUser> {
        const response = await apiClient.get<ApiResponse<IUser>>(
            API_ENDPOINTS.AUTH.ME
        );
        return response.data.data;
    }

    async verifyEmail(token: string): Promise<void> {
        await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
    }

    async requestPasswordReset(email: string): Promise<void> {
        await apiClient.post(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, { email });
    }

    async resetPassword(token: string, password: string): Promise<void> {
        await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
            token,
            password,
        });
    }
}

export const authService = new AuthService();
