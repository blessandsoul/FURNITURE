'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { setCredentials, logout as logoutAction } from '../store/authSlice';
import { useRouter } from 'next/navigation';
import type { ILoginRequest } from '../types/auth.types';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user, isAuthenticated, tokens } = useAppSelector(
        (state) => state.auth
    );

    const loginMutation = useMutation({
        mutationFn: (data: ILoginRequest) => authService.login(data),
        onSuccess: (data) => {
            dispatch(setCredentials(data));
            router.push('/dashboard');
        },
    });

    const registerMutation = useMutation({
        mutationFn: authService.register,
        onSuccess: (data) => {
            dispatch(setCredentials(data));
            router.push('/dashboard');
        },
    });

    const logout = async (): Promise<void> => {
        try {
            await authService.logout();
        } finally {
            dispatch(logoutAction());
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth');
                sessionStorage.clear();
            }
            router.push('/login');
        }
    };

    return {
        user,
        isAuthenticated,
        tokens,
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
    };
};
