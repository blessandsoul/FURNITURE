'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import type { PublicOptionValue } from '@/features/catalog/types/catalog.types';
import { getTranslatedField } from '@/features/catalog/utils/getTranslatedField';

interface ColorSwatchProps {
    value: PublicOptionValue;
    isSelected: boolean;
    onSelect: (valueId: string) => void;
}

export function ColorSwatch({ value, isSelected, onSelect }: ColorSwatchProps): React.JSX.Element {
    const locale = useLocale();

    return (
        <button
            type="button"
            onClick={() => onSelect(value.id)}
            aria-pressed={isSelected}
            aria-label={getTranslatedField(value, 'label', locale)}
            title={getTranslatedField(value, 'label', locale)}
            className={cn(
                'relative h-9 w-9 rounded-full border-2 transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
                'motion-safe:active:scale-[0.95]',
                isSelected
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-border hover:border-primary/50 hover:scale-110',
            )}
            style={{ backgroundColor: value.colorHex ?? undefined }}
        />
    );
}
