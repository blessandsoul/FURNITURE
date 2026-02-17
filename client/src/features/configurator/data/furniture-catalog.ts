import type { FurnitureOption, FurniturePreset, FurnitureStyle, FurnitureStyleId } from '../types/configurator.types';

export const FURNITURE_STYLES: FurnitureStyle[] = [
    {
        id: 'sofa',
        label: 'Sofa',
        description: 'Comfortable living room seating',
        basePrice: 850,
        iconName: 'Couch',
        promptFragment: 'modern sofa',
        videoMotions: [
            { id: 'sofa-orbit', label: '360° Orbit', description: 'Slow full rotation around the sofa', videoPrompt: 'Camera orbits slowly 360 degrees around the sofa, smooth cinematic movement, studio lighting, white background, product showcase video' },
            { id: 'sofa-sit', label: 'Sit-down', description: 'A person sits and sinks into the cushions', videoPrompt: 'A person walks in and sits down on the sofa, cushions compress softly, warm lighting, realistic fabric physics, cozy atmosphere' },
            { id: 'sofa-zoom', label: 'Material Close-up', description: 'Camera zooms in on fabric texture', videoPrompt: 'Camera slowly zooms into the sofa fabric texture, revealing fine material details, macro lens effect, soft studio light, high-end product video' },
        ],
    },
    {
        id: 'armchair',
        label: 'Armchair',
        description: 'Elegant accent seating',
        basePrice: 420,
        iconName: 'Armchair',
        promptFragment: 'designer armchair',
        videoMotions: [
            { id: 'armchair-orbit', label: '360° Orbit', description: 'Full rotation around the armchair', videoPrompt: 'Camera orbits 360 degrees around the armchair, smooth cinematic movement, studio lighting, white background, premium product showcase' },
            { id: 'armchair-rock', label: 'Rocking', description: 'Armchair gently rocks back and forth', videoPrompt: 'The armchair gently rocks back and forth as if someone just stood up, natural motion, soft ambient lighting, calm atmosphere' },
            { id: 'armchair-detail', label: 'Armrest Detail', description: 'Camera traces the armrest craftsmanship', videoPrompt: 'Camera glides smoothly along the armrest, revealing wood grain and upholstery stitching detail, macro focus, warm studio light' },
        ],
    },
    {
        id: 'bed',
        label: 'Bed Frame',
        description: 'Bedroom centerpiece with presence',
        basePrice: 680,
        iconName: 'Bed',
        promptFragment: 'bed frame with headboard',
        videoMotions: [
            { id: 'bed-aerial', label: 'Aerial Reveal', description: 'Top-down camera descends to reveal the bed', videoPrompt: 'Camera descends from directly above, slowly revealing the bed with perfectly arranged linens, golden hour lighting, luxury hotel atmosphere' },
            { id: 'bed-orbit', label: '360° Orbit', description: 'Full rotation around the bed frame', videoPrompt: 'Camera orbits 360 degrees around the bed frame, smooth cinematic movement, bedroom setting, warm ambient lighting' },
            { id: 'bed-pillow', label: 'Pillow Drop', description: 'Pillows fall softly onto the bed', videoPrompt: 'Plush pillows fall in slow motion onto the bed, fabric ripples softly, warm bedroom lighting, dreamy slow-motion effect' },
        ],
    },
    {
        id: 'dining-table',
        label: 'Dining Table',
        description: 'Gather around in style',
        basePrice: 590,
        iconName: 'ForkKnife',
        promptFragment: 'dining table',
        videoMotions: [
            { id: 'dtable-orbit', label: '360° Orbit', description: 'Full rotation around the dining table', videoPrompt: 'Camera orbits 360 degrees around the dining table, smooth cinematic movement, elegant dining room lighting, product showcase' },
            { id: 'dtable-set', label: 'Table Setting', description: 'Dinnerware appears on the table', videoPrompt: 'Elegant dinnerware, glasses and a floral centerpiece appear on the dining table one by one, smooth transitions, warm candlelight ambiance' },
            { id: 'dtable-wood', label: 'Wood Grain', description: 'Camera sweeps across the table surface', videoPrompt: 'Camera glides smoothly across the dining table surface, revealing rich wood grain texture in detail, raking side light, premium material showcase' },
        ],
    },
    {
        id: 'coffee-table',
        label: 'Coffee Table',
        description: 'The living room anchor',
        basePrice: 280,
        iconName: 'Coffee',
        promptFragment: 'coffee table',
        videoMotions: [
            { id: 'ctable-orbit', label: '360° Orbit', description: 'Full rotation around the coffee table', videoPrompt: 'Camera orbits 360 degrees around the coffee table, smooth cinematic movement, living room setting, natural daylight' },
            { id: 'ctable-style', label: 'Styled Reveal', description: 'Books and a coffee cup appear on top', videoPrompt: 'A coffee cup, art books and a small plant appear on the coffee table, styled living room scene, warm afternoon light, cozy atmosphere' },
            { id: 'ctable-low', label: 'Low Angle', description: 'Camera sweeps at floor level around the table', videoPrompt: 'Camera glides at floor level in a wide arc around the coffee table, emphasizing the leg design and table height, cinematic low angle, soft lighting' },
        ],
    },
    {
        id: 'wardrobe',
        label: 'Wardrobe',
        description: 'Spacious and refined storage',
        basePrice: 920,
        iconName: 'Package',
        promptFragment: 'built-in wardrobe',
        videoMotions: [
            { id: 'wardrobe-open', label: 'Doors Open', description: 'Both doors swing open to reveal interior', videoPrompt: 'Wardrobe doors swing open smoothly revealing a beautifully organized interior with clothes and shelves, soft interior lighting, luxury bedroom setting' },
            { id: 'wardrobe-slide', label: 'Sliding Reveal', description: 'Sliding doors glide open with a whoosh', videoPrompt: 'Wardrobe sliding doors glide open smoothly with a subtle whoosh effect, modern interior, revealing neatly hung clothes, clean minimal lighting' },
            { id: 'wardrobe-orbit', label: '360° Orbit', description: 'Full rotation around the closed wardrobe', videoPrompt: 'Camera orbits 360 degrees around the wardrobe, smooth cinematic movement, bedroom setting, elegant lighting showing wood finish detail' },
        ],
    },
    {
        id: 'bookshelf',
        label: 'Bookshelf',
        description: 'Display books and objects beautifully',
        basePrice: 340,
        iconName: 'BookOpen',
        promptFragment: 'open bookshelf unit',
        videoMotions: [
            { id: 'shelf-fill', label: 'Books Fill In', description: 'Books and objects appear on each shelf', videoPrompt: 'Books, plants and decorative objects appear shelf by shelf on the bookshelf from bottom to top, smooth transitions, warm library lighting' },
            { id: 'shelf-pan', label: 'Vertical Pan', description: 'Camera pans slowly from bottom to top', videoPrompt: 'Camera pans slowly from the bottom shelf to the top, revealing books and decor on each level, shallow depth of field, warm ambient lighting' },
            { id: 'shelf-orbit', label: '360° Orbit', description: 'Full rotation around the bookshelf', videoPrompt: 'Camera orbits 360 degrees around the bookshelf filled with books and objects, smooth movement, living room natural light' },
        ],
    },
    {
        id: 'desk',
        label: 'Desk',
        description: 'A workspace that inspires',
        basePrice: 460,
        iconName: 'Monitor',
        promptFragment: 'minimalist writing desk',
        videoMotions: [
            { id: 'desk-setup', label: 'Workspace Setup', description: 'Monitor, lamp and accessories appear on desk', videoPrompt: 'A monitor, desk lamp, notebook and plant appear on the desk one by one, clean minimal workspace, morning light from window, productive atmosphere' },
            { id: 'desk-orbit', label: '360° Orbit', description: 'Full rotation around the desk', videoPrompt: 'Camera orbits 360 degrees around the desk, smooth cinematic movement, minimal home office setting, natural daylight' },
            { id: 'desk-surface', label: 'Surface Sweep', description: 'Camera glides across the desktop surface', videoPrompt: 'Camera glides smoothly across the desk surface from one end to the other, revealing wood grain and finish, shallow depth of field, macro detail' },
        ],
    },
];

const SHARED_COLORS: FurnitureOption[] = [
    { id: 'color-cream', category: 'color', label: 'Cream', priceModifier: 0, colorHex: '#F5F0E8', promptFragment: 'cream white' },
    { id: 'color-charcoal', category: 'color', label: 'Charcoal', priceModifier: 0, colorHex: '#36454F', promptFragment: 'charcoal gray' },
    { id: 'color-sand', category: 'color', label: 'Sand', priceModifier: 0, colorHex: '#C4A882', promptFragment: 'warm sand beige' },
    { id: 'color-forest', category: 'color', label: 'Forest', priceModifier: 10, colorHex: '#2D4A3E', promptFragment: 'deep forest green' },
    { id: 'color-rust', category: 'color', label: 'Rust', priceModifier: 10, colorHex: '#B7410E', promptFragment: 'burnt rust orange' },
    { id: 'color-navy', category: 'color', label: 'Navy', priceModifier: 10, colorHex: '#1B2A4A', promptFragment: 'deep navy blue' },
];

const UPHOLSTERY_OPTIONS: FurnitureOption[] = [
    { id: 'material-linen', category: 'material', label: 'Linen', priceModifier: 0, promptFragment: 'natural linen fabric' },
    { id: 'material-boucle', category: 'material', label: 'Boucle', priceModifier: 60, promptFragment: 'textured boucle fabric' },
    { id: 'material-velvet', category: 'material', label: 'Velvet', priceModifier: 80, promptFragment: 'rich velvet upholstery' },
    { id: 'material-leather', category: 'material', label: 'Leather', priceModifier: 200, promptFragment: 'full-grain leather' },
    { id: 'material-sherpa', category: 'material', label: 'Sherpa', priceModifier: 40, promptFragment: 'cozy sherpa fabric' },
];

const WOOD_MATERIALS: FurnitureOption[] = [
    { id: 'wood-oak', category: 'material', label: 'Oak', priceModifier: 0, promptFragment: 'natural oak wood' },
    { id: 'wood-walnut', category: 'material', label: 'Walnut', priceModifier: 80, promptFragment: 'dark walnut wood' },
    { id: 'wood-pine', category: 'material', label: 'Pine', priceModifier: -40, promptFragment: 'light pine wood' },
    { id: 'wood-marble', category: 'material', label: 'Marble Top', priceModifier: 200, promptFragment: 'white marble top' },
    { id: 'wood-glass', category: 'material', label: 'Glass Top', priceModifier: 120, promptFragment: 'tempered glass top' },
];

const SOFA_LEGS: FurnitureOption[] = [
    { id: 'legs-tapered-wood', category: 'leg_style', label: 'Tapered Wood', priceModifier: 0, promptFragment: 'tapered wooden legs' },
    { id: 'legs-metal-black', category: 'leg_style', label: 'Matte Black Metal', priceModifier: 30, promptFragment: 'matte black metal legs' },
    { id: 'legs-hairpin', category: 'leg_style', label: 'Hairpin', priceModifier: 50, promptFragment: 'slim hairpin legs' },
    { id: 'legs-cylinder', category: 'leg_style', label: 'Cylinder Wood', priceModifier: 20, promptFragment: 'cylindrical wooden legs' },
];

const TABLE_LEGS: FurnitureOption[] = [
    { id: 'tlegs-four-wood', category: 'leg_style', label: 'Four Wood Legs', priceModifier: 0, promptFragment: 'four tapered wooden legs' },
    { id: 'tlegs-hairpin', category: 'leg_style', label: 'Hairpin', priceModifier: 40, promptFragment: 'hairpin steel legs' },
    { id: 'tlegs-pedestal', category: 'leg_style', label: 'Pedestal', priceModifier: 60, promptFragment: 'central pedestal base' },
    { id: 'tlegs-x-frame', category: 'leg_style', label: 'X-Frame', priceModifier: 50, promptFragment: 'geometric X-frame base' },
];

const SOFA_SIZES: FurnitureOption[] = [
    { id: 'size-2seat', category: 'size', label: '2-Seater', priceModifier: -80, promptFragment: 'compact two-seat' },
    { id: 'size-3seat', category: 'size', label: '3-Seater', priceModifier: 0, promptFragment: 'three-seat' },
    { id: 'size-sectional', category: 'size', label: 'Sectional', priceModifier: 350, promptFragment: 'large L-shaped sectional' },
    { id: 'size-chaise', category: 'size', label: 'With Chaise', priceModifier: 180, promptFragment: 'sofa with chaise lounge' },
];

const BED_SIZES: FurnitureOption[] = [
    { id: 'size-queen', category: 'size', label: 'Queen', priceModifier: 0, promptFragment: 'queen size' },
    { id: 'size-king', category: 'size', label: 'King', priceModifier: 120, promptFragment: 'king size' },
    { id: 'size-twin', category: 'size', label: 'Twin', priceModifier: -100, promptFragment: 'twin size' },
    { id: 'size-california-king', category: 'size', label: 'California King', priceModifier: 180, promptFragment: 'California king size' },
];

const TABLE_SIZES: FurnitureOption[] = [
    { id: 'size-small', category: 'size', label: 'Small (2-4 seats)', priceModifier: -60, promptFragment: 'small dining table for two' },
    { id: 'size-medium', category: 'size', label: 'Medium (4-6 seats)', priceModifier: 0, promptFragment: 'medium dining table for six' },
    { id: 'size-large', category: 'size', label: 'Large (6-8 seats)', priceModifier: 120, promptFragment: 'large dining table for eight' },
];

const STANDARD_SIZE: FurnitureOption[] = [
    { id: 'size-standard', category: 'size', label: 'Standard', priceModifier: 0, promptFragment: 'standard size' },
    { id: 'size-large-std', category: 'size', label: 'Large', priceModifier: 100, promptFragment: 'large oversized' },
    { id: 'size-compact', category: 'size', label: 'Compact', priceModifier: -60, promptFragment: 'compact size' },
];

export const FURNITURE_OPTIONS: Record<FurnitureStyleId, FurnitureOption[]> = {
    sofa: [...SHARED_COLORS, ...UPHOLSTERY_OPTIONS, ...SOFA_LEGS, ...SOFA_SIZES],
    armchair: [...SHARED_COLORS, ...UPHOLSTERY_OPTIONS, ...SOFA_LEGS, ...STANDARD_SIZE],
    bed: [...SHARED_COLORS, ...UPHOLSTERY_OPTIONS, ...BED_SIZES],
    'dining-table': [...SHARED_COLORS, ...WOOD_MATERIALS, ...TABLE_LEGS, ...TABLE_SIZES],
    'coffee-table': [...SHARED_COLORS, ...WOOD_MATERIALS, ...TABLE_LEGS, ...STANDARD_SIZE],
    wardrobe: [...SHARED_COLORS, ...WOOD_MATERIALS, ...STANDARD_SIZE],
    bookshelf: [...SHARED_COLORS, ...WOOD_MATERIALS, ...STANDARD_SIZE],
    desk: [...SHARED_COLORS, ...WOOD_MATERIALS, ...TABLE_LEGS, ...STANDARD_SIZE],
};

export function getStyleById(id: FurnitureStyleId): FurnitureStyle | undefined {
    return FURNITURE_STYLES.find((s) => s.id === id);
}

export function getOptionsByStyle(styleId: FurnitureStyleId): FurnitureOption[] {
    return FURNITURE_OPTIONS[styleId] ?? [];
}

export function getOptionById(styleId: FurnitureStyleId, optionId: string): FurnitureOption | undefined {
    return FURNITURE_OPTIONS[styleId]?.find((o) => o.id === optionId);
}

export function getOptionsByCategory(
    styleId: FurnitureStyleId,
    category: FurnitureOption['category'],
): FurnitureOption[] {
    return (FURNITURE_OPTIONS[styleId] ?? []).filter((o) => o.category === category);
}

export const OPTION_CATEGORY_LABELS: Record<FurnitureOption['category'], string> = {
    color: 'Color',
    material: 'Material',
    leg_style: 'Leg Style',
    size: 'Size',
    upholstery: 'Upholstery',
};

export const FURNITURE_PRESETS: FurniturePreset[] = [
    {
        id: 'preset-scandi-sofa',
        label: 'Scandinavian Cloud',
        description: 'Cream linen, tapered wood legs, 3-seater',
        styleId: 'sofa',
        options: { color: 'color-cream', material: 'material-linen', leg_style: 'legs-tapered-wood', size: 'size-3seat', upholstery: null },
    },
    {
        id: 'preset-navy-velvet-sofa',
        label: 'Midnight Velvet',
        description: 'Navy velvet with hairpin legs, sectional',
        styleId: 'sofa',
        options: { color: 'color-navy', material: 'material-velvet', leg_style: 'legs-hairpin', size: 'size-sectional', upholstery: null },
    },
    {
        id: 'preset-industrial-desk',
        label: 'Industrial Studio',
        description: 'Walnut desk with X-frame steel legs',
        styleId: 'desk',
        options: { color: 'color-charcoal', material: 'wood-walnut', leg_style: 'tlegs-x-frame', size: 'size-standard', upholstery: null },
    },
    {
        id: 'preset-marble-dining',
        label: 'Marble Elegance',
        description: 'White marble top dining table, pedestal base',
        styleId: 'dining-table',
        options: { color: 'color-cream', material: 'wood-marble', leg_style: 'tlegs-pedestal', size: 'size-medium', upholstery: null },
    },
    {
        id: 'preset-cozy-armchair',
        label: 'Cozy Reading Nook',
        description: 'Forest boucle armchair with cylinder legs',
        styleId: 'armchair',
        options: { color: 'color-forest', material: 'material-boucle', leg_style: 'legs-cylinder', size: 'size-standard', upholstery: null },
    },
    {
        id: 'preset-minimal-bookshelf',
        label: 'Minimal Oak Shelf',
        description: 'Natural oak bookshelf, compact size',
        styleId: 'bookshelf',
        options: { color: 'color-cream', material: 'wood-oak', leg_style: null, size: 'size-compact', upholstery: null },
    },
    {
        id: 'preset-luxury-bed',
        label: 'Luxury Suite',
        description: 'Charcoal leather king bed frame',
        styleId: 'bed',
        options: { color: 'color-charcoal', material: 'material-leather', leg_style: null, size: 'size-king', upholstery: null },
    },
    {
        id: 'preset-glass-coffee',
        label: 'Glass Loft',
        description: 'Glass top coffee table with hairpin legs',
        styleId: 'coffee-table',
        options: { color: 'color-charcoal', material: 'wood-glass', leg_style: 'tlegs-hairpin', size: 'size-standard', upholstery: null },
    },
    {
        id: 'preset-sand-sherpa-sofa',
        label: 'Desert Oasis',
        description: 'Sand sherpa sofa with metal legs, chaise',
        styleId: 'sofa',
        options: { color: 'color-sand', material: 'material-sherpa', leg_style: 'legs-metal-black', size: 'size-chaise', upholstery: null },
    },
    {
        id: 'preset-rust-armchair',
        label: 'Burnt Terracotta',
        description: 'Rust velvet armchair with tapered wood legs',
        styleId: 'armchair',
        options: { color: 'color-rust', material: 'material-velvet', leg_style: 'legs-tapered-wood', size: 'size-standard', upholstery: null },
    },
    {
        id: 'preset-walnut-wardrobe',
        label: 'Walnut Haven',
        description: 'Dark walnut wardrobe, large size',
        styleId: 'wardrobe',
        options: { color: 'color-charcoal', material: 'wood-walnut', leg_style: null, size: 'size-large-std', upholstery: null },
    },
    {
        id: 'preset-pine-desk',
        label: 'Nordic Workspace',
        description: 'Light pine desk with four wood legs, compact',
        styleId: 'desk',
        options: { color: 'color-cream', material: 'wood-pine', leg_style: 'tlegs-four-wood', size: 'size-compact', upholstery: null },
    },
];
