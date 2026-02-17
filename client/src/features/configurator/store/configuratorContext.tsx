'use client';

import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import type {
    ConfiguratorAction,
    ConfiguratorState,
    OptionCategory,
} from '../types/configurator.types';
import { decodeDesignFromParams, hasDesignInParams } from '../lib/share';

const SESSION_KEY = 'atlas_configurator_state';

const EMPTY_OPTIONS: Record<OptionCategory, string | null> = {
    color: null,
    material: null,
    leg_style: null,
    size: null,
    upholstery: null,
};

const initialState: ConfiguratorState = {
    selections: {
        style: null,
        options: { ...EMPTY_OPTIONS },
    },
    generatedImageUrls: [],
};

function loadInitialState(searchParams: URLSearchParams): ConfiguratorState {
    // URL params are deterministic (same on server & client), so safe to read here.
    if (hasDesignInParams(searchParams)) {
        const selections = decodeDesignFromParams(searchParams);
        if (selections) {
            return {
                selections,
                generatedImageUrls: [],
            };
        }
    }

    // sessionStorage is deferred to useEffect (see ConfiguratorProvider)
    // to avoid hydration mismatch between server (no storage) and client.
    return initialState;
}

function loadFromSession(): ConfiguratorState | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ConfiguratorState;
        return {
            ...initialState,
            ...parsed,
            selections: {
                ...initialState.selections,
                ...(parsed.selections ?? {}),
                options: {
                    ...EMPTY_OPTIONS,
                    ...(parsed.selections?.options ?? {}),
                },
            },
        };
    } catch {
        return null;
    }
}

function configuratorReducer(state: ConfiguratorState, action: ConfiguratorAction): ConfiguratorState {
    switch (action.type) {
        case 'SET_STYLE':
            return {
                ...state,
                selections: {
                    style: action.payload,
                    options: { ...EMPTY_OPTIONS },
                },
                generatedImageUrls: [],
            };
        case 'SET_OPTION':
            return {
                ...state,
                selections: {
                    ...state.selections,
                    options: {
                        ...state.selections.options,
                        [action.payload.category]: action.payload.optionId,
                    },
                },
            };
        case 'CLEAR_OPTION':
            return {
                ...state,
                selections: {
                    ...state.selections,
                    options: {
                        ...state.selections.options,
                        [action.payload.category]: null,
                    },
                },
            };
        case 'SET_IMAGE_URLS':
            return { ...state, generatedImageUrls: action.payload };
        case 'LOAD_DESIGN':
            return {
                selections: {
                    ...action.payload.selections,
                    options: {
                        ...EMPTY_OPTIONS,
                        ...action.payload.selections.options,
                    },
                },
                generatedImageUrls: action.payload.imageUrls ?? [],
            };
        case 'HYDRATE_SESSION':
            return action.payload;
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

interface ConfiguratorContextValue {
    state: ConfiguratorState;
    dispatch: React.Dispatch<ConfiguratorAction>;
}

const ConfiguratorContext = createContext<ConfiguratorContextValue | null>(null);

export function ConfiguratorProvider({ children }: { children: ReactNode }): React.JSX.Element {
    const searchParams = useSearchParams();
    const [state, dispatch] = useReducer(
        configuratorReducer,
        searchParams,
        loadInitialState,
    );

    // Hydrate from sessionStorage after mount to avoid SSR/client mismatch.
    // Skip if URL params already provided state (shared link takes priority).
    const hydrated = useRef(false);
    useEffect(() => {
        if (hydrated.current) return;
        hydrated.current = true;

        if (hasDesignInParams(searchParams)) return;

        const saved = loadFromSession();
        if (saved && saved.selections.style !== null) {
            dispatch({ type: 'HYDRATE_SESSION', payload: saved });
        }
    }, [searchParams]);

    // Persist to sessionStorage on every state change
    useEffect(() => {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
        } catch {
            // sessionStorage might be unavailable (private mode quota, etc.)
        }
    }, [state]);

    return (
        <ConfiguratorContext.Provider value={{ state, dispatch }}>
            {children}
        </ConfiguratorContext.Provider>
    );
}

export function useConfiguratorContext(): ConfiguratorContextValue {
    const context = useContext(ConfiguratorContext);
    if (!context) {
        throw new Error('useConfiguratorContext must be used within ConfiguratorProvider');
    }
    return context;
}
