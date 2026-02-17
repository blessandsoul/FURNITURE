'use client';

import { cn } from '@/lib/utils';

export type VideoPromptStyle = 'luxury' | 'lifestyle' | 'commercial';

interface VideoStyleOption {
    id: VideoPromptStyle;
    label: string;
    description: string;
    icon: string;
}

const VIDEO_STYLES: VideoStyleOption[] = [
    {
        id: 'luxury',
        label: 'Luxury',
        description: 'Cinematic light, marble, editorial look',
        icon: '✦',
    },
    {
        id: 'lifestyle',
        label: 'Lifestyle',
        description: 'Warm home, cozy atmosphere, inviting',
        icon: '⌂',
    },
    {
        id: 'commercial',
        label: 'Commercial',
        description: 'Clean studio, sharp detail, e-commerce',
        icon: '◻',
    },
];

export const VIDEO_STYLE_PROMPTS: Record<VideoPromptStyle, string> = {
    luxury:
        'Use the attached photo as a reference for the exact furniture piece — preserve its shape, color, material, and design precisely. Animate it in a high-end interior setting: soft diffused natural light from floor-to-ceiling windows, warm golden hour tones, marble floors, lush greenery in the background. Ultra-realistic material detail — wood grain, fabric texture clearly visible. Cinematic camera movement, shallow depth of field, bokeh background. Styled like an Architectural Digest editorial shoot. Aspirational and timeless.',
    lifestyle:
        'Use the attached photo as a reference — keep the furniture exact shape, color, and material unchanged. Animate it naturally in a warm cozy living room: morning light streaming through sheer curtains, a coffee cup nearby, soft throw blanket casually draped, indoor plants, real home atmosphere — not staged. Warm color palette: beige, cream, terracotta. Gentle camera drift, 35mm lens feel. The scene should make the viewer instantly want this piece in their own home.',
    commercial:
        'Use the attached photo as a strict reference — the furniture shape, color, proportions, and materials must remain exactly as shown. Animate it on a pure white seamless background with even studio lighting, no harsh shadows. Crisp sharp detail on all surfaces — wood grain, fabric weave, metal hardware. Slow 360° rotation or smooth push-in camera move. Clean edges, minimalist composition. E-commerce product video quality, IKEA catalog style. Trust-building and conversion-ready.',
};

interface VideoStylePickerProps {
    selected: VideoPromptStyle;
    onSelect: (style: VideoPromptStyle) => void;
    disabled?: boolean;
}

export function VideoStylePicker({
    selected,
    onSelect,
    disabled = false,
}: VideoStylePickerProps): React.JSX.Element {
    return (
        <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground">Scene Style</span>
            <div className="grid grid-cols-3 gap-1.5">
                {VIDEO_STYLES.map((style) => {
                    const isSelected = selected === style.id;
                    return (
                        <button
                            key={style.id}
                            type="button"
                            onClick={() => !disabled && onSelect(style.id)}
                            disabled={disabled}
                            aria-pressed={isSelected}
                            className={cn(
                                'flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left',
                                'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                                'disabled:cursor-not-allowed disabled:opacity-50',
                                isSelected
                                    ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)_/_0.3)]'
                                    : 'border-[--border-crisp] bg-[--surface-enamel] hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[--shadow-enamel-hover]',
                            )}
                        >
                            <span
                                className={cn(
                                    'text-base leading-none',
                                    isSelected ? 'text-primary' : 'text-muted-foreground',
                                )}
                            >
                                {style.icon}
                            </span>
                            <span
                                className={cn(
                                    'text-xs font-semibold',
                                    isSelected ? 'text-primary' : 'text-foreground',
                                )}
                            >
                                {style.label}
                            </span>
                            <p className="text-[10px] leading-relaxed text-muted-foreground line-clamp-2">
                                {style.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
