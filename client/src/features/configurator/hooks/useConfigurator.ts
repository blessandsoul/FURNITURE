'use client';

import { useCallback } from 'react';
import { useConfiguratorContext } from '../store/configuratorContext';
import type {
    ConfiguratorMode,
    ConfiguratorState,
    RoomDesignStyle,
    RoomType,
    TransformationMode,
} from '../types/configurator.types';
import type { CategoryWithOptions } from '@/features/catalog/types/catalog.types';

export interface UseConfiguratorReturn {
    state: ConfiguratorState;
    canProceedToStep2: boolean;
    canGenerate: (category: CategoryWithOptions | undefined) => boolean;
    setCategory: (id: string, slug: string) => void;
    toggleOptionValue: (groupId: string, valueId: string, isRequired: boolean, groupValueIds: string[]) => void;
    addGeneratedImage: (url: string) => void;
    setSavedDesign: (id: string) => void;
    setGenerationId: (id: string) => void;
    reset: () => void;
    // Room redesign helpers
    setMode: (mode: ConfiguratorMode) => void;
    setRoomImage: (roomImageUrl: string, thumbnailUrl: string) => void;
    removeRoomImage: () => void;
    setPlacementInstructions: (text: string) => void;
    setRoomType: (type: RoomType) => void;
    setTransformationMode: (mode: TransformationMode) => void;
    setRoomStyle: (style: RoomDesignStyle) => void;
    canProceedFromRoomUpload: boolean;
    canGenerateRedesign: boolean;
}

export function useConfigurator(): UseConfiguratorReturn {
    const { state, dispatch } = useConfiguratorContext();

    const canProceedToStep2 = state.selectedCategoryId !== null;

    /**
     * Check if all required option groups have a selection.
     * Needs the fetched category data to know which groups are required.
     */
    const canGenerate = useCallback(
        (category: CategoryWithOptions | undefined): boolean => {
            if (!state.selectedCategoryId || !category) return false;
            if (state.selectedOptionValueIds.length === 0) return false;

            // Check that every required group has at least one selected value
            const requiredGroups = category.optionGroups.filter((g) => g.isRequired);
            return requiredGroups.every((group) =>
                group.optionValues.some((v) => state.selectedOptionValueIds.includes(v.id)),
            );
        },
        [state.selectedCategoryId, state.selectedOptionValueIds],
    );

    const setCategory = useCallback(
        (id: string, slug: string) => {
            dispatch({ type: 'SET_CATEGORY', payload: { id, slug } });
        },
        [dispatch],
    );

    /**
     * Toggle an option value. For required groups, this replaces the previous
     * selection within the same group rather than toggling.
     *
     * @param groupValueIds - All value IDs belonging to this group, used to
     *   find and remove the previous selection for required groups.
     */
    const toggleOptionValue = useCallback(
        (groupId: string, valueId: string, isRequired: boolean, groupValueIds: string[]) => {
            dispatch({
                type: 'TOGGLE_OPTION_VALUE',
                payload: { groupId, valueId, isRequired, groupValueIds },
            });
        },
        [dispatch],
    );

    const addGeneratedImage = useCallback(
        (url: string) => dispatch({ type: 'ADD_GENERATED_IMAGE', payload: url }),
        [dispatch],
    );

    const setSavedDesign = useCallback(
        (id: string) => dispatch({ type: 'SET_SAVED_DESIGN', payload: id }),
        [dispatch],
    );

    const setGenerationId = useCallback(
        (id: string) => dispatch({ type: 'SET_GENERATION_ID', payload: id }),
        [dispatch],
    );

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, [dispatch]);

    // Room redesign actions (kept for placeholder)
    const setMode = useCallback(
        (mode: ConfiguratorMode) => dispatch({ type: 'SET_MODE', payload: mode }),
        [dispatch],
    );

    const setRoomImage = useCallback(
        (roomImageUrl: string, thumbnailUrl: string) =>
            dispatch({ type: 'SET_ROOM_IMAGE', payload: { roomImageUrl, thumbnailUrl } }),
        [dispatch],
    );

    const removeRoomImage = useCallback(
        () => dispatch({ type: 'SET_ROOM_IMAGE', payload: { roomImageUrl: '', thumbnailUrl: '' } }),
        [dispatch],
    );

    const setPlacementInstructions = useCallback(
        (text: string) => dispatch({ type: 'SET_PLACEMENT_INSTRUCTIONS', payload: text }),
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
        state.roomRedesign.roomImageUrl !== '';

    const canGenerateRedesign =
        canProceedFromRoomUpload &&
        state.selectedCategoryId !== null &&
        state.selectedOptionValueIds.length > 0;

    return {
        state,
        canProceedToStep2,
        canGenerate,
        setCategory,
        toggleOptionValue,
        addGeneratedImage,
        setSavedDesign,
        setGenerationId,
        reset,
        setMode,
        setRoomImage,
        removeRoomImage,
        setPlacementInstructions,
        setRoomType,
        setTransformationMode,
        setRoomStyle,
        canProceedFromRoomUpload,
        canGenerateRedesign,
    };
}
