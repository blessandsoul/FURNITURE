'use client';

import { useState, useEffect, useCallback } from 'react';

function readStorage<T>(key: string, initialValue: T): T {
    if (typeof window === 'undefined') return initialValue;
    try {
        const item = window.localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
        return initialValue;
    }
}

export const useLocalStorage = <T,>(key: string, initialValue: T): readonly [T, (value: T | ((val: T) => T)) => void, boolean] => {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const stored = readStorage(key, initialValue);
        if (stored !== initialValue) {
            setStoredValue(stored);
        }
        setIsHydrated(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const setValue = useCallback((value: T | ((val: T) => T)): void => {
        try {
            setStoredValue((prev) => {
                const valueToStore = value instanceof Function ? value(prev) : value;
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
                return valueToStore;
            });
        } catch {
            // Ignore write errors
        }
    }, [key]);

    return [storedValue, setValue, isHydrated] as const;
};
