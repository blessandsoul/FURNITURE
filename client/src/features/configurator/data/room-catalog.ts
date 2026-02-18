import type {
    RoomTypeOption,
    TransformationOption,
    RoomStyleOption,
    RoomType,
    TransformationMode,
    RoomDesignStyle,
} from '../types/configurator.types';

// ─── Room Types ──────────────────────────────────────────────────────────────

export const ROOM_TYPES: RoomTypeOption[] = [
    {
        id: 'kitchen',
        label: 'Kitchen',
        description: 'Cooking & dining area',
        iconName: 'CookingPot',
    },
    {
        id: 'living-room',
        label: 'Living Room',
        description: 'Main social space',
        iconName: 'Couch',
    },
    {
        id: 'bedroom',
        label: 'Bedroom',
        description: 'Sleep & relaxation',
        iconName: 'Bed',
    },
    {
        id: 'bathroom',
        label: 'Bathroom',
        description: 'Bath & vanity',
        iconName: 'Bathtub',
    },
    {
        id: 'office',
        label: 'Office',
        description: 'Work & study',
        iconName: 'DesktopTower',
    },
];

// ─── Transformation Modes ────────────────────────────────────────────────────

export const TRANSFORMATION_MODES: TransformationOption[] = [
    {
        id: 'complete',
        label: 'Complete Redesign',
        description: 'Transform everything — walls, floor, furniture, lighting',
        iconName: 'Sparkle',
    },
    {
        id: 'furniture-only',
        label: 'Furniture Only',
        description: 'Keep your room, replace all furniture with new pieces',
        iconName: 'Armchair',
    },
    {
        id: 'style-colors',
        label: 'Style & Colors',
        description: 'Same layout, new paint colors, lighting, and decor accents',
        iconName: 'PaintBrush',
    },
];

// ─── Room Styles ─────────────────────────────────────────────────────────────

export const ROOM_STYLES: RoomStyleOption[] = [
    {
        id: 'modern-minimalist',
        label: 'Modern Minimalist',
        description: 'Clean lines, neutral tones, less is more',
        colorAccent: 'oklch(0.70 0.02 240)',
        promptFragment: 'modern minimalist interior design, clean lines, neutral palette, uncluttered space',
    },
    {
        id: 'scandinavian',
        label: 'Scandinavian',
        description: 'Light wood, white walls, hygge warmth',
        colorAccent: 'oklch(0.85 0.04 90)',
        promptFragment: 'scandinavian interior design, light wood, white walls, cozy textiles, natural light',
    },
    {
        id: 'industrial',
        label: 'Industrial Loft',
        description: 'Exposed brick, metal accents, raw textures',
        colorAccent: 'oklch(0.45 0.05 50)',
        promptFragment: 'industrial loft interior, exposed brick walls, metal fixtures, raw concrete, vintage lighting',
    },
    {
        id: 'classic-elegant',
        label: 'Classic Elegant',
        description: 'Timeless luxury, rich fabrics, ornate details',
        colorAccent: 'oklch(0.40 0.08 30)',
        promptFragment: 'classic elegant interior, rich fabrics, ornate moldings, warm lighting, timeless luxury',
    },
    {
        id: 'japandi',
        label: 'Japandi',
        description: 'Japanese zen meets Scandinavian simplicity',
        colorAccent: 'oklch(0.65 0.03 140)',
        promptFragment: 'japandi interior design, zen minimalism, natural materials, wabi-sabi aesthetic, muted earth tones',
    },
    {
        id: 'mid-century',
        label: 'Mid-Century Modern',
        description: 'Retro shapes, bold accents, iconic furniture',
        colorAccent: 'oklch(0.55 0.15 50)',
        promptFragment: 'mid-century modern interior, retro furniture shapes, bold accent colors, teak wood, geometric patterns',
    },
    {
        id: 'bohemian',
        label: 'Bohemian',
        description: 'Eclectic layers, rich patterns, global influence',
        colorAccent: 'oklch(0.55 0.12 25)',
        promptFragment: 'bohemian interior design, eclectic textiles, layered patterns, plants, warm earthy colors',
    },
    {
        id: 'coastal',
        label: 'Coastal',
        description: 'Ocean-inspired, breezy whites and blues',
        colorAccent: 'oklch(0.65 0.10 230)',
        promptFragment: 'coastal interior design, ocean-inspired palette, white and blue tones, natural textures, airy and bright',
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getRoomTypeById(id: RoomType): RoomTypeOption | undefined {
    return ROOM_TYPES.find((r) => r.id === id);
}

export function getTransformationById(id: TransformationMode): TransformationOption | undefined {
    return TRANSFORMATION_MODES.find((t) => t.id === id);
}

export function getRoomStyleById(id: RoomDesignStyle): RoomStyleOption | undefined {
    return ROOM_STYLES.find((s) => s.id === id);
}
