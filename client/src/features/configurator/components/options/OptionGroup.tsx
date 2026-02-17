'use client';

import { OPTION_CATEGORY_LABELS } from '../../data/furniture-catalog';
import type { FurnitureOption, OptionCategory } from '../../types/configurator.types';
import { ColorSwatch } from './ColorSwatch';
import { OptionChip } from './OptionChip';

interface OptionGroupProps {
    category: OptionCategory;
    options: FurnitureOption[];
    selectedOptionId: string | null;
    onSelect: (optionId: string) => void;
}

export function OptionGroup({
    category,
    options,
    selectedOptionId,
    onSelect,
}: OptionGroupProps): React.JSX.Element | null {
    if (options.length === 0) return null;

    const isColorGroup = category === 'color';

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                    {OPTION_CATEGORY_LABELS[category]}
                </span>
                {selectedOptionId && (
                    <span className="text-xs text-muted-foreground">
                        ({options.find((o) => o.id === selectedOptionId)?.label})
                    </span>
                )}
            </div>

            <div className={isColorGroup ? 'flex flex-wrap gap-2' : 'flex flex-wrap gap-2'}>
                {options.map((option) =>
                    isColorGroup ? (
                        <ColorSwatch
                            key={option.id}
                            option={option}
                            isSelected={selectedOptionId === option.id}
                            onSelect={onSelect}
                        />
                    ) : (
                        <OptionChip
                            key={option.id}
                            option={option}
                            isSelected={selectedOptionId === option.id}
                            onSelect={onSelect}
                        />
                    ),
                )}
            </div>
        </div>
    );
}
