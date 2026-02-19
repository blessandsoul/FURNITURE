'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useState } from 'react';
import axios from 'axios';
import { store } from '@/store';
import { AuthInitializer } from '@/features/auth/components/AuthInitializer';

export function Providers({
    children,
}: {
    children: React.ReactNode;
}): React.ReactElement {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000,
                        gcTime: 10 * 60 * 1000,
                        refetchOnWindowFocus: false,
                        retry: (failureCount, error) => {
                            // Never retry 429 (rate limited) or 401 (handled by interceptor)
                            if (axios.isAxiosError(error) && (error.response?.status === 429 || error.response?.status === 401)) {
                                return false;
                            }
                            return failureCount < 1;
                        },
                    },
                },
            })
    );

    return (
        <ReduxProvider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
>
                    <AuthInitializer>{children}</AuthInitializer>
                    <Toaster position="top-right" richColors />
                </ThemeProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ReduxProvider>
    );
}
