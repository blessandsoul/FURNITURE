'use client';

import { cn } from '@/lib/utils';
import type { PublicOptionValue } from '@/features/catalog/types/catalog.types';

interface OptionChipProps {
    value: PublicOptionValue;
    isSelected: boolean;
    onSelect: (valueId: string) => void;
}

export function OptionChip({ value, isSelected, onSelect }: OptionChipProps): React.JSX.Element {
    const hasModifier = value.priceModifier !== 0;
    const modifierLabel =
        hasModifier
            ? value.priceModifier > 0
                ? `+$${value.priceModifier}`
                : `-$${Math.abs(value.priceModifier)}`
            : null;

    return (
        <button
            type="button"
            onClick={() => onSelect(value.id)}
            aria-pressed={isSelected}
            className={cn(
                'relative inline-flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-sm font-medium',
                'border transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                'motion-safe:active:scale-[0.97]',
                isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-secondary text-secondary-foreground hover:border-primary/40 hover:bg-accent',
            )}
        >
            <span>{value.label}</span>
            {modifierLabel && (
                <span
                    className={cn(
                        'text-xs',
                        isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground',
                    )}
                >
                    {modifierLabel}
                </span>
            )}
        </button>
    );
}
