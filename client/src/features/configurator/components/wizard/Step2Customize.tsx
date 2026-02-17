'use client';

import { getOptionsByCategory } from '../../data/furniture-catalog';
import { useConfigurator } from '../../hooks/useConfigurator';
import type { OptionCategory } from '../../types/configurator.types';
import { OptionGroup } from '../options/OptionGroup';
import { PricePanel } from '../pricing/PricePanel';

const CATEGORIES: OptionCategory[] = ['color', 'material', 'leg_style', 'size', 'upholstery'];

export function Step2Customize(): React.JSX.Element {
    const { state, selectedStyle, setOption } = useConfigurator();
    const { style: styleId, options: selectedOptions } = state.selections;

    if (!styleId || !selectedStyle) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Please select a furniture style first.
            </div>
        );
    }

    const availableCategories = CATEGORIES.filter(
        (cat) => getOptionsByCategory(styleId, cat).length > 0,
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">
                    Customize your {selectedStyle.label}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Each selection shapes your final design and price
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div className="space-y-6">
                    {availableCategories.map((category) => (
                        <OptionGroup
                            key={category}
                            category={category}
                            options={getOptionsByCategory(styleId, category)}
                            selectedOptionId={selectedOptions[category]}
                            onSelect={(optionId) => setOption(category, optionId)}
                        />
                    ))}
                </div>

                <div className="lg:sticky lg:top-6 lg:self-start">
                    <PricePanel />
                </div>
            </div>
        </div>
    );
}
