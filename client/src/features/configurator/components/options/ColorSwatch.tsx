'use client';

import { cn } from '@/lib/utils';
import type { FurnitureOption } from '../../types/configurator.types';

interface ColorSwatchProps {
    option: FurnitureOption;
    isSelected: boolean;
    onSelect: (optionId: string) => void;
}

export function ColorSwatch({ option, isSelected, onSelect }: ColorSwatchProps): React.JSX.Element {
    return (
        <button
            type="button"
            onClick={() => onSelect(option.id)}
            aria-pressed={isSelected}
            aria-label={option.label}
            title={option.label}
            className={cn(
                'relative h-9 w-9 rounded-full border-2 transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
                'motion-safe:active:scale-[0.95]',
                isSelected
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-border hover:border-primary/50 hover:scale-110',
            )}
            style={{ backgroundColor: option.colorHex }}
        />
    );
}
