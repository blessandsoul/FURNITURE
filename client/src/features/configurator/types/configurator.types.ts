export type FurnitureStyleId =
    | 'sofa'
    | 'bed'
    | 'dining-table'
    | 'coffee-table'
    | 'wardrobe'
    | 'bookshelf'
    | 'armchair'
    | 'desk';

export type OptionCategory = 'color' | 'material' | 'leg_style' | 'size' | 'upholstery';

export type ConfiguratorStep = 1 | 2 | 3 | 4;

export interface VideoMotion {
    id: string;
    label: string;           // UI: "Open doors"
    description: string;     // UI tooltip: "Both doors swing open smoothly"
    videoPrompt: string;     // Full video generation prompt
}

export interface FurnitureStyle {
    id: FurnitureStyleId;
    label: string;
    description: string;
    basePrice: number;
    iconName: string;
    promptFragment: string;
    videoMotions: VideoMotion[];
}

export interface VideoGenerationRequest {
    imageUrl: string;
    videoPrompt: string;
    styleId: FurnitureStyleId;
}

export interface VideoGenerationResponse {
    videoUrl: string;
    motionLabel: string;
}

export interface FurnitureOption {
    id: string;
    category: OptionCategory;
    label: string;
    priceModifier: number;
    colorHex?: string;
    promptFragment: string;
}

export interface ConfiguratorSelections {
    style: FurnitureStyleId | null;
    options: Record<OptionCategory, string | null>;
}

export interface PriceLineItem {
    label: string;
    amount: number;
    isBase: boolean;
}

export interface PriceBreakdown {
    lineItems: PriceLineItem[];
    total: number;
}

export interface ConfiguratorState {
    mode: ConfiguratorMode;
    selections: ConfiguratorSelections;
    generatedImageUrls: string[];
    roomRedesign: RoomRedesignState;
}

export type ConfiguratorAction =
    | { type: 'SET_MODE'; payload: ConfiguratorMode }
    | { type: 'SET_STYLE'; payload: FurnitureStyleId }
    | { type: 'SET_OPTION'; payload: { category: OptionCategory; optionId: string } }
    | { type: 'CLEAR_OPTION'; payload: { category: OptionCategory } }
    | { type: 'SET_IMAGE_URLS'; payload: string[] }
    | { type: 'LOAD_DESIGN'; payload: { selections: ConfiguratorSelections; imageUrls?: string[] } }
    | { type: 'HYDRATE_SESSION'; payload: ConfiguratorState }
    | { type: 'SET_ROOM_IMAGE'; payload: string }
    | { type: 'SET_ROOM_TYPE'; payload: RoomType }
    | { type: 'SET_TRANSFORMATION_MODE'; payload: TransformationMode }
    | { type: 'SET_ROOM_STYLE'; payload: RoomDesignStyle }
    | { type: 'SET_ROOM_RESULT'; payload: string }
    | { type: 'RESET_ROOM_REDESIGN' }
    | { type: 'RESET' };

export interface FurniturePreset {
    id: string;
    label: string;
    description: string;
    styleId: FurnitureStyleId;
    options: Record<OptionCategory, string | null>;
}

export interface ImageGenerationRequest {
    prompt: string;
    styleId?: string;
}

export interface ImageGenerationResponse {
    imageUrls: string[];     // 6 variations
    revisedPrompt?: string;
}

// ─── Room Reimagine Types ────────────────────────────────────────────────────

export type ConfiguratorMode = 'scratch' | 'reimagine';

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
    roomType: RoomType | null;
    transformationMode: TransformationMode | null;
    roomStyle: RoomDesignStyle | null;
    resultImageUrl: string | null;
}

export interface RoomRedesignRequest {
    roomImage: string;
    roomType: RoomType;
    transformationMode: TransformationMode;
    roomStyle: RoomDesignStyle;
}

export interface RoomRedesignResponse {
    resultImageUrl: string;
    appliedStyle: string;
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
