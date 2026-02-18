import axios from 'axios';
import { store } from '@/store';
import { logout } from '@/features/auth/store/authSlice';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor: handle 401 with token refresh
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
    error: unknown,
): void => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(undefined);
        }
    });
    failedQueue = [];
};

// Auth endpoints that should never trigger a token refresh attempt
const SKIP_REFRESH_URLS = [
    API_ENDPOINTS.AUTH.ME,
    API_ENDPOINTS.AUTH.REFRESH,
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.REGISTER,
    API_ENDPOINTS.AUTH.LOGOUT,
];

const shouldSkipRefresh = (url: string | undefined): boolean => {
    if (!url) return true;
    return SKIP_REFRESH_URLS.some((endpoint) => url.includes(endpoint));
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !shouldSkipRefresh(originalRequest.url)
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return apiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Refresh token is sent automatically via httpOnly cookie
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
                    {},
                    { withCredentials: true }
                );

                processQueue(null);

                // Retry with new cookies (set automatically by the server)
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                store.dispatch(logout());
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export { apiClient };
