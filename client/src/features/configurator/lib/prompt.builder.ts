import type { FurnitureOption, FurnitureStyle } from '../types/configurator.types';

export function buildFurniturePrompt(style: FurnitureStyle, selectedOptions: FurnitureOption[]): string {
    const fragments = selectedOptions.map((opt) => opt.promptFragment).join(', ');

    const base = fragments ? `A ${fragments} ${style.promptFragment}` : `A ${style.promptFragment}`;

    return [
        base,
        'photorealistic product photography',
        'studio lighting with soft shadows',
        'pure white background',
        'high-end furniture catalog style',
        '8k resolution, sharp details',
    ].join(', ');
}
