'use client';

import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react';
import type {
    ConfiguratorAction,
    ConfiguratorState,
    RoomRedesignState,
} from '../types/configurator.types';

const SESSION_KEY = 'atlas_configurator_state';

const EMPTY_ROOM_REDESIGN: RoomRedesignState = {
    roomImageUrl: null,
    roomThumbnailUrl: null,
    placementInstructions: '',
    roomType: null,
    transformationMode: null,
    roomStyle: null,
    resultImageUrl: null,
};

const initialState: ConfiguratorState = {
    mode: 'scratch',
    selectedCategoryId: null,
    selectedCategorySlug: null,
    selectedOptionValueIds: [],
    generatedImageUrls: [],
    savedDesignId: null,
    generationId: null,
    roomRedesign: { ...EMPTY_ROOM_REDESIGN },
};

function loadFromSession(): ConfiguratorState | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ConfiguratorState;
        return {
            ...initialState,
            ...parsed,
            selectedOptionValueIds: Array.isArray(parsed.selectedOptionValueIds)
                ? parsed.selectedOptionValueIds
                : [],
            generatedImageUrls: Array.isArray(parsed.generatedImageUrls)
                ? parsed.generatedImageUrls
                : [],
            roomRedesign: {
                ...EMPTY_ROOM_REDESIGN,
                ...(parsed.roomRedesign ?? {}),
                // Don't restore generated result image from session
                resultImageUrl: null,
            },
        };
    } catch {
        return null;
    }
}

function configuratorReducer(state: ConfiguratorState, action: ConfiguratorAction): ConfiguratorState {
    switch (action.type) {
        case 'SET_MODE':
            return {
                ...initialState,
                mode: action.payload,
            };

        case 'SET_CATEGORY':
            return {
                ...state,
                selectedCategoryId: action.payload.id,
                selectedCategorySlug: action.payload.slug,
                selectedOptionValueIds: [],
                generatedImageUrls: [],
                savedDesignId: null,
                generationId: null,
            };

        case 'TOGGLE_OPTION_VALUE': {
            const { valueId, isRequired, groupValueIds } = action.payload;

            if (isRequired) {
                const alreadySelected = state.selectedOptionValueIds.includes(valueId);
                if (alreadySelected) return state;
                // Remove any existing selection from this group, then add the new one
                const withoutGroup = state.selectedOptionValueIds.filter(
                    (id) => !groupValueIds.includes(id),
                );
                return {
                    ...state,
                    selectedOptionValueIds: [...withoutGroup, valueId],
                };
            }

            // Optional groups: toggle
            const exists = state.selectedOptionValueIds.includes(valueId);
            return {
                ...state,
                selectedOptionValueIds: exists
                    ? state.selectedOptionValueIds.filter((id) => id !== valueId)
                    : [...state.selectedOptionValueIds, valueId],
            };
        }

        case 'ADD_GENERATED_IMAGE':
            return { ...state, generatedImageUrls: [...state.generatedImageUrls, action.payload] };

        case 'SET_GENERATED_IMAGES':
            return { ...state, generatedImageUrls: action.payload };

        case 'SET_SAVED_DESIGN':
            return { ...state, savedDesignId: action.payload };

        case 'SET_GENERATION_ID':
            return { ...state, generationId: action.payload };

        case 'SET_ROOM_IMAGE':
            return { ...state, roomRedesign: { ...state.roomRedesign, roomImageUrl: action.payload.roomImageUrl, roomThumbnailUrl: action.payload.thumbnailUrl, resultImageUrl: null } };

        case 'SET_PLACEMENT_INSTRUCTIONS':
            return { ...state, roomRedesign: { ...state.roomRedesign, placementInstructions: action.payload } };

        case 'SET_ROOM_TYPE':
            return { ...state, roomRedesign: { ...state.roomRedesign, roomType: action.payload } };

        case 'SET_TRANSFORMATION_MODE':
            return { ...state, roomRedesign: { ...state.roomRedesign, transformationMode: action.payload, resultImageUrl: null } };

        case 'SET_ROOM_STYLE':
            return { ...state, roomRedesign: { ...state.roomRedesign, roomStyle: action.payload, resultImageUrl: null } };

        case 'SET_ROOM_RESULT':
            return { ...state, roomRedesign: { ...state.roomRedesign, resultImageUrl: action.payload } };

        case 'RESET_ROOM_REDESIGN':
            return { ...state, roomRedesign: { ...EMPTY_ROOM_REDESIGN } };

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
    const [state, dispatch] = useReducer(configuratorReducer, initialState);

    // Hydrate from sessionStorage after mount to avoid SSR/client mismatch.
    const hydrated = useRef(false);
    useEffect(() => {
        if (hydrated.current) return;
        hydrated.current = true;

        const saved = loadFromSession();
        if (saved && saved.selectedCategoryId !== null) {
            dispatch({ type: 'HYDRATE_SESSION', payload: saved });
        }
    }, []);

    // Persist to sessionStorage on every state change.
    // Skip until hydration is complete to avoid overwriting saved session with initialState.
    useEffect(() => {
        if (!hydrated.current) return;
        try {
            const toSave: ConfiguratorState = {
                ...state,
                roomRedesign: {
                    ...state.roomRedesign,
                    // Don't persist generated result image
                    resultImageUrl: null,
                },
            };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(toSave));
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
