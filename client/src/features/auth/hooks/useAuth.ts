'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { setCredentials, logout as logoutAction } from '../store/authSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ILoginRequest, IRegisterRequest, IUser } from '../types/auth.types';

interface UseAuthReturn {
    user: IUser | null;
    isAuthenticated: boolean;
    login: (data: ILoginRequest) => void;
    register: (data: IRegisterRequest) => void;
    logout: () => Promise<void>;
    isLoggingIn: boolean;
    isRegistering: boolean;
    loginError: Error | null;
    registerError: Error | null;
}

export const useAuth = (): UseAuthReturn => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated } = useAppSelector(
        (state) => state.auth
    );

    const loginMutation = useMutation({
        mutationFn: (data: ILoginRequest) => authService.login(data),
        onSuccess: (data) => {
            dispatch(setCredentials({ user: data.user }));
            const redirectTo = searchParams.get('from') || '/dashboard';
            router.push(redirectTo);
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: IRegisterRequest) => authService.register(data),
        onSuccess: (data) => {
            dispatch(setCredentials({ user: data.user }));
            router.push('/dashboard');
        },
    });

    const logout = async (): Promise<void> => {
        try {
            await authService.logout();
        } finally {
            dispatch(logoutAction());
            router.push('/login');
        }
    };

    return {
        user,
        isAuthenticated,
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
    };
};
