// ─── Configurator Core Types ─────────────────────────────────────────────────
// Dynamic, catalog-driven configurator state. All furniture data comes from
// the server catalog API — no hardcoded style IDs or option categories.

export type ConfiguratorStep = 1 | 2 | 3 | 4;

export type ConfiguratorMode = 'scratch' | 'reimagine';

// ─── Price Types (used by PricePanel / PriceBreakdownCard) ──────────────────

export interface PriceLineItem {
    label: string;
    amount: number;
    isBase: boolean;
}

export interface PriceBreakdown {
    lineItems: PriceLineItem[];
    total: number;
    currency: string;
}

// ─── Configurator State ─────────────────────────────────────────────────────

export interface ConfiguratorState {
    mode: ConfiguratorMode;
    selectedCategoryId: string | null;
    selectedCategorySlug: string | null;
    selectedOptionValueIds: string[];
    generatedImageUrls: string[];
    savedDesignId: string | null;
    generationId: string | null;
    roomRedesign: RoomRedesignState;
}

// ─── Configurator Actions ───────────────────────────────────────────────────

export type ConfiguratorAction =
    | { type: 'SET_MODE'; payload: ConfiguratorMode }
    | { type: 'SET_CATEGORY'; payload: { id: string; slug: string } }
    | { type: 'TOGGLE_OPTION_VALUE'; payload: { groupId: string; valueId: string; isRequired: boolean; groupValueIds: string[] } }
    | { type: 'ADD_GENERATED_IMAGE'; payload: string }
    | { type: 'SET_GENERATED_IMAGES'; payload: string[] }
    | { type: 'SET_SAVED_DESIGN'; payload: string }
    | { type: 'SET_GENERATION_ID'; payload: string }
    | { type: 'HYDRATE_SESSION'; payload: ConfiguratorState }
    | { type: 'SET_ROOM_IMAGE'; payload: { roomImageUrl: string; thumbnailUrl: string } }
    | { type: 'SET_PLACEMENT_INSTRUCTIONS'; payload: string }
    | { type: 'SET_ROOM_TYPE'; payload: RoomType }
    | { type: 'SET_TRANSFORMATION_MODE'; payload: TransformationMode }
    | { type: 'SET_ROOM_STYLE'; payload: RoomDesignStyle }
    | { type: 'SET_ROOM_RESULT'; payload: string }
    | { type: 'RESET_ROOM_REDESIGN' }
    | { type: 'RESET' };

// ─── Video Types (kept for Step 4 — "Coming Soon" placeholder) ──────────────

export interface VideoMotion {
    id: string;
    label: string;
    description: string;
    videoPrompt: string;
}

export interface VideoGenerationRequest {
    imageUrl: string;
    videoPrompt: string;
    styleId: string;
}

export interface VideoGenerationResponse {
    videoUrl: string;
    motionLabel: string;
}

// ─── Room Reimagine Types (kept — "Coming Soon" placeholder) ────────────────

export type RoomType = 'kitchen' | 'living-room' | 'bedroom' | 'bathroom' | 'office';

export type TransformationMode = 'complete' | 'furniture-only' | 'style-colors';

export type RoomDesignStyle =
    | 'modern-minimalist'
    | 'scandinavian'
    | 'industrial'
    | 'classic-elegant'
    | 'japandi'
    | 'mid-century'
    | 'bohemian'
    | 'coastal';

export interface RoomRedesignState {
    roomImageUrl: string | null;
    roomThumbnailUrl: string | null;
    placementInstructions: string;
    roomType: RoomType | null;
    transformationMode: TransformationMode | null;
    roomStyle: RoomDesignStyle | null;
    resultImageUrl: string | null;
}

export interface RoomTypeOption {
    id: RoomType;
    label: string;
    description: string;
    iconName: string;
}

export interface TransformationOption {
    id: TransformationMode;
    label: string;
    description: string;
    iconName: string;
}

export interface RoomStyleOption {
    id: RoomDesignStyle;
    label: string;
    description: string;
    colorAccent: string;
    promptFragment: string;
}
