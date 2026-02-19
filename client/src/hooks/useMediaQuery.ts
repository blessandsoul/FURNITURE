'use client';

import { useSyncExternalStore, useCallback } from 'react';

function getServerSnapshot(): boolean {
    return false;
}

export const useMediaQuery = (query: string): boolean => {
    const subscribe = useCallback(
        (callback: () => void): (() => void) => {
            const media = window.matchMedia(query);
            media.addEventListener('change', callback);
            return () => media.removeEventListener('change', callback);
        },
        [query],
    );

    const getSnapshot = useCallback((): boolean => {
        return window.matchMedia(query).matches;
    }, [query]);

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export const useIsMobile = (): boolean =>
    useMediaQuery('(max-width: 768px)');

export const useIsTablet = (): boolean =>
    useMediaQuery('(max-width: 1024px)');
