import type { RoomRedesignRequest, RoomRedesignResponse } from '../types/configurator.types';

class RoomRedesignService {
    async redesign(params: RoomRedesignRequest): Promise<RoomRedesignResponse> {
        const response = await fetch('/api/room-redesign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorData = (await response.json().catch(() => null)) as
                | { error?: { message?: string } }
                | null;
            throw new Error(errorData?.error?.message ?? 'Room redesign failed');
        }

        const json = (await response.json()) as { success: boolean; data: RoomRedesignResponse };
        return json.data;
    }
}

export const roomRedesignService = new RoomRedesignService();
