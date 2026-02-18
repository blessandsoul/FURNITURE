'use client';

import { useCallback } from 'react';
import { getOptionsByStyle, getStyleById } from '../data/furniture-catalog';
import { useConfiguratorContext } from '../store/configuratorContext';
import type {
    ConfiguratorMode,
    FurnitureOption,
    FurnitureStyle,
    FurnitureStyleId,
    OptionCategory,
    RoomDesignStyle,
    RoomType,
    TransformationMode,
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
    // Room redesign helpers
    setMode: (mode: ConfiguratorMode) => void;
    setRoomImage: (dataUrl: string) => void;
    removeRoomImage: () => void;
    setRoomType: (type: RoomType) => void;
    setTransformationMode: (mode: TransformationMode) => void;
    setRoomStyle: (style: RoomDesignStyle) => void;
    canProceedFromRoomUpload: boolean;
    canGenerateRedesign: boolean;
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

    // Room redesign actions
    const setMode = useCallback(
        (mode: ConfiguratorMode) => dispatch({ type: 'SET_MODE', payload: mode }),
        [dispatch],
    );

    const setRoomImage = useCallback(
        (dataUrl: string) => dispatch({ type: 'SET_ROOM_IMAGE', payload: dataUrl }),
        [dispatch],
    );

    const removeRoomImage = useCallback(
        () => dispatch({ type: 'SET_ROOM_IMAGE', payload: '' }),
        [dispatch],
    );

    const setRoomType = useCallback(
        (type: RoomType) => dispatch({ type: 'SET_ROOM_TYPE', payload: type }),
        [dispatch],
    );

    const setTransformationMode = useCallback(
        (mode: TransformationMode) => dispatch({ type: 'SET_TRANSFORMATION_MODE', payload: mode }),
        [dispatch],
    );

    const setRoomStyle = useCallback(
        (style: RoomDesignStyle) => dispatch({ type: 'SET_ROOM_STYLE', payload: style }),
        [dispatch],
    );

    const canProceedFromRoomUpload =
        state.roomRedesign.roomImageUrl !== null &&
        state.roomRedesign.roomImageUrl !== '' &&
        state.roomRedesign.roomType !== null;

    const canGenerateRedesign =
        canProceedFromRoomUpload &&
        state.roomRedesign.transformationMode !== null &&
        state.roomRedesign.roomStyle !== null;

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
        setMode,
        setRoomImage,
        removeRoomImage,
        setRoomType,
        setTransformationMode,
        setRoomStyle,
        canProceedFromRoomUpload,
        canGenerateRedesign,
    };
}
