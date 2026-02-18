import { getRoomTypeById, getRoomStyleById, getTransformationById } from '../data/room-catalog';
import type { RoomType, TransformationMode, RoomDesignStyle } from '../types/configurator.types';

export function buildRoomRedesignPrompt(
    roomType: RoomType,
    transformationMode: TransformationMode,
    roomStyle: RoomDesignStyle,
): string {
    const room = getRoomTypeById(roomType);
    const transform = getTransformationById(transformationMode);
    const style = getRoomStyleById(roomStyle);

    const roomLabel = room?.label ?? roomType;
    const styleFragment = style?.promptFragment ?? roomStyle;

    const modeInstructions: Record<TransformationMode, string> = {
        complete: `Completely redesign this ${roomLabel.toLowerCase()}. Replace all surfaces, furniture, lighting, and decor.`,
        'furniture-only': `Keep the existing room structure (walls, floor, windows) but replace all furniture with new pieces in this ${roomLabel.toLowerCase()}.`,
        'style-colors': `Keep the same furniture layout but change wall colors, lighting mood, and decorative accents in this ${roomLabel.toLowerCase()}.`,
    };

    const instruction = modeInstructions[transformationMode]
        ?? `Redesign this ${roomLabel.toLowerCase()} with ${transform?.label ?? transformationMode}.`;

    return [
        instruction,
        `Style: ${styleFragment}`,
        'photorealistic interior photography',
        'professional architectural lighting',
        'high-end interior design magazine quality',
        '8k resolution, sharp details',
    ].join(', ');
}
