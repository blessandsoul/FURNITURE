'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/error';
import { roomRedesignService } from '../services/room-redesign.service';
import { useConfiguratorContext } from '../store/configuratorContext';
import type { RoomRedesignRequest, RoomRedesignResponse } from '../types/configurator.types';

export function useRoomRedesign(): {
    generate: (params: RoomRedesignRequest) => void;
    data: RoomRedesignResponse | undefined;
    isPending: boolean;
    isError: boolean;
    reset: () => void;
} {
    const { dispatch } = useConfiguratorContext();

    const mutation = useMutation({
        mutationFn: (params: RoomRedesignRequest) => roomRedesignService.redesign(params),
        onSuccess: (data: RoomRedesignResponse) => {
            dispatch({ type: 'SET_ROOM_RESULT', payload: data.resultImageUrl });
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error));
        },
    });

    return {
        generate: mutation.mutate,
        data: mutation.data,
        isPending: mutation.isPending,
        isError: mutation.isError,
        reset: mutation.reset,
    };
}
