'use client';

import { useLocale } from 'next-intl';
import type { PublicOptionGroup } from '@/features/catalog/types/catalog.types';
import { getTranslatedField } from '@/features/catalog/utils/getTranslatedField';
import { ColorSwatch } from './ColorSwatch';
import { OptionChip } from './OptionChip';

interface OptionGroupProps {
    group: PublicOptionGroup;
    selectedValueId: string | null;
    onSelect: (valueId: string) => void;
}

export function OptionGroup({
    group,
    selectedValueId,
    onSelect,
}: OptionGroupProps): React.JSX.Element | null {
    const locale = useLocale();

    if (group.optionValues.length === 0) return null;

    const hasColorValues = group.optionValues.some((v) => v.colorHex !== null);
    const selectedValue = group.optionValues.find((v) => v.id === selectedValueId);
    const selectedLabel = selectedValue ? getTranslatedField(selectedValue, 'label', locale) : undefined;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                    {getTranslatedField(group, 'name', locale)}
                </span>
                {group.isRequired && (
                    <span className="text-xs text-muted-foreground">(Required)</span>
                )}
                {selectedLabel && (
                    <span className="text-xs text-muted-foreground">
                        ({selectedLabel})
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {group.optionValues.map((value) =>
                    hasColorValues && value.colorHex ? (
                        <ColorSwatch
                            key={value.id}
                            value={value}
                            isSelected={selectedValueId === value.id}
                            onSelect={onSelect}
                        />
                    ) : (
                        <OptionChip
                            key={value.id}
                            value={value}
                            isSelected={selectedValueId === value.id}
                            onSelect={onSelect}
                        />
                    ),
                )}
            </div>
        </div>
    );
}
