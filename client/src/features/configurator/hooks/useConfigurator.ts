'use client';

import { useCallback } from 'react';
import { getOptionsByStyle, getStyleById } from '../data/furniture-catalog';
import { useConfiguratorContext } from '../store/configuratorContext';
import type {
    FurnitureOption,
    FurnitureStyle,
    FurnitureStyleId,
    OptionCategory,
} from '../types/configurator.types';

export interface UseConfiguratorReturn {
    state: ReturnType<typeof useConfiguratorContext>['state'];
    selectedStyle: FurnitureStyle | null;
    selectedOptions: FurnitureOption[];
    generatedImageUrls: string[];
    canProceedToStep2: boolean;
    canGenerate: boolean;
    setStyle: (id: FurnitureStyleId) => void;
    setOption: (category: OptionCategory, optionId: string) => void;
    clearOption: (category: OptionCategory) => void;
    reset: () => void;
}

export function useConfigurator(): UseConfiguratorReturn {
    const { state, dispatch } = useConfiguratorContext();

    const selectedStyle = state.selections.style ? getStyleById(state.selections.style) ?? null : null;

    const selectedOptions: FurnitureOption[] = state.selections.style
        ? getOptionsByStyle(state.selections.style).filter((opt) => {
              return state.selections.options[opt.category] === opt.id;
          })
        : [];

    const canProceedToStep2 = state.selections.style !== null;

    const hasAtLeastOneOption = Object.values(state.selections.options).some((v) => v !== null);
    const canGenerate = canProceedToStep2 && hasAtLeastOneOption;

    const setStyle = useCallback(
        (id: FurnitureStyleId) => {
            dispatch({ type: 'SET_STYLE', payload: id });
        },
        [dispatch],
    );

    const setOption = useCallback(
        (category: OptionCategory, optionId: string) => {
            dispatch({ type: 'SET_OPTION', payload: { category, optionId } });
        },
        [dispatch],
    );

    const clearOption = useCallback(
        (category: OptionCategory) => {
            dispatch({ type: 'CLEAR_OPTION', payload: { category } });
        },
        [dispatch],
    );

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, [dispatch]);

    return {
        state,
        selectedStyle,
        selectedOptions,
        generatedImageUrls: state.generatedImageUrls,
        canProceedToStep2,
        canGenerate,
        setStyle,
        setOption,
        clearOption,
        reset,
    };
}
