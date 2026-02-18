'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authService } from '../services/auth.service';
import { setCredentials, logout } from '../store/authSlice';

/**
 * Rehydrates auth state from the httpOnly cookie session on page load.
 * Calls GET /auth/me — if the cookie is valid, populates Redux with the user.
 * If the cookie is missing or expired, stays unauthenticated silently.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }): React.ReactElement {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    const { data, error } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: () => authService.getMe(),
        retry: false,
        staleTime: 5 * 60 * 1000,
        enabled: !isAuthenticated,
    });

    useEffect(() => {
        if (data) {
            dispatch(setCredentials({ user: data }));
        }
    }, [data, dispatch]);

    useEffect(() => {
        if (error) {
            dispatch(logout());
        }
    }, [error, dispatch]);

    return <>{children}</>;
}
