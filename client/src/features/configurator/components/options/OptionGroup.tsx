'use client';

import type { PublicOptionGroup } from '@/features/catalog/types/catalog.types';
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
    if (group.optionValues.length === 0) return null;

    const hasColorValues = group.optionValues.some((v) => v.colorHex !== null);
    const selectedLabel = group.optionValues.find((v) => v.id === selectedValueId)?.label;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                    {group.name}
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
